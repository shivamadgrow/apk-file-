import React, { useState } from 'react';
import { Calculator, ArrowRight, PieChart, Info } from 'lucide-react';

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

  return (
    <div className="bg-white rounded-3xl p-5 border border-paisa-light shadow-xl my-3 text-left space-y-4">
      <div className="flex items-center space-x-2 pb-3 border-b border-slate-100">
        <div className="w-9 h-9 rounded-xl bg-paisa-light text-paisa-primary flex items-center justify-center font-bold">
          <Calculator className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-base font-extrabold text-paisa-navy">Smart Loan EMI Calculator</h2>
          <p className="text-xs text-paisa-secondaryText">Simulate your exact monthly repayments & total interest.</p>
        </div>
      </div>

      {/* Slider 1: Loan Amount */}
      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs font-bold text-paisa-navy">Loan Amount</span>
          <span className="text-lg font-black text-paisa-navy">₹{amount.toLocaleString()}</span>
        </div>
        <input 
          type="range"
          min="50000"
          max="2000000"
          step="25000"
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
          className="w-full accent-paisa-primary h-2 rounded-lg cursor-pointer"
        />
        <div className="flex justify-between text-[10px] text-paisa-secondaryText font-semibold mt-1">
          <span>₹50,000</span>
          <span>₹10 Lakhs</span>
          <span>₹20 Lakhs</span>
        </div>
      </div>

      {/* Slider 2: Interest Rate */}
      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
        <div className="flex justify-between items-center mb-1">
          <div>
            <span className="text-xs font-bold text-paisa-navy block">Interest Rate</span>
            <span className="text-[10px] font-extrabold text-emerald-600 block">upto 1.0% / day</span>
          </div>
          <span className="text-lg font-black text-paisa-primary">{rate}% <span className="text-[10px] text-slate-500 font-normal">p.a.</span></span>
        </div>
        <input 
          type="range"
          min="9.5"
          max="24.0"
          step="0.25"
          value={rate}
          onChange={(e) => setRate(Number(e.target.value))}
          className="w-full accent-paisa-primary h-2 rounded-lg cursor-pointer"
        />
        <div className="flex justify-between text-[10px] text-paisa-secondaryText font-semibold mt-1">
          <span>9.5% (Min)</span>
          <span>16.5%</span>
          <span>24.0%</span>
        </div>
      </div>

      {/* Slider 3: Tenure Months */}
      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs font-bold text-paisa-navy">Loan Tenure</span>
          <span className="text-lg font-black text-paisa-navy">{tenure} Months ({tenure/12} Years)</span>
        </div>
        <input 
          type="range"
          min="6"
          max="72"
          step="6"
          value={tenure}
          onChange={(e) => setTenure(Number(e.target.value))}
          className="w-full accent-paisa-primary h-2 rounded-lg cursor-pointer"
        />
        <div className="flex justify-between text-[10px] text-paisa-secondaryText font-semibold mt-1">
          <span>6 Months</span>
          <span>36 Months</span>
          <span>72 Months</span>
        </div>
      </div>

      {/* EMI Result Summary Card */}
      <div className="bg-gradient-to-r from-paisa-navy to-paisa-primary text-white p-4 rounded-3xl shadow-lg space-y-3">
        <div className="flex items-center justify-between border-b border-white/10 pb-2">
          <span className="text-xs font-bold text-paisa-light uppercase">Monthly EMI Repayment</span>
          <span className="text-2xl font-black text-amber-300">₹{emi.toLocaleString()}<span className="text-xs text-white">/mo</span></span>
        </div>

        <div className="grid grid-cols-3 gap-2 text-xs text-left">
          <div>
            <p className="text-[10px] text-paisa-light">Principal</p>
            <p className="font-bold text-white">₹{amount.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-[10px] text-paisa-light">Daily Rate</p>
            <p className="font-bold text-emerald-300">upto 1.0%/day</p>
          </div>
          <div>
            <p className="text-[10px] text-paisa-light">Total Interest</p>
            <p className="font-bold text-amber-300">₹{totalInterest.toLocaleString()}</p>
          </div>
        </div>

        {/* Visual Bar Breakdown */}
        <div>
          <div className="h-3 w-full bg-white/20 rounded-full overflow-hidden flex">
            <div style={{ width: `${principalPercent}%` }} className="bg-paisa-sky h-full" />
            <div style={{ width: `${interestPercent}%` }} className="bg-amber-400 h-full" />
          </div>
          <div className="flex justify-between text-[10px] text-paisa-light font-semibold mt-1">
            <span className="flex items-center"><span className="w-2 h-2 rounded-full bg-paisa-sky mr-1"/>Principal ({principalPercent}%)</span>
            <span className="flex items-center"><span className="w-2 h-2 rounded-full bg-amber-400 mr-1"/>Interest ({interestPercent}%)</span>
          </div>
        </div>

        <button
          onClick={() => onApplyWithAmount(amount, tenure)}
          className="w-full py-3 bg-white hover:bg-paisa-light text-paisa-navy text-xs font-extrabold rounded-2xl shadow transition flex items-center justify-center space-x-1"
        >
          <span>Apply for ₹{amount.toLocaleString()} Now</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
