import React from 'react';
import { useApp } from '../../context/AppContext';
import { PARTNER_NBFCS } from '../../data/mockData';
import { ShieldCheck, ChevronRight, Sparkles, Building2 } from 'lucide-react';

export const TrustCarousel = () => {
  const { setActiveTab } = useApp();

  return (
    <div className="bg-white rounded-3xl p-4.5 border border-slate-200/90 shadow-xs text-left space-y-3 my-2">
      <div className="flex items-center justify-between pb-1 border-b border-slate-100">
        <div>
          <div className="flex items-center space-x-1.5">
            <Building2 className="w-4 h-4 text-[#2563EB]" />
            <h3 className="text-xs sm:text-sm font-black text-[#223981]">
              9 Verified Lending Partners
            </h3>
          </div>
          <p className="text-[10px] text-[#717983]">
            Instant approval based on your monthly salary criteria
          </p>
        </div>
        <button
          onClick={() => setActiveTab('loans')}
          className="text-[11px] font-black text-[#2563EB] hover:text-[#1D4ED8] flex items-center group cursor-pointer"
        >
          <span>View All</span>
          <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>

      {/* Horizontal scrolling partner chips / cards */}
      <div className="flex space-x-2.5 overflow-x-auto pb-1.5 scrollbar-thin scrollbar-thumb-slate-200">
        {PARTNER_NBFCS.map((partner) => (
          <div
            key={partner.id}
            onClick={() => setActiveTab('loans')}
            className="flex-shrink-0 w-36 bg-gradient-to-b from-slate-50 to-white p-2.5 rounded-2xl border border-slate-200/80 hover:border-[#4A8DFF] transition-all cursor-pointer shadow-2xs hover:shadow-xs group"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="w-16 h-8 bg-white rounded-lg p-1 border border-slate-200 shadow-2xs flex items-center justify-center overflow-hidden flex-shrink-0">
                {partner.logo && partner.logo.startsWith('/') ? (
                  <img src={partner.logo} alt={partner.name} className="w-full h-full object-contain bg-white" />
                ) : (
                  <span className="text-[9px] font-black text-[#223981]">{partner.name.slice(0, 4)}</span>
                )}
              </div>
              <span className="text-[8.5px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-full border border-emerald-200">
                Min {partner.minSalaryDisplay}
              </span>
            </div>
            <p className="text-xs font-black text-[#223981] truncate group-hover:text-[#2563EB] transition-colors">
              {partner.name}
            </p>
            <p className="text-[10px] text-slate-500 font-semibold mt-0.5">
              Up to <span className="font-bold text-[#223981]">{partner.maxLoanDisplay}</span>
            </p>
          </div>
        ))}
      </div>

      {/* Bottom Quick Callout */}
      <div 
        onClick={() => setActiveTab('loans')}
        className="bg-[#E4EEFF]/70 hover:bg-[#E4EEFF] p-2.5 rounded-2xl flex items-center justify-between border border-[#6FA8FF]/30 cursor-pointer transition"
      >
        <div className="flex items-center space-x-2">
          <Sparkles className="w-3.5 h-3.5 text-[#2563EB]" />
          <p className="text-[10.5px] font-bold text-[#223981]">
            Salary ₹25k se lekar ₹50k+ tak ke sabhi offers check karein
          </p>
        </div>
        <span className="text-[10px] font-black text-white bg-[#2563EB] px-2 py-0.5 rounded-lg shadow-2xs">
          Compare
        </span>
      </div>
    </div>
  );
};
