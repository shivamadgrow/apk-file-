import React, { useState } from 'react';
import { Calculator, ArrowRight } from 'lucide-react';

export const EmiCalculator = ({ onApplyWithAmount }) => {
  const [amount, setAmount] = useState(500000);
  const [rate, setRate] = useState(11.5);
  const [tenure, setTenure] = useState(36);

  // EMI Math Formula: P * r * (1+r)^n / ((1+r)^n - 1)
  const monthlyRate = rate / 12 / 100;
  const emi = Math.round((amount * monthlyRate * Math.pow(1 + monthlyRate, tenure)) / (Math.pow(1 + monthlyRate, tenure) - 1));
  const totalPayable = emi * tenure;
  const totalInterest = totalPayable - amount;

  const principalPercent = Math.round((amount / totalPayable) * 100);
  const interestPercent = 100 - principalPercent;

  // Track percentage calculations for two-tone filled slider tracks
  const amountPct = Math.min(100, Math.max(0, ((amount - 50000) / (2000000 - 50000)) * 100));
  const ratePct = Math.min(100, Math.max(0, ((rate - 9.5) / (24.0 - 9.5)) * 100));
  const tenurePct = Math.min(100, Math.max(0, ((tenure - 6) / (72 - 6)) * 100));

  return (
    <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-xl my-3 text-left space-y-4">
      <div className="flex items-center space-x-2.5 pb-3 border-b border-slate-100">
        <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#2563EB] flex items-center justify-center font-bold shadow-2xs">
          <Calculator className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-base font-extrabold text-[#223981]">Smart Loan EMI Calculator</h2>
          <p className="text-xs text-[#717983]">Simulate your exact monthly repayments & total interest.</p>
        </div>
      </div>

      {/* Slider 1: Loan Amount */}
      <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
        <div className="flex justify-between items-center mb-1.5">
          <span className="text-xs font-black text-[#223981]">Loan Amount</span>
          <span className="text-lg font-black text-[#2563EB]">₹{amount.toLocaleString('en-IN')}</span>
        </div>
        <input 
          type="range"
          min="50000"
          max="2000000"
          step="25000"
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
          style={{
            background: `linear-gradient(to right, #2563EB 0%, #2563EB ${amountPct}%, #E2E8F0 ${amountPct}%, #E2E8F0 100%)`
          }}
          className="paisa-slider"
        />
        <div className="flex justify-between text-[10px] text-slate-500 font-semibold mt-1">
          <span>₹50,000</span>
          <span>₹10 Lakhs</span>
          <span>₹20 Lakhs</span>
        </div>
      </div>

      {/* Slider 2: Interest Rate */}
      <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
        <div className="flex justify-between items-center mb-1.5">
          <div>
            <span className="text-xs font-black text-[#223981] block">Interest Rate</span>
            <span className="text-[10px] font-extrabold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/80 inline-block mt-0.5">
              upto 1.0% / day
            </span>
          </div>
          <div className="text-right">
            <span className="text-lg font-black text-[#2563EB]">{rate}%</span>
            <span className="text-[11px] font-bold text-slate-500 ml-1">p.a.</span>
          </div>
        </div>
        <input 
          type="range"
          min="9.5"
          max="24.0"
          step="0.25"
          value={rate}
          onChange={(e) => setRate(Number(e.target.value))}
          style={{
            background: `linear-gradient(to right, #2563EB 0%, #2563EB ${ratePct}%, #E2E8F0 ${ratePct}%, #E2E8F0 100%)`
          }}
          className="paisa-slider"
        />
        <div className="flex justify-between text-[10px] text-slate-500 font-semibold mt-1">
          <span>9.5% (Min)</span>
          <span>16.5%</span>
          <span>24.0%</span>
        </div>
      </div>

      {/* Slider 3: Tenure Months */}
      <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
        <div className="flex justify-between items-center mb-1.5">
          <span className="text-xs font-black text-[#223981]">Loan Tenure</span>
          <span className="text-lg font-black text-[#2563EB]">
            {tenure} Months <span className="text-xs font-semibold text-slate-500">({(tenure / 12).toFixed(tenure % 12 === 0 ? 0 : 1)} Years)</span>
          </span>
        </div>
        <input 
          type="range"
          min="6"
          max="72"
          step="6"
          value={tenure}
          onChange={(e) => setTenure(Number(e.target.value))}
          style={{
            background: `linear-gradient(to right, #2563EB 0%, #2563EB ${tenurePct}%, #E2E8F0 ${tenurePct}%, #E2E8F0 100%)`
          }}
          className="paisa-slider"
        />
        <div className="flex justify-between text-[10px] text-slate-500 font-semibold mt-1">
          <span>6 Months</span>
          <span>36 Months</span>
          <span>72 Months</span>
        </div>
      </div>

      {/* EMI Result Summary Card */}
      <div className="bg-gradient-to-br from-[#1E3A8A] via-[#223981] to-[#2563EB] text-white p-4.5 rounded-3xl shadow-lg space-y-3.5">
        <div className="flex items-center justify-between border-b border-white/15 pb-2.5">
          <span className="text-xs font-bold text-blue-100 uppercase tracking-wider">Monthly EMI Repayment</span>
          <span className="text-2xl font-black text-amber-300">
            ₹{emi.toLocaleString('en-IN')}<span className="text-xs text-white/80 font-semibold">/mo</span>
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2 text-xs text-left">
          <div>
            <p className="text-[10px] text-blue-200 font-medium">Principal</p>
            <p className="font-extrabold text-white text-xs sm:text-sm">₹{amount.toLocaleString('en-IN')}</p>
          </div>
          <div>
            <p className="text-[10px] text-blue-200 font-medium">Daily Rate</p>
            <p className="font-extrabold text-emerald-300 text-xs sm:text-sm">upto 1.0%/day</p>
          </div>
          <div>
            <p className="text-[10px] text-blue-200 font-medium">Total Interest</p>
            <p className="font-extrabold text-amber-300 text-xs sm:text-sm">₹{totalInterest.toLocaleString('en-IN')}</p>
          </div>
        </div>

        {/* Visual Bar Breakdown */}
        <div>
          <div className="h-3 w-full bg-white/20 rounded-full overflow-hidden flex shadow-inner">
            <div style={{ width: `${principalPercent}%` }} className="bg-[#6FA8FF] h-full transition-all duration-300" />
            <div style={{ width: `${interestPercent}%` }} className="bg-amber-400 h-full transition-all duration-300" />
          </div>
          <div className="flex justify-between text-[10px] text-blue-100 font-semibold mt-1.5">
            <span className="flex items-center">
              <span className="w-2 h-2 rounded-full bg-[#6FA8FF] mr-1.5" />
              Principal ({principalPercent}%)
            </span>
            <span className="flex items-center">
              <span className="w-2 h-2 rounded-full bg-amber-400 mr-1.5" />
              Interest ({interestPercent}%)
            </span>
          </div>
        </div>

        <button
          onClick={() => onApplyWithAmount && onApplyWithAmount(amount, tenure)}
          className="w-full py-3 bg-white hover:bg-slate-50 text-[#1E3A8A] text-xs font-black rounded-2xl shadow-md transition-all active:scale-[0.99] flex items-center justify-center space-x-1.5 cursor-pointer"
        >
          <span>Apply for ₹{amount.toLocaleString('en-IN')} Now</span>
          <ArrowRight className="w-4 h-4 ml-0.5" />
        </button>
      </div>
    </div>
  );
};

