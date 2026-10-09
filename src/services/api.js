// Central REST API Service Layer connecting Paisa in Minutes frontend to the production backend.
// Confirmed production backend (same backend used by the website/CRM): https://api.paisainminutes.tech

import { secureStorage } from './secureStorage';

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://api.paisainminutes.tech/api';

const TOKEN_KEY = 'paisainminute_jwt_token';
const REFRESH_KEY = 'paisainminute_refresh_token';

// Auth tokens live in Capacitor's secure Preferences store, never in plain
// WebView localStorage — see src/services/secureStorage.js.
export const getToken = () => secureStorage.get(TOKEN_KEY);
export const getRefreshToken = () => secureStorage.get(REFRESH_KEY);
const setToken = (token) => secureStorage.set(TOKEN_KEY, token);
const setRefreshTokenValue = (token) => secureStorage.set(REFRESH_KEY, token);
const clearTokens = () => Promise.all([secureStorage.remove(TOKEN_KEY), secureStorage.remove(REFRESH_KEY)]);

export const hasSession = async () => !!(await getToken());

// Real, backend-confirmed tracked partner redirect — GET {API_BASE_URL}/public/redirect/:slug,
// the same endpoint the website's loan-offers.php uses. The backend resolves the actual
// partner URL server-side (an unknown/invalid slug 404s there, never an invented URL here).
// `leadCode` must be a real leadCode/displayId returned by submitLoanApplication — never a
// client-generated id — and the phone number must never appear in this URL.
export const buildPartnerRedirectUrl = (slug, leadCode, source = 'android_app') =>
  `${API_BASE_URL}/public/redirect/${encodeURIComponent(slug)}?lead_id=${encodeURIComponent(leadCode)}&source=${encodeURIComponent(source)}`;

// Helper to retrieve auth headers with JWT Bearer token. Async because the token
// read is async (secure storage).
export const getAuthHeaders = async () => {
  const token = await getToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
};

// Active Pre-warming & Keep-Alive to eliminate Render free tier cold-start delays
let lastWarmTime = 0;
export const warmBackend = () => {
  const now = Date.now();
  if (now - lastWarmTime < 30000) return; // limit to once every 30s
  lastWarmTime = now;
  fetch(`${API_BASE_URL}/health`, { method: 'GET', cache: 'no-store' })
    .then(r => r.json())
    .catch(() => {});
};

/** One retry of `fn` after a silent token refresh, only on a 401. Used by every
 * authenticated call below so an expired access token recovers transparently
 * instead of surfacing as a confusing empty/failed screen. */
async function withAuthRetry(fn) {
  let res = await fn();
  if (res.status === 401) {
    const refreshed = await api.refreshToken();
    if (refreshed && refreshed.token) {
      res = await fn();
    }
  }
  return res;
}

