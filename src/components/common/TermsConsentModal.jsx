import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ShieldCheck, Phone, User, X } from 'lucide-react';

// This modal must only describe data practices the app actually performs. It
// previously claimed to collect SMS content, installed-app metadata, device/MAC
// fingerprints, and camera-based KYC capture — none of which exist anywhere in this
// codebase. A Data Safety / privacy disclosure that doesn't match real behavior is a
// compliance and trust problem, so this only lists what src/services/api.js and the
// loan/credit/profile screens actually send to the backend.
export const TermsConsentModal = ({ isOpenManually = false, onCloseManual = null }) => {
  const { hasAcceptedTerms, acceptTerms } = useApp();
  const [isChecked, setIsChecked] = useState(false);

  if (hasAcceptedTerms && !isOpenManually) return null;

  const handleAgreeAndContinue = () => {
    if (!isChecked && !isOpenManually) return;
    acceptTerms();
    if (onCloseManual) onCloseManual();
  };

  const dataItems = [
    {
      icon: Phone,
      iconColor: 'bg-blue-50 text-[#2563EB] border-blue-100',
      title: 'Mobile Number',
      description: 'Used to send a one-time password (OTP) to verify your identity and create your account.'
    },
    {
      icon: User,
      iconColor: 'bg-indigo-50 text-indigo-600 border-indigo-100',
      title: 'Profile & Loan Details',
      description: 'Name, email, PAN, income, and loan details you enter are sent to our backend to create your profile and loan application, and shared with the lending partner you choose to apply with.'
    },
    {
      icon: ShieldCheck,
      iconColor: 'bg-emerald-50 text-emerald-600 border-emerald-100',
      title: 'Credit Bureau Check',
      description: 'Only performed when you explicitly give consent on the Credit Score screen, to fetch your score from the credit bureau.'
    }
  ];

  return (
    <div className="fixed inset-0 z-[100] bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto animate-fade-in">
      <div className="bg-[#F8FAFC] rounded-3xl max-w-lg w-full max-h-[96vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden relative text-left">

        {/* Header */}
        <div className="p-5 pb-3 bg-white border-b border-slate-200/80">
          <div className="flex items-start justify-between">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-[#2563EB] mb-2 shadow-xs">
              <ShieldCheck className="w-7 h-7" />
            </div>
            {isOpenManually && (
              <button
                onClick={onCloseManual}
                className="p-2 rounded-full hover:bg-slate-100 text-slate-500 transition"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
          <h2 className="text-xl font-black text-[#1E293B] tracking-tight">
            Terms & Data Use
          </h2>
          <p className="text-xs text-[#64748B] leading-relaxed font-medium mt-1">
            Here's exactly what Paisa in Minutes collects and why.
          </p>
        </div>

        {/* Data Use Cards */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3.5 bg-slate-50/60">
          {dataItems.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs space-y-2 transition hover:border-slate-300"
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-9 h-9 rounded-xl border flex items-center justify-center flex-shrink-0 ${item.iconColor}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-extrabold text-[#1E293B]">
                    {item.title}
                  </h3>
                </div>
                <p className="text-xs text-[#64748B] leading-relaxed font-normal pl-0.5">
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Sticky Footer with Links, Checkbox & Agree Button */}
        <div className="p-4 sm:p-5 bg-white border-t border-slate-200/80 space-y-3.5">
          <div className="text-[11.5px] text-[#64748B] leading-snug">
            See our{' '}
            <a
              href="https://paisainminutes.com/privacy-policy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#2563EB] font-bold underline hover:text-[#1D4ED8] inline-flex items-center"
            >
              Privacy Policy
            </a>
            {', '}
            <a
              href="https://paisainminutes.com/terms-and-conditions"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#2563EB] font-bold underline hover:text-[#1D4ED8] inline-flex items-center"
            >
              Terms & Conditions
            </a>
            {' and '}
            <a
              href="https://paisainminutes.com/partner-terms"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#2563EB] font-bold underline hover:text-[#1D4ED8] inline-flex items-center"
            >
              Partner Terms
            </a>
            .
          </div>

          <label className="flex items-start space-x-2.5 cursor-pointer select-none text-[11.5px] text-[#334155] font-semibold leading-tight">
            <input
              type="checkbox"
              checked={isChecked || isOpenManually}
              onChange={(e) => setIsChecked(e.target.checked)}
              className="w-4 h-4 rounded border-slate-300 text-amber-500 focus:ring-amber-400 mt-0.5 cursor-pointer accent-[#F59E0B]"
            />
            <span>
              I have read and agree to the collection and use of my data as described above.
            </span>
          </label>

          <button
            onClick={handleAgreeAndContinue}
            disabled={!isChecked && !isOpenManually}
            className={`w-full py-3.5 px-4 rounded-2xl font-black text-sm transition-all duration-200 shadow-md flex items-center justify-center space-x-2 ${
              (isChecked || isOpenManually)
                ? 'bg-[#F59E0B] hover:bg-[#D97706] text-white active:scale-[0.99] cursor-pointer'
                : 'bg-[#FDE68A] text-[#92400E]/50 cursor-not-allowed shadow-none'
            }`}
          >
            <span>{isOpenManually ? 'Close & Save' : 'I Agree & Continue'}</span>
          </button>
        </div>

      </div>
    </div>
  );
};
