import React, { useState, useEffect } from 'react';
import { useApp, AppProvider } from './context/AppContext';
import { Header } from './components/common/Header';
import { BottomNav } from './components/common/BottomNav';
import { HeroBanner } from './components/home/HeroBanner';
import { CreditGauge } from './components/home/CreditGauge';
import { ProductGrid } from './components/home/ProductGrid';
import { LoanJourneyTracker } from './components/home/LoanJourneyTracker';
import { TrustCarousel } from './components/home/TrustCarousel';
import { LoanApplicationWizard } from './components/loan/LoanApplicationWizard';
import { MultiLenderComparison } from './components/loan/MultiLenderComparison';
import { CreditScoreDetail } from './components/credit/CreditScoreDetail';
import { EmiCalculator } from './components/calculator/EmiCalculator';
import { DocumentVault } from './components/vault/DocumentVault';
import { SupportModal } from './components/support/SupportModal';
import { ProfileSettings } from './components/profile/ProfileSettings';
import { ReferAndEarn } from './components/referral/ReferAndEarn';
import { AuthModal } from './components/auth/AuthModal';
import { TermsConsentModal } from './components/common/TermsConsentModal';
import { warmBackend } from './services/api';
import { X, Activity } from 'lucide-react';

const MainAppContent = () => {
  const { activeTab, setActiveTab, activeLoan } = useApp();
  const [selectedProductForLoan, setSelectedProductForLoan] = useState(null);
  const [showWizardModal, setShowWizardModal] = useState(false);
  const [loanViewMode, setLoanViewMode] = useState('lenders'); // 'lenders' | 'wizard'

  // Pre-warm Render backend immediately on app launch and keep it alive
  useEffect(() => {
    warmBackend();
    const interval = setInterval(() => {
      warmBackend();
    }, 2.5 * 60 * 1000); // Ping every 2.5 minutes while app is in foreground
    return () => clearInterval(interval);
  }, []);

  // Automatically close wizard modal or redirect deprecated tab
  useEffect(() => {
    setShowWizardModal(false);
    if (activeTab === 'affiliate') {
      setActiveTab('home');
    }
  }, [activeTab]);

  const handleProductSelect = (productId) => {
    setSelectedProductForLoan(productId);
    setShowWizardModal(true);
  };

  const handleApplyNowHero = () => {
    setSelectedProductForLoan('personal');
    setShowWizardModal(true);
  };

  const renderActiveScreen = () => {
    if (showWizardModal) {
      return (
        <div className="relative">
          <button 
            onClick={() => setShowWizardModal(false)}
            className="absolute -top-2 right-2 p-2 bg-slate-100 hover:bg-slate-200 text-[#223981] rounded-full z-10 font-bold"
          >
            <X className="w-5 h-5" />
          </button>
          <LoanApplicationWizard 
            preSelectedProduct={selectedProductForLoan}
            onClose={() => setShowWizardModal(false)}
          />
        </div>
      );
    }

    switch (activeTab) {
      case 'home':
        return (
          <div className="space-y-3 max-w-lg mx-auto">
            <HeroBanner onApplyClick={handleApplyNowHero} />
            <CreditGauge />
            <ProductGrid onProductSelect={handleProductSelect} />
            <LoanJourneyTracker />
            <TrustCarousel />
          </div>
        );

      case 'loans':
        return (
          <div className="space-y-3 max-w-2xl mx-auto px-1 sm:px-2">
            {/* View Switcher: 9 Lending Partners vs Step-by-Step Wizard */}
            <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200/80 shadow-2xs">
              <button
                type="button"
                onClick={() => setLoanViewMode('lenders')}
                className={`flex-1 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-black transition cursor-pointer flex items-center justify-center space-x-1.5 ${
                  loanViewMode === 'lenders'
                    ? 'bg-white text-[#1E3A8A] shadow-xs'
                    : 'text-slate-500 hover:text-[#1E3A8A]'
                }`}
              >
                <span>🏢 9 Lending Partners</span>
              </button>
              <button
                type="button"
                onClick={() => setLoanViewMode('wizard')}
                className={`flex-1 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-black transition cursor-pointer flex items-center justify-center space-x-1.5 ${
                  loanViewMode === 'wizard'
                    ? 'bg-white text-[#1E3A8A] shadow-xs'
                    : 'text-slate-500 hover:text-[#1E3A8A]'
                }`}
              >
                <span>🪄 Step-by-Step Apply</span>
              </button>
            </div>

            {loanViewMode === 'lenders' ? (
              <MultiLenderComparison 
                loanAmount={350000} 
                tenureMonths={36} 
                onSelectOffer={(lender) => {
                  setSelectedProductForLoan('personal');
                  setShowWizardModal(true);
                }} 
              />
            ) : (
              <div className="space-y-4 pt-2">
                <ProductGrid onProductSelect={handleProductSelect} />
                <LoanApplicationWizard preSelectedProduct="personal" />
              </div>
            )}
          </div>
        );

      case 'referral':
        return (
          <div className="max-w-lg mx-auto">
            <ReferAndEarn onBack={() => setActiveTab('profile')} />
          </div>
        );

      case 'track':
        return (
          <div className="space-y-4 text-left max-w-lg mx-auto">
            <div className="bg-gradient-to-r from-[#223981] via-[#1E3A8A] to-[#4A8DFF] text-white p-4.5 px-5 rounded-2xl shadow-md border border-[#6FA8FF]/30 space-y-1">
              <h2 className="text-base sm:text-lg font-black tracking-wide leading-tight">Live Application Disbursal Tracker</h2>
              <p className="text-xs text-[#E4EEFF] font-medium leading-normal">End-to-end journey status linked to your PAN & bank account.</p>
            </div>
            {activeLoan.hasActiveLoan ? (
              <LoanJourneyTracker />
            ) : (
              <div className="space-y-4">
                {/* No Active Loan Card */}
                <div className="bg-white rounded-3xl p-6 border border-slate-200 text-center space-y-3 shadow-xs">
                  <div className="w-12 h-12 rounded-2xl bg-[#E4EEFF] text-[#4A8DFF] flex items-center justify-center mx-auto font-black">
                    <Activity className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-extrabold text-[#223981]">No Active Loan Application</h3>
                  <p className="text-xs text-[#717983] max-w-xs mx-auto">
                    Apply for an instant personal loan to track your 8-minute bank account disbursal status live.
                  </p>
                  <button
                    onClick={handleApplyNowHero}
                    className="px-6 py-3 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-extrabold rounded-2xl shadow-md transition"
                  >
                    Start New Application
                  </button>
                </div>

                {/* Supporting 3-Step Visual: How Disbursal Tracking Works (Fix 7) */}
                <div className="bg-slate-50 p-4 rounded-3xl border border-slate-200/80 space-y-3">
                  <h4 className="text-xs font-extrabold text-[#223981] uppercase tracking-wider">
                    How Disbursal Tracking Works
                  </h4>
                  <div className="grid grid-cols-1 gap-2.5 text-xs">
                    <div className="bg-white p-3 rounded-2xl border border-slate-200/60 flex items-start space-x-3">
                      <div className="w-6 h-6 rounded-full bg-[#E4EEFF] text-[#2563EB] font-black text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                        1
                      </div>
                      <div>
                        <p className="font-extrabold text-[#223981]">Select Lender & Apply</p>
                        <p className="text-[11px] text-[#717983] mt-0.5">Choose your preferred offer from our lending partners.</p>
                      </div>
                    </div>

                    <div className="bg-white p-3 rounded-2xl border border-slate-200/60 flex items-start space-x-3">
                      <div className="w-6 h-6 rounded-full bg-[#E4EEFF] text-[#2563EB] font-black text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                        2
                      </div>
                      <div>
                        <p className="font-extrabold text-[#223981]">Complete Paperless e-KYC</p>
                        <p className="text-[11px] text-[#717983] mt-0.5">Verify Aadhaar / PAN and link your bank account for disbursal.</p>
                      </div>
                    </div>

                    <div className="bg-white p-3 rounded-2xl border border-slate-200/60 flex items-start space-x-3">
                      <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 font-black text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                        3
                      </div>
                      <div>
                        <p className="font-extrabold text-[#223981]">Track Real-Time Disbursal</p>
                        <p className="text-[11px] text-[#717983] mt-0.5">Watch step-by-step progress as funds are credited in under 8 minutes.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      case 'credit':
        return (
          <div className="max-w-lg mx-auto">
            <CreditScoreDetail onApplyClick={handleApplyNowHero} />
          </div>
        );

      case 'calculator':
        return (
          <div className="max-w-lg mx-auto">
            <EmiCalculator onApplyWithAmount={(amt) => { handleApplyNowHero(); }} />
          </div>
        );

      case 'vault':
        return (
          <div className="max-w-lg mx-auto">
            <DocumentVault />
          </div>
        );

      case 'profile':
        return (
          <div className="max-w-lg mx-auto">
            <ProfileSettings />
          </div>
        );

      default:
        return (
          <div className="max-w-lg mx-auto">
            <HeroBanner onApplyClick={handleApplyNowHero} />
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans select-none antialiased overflow-x-hidden w-full max-w-full">
      {/* Real Full Screen Mobile Header */}
      <Header />

      {/* Main Full Screen App Viewport */}
      <main className="flex-1 px-3.5 py-3 pb-24 max-w-lg mx-auto w-full space-y-4 overflow-x-hidden">
        {renderActiveScreen()}

        {/* RBI Digital Lending Compliance Disclaimer Footer (Visible on every page) */}
        <footer className="mt-6 pt-4 border-t border-slate-200 text-center space-y-2 px-1">
          <div className="p-3.5 bg-[#E4EEFF]/70 rounded-2xl border border-[#6FA8FF]/30 text-left space-y-1">
            <p className="text-[10px] font-extrabold text-[#223981] uppercase tracking-wide flex items-center">
              🛡️ Regulatory Compliance Disclaimer
            </p>
            <p className="text-[10.5px] text-[#475569] leading-relaxed font-medium">
              Paisa in Minutes is a loan aggregator/marketplace. We do not directly lend money. Loans are sanctioned and disbursed solely by our RBI-registered NBFC/Bank lending partners.
            </p>
          </div>
          <p className="text-[9.5px] text-slate-400 font-semibold pt-1">
            © 2026 Paisa in Minutes. All rights reserved.
          </p>
        </footer>
      </main>

      {/* Sticky Native Bottom Navigation Bar */}
      <BottomNav />

      {/* Permissions, Terms & Conditions Consent Onboarding Modal */}
      <TermsConsentModal />

      {/* Auth Login & Signup Modal */}
      <AuthModal />

      {/* Support & Notification Drawer */}
      <SupportModal />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainAppContent />
    </AppProvider>
  );
}
