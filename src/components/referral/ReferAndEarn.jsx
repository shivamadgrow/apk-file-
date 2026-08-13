import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  ArrowLeft, Gift, Share2, Copy, Check, ChevronDown, ChevronUp, Users, Coins, HelpCircle, Sparkles, Award, Link2, UserCheck, ShieldCheck, CheckCircle2
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const ReferAndEarn = ({ onBack }) => {
  const { user, currentPhone, affiliate, setActiveTab } = useApp();
  const [copied, setCopied] = useState(false);
  const [openFaqIdx, setOpenFaqIdx] = useState(null);

  // Clean user details for personalized link
  const userName = user.name || 'Borrower';
  const cleanPhone = currentPhone ? currentPhone.replace(/\D/g, '') : '9876543210';
  const userFirstName = userName.split(' ')[0].toUpperCase();
  const referralCode = `PIM-${userFirstName}${cleanPhone.slice(-4)}`;

  // Personalized Dynamic Referral Link (with Name + Phone + Terms + UTM Tag)
  const dynamicReferralUrl = `https://paisainminutes.com/ref?name=${encodeURIComponent(userName)}&phone=${cleanPhone}&code=${referralCode}&utm_source=paisainminutesapp`;

  const points = user.referralPoints || 300;

  const handleCopy = () => {
    navigator.clipboard.writeText(dynamicReferralUrl);
    setCopied(true);
    try {
      confetti({ particleCount: 50, spread: 50 });
    } catch (e) {}
    setTimeout(() => setCopied(false), 2200);
  };

  const handleShare = () => {
    try {
      confetti({ particleCount: 70, spread: 60 });
    } catch (e) {}

    const shareText = `🚀 Hi! ${userName} (+91 ${cleanPhone}) invited you to Paisa in Minutes! Get up to ₹15 Lakhs Personal Loan in 8 minutes with zero paperwork!\n\nApply via my exclusive referral link: ${dynamicReferralUrl}\n\nTerms: 0% Processing Fee waiver on your 1st loan!`;
    
    if (navigator.share) {
      navigator.share({
        title: `${userName}'s Exclusive Paisa in Minutes Referral Link`,
        text: shareText,
        url: dynamicReferralUrl,
      }).catch(() => {});
    } else {
      window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`, '_blank');
    }
  };

  const toggleFaq = (index) => {
    setOpenFaqIdx(openFaqIdx === index ? null : index);
  };

  const faqs = [
    {
      q: "How does the referral process work ?",
      a: "Share your unique referral link containing your name & mobile number with your friends. Once they complete e-KYC and get a loan disbursed through Paisa in Minutes, you instantly receive 300 Paisa Points (₹300 Cash) in your wallet."
    },
    {
      q: "Whom can I refer?",
      a: "You can refer any Indian citizen over 21 years of age with a valid PAN & Aadhaar who requires a Personal Loan, Business Loan, Credit Line, or Credit Card."
    },
    {
      q: "Is there a way in which I can track the status of my referrals?",
      a: "Yes! All your referred friends and their real-time application status (Lead Sent, Approved, Disbursed) are tracked under the Referrals section and Affiliate CRM Dashboard."
    },
    {
      q: "Can I get referral points in cash?",
      a: "Absolutely! Your Paisa Points can be directly withdrawn to your UPI ID (Google Pay, PhonePe, Paytm) or linked bank account at 1 Point = ₹1 Ratio anytime."
    },
    {
      q: "My referral has successfully got a loan disbursed. But I am not able to see my points.",
      a: "Points are automatically credited within 2 hours of loan disbursal by the NBFC partner. If you face any delay, click '24x7 Helpdesk' or email info@paisainminutes.com."
    },
    {
      q: "How many points I and my referral will get.",
      a: "You get up to 300 Points (₹300) per successful referral disbursal, and your referred friend receives a 0% processing fee waiver on their first loan!"
    }
  ];

  return (
    <div className="bg-[#F8FAFC] min-h-screen text-left pb-28 relative font-sans">
      
      {/* Top Navigation Bar */}
      <div className="bg-white px-4 py-3.5 border-b border-slate-200 flex items-center justify-between sticky top-0 z-30 shadow-xs">
        <div className="flex items-center space-x-3">
          <button 
            onClick={onBack || (() => setActiveTab('profile'))}
            className="p-1.5 hover:bg-slate-100 rounded-full text-[#223981] transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-base font-extrabold text-[#223981]">Refer & Earn</h1>
        </div>
        
        {/* User Profile Pill */}
        <span className="text-[10.5px] font-extrabold bg-[#E4EEFF] text-[#223981] px-2.5 py-1 rounded-full border border-[#6FA8FF]/30">
          👤 {userName}
        </span>
      </div>

      {/* TOP HERO BANNER: Ice Blue Gradient + Gift Box Confetti Illustration */}
      <div className="bg-gradient-to-b from-[#E4EEFF] via-[#F0F5FF] to-[#F8FAFC] p-6 text-center space-y-4 border-b border-[#6FA8FF]/20 relative overflow-hidden">
        
        {/* Celebration Gift Box Vector Graphic */}
        <div className="relative w-36 h-36 mx-auto flex items-center justify-center">
          <div className="absolute inset-0 bg-[#4A8DFF]/15 rounded-full blur-2xl animate-pulse" />
          
          {/* Confetti particles graphics */}
          <div className="absolute top-2 left-4 w-2.5 h-2.5 bg-rose-400 rounded-full animate-bounce" />
          <div className="absolute top-6 right-6 w-3 h-3 bg-amber-400 rotate-45 animate-pulse" />
          <div className="absolute bottom-4 left-6 w-2.5 h-2.5 bg-emerald-400 rounded-full" />
          <div className="absolute bottom-6 right-4 w-3 h-3 bg-[#4A8DFF] rotate-12" />

          {/* Main Gift Box Icon */}
          <div className="w-24 h-24 bg-gradient-to-tr from-amber-400 via-amber-300 to-amber-500 rounded-3xl shadow-xl flex items-center justify-center transform hover:scale-105 transition-transform duration-300 border-2 border-white/80 relative">
            <Gift className="w-14 h-14 text-white fill-white/20" />
            <div className="absolute -top-3 bg-rose-500 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full shadow-md tracking-wider">
              🎁 WIN CASH
            </div>
          </div>
        </div>

        {/* Subtitle Matching Screenshot */}
        <p className="text-sm font-extrabold text-[#223981] max-w-xs mx-auto leading-snug">
          Refer your friend and get upto <span className="text-[#4A8DFF] underline decoration-2">300 points</span>
        </p>

        {/* Paisa Points Balance Pill Box */}
        <div className="bg-white rounded-2xl p-4 shadow-md border border-slate-200/80 max-w-sm mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9.5 h-9.5 rounded-xl bg-[#223981] text-white flex items-center justify-center flex-shrink-0 shadow-sm">
              <Gift className="w-5 h-5 text-[#6FA8FF]" />
            </div>
            <span className="font-extrabold text-[#223981] text-sm sm:text-base">Paisa Points</span>
          </div>
          
          <div className="flex items-center space-x-2 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200/80">
            <Coins className="w-5 h-5 text-amber-500 fill-amber-400" />
            <span className="text-lg font-black text-[#223981]">{points}</span>
          </div>
        </div>
      </div>

      {/* DYNAMIC PERSONALIZED REFERRAL LINK & TERMS CARD (CLEAN & PERFECT UI/UX) */}
      <div className="p-4 sm:p-5 space-y-4 max-w-lg mx-auto">
        
        <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/90 shadow-md space-y-3.5 relative overflow-hidden">
          
          {/* Header Row: Title & Badge */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div className="flex items-center space-x-2">
              <div className="w-7 h-7 rounded-lg bg-[#E4EEFF] text-[#2563EB] flex items-center justify-center font-black flex-shrink-0">
                <Link2 className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-black text-[#223981] uppercase tracking-wider">
                Your Exclusive Referral Link
              </h3>
            </div>

            <span className="text-[10px] font-extrabold bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full border border-emerald-200 whitespace-nowrap">
              Active • Code: {referralCode}
            </span>
          </div>

          {/* Logged in User Profile Info Tag */}
          <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200/80 flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#223981] to-[#4A8DFF] text-white flex items-center justify-center text-xs font-black shadow-xs">
                {userName.charAt(0)}
              </div>
              <div>
                <span className="text-[9.5px] font-extrabold text-[#717983] uppercase block leading-none">Referrer Name</span>
                <span className="font-extrabold text-[#223981] text-xs">{userName}</span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[9.5px] font-extrabold text-[#717983] uppercase block leading-none">Mobile No.</span>
              <span className="font-extrabold text-[#223981] font-mono text-xs">{user.phone || `+91 ${cleanPhone}`}</span>
            </div>
          </div>

          {/* Referral Link & Prominent Copy Button Row */}
          <div className="space-y-1.5">
            <span className="text-[10.5px] font-extrabold text-[#717983] block px-0.5">Shareable Referral Link:</span>
            <div className="flex items-stretch space-x-2">
              <div className="flex-1 bg-slate-50 border border-slate-300 rounded-2xl px-3 py-2.5 text-xs font-mono font-bold text-[#223981] flex items-center overflow-hidden">
                <span className="truncate">{dynamicReferralUrl}</span>
              </div>

              <button
                onClick={handleCopy}
                className="px-4 py-2.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-extrabold text-xs rounded-2xl shadow-md shadow-[#2563EB]/25 transition active:scale-95 flex items-center space-x-1.5 flex-shrink-0"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-white" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-white" />
                    <span>Copy URL</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* 2 Referral Terms & Conditions Box */}
          <div className="bg-[#E4EEFF]/70 p-3.5 rounded-2xl border border-[#6FA8FF]/30 space-y-2 text-xs text-[#223981]">
            <p className="font-extrabold text-xs text-[#223981] flex items-center">
              <ShieldCheck className="w-4 h-4 mr-1.5 text-[#2563EB] flex-shrink-0" />
              Referral Terms & Conditions:
            </p>
            
            <div className="space-y-1.5 text-[11px] font-semibold text-[#1E293B]">
              <div className="flex items-start space-x-2 bg-white p-2.5 rounded-xl border border-slate-200/60 shadow-2xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                <span><strong>Term 1:</strong> Your referred friend must apply & complete e-KYC using link containing your mobile number (<strong>{cleanPhone}</strong>).</span>
              </div>

              <div className="flex items-start space-x-2 bg-white p-2.5 rounded-xl border border-slate-200/60 shadow-2xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                <span><strong>Term 2:</strong> 300 Paisa Points (₹300 Cash) will be auto-credited to your account upon friend's first loan disbursal.</span>
              </div>
            </div>
          </div>

        </div>

        {/* REFERRALS SECTION */}
        <div className="space-y-2 pt-1">
          <h2 className="text-sm font-extrabold text-[#223981]">Referrals</h2>

          {/* Empty Referrals Illustration */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 text-center space-y-3 shadow-2xs">
            <div className="w-16 h-16 bg-[#E4EEFF] rounded-full flex items-center justify-center mx-auto text-[#2563EB]">
              <Users className="w-8 h-8 text-[#2563EB]" />
            </div>
            <p className="text-xs font-extrabold text-[#223981]">No referral yet</p>
            <p className="text-[11px] text-[#717983] font-medium leading-relaxed">
              Share your referral link above with friends and earn 300 Paisa Points on every successful loan disbursal!
            </p>
          </div>
        </div>

        {/* FAQS ACCORDION SECTION */}
        <div className="space-y-3 pt-2">
          <h2 className="text-sm font-extrabold text-[#223981]">FAQs</h2>

          <div className="space-y-2.5">
            {faqs.map((faq, idx) => (
              <div 
                key={idx}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden transition-all"
              >
                <button
                  onClick={() => toggleFaq(idx)}
                  className="w-full p-4 text-left flex items-center justify-between space-x-2 hover:bg-slate-50 transition"
                >
                  <span className="text-xs sm:text-sm font-extrabold text-[#223981] leading-snug">
                    {faq.q}
                  </span>
                  {openFaqIdx === idx ? (
                    <ChevronUp className="w-4 h-4 text-[#2563EB] flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-[#717983] flex-shrink-0" />
                  )}
                </button>

                {openFaqIdx === idx && (
                  <div className="px-4 pb-4 text-xs text-[#717983] font-medium border-t border-slate-100 pt-2.5 leading-relaxed bg-slate-50/50">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* FIXED BOTTOM SHARE BAR */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 p-3 sm:p-4 shadow-xl">
        <div className="max-w-md mx-auto flex items-center space-x-2.5">
          
          {/* Dashed Link Box with Side Copy URL */}
          <div className="flex-1 bg-slate-50 border-2 border-dashed border-slate-300 rounded-2xl px-3 py-2 flex items-center justify-between overflow-hidden">
            <span className="text-[11px] font-mono font-bold text-[#223981] truncate mr-1">
              {dynamicReferralUrl}
            </span>
            <button 
              onClick={handleCopy}
              className="px-2.5 py-1.5 bg-slate-200 hover:bg-[#E4EEFF] text-[#2563EB] text-[10.5px] font-extrabold rounded-xl transition flex-shrink-0 flex items-center space-x-1"
              title="Copy URL"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>

          {/* Primary Blue Share Button */}
          <button
            onClick={handleShare}
            className="py-3 px-5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-extrabold text-xs sm:text-sm rounded-2xl shadow-lg shadow-[#2563EB]/30 transition active:scale-95 flex items-center justify-center space-x-1.5 flex-shrink-0"
          >
            <span>Share</span>
            <Share2 className="w-4 h-4" />
          </button>

        </div>
      </div>

    </div>
  );
};
