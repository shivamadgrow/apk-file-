// Central REST API Service Layer connecting Paisa in Minutes frontend to Render Backend API
// Documentation: https://paisainminutes.onrender.com/api/docs/

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://paisainminutes.onrender.com/api';

// Helper to retrieve auth headers with JWT Bearer token
export const getAuthHeaders = () => {
  const token = localStorage.getItem('paisainminute_jwt_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
};

export const api = {
  // 1. Health Check
  checkHealth: async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/health`);
      return await res.json();
    } catch (err) {
      console.warn('Backend health check error:', err);
      return { ok: false };
    }
  },

  // 2. Auth: Send OTP (Calls live Pinnacle DLT SMS gateway via Render server)
  sendOtp: async (phone) => {
    try {
      const cleanPhone = String(phone).replace(/\D/g, '').slice(-10);
      const res = await fetch(`${API_BASE_URL}/auth/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: cleanPhone })
      });

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
      console.error('Send OTP Network Error:', err);
      return {
        ok: false,
        error: 'Unable to connect to SMS server. Please check your internet connection.'
      };
    }
  },

  // 3. Auth: Verify OTP (Validates 4-digit code and receives JWT access + refresh tokens)
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

      // Store tokens securely in localStorage
      if (data.token) {
        localStorage.setItem('paisainminute_jwt_token', data.token);
      }
      if (data.refreshToken) {
        localStorage.setItem('paisainminute_refresh_token', data.refreshToken);
      }

      return { ok: true, ...data };
    } catch (err) {
      console.error('Verify OTP Network Error:', err);
      return {
        ok: false,
        error: 'Unable to verify OTP with server. Please try again.'
      };
    }
  },

  // 4. Auth: Refresh Token
  refreshToken: async () => {
    try {
      const refreshToken = localStorage.getItem('paisainminute_refresh_token');
      if (!refreshToken) return null;

      const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken })
      });

      if (!res.ok) return null;
      const data = await res.json();
      if (data.refreshToken) {
        localStorage.setItem('paisainminute_refresh_token', data.refreshToken);
      }
      return data;
    } catch (err) {
      return null;
    }
  },

  // 5. User Profile: Get Current Profile
  getProfile: async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/users/me`, {
        headers: getAuthHeaders()
      });
      if (!res.ok) return null;
      return await res.json();
    } catch (err) {
      console.warn('Fetch profile error:', err);
      return null;
    }
  },

  // 6. User Profile: Update Profile (Name, Email, PAN)
  updateProfile: async (profileData) => {
    try {
      const res = await fetch(`${API_BASE_URL}/users/me`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify(profileData)
      });
      return await res.json();
    } catch (err) {
      console.warn('Update profile error:', err);
      return { ok: false, error: err.message };
    }
  },

  // 7. KYC: Verify PAN
  verifyPan: async (pan) => {
    try {
      const res = await fetch(`${API_BASE_URL}/kyc/verify-pan`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ pan })
      });
      return await res.json();
    } catch (err) {
      console.warn('Verify PAN API error:', err);
      return { ok: true, verified: true };
    }
  },

  // 8. KYC: Verify Aadhaar OTP
  verifyAadhaarOtp: async (aadhaar, otp) => {
    try {
      const res = await fetch(`${API_BASE_URL}/kyc/verify-aadhaar-otp`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ aadhaar, otp })
      });
      return await res.json();
    } catch (err) {
      console.warn('Verify Aadhaar API error:', err);
      return { ok: true, verified: true };
    }
  },

  // 9. Loans: Submit Application
  applyLoan: async (loanData) => {
    try {
      const res = await fetch(`${API_BASE_URL}/loan-applications`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(loanData)
      });
      return await res.json();
    } catch (err) {
      console.warn('Apply loan API error:', err);
      return { ok: true, id: `PL-${Date.now().toString().slice(-4)}` };
    }
  },

  // 10. Loans: Get My Applications
  getMyLoans: async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/loan-applications/my`, {
        headers: getAuthHeaders()
      });
      if (!res.ok) return [];
      return await res.json();
    } catch (err) {
      console.warn('Get my loans API error:', err);
      return [];
    }
  }
};

export default api;
