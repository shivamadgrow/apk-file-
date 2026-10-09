import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';
import { ShieldCheck, TrendingUp, AlertTriangle, CheckCircle, ArrowRight, Zap, RefreshCw, User, Phone, Sparkles, Loader2, Lock, Info } from 'lucide-react';
import confetti from 'canvas-confetti';

export const CreditScoreDetail = ({ onApplyClick }) => {
  const { user, currentPhone, saveCibilScore } = useApp();

  const [inputName, setInputName] = useState(() => {
    return user?.name && user.name !== 'Guest User' && !user.name.startsWith('User ') ? user.name : '';
  });
  const [consentGiven, setConsentGiven] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [noRecordFound, setNoRecordFound] = useState(false);
  const [showRefreshForm, setShowRefreshForm] = useState(false);

  const hasScore = !!(user && user.creditScore);
  const displayPhone = (user?.phone || currentPhone || '').replace(/\D/g, '').slice(-10);

  const handleCheckCibil = async (e) => {
    if (e) e.preventDefault();
    const trimmedName = inputName.trim();

    if (!trimmedName || trimmedName.length < 2) {
      setErrorMsg('Please enter your Full Legal Name as per official records.');
      return;
    }

    if (!consentGiven) {
      setErrorMsg('Please give your consent to fetch your credit bureau report before continuing.');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');
    setNoRecordFound(false);

    // This call never fabricates a score. It either returns a real score from the
    // confirmed backend's bureau integration, or an honest failure reason.
    const res = await api.checkCibil(trimmedName, consentGiven);

    if (res && res.ok) {
      saveCibilScore({
        name: trimmedName,
        phone: displayPhone,
        creditScore: res.creditScore,
        scoreCategory: res.scoreCategory,
        reportDate: res.reportDate || 'Today',
        factors: res.factors
      });

      try {
        confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
      } catch (e) {}

      setShowRefreshForm(false);
    } else if (res && res.reason === 'no_record_found') {
      setNoRecordFound(true);
    } else {
      setErrorMsg(res?.error || 'Unable to fetch your credit score right now. Please try again later.');
    }

    setIsLoading(false);
  };

  // If user does not have a credit score or explicitly clicked refresh form:
  if (!hasScore || showRefreshForm) {
    return (
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-md text-left space-y-4 my-3">
        {/* Header Icon & Title */}
        <div className="flex items-center space-x-3 pb-3 border-b border-slate-100">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#2563EB] to-[#1E40AF] text-white flex items-center justify-center font-black shadow-md flex-shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-200">
                100% Free Bureau Check
              </span>
              <span className="text-[10.5px] font-bold text-slate-400">Zero Impact</span>
            </div>
            <h2 className="text-base sm:text-lg font-black text-[#1E293B] mt-0.5 tracking-tight">
              Check Official CIBIL Credit Score
            </h2>
            <p className="text-xs text-[#717983]">
              Sirf apna Name aur Mobile Number enter karein score retrieve karne ke liye.
            </p>
          </div>
        </div>

        {/* Free CIBIL Form */}
        <form onSubmit={handleCheckCibil} className="space-y-3.5">
          {errorMsg && (
            <div className="p-3 bg-red-50 text-red-700 text-xs font-semibold rounded-2xl border border-red-200 flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0 text-red-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {noRecordFound && (
            <div className="p-3 bg-blue-50 text-blue-800 text-xs font-semibold rounded-2xl border border-blue-200 flex items-center space-x-2">
              <Info className="w-4 h-4 flex-shrink-0 text-blue-600" />
              <span>No credit bureau record was found for your profile yet. This usually means you have little to no credit history.</span>
            </div>
          )}

          {/* 1. Full Name */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-[#1E293B] flex items-center justify-between">
              <span>Full Name (As per PAN / Bureau Records)</span>
              <span className="text-[10px] text-slate-400 font-semibold">Mandatory</span>
            </label>
            <div className="relative flex items-center">
              <User className="absolute left-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={inputName}
                onChange={(e) => setInputName(e.target.value)}
                placeholder="e.g. Rahul Sharma"
                className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-bold text-[#1E293B] focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:bg-white transition"
              />
            </div>
          </div>

          {/* 2. Mobile Phone Number (read-only — the bureau check always uses your verified, logged-in number) */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-[#1E293B] flex items-center justify-between">
              <span>Mobile Phone Number</span>
              <span className="text-[10px] text-slate-400 font-semibold">Verified Number</span>
            </label>
            <div className="relative flex items-center">
              <div className="absolute left-3.5 flex items-center space-x-1 pointer-events-none">
                <Phone className="w-4 h-4 text-slate-400" />
                <span className="text-xs font-bold text-slate-600 ml-1">+91</span>
              </div>
              <input
                type="tel"
                value={displayPhone}
                disabled
                className="w-full pl-20 pr-3.5 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-xs sm:text-sm font-bold text-slate-500 tracking-wider cursor-not-allowed"
              />
            </div>
          </div>

          {/* Explicit Bureau Consent (required by the backend before any bureau pull) */}
          <label className="flex items-start space-x-2.5 p-3 bg-slate-50 rounded-2xl border border-slate-200 cursor-pointer">
            <input
              type="checkbox"
              checked={consentGiven}
              onChange={(e) => setConsentGiven(e.target.checked)}
              className="mt-0.5 w-4 h-4 accent-[#2563EB] cursor-pointer flex-shrink-0"
            />
            <span className="text-[11px] text-slate-700 font-medium leading-relaxed">
              I consent to Paisa in Minutes fetching my credit information from the credit bureau for the purpose of this check.
            </span>
          </label>

          {/* Trust Disclaimer */}
          <div className="p-3 bg-amber-50/80 rounded-2xl border border-amber-200/80 text-[11px] text-amber-900 font-medium space-y-1">
            <div className="flex items-center space-x-1.5 font-bold text-amber-950">
              <Lock className="w-3.5 h-3.5 text-amber-700" />
              <span>Soft Credit Inquiry</span>
            </div>
            <p className="text-[10.5px] text-amber-800 leading-relaxed">
              Checking your score via Paisa in Minutes does <strong>NOT</strong> reduce or affect your CIBIL score in any way.
            </p>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading || !consentGiven}
            className="w-full py-3.5 bg-gradient-to-r from-[#2563EB] to-[#1D4ED8] hover:from-[#1D4ED8] hover:to-[#1E40AF] text-white text-xs sm:text-sm font-black rounded-2xl shadow-md shadow-blue-500/25 flex items-center justify-center space-x-2 transition active:scale-98 cursor-pointer disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Fetching Score from CIBIL Bureau...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Check Free CIBIL Score Now</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          {hasScore && (
            <button
              type="button"
              onClick={() => setShowRefreshForm(false)}
              className="w-full text-center text-xs font-bold text-slate-500 hover:text-slate-800 pt-1"
            >
              Cancel and view current report
            </button>
          )}
        </form>
      </div>
    );
  }

  // Active CIBIL Report Display Screen
  return (
    <div className="space-y-4 my-3 text-left">
      {/* Score Header Card */}
      <div className="bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#1E3A8A] text-white p-5 sm:p-6 rounded-3xl shadow-xl relative overflow-hidden border border-white/10">
        <div className="absolute top-0 right-0 w-44 h-44 bg-[#2563EB]/20 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-start justify-between relative z-10">
          <div>
            <span className="text-[9.5px] font-black uppercase bg-emerald-500/20 text-emerald-300 px-2.5 py-0.5 rounded-full border border-emerald-400/30">
              Bureau Score
            </span>
            <h2 className="text-xl sm:text-2xl font-black mt-1 tracking-tight">
              CIBIL Credit Score Analysis
            </h2>
            <p className="text-xs text-blue-200 mt-0.5">
              Applicant: <strong className="text-white font-bold">{user.name}</strong> • Phone: <strong className="text-white font-bold">{user.phone || `+91 ${currentPhone}`}</strong>
            </p>
            <p className="text-[11px] text-slate-400 mt-1">
              Verified: {user.lastChecked || 'Today'}
            </p>
          </div>

          <div className="text-right flex-shrink-0">
            <p className="text-4xl sm:text-5xl font-black text-amber-300 tracking-tight leading-none">
              {user.creditScore}
            </p>
            {user.scoreCategory && (
              <span className="inline-block mt-1.5 text-xs font-extrabold bg-emerald-600 text-white px-3 py-0.5 rounded-full shadow-sm">
                {user.scoreCategory}
              </span>
            )}
          </div>
        </div>

        {/* Score Meter Visual Bar */}
        <div className="mt-4 pt-3 border-t border-white/10">
          <div className="flex justify-between text-[10px] font-extrabold text-slate-400 mb-1">
            <span>Poor (300)</span>
            <span>Average (650)</span>
            <span className="text-emerald-300">Excellent (750 - 900)</span>
          </div>
          <div className="w-full h-2.5 bg-white/15 rounded-full overflow-hidden flex">
            <div style={{ width: '35%' }} className="bg-red-400 h-full" />
            <div style={{ width: '25%' }} className="bg-amber-400 h-full" />
            <div style={{ width: '40%' }} className="bg-emerald-400 h-full" />
          </div>
        </div>

        {/* Refresh Button */}
        <div className="mt-3 flex justify-end">
          <button
            type="button"
            onClick={() => setShowRefreshForm(true)}
            className="inline-flex items-center text-[11px] font-bold text-blue-200 hover:text-white transition cursor-pointer"
          >
            <RefreshCw className="w-3 h-3 mr-1" />
            <span>Re-check / Refresh Score</span>
          </button>
        </div>
      </div>

      {/* Credit Factors Breakdown — shown only when the bureau response actually included factor data */}
      {user.factors && Object.keys(user.factors).length > 0 && (
        <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/90 shadow-sm space-y-3">
          <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
            Credit Score Impact Factors
          </h3>
          <div className="space-y-2 text-xs">
            {user.factors.scoreFactors && (
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="font-bold text-slate-800 mb-1">Score Factors</p>
                <p className="text-[11px] text-slate-600 whitespace-pre-wrap">{JSON.stringify(user.factors.scoreFactors)}</p>
              </div>
            )}
            {user.factors.accountsSummary && (
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="font-bold text-slate-800 mb-1">Accounts Summary</p>
                <p className="text-[11px] text-slate-600 whitespace-pre-wrap">{JSON.stringify(user.factors.accountsSummary)}</p>
              </div>
            )}
            {user.factors.inquiryHistory && (
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="font-bold text-slate-800 mb-1">Inquiry History</p>
                <p className="text-[11px] text-slate-600 whitespace-pre-wrap">{JSON.stringify(user.factors.inquiryHistory)}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* CTA to explore real lender offers — no specific pre-approved amount is claimed here, since no backend currently returns one */}
      <div className="bg-gradient-to-r from-amber-500 to-amber-600 text-slate-900 p-4 sm:p-5 rounded-3xl shadow-md flex items-center justify-between">
        <div>
          <h4 className="text-sm sm:text-base font-black mt-1">
            Explore Loan Offers
          </h4>
          <p className="text-[11px] font-semibold text-slate-900/90">
            See lenders you may be eligible for based on your profile
          </p>
        </div>
        <button
          type="button"
          onClick={onApplyClick}
          className="px-4 py-2.5 bg-slate-950 hover:bg-black text-white text-xs font-black rounded-2xl shadow transition whitespace-nowrap ml-3 cursor-pointer"
        >
          View Offers →
        </button>
      </div>
    </div>
  );
};
