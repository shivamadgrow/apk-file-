import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { MultiLenderComparison } from './MultiLenderComparison';
import { LeadConsentCheckbox, DISCLOSURE_VERSION } from './LeadConsentCheckbox';
import { ErrorToast } from '../common/ErrorToast';
import { api } from '../../services/api';
import {
  CheckCircle2, ArrowRight, ArrowLeft, Upload, ShieldCheck,
  FileText, Lock, Landmark, Sparkles, ExternalLink, Loader2
} from 'lucide-react';

export const LoanApplicationWizard = ({ preSelectedProduct = 'personal', onClose }) => {
  const { user, setActiveLoan, saveNewLoanApplication, setActiveTab, partners } = useApp();

  const productTitle = preSelectedProduct === 'business' 
    ? 'Business Loan' 
    : preSelectedProduct === 'gold' 
    ? 'Gold Loan' 
    : preSelectedProduct === 'credit_card' 
    ? 'Instant Credit Card' 
    : 'Personal Loan';

  // All active lending partners (live from the backend, see AppContext's `partners`)
  // currently cap at ₹1,00,000. Tenure, APR, and fees vary per partner (30-90 days)
  // — shown per-offer in Step 4/5 rather than as a single number here. Every
  // product category here routes to the same partner list in Step 4.
  const defaultAmount = 50000;

  const defaultPurpose = preSelectedProduct === 'business' 
    ? 'Business Working Capital / Inventory' 
    : preSelectedProduct === 'gold' 
    ? 'Instant Liquidity Against Gold' 
    : preSelectedProduct === 'credit_card' 
    ? 'Shopping, Cashback & Daily Expenses' 
    : 'Home Improvement & Renovation';

  const [step, setStep] = useState(1);
  const [loanAmount, setLoanAmount] = useState(defaultAmount);
  const [loanAmountInput, setLoanAmountInput] = useState(String(defaultAmount));

  const handleLoanAmountChange = (e) => {
    const raw = e.target.value.replace(/\D/g, '');
    setLoanAmountInput(raw);
    setLoanAmount(raw ? Number(raw) : 0);
  };
  // Not user-selectable here: real tenure is set by whichever partner the user
  // picks in Step 4 (ranges from 30 days to 12 months — see PARTNER_NBFCS). This is
  // sent to the backend's `tenureMonths` field as a representative placeholder (3
  // months) only for the initial lead record, before a partner is chosen.
  const tenureMonths = 3;
  const [purpose, setPurpose] = useState(defaultPurpose);
  const [employmentType, setEmploymentType] = useState('salaried');
  const [monthlyIncome, setMonthlyIncome] = useState(35000);
  const [companyName, setCompanyName] = useState('');

  // Identity fields — collected here only to prefill the lending partner's own KYC
  // step after redirect. No verification is performed in-app: real PAN/Aadhaar
  // verification happens with the matched lending partner, matching the website's
  // existing journey. Never mark these as "verified" client-side.
  const [panNumber, setPanNumber] = useState('');

  // Lead-sharing consent — unchecked by default, required before submission. The
  // backend hard-enforces this for every customer-app submission (see
  // paisa/server/src/lib/intake.js); this UI gate is the user-facing half of that.
  const [leadConsent, setLeadConsent] = useState(false);

  // Selected Offer State
  const [chosenOffer, setChosenOffer] = useState(null);
  const [agreementSigned, setAgreementSigned] = useState(false);

  // Real backend application state — set only from an actual, successful
  // POST /api/loan-applications/ response. Never fabricated.
  const [submittedApplication, setSubmittedApplication] = useState(null);
  const [isSubmittingApplication, setIsSubmittingApplication] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const handleNextStep = () => {
    setStep(prev => prev + 1);
  };

  // Submits the real application to the confirmed backend (POST /api/loan-applications/,
  // the same intake the website's apply-now.php uses). Only advances to the lender
  // comparison step on an authoritative success response — a failed or ambiguous
  // request never fakes success, and the user's entered data is preserved so they
  // can simply press the button again (the backend safely dedupes repeat submissions
  // for the same phone, so retrying never creates a duplicate application).
  const handleProceedToOffers = async () => {
    setSubmitError('');

    if (!loanAmount || loanAmount <= 0) {
      setSubmitError('Please enter a valid loan amount.');
      return;
    }
    if (loanAmount > 100000) {
      setSubmitError('Our partners cap loans at ₹1,00,000. Please enter an amount up to that limit.');
      return;
    }
    if (!monthlyIncome || monthlyIncome <= 0) {
      setSubmitError('Please enter your monthly income.');
      return;
    }
    if (panNumber && !/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(panNumber)) {
      setSubmitError('Please enter a valid 10-character PAN (e.g. ABCDE1234F), or leave it blank.');
      return;
    }
    if (!leadConsent) {
      setSubmitError('Please accept the consent checkbox before submitting your enquiry.');
      return;
    }

    setIsSubmittingApplication(true);

    const res = await api.submitLoanApplication({
      loanAmount,
      tenureMonths,
      purpose,
      employmentType,
      monthlySalary: monthlyIncome,
      companyName,
      pan: panNumber || undefined,
      leadConsent: true,
      leadConsentVersion: DISCLOSURE_VERSION
    });

    setIsSubmittingApplication(false);

    if (!res.ok) {
      setSubmitError(res.error || 'Unable to submit your application right now. Please try again.');
      return;
    }

    setSubmittedApplication(res.application);
    setStep(4);
  };

  // nbfc.resolvedUrl / leadId are set by MultiLenderComparison right after it has
  // already opened the partner's site in a new tab — the actual application/KYC/
  // disbursal from this point on happens on the partner's site, not in this app.
  const handleOfferSelect = (nbfc) => {
    setChosenOffer({ nbfc });
    setStep(5);
  };

  const handleFinalSubmit = () => {
    setAgreementSigned(true);

    // Uses the REAL application id/status returned by the backend (submittedApplication,
    // from handleProceedToOffers) — never a client-fabricated id. "Redirected to X" is
    // the one fact we genuinely know happened locally (MultiLenderComparison just opened
    // that partner's site); we do not claim anything about approval or disbursal, since
    // that is decided entirely on the partner's own site, outside this app's visibility.
    const newLoanObj = {
      id: submittedApplication?.leadCode || submittedApplication?.displayId || null,
      hasActiveLoan: true,
      type: preSelectedProduct === 'gold' ? 'Gold Loan' : preSelectedProduct === 'business' ? 'Business Loan' : 'Personal Loan',
      amount: loanAmount,
      tenureMonths: tenureMonths,
      monthlyEmi: 0, // tenure/EMI terms are set by the chosen partner, not a fixed in-app value
      purpose: purpose,
      currentStep: 3,
      status: `Submitted (${submittedApplication?.status || 'FRESH'}) — Redirected to Partner`,
      stepLabels: [
        { id: 1, title: "Journey Started", time: "Just now", done: true },
        { id: 2, title: "Application Submitted", time: "Just now", done: true },
        { id: 3, title: `Redirected to ${chosenOffer?.nbfc?.name || 'Partner Lender'}`, time: "Just now", done: true }
      ],
      selectedNbfc: {
        name: chosenOffer?.nbfc?.name || "Partner Lender",
        rate: chosenOffer?.nbfc?.interestRateDisplay || "",
        fee: "",
        disbursalTime: ""
      }
    };

    setActiveLoan(newLoanObj);
    saveNewLoanApplication(newLoanObj);

    if (onClose) onClose();
    setActiveTab('track');
  };

  return (
    <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xl my-4 text-left">
      <ErrorToast message={submitError} onDismiss={() => setSubmitError('')} />
      {/* Wizard Progress Bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between text-xs font-bold text-[#223981] mb-2">
          <span>{productTitle} Wizard</span>
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
            <h2 className="text-lg font-extrabold text-[#223981]">Select {productTitle} Amount</h2>
            <p className="text-xs text-[#717983]">Compare up to ₹1,00,000 across our lending partners — exact rate, tenure, and fees are shown per partner in the next step.</p>
          </div>

          {/* Amount Input */}
          <div className="bg-[#E4EEFF]/50 p-4 rounded-2xl border border-[#6FA8FF]/30 space-y-2">
            <label htmlFor="loan-amount-input" className="text-xs font-bold text-[#717983] block">
              Required Loan Amount
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-3.5 text-lg font-black text-[#223981] pointer-events-none select-none">
                ₹
              </span>
              <input
                id="loan-amount-input"
                type="text"
                inputMode="numeric"
                value={loanAmountInput}
                onChange={handleLoanAmountChange}
                placeholder="e.g. 50000"
                className="w-full pl-8 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-xl font-black text-[#223981] focus:ring-2 focus:ring-[#4A8DFF] outline-none"
              />
            </div>
            <p className="text-[10.5px] text-[#717983] font-semibold flex items-center justify-between">
              <span>Enter the exact amount you need</span>
              {loanAmount > 100000 ? (
                <span className="text-red-500 font-bold">Max is ₹1,00,000</span>
              ) : (
                <span>Up to ₹1,00,000</span>
              )}
            </p>
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

          <div className="bg-gradient-to-r from-[#223981] to-[#17275A] text-white p-4 rounded-2xl flex items-center justify-between shadow-md">
            <div>
              <p className="text-[10px] font-bold text-[#6FA8FF] uppercase">Requested Amount</p>
              <p className="text-2xl font-black text-white">₹{loanAmount.toLocaleString()}</p>
              <p className="text-[10px] text-emerald-300 font-bold">Rate, tenure & fees vary by partner — see the next step</p>
            </div>
            <button
              onClick={handleNextStep}
              disabled={!loanAmount || loanAmount <= 0 || loanAmount > 100000}
              className="px-5 py-2.5 bg-[#4A8DFF] hover:bg-white hover:text-[#223981] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[#4A8DFF] disabled:hover:text-white text-white text-xs font-extrabold rounded-xl shadow transition flex items-center space-x-1"
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

      {/* STEP 3: Identity details for the lending partner (no in-app verification) */}
      {step === 3 && (
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-extrabold text-[#223981]">Identity Details</h2>
            <p className="text-xs text-[#717983]">
              Your PAN & Aadhaar are verified directly by the lending partner you choose next — not by Paisa in Minutes.
            </p>
          </div>

          <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 space-y-2">
            <label className="block text-xs font-bold text-[#223981]">PAN Number (optional, for prefill)</label>
            <input
              type="text"
              value={panNumber}
              onChange={(e) => setPanNumber(e.target.value.toUpperCase())}
              maxLength={10}
              placeholder="ABCDE1234F"
              className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-[#223981] tracking-wider"
            />
          </div>

          <div className="bg-[#E4EEFF]/60 p-3.5 rounded-2xl border border-[#6FA8FF]/40 flex items-start space-x-2.5">
            <ShieldCheck className="w-5 h-5 text-[#2563EB] flex-shrink-0 mt-0.5" />
            <p className="text-[11px] text-[#223981] font-semibold leading-relaxed">
              After you pick an offer in the next step, you'll be taken to that lender's own site to complete
              Aadhaar e-KYC and any document verification they require. Paisa in Minutes does not perform or
              claim to perform identity verification itself.
            </p>
          </div>

          <LeadConsentCheckbox checked={leadConsent} onChange={setLeadConsent} />

          <div className="flex items-center space-x-3 pt-2">
            <button
              onClick={() => setStep(2)}
              disabled={isSubmittingApplication}
              className="px-4 py-2.5 border border-slate-300 text-[#223981] text-xs font-bold rounded-xl disabled:opacity-50"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleProceedToOffers}
              disabled={isSubmittingApplication}
              className="flex-1 py-2.5 bg-[#4A8DFF] text-white text-xs font-extrabold rounded-xl shadow flex items-center justify-center space-x-1 disabled:opacity-60"
            >
              {isSubmittingApplication ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Submitting Application...</span>
                </>
              ) : (
                <>
                  <span>Submit & View NBFC Offers</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: Side-by-Side Offer Comparison */}
      {step === 4 && (
        <div>
          <div className="mb-3">
            <h2 className="text-lg font-extrabold text-[#223981]">Compare & Select Best NBFC Offer</h2>
            <p className="text-xs text-[#717983]">Side-by-side comparison of {partners.length} partner offers matching your monthly income.</p>
          </div>

          <MultiLenderComparison
            loanAmount={loanAmount}
            tenureMonths={tenureMonths}
            userSalary={monthlyIncome}
            leadCode={submittedApplication?.leadCode || submittedApplication?.displayId}
            onSelectOffer={handleOfferSelect}
          />
        </div>
      )}

      {/* STEP 5: Honest confirmation — by this point MultiLenderComparison has already
          opened the chosen lender's own site in a new tab. We do not claim any
          approval, e-sign, or disbursal happened here, because none of that happens
          in this app. */}
      {step === 5 && (
        <div className="space-y-4">
          <div className="bg-blue-50 p-4 rounded-2xl border border-blue-200 text-center">
            <ExternalLink className="w-8 h-8 text-blue-600 mx-auto mb-1" />
            <h2 className="text-base font-extrabold text-blue-900">You're Continuing With {chosenOffer?.nbfc?.name || 'the Partner Lender'}</h2>
            <p className="text-xs text-blue-700 mt-0.5">
              {chosenOffer?.nbfc?.isApp
                ? 'We opened the Play Store so you can install their app and complete your application, KYC, and final loan terms directly with them.'
                : 'We opened their site in a new tab so you can complete your application, KYC, and final loan terms directly with them.'}
            </p>
          </div>

          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2 text-xs">
            <div className="flex justify-between border-b pb-1">
              <span className="text-[#717983]">Requested Loan Amount:</span>
              <span className="font-bold text-[#223981]">₹{loanAmount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between border-b pb-1">
              <span className="text-[#717983]">Repayment Period:</span>
              <span className="font-bold text-[#223981]">{chosenOffer?.nbfc?.tenureDisplay || 'Set by Partner'}</span>
            </div>
            <div className="flex justify-between border-b pb-1">
              <span className="text-[#717983]">APR:</span>
              <span className="font-bold text-[#223981]">{chosenOffer?.nbfc?.aprDisplay || 'Set by Partner'}</span>
            </div>
            <div className="flex justify-between pt-1">
              <span className="text-[#717983]">Processing Fee:</span>
              <span className="font-bold text-[#4A8DFF]">{chosenOffer?.nbfc?.processingFeeDisplay || 'Set by Partner'}</span>
            </div>
          </div>

          <div className="bg-amber-50/80 p-3 rounded-2xl border border-amber-200/80 text-[11px] text-amber-900 font-medium">
            Final approval, interest rate, fees, and disbursal are decided solely by {chosenOffer?.nbfc?.name || 'the lender'} —
            not by Paisa in Minutes. If the new tab didn't open, check your browser's pop-up settings.
          </div>

          <button
            onClick={handleFinalSubmit}
            className="w-full py-3.5 rounded-2xl text-xs sm:text-sm font-extrabold text-white flex items-center justify-center space-x-2 shadow-lg transition bg-[#223981] hover:bg-[#1a2c66] cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Done — Track This Application</span>
          </button>
        </div>
      )}
    </div>
  );
};
