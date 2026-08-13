import React from 'react';
import { useApp } from '../../context/AppContext';
import { BILINGUAL_TEXT } from '../../data/mockData';
import { ArrowRight, ShieldCheck, Zap, Lock, Clock, Sparkles } from 'lucide-react';

export const HeroBanner = ({ onApplyClick }) => {
  const { language } = useApp();
  const t = BILINGUAL_TEXT[language] || BILINGUAL_TEXT.en;

  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-[#E4EEFF] via-[#F0F5FF] to-white rounded-3xl p-5 border border-[#6FA8FF]/30 shadow-sm my-2 text-left space-y-4">
      {/* Decorative Light Glow */}
      <div className="absolute -top-12 -right-12 w-48 h-48 bg-[#6FA8FF]/20 rounded-full blur-3xl pointer-events-none" />

      {/* Top Tagline Pill Badge */}
      <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-[#E4EEFF] text-[#4A8DFF] border border-[#6FA8FF]/40 shadow-2xs">
        <Sparkles className="w-3.5 h-3.5 mr-1.5 text-[#4A8DFF]" />
        <span>{t.tagline}</span>
      </div>

      {/* Two-Tone Bold Headline */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#223981] leading-tight tracking-tight">
          Credit Limit & Loans...{' '}
          <span className="text-[#4A8DFF] underline decoration-[#6FA8FF]/40 decoration-4">
            Minutes Mein.
          </span>
        </h1>
        <p className="text-xs text-[#717983] font-medium mt-1.5 leading-relaxed">
          Instant pre-approved multi-lender offers, 100% paperless e-KYC & disbursal directly into your bank account.
        </p>
      </div>

      {/* 3 White Metric Cards */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-white p-3 rounded-2xl border border-[#E4EEFF] text-center shadow-2xs">
          <Clock className="w-5 h-5 text-[#4A8DFF] mx-auto mb-1" />
          <p className="text-[11px] font-extrabold text-[#223981]">8 Mins</p>
          <p className="text-[9.5px] text-[#717983] font-semibold">Disbursal</p>
        </div>

        <div className="bg-white p-3 rounded-2xl border border-[#E4EEFF] text-center shadow-2xs">
          <Zap className="w-5 h-5 text-amber-500 mx-auto mb-1" />
          <p className="text-[11px] font-extrabold text-[#223981]">Up to ₹15L</p>
          <p className="text-[9.5px] text-[#717983] font-semibold">Instant Limit</p>
        </div>

        <div className="bg-white p-3 rounded-2xl border border-[#E4EEFF] text-center shadow-2xs">
          <ShieldCheck className="w-5 h-5 text-emerald-600 mx-auto mb-1" />
          <p className="text-[11px] font-extrabold text-[#223981]">RBI Partner</p>
          <p className="text-[9.5px] text-[#717983] font-semibold">Lenders</p>
        </div>
      </div>

      {/* Primary Action Button & Security Badge */}
      <div className="flex items-center space-x-2.5 pt-1">
        <button
          type="button"
          onClick={onApplyClick}
          className="flex-1 py-3 px-5 bg-[#4A8DFF] hover:bg-[#223981] text-white text-xs sm:text-sm font-extrabold rounded-2xl shadow-md shadow-[#4A8DFF]/30 flex items-center justify-center space-x-2 transition-all active:scale-[0.98]"
        >
          <span>Apply Now</span>
          <ArrowRight className="w-4 h-4" />
        </button>

        <div className="flex items-center text-emerald-700 text-[11px] font-bold px-3 py-3 bg-emerald-50 rounded-2xl border border-emerald-200/80">
          <Lock className="w-3.5 h-3.5 mr-1" />
          <span>100% Safe & Secure</span>
        </div>
      </div>
    </div>
  );
};
