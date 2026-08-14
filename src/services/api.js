// API Service Layer for connecting PaisaInMinutes Frontend to Backend Server

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

// Helper to handle JWT token authorization headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('paisainminute_jwt_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
};

export const api = {
  // Auth Endpoints
  sendOtp: async (phone) => {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone })
      });
      return await res.json();
    } catch (err) {
      console.warn('Backend API unreachable, using local fallback:', err);
      return { ok: true, debug: { code: '1234' } };
    }
  },

  verifyOtp: async (phone, code) => {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, code })
      });
      const data = await res.json();
      if (data.token) {
        localStorage.setItem('paisainminute_jwt_token', data.token);
        if (data.refreshToken) {
          localStorage.setItem('paisainminute_refresh_token', data.refreshToken);
        }
      }
      return data;
    } catch (err) {
      console.warn('Backend API unreachable, using local fallback:', err);
      return { ok: true, token: 'mock-jwt-token' };
    }
  },

  // User Profile Endpoints
  getProfile: async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/users/me`, {
        headers: getAuthHeaders()
      });
      return await res.json();
    } catch (err) {
      console.warn('Backend API unreachable:', err);
      return null;
    }
  },

  updateProfile: async (userData) => {
    try {
      const res = await fetch(`${API_BASE_URL}/users/me`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify(userData)
      });
      return await res.json();
    } catch (err) {
      console.warn('Backend API unreachable:', err);
      return { ok: false };
    }
  },

  // KYC Endpoints
  verifyPan: async (pan) => {
    try {
      const res = await fetch(`${API_BASE_URL}/kyc/verify-pan`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ pan })
      });
      return await res.json();
    } catch (err) {
      console.warn('Backend API unreachable:', err);
      return { ok: true, verified: true };
    }
  },

  // Lenders Endpoint
  getLenders: async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/lenders`);
      return await res.json();
    } catch (err) {
      console.warn('Backend API unreachable:', err);
      return null;
    }
  },

  // Loans Endpoints
  applyLoan: async (loanData) => {
    try {
      const res = await fetch(`${API_BASE_URL}/loan-applications`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(loanData)
      });
      return await res.json();
    } catch (err) {
      console.warn('Backend API unreachable:', err);
      return { ok: true, id: `LOAN-${Date.now()}` };
    }
  },

  getMyLoans: async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/loan-applications/my`, {
        headers: getAuthHeaders()
      });
      return await res.json();
    } catch (err) {
      console.warn('Backend API unreachable:', err);
      return [];
    }
  },

  // Credit Score Endpoint
  getCreditScore: async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/credit-score`, {
        headers: getAuthHeaders()
      });
      return await res.json();
    } catch (err) {
      console.warn('Backend API unreachable:', err);
      return null;
    }
  },

  // Document Vault Upload Endpoint
  uploadDocument: async (file) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      const token = localStorage.getItem('paisainminute_jwt_token');
      const res = await fetch(`${API_BASE_URL}/documents/upload`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData
      });
      return await res.json();
    } catch (err) {
      console.warn('Backend API unreachable:', err);
      return { ok: false };
    }
  }
};
