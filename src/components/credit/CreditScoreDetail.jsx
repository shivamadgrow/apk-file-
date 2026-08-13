import React from 'react';
import { useApp } from '../../context/AppContext';
import { ShieldCheck, TrendingUp, AlertTriangle, CheckCircle, ArrowRight, Zap, RefreshCw } from 'lucide-react';

export const CreditScoreDetail = ({ onApplyClick }) => {
  const { user, currentPhone, setIsAuthOpen } = useApp();

  if (!currentPhone || !user || !user.creditScore) {
    return (
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm text-center space-y-4 my-3 text-left">
        <div className="w-12 h-12 rounded-2xl bg-[#E4EEFF] text-[#2563EB] flex items-center justify-center mx-auto font-black">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <h2 className="text-base font-extrabold text-[#223981] text-center">Bureau Credit Score Verification Required</h2>
        <p className="text-xs text-[#717983] text-center max-w-xs mx-auto">
          Under RBI Digital Lending Guidelines, explicit consent & PAN verification is required before retrieving your official bureau credit score.
        </p>
        <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-900 font-semibold space-y-1 text-left">
          <p>🔒 100% RBI Compliant & Encrypted Bureau Inquiry</p>
          <p className="text-[10.5px] text-amber-800 font-normal">Checking your score via Paisa in Minutes does NOT hurt your CIBIL score.</p>
        </div>
        <button
          onClick={() => setIsAuthOpen(true)}
          className="w-full py-3.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-bold rounded-2xl shadow transition"
        >
          Verify Mobile & Check Free Bureau Score
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4 my-3 text-left">
      {/* Score Header Card */}
      <div className="bg-gradient-to-r from-paisa-navy via-[#17275A] to-paisa-primary text-white p-5 rounded-3xl shadow-lg relative overflow-hidden">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] font-extrabold uppercase bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-400/30">
              Official Bureau Score
            </span>
            <h2 className="text-xl font-extrabold mt-1">CIBIL Credit Score Analysis</h2>
            <p className="text-xs text-paisa-light">Updated: {user.lastChecked}</p>
          </div>
          <div className="text-right">
            <p className="text-4xl font-black text-amber-300 tracking-tight">{user.creditScore}</p>
            <span className="text-xs font-bold bg-emerald-500 text-white px-2.5 py-0.5 rounded-full">
              {user.scoreCategory}
            </span>
          </div>
        </div>
      </div>

      {/* Credit Factors Breakdown */}
      <div className="bg-white rounded-3xl p-4 border border-paisa-light shadow-sm space-y-3">
        <h3 className="text-xs font-extrabold text-paisa-navy uppercase tracking-wider">
          Credit Score Impact Factors
        </h3>

        <div className="space-y-2 text-xs">
          {/* Payment History */}
          <div className="p-3 bg-slate-50 rounded-2xl flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-emerald-500" />
              <div>
                <p className="font-bold text-paisa-navy">Payment History (High Impact)</p>
                <p className="text-[10px] text-paisa-secondaryText">0 Late Payments in 24 Months</p>
              </div>
            </div>
            <span className="font-black text-emerald-600 text-xs">100% Excellent</span>
          </div>

          {/* Credit Utilization */}
          <div className="p-3 bg-slate-50 rounded-2xl flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-paisa-primary" />
              <div>
                <p className="font-bold text-paisa-navy">Credit Limit Utilization</p>
                <p className="text-[10px] text-paisa-secondaryText">₹35,000 used of ₹2,50,000 limit</p>
              </div>
            </div>
            <span className="font-black text-paisa-primary text-xs">14% (Optimal)</span>
          </div>

          {/* Credit Inquiries */}
          <div className="p-3 bg-slate-50 rounded-2xl flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-5 h-5 text-indigo-600" />
              <div>
                <p className="font-bold text-paisa-navy">Hard Bureau Inquiries</p>
                <p className="text-[10px] text-paisa-secondaryText">Only 1 inquiry in last 90 days</p>
              </div>
            </div>
            <span className="font-black text-emerald-600 text-xs">Low Risk</span>
          </div>
        </div>
      </div>

      {/* Pre-approved Loan Banner based on Score */}
      <div className="bg-gradient-to-br from-amber-500 to-amber-600 text-paisa-navy p-4 rounded-3xl shadow-md flex items-center justify-between">
        <div>
          <span className="text-[10px] font-black uppercase bg-white/30 text-paisa-navy px-2 py-0.5 rounded-full">
            SCORE BASED MATCH
          </span>
          <h4 className="text-sm font-extrabold mt-1">Pre-Approved ₹5,00,000 Personal Loan</h4>
          <p className="text-[11px] font-medium text-paisa-navy/90">Instant disbursal with Aditya Birla & Tata Capital</p>
        </div>
        <button
          onClick={onApplyClick}
          className="px-4 py-2.5 bg-paisa-navy hover:bg-black text-white text-xs font-bold rounded-2xl shadow transition"
        >
          Claim Now
        </button>
      </div>
    </div>
  );
};
