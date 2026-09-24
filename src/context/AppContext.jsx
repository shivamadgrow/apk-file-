import React, { createContext, useContext, useState, useEffect } from 'react';
import { MOCK_LEADS } from '../data/mockData';

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

  // Keep activeLoan in sync when user loanHistory changes
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
        currentStep: 5,
        status: freshLoan.status || "Approved — Disbursal Initiated",
        stepLabels: [
          { id: 1, title: "Journey Started", time: "Just now", done: true },
          { id: 2, title: "Application Complete", time: "Just now", done: true },
          { id: 3, title: "Offer Selected", time: "Just now", done: true },
          { id: 4, title: "e-KYC & Agreement Signed", time: "Just now", done: true },
          { id: 5, title: "Disbursal in Progress", time: "Estimated < 5 mins", done: true }
        ],
        selectedNbfc: {
          name: freshLoan.nbfc || "Partner Lender",
          rate: "10.99%",
          fee: "₹1,500",
          disbursalTime: "8 Minutes"
        }
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

  // Add new loan application to current user's persistent history
  const saveNewLoanApplication = (loanData) => {
    const cleanPhone = currentPhone;
    const existingUser = usersDb[cleanPhone] || user;

    const newHistoryItem = {
      id: loanData.id || `PL-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      type: loanData.type || 'Personal Loan',
      amount: loanData.amount || 350000,
      tenureMonths: loanData.tenureMonths || 36,
      monthlyEmi: loanData.monthlyEmi || 11480,
      appliedDate: 'Just now',
      status: 'Approved — Disbursal Initiated',
      nbfc: loanData.selectedNbfc?.name || 'Rupay91'
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

  // Logout Function
  const logoutUser = () => {
    setCurrentPhone('');
    localStorage.removeItem('paisainminute_current_phone');
    localStorage.removeItem('paisainminute_jwt_token');
    localStorage.removeItem('paisainminute_refresh_token');
    setUser(GUEST_USER);
    setActiveTab('home');
    setIsAuthOpen(true);
  };

  // Affiliate / Partner State
  const [affiliate, setAffiliate] = useState({
    isApproved: false,
    accountType: "individual",
    partnerId: "",
    referralCode: "",
    referralUrl: "",
    totalEarned: 0,
    pendingPayout: 0,
    paidOut: 0,
    leads: [],
    company: null,
    payoutHistory: []
  });

  // Notifications State
  const [notifications, setNotifications] = useState([
    {
      id: "n1",
      title: "🎉 Pre-Approved Loan Offer!",
      message: "You have a ₹5,00,000 instant credit line pre-approved with Rupay91 at 0.95%/mo.",
      time: "10m ago",
      unread: true,
      type: "offer"
    },
    {
      id: "n2",
      title: "⚡ Instant Bank Account Disbursal",
      message: "Check your pre-approved personal loan offers and track disbursal in real-time.",
      time: "2h ago",
      unread: true,
      type: "offer"
    }
  ]);

  const markNotificationRead = (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, unread: false } : n));
  };

  // Save and update user's CIBIL Credit Score in persistent data
  const saveCibilScore = ({ name, phone, creditScore, scoreCategory, reportDate }) => {
    const cleanPhone = (phone || currentPhone || '').replace(/\D/g, '').slice(-10);
    const existingUser = (cleanPhone && usersDb[cleanPhone]) ? usersDb[cleanPhone] : user;

    const updatedUser = {
      ...existingUser,
      name: name || existingUser.name || (cleanPhone ? `User ${cleanPhone.slice(-4)}` : "Applicant"),
      phone: cleanPhone ? `+91 ${cleanPhone}` : existingUser.phone,
      creditScore: Number(creditScore),
      cibilScore: Number(creditScore),
      scoreCategory: scoreCategory || (Number(creditScore) >= 750 ? 'Excellent' : 'Good'),
      lastChecked: reportDate || 'Today',
      cibilCheckedAt: new Date().toISOString()
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

  // Add new lead in Lead Management tab
  const addLead = (newLeadData) => {
    const newLead = {
      id: `LD-${Math.floor(9030 + Math.random() * 900)}`,
      name: newLeadData.name || "New Applicant",
      phone: newLeadData.phone || "+91 98000 00000",
      type: newLeadData.type || "Personal Loan",
      amount: newLeadData.amount ? `₹${Number(newLeadData.amount).toLocaleString()}` : "₹3,00,000",
      cibil: newLeadData.cibil || user.creditScore || user.cibilScore || null,
      creditScore: newLeadData.creditScore || user.creditScore || user.cibilScore || null,
      status: "In Review",
      commission: `₹${Math.round((Number(newLeadData.amount) || 300000) * 0.025).toLocaleString()}`,
      date: "Today",
      nbfc: newLeadData.nbfc || "Rupay91 Instant Loan",
      payoutStatus: "Pending Disbursal"
    };

    setAffiliate(prev => ({
      ...prev,
      leads: [newLead, ...(prev.leads || [])]
    }));

    return newLead;
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
      saveNewLoanApplication,
      saveCibilScore,
      activeLoan,
      setActiveLoan,
      affiliate,
      setAffiliate,
      addLead,
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
