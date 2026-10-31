import React, { useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { BILINGUAL_TEXT } from '../../data/mockData';
import { ChevronRight, ChevronLeft, Sparkles, Building2, Loader2, AlertCircle } from 'lucide-react';

export const TrustCarousel = () => {
  const { setActiveTab, partners, partnersLoading, partnersError, reloadPartners, language } = useApp();
  const t = BILINGUAL_TEXT[language] || BILINGUAL_TEXT.en;
  const scrollRef = useRef(null);

  const handleScroll = (direction) => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -220 : 220,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="bg-white rounded-3xl p-4 sm:p-4.5 border border-slate-200/90 shadow-xs text-left space-y-3.5 my-2">
      {/* Header with Title and Scroll Controls */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
        <div>
          <div className="flex items-center space-x-1.5">
            <Building2 className="w-4 h-4 text-[#2563EB]" />
            <h3 className="text-xs sm:text-sm font-black text-[#223981]">
              {partnersLoading ? t.lendingPartnersTab : `${partners.length} ${t.lendingPartnersTab}`}
            </h3>
          </div>
          <p className="text-[10.5px] text-[#717983] mt-0.5">
            {language === 'hi' ? 'देखें कौन से पार्टनर आपकी मासिक सैलरी से मैच करते हैं' : 'See which partners match your monthly salary'}
          </p>
        </div>

        <div className="flex items-center space-x-1.5">
          <button
            type="button"
            onClick={() => handleScroll('left')}
            className="w-6 h-6 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Previous partners"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => handleScroll('right')}
            className="w-6 h-6 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Next partners"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setActiveTab('loans')}
            className="text-[11px] font-black text-[#2563EB] hover:text-[#1D4ED8] flex items-center group cursor-pointer ml-1"
          >
            <span>View All</span>
            <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </div>

      {/* Horizontal scrolling partner cards with clean, spacious container */}
      {partnersLoading ? (
        <div className="flex items-center justify-center py-6 text-slate-400">
          <Loader2 className="w-5 h-5 animate-spin mr-2" />
          <span className="text-xs font-semibold">Loading partners...</span>
        </div>
      ) : partnersError ? (
        <div className="flex flex-col items-center justify-center py-5 space-y-2">
          <div className="flex items-center text-amber-600">
            <AlertCircle className="w-4 h-4 mr-1.5" />
            <span className="text-xs font-semibold">{partnersError}</span>
          </div>
          <button
            type="button"
            onClick={reloadPartners}
            className="text-[11px] font-bold text-[#2563EB] hover:underline cursor-pointer"
          >
            Retry
          </button>
        </div>
      ) : (
        <div
          ref={scrollRef}
          className="flex space-x-3 overflow-x-auto pb-1 no-scrollbar scroll-smooth"
        >
          {partners.map((partner) => (
            <div
              key={partner.id}
              onClick={() => setActiveTab('loans')}
              className="flex-shrink-0 w-48 sm:w-52 bg-white p-3 rounded-2xl border border-slate-200/90 hover:border-[#2563EB]/70 hover:shadow-md transition-all duration-200 cursor-pointer shadow-2xs group flex flex-col justify-between"
            >
              <div>
                {/* Card Top: Logo on left, Tag on right */}
                <div className="flex items-center justify-between mb-2.5">
                  <div className="w-20 h-8 bg-white rounded-lg p-1 border border-slate-200/80 shadow-2xs flex items-center justify-center overflow-hidden flex-shrink-0">
                    {partner.logo && partner.logo.startsWith('/') ? (
                      <img
                        src={partner.logo}
                        alt={partner.name}
                        className="w-full h-full object-contain bg-white"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <span
                      style={{ display: partner.logo && partner.logo.startsWith('/') ? 'none' : 'flex' }}
                      className="w-full h-full items-center justify-center text-[10px] font-black text-[#223981]"
                    >
                      {partner.name.slice(0, 4)}
                    </span>
                  </div>
                  {partner.tag && (
                    <span className="text-[8.5px] font-extrabold text-[#2563EB] bg-blue-50/90 px-2 py-0.5 rounded-full border border-blue-200/60 whitespace-nowrap">
                      {partner.tag}
                    </span>
                  )}
                </div>

                {/* Partner Name & Max Loan Amount */}
                <h4 className="text-xs font-black text-[#1E293B] group-hover:text-[#2563EB] transition-colors truncate">
                  {partner.name}
                </h4>
                <p className="text-[11px] font-semibold text-slate-500 mt-0.5">
                  Up to <span className="font-extrabold text-[#223981]">{partner.maxLoanDisplay}</span>
                </p>
                <p className="text-[10px] font-bold text-emerald-600 mt-0.5">
                  {partner.interestRateDisplay ? `Rate: ${partner.interestRateDisplay}` : `APR: ${partner.aprDisplay}`}
                </p>
              </div>

              {/* Bottom Row: Min Salary properly placed in its own dedicated container */}
              <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px]">
                <span className="text-slate-500 font-semibold">{t.minSalaryLabel}</span>
                <span className="font-extrabold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/70 whitespace-nowrap">
                  {partner.minSalaryDisplay}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Bottom Quick Callout */}
      <div 
        onClick={() => setActiveTab('loans')}
        className="bg-blue-50/80 hover:bg-blue-50 p-2.5 sm:p-3 rounded-2xl flex items-center justify-between border border-blue-200/60 cursor-pointer transition-colors group"
      >
        <div className="flex items-center space-x-2 min-w-0 pr-2">
          <Sparkles className="w-4 h-4 text-[#2563EB] flex-shrink-0" />
          <p className="text-[10.5px] sm:text-[11px] font-bold text-[#1E3A8A] truncate">
            {language === 'hi' ? '₹25k से ₹50k+ तक की सभी ऑफर्स चेक करें' : 'Check all offers from ₹25k to ₹50k+ salary'}
          </p>
        </div>
        <span className="text-[10px] font-black text-white bg-[#2563EB] group-hover:bg-[#1D4ED8] px-2.5 py-1 rounded-xl shadow-2xs whitespace-nowrap flex-shrink-0 transition-colors">
          {t.compareOffers} →
        </span>
      </div>
    </div>
  );
};
