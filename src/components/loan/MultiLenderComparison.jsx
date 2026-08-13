import React from 'react';
import { PARTNER_NBFCS } from '../../data/mockData';
import { Shield, Lock, Zap, Landmark, Star, CheckCircle2, ArrowRight, Lightbulb, Sparkles } from 'lucide-react';

export const MultiLenderComparison = ({ loanAmount, tenureMonths, onSelectOffer }) => {
  const handleApplyClick = (nbfc) => {
    // Open Master Outbound Link with Paisa in Minutes UTM tags
    if (nbfc.outboundUrl) {
      window.open(nbfc.outboundUrl, '_blank');
    }
    if (onSelectOffer) {
      onSelectOffer(nbfc);
    }
  };

  return (
    <div className="space-y-4 my-3 text-left">

      {/* Top Header Banner matching user light ice blue screenshot */}
      <div className="bg-gradient-to-b from-[#E4EEFF] via-[#F0F5FF] to-white text-[#223981] p-5 sm:p-6 rounded-3xl text-center space-y-3 border border-[#6FA8FF]/30 shadow-sm relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-48 h-48 bg-[#6FA8FF]/20 rounded-full blur-3xl pointer-events-none" />

        {/* Main Title & Subtitle */}
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-[#223981] tracking-tight">
            Select Your Loan Provider for <span className="text-[#4A8DFF] underline decoration-[#6FA8FF]/40 decoration-4">Fast Approval</span>
          </h1>
          <p className="text-xs text-[#717983] font-medium mt-1.5 max-w-lg mx-auto leading-relaxed">
            Based on your mobile profile, you are pre-matched with India's top RBI-registered lending partners below. Choose your preferred offer and click <strong className="text-[#223981]">"Apply Now"</strong> for instant disbursal.
          </p>
        </div>

        {/* 3 Security Badges */}
        <div className="grid grid-cols-3 gap-2 pt-2 text-left">
          <div className="bg-white p-2.5 rounded-2xl border border-[#E4EEFF] shadow-2xs flex items-center space-x-2">
            <Lock className="w-4 h-4 text-[#4A8DFF] flex-shrink-0" />
            <div>
              <p className="text-[10.5px] font-extrabold text-[#223981] leading-none">100% Encrypted</p>
              <p className="text-[9px] text-[#717983] font-semibold mt-0.5">Bank-grade data security</p>
            </div>
          </div>

          <div className="bg-white p-2.5 rounded-2xl border border-[#E4EEFF] shadow-2xs flex items-center space-x-2">
            <Zap className="w-4 h-4 text-amber-500 flex-shrink-0" />
            <div>
              <p className="text-[10.5px] font-extrabold text-[#223981] leading-none">Instant Disbursal</p>
              <p className="text-[9px] text-[#717983] font-semibold mt-0.5">Direct bank account credit</p>
            </div>
          </div>

          <div className="bg-white p-2.5 rounded-2xl border border-[#E4EEFF] shadow-2xs flex items-center space-x-2">
            <Landmark className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <div>
              <p className="text-[10.5px] font-extrabold text-[#223981] leading-none">RBI Registered</p>
              <p className="text-[9px] text-[#717983] font-semibold mt-0.5">Verified Lending Partners</p>
            </div>
          </div>
        </div>
      </div>

      {/* Guidance Box for Loan Comparison */}
      <div className="bg-[#E4EEFF]/80 border border-[#6FA8FF]/40 p-3.5 rounded-2xl flex items-start space-x-2.5 text-xs text-[#223981]">
        <Lightbulb className="w-4 h-4 text-[#4A8DFF] flex-shrink-0 mt-0.5" />
        <p className="font-semibold leading-relaxed">
          Compare offers from multiple lending partners below and choose the one that suits you best.
        </p>
      </div>

      {/* 6 Registered Companies Grid Cards matching screenshot */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {PARTNER_NBFCS.map((nbfc) => (
          <div
            key={nbfc.id}
            className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/90 shadow-xs hover:shadow-md hover:border-[#4A8DFF]/60 transition-all duration-300 flex flex-col justify-between space-y-3 relative group"
          >
            {/* Header: Company Logo, Title, and Tag Badge */}
            <div>
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center space-x-2.5">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 p-1 flex items-center justify-center font-black text-xs text-[#223981] border border-slate-200 flex-shrink-0">
                    {nbfc.name.slice(0, 4)}
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-[#223981] group-hover:text-[#4A8DFF] transition-colors">
                      {nbfc.name}
                    </h3>
                    <div className="flex items-center space-x-1 text-amber-500 text-xs mt-0.5">
                      <Star className="w-3.5 h-3.5 fill-amber-500" />
                      <span className="font-extrabold">{nbfc.rating}</span>
                      <span className="text-[#717983] text-[10.5px]">/ 5.0</span>
                    </div>
                  </div>
                </div>

                {/* Tag Badge matching screenshot */}
                <span className="text-[10px] font-extrabold bg-amber-50 text-amber-800 border border-amber-200/80 px-2.5 py-0.5 rounded-full flex items-center">
                  🔥 {nbfc.tag}
                </span>
              </div>

              {/* Core Offer Box: Max Loan & Interest */}
              <div className="grid grid-cols-2 gap-2 bg-[#F8FAFC] p-3 rounded-2xl border border-slate-200/60 my-3 text-left">
                <div>
                  <span className="text-[9.5px] font-bold text-[#717983] uppercase block">MAX LOAN</span>
                  <span className="text-sm font-black text-[#4A8DFF]">{nbfc.maxLoanDisplay}</span>
                </div>
                <div className="border-l border-slate-200 pl-2.5">
                  <span className="text-[9.5px] font-bold text-[#717983] uppercase block">INTEREST</span>
                  <span className="text-xs font-black text-[#1E293B]">{nbfc.interestRateDisplay}</span>
                </div>
              </div>

              {/* Checklist Features */}
              <div className="space-y-1.5 my-2">
                {nbfc.features.map((feat, fIdx) => (
                  <div key={fIdx} className="flex items-center text-xs text-[#1E293B] font-semibold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 mr-2 flex-shrink-0" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Direct Apply Now Button */}
            <button
              onClick={() => handleApplyClick(nbfc)}
              className="w-full py-3 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-extrabold text-xs sm:text-sm rounded-2xl shadow-md shadow-[#2563EB]/30 flex items-center justify-center space-x-2 transition active:scale-[0.98] mt-2"
            >
              <span>Apply Now</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
