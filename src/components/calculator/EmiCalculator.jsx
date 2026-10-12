import React, { useState } from 'react';
import { Calculator, ArrowRight } from 'lucide-react';

// Models the real product shared by the 5 website-based lending partners (Rupay91,
// Jhatpat Loans, Insta Rupees, Borrowera, Ticket 2 Loan — see PARTNER_NBFCS in
// mockData.js): a short-tenure loan with a daily rate and a flat processing fee, not
// a traditional multi-year amortized EMI. There is no amortization schedule here
// because none of these partners' products have one. MoneyDot (the 6th partner, an
// app-based product with a 3-12 month tenure and 24%-60% p.a. APR) has a genuinely
// different structure and is intentionally not modeled by this calculator — see the
// footnote below instead of blending it into one misleading slider set.
export const EmiCalculator = ({ onApplyWithAmount }) => {
  const [amount, setAmount] = useState(50000);
  const [dailyRate, setDailyRate] = useState(1.0);
  const [tenureDays, setTenureDays] = useState(60);

  const estimatedInterest = amount > 0 ? Math.round(amount * (dailyRate / 100) * tenureDays) : 0;
  const totalPayable = amount + estimatedInterest;

  const principalPercent = totalPayable > 0 ? Math.round((amount / totalPayable) * 100) : 0;
  const interestPercent = totalPayable > 0 ? 100 - principalPercent : 0;

  const amountPct = Math.min(100, Math.max(0, (amount / 100000) * 100));
  const ratePct = Math.min(100, Math.max(0, ((dailyRate - 0.8) / (1.0 - 0.8)) * 100));
  const tenurePct = Math.min(100, Math.max(0, ((tenureDays - 30) / (90 - 30)) * 100));

  return (
    <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-xl my-3 text-left space-y-4">
      <div className="flex items-center space-x-2.5 pb-3 border-b border-slate-100">
        <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#2563EB] flex items-center justify-center font-bold shadow-2xs">
          <Calculator className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-base font-extrabold text-[#223981]">Loan Cost Estimator</h2>
          <p className="text-xs text-[#717983]">Worst-case estimate for our 5 daily-rate lending partners.</p>
        </div>
      </div>

      {/* Slider 1: Loan Amount (Manual Input + Slider + Quick Chips) */}
      <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
        <div className="flex justify-between items-center mb-2 gap-2">
          <div>
            <span className="text-xs font-black text-[#223981] block">Loan Amount</span>
            <span className="text-[10px] text-slate-400 font-medium">Type manually or use slider</span>
          </div>

          {/* Manual Type Input Box */}
          <div className="flex items-center bg-white px-2.5 py-1 rounded-xl border border-blue-200 shadow-2xs focus-within:border-[#2563EB] focus-within:ring-2 focus-within:ring-blue-100 transition-all">
            <span className="text-base font-black text-[#2563EB] mr-0.5">₹</span>
            <input
              type="text"
              inputMode="numeric"
              value={amount === 0 ? '' : amount.toLocaleString('en-IN')}
              onFocus={(e) => e.target.select()}
              onChange={(e) => {
                const raw = e.target.value.replace(/\D/g, '');
                setAmount(raw === '' ? 0 : Math.min(100000, Number(raw)));
              }}
              placeholder="0"
              className="w-28 sm:w-32 text-right text-base sm:text-lg font-black text-[#2563EB] bg-transparent outline-none focus:outline-none"
            />
          </div>
        </div>

        <input
          type="range"
          min="10000"
          max="100000"
          step="5000"
          value={Math.min(100000, amount)}
          onChange={(e) => setAmount(Number(e.target.value))}
          style={{
            background: `linear-gradient(to right, #2563EB 0%, #2563EB ${amountPct}%, #E2E8F0 ${amountPct}%, #E2E8F0 100%)`
          }}
          className="paisa-slider"
        />

        <div className="flex justify-between text-[10px] text-slate-500 font-semibold mt-1">
          <span>₹10,000</span>
          <span>₹50,000</span>
          <span>₹1,00,000</span>
        </div>

        {/* Quick Amount Preset Chips */}
        <div className="flex items-center space-x-1.5 overflow-x-auto no-scrollbar pt-2.5 border-t border-slate-200/60 mt-2">
          {[10000, 25000, 50000, 75000, 100000].map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => setAmount(preset)}
              className={`px-2.5 py-1 rounded-lg text-[10.5px] font-bold transition-all whitespace-nowrap cursor-pointer ${
                amount === preset
                  ? 'bg-[#2563EB] text-white shadow-2xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:border-[#2563EB]/60 hover:text-[#2563EB]'
              }`}
            >
              ₹{preset >= 100000 ? `${preset / 100000} Lakh` : `${preset / 1000}k`}
            </button>
          ))}
        </div>
      </div>

      {/* Slider 2: Daily Rate */}
      <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
        <div className="flex justify-between items-center mb-1.5">
          <div>
            <span className="text-xs font-black text-[#223981] block">Daily Rate</span>
            <span className="text-[10px] font-extrabold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/80 inline-block mt-0.5">
              Varies by partner
            </span>
          </div>
          <div className="text-right">
            <span className="text-lg font-black text-[#2563EB]">{dailyRate.toFixed(1)}%</span>
            <span className="text-[11px] font-bold text-slate-500 ml-1">/ day</span>
          </div>
        </div>
        <input
          type="range"
          min="0.8"
          max="1.0"
          step="0.1"
          value={dailyRate}
          onChange={(e) => setDailyRate(Number(e.target.value))}
          style={{
            background: `linear-gradient(to right, #2563EB 0%, #2563EB ${ratePct}%, #E2E8F0 ${ratePct}%, #E2E8F0 100%)`
          }}
          className="paisa-slider"
        />
        <div className="flex justify-between text-[10px] text-slate-500 font-semibold mt-1">
          <span>0.8% (Min)</span>
          <span>0.9%</span>
          <span>1.0% (Max)</span>
        </div>
      </div>

      {/* Slider 3: Tenure (Days) */}
      <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
        <div className="flex justify-between items-center mb-1.5">
          <span className="text-xs font-black text-[#223981]">Repayment Period</span>
          <span className="text-lg font-black text-[#2563EB]">{tenureDays} Days</span>
        </div>
        <input
          type="range"
          min="30"
          max="90"
          step="5"
          value={tenureDays}
          onChange={(e) => setTenureDays(Number(e.target.value))}
          style={{
            background: `linear-gradient(to right, #2563EB 0%, #2563EB ${tenurePct}%, #E2E8F0 ${tenurePct}%, #E2E8F0 100%)`
          }}
          className="paisa-slider"
        />
        <div className="flex justify-between text-[10px] text-slate-500 font-semibold mt-1">
          <span>30 Days</span>
          <span>60 Days</span>
          <span>90 Days</span>
        </div>
      </div>

      {/* Result Summary Card */}
      <div className="bg-gradient-to-br from-[#1E3A8A] via-[#223981] to-[#2563EB] text-white p-5 sm:p-6 rounded-3xl shadow-lg space-y-4">
        {/* Top Header Row */}
        <div className="flex items-center justify-between border-b border-white/15 pb-3">
          <div>
            <span className="text-[11px] font-bold text-blue-200 uppercase tracking-wider block">
              Est. Total Repayable (Worst Case)
            </span>
            <span className="text-[10px] text-blue-300">
              Principal: ₹{amount.toLocaleString('en-IN')}
            </span>
          </div>
          <div className="text-right">
            <span className="text-2xl sm:text-3xl font-black text-amber-300">
              ₹{totalPayable.toLocaleString('en-IN')}
            </span>
          </div>
        </div>

        {/* 3 Metric Columns with proper Left, Center, Right alignment */}
        <div className="grid grid-cols-3 gap-1.5 bg-white/10 p-3 rounded-2xl border border-white/10 items-center">
          <div className="text-left pl-1">
            <p className="text-[10px] font-medium text-blue-200">Principal</p>
            <p className="font-extrabold text-white text-xs sm:text-sm mt-0.5">
              ₹{amount.toLocaleString('en-IN')}
            </p>
          </div>
          <div className="text-center border-x border-white/15 px-1">
            <p className="text-[10px] font-medium text-blue-200">Daily Rate</p>
            <p className="font-extrabold text-emerald-300 text-xs sm:text-sm mt-0.5">
              {dailyRate.toFixed(1)}%/day
            </p>
          </div>
          <div className="text-right pr-1">
            <p className="text-[10px] font-medium text-blue-200">Est. Interest</p>
            <p className="font-extrabold text-amber-300 text-xs sm:text-sm mt-0.5">
              ₹{estimatedInterest.toLocaleString('en-IN')}
            </p>
          </div>
        </div>

        {/* Visual Bar Breakdown */}
        <div className="space-y-1.5">
          <div className="h-3 w-full bg-white/20 rounded-full overflow-hidden flex shadow-inner">
            <div style={{ width: `${principalPercent}%` }} className="bg-[#6FA8FF] h-full transition-all duration-300" />
            <div style={{ width: `${interestPercent}%` }} className="bg-amber-400 h-full transition-all duration-300" />
          </div>
          <div className="flex justify-between text-[10.5px] text-blue-100 font-semibold px-0.5">
            <span className="flex items-center">
              <span className="w-2 h-2 rounded-full bg-[#6FA8FF] mr-1.5 flex-shrink-0" />
              Principal ({principalPercent}%)
            </span>
            <span className="flex items-center">
              <span className="w-2 h-2 rounded-full bg-amber-400 mr-1.5 flex-shrink-0" />
              Interest ({interestPercent}%)
            </span>
          </div>
        </div>

        <p className="text-[10px] text-blue-200 leading-relaxed">
          Worst case at this partner's maximum daily rate — processing fee and GST are
          charged separately and not included here. Your actual rate, fee, and
          processing fee depend on the partner you're approved by.
        </p>

        <button
          onClick={() => onApplyWithAmount && onApplyWithAmount(amount, tenureDays)}
          disabled={amount <= 0}
          className={`w-full py-3.5 ${
            amount > 0
              ? 'bg-white hover:bg-slate-50 text-[#1E3A8A] cursor-pointer active:scale-[0.99]'
              : 'bg-white/60 text-[#1E3A8A]/50 cursor-not-allowed'
          } text-xs sm:text-sm font-black rounded-2xl shadow-md transition-all flex items-center justify-center space-x-1.5 mt-1`}
        >
          <span>
            {amount > 0 ? `Apply for ₹${amount.toLocaleString('en-IN')} Now` : 'Select Loan Amount to Apply'}
          </span>
          {amount > 0 && <ArrowRight className="w-4 h-4 ml-0.5" />}
        </button>
      </div>

      {/* MoneyDot has a genuinely different product (app-based, 3-12 month tenure,
          24%-60% p.a. APR) — intentionally not modeled above since blending it into
          these sliders would misrepresent either product. */}
      <p className="text-[10.5px] text-slate-400 text-center px-2">
        MoneyDot (our app-based partner) has different terms — 3 to 12 month tenure
        at 24%–60% p.a. — see the Loans tab for its exact offer.
      </p>
    </div>
  );
};
