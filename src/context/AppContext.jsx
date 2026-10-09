import React, { createContext, useContext, useState, useEffect } from 'react';
import { api, hasSession } from '../services/api';

const AppContext = createContext();

// Default Mock User Profiles Database
// Default Mock User Profiles Database (Empty by default for production compliance)
const DEFAULT_USERS_DB = {};

export const AppProvider = ({ children }) => {
  const [activeTab, setActiveTab] = useState('home');
  const [language, setLanguage] = useState('en');
  const [deviceView, setDeviceView] = useState('mobileFrame');
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isSupportOpen, setIsSupportOpen] = useState(false);

  // Terms & Permissions Acceptance State
  const [hasAcceptedTerms, setHasAcceptedTerms] = useState(() => {
    return localStorage.getItem('paisainminute_terms_accepted') === 'true';
  });

  const acceptTerms = () => {
    localStorage.setItem('paisainminute_terms_accepted', 'true');
    setHasAcceptedTerms(true);
    if (!localStorage.getItem('paisainminute_current_phone')) {
      setIsAuthOpen(true);
    }
  };

  // Initialize LocalStorage Database
  const [usersDb, setUsersDb] = useState(() => {
    const savedDb = localStorage.getItem('paisainminute_users_db');
    if (savedDb) {
      try {
        return JSON.parse(savedDb);
      } catch (e) {
        return DEFAULT_USERS_DB;
      }
    }
    localStorage.setItem('paisainminute_users_db', JSON.stringify(DEFAULT_USERS_DB));
    return DEFAULT_USERS_DB;
  });

  // Current Logged-in Mobile Phone
  const [currentPhone, setCurrentPhone] = useState(() => {
    return localStorage.getItem('paisainminute_current_phone') || '';
  });

  // Referred By Info from Referral Link
  const [referredBy, setReferredBy] = useState(null);

  // Clean Default Guest User Profile (Unverified, No Fake Data)
  const GUEST_USER = {
    name: "Guest User",
    phone: "",
    email: "",
    pan: "",
    creditScore: null,
    scoreCategory: null,
    lastChecked: null,
    factors: null,
    kycVerified: false,
    bankDetails: null,
    loanHistory: []
  };

  // Logged-in User Profile
  const currentUserData = currentPhone && usersDb[currentPhone] ? usersDb[currentPhone] : GUEST_USER;
  const [user, setUser] = useState(currentUserData);

  // Auto Check URL Referral Query Parameters & Prompt Login on Fresh Devices
  useEffect(() => {
    try {
      const searchParams = new URLSearchParams(window.location.search);
      const refName = searchParams.get('name');
      const refPhone = searchParams.get('phone');
      const refCode = searchParams.get('code');

      if (refName || refPhone || refCode) {
        setReferredBy({
          name: refName || 'Friend',
          phone: refPhone || '',
          code: refCode || ''
        });
        // Show Login / Signup OTP Modal when opening via Referral Link if terms already accepted
        if (hasAcceptedTerms) {
          setIsAuthOpen(true);
        }
      } else if (!localStorage.getItem('paisainminute_current_phone')) {
        // Prompt Login / Signup only if terms already accepted
        if (hasAcceptedTerms) {
          setIsAuthOpen(true);
        }
      }
    } catch (e) {}
  }, [hasAcceptedTerms]);

  // Sync user state when currentPhone or usersDb changes
  useEffect(() => {
    if (currentPhone && usersDb[currentPhone]) {
      setUser(usersDb[currentPhone]);
    } else if (!currentPhone) {
      setUser(GUEST_USER);
    }
  }, [currentPhone, usersDb]);

  // Session validation on app start. A cached `currentPhone`/local profile must
  // never be trusted as proof of authentication by itself — only a real, currently
  // valid backend session (an access token that the server actually accepts) counts.
  // If no token exists at all, any stale local "logged in" state is cleared. If a
  // token exists but the server is simply unreachable right now, we stay logged in
  // optimistically (typical offline-tolerant mobile behavior) rather than logging
  // the user out for a network blip.
  useEffect(() => {
    (async () => {
      if (!currentPhone) return;
      const profile = await api.getProfile();
      if (profile && profile.phone) {
        const cleanPhone = profile.phone.replace(/\D/g, '').slice(-10);
        setUsersDb((prevDb) => {
          const existing = prevDb[cleanPhone] || {};
          const merged = {
            ...existing,
            name: profile.name,
            phone: `+91 ${cleanPhone}`,
            email: profile.email || '',
            panMasked: profile.panMasked || null,
            city: profile.city || ''
          };
          const updated = { ...prevDb, [cleanPhone]: merged };
          localStorage.setItem('paisainminute_users_db', JSON.stringify(updated));
          return updated;
        });
        return;
      }
      const stillHasSession = await hasSession();
      if (!stillHasSession) {
        // Token is genuinely gone/invalid (refresh already failed server-side) —
        // don't let a stale local profile keep presenting as "logged in".
        logoutUser();
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Active Loan Application State (Strictly derived from real history)
  const latestLoan = user && user.loanHistory && user.loanHistory.length > 0 ? user.loanHistory[0] : null;
  const [activeLoan, setActiveLoan] = useState({
    id: latestLoan ? latestLoan.id : null,
    hasActiveLoan: !!latestLoan,
    type: latestLoan ? latestLoan.type : "",
    amount: latestLoan ? latestLoan.amount : 0,
    tenureMonths: latestLoan ? latestLoan.tenureMonths : 0,
    monthlyEmi: latestLoan ? latestLoan.monthlyEmi : 0,
    purpose: latestLoan ? latestLoan.purpose : "",
    currentStep: latestLoan ? 5 : 0,
    status: latestLoan ? latestLoan.status : "",
    stepLabels: latestLoan ? latestLoan.stepLabels || [] : [],
    selectedNbfc: latestLoan ? latestLoan.selectedNbfc || { name: latestLoan.nbfc || "" } : null
  });

  // Keep activeLoan in sync when user loanHistory changes.
  // This reads the status/stepLabels exactly as the wizard recorded them — it must
  // never re-fabricate a generic "Disbursal in Progress" story on top of whatever
  // honest state was actually saved.
  useEffect(() => {
    const freshLoan = user && user.loanHistory && user.loanHistory.length > 0 ? user.loanHistory[0] : null;
    if (freshLoan) {
      setActiveLoan({
        id: freshLoan.id,
        hasActiveLoan: true,
        type: freshLoan.type || "Personal Loan",
        amount: freshLoan.amount || 0,
        tenureMonths: freshLoan.tenureMonths || 0,
        monthlyEmi: freshLoan.monthlyEmi || 0,
        purpose: freshLoan.purpose || "Personal Requirement",
        currentStep: freshLoan.stepLabels?.length || 0,
        status: freshLoan.status || "Submitted",
        stepLabels: freshLoan.stepLabels || [],
        selectedNbfc: freshLoan.selectedNbfc || { name: freshLoan.nbfc || "Partner Lender" }
      });
    } else {
      setActiveLoan({
        id: null,
        hasActiveLoan: false,
        type: "",
        amount: 0,
        tenureMonths: 0,
        monthlyEmi: 0,
        purpose: "",
        currentStep: 0,
        status: "",
        stepLabels: [],
        selectedNbfc: null
      });
    }
  }, [user]);

  // Login Function (Fresh unverified session created without fake auto-populated fields)
  const loginUser = (phoneDigits, newProfileData = null) => {
    const cleanPhone = phoneDigits.replace(/\D/g, '');
    let updatedDb = { ...usersDb };

    if (newProfileData) {
      updatedDb[cleanPhone] = newProfileData;
    } else if (!updatedDb[cleanPhone]) {
      // 100% UNVERIFIED, CLEAN INITIAL USER SCHEMA
      updatedDb[cleanPhone] = {
        name: `User ${cleanPhone.slice(-4)}`,
        phone: `+91 ${cleanPhone}`,
        email: "",
        pan: "",
        creditScore: null,
        scoreCategory: null,
        lastChecked: null,
        factors: null,
        kycVerified: false,
        bankDetails: null,
        loanHistory: []
      };
    }

    setUsersDb(updatedDb);
    localStorage.setItem('paisainminute_users_db', JSON.stringify(updatedDb));
    setCurrentPhone(cleanPhone);
    localStorage.setItem('paisainminute_current_phone', cleanPhone);
  };

  // Add new loan application to current user's persistent history.
  // This is a LOCAL record of what the user did in this app (picked an amount,
  // selected a lender, got redirected). It must only ever reflect fields the caller
  // actually provides — never default to a fabricated "approved/disbursed" status.
  const saveNewLoanApplication = (loanData) => {
    const cleanPhone = currentPhone;
    const existingUser = usersDb[cleanPhone] || user;

    const newHistoryItem = {
      id: loanData.id || `PIM-${Math.floor(1000 + Math.random() * 9000)}`,
      type: loanData.type || 'Personal Loan',
      amount: loanData.amount || 0,
      tenureMonths: loanData.tenureMonths || 0,
      monthlyEmi: loanData.monthlyEmi || 0,
      appliedDate: 'Just now',
      status: loanData.status || 'Submitted',
      stepLabels: loanData.stepLabels || [],
      selectedNbfc: loanData.selectedNbfc || null,
      nbfc: loanData.selectedNbfc?.name || loanData.nbfc || ''
    };

    const updatedHistory = [newHistoryItem, ...(existingUser.loanHistory || [])];
    const updatedUser = {
      ...existingUser,
      loanHistory: updatedHistory
    };

    const updatedDb = {
      ...usersDb,
      [cleanPhone]: updatedUser
    };

    setUsersDb(updatedDb);
    localStorage.setItem('paisainminute_users_db', JSON.stringify(updatedDb));
    setUser(updatedUser);
  };

  // Logout Function. The server-side token revocation happens in the background —
  // the UI clears immediately either way, so a slow/offline network never traps the
  // user in a logged-in-looking state on their own device.
  const logoutUser = () => {
    api.logout().catch(() => {});
    setCurrentPhone('');
    localStorage.removeItem('paisainminute_current_phone');
    setUser(GUEST_USER);
    setActiveTab('home');
    setIsAuthOpen(true);
  };

  // Merges real, server-confirmed profile fields (from api.updateProfile's response)
  // into the local cache. Never called optimistically before the server responds —
  // callers must await the API call and only invoke this on res.ok.
  const updateLocalProfile = (fields) => {
    if (!currentPhone) return;
    setUsersDb((prevDb) => {
      const existing = prevDb[currentPhone] || {};
      const updated = { ...existing, ...fields };
      const updatedDb = { ...prevDb, [currentPhone]: updated };
      localStorage.setItem('paisainminute_users_db', JSON.stringify(updatedDb));
      return updatedDb;
    });
  };

  // Called only after the backend has confirmed account deletion (DELETE /api/users/me
  // returned ok:true) — this clears the local cache to match what the server actually
  // did, it does not itself delete anything or claim deletion on its own.
  const deleteLocalAccount = () => {
    const phone = currentPhone;
    setCurrentPhone('');
    localStorage.removeItem('paisainminute_current_phone');
    if (phone) {
      setUsersDb((prevDb) => {
        const { [phone]: _removed, ...rest } = prevDb;
        localStorage.setItem('paisainminute_users_db', JSON.stringify(rest));
        return rest;
      });
    }
    setUser(GUEST_USER);
    setActiveTab('home');
    setIsAuthOpen(true);
  };


  // Notifications State — empty by default. No pre-approved/disbursal claims are shown
  // unless they come from a real backend response; fabricating them here would be the
  // same "fake pre-approval" problem flagged in the audit.
  const [notifications, setNotifications] = useState([]);

  const markNotificationRead = (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, unread: false } : n));
  };

  // Save and update user's CIBIL Credit Score in persistent data.
  // This is only ever called with a real score returned by the confirmed backend's
  // bureau integration (src/services/api.js checkCibil) — it must never be called with
  // a client-fabricated value.
  const saveCibilScore = ({ name, phone, creditScore, scoreCategory, reportDate, factors }) => {
    const cleanPhone = (phone || currentPhone || '').replace(/\D/g, '').slice(-10);
    const existingUser = (cleanPhone && usersDb[cleanPhone]) ? usersDb[cleanPhone] : user;

    const updatedUser = {
      ...existingUser,
      name: name || existingUser.name || (cleanPhone ? `User ${cleanPhone.slice(-4)}` : "Applicant"),
      phone: cleanPhone ? `+91 ${cleanPhone}` : existingUser.phone,
      creditScore: Number(creditScore),
      cibilScore: Number(creditScore),
      scoreCategory: scoreCategory || null,
      lastChecked: reportDate || 'Today',
      cibilCheckedAt: new Date().toISOString(),
      factors: factors || null
    };

    const updatedDb = {
      ...usersDb,
      ...(cleanPhone ? { [cleanPhone]: updatedUser } : {})
    };

    setUsersDb(updatedDb);
    localStorage.setItem('paisainminute_users_db', JSON.stringify(updatedDb));
    
    if (!currentPhone && cleanPhone) {
      setCurrentPhone(cleanPhone);
      localStorage.setItem('paisainminute_current_phone', cleanPhone);
    }
    setUser(updatedUser);
    return updatedUser;
  };

  return (
    <AppContext.Provider value={{
      activeTab,
      setActiveTab,
      language,
      setLanguage,
      deviceView,
      setDeviceView,
      isAuthOpen,
      setIsAuthOpen,
      isSupportOpen,
      setIsSupportOpen,
      user,
      setUser,
      currentPhone,
      referredBy,
      loginUser,
      logoutUser,
      updateLocalProfile,
      deleteLocalAccount,
      saveNewLoanApplication,
      saveCibilScore,
      activeLoan,
      setActiveLoan,
      notifications,
      markNotificationRead,
      hasAcceptedTerms,
      setHasAcceptedTerms,
      acceptTerms
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
