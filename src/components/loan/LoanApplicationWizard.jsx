import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { MultiLenderComparison } from './MultiLenderComparison';
import { 
  CheckCircle2, ArrowRight, ArrowLeft, Upload, ShieldCheck, 
  FileText, Camera, Check, Lock, Landmark, Sparkles 
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const LoanApplicationWizard = ({ preSelectedProduct, onClose }) => {
  const { setActiveLoan, saveNewLoanApplication, setActiveTab } = useApp();

  const [step, setStep] = useState(1);
  const [loanAmount, setLoanAmount] = useState(350000);
  const [tenureMonths, setTenureMonths] = useState(36);
  const [purpose, setPurpose] = useState('Home Improvement & Renovation');
  const [employmentType, setEmploymentType] = useState('salaried');
  const [monthlyIncome, setMonthlyIncome] = useState(75000);
  const [companyName, setCompanyName] = useState('');

  // KYC States
  const [panNumber, setPanNumber] = useState('');
  const [aadhaarNumber, setAadhaarNumber] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [aadhaarOtp, setAadhaarOtp] = useState('7821');
  const [kycDone, setKycDone] = useState(false);

  // Selected Offer State
  const [chosenOffer, setChosenOffer] = useState(null);
  const [agreementSigned, setAgreementSigned] = useState(false);

  // EMI Preview Calculation
  const approxRate = 10.99;
  const r = approxRate / 12 / 100;
  const calculatedEmi = Math.round((loanAmount * r * Math.pow(1 + r, tenureMonths)) / (Math.pow(1 + r, tenureMonths) - 1));

  const handleNextStep = () => {
    if (step === 3 && !kycDone) {
      setKycDone(true);
    }
    setStep(prev => prev + 1);
  };

  const handleOfferSelect = (nbfc, emi, fee) => {
    setChosenOffer({ nbfc, emi, fee });
    setStep(5); // Move to e-Sign
  };

  const handleFinalSubmit = () => {
    setAgreementSigned(true);

    // Trigger celebration confetti
    try {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 }
      });
    } catch (e) {
      console.log('Confetti triggered');
    }

    const newLoanObj = {
      id: `PL-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      hasActiveLoan: true,
      type: preSelectedProduct === 'gold' ? 'Gold Loan' : preSelectedProduct === 'business' ? 'Business Loan' : 'Personal Loan',
      amount: loanAmount,
      tenureMonths: tenureMonths,
      monthlyEmi: chosenOffer ? chosenOffer.emi : calculatedEmi,
      purpose: purpose,
      currentStep: 5,
      status: "Approved — Disbursal Initiated",
      stepLabels: [
        { id: 1, title: "Journey Started", time: "Just now", done: true },
        { id: 2, title: "Application & KYC Verified", time: "Just now", done: true },
        { id: 3, title: `Offer Selected (${chosenOffer?.nbfc.name || 'Aditya Birla Capital'})`, time: "Just now", done: true },
        { id: 4, title: "e-Sign Agreement Signed", time: "Just now", done: true },
        { id: 5, title: "Disbursal in Progress", time: "Estimated < 5 mins", done: true }
      ],
      selectedNbfc: {
        name: chosenOffer?.nbfc.name || "Aditya Birla Capital",
        rate: `${chosenOffer?.nbfc.interestRate || 10.99}%`,
        fee: `₹${chosenOffer?.fee.toLocaleString() || '5,250'}`,
        disbursalTime: "8 Minutes"
      }
    };

    setActiveLoan(newLoanObj);
    saveNewLoanApplication(newLoanObj);

    // Close modal if open & switch directly to Tracking tab automatically!
    if (onClose) onClose();
    setActiveTab('track');
  };

  return (
    <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xl my-4 text-left">
      {/* Wizard Progress Bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between text-xs font-bold text-[#223981] mb-2">
          <span>Loan Application Wizard</span>
          <span className="text-[#4A8DFF]">Step {step} of 5</span>
        </div>
        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
          <div 
            className="h-full bg-[#4A8DFF] transition-all duration-500" 
            style={{ width: `${(step / 5) * 100}%` }}
          />
        </div>
      </div>

      {/* STEP 1: Amount & Tenure Selector */}
      {step === 1 && (
        <div className="space-y-5">
          <div>
            <h2 className="text-lg font-extrabold text-[#223981]">Select Loan Amount & Tenure</h2>
            <p className="text-xs text-[#717983]">Tailor your credit requirement with live EMI preview.</p>
          </div>

          {/* Amount Slider */}
          <div className="bg-[#E4EEFF]/50 p-4 rounded-2xl border border-[#6FA8FF]/30">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-[#717983]">Required Loan Amount</span>
              <span className="text-xl font-black text-[#223981]">₹{loanAmount.toLocaleString()}</span>
            </div>
            <input 
              type="range"
              min="25000"
              max="1500000"
              step="25000"
              value={loanAmount}
              onChange={(e) => setLoanAmount(Number(e.target.value))}
              className="w-full accent-[#4A8DFF] h-2 bg-slate-200 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-[#717983] font-semibold mt-1">
              <span>₹25,000</span>
              <span>₹7.5 Lakhs</span>
              <span>₹15 Lakhs</span>
            </div>
          </div>

          {/* Tenure Slider */}
          <div className="bg-[#E4EEFF]/50 p-4 rounded-2xl border border-[#6FA8FF]/30">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-[#717983]">Repayment Tenure</span>
              <span className="text-lg font-extrabold text-[#4A8DFF]">{tenureMonths} Months ({tenureMonths / 12} Yrs)</span>
            </div>
            <input 
              type="range"
              min="6"
              max="60"
              step="6"
              value={tenureMonths}
              onChange={(e) => setTenureMonths(Number(e.target.value))}
              className="w-full accent-[#4A8DFF] h-2 bg-slate-200 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-[#717983] font-semibold mt-1">
              <span>6 Months</span>
              <span>36 Months</span>
              <span>60 Months</span>
            </div>
          </div>

          {/* Purpose Selector */}
          <div>
            <label className="block text-xs font-bold text-[#223981] mb-1">Purpose of Loan</label>
            <select
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-[#1E293B] focus:ring-2 focus:ring-[#4A8DFF] outline-none"
            >
              <option>Home Improvement & Renovation</option>
              <option>Medical & Family Emergency</option>
              <option>Business Expansion & Capital</option>
              <option>Debt Consolidation</option>
              <option>Travel & Wedding</option>
            </select>
          </div>

          {/* Live Calculated EMI Card */}
          <div className="bg-gradient-to-r from-[#223981] to-[#17275A] text-white p-4 rounded-2xl flex items-center justify-between shadow-md">
            <div>
              <p className="text-[10px] font-bold text-[#6FA8FF] uppercase">Calculated Monthly EMI</p>
              <p className="text-2xl font-black text-white">₹{calculatedEmi.toLocaleString()}<span className="text-xs font-normal">/month</span></p>
              <p className="text-[10px] text-slate-300">Interest starting @ 10.99% p.a.</p>
            </div>
            <button
              onClick={handleNextStep}
              className="px-5 py-2.5 bg-[#4A8DFF] hover:bg-white hover:text-[#223981] text-white text-xs font-extrabold rounded-xl shadow transition flex items-center space-x-1"
            >
              <span>Continue</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: Employment & Income */}
      {step === 2 && (
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-extrabold text-[#223981]">Employment & Income Details</h2>
            <p className="text-xs text-[#717983]">NBFC partners match loan offers based on your profile.</p>
          </div>

          <div className="flex bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setEmploymentType('salaried')}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition ${
                employmentType === 'salaried' ? 'bg-[#4A8DFF] text-white shadow' : 'text-[#717983]'
              }`}
            >
              Salaried Employee
            </button>
            <button
              onClick={() => setEmploymentType('self_employed')}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition ${
                employmentType === 'self_employed' ? 'bg-[#4A8DFF] text-white shadow' : 'text-[#717983]'
              }`}
            >
              Self-Employed / Business
            </button>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#223981] mb-1">
              Net Monthly Take-Home Income (₹)
            </label>
            <input 
              type="number"
              value={monthlyIncome}
              onChange={(e) => setMonthlyIncome(Number(e.target.value))}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-[#223981] focus:ring-2 focus:ring-[#4A8DFF] outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#223981] mb-1">
              {employmentType === 'salaried' ? 'Company Name' : 'Business / Shop Name'}
            </label>
            <input 
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-[#1E293B] focus:ring-2 focus:ring-[#4A8DFF] outline-none"
            />
          </div>

          <div className="flex items-center space-x-3 pt-3">
            <button
              onClick={() => setStep(1)}
              className="px-4 py-2.5 border border-slate-300 text-[#223981] text-xs font-bold rounded-xl"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleNextStep}
              className="flex-1 py-2.5 bg-[#4A8DFF] text-white text-xs font-extrabold rounded-xl shadow flex items-center justify-center space-x-1"
            >
              <span>Proceed to e-KYC</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: Paperless e-KYC */}
      {step === 3 && (
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-extrabold text-[#223981]">Paperless e-KYC & Uploads</h2>
            <p className="text-xs text-[#717983]">Instant Aadhaar OTP verification & document liveness check.</p>
          </div>

          <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <FileText className="w-5 h-5 text-[#4A8DFF]" />
              <div>
                <p className="text-xs font-bold text-[#223981]">PAN Card: {panNumber}</p>
                <p className="text-[10px] text-emerald-600 font-semibold">Verified with NSDL Bureau</p>
              </div>
            </div>
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
          </div>

          <div className="bg-[#E4EEFF]/50 p-3.5 rounded-2xl border border-[#6FA8FF]/40 space-y-2">
            <label className="block text-xs font-bold text-[#223981]">Aadhaar Number (e-KYC)</label>
            <div className="flex space-x-2">
              <input 
                type="text"
                value={aadhaarNumber}
                onChange={(e) => setAadhaarNumber(e.target.value)}
                className="flex-1 p-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-[#223981]"
              />
              <button 
                onClick={() => setOtpSent(true)}
                className="px-3 py-2 bg-[#223981] text-white text-xs font-bold rounded-xl"
              >
                {otpSent ? 'Resend OTP' : 'Send OTP'}
              </button>
            </div>

            {otpSent && (
              <div className="pt-2">
                <p className="text-[10px] text-emerald-700 font-semibold mb-1">OTP sent to linked mobile +91 98765 *****</p>
                <div className="flex space-x-2">
                  <input 
                    type="text"
                    value={aadhaarOtp}
                    onChange={(e) => setAadhaarOtp(e.target.value)}
                    placeholder="Enter 4-digit OTP"
                    className="flex-1 p-2 bg-white border border-emerald-300 rounded-xl text-xs font-bold text-center tracking-widest"
                  />
                  <button 
                    onClick={() => setKycDone(true)}
                    className="px-3 py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl flex items-center"
                  >
                    <Check className="w-3.5 h-3.5 mr-1" />
                    Verify
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Camera className="w-5 h-5 text-[#4A8DFF]" />
              <div>
                <p className="text-xs font-bold text-[#223981]">Liveness Selfie Check</p>
                <p className="text-[10px] text-[#717983]">Facial match with Aadhaar photo: 99.4%</p>
              </div>
            </div>
            <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
              Matched
            </span>
          </div>

          <div className="flex items-center space-x-3 pt-2">
            <button
              onClick={() => setStep(2)}
              className="px-4 py-2.5 border border-slate-300 text-[#223981] text-xs font-bold rounded-xl"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleNextStep}
              className="flex-1 py-2.5 bg-[#4A8DFF] text-white text-xs font-extrabold rounded-xl shadow flex items-center justify-center space-x-1"
            >
              <span>View NBFC Comparison Offers</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: Side-by-Side Offer Comparison */}
      {step === 4 && (
        <div>
          <div className="mb-3">
            <h2 className="text-lg font-extrabold text-[#223981]">Compare & Select Best NBFC Offer</h2>
            <p className="text-xs text-[#717983]">Side-by-side comparison of 4 RBI-registered partner offers.</p>
          </div>

          <MultiLenderComparison 
            loanAmount={loanAmount}
            tenureMonths={tenureMonths}
            onSelectOffer={handleOfferSelect}
          />
        </div>
      )}

      {/* STEP 5: Offer Selection & e-Sign Agreement */}
      {step === 5 && (
        <div className="space-y-4">
          <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-200 text-center">
            <Sparkles className="w-8 h-8 text-emerald-600 mx-auto mb-1 animate-bounce" />
            <h2 className="text-base font-extrabold text-emerald-900">Pre-Approved Sanction Ready!</h2>
            <p className="text-xs text-emerald-700 mt-0.5">
              Lender: <strong className="font-bold">{chosenOffer?.nbfc.name || 'Aditya Birla Capital'}</strong>
            </p>
          </div>

          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2 text-xs">
            <div className="flex justify-between border-b pb-1">
              <span className="text-[#717983]">Approved Loan Amount:</span>
              <span className="font-bold text-[#223981]">₹{loanAmount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between border-b pb-1">
              <span className="text-[#717983]">Monthly EMI:</span>
              <span className="font-bold text-[#4A8DFF]">₹{(chosenOffer?.emi || calculatedEmi).toLocaleString()}/mo</span>
            </div>
            <div className="flex justify-between border-b pb-1">
              <span className="text-[#717983]">Tenure:</span>
              <span className="font-bold text-[#223981]">{tenureMonths} Months</span>
            </div>
            <div className="flex justify-between border-b pb-1">
              <span className="text-[#717983]">Processing Fee:</span>
              <span className="font-bold text-[#1E293B]">₹{(chosenOffer?.fee || 5250).toLocaleString()}</span>
            </div>
            <div className="flex justify-between pt-1">
              <span className="text-[#717983]">Credit Bank Account:</span>
              <span className="font-bold text-emerald-700">HDFC Bank (****1823)</span>
            </div>
          </div>

          {/* e-Sign Consent Checkbox */}
          <div className="bg-[#E4EEFF]/60 p-3 rounded-2xl border border-[#6FA8FF]/40 flex items-start space-x-2">
            <input 
              type="checkbox"
              id="esignConsent"
              checked={agreementSigned}
              onChange={(e) => setAgreementSigned(e.target.checked)}
              className="mt-0.5 w-4 h-4 accent-[#4A8DFF] cursor-pointer"
            />
            <label htmlFor="esignConsent" className="text-[11px] text-[#223981] font-semibold cursor-pointer">
              I agree to e-Sign the NBFC Sanction Letter & Loan Agreement with Aadhaar OTP authentication.
            </label>
          </div>

          <button
            onClick={handleFinalSubmit}
            disabled={!agreementSigned}
            className={`w-full py-3.5 rounded-2xl text-xs sm:text-sm font-extrabold text-white flex items-center justify-center space-x-2 shadow-lg transition ${
              agreementSigned 
                ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/30 cursor-pointer' 
                : 'bg-slate-300 cursor-not-allowed'
            }`}
          >
            <Lock className="w-4 h-4" />
            <span>e-Sign & Disburse Loan Now</span>
          </button>
        </div>
      )}
    </div>
  );
};
