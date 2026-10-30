import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { BILINGUAL_TEXT } from '../../data/mockData';
import { api } from '../../services/api';
import {
  User, Shield, Globe, Landmark, Lock, FileText, LogOut, ChevronRight, HelpCircle, History,
  Sparkles, CheckCircle2, Share2, Info, MessageSquare, ListOrdered, X, Send, Languages,
  Edit3, AlertTriangle, Trash2, Loader2
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const ProfileSettings = () => {
  const { user, language, setLanguage, setIsSupportOpen, setActiveTab, setIsAuthOpen, logoutUser, updateLocalProfile, deleteLocalAccount, currentPhone, partners } = useApp();
  const partnerNamesList = partners.map((p) => p.name).join(', ');
  const t = BILINGUAL_TEXT[language] || BILINGUAL_TEXT.en;
  const isAuthenticated = !!currentPhone;

  const [showRbiModal, setShowRbiModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showSecurityConsentModal, setShowSecurityConsentModal] = useState(false);
  const [showHowToApplyModal, setShowHowToApplyModal] = useState(false);
  const [showAboutModal, setShowAboutModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackTab, setFeedbackTab] = useState('write'); // 'write' or 'all'
  const [selectedRating, setSelectedRating] = useState(5);
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [selectedLangTemp, setSelectedLangTemp] = useState(language);

  // Edit Profile — fields match exactly what the backend's PATCH /api/users/me accepts
  // (paisa/server/src/routes/users.js PROFILE_FIELDS). Nothing else is editable here.
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editCity, setEditCity] = useState('');
  const [editState, setEditState] = useState('');
  const [editPincode, setEditPincode] = useState('');
  const [editPan, setEditPan] = useState('');
  const [editError, setEditError] = useState('');
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  const openEditProfile = () => {
    setEditName(user.name && !user.name.startsWith('User ') ? user.name : '');
    setEditEmail(user.email || '');
    setEditCity(user.city || '');
    setEditState(user.state || '');
    setEditPincode(user.pincode || '');
    setEditPan('');
    setEditError('');
    setShowEditProfileModal(true);
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setEditError('');
    if (editEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editEmail)) {
      setEditError('Please enter a valid email address.');
      return;
    }
    if (editPan && !/^[A-Z]{5}[0-9]{4}[A-Z]$/i.test(editPan)) {
      setEditError('Please enter a valid 10-character PAN (e.g. ABCDE1234F), or leave it blank.');
      return;
    }
    if (editPincode && !/^\d{6}$/.test(editPincode)) {
      setEditError('Pincode must be 6 digits.');
      return;
    }

    setIsSavingProfile(true);
    const payload = { name: editName, email: editEmail, city: editCity, state: editState, pincode: editPincode };
    if (editPan) payload.pan = editPan.toUpperCase();
    const res = await api.updateProfile(payload);
    setIsSavingProfile(false);

    if (!res.ok) {
      setEditError(res.error || 'Unable to save your profile right now. Please try again.');
      return;
    }
    // Only ever reflects what the server actually confirmed (res.user) — never what
    // was typed, in case the server trimmed/rejected a field differently.
    updateLocalProfile({
      name: res.user.name || '',
      email: res.user.email || '',
      city: res.user.city || '',
      state: res.user.state || '',
      pincode: res.user.pincode || '',
      panMasked: res.user.panMasked || null
    });
    setShowEditProfileModal(false);
  };

  // Delete Account — matches the confirmed backend's DELETE /api/users/me, which
  // requires reauthentication via a fresh OTP code sent to this account's own number.
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteStep, setDeleteStep] = useState('confirm'); // 'confirm' | 'otp' | 'done'
  const [deleteCode, setDeleteCode] = useState('');
  const [deleteError, setDeleteError] = useState('');
  const [isSendingDeleteOtp, setIsSendingDeleteOtp] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  const openDeleteModal = () => {
    setDeleteStep('confirm');
    setDeleteCode('');
    setDeleteError('');
    setShowDeleteModal(true);
  };

  const handleSendDeleteOtp = async () => {
    setDeleteError('');
    setIsSendingDeleteOtp(true);
    const res = await api.sendOtp(currentPhone);
    setIsSendingDeleteOtp(false);
    if (!res.ok) {
      setDeleteError(res.error || 'Unable to send the confirmation code. Please try again.');
      return;
    }
    setDeleteStep('otp');
  };

  const handleConfirmDelete = async (e) => {
    e.preventDefault();
    setDeleteError('');
    if (deleteCode.trim().length < 4) {
      setDeleteError('Please enter the code sent to your phone.');
      return;
    }
    setIsDeletingAccount(true);
    const res = await api.deleteAccount(deleteCode.trim());
    setIsDeletingAccount(false);
    if (!res.ok) {
      setDeleteError(res.error || 'Unable to delete your account right now. Please try again.');
      return;
    }
    setDeleteStep('done');
    setTimeout(() => {
      setShowDeleteModal(false);
      deleteLocalAccount();
    }, 1800);
  };

  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackSent, setFeedbackSent] = useState(false);

  // Initialize and fetch all persistent customer reviews. No fabricated reviews —
  // this starts empty and only ever shows reviews actually submitted on this device.
  const [allFeedbacks, setAllFeedbacks] = useState(() => {
    const saved = localStorage.getItem('paisainminute_feedbacks');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return [];
  });

  const loanHistory = user.loanHistory || [];

  const handleFeedbackSubmit = (e) => {
    e.preventDefault();
    if (!feedbackText.trim()) return;

    try {
      confetti({ particleCount: 60, spread: 50 });
    } catch (e) {}

    const newFeedback = {
      id: `fb-${Date.now()}`,
      name: user.name || "Customer",
      phone: user.phone || "+91 Borrower",
      rating: selectedRating,
      text: feedbackText.trim(),
      date: "Just now"
    };

    const updatedFeedbacks = [newFeedback, ...allFeedbacks];
    setAllFeedbacks(updatedFeedbacks);
    localStorage.setItem('paisainminute_feedbacks', JSON.stringify(updatedFeedbacks));

    // Open mailto to info@paisainminutes.com
    const mailtoUrl = `mailto:info@paisainminutes.com?subject=${encodeURIComponent(`Feedback from ${user.name} (${user.phone})`)}&body=${encodeURIComponent(`Rating: ${selectedRating}/5 Stars\n\nReview:\n${feedbackText.trim()}`)}`;
    window.open(mailtoUrl, '_blank');

    setFeedbackSent(true);
    setTimeout(() => {
      setFeedbackSent(false);
      setFeedbackText('');
      setFeedbackTab('all');
    }, 1800);
  };

  const handleSaveLanguage = () => {
    setLanguage(selectedLangTemp);
    setShowLanguageModal(false);
  };

  return (
    <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xl my-3 text-left space-y-4">
      {/* Profile Header Card */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#223981] to-[#4A8DFF] text-white flex items-center justify-center font-bold text-xl shadow-md">
              <User className="w-7 h-7 text-[#6FA8FF]" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-white shadow-md border border-slate-200 flex items-center justify-center p-0.5" title="Paisa in Minutes Verified">
              <img src="/app-icon.png" alt="Paisa in Minutes Badge" className="w-full h-full object-contain" />
            </div>
          </div>
          <div>
            <h2 className="text-lg font-extrabold text-[#223981]">{isAuthenticated ? user.name : 'Guest User'}</h2>
            <p className="text-xs font-semibold text-[#717983]">{isAuthenticated ? user.phone : 'Unverified Session'}</p>
            {/* Identity/KYC verification happens with the lending partner after redirect
                (see LoanApplicationWizard) — this app never claims to have verified it
                itself. This badge only reflects the one thing genuinely true here: the
                mobile number was OTP-verified. */}
            {isAuthenticated ? (
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 mt-1 inline-block">
                ✓ Mobile Verified{user.panMasked ? ` • PAN: ${user.panMasked}` : ''}
              </span>
            ) : (
              <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200 mt-1 inline-block">
                ⏳ Mobile Verification Required
              </span>
            )}
          </div>
        </div>

        {/* Switch Account / Logout Button */}
        <button
          onClick={() => setIsAuthOpen(true)}
          className="p-2.5 bg-slate-100 hover:bg-[#E4EEFF] rounded-2xl text-[#223981] hover:text-[#4A8DFF] transition flex flex-col items-center justify-center border border-slate-200/80"
          title="Switch Account or Login with Another Number"
        >
          <LogOut className="w-4 h-4" />
          <span className="text-[9px] font-bold mt-0.5">{isAuthenticated ? 'Switch' : 'Login'}</span>
        </button>
      </div>

      {/* MY LOAN APPLICATIONS HISTORY SECTION */}
      <div className="bg-slate-50 p-4 rounded-3xl border border-slate-200/80 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 rounded-lg bg-[#223981] text-white flex items-center justify-center">
              <History className="w-4 h-4 text-[#6FA8FF]" />
            </div>
            <div>
              <h3 className="text-xs font-extrabold text-[#223981]">My Applied Loans History</h3>
              <p className="text-[10px] text-[#717983]">
                {isAuthenticated ? `Linked with mobile: ${user.phone}` : 'Log in to view applied loan history'}
              </p>
            </div>
          </div>
          {isAuthenticated && (
            <span className="text-[10px] font-black bg-[#E4EEFF] text-[#4A8DFF] px-2.5 py-1 rounded-full border border-[#6FA8FF]/30">
              {loanHistory.length} {loanHistory.length === 1 ? 'Application' : 'Applications'}
            </span>
          )}
        </div>

        {!isAuthenticated || loanHistory.length === 0 ? (
          <div className="bg-white p-4 rounded-2xl border border-slate-200 text-center space-y-1.5">
            <p className="text-xs font-bold text-[#223981]">No Loan Applications Found</p>
            <p className="text-[11px] text-[#717983]">
              {isAuthenticated ? 'Submit a loan enquiry to view your application timeline here.' : 'Log in with your mobile number to sync your applications.'}
            </p>
            <button 
              onClick={() => isAuthenticated ? setActiveTab('loans') : setIsAuthOpen(true)}
              className="mt-2 text-xs font-extrabold text-[#4A8DFF] underline"
            >
              {isAuthenticated ? 'Apply for First Loan →' : 'Log In / Sign Up →'}
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {loanHistory.map((item, index) => (
              <div 
                key={item.id || index}
                onClick={() => setActiveTab('track')}
                className="bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs hover:border-[#4A8DFF] cursor-pointer transition space-y-1.5"
              >
                <div className="flex justify-between items-center text-xs">
                  <span className="font-extrabold text-[#223981]">{item.type}</span>
                  <span className="font-black text-[#4A8DFF]">₹{item.amount.toLocaleString()}</span>
                </div>

                <div className="flex justify-between items-center text-[10.5px]">
                  <span className="text-[#717983] font-mono">ID: {item.id} • {item.tenureMonths} Months</span>
                  <span className="text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full font-bold text-[9.5px]">
                    {item.status}
                  </span>
                </div>

                <div className="flex justify-between items-center text-[9.5px] text-slate-400 pt-1 border-t border-slate-100">
                  <span>Lender: {item.nbfc || 'Rupay91'}</span>
                  <span>Applied: {item.appliedDate}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bank Account Card */}
      <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-[#223981] flex items-center">
            <Landmark className="w-4 h-4 mr-1 text-[#4A8DFF]" />
            Bank Account
          </span>
          {isAuthenticated && user.bankDetails ? (
            <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md">
              Linked
            </span>
          ) : (
            <span className="text-[10.5px] font-extrabold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-xl">
              Coming Soon
            </span>
          )}
        </div>
        {isAuthenticated && user.bankDetails ? (
          <div>
            <p className="text-xs font-extrabold text-[#223981]">{user.bankDetails.bankName}</p>
            <p className="text-[11px] text-[#717983] font-mono mt-0.5">Account: ****{user.bankDetails.accountNumber.slice(-4)} • IFSC: {user.bankDetails.ifsc}</p>
          </div>
        ) : (
          <p className="text-xs text-[#717983] font-medium">
            Bank account linking isn't available in the app yet. Your chosen lending partner will collect bank
            details directly, on their own site, as part of their application process.
          </p>
        )}
      </div>

      {/* SECTION 1: UTILITIES & DISCLOSURES */}
      <div className="space-y-1 text-xs">
        <h4 className="text-[11px] font-extrabold text-[#223981] uppercase tracking-wider px-1 mb-1">Financial Utilities & Disclosures</h4>

        {/* 0. Edit Profile */}
        {isAuthenticated && (
          <div
            onClick={openEditProfile}
            className="p-3.5 bg-white rounded-2xl border border-slate-200 hover:bg-slate-50 cursor-pointer flex items-center justify-between transition group shadow-2xs"
          >
            <div className="flex items-center space-x-2.5">
              <Edit3 className="w-4.5 h-4.5 text-[#2563EB] flex-shrink-0" />
              <span className="font-extrabold text-[#223981] text-xs sm:text-sm">Edit Profile</span>
            </div>
            <ChevronRight className="w-4 h-4 text-[#717983]" />
          </div>
        )}

        {/* 1. EMI Calculator Utility */}
        <div 
          onClick={() => setActiveTab('calculator')}
          className="p-3.5 bg-white rounded-2xl border border-slate-200 hover:bg-slate-50 cursor-pointer flex items-center justify-between transition group shadow-2xs"
        >
          <span className="font-extrabold text-[#223981] text-xs sm:text-sm">EMI Calculator Utility</span>
          <ChevronRight className="w-4 h-4 text-[#717983]" />
        </div>

        {/* 2. Document Vault & Sanction Letters */}
        <div 
          onClick={() => setActiveTab('vault')}
          className="p-3.5 bg-white rounded-2xl border border-slate-200 hover:bg-slate-50 cursor-pointer flex items-center justify-between transition group shadow-2xs"
        >
          <span className="font-extrabold text-[#223981] text-xs sm:text-sm">Document Vault & Sanction Letters</span>
          <ChevronRight className="w-4 h-4 text-[#717983]" />
        </div>

        {/* 3. RBI NBFC Partner Disclosures */}
        <div 
          onClick={() => setShowRbiModal(true)}
          className="p-3.5 bg-white rounded-2xl border border-slate-200 hover:bg-slate-50 cursor-pointer flex items-center justify-between transition group shadow-2xs"
        >
          <div className="flex items-center space-x-2.5">
            <Shield className="w-4.5 h-4.5 text-emerald-600 flex-shrink-0" />
            <span className="font-extrabold text-[#223981] text-xs sm:text-sm">RBI NBFC Partner Disclosures</span>
          </div>
          <ChevronRight className="w-4 h-4 text-[#717983]" />
        </div>

        {/* 4. Data Privacy & Security Consent */}
        <div 
          onClick={() => setShowSecurityConsentModal(true)}
          className="p-3.5 bg-white rounded-2xl border border-slate-200 hover:bg-slate-50 cursor-pointer flex items-center justify-between transition group shadow-2xs"
        >
          <div className="flex items-center space-x-2.5">
            <Lock className="w-4.5 h-4.5 text-[#4A8DFF] flex-shrink-0" />
            <span className="font-extrabold text-[#223981] text-xs sm:text-sm">Data Privacy & Security Consent</span>
          </div>
          <ChevronRight className="w-4 h-4 text-[#717983]" />
        </div>

        {/* 5. 24x7 Helpdesk & Notifications */}
        <div 
          onClick={() => setIsSupportOpen(true)}
          className="p-3.5 bg-white rounded-2xl border border-slate-200 hover:bg-slate-50 cursor-pointer flex items-center justify-between transition group shadow-2xs"
        >
          <div className="flex items-center space-x-2.5">
            <HelpCircle className="w-4.5 h-4.5 text-amber-500 flex-shrink-0" />
            <span className="font-extrabold text-[#223981] text-xs sm:text-sm">24x7 Helpdesk & Notifications</span>
          </div>
          <ChevronRight className="w-4 h-4 text-[#717983]" />
        </div>
      </div>

      {/* SECTION 2: INFORMATION & APP PREFERENCES */}
      <div className="bg-white rounded-3xl border border-slate-200/80 divide-y divide-slate-100 overflow-hidden text-xs">
        
        {/* Refer a Friend */}
        <div
          onClick={() => setActiveTab('referral')}
          className="p-3.5 hover:bg-slate-50 cursor-pointer flex items-center justify-between transition group"
        >
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-xl bg-[#E4EEFF] text-[#4A8DFF] flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition">
              <Share2 className="w-4.5 h-4.5" />
            </div>
            <span className="font-extrabold text-[#223981] text-sm">Refer a Friend</span>
          </div>
          <ChevronRight className="w-4 h-4 text-[#717983]" />
        </div>

        {/* How to Apply */}
        <div 
          onClick={() => setShowHowToApplyModal(true)}
          className="p-3.5 hover:bg-slate-50 cursor-pointer flex items-center justify-between transition group"
        >
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-xl bg-[#E4EEFF] text-[#4A8DFF] flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition">
              <ListOrdered className="w-4.5 h-4.5" />
            </div>
            <span className="font-extrabold text-[#223981] text-sm">How to Apply</span>
          </div>
          <ChevronRight className="w-4 h-4 text-[#717983]" />
        </div>

        {/* About Us */}
        <div 
          onClick={() => setShowAboutModal(true)}
          className="p-3.5 hover:bg-slate-50 cursor-pointer flex items-center justify-between transition group"
        >
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-xl bg-[#E4EEFF] text-[#223981] flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition">
              <Info className="w-4.5 h-4.5" />
            </div>
            <span className="font-extrabold text-[#223981] text-sm">About Us</span>
          </div>
          <ChevronRight className="w-4 h-4 text-[#717983]" />
        </div>

        {/* Privacy Policy */}
        <div 
          onClick={() => setShowPrivacyModal(true)}
          className="p-3.5 hover:bg-slate-50 cursor-pointer flex items-center justify-between transition group"
        >
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-xl bg-[#E4EEFF] text-[#223981] flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition">
              <FileText className="w-4.5 h-4.5" />
            </div>
            <span className="font-extrabold text-[#223981] text-sm">Privacy Policy</span>
          </div>
          <ChevronRight className="w-4 h-4 text-[#717983]" />
        </div>

        {/* Feedback */}
        <div 
          onClick={() => setShowFeedbackModal(true)}
          className="p-3.5 hover:bg-slate-50 cursor-pointer flex items-center justify-between transition group"
        >
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-xl bg-[#E4EEFF] text-[#4A8DFF] flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition">
              <MessageSquare className="w-4.5 h-4.5" />
            </div>
            <span className="font-extrabold text-[#223981] text-sm">Feedback</span>
          </div>
          <ChevronRight className="w-4 h-4 text-[#717983]" />
        </div>

        {/* Language Preference -> OPENS EXACT MODAL FROM USER SCREENSHOT */}
        <div 
          onClick={() => {
            setSelectedLangTemp(language);
            setShowLanguageModal(true);
          }}
          className="p-3.5 hover:bg-slate-50 cursor-pointer flex items-center justify-between transition"
        >
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-xl bg-[#E4EEFF] text-[#4A8DFF] flex items-center justify-center flex-shrink-0">
              <Globe className="w-4.5 h-4.5" />
            </div>
            <span className="font-extrabold text-[#223981] text-sm">Language Preference</span>
          </div>
          <span className="font-extrabold text-[#4A8DFF] bg-[#E4EEFF] px-2.5 py-1 rounded-xl">
            {language === 'en' ? 'English 🇬🇧' : 'हिन्दी 🇮🇳'}
          </span>
        </div>

        {/* Logout Account */}
        <div 
          onClick={logoutUser}
          className="p-3.5 hover:bg-rose-50 cursor-pointer flex items-center justify-between transition group bg-rose-50/50"
        >
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition">
              <LogOut className="w-4.5 h-4.5 text-rose-600" />
            </div>
            <span className="font-extrabold text-rose-600 text-sm">Logout Account</span>
          </div>
          <ChevronRight className="w-4 h-4 text-rose-400" />
        </div>

        {/* Delete Account */}
        {isAuthenticated && (
          <div
            onClick={openDeleteModal}
            className="p-3.5 hover:bg-rose-50 cursor-pointer flex items-center justify-between transition group"
          >
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition">
                <Trash2 className="w-4.5 h-4.5 text-rose-600" />
              </div>
              <span className="font-extrabold text-rose-600 text-sm">Delete Account</span>
            </div>
            <ChevronRight className="w-4 h-4 text-rose-400" />
          </div>
        )}

      </div>

      {/* Official Brand Footer */}
      <div className="pt-2">
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-center space-y-1.5">
          <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center mx-auto shadow-md p-1 border border-slate-200/80">
            <img src="/app-icon.png" alt="Paisa in Minutes Sign" className="w-full h-full object-contain" />
          </div>
          <h4 className="text-xs font-extrabold text-[#223981]">Paisa in Minutes</h4>
          <p className="text-[10px] text-[#4A8DFF] font-bold">Paisa Milega, Minutes Mein</p>
          <p className="text-[9px] text-[#717983]">
            Loan Aggregator Platform • Version 1.0
          </p>
        </div>
      </div>

      {/* EXACT LANGUAGE POPUP MODAL MATCHING APP THEME COLOR */}
      {showLanguageModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-[#F8FAFC] rounded-3xl p-6 max-w-sm w-full space-y-6 shadow-2xl text-center border border-slate-200 relative">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-200/80 pb-4">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#E4EEFF] text-[#4A8DFF] flex items-center justify-center font-black">
                  <Languages className="w-4.5 h-4.5" />
                </div>
                <h3 className="text-base font-black text-[#223981]">
                  Change Language / भाषा बदलें
                </h3>
              </div>
              <button 
                onClick={() => setShowLanguageModal(false)}
                className="p-1.5 hover:bg-slate-200 rounded-full text-[#717983] transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 2 Language Cards Grid matching app theme */}
            <div className="grid grid-cols-2 gap-4 my-4">
              
              {/* English Card */}
              <div
                onClick={() => setSelectedLangTemp('en')}
                className={`bg-white rounded-2xl p-5 border-2 cursor-pointer transition-all duration-200 flex flex-col items-center justify-center space-y-3 ${
                  selectedLangTemp === 'en'
                    ? 'border-[#4A8DFF] bg-[#E4EEFF]/40 shadow-md ring-2 ring-[#4A8DFF]/20'
                    : 'border-slate-200/80 hover:border-slate-300'
                }`}
              >
                <span className="text-4xl font-black text-[#4A8DFF] tracking-tight">A</span>
                <span className="text-xs font-extrabold text-[#223981]">English/ अंग्रेज़ी</span>
              </div>

              {/* Hindi Card */}
              <div
                onClick={() => setSelectedLangTemp('hi')}
                className={`bg-white rounded-2xl p-5 border-2 cursor-pointer transition-all duration-200 flex flex-col items-center justify-center space-y-3 ${
                  selectedLangTemp === 'hi'
                    ? 'border-[#4A8DFF] bg-[#E4EEFF]/40 shadow-md ring-2 ring-[#4A8DFF]/20'
                    : 'border-slate-200/80 hover:border-slate-300'
                }`}
              >
                <span className="text-4xl font-black text-[#223981] tracking-tight">अ</span>
                <span className="text-xs font-extrabold text-[#223981]">हिन्दी/Hindi</span>
              </div>

            </div>

            {/* Save Button matching app theme */}
            <div className="pt-2">
              <button
                onClick={handleSaveLanguage}
                className="w-48 py-3.5 bg-gradient-to-r from-[#2563EB] to-[#1D4ED8] hover:from-[#1D4ED8] hover:to-[#1E40AF] text-white font-extrabold text-sm rounded-2xl shadow-lg shadow-[#2563EB]/30 transition active:scale-95 mx-auto block"
              >
                Save
              </button>
            </div>

          </div>
        </div>
      )}

      {/* MODAL 1: HOW TO APPLY GUIDE MODAL */}
      {showHowToApplyModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-5 max-w-md w-full space-y-4 shadow-2xl text-left border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-extrabold text-[#223981] flex items-center">
                <ListOrdered className="w-4 h-4 mr-2 text-[#4A8DFF]" />
                How to Apply
              </h3>
              <button onClick={() => setShowHowToApplyModal(false)} className="p-1 hover:bg-slate-100 rounded-lg">
                <X className="w-4 h-4 text-[#717983]" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-start space-x-3 bg-slate-50 p-3 rounded-2xl">
                <span className="w-6 h-6 rounded-full bg-[#4A8DFF] text-white font-black flex items-center justify-center text-xs flex-shrink-0">1</span>
                <div>
                  <p className="font-extrabold text-[#223981]">Select Preferred Partner Lender</p>
                  <p className="text-[11px] text-[#717983] mt-0.5">Browse {partners.length} partner companies ({partnerNamesList}) and click 'Apply Now'.</p>
                </div>
              </div>

              <div className="flex items-start space-x-3 bg-slate-50 p-3 rounded-2xl">
                <span className="w-6 h-6 rounded-full bg-[#4A8DFF] text-white font-black flex items-center justify-center text-xs flex-shrink-0">2</span>
                <div>
                  <p className="font-extrabold text-[#223981]">Submit Your Enquiry</p>
                  <p className="text-[11px] text-[#717983] mt-0.5">Share your income and loan details with Paisa in Minutes, with your consent, so we can match you with partners.</p>
                </div>
              </div>

              <div className="flex items-start space-x-3 bg-slate-50 p-3 rounded-2xl">
                <span className="w-6 h-6 rounded-full bg-[#4A8DFF] text-white font-black flex items-center justify-center text-xs flex-shrink-0">3</span>
                <div>
                  <p className="font-extrabold text-[#223981]">Complete KYC & Get Terms From the Partner</p>
                  <p className="text-[11px] text-[#717983] mt-0.5">You'll be redirected to your chosen partner's site to complete their KYC and receive their final loan terms and disbursal timeline.</p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowHowToApplyModal(false)}
              className="w-full py-2.5 bg-[#4A8DFF] text-white text-xs font-bold rounded-xl shadow hover:bg-[#223981] transition"
            >
              Got It, Thank You!
            </button>
          </div>
        </div>
      )}

      {/* MODAL 2: ABOUT US MODAL */}
      {showAboutModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-5 max-w-md w-full space-y-3 shadow-2xl text-left border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-extrabold text-[#223981] flex items-center">
                <Info className="w-4 h-4 mr-2 text-[#4A8DFF]" />
                About Paisa in Minutes
              </h3>
              <button onClick={() => setShowAboutModal(false)} className="p-1 hover:bg-slate-100 rounded-lg">
                <X className="w-4 h-4 text-[#717983]" />
              </button>
            </div>

            <div className="text-xs text-[#717983] leading-relaxed space-y-2">
              <p>
                <strong className="text-[#223981]">Paisa in Minutes</strong> is a technology loan aggregator/facilitator — we don't lend money ourselves.
                We connect borrowers with NBFC-registered lending partners for their loan needs.
              </p>
              <div className="bg-[#E4EEFF]/80 p-3 rounded-2xl border border-[#6FA8FF]/30 text-[#223981] space-y-1">
                <p className="font-extrabold">Why Choose Paisa in Minutes?</p>
                <p className="text-[11px] text-[#717983]">✓ Compare Multiple NBFC-Registered Lending Partners<br/>✓ Zero Physical Visit to Apply Through This App<br/>✓ See Each Partner's Own Interest Rates Before You Apply<br/>✓ Your Partner's Own KYC &amp; Approval — Not Decided By Us</p>
              </div>
            </div>

            <button
              onClick={() => setShowAboutModal(false)}
              className="w-full py-2.5 bg-[#223981] text-white text-xs font-bold rounded-xl"
            >
              Close About Us
            </button>
          </div>
        </div>
      )}

      {/* MODAL 3: PRIVACY POLICY MODAL */}
      {showPrivacyModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-5 max-w-md w-full space-y-3 shadow-2xl text-left border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-extrabold text-[#223981] flex items-center">
                <Lock className="w-4 h-4 mr-2 text-[#4A8DFF]" />
                Privacy Policy & Data Protection
              </h3>
              <button onClick={() => setShowPrivacyModal(false)} className="p-1 hover:bg-slate-100 rounded-lg">
                <X className="w-4 h-4 text-[#717983]" />
              </button>
            </div>

            <div className="text-xs text-[#717983] leading-relaxed space-y-2">
              <p>
                Your personal information and bank account details are sent to our servers over an encrypted (HTTPS) connection.
                This app does not collect Aadhaar numbers or Aadhaar OTPs — identity verification happens with the lending partner
                you choose, on their own site.
              </p>
              <p>
                We do not sell or rent your personal data. Data you submit is used to process your loan enquiry and share it with
                the NBFC-registered lending partner you select.
              </p>
              <div className="pt-2 flex flex-col space-y-1.5 font-bold text-xs">
                <a 
                  href="https://paisainminutes.com/privacy-policy" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-[#2563EB] hover:underline flex items-center justify-between p-2 rounded-xl bg-blue-50/60 border border-blue-100"
                >
                  <span>Read Official Privacy Policy</span>
                  <span>→</span>
                </a>
                <a 
                  href="https://paisainminutes.com/terms-and-conditions" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-[#2563EB] hover:underline flex items-center justify-between p-2 rounded-xl bg-blue-50/60 border border-blue-100"
                >
                  <span>Read Terms & Conditions</span>
                  <span>→</span>
                </a>
              </div>
            </div>

            <button
              onClick={() => setShowPrivacyModal(false)}
              className="w-full py-2.5 bg-[#223981] text-white text-xs font-bold rounded-xl hover:bg-[#1E3A8A] transition"
            >
              Understand & Close
            </button>
          </div>
        </div>
      )}

      {/* MODAL 3B: DATA PRIVACY & SECURITY CONSENT MODAL */}
      {showSecurityConsentModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-5 max-w-md w-full space-y-3.5 shadow-2xl text-left border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                  <Shield className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-[#223981]">Data Privacy & Security Consent</h3>
                </div>
              </div>
              <button onClick={() => setShowSecurityConsentModal(false)} className="p-1 hover:bg-slate-100 rounded-lg">
                <X className="w-4 h-4 text-[#717983]" />
              </button>
            </div>

            <div className="text-xs text-[#717983] leading-relaxed space-y-2.5">
              <div className="bg-[#E4EEFF]/70 p-3 rounded-2xl border border-[#6FA8FF]/30 space-y-1.5">
                <div className="flex items-center space-x-2 text-[#223981] font-extrabold text-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>Encrypted in Transit</span>
                </div>
                <p className="text-[10.5px] text-[#475569]">
                  Your information is sent to our servers over an encrypted (HTTPS) connection. This app does not collect
                  Aadhaar numbers, Aadhaar OTPs, or any document scans.
                </p>
              </div>

              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200/80 space-y-1.5">
                <div className="flex items-center space-x-2 text-[#223981] font-extrabold text-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>Explicit Borrower Consent</span>
                </div>
                <p className="text-[10.5px] text-[#475569]">
                  Your information is shared only with the specific NBFC-registered lending partner you choose to apply with,
                  and only after you give consent on the loan enquiry screen. We never sell or distribute your private data.
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowSecurityConsentModal(false)}
              className="w-full py-2.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-bold rounded-xl shadow transition"
            >
              Acknowledge & Close
            </button>
          </div>
        </div>
      )}

      {/* MODAL 4: FEEDBACK & ALL REVIEWS MODAL */}
      {showFeedbackModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl p-5 max-w-md w-full space-y-3.5 shadow-2xl text-left border border-slate-200 relative">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-xl bg-[#E4EEFF] text-[#4A8DFF] flex items-center justify-center font-black">
                  <MessageSquare className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-[#223981]">
                    Share App Feedback & Reviews
                  </h3>
                  <p className="text-[10px] text-[#717983]">Sent directly to info@paisainminutes.com</p>
                </div>
              </div>
              <button onClick={() => setShowFeedbackModal(false)} className="p-1.5 hover:bg-slate-100 rounded-full text-[#717983]">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Official Support Email Badge */}
            <div className="p-2.5 bg-[#E4EEFF]/80 rounded-2xl border border-[#6FA8FF]/30 flex items-center justify-between text-xs">
              <span className="font-extrabold text-[#223981] flex items-center">
                ✉️ Support Email: <strong className="ml-1 text-[#2563EB]">info@paisainminutes.com</strong>
              </span>
              <a 
                href={`mailto:info@paisainminutes.com?subject=App Feedback from ${user.name}&body=${encodeURIComponent(feedbackText)}`}
                className="text-[10.5px] font-black text-white bg-[#2563EB] hover:bg-[#1D4ED8] px-2.5 py-1 rounded-xl transition"
              >
                Send Email
              </a>
            </div>

            {/* Sub-Tabs: Write Feedback / View All Fetched Reviews */}
            <div className="flex bg-slate-100 p-1 rounded-2xl text-xs font-extrabold">
              <button
                onClick={() => setFeedbackTab('write')}
                className={`flex-1 py-1.5 rounded-xl transition ${
                  feedbackTab === 'write' ? 'bg-white text-[#223981] shadow-xs' : 'text-[#717983]'
                }`}
              >
                ✍️ Write Review
              </button>
              <button
                onClick={() => setFeedbackTab('all')}
                className={`flex-1 py-1.5 rounded-xl transition ${
                  feedbackTab === 'all' ? 'bg-white text-[#223981] shadow-xs' : 'text-[#717983]'
                }`}
              >
                ⭐ Fetched Reviews ({allFeedbacks.length})
              </button>
            </div>

            {/* TAB 1: WRITE FEEDBACK FORM */}
            {feedbackTab === 'write' && (
              !feedbackSent ? (
                <form onSubmit={handleFeedbackSubmit} className="space-y-3 text-xs pt-1">
                  <p className="text-[#717983]">Tell us how we can improve your loan application experience!</p>
                  
                  {/* Rating Selector */}
                  <div className="flex items-center space-x-1 justify-center py-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setSelectedRating(star)}
                        className="p-1 transition transform hover:scale-110"
                      >
                        <span className={`text-xl ${star <= selectedRating ? 'text-amber-500' : 'text-slate-300'}`}>★</span>
                      </button>
                    ))}
                  </div>

                  <textarea
                    value={feedbackText}
                    onChange={(e) => setFeedbackText(e.target.value)}
                    rows={4}
                    placeholder="Type your valuable feedback here... (It will be sent to info@paisainminutes.com)"
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl font-semibold text-[#223981] outline-none focus:ring-2 focus:ring-[#4A8DFF]"
                  />
                  <button
                    type="submit"
                    className="w-full py-3 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-extrabold text-xs rounded-2xl shadow-md shadow-[#2563EB]/30 transition active:scale-95 flex items-center justify-center space-x-2"
                  >
                    <Send className="w-4 h-4" />
                    <span>Submit & Mail to info@paisainminutes.com</span>
                  </button>
                </form>
              ) : (
                <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-200 text-center space-y-1 my-2">
                  <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                  <h4 className="text-xs font-black text-emerald-900">Feedback Saved</h4>
                  <p className="text-[11px] text-emerald-700">Saved on this device, and your mail app was opened to send it to info@paisainminutes.com — please hit send there to complete it.</p>
                </div>
              )
            )}

            {/* TAB 2: FETCHED REVIEWS LIST */}
            {feedbackTab === 'all' && (
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {allFeedbacks.length === 0 && (
                  <p className="text-xs text-[#717983] text-center py-6">
                    No reviews submitted from this device yet.
                  </p>
                )}
                {allFeedbacks.map((item) => (
                  <div key={item.id} className="bg-slate-50 p-3 rounded-2xl border border-slate-200 space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-extrabold text-[#223981]">{item.name} ({item.phone})</span>
                      <span className="text-amber-500 font-bold">{"★".repeat(item.rating)}</span>
                    </div>
                    <p className="text-xs text-[#1E293B] font-semibold">{item.text}</p>
                    <div className="flex justify-between items-center text-[9.5px] text-[#717983] pt-1">
                      <span>Saved on this device</span>
                      <span>{item.date}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

          </div>
        </div>
      )}

      {/* MODAL 5: RBI DISCLOSURES MODAL */}
      {showRbiModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-5 max-w-md w-full space-y-3 shadow-2xl text-left border border-slate-200">
            <h3 className="text-sm font-extrabold text-[#223981]">Lending Partners Disclosure</h3>
            <p className="text-xs text-[#717983] leading-relaxed">
              Paisa in Minutes is a loan aggregator/facilitator — not a lender. We connect you with {partners.length} NBFC-registered
              lending partners ({partnerNamesList}).
              Each partner sets and discloses its own interest rate, tenure, and fees — review them on the partner's
              own offer before you proceed.
            </p>
            <div className="bg-slate-50 p-3 rounded-2xl text-[11px] text-[#223981] font-semibold">
              ✓ All {partners.length} partners cap loans at ₹1,00,000.<br/>
              ✓ Tenure 30–90 days (varies by partner), daily rate up to 0.8%–1.0%/day, APR 14%–24% p.a., processing fee 1%–3% of loan amount + 18% GST.<br/>
              Exact tenure, rate, and fees are decided by whichever partner you select — see their offer for final figures.
            </div>
            <button
              onClick={() => setShowRbiModal(false)}
              className="w-full py-2.5 bg-[#223981] text-white text-xs font-bold rounded-xl"
            >
              Close Disclosure
            </button>
          </div>
        </div>
      )}

      {/* MODAL: EDIT PROFILE */}
      {showEditProfileModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleSaveProfile} className="bg-white rounded-3xl p-5 max-w-sm w-full space-y-3 shadow-2xl text-left border border-slate-200">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-extrabold text-[#223981]">Edit Profile</h3>
              <button type="button" onClick={() => setShowEditProfileModal(false)} className="p-1 hover:bg-slate-100 rounded-lg">
                <X className="w-4 h-4 text-slate-500" />
              </button>
            </div>

            {editError && (
              <div className="p-2.5 bg-red-50 text-red-700 text-xs font-semibold rounded-xl border border-red-200 flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span>{editError}</span>
              </div>
            )}

            <div className="space-y-2.5">
              <div>
                <label className="block text-[11px] font-bold text-[#223981] mb-1">Full Name</label>
                <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-[#223981]" />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-[#223981] mb-1">Email</label>
                <input type="email" value={editEmail} onChange={(e) => setEditEmail(e.target.value)} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-[#223981]" />
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-bold text-[#223981] mb-1">City</label>
                  <input type="text" value={editCity} onChange={(e) => setEditCity(e.target.value)} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-[#223981]" />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[#223981] mb-1">State</label>
                  <input type="text" value={editState} onChange={(e) => setEditState(e.target.value)} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-[#223981]" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-bold text-[#223981] mb-1">Pincode</label>
                  <input type="text" maxLength={6} value={editPincode} onChange={(e) => setEditPincode(e.target.value.replace(/\D/g, ''))} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-[#223981]" />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[#223981] mb-1">PAN {user.panMasked ? `(${user.panMasked})` : ''}</label>
                  <input type="text" maxLength={10} placeholder={user.panMasked ? 'Change PAN' : 'ABCDE1234F'} value={editPan} onChange={(e) => setEditPan(e.target.value.toUpperCase())} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-[#223981] tracking-wider" />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSavingProfile}
              className="w-full py-3 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-extrabold rounded-2xl shadow transition flex items-center justify-center space-x-2 disabled:opacity-60"
            >
              {isSavingProfile ? (<><Loader2 className="w-4 h-4 animate-spin" /><span>Saving...</span></>) : (<span>Save Changes</span>)}
            </button>
          </form>
        </div>
      )}

      {/* MODAL: DELETE ACCOUNT */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-5 max-w-sm w-full space-y-3.5 shadow-2xl text-left border border-slate-200">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-extrabold text-rose-700">Delete Account</h3>
              {deleteStep !== 'done' && (
                <button onClick={() => setShowDeleteModal(false)} className="p-1 hover:bg-slate-100 rounded-lg">
                  <X className="w-4 h-4 text-slate-500" />
                </button>
              )}
            </div>

            {deleteStep === 'confirm' && (
              <>
                <div className="p-3 bg-rose-50 rounded-2xl border border-rose-200 text-[11px] text-rose-800 font-medium leading-relaxed">
                  This will permanently remove your name, email, PAN, city, state, pincode, and saved bank
                  accounts from our systems, and sign you out of every device. Loan applications already
                  submitted to lending partners are kept as financial records, as required for compliance,
                  but are no longer linked to your personal profile information.
                </div>
                {deleteError && (
                  <div className="p-2.5 bg-red-50 text-red-700 text-xs font-semibold rounded-xl border border-red-200 flex items-center space-x-2">
                    <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                    <span>{deleteError}</span>
                  </div>
                )}
                <button
                  onClick={handleSendDeleteOtp}
                  disabled={isSendingDeleteOtp}
                  className="w-full py-3 bg-rose-600 hover:bg-rose-700 text-white text-xs font-extrabold rounded-2xl shadow transition flex items-center justify-center space-x-2 disabled:opacity-60"
                >
                  {isSendingDeleteOtp ? (<><Loader2 className="w-4 h-4 animate-spin" /><span>Sending code...</span></>) : (<span>Send Confirmation Code to My Phone</span>)}
                </button>
              </>
            )}

            {deleteStep === 'otp' && (
              <form onSubmit={handleConfirmDelete} className="space-y-3">
                <p className="text-xs text-[#717983]">Enter the code sent to {user.phone || 'your phone'} to confirm deletion.</p>
                {deleteError && (
                  <div className="p-2.5 bg-red-50 text-red-700 text-xs font-semibold rounded-xl border border-red-200 flex items-center space-x-2">
                    <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                    <span>{deleteError}</span>
                  </div>
                )}
                <input
                  type="text"
                  maxLength={6}
                  value={deleteCode}
                  onChange={(e) => setDeleteCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="6-digit code"
                  className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold text-center tracking-widest"
                />
                <button
                  type="submit"
                  disabled={isDeletingAccount}
                  className="w-full py-3 bg-rose-600 hover:bg-rose-700 text-white text-xs font-extrabold rounded-2xl shadow transition flex items-center justify-center space-x-2 disabled:opacity-60"
                >
                  {isDeletingAccount ? (<><Loader2 className="w-4 h-4 animate-spin" /><span>Deleting...</span></>) : (<span>Permanently Delete My Account</span>)}
                </button>
              </form>
            )}

            {deleteStep === 'done' && (
              <div className="py-4 text-center space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                <p className="text-sm font-bold text-[#223981]">Your account has been deleted.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
