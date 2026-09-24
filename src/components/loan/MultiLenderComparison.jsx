import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { PARTNER_NBFCS } from '../../data/mockData';
import { 
  ShieldCheck, Lock, Zap, Star, CheckCircle2, ArrowRight, 
  Sparkles, AlertCircle, Sliders, Check
} from 'lucide-react';

export const MultiLenderComparison = ({ loanAmount = 350000, tenureMonths = 36, userSalary = 25000, onSelectOffer }) => {
  const { user, currentPhone, setIsAuthOpen } = useApp();
  const [salary, setSalary] = useState(userSalary || 25000);
  const [inputValue, setInputValue] = useState(String(userSalary || 25000));

  useEffect(() => {
    if (userSalary) {
      setSalary(userSalary);
      setInputValue(String(userSalary));
    }
  }, [userSalary]);

  const handleInputChange = (e) => {
    const raw = e.target.value.replace(/\D/g, ''); // only allow digits
    setInputValue(raw);
    const num = Number(raw);
    if (!isNaN(num)) {
      setSalary(num);
    }
  };

  const handlePresetClick = (val) => {
    setSalary(val);
    setInputValue(String(val));
  };

  const handleSliderChange = (e) => {
    const val = Number(e.target.value);
    setSalary(val);
    setInputValue(String(val));
  };

  const handleApplyClick = (nbfc) => {
    let targetUrl = nbfc.outboundUrl || '';

    // Get phone number from user or localStorage
    const rawPhone = user?.phone || currentPhone || localStorage.getItem('paisainminute_current_phone') || '';
    const cleanPhone = rawPhone.replace(/\D/g, '').slice(-10);

    // Get or create unique lead ID
    let leadId = user?.leadId || localStorage.getItem('paisainminute_lead_id');
    if (!leadId) {
      leadId = 'PIM' + Date.now().toString().slice(-6) + Math.floor(10 + Math.random() * 90);
      localStorage.setItem('paisainminute_lead_id', leadId);
    }

    // If user is not logged in yet, prompt for mobile login to capture phone
    if (!cleanPhone) {
      localStorage.setItem('paisainminute_pending_redirect', JSON.stringify({
        partner: nbfc.id,
        urlTemplate: targetUrl,
        leadId
      }));
      setIsAuthOpen(true);
      return;
    }

    // Substitute {LEAD_ID} and {PHONE}
    targetUrl = targetUrl
      .replace('{LEAD_ID}', encodeURIComponent(leadId))
      .replace('{PHONE}', encodeURIComponent(cleanPhone));

    window.open(targetUrl, '_blank');

    if (onSelectOffer) {
      onSelectOffer({ ...nbfc, resolvedUrl: targetUrl, leadId, phone: cleanPhone });
    }
  };

  const eligibleLenders = PARTNER_NBFCS.filter(n => (salary || 0) >= n.minSalary);
  const ineligibleLenders = PARTNER_NBFCS.filter(n => (salary || 0) < n.minSalary);

  const salaryPresets = [
    { label: '₹25,000', val: 25000 },
    { label: '₹30,000', val: 30000 },
    { label: '₹35,000', val: 35000 },
    { label: '₹40,000', val: 40000 },
    { label: '₹45,000', val: 45000 },
    { label: '₹50,000+', val: 50000 },
  ];

  return (
    <div className="space-y-4 my-2 text-left w-full">

      {/* 1. MASTER COMMAND CENTER: Salary Filter */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#1E3A8A] via-[#1E40AF] to-[#2563EB] text-white rounded-3xl p-5 sm:p-6 shadow-xl border border-white/15">
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        
        {/* Header line */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/15">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-black uppercase tracking-wider bg-white/20 text-white px-2.5 py-0.5 rounded-full backdrop-blur-xs">
                Instant Approval
              </span>
              <span className="text-[11px] font-bold text-blue-200">
                9 Regulated Partners
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-black mt-1 tracking-tight text-white">
              Salary Eligibility Check
            </h2>
            <p className="text-xs text-blue-100/90 font-medium">
              Apni take-home salary manually enter karein ya select karein
            </p>
          </div>

          {/* Current Salary Badge */}
          <div className="bg-white/15 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/20 flex sm:flex-col items-center sm:items-end justify-between self-start sm:self-auto min-w-[140px]">
            <span className="text-[10px] uppercase font-bold text-blue-200 tracking-wider">
              Entered Salary
            </span>
            <span className="text-base sm:text-lg font-black text-white">
              ₹{(salary || 0).toLocaleString()}<span className="text-xs text-blue-200 font-semibold">/mo</span>
            </span>
          </div>
        </div>

        {/* PROMINENT MANUAL SALARY INPUT BOX */}
        <div className="bg-white/10 backdrop-blur-md p-3.5 sm:p-4 rounded-2xl border border-white/25 mt-3.5 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <label htmlFor="manual-salary-input" className="font-extrabold text-white flex items-center space-x-1.5 cursor-pointer">
              <span>✍️ Enter Monthly Salary Manually (Type Karein):</span>
            </label>
            <span className="text-[10px] text-blue-200 font-bold bg-white/15 px-2.5 py-0.5 rounded-full">
              Live Filter
            </span>
          </div>

          <div className="relative flex items-center">
            <span className="absolute left-3.5 text-lg sm:text-xl font-black text-[#1E3A8A] pointer-events-none select-none">
              ₹
            </span>
            <input 
              id="manual-salary-input"
              type="text"
              inputMode="numeric"
              value={inputValue}
              onChange={handleInputChange}
              placeholder="e.g. 25000"
              className="w-full pl-9 pr-24 py-3 bg-white text-[#1E293B] font-black text-base sm:text-xl rounded-xl shadow-inner focus:outline-none focus:ring-3 focus:ring-amber-400 placeholder:text-slate-400 border border-slate-200 transition"
            />
            <span className="absolute right-3.5 text-xs font-black text-slate-400 select-none uppercase tracking-wide">
              / Month
            </span>
          </div>

          <p className="text-[11px] text-blue-100 font-semibold flex items-center justify-between">
            <span>Aap jo salary type karenge, matching offers turant dikhenge.</span>
            {salary < 25000 && salary > 0 && (
              <span className="text-amber-300 font-bold">Min requirement is ₹25,000</span>
            )}
          </p>
        </div>

        {/* Quick Chips & Slider */}
        <div className="pt-3 space-y-2">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] text-blue-200 font-bold mr-1">Quick Select:</span>
            {salaryPresets.map((preset) => {
              const isActive = salary === preset.val;
              return (
                <button
                  key={preset.val}
                  type="button"
                  onClick={() => handlePresetClick(preset.val)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition cursor-pointer ${
                    isActive 
                      ? 'bg-white text-[#1E3A8A] shadow-md font-black scale-105' 
                      : 'bg-white/15 hover:bg-white/25 text-white'
                  }`}
                >
                  {preset.label}
                </button>
              );
            })}
          </div>

          {/* Slider */}
          <div className="pt-1.5 space-y-1">
            <div className="flex justify-between items-center text-[11px] text-blue-200 font-semibold">
              <span>Or slide to adjust income:</span>
              <span className="font-extrabold text-white">₹{(salary || 0).toLocaleString()}</span>
            </div>
            <input 
              type="range"
              min="20000"
              max="80000"
              step="2500"
              value={salary || 25000}
              onChange={handleSliderChange}
              className="w-full h-2 bg-blue-950/50 rounded-lg appearance-none cursor-pointer accent-white"
            />
            <div className="flex justify-between text-[10px] text-blue-300/80 font-bold">
              <span>₹20,000</span>
              <span>₹35,000</span>
              <span>₹50,000</span>
              <span>₹80,000+</span>
            </div>
          </div>
        </div>

        {/* Bottom Trust Indicators */}
        <div className="mt-4 pt-3 border-t border-white/15 flex items-center justify-between text-xs text-blue-200">
          <span className="font-bold text-white">
            Status: <span className="text-emerald-300 font-black">{eligibleLenders.length} Companies Eligible</span>, {ineligibleLenders.length} Locked
          </span>
          <div className="flex items-center space-x-2 text-[11px]">
            <span className="inline-flex items-center">
              <Zap className="w-3 h-3 text-amber-300 mr-1" />
              Direct Bank IMPS
            </span>
          </div>
        </div>
      </div>

      {/* 2. SECTION A: ELIGIBLE COMPANIES (TOP - ACTIVE & CLICKABLE) */}
      <div className="space-y-3 pt-1">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center space-x-2">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
            <h3 className="text-sm sm:text-base font-black text-[#1E293B]">
              Eligible Companies ({eligibleLenders.length} Offers Available)
            </h3>
          </div>
          <span className="text-[11px] font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-0.5 rounded-full shadow-2xs">
            ✓ Ready to Apply
          </span>
        </div>

        {eligibleLenders.length > 0 ? (
          <div className="space-y-3">
            {eligibleLenders.map((nbfc) => (
              <div
                key={nbfc.id}
                className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-5 border border-emerald-200 shadow-xs hover:shadow-md hover:border-emerald-400 transition-all duration-200 relative group text-left"
              >
                {/* TOP ROW: Logo, Brand Info, and Status Badge */}
                <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div className="flex items-center space-x-3 min-w-0">
                    {/* Clean White Logo Container */}
                    <div className="w-20 h-11 bg-white rounded-xl p-1 border border-slate-200 shadow-2xs flex items-center justify-center overflow-hidden flex-shrink-0">
                      {nbfc.logo && nbfc.logo.startsWith('/') ? (
                        <img 
                          src={nbfc.logo} 
                          alt={nbfc.name} 
                          className="w-full h-full object-contain bg-white"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <span 
                        style={{ display: nbfc.logo && nbfc.logo.startsWith('/') ? 'none' : 'flex' }}
                        className="w-full h-full items-center justify-center font-black text-xs text-[#223981] bg-white rounded-lg"
                      >
                        {nbfc.name.slice(0, 4)}
                      </span>
                    </div>

                    {/* Company Name & Tag */}
                    <div className="min-w-0">
                      <div className="flex items-center space-x-2">
                        <h4 className="text-sm sm:text-base font-extrabold text-[#1E293B] group-hover:text-[#2563EB] transition-colors truncate">
                          {nbfc.name}
                        </h4>
                        <span className="text-[10px] font-bold text-[#2563EB] bg-[#EFF6FF] px-2 py-0.5 rounded-full border border-blue-200 hidden sm:inline-block">
                          {nbfc.tag}
                        </span>
                      </div>

                      <div className="flex items-center space-x-2 text-xs text-slate-500 mt-0.5">
                        <div className="flex items-center text-amber-500 font-extrabold">
                          <Star className="w-3.5 h-3.5 fill-amber-500 mr-1" />
                          <span>{nbfc.rating}</span>
                        </div>
                        <span>•</span>
                        <span className="text-slate-400 font-medium text-[11px] truncate">
                          {nbfc.approvalChance}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className="flex-shrink-0 text-right">
                    <span className="inline-flex items-center text-[10.5px] font-black bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1 rounded-full shadow-2xs whitespace-nowrap">
                      <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-600 flex-shrink-0" />
                      Eligible
                    </span>
                  </div>
                </div>

                {/* MIDDLE ROW: Clean 3-Column Metrics Strip */}
                <div className="grid grid-cols-3 gap-2 sm:gap-4 my-3 p-3 rounded-2xl bg-gradient-to-r from-emerald-50/50 via-white to-emerald-50/50 border border-emerald-100 text-center">
                  <div>
                    <span className="text-[9.5px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      MAX LOAN
                    </span>
                    <span className="text-xs sm:text-base font-black text-[#2563EB] mt-0.5 block truncate">
                      {nbfc.maxLoanDisplay}
                    </span>
                  </div>
                  <div className="border-x border-slate-200/80 px-1">
                    <span className="text-[9.5px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      INTEREST
                    </span>
                    <span className="text-xs sm:text-base font-black text-slate-800 mt-0.5 block truncate">
                      {nbfc.interestRateDisplay}
                    </span>
                  </div>
                  <div>
                    <span className="text-[9.5px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      MIN SALARY
                    </span>
                    <span className="text-xs sm:text-base font-black text-emerald-700 mt-0.5 block truncate">
                      {nbfc.minSalaryDisplay}
                    </span>
                  </div>
                </div>

                {/* BOTTOM ROW: Feature Tags & Direct Apply Button */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-1">
                  <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-600">
                    {nbfc.features.slice(0, 2).map((feat, idx) => (
                      <span 
                        key={idx} 
                        className="inline-flex items-center px-2 py-0.5 rounded-lg bg-emerald-50 text-[10.5px] font-semibold text-emerald-900 border border-emerald-100 truncate"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 flex-shrink-0"></span>
                        {feat}
                      </span>
                    ))}
                  </div>

                  <div className="flex-shrink-0">
                    <button
                      type="button"
                      onClick={() => handleApplyClick(nbfc)}
                      className="w-full sm:w-auto px-5 py-2.5 bg-gradient-to-r from-[#2563EB] to-[#1D4ED8] hover:from-[#1D4ED8] hover:to-[#1E40AF] text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-md shadow-blue-500/20 flex items-center justify-center space-x-1.5 transition active:scale-98 cursor-pointer whitespace-nowrap"
                    >
                      <span>Apply Now</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-5 border border-amber-200 text-center space-y-2">
            <AlertCircle className="w-7 h-7 text-amber-500 mx-auto" />
            <h4 className="text-sm font-extrabold text-[#1E293B]">
              Salary ₹{salary.toLocaleString()} Par Koi Eligible Offer Nahi Hai
            </h4>
            <p className="text-xs text-slate-500">
              Minimum salary criteria ₹25,000/month (Ticket 2 Loan) se shuru hoti hai.
            </p>
            <button
              onClick={() => setSalary(25000)}
              className="mt-1 px-4 py-1.5 bg-[#2563EB] text-white text-xs font-bold rounded-xl shadow cursor-pointer"
            >
              Set Salary to ₹25,000
            </button>
          </div>
        )}
      </div>

      {/* 3. SECTION B: INELIGIBLE COMPANIES (BOTTOM - LOCKED & UNCLICKABLE) */}
      {ineligibleLenders.length > 0 && (
        <div className="pt-4 space-y-3">
          <div className="flex items-center justify-between px-1 border-t border-slate-200 pt-4">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center">
                <Lock className="w-3.5 h-3.5" />
              </div>
              <div>
                <h3 className="text-xs sm:text-sm font-black text-slate-600">
                  Not Eligible — Higher Salary Required ({ineligibleLenders.length} Companies)
                </h3>
                <p className="text-[10.5px] text-slate-400">
                  In companies ke liye aapki monthly income minimum criteria se kam hai (Locked)
                </p>
              </div>
            </div>
            <span className="text-[10px] font-black text-slate-500 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-full uppercase tracking-wider">
              🔒 Ineligible
            </span>
          </div>

          <div className="space-y-3">
            {ineligibleLenders.map((nbfc) => (
              <div
                key={nbfc.id}
                className="bg-slate-50/70 rounded-2xl sm:rounded-3xl p-4 sm:p-5 border border-slate-200 opacity-60 text-left pointer-events-none select-none relative overflow-hidden"
              >
                {/* TOP ROW: Logo, Brand Info, and Locked Badge */}
                <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-200/60">
                  <div className="flex items-center space-x-3 min-w-0">
                    <div className="w-20 h-11 bg-white rounded-xl p-1 border border-slate-200 flex items-center justify-center overflow-hidden flex-shrink-0 grayscale">
                      {nbfc.logo && nbfc.logo.startsWith('/') ? (
                        <img 
                          src={nbfc.logo} 
                          alt={nbfc.name} 
                          className="w-full h-full object-contain bg-white"
                        />
                      ) : null}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center space-x-2">
                        <h4 className="text-sm sm:text-base font-extrabold text-slate-600 truncate">
                          {nbfc.name}
                        </h4>
                      </div>
                      <p className="text-[11px] text-amber-700 font-bold mt-0.5">
                        Requires Min Salary: {nbfc.minSalaryDisplay}
                      </p>
                    </div>
                  </div>

                  {/* Locked Pill Badge */}
                  <div className="flex-shrink-0 text-right">
                    <span className="inline-flex items-center text-[10px] font-extrabold bg-amber-50 text-amber-800 border border-amber-200 px-2.5 py-1 rounded-full">
                      <Lock className="w-3 h-3 mr-1 text-amber-600" />
                      Min {nbfc.minSalaryDisplay}
                    </span>
                  </div>
                </div>

                {/* MIDDLE ROW: Metrics Strip */}
                <div className="grid grid-cols-3 gap-2 sm:gap-4 my-3 p-3 rounded-2xl bg-slate-100/80 border border-slate-200/60 text-center">
                  <div>
                    <span className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wider block">
                      MAX LOAN
                    </span>
                    <span className="text-xs sm:text-sm font-bold text-slate-600 mt-0.5 block truncate">
                      {nbfc.maxLoanDisplay}
                    </span>
                  </div>
                  <div className="border-x border-slate-200 px-1">
                    <span className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wider block">
                      INTEREST
                    </span>
                    <span className="text-xs sm:text-sm font-bold text-slate-600 mt-0.5 block truncate">
                      {nbfc.interestRateDisplay}
                    </span>
                  </div>
                  <div>
                    <span className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wider block">
                      MIN SALARY
                    </span>
                    <span className="text-xs sm:text-sm font-black text-amber-800 mt-0.5 block truncate">
                      {nbfc.minSalaryDisplay}
                    </span>
                  </div>
                </div>

                {/* BOTTOM ROW: Disabled CTA */}
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] text-slate-400 font-medium">
                    Salary criteria unfulfilled
                  </span>
                  <button
                    type="button"
                    disabled
                    className="px-4 py-2 bg-slate-200 text-slate-500 font-extrabold text-xs rounded-xl cursor-not-allowed flex items-center space-x-1"
                  >
                    <Lock className="w-3 h-3 mr-1 text-slate-500" />
                    <span>Ineligible (Min {nbfc.minSalaryDisplay})</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
