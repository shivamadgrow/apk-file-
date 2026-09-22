import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Building2, User, ShieldCheck, CheckCircle2, FileText, 
  Upload, ArrowRight, Sparkles, Clock, AlertCircle 
} from 'lucide-react';

export const AffiliateOnboarding = () => {
  const { affiliate, setAffiliate } = useApp();
  const [accountType, setAccountType] = useState('individual'); // 'individual' | 'company'
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedStatus, setSubmittedStatus] = useState(null); // null | 'pending' | 'approved'

  // Individual Form Fields
  const [indForm, setIndForm] = useState({
    name: '',
    phone: '',
    email: '',
    pan: '',
    upiId: ''
  });

  // Company Form Fields
  const [compForm, setCompForm] = useState({
    companyName: '',
    gstin: '',
    companyPan: '',
    signatoryName: '',
    signatoryPan: '',
    bankAccount: '',
    ifsc: ''
  });

  const [acceptedTerms, setAcceptedTerms] = useState(true);

  const handleSubmitRegistration = (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      setSubmittedStatus('approved'); // Instantly approve in demo mode

      setAffiliate({
        ...affiliate,
        isApproved: true,
        accountType: accountType,
        company: accountType === 'company' ? {
          companyName: compForm.companyName,
          gstin: compForm.gstin,
          companyPan: compForm.companyPan,
          regCertificate: "REG-MH-2024-9912.pdf",
          subAgents: 3
        } : affiliate.company
      });
    }, 1200);
  };

  if (submittedStatus === 'pending') {
    return (
      <div className="bg-white rounded-3xl p-6 border border-paisa-light shadow-xl text-center space-y-4 my-4">
        <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto text-amber-600 border border-amber-200">
          <Clock className="w-7 h-7 animate-spin" />
        </div>
        <h2 className="text-xl font-extrabold text-paisa-navy">Affiliate Application Under Review</h2>
        <p className="text-xs text-paisa-secondaryText max-w-md mx-auto leading-relaxed">
          Your partner verification documents have been submitted to the Paisa in Minutes Risk & Compliance Team. Estimated approval time: &lt; 15 Minutes.
        </p>
        <div className="bg-paisa-light p-3.5 rounded-2xl text-xs font-semibold text-paisa-navy">
          Registration Ref ID: <strong className="text-paisa-primary">PM-AFF-2026-8819</strong>
        </div>
        <button
          onClick={() => {
            setAffiliate({ ...affiliate, isApproved: true });
          }}
          className="px-6 py-2.5 bg-paisa-primary text-white font-bold text-xs rounded-xl shadow hover:bg-paisa-navy transition"
        >
          Fast-Track Instant Admin Approval (Demo Switch)
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl p-5 border border-paisa-light shadow-xl my-4 text-left">
      {/* Header */}
      <div className="flex items-center space-x-3 mb-4 pb-4 border-b border-slate-100">
        <div className="w-12 h-12 rounded-2xl bg-white p-1 flex items-center justify-center shadow-md border border-slate-100 overflow-hidden flex-shrink-0">
          <img src="/logo.png" alt="Paisa in Minutes Logo" className="w-full h-full object-contain" />
        </div>
        <div>
          <span className="text-[10px] font-extrabold uppercase bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full">
            MONETIZE LEADS
          </span>
          <h1 className="text-xl font-extrabold text-paisa-navy">Become an Affiliate Partner</h1>
          <p className="text-xs text-paisa-secondaryText">Earn up to 3.2% per disbursed loan + instant UPI payouts.</p>
        </div>
      </div>

      {/* Account Type Selector Toggle */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        <button
          type="button"
          onClick={() => setAccountType('individual')}
          className={`p-3 rounded-2xl border flex items-center space-x-2 transition ${
            accountType === 'individual' 
              ? 'border-2 border-paisa-primary bg-paisa-light/60 text-paisa-navy font-bold shadow-sm' 
              : 'border-slate-200 text-paisa-secondaryText hover:bg-slate-50'
          }`}
        >
          <User className="w-5 h-5 text-paisa-primary" />
          <div className="text-left">
            <p className="text-xs font-bold">Individual Partner</p>
            <p className="text-[10px] font-medium text-paisa-secondaryText">DSA / Financial Advisor</p>
          </div>
        </button>

        <button
          type="button"
          onClick={() => setAccountType('company')}
          className={`p-3 rounded-2xl border flex items-center space-x-2 transition ${
            accountType === 'company' 
              ? 'border-2 border-paisa-primary bg-paisa-light/60 text-paisa-navy font-bold shadow-sm' 
              : 'border-slate-200 text-paisa-secondaryText hover:bg-slate-50'
          }`}
        >
          <Building2 className="w-5 h-5 text-paisa-primary" />
          <div className="text-left">
            <p className="text-xs font-bold">Register a Company</p>
            <p className="text-[10px] font-medium text-paisa-secondaryText">Pvt Ltd / LLP / Partnership</p>
          </div>
        </button>
      </div>

      <form onSubmit={handleSubmitRegistration} className="space-y-4">
        {accountType === 'individual' ? (
          <>
            <div>
              <label className="block text-xs font-bold text-paisa-navy mb-1">Full Legal Name (as per PAN)</label>
              <input 
                type="text"
                value={indForm.name}
                onChange={(e) => setIndForm({ ...indForm, name: e.target.value })}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-paisa-navy"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-paisa-navy mb-1">PAN Card Number</label>
                <input 
                  type="text"
                  value={indForm.pan}
                  onChange={(e) => setIndForm({ ...indForm, pan: e.target.value })}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-paisa-navy uppercase"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-paisa-navy mb-1">Mobile Number</label>
                <input 
                  type="text"
                  value={indForm.phone}
                  onChange={(e) => setIndForm({ ...indForm, phone: e.target.value })}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-paisa-navy"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-paisa-navy mb-1">Payout UPI ID / Bank IMPS</label>
              <input 
                type="text"
                value={indForm.upiId}
                onChange={(e) => setIndForm({ ...indForm, upiId: e.target.value })}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-paisa-navy"
                placeholder="e.g. yourname@upi"
                required
              />
            </div>
          </>
        ) : (
          <>
            <div>
              <label className="block text-xs font-bold text-paisa-navy mb-1">Registered Company Name</label>
              <input 
                type="text"
                value={compForm.companyName}
                onChange={(e) => setCompForm({ ...compForm, companyName: e.target.value })}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-paisa-navy"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-paisa-navy mb-1">GSTIN Number</label>
                <input 
                  type="text"
                  value={compForm.gstin}
                  onChange={(e) => setCompForm({ ...compForm, gstin: e.target.value })}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-paisa-navy uppercase"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-paisa-navy mb-1">Company PAN</label>
                <input 
                  type="text"
                  value={compForm.companyPan}
                  onChange={(e) => setCompForm({ ...compForm, companyPan: e.target.value })}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-paisa-navy uppercase"
                  required
                />
              </div>
            </div>

            {/* Document Upload Container */}
            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FileText className="w-5 h-5 text-paisa-primary" />
                <div>
                  <p className="text-xs font-bold text-paisa-navy">Certificate of Incorporation / GST Cert</p>
                  <p className="text-[10px] text-emerald-600 font-semibold">Ready for Upload (PDF)</p>
                </div>
              </div>
              <span className="text-xs font-bold text-paisa-primary bg-white px-3 py-1 rounded-xl border">
                Upload
              </span>
            </div>
          </>
        )}

        {/* Agreement Checkbox */}
        <div className="flex items-start space-x-2 pt-2">
          <input 
            type="checkbox" 
            id="affiliateTerms"
            checked={acceptedTerms}
            onChange={(e) => setAcceptedTerms(e.target.checked)}
            className="mt-0.5 w-4 h-4 accent-paisa-primary cursor-pointer"
          />
          <label htmlFor="affiliateTerms" className="text-[11px] text-paisa-navy font-semibold cursor-pointer">
            I accept Paisa in Minutes Affiliate Partner Commission Rules, TDS tax deduction guidelines, and Ethical Referral Policy.
          </label>
        </div>

        <button
          type="submit"
          disabled={!acceptedTerms || isSubmitting}
          className={`w-full py-3.5 rounded-2xl text-xs font-extrabold text-white shadow-lg flex items-center justify-center space-x-2 transition ${
            acceptedTerms && !isSubmitting
              ? 'bg-gradient-to-r from-paisa-navy to-paisa-primary hover:scale-[1.01] cursor-pointer'
              : 'bg-slate-300 cursor-not-allowed'
          }`}
        >
          {isSubmitting ? (
            <span>Verifying Partner KYC...</span>
          ) : (
            <>
              <span>Submit Affiliate Partner Application</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>
    </div>
  );
};