export const api = {
  // 1. Health Check
  checkHealth: async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/health`, { cache: 'no-store' });
      return await res.json();
    } catch (err) {
      console.warn('Backend health check error:', err);
      return { ok: false };
    }
  },

  // 2. Auth: Send OTP (Calls secure live SMS gateway via server)
  sendOtp: async (phone) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 14000); // 14s fail-safe timeout
    try {
      const cleanPhone = String(phone).replace(/\D/g, '').slice(-10);
      const res = await fetch(`${API_BASE_URL}/auth/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: cleanPhone }),
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      const data = await res.json();
      if (!res.ok) {
        return {
          ok: false,
          status: res.status,
          error: data.error || (data.errors && data.errors[0]?.msg) || 'Failed to send OTP. Please try again.'
        };
      }
      return { ok: true, ...data };
    } catch (err) {
      clearTimeout(timeoutId);
      console.error('Send OTP Network Error:', err);
      if (err.name === 'AbortError') {
        return {
          ok: false,
          error: 'SMS request timed out. Please check your network and try again.'
        };
      }
      return {
        ok: false,
        error: 'Unable to connect to SMS server. Please check your internet connection.'
      };
    }
  },

  // 3. Auth: Verify OTP (Validates the 6-digit code and receives JWT access + refresh tokens)
  verifyOtp: async (phone, code) => {
    try {
      const cleanPhone = String(phone).replace(/\D/g, '').slice(-10);
      const cleanCode = String(code).trim();

      const res = await fetch(`${API_BASE_URL}/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: cleanPhone, code: cleanCode })
      });

      const data = await res.json();
      if (!res.ok) {
        let errorMessage = 'Invalid OTP code. Please check your SMS and try again.';
        if (data.error === 'expired') errorMessage = 'OTP has expired. Please request a new OTP.';
        if (data.error === 'already used') errorMessage = 'This OTP has already been used. Please request a new OTP.';
        return {
          ok: false,
          status: res.status,
          error: errorMessage,
          rawError: data.error
        };
      }

      // Store tokens in secure (non-WebView-localStorage) storage.
      if (data.token) await setToken(data.token);
      if (data.refreshToken) await setRefreshTokenValue(data.refreshToken);

      return { ok: true, ...data };
    } catch (err) {
      console.error('Verify OTP Network Error:', err);
      return {
        ok: false,
        error: 'Unable to verify OTP with server. Please try again.'
      };
    }
  },

  // 4. Auth: Refresh Token — rotates the refresh token and issues a new access token.
  // A failed/revoked refresh token (401/404) means the session is truly over: tokens
  // are cleared so the app falls back to a clean logged-out state rather than
  // retrying forever with a dead token.
  refreshToken: async () => {
    try {
      const refreshTokenValue = await getRefreshToken();
      if (!refreshTokenValue) return null;

      const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: refreshTokenValue })
      });

      if (!res.ok) {
        if (res.status === 401 || res.status === 404) await clearTokens();
        return null;
      }
      const data = await res.json();
      if (data.token) await setToken(data.token);
      if (data.refreshToken) await setRefreshTokenValue(data.refreshToken);
      return data;
    } catch (err) {
      return null;
    }
  },

  // 4b. Auth: Logout — revokes the refresh token server-side, then always clears
  // local tokens regardless of the server response (so a flaky network never
  // traps the user in a logged-in-looking state on their own device).
  logout: async ({ allDevices = false } = {}) => {
    try {
      const refreshTokenValue = await getRefreshToken();
      const headers = await getAuthHeaders();
      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        headers,
        body: JSON.stringify(allDevices ? { all: true } : { refreshToken: refreshTokenValue })
      });
    } catch (err) {
      console.warn('Logout API call failed (clearing local session anyway):', err);
    } finally {
      await clearTokens();
    }
  },

  // 5. User Profile: Get Current Profile. Returns the backend's real shape
  // ({ user: {...} }) or null — callers must read res.user, not res directly.
  getProfile: async () => {
    try {
      const doFetch = async () => fetch(`${API_BASE_URL}/users/me`, { headers: await getAuthHeaders() });
      const res = await withAuthRetry(doFetch);
      if (!res.ok) return null;
      const data = await res.json();
      return data.user || null;
    } catch (err) {
      console.warn('Fetch profile error:', err);
      return null;
    }
  },

  // 6. User Profile: Update Profile (Name, Email, PAN, city, state, pincode)
  updateProfile: async (profileData) => {
    try {
      const doFetch = async () => fetch(`${API_BASE_URL}/users/me`, {
        method: 'PATCH',
        headers: await getAuthHeaders(),
        body: JSON.stringify(profileData)
      });
      const res = await withAuthRetry(doFetch);
      const data = await res.json();
      if (!res.ok) {
        return { ok: false, error: data.error || 'Unable to update your profile. Please try again.' };
      }
      return { ok: true, user: data.user };
    } catch (err) {
      console.warn('Update profile error:', err);
      return { ok: false, error: 'Unable to reach the server. Please check your connection and try again.' };
    }
  },

  // 6b. Account Deletion — matches the confirmed backend's DELETE /api/users/me.
  // Requires a fresh OTP code (the caller must call api.sendOtp first) as
  // reauthentication for this sensitive action. Never report success unless the
  // backend actually confirms deletion; always clear local tokens afterward
  // regardless, since the server has already revoked them.
  deleteAccount: async (code) => {
    try {
      const doFetch = async () => fetch(`${API_BASE_URL}/users/me`, {
        method: 'DELETE',
        headers: await getAuthHeaders(),
        body: JSON.stringify({ code })
      });
      const res = await withAuthRetry(doFetch);
      const data = await res.json();
      if (!res.ok) {
        return { ok: false, status: res.status, error: data.error || 'Unable to delete your account right now. Please try again.' };
      }
      await clearTokens();
      return { ok: true, deletedAt: data.deletedAt };
    } catch (err) {
      console.warn('Delete account error:', err);
      return { ok: false, error: 'Unable to reach the server. Please check your connection and try again.' };
    }
  },

  // 9. Loans: Submit Application — the single real entry point for creating/updating
  // a loan application, matching paisa/server's POST /api/loan-applications/ (the
  // same `submitLead()` the website's own lead intake uses). The backend forces
  // `phone` to the authenticated user's own verified number and de-duplicates
  // repeat submissions for the same phone server-side, so retrying this call is
  // always safe — it is never guaranteed to create a second application.
  submitLoanApplication: async (payload) => {
    try {
      const doFetch = async () => fetch(`${API_BASE_URL}/loan-applications/`, {
        method: 'POST',
        headers: await getAuthHeaders(),
        body: JSON.stringify(payload)
      });
      const res = await withAuthRetry(doFetch);
      const data = await res.json();
      if (!res.ok) {
        return { ok: false, status: res.status, error: data.error || 'Unable to submit your application. Please try again.' };
      }
      return { ok: true, application: data.application };
    } catch (err) {
      console.warn('Submit loan application error:', err);
      return { ok: false, error: 'Unable to reach the application server. Please check your connection and try again.' };
    }
  },

  // 9b. Support: Submit a call-back / contact request to the same public contact
  // pipeline the website uses (POST /api/public/contact). Never report success unless
  // the backend actually accepted it.
  submitCallbackRequest: async ({ name, phone, message }) => {
    try {
      const res = await fetch(`${API_BASE_URL}/public/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name || 'App User',
          phone,
          message: message || 'Call-back requested from Android app support chat.',
          subject: 'Call-back request (Android app)',
          agree_consent: true
        })
      });
      const data = await res.json();
      if (!res.ok) {
        return { ok: false, error: data.error || 'Unable to submit your request right now. Please try again.' };
      }
      return { ok: true, ...data };
    } catch (err) {
      console.warn('Submit callback request error:', err);
      return { ok: false, error: 'Unable to reach the support service. Please check your connection and try again.' };
    }
  },

  // 10. Loans: Get My Applications (own applications only — backend scopes this to
  // the authenticated user, see GET /api/loan-applications/my).
  // Returns a result object (not a bare array) so the caller can tell a genuinely
  // empty history apart from a failed fetch or an expired session — all three need
  // different UI, and collapsing them into "[]" would hide a failure as "no applications".
  getMyLoans: async () => {
    try {
      const doFetch = async () => fetch(`${API_BASE_URL}/loan-applications/my`, { headers: await getAuthHeaders() });
      const res = await withAuthRetry(doFetch);
      if (!res.ok) {
        if (res.status === 401) return { ok: false, reason: 'session_expired', error: 'Your session has expired. Please log in again.' };
        return { ok: false, reason: 'server_error', error: 'Unable to load your applications right now. Please try again.' };
      }
      const data = await res.json();
      return { ok: true, applications: data.applications || [] };
    } catch (err) {
      console.warn('Get my loans API error:', err);
      return { ok: false, reason: 'network_error', error: 'Unable to reach the server. Please check your connection and try again.' };
    }
  },

  // 11. CIBIL Bureau: Fetch real credit score from the confirmed backend's bureau integration.
  // `consent` MUST be explicitly granted by the user (checkbox) before this is called — the
  // backend requires it and will reject the request with no consent. This function NEVER
  // fabricates, estimates, or guesses a score: if the real bureau call does not succeed, it
  // returns ok:false with a reason, and the caller must show that honestly, not a number.
  checkCibil: async (name, consent) => {
    const trimmedName = String(name || '').trim();

    if (!consent) {
      return { ok: false, reason: 'consent_required', error: 'Bureau consent is required before checking your credit score.' };
    }

    try {
      const doFetch = async () => fetch(`${API_BASE_URL}/credit-score/check`, {
        method: 'POST',
        headers: await getAuthHeaders(),
        body: JSON.stringify({ name: trimmedName, consent: true })
      });
      const res = await withAuthRetry(doFetch);
      const data = await res.json();

      if (!res.ok) {
        const reasonByStatus = {
          400: 'invalid_request',
          401: 'not_authenticated',
          403: 'forbidden',
          404: 'no_record_found',
          429: 'rate_limited',
          502: 'bureau_error',
          503: 'bureau_unavailable'
        };
        return {
          ok: false,
          status: res.status,
          reason: reasonByStatus[res.status] || 'unknown_error',
          error: data.error || data.message || 'Unable to fetch your credit score right now. Please try again later.'
        };
      }

      const score = data.creditScore || {};
      if (typeof score.score !== 'number') {
        return { ok: false, reason: 'invalid_response', error: 'Received an unexpected response from the bureau service.' };
      }

      return {
        ok: true,
        creditScore: score.score,
        scoreCategory: score.category || null,
        reportDate: score.lastUpdated || null,
        factors: score.factors || null
      };
    } catch (err) {
      console.warn('CIBIL check network error:', err);
      return { ok: false, reason: 'network_error', error: 'Unable to reach the credit score service. Please check your connection and try again.' };
    }
  }
};

export default api;
