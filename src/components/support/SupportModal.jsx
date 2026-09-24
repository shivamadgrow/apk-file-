import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Bell, MessageSquare, PhoneCall, HelpCircle, X, Send, CheckCircle2, Shield, Bot, User, Sparkles, Languages, ChevronRight, Zap, ArrowRight, Calculator, CreditCard, Share2
} from 'lucide-react';

const INDIAN_LANGUAGES = [
  { id: 'en', name: 'English', flag: '🇬🇧', greeting: 'Hello! I am PaisaBot AI Assistant 🤖. How can I help you with your loan application, EMI, or eligibility today?' },
  { id: 'hi', name: 'हिन्दी / Hinglish', flag: '🇮🇳', greeting: 'नमस्ते! मैं पैसाबॉट AI असिस्टेंट हूँ। आज मैं लोन एलिजिबिलिटी, EMI या पेआउट के बारे में आपकी क्या मदद कर सकता हूँ?' },
  { id: 'mr', name: 'मराठी', flag: '🇮🇳', greeting: 'नमस्कार! मी पैसाबॉट AI आहे. कर्ज पात्रता, व्याजदर किंवा अर्जाबद्दल मदत हवी आहे का?' },
  { id: 'ta', name: 'தமிழ்', flag: '🇮🇳', greeting: 'வணக்கம்! நான் பைசாபாட் AI. கடன் தகுதி மற்றும் வட்டி விகிதங்கள் பற்றி உதவ தயார்!' },
  { id: 'te', name: 'తెలుగు', flag: '🇮🇳', greeting: 'నమస్కారం! నేను పైసాబాట్ AI. లోన్ అర్హత మరియు వడ్డీ రేట్ల వివరాలు తెలుసుకోండి!' }
];

export const SupportModal = () => {
  const { isSupportOpen, setIsSupportOpen, notifications, markNotificationRead, user, activeLoan, setActiveTab } = useApp();
  const [activeTab, setActiveTabLocal] = useState('chat');

  const [selectedLang, setSelectedLang] = useState('en');
  const currentLangObj = INDIAN_LANGUAGES.find(l => l.id === selectedLang) || INDIAN_LANGUAGES[0];

  const displayName = user && user.name && user.name !== 'Guest User' ? user.name : 'Borrower';

  const [chatMessages, setChatMessages] = useState([
    { 
      id: 1, 
      sender: 'bot', 
      text: `Hello ${displayName}! 👋 I am PaisaBot AI Assistant 🤖. Ask me anything about Instant Personal Loans, EMI Calculation, Low Salary Approval (₹12k+), 8-Minute Disbursal, or CIBIL Improvement!`,
      suggestions: [
        { label: '🚀 Apply for Loan', actionType: 'loans' },
        { label: '📊 Calculate EMI', actionType: 'calculator' },
        { label: '🎯 Check CIBIL Score', actionType: 'credit' }
      ]
    }
  ]);

  const [inputMsg, setInputMsg] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [callbackPhone, setCallbackPhone] = useState(user.phone || '+91 98765 43210');
  const [callbackRequested, setCallbackRequested] = useState(false);

  const chatEndRef = useRef(null);

  // Auto scroll chat to bottom
  useEffect(() => {
    if (activeTab === 'chat' && chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, isTyping, activeTab]);

  const handleLangChange = (langId) => {
    setSelectedLang(langId);
    const lang = INDIAN_LANGUAGES.find(l => l.id === langId);
    if (lang) {
      setChatMessages(prev => [
        ...prev,
        { 
          id: Date.now(), 
          sender: 'bot', 
          text: `🌐 Switched language to ${lang.name}. ${lang.greeting}`,
          suggestions: [
            { label: '🚀 Apply Now', actionType: 'loans' },
            { label: '📊 EMI Calculator', actionType: 'calculator' }
          ]
        }
      ]);
    }
  };

  if (!isSupportOpen) return null;

  // Handle Suggestion Button Clicks inside Chat
  const handleSuggestionClick = (actionType) => {
    setIsSupportOpen(false);
    if (actionType === 'loans') setActiveTab('loans');
    else if (actionType === 'calculator') setActiveTab('calculator');
    else if (actionType === 'credit') setActiveTab('credit');
    else if (actionType === 'referral') setActiveTab('referral');
    else if (actionType === 'vault') setActiveTab('vault');
    else if (actionType === 'track') setActiveTab('track');
    else if (actionType === 'callback') {
      setIsSupportOpen(true);
      setActiveTabLocal('callback');
    }
  };

  // ADVANCED CONVERSATIONAL AI INTENT ENGINE & KNOWLEDGE BASE
  const generateBotReply = (userText, langId) => {
    const text = userText.trim().toLowerCase();

    // 1. GREETINGS INTENT ("hi", "hello", "hey", "namaste", "good morning")
    if (/^(hi|hello|hey|heylo|namaste|hlo|gm|ge|greetings)$/i.test(text) || text.startsWith('hi ') || text.startsWith('hello ')) {
      return {
        text: `Hello ${displayName}! 👋 Main PaisaBot AI Assistant hoon. Aap mujhse Instant Personal Loan, EMI calculation, Low Salary (₹12,000+), 8-Minute Disbursal, ya CIBIL score ke baare me kuch bhi pooch sakte hain!`,
        suggestions: [
          { label: '🚀 Apply Instant Loan', actionType: 'loans' },
          { label: '💰 Check Interest Rates', actionType: 'calculator' },
          { label: '🎯 Free CIBIL Check', actionType: 'credit' }
        ]
      };
    }

    // 2. ACKNOWLEDGEMENTS & CASUAL AFFIRMATION ("okay", "ok", "thik h", "got it", "thanks", "thank you")
    if (/^(okay|ok|thik h|theek hai|got it|thanks|thank you|kk|sure)$/i.test(text) || text.includes('thank')) {
      return {
        text: `Great! 🌟 Aapka swagat hai ${displayName}! Kya aap abhi instant loan apply karna chahte hain ya apni EMI calculate karna chahte hain?`,
        suggestions: [
          { label: '🚀 Apply Instant Loan', actionType: 'loans' },
          { label: '📊 EMI Calculator', actionType: 'calculator' },
          { label: '📞 Request Call-Back', actionType: 'callback' }
        ]
      };
    }

    // 3. SPECIFIC EMI CALCULATION INTENT ("emi", "emi kesi h", "emi kitni", "emi kaise", "per month")
    if (text.includes('emi')) {
      return {
        text: `💰 **EMI Calculation & Breakdown:**\n\n• ₹1,00,000 Personal Loan @ 9.99% p.a. interest:\n  - 12 Months Tenure: ~₹8,791 / month EMI\n  - 24 Months Tenure: ~₹4,614 / month EMI\n  - 36 Months Tenure: ~₹3,227 / month EMI\n\nAap humare Interactive EMI Calculator par apne manpasand loan amount aur tenure ki EMI check kar sakte hain!`,
        suggestions: [
          { label: '📊 Open EMI Calculator', actionType: 'calculator' },
          { label: '🚀 Apply Now', actionType: 'loans' }
        ]
      };
    }

    // 4. ELIGIBILITY & LOW SALARY INTENT ("salary", "12k", "15k", "20k", "eligibility", "patrata", "kam kamai")
    if (text.includes('salary') || text.includes('eligible') || text.includes('patrata') || text.includes('15k') || text.includes('20k') || text.includes('12k') || text.includes('minimum')) {
      return {
        text: `💡 **Loan Eligibility Criteria:**\n• Minimum Income: ₹25,000 / month (Salaried)\n• Age Limit: 21 to 58 Years\n• Required Documents: 100% Digital (PAN Card + Aadhaar OTP)\n\n👉 Hamare 9 Verified Partner Lenders (Ticket 2 Loan, Jhatpat Loans, Shubh Cash, Udhaar Now, Insta Rupees, Borrowera, Easy Fincare, Loan Within, Rupay91) aapki salary ke hisaab se instant loan provide karte hain!`,
        suggestions: [
          { label: '🚀 Apply for Loan', actionType: 'loans' },
          { label: '📊 Calculate EMI', actionType: 'calculator' }
        ]
      };
    }

    // 5. REQUIRED DOCUMENTS INTENT ("document", "kagaj", "pan", "aadhaar", "proof", "kyc")
    if (text.includes('document') || text.includes('kagaj') || text.includes('pan') || text.includes('aadhaar') || text.includes('kyc') || text.includes('proof')) {
      return {
        text: `📄 **100% Paperless Digital e-KYC Requirements:**\n1. PAN Card Number\n2. Aadhaar Card linked Mobile Number (for instant OTP verification)\n3. 3-Month Bank Statement / NetBanking Login\n\nZero physical documentation required! Disbursal takes under 8 minutes!`,
        suggestions: [
          { label: '🔒 Document Vault', actionType: 'vault' },
          { label: '🚀 Start Loan e-KYC', actionType: 'loans' }
        ]
      };
    }

    // 6. DISBURSAL SPEED / TIME INTENT ("time", "speed", "kab aayega", "fast", "disbursal", "minutes")
    if (text.includes('time') || text.includes('speed') || text.includes('kab') || text.includes('fast') || text.includes('disbursal') || text.includes('minute')) {
      return {
        text: `⚡ **Paisa Milega, Minutes Mein!**\nWithin **6 to 8 minutes** of completing digital e-KYC and e-Signing your loan agreement, money is directly transferred into your bank account via instant IMPS!`,
        suggestions: [
          { label: '📑 Track Application', actionType: 'track' },
          { label: '🚀 Apply Now', actionType: 'loans' }
        ]
      };
    }

    // 7. INTEREST RATES & CHARGES INTENT ("rate", "interest", "byaj", "charge", "fee")
    if (text.includes('rate') || text.includes('interest') || text.includes('byaj') || text.includes('charge') || text.includes('fee')) {
      return {
        text: `💰 **Interest Rates & Charges:**\n• Starting Rate: 9.99% p.a. onwards\n• Loan Tenure: 6 to 60 Months\n• Processing Fee: 0% to 2% (as per partner NBFC offers)\n• 100% Transparent - Zero hidden charges!`,
        suggestions: [
          { label: '📊 Calculate My EMI', actionType: 'calculator' },
          { label: '🚀 Compare 6 NBFCs', actionType: 'loans' }
        ]
      };
    }

    // 8. CIBIL SCORE & IMPROVEMENT INTENT ("cibil", "score", "credit", "bad score", "experian")
    if (text.includes('cibil') || text.includes('score') || text.includes('credit') || text.includes('experian')) {
      return {
        text: `🎯 **CIBIL Score Analysis (${user.creditScore || 782} ${user.scoreCategory || 'Good'}):**\n• Scores above 750 get instant pre-approved credit lines!\n• Tips to boost score: 1. Always pay bills on time, 2. Keep credit utilization <30%, 3. Avoid frequent loan rejections.`,
        suggestions: [
          { label: '🎯 Check Free CIBIL', actionType: 'credit' },
          { label: '🚀 Apply Low-CIBIL Loan', actionType: 'loans' }
        ]
      };
    }

    // 9. REFERRAL INTENT ("refer", "earn", "dost", "points", "wallet")
    if (text.includes('refer') || text.includes('earn') || text.includes('dost') || text.includes('invite') || text.includes('wallet') || text.includes('point')) {
      return {
        text: `🎁 **Refer & Earn Rewards:**\n• Invite friends & family using your personalized referral link!\n• Earn 300 Paisa Points (₹300 Cash) per successful loan disbursal.\n• Withdraw earnings anytime directly to your UPI ID (GPay/PhonePe)!`,
        suggestions: [
          { label: '🎁 Open Refer & Earn', actionType: 'referral' },
          { label: '🚀 Apply Instant Loan', actionType: 'loans' }
        ]
      };
    }

    // 10. QUERY / TRACKING INTENT ("status", "track", "query", "application")
    if (text.includes('status') || text.includes('track') || text.includes('query') || text.includes('application')) {
      if (activeLoan.hasActiveLoan) {
        return {
          text: `📑 Application ID: **${activeLoan.id || 'PL-2026-9812'}**\nAmount: ₹${(activeLoan.amount || 350000).toLocaleString()}\nStatus: **Approved & e-Signed** - Bank transfer in progress (< 5 mins)!`,
          suggestions: [
            { label: '📑 View Live Tracker', actionType: 'track' },
            { label: '📞 Request Call-Back', actionType: 'callback' }
          ]
        };
      }
      return {
        text: `No active loan query found for ${user.phone || 'your number'}. Tap 'Apply Now' below to get instant loan offers up to ₹15 Lakhs!`,
        suggestions: [
          { label: '🚀 Apply Instant Loan', actionType: 'loans' },
          { label: '📊 Calculate EMI', actionType: 'calculator' }
        ]
      };
    }

    // NATURAL FALLBACK WITH EXPLICIT ADVICE & SUGGESTIONS
    return {
      text: `Main samajh gaya ${displayName}! Loan ya EMI ke baare me aap kuch bhi pooch sakte hain:\n1. 🚀 Instant Loan Eligibility & Low Salary (₹12k+)\n2. 📊 EMI Calculation & Tenure\n3. ⚡ 8-Minute Paperless Disbursal\n4. 🎯 Free CIBIL Check & Tips`,
      suggestions: [
        { label: '🚀 Apply Instant Loan', actionType: 'loans' },
        { label: '📊 EMI Calculator', actionType: 'calculator' },
        { label: '🎯 CIBIL Check', actionType: 'credit' }
      ]
    };
  };

  const handleSendChat = (e, customText = null) => {
    if (e) e.preventDefault();
    const userText = customText || inputMsg;
    if (!userText.trim() || isTyping) return;

    setChatMessages(prev => [...prev, { id: Date.now(), sender: 'user', text: userText }]);
    if (!customText) setInputMsg('');
    setIsTyping(true);

    setTimeout(() => {
      const replyObj = generateBotReply(userText, selectedLang);
      setChatMessages(prev => [
        ...prev, 
        { 
          id: Date.now() + 1, 
          sender: 'bot', 
          text: replyObj.text,
          suggestions: replyObj.suggestions || []
        }
      ]);
      setIsTyping(false);
    }, 850);
  };

  const handleCallbackSubmit = (e) => {
    e.preventDefault();
    setCallbackRequested(true);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/65 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 font-sans select-none">
      <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl flex flex-col h-[600px] max-h-[92vh] text-left border border-slate-200 animate-in fade-in zoom-in duration-200">
        
        {/* Sleek Gradient Header */}
        <div className="bg-gradient-to-r from-[#223981] via-[#2563EB] to-[#4A8DFF] text-white p-4 flex items-center justify-between shadow-md">
          <div className="flex items-center space-x-3">
            
            {/* Bot Avatar with Online Badge */}
            <div className="relative">
              <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white font-black shadow-md border border-white/20">
                <Bot className="w-5.5 h-5.5 text-white" />
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-400 border-2 border-[#223981] rounded-full" />
            </div>

            <div>
              <h3 className="text-sm font-black text-white flex items-center tracking-wide">
                <span>PaisaBot Advanced AI</span>
                <Sparkles className="w-3.5 h-3.5 ml-1 text-amber-300 animate-pulse" />
              </h3>
              <p className="text-[10.5px] text-white/90 font-semibold">24x7 Intelligent Loan & Financial Assistant</p>
            </div>
          </div>

          <button 
            onClick={() => setIsSupportOpen(false)}
            className="p-1.5 hover:bg-white/20 rounded-full transition text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modern Segmented Navigation Tabs */}
        <div className="p-2 bg-slate-100/90 border-b border-slate-200/80">
          <div className="grid grid-cols-4 bg-slate-200/70 p-1 rounded-2xl text-xs font-black text-[#717983]">
            <button
              onClick={() => setActiveTabLocal('chat')}
              className={`py-2 rounded-xl transition-all duration-200 ${activeTab === 'chat' ? 'bg-white text-[#2563EB] shadow-xs' : 'hover:text-[#223981]'}`}
            >
              AI Chat
            </button>
            <button
              onClick={() => setActiveTabLocal('notifications')}
              className={`py-2 rounded-xl transition-all duration-200 ${activeTab === 'notifications' ? 'bg-white text-[#2563EB] shadow-xs' : 'hover:text-[#223981]'}`}
            >
              Alerts
            </button>
            <button
              onClick={() => setActiveTabLocal('faq')}
              className={`py-2 rounded-xl transition-all duration-200 ${activeTab === 'faq' ? 'bg-white text-[#2563EB] shadow-xs' : 'hover:text-[#223981]'}`}
            >
              FAQs
            </button>
            <button
              onClick={() => setActiveTabLocal('callback')}
              className={`py-2 rounded-xl transition-all duration-200 ${activeTab === 'callback' ? 'bg-white text-[#2563EB] shadow-xs' : 'hover:text-[#223981]'}`}
            >
              Call-Back
            </button>
          </div>
        </div>

        {/* TAB 1: SMART MULTILINGUAL CONVERSATIONAL AI CHAT */}
        {activeTab === 'chat' && (
          <div className="flex-1 flex flex-col justify-between overflow-hidden bg-[#F8FAFC]">
            
            {/* Multilingual Horizontal Language Selector Bar */}
            <div className="bg-[#E4EEFF]/90 px-3 py-2 border-b border-[#6FA8FF]/30 flex items-center space-x-2 overflow-x-auto no-scrollbar">
              <div className="flex items-center space-x-1 text-[#2563EB] text-[11px] font-black flex-shrink-0">
                <Languages className="w-3.5 h-3.5" />
                <span>Language:</span>
              </div>
              <div className="flex items-center space-x-1.5 overflow-x-auto no-scrollbar">
                {INDIAN_LANGUAGES.map((lang) => (
                  <button
                    key={lang.id}
                    onClick={() => handleLangChange(lang.id)}
                    className={`px-2.5 py-1 rounded-xl text-[10.5px] font-extrabold whitespace-nowrap transition-all ${
                      selectedLang === lang.id
                        ? 'bg-[#2563EB] text-white shadow-xs'
                        : 'bg-white text-[#223981] hover:bg-slate-100 border border-slate-200/80'
                    }`}
                  >
                    <span>{lang.flag} {lang.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Scrollable Messages Area */}
            <div className="flex-1 overflow-y-auto p-3.5 space-y-3">
              {chatMessages.map((m) => (
                <div 
                  key={m.id}
                  className={`flex items-start space-x-2 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {m.sender === 'bot' && (
                    <div className="w-7 h-7 rounded-xl bg-[#223981] text-white flex items-center justify-center flex-shrink-0 mt-0.5 shadow-2xs">
                      <Bot className="w-4 h-4 text-[#6FA8FF]" />
                    </div>
                  )}

                  <div className={`max-w-[86%] space-y-2`}>
                    <div className={`p-3 rounded-2xl text-xs leading-relaxed whitespace-pre-line ${
                      m.sender === 'user' 
                        ? 'bg-[#2563EB] text-white font-extrabold rounded-tr-none shadow-sm' 
                        : 'bg-gradient-to-r from-[#E4EEFF]/90 to-[#F0F5FF] text-[#223981] font-semibold rounded-tl-none border border-[#6FA8FF]/30 shadow-2xs'
                    }`}>
                      {m.text.replace(/\*\*/g, '')}
                    </div>

                    {/* Interactive Action Suggestion Buttons attached to Bot Messages */}
                    {m.sender === 'bot' && m.suggestions && m.suggestions.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-0.5">
                        {m.suggestions.map((sug, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleSuggestionClick(sug.actionType)}
                            className="px-2.5 py-1.5 bg-white hover:bg-[#E4EEFF] text-[#2563EB] text-[10.5px] font-black rounded-xl border border-[#2563EB]/30 shadow-2xs transition active:scale-95 flex items-center space-x-1"
                          >
                            <span>{sug.label}</span>
                            <ChevronRight className="w-3 h-3 text-[#2563EB]" />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {m.sender === 'user' && (
                    <div className="w-7 h-7 rounded-xl bg-[#2563EB] text-white flex items-center justify-center flex-shrink-0 mt-0.5 shadow-2xs">
                      <User className="w-4 h-4 text-white" />
                    </div>
                  )}
                </div>
              ))}

              {/* Listening & Typing Indicator */}
              {isTyping && (
                <div className="flex items-center space-x-2 text-[#2563EB] text-xs font-black bg-white p-2.5 rounded-2xl rounded-tl-none border border-slate-200 max-w-[75%] shadow-2xs animate-pulse">
                  <Bot className="w-4 h-4 text-[#223981]" />
                  <span>PaisaBot AI analyzing answer</span>
                  <div className="flex space-x-1">
                    <span className="w-1.5 h-1.5 bg-[#2563EB] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                    <span className="w-1.5 h-1.5 bg-[#2563EB] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                    <span className="w-1.5 h-1.5 bg-[#2563EB] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                  </div>
                </div>
              )}

              <div ref={chatEndRef} />
            </div>

            {/* Quick Intent Chips Bar */}
            <div className="px-3 py-2 bg-slate-100/80 border-t border-slate-200/80 flex items-center space-x-1.5 overflow-x-auto no-scrollbar">
              <button
                onClick={() => handleSendChat(null, "emi kitni aayegi 1 lakh par?")}
                className="px-2.5 py-1 bg-white hover:bg-[#E4EEFF] text-[#223981] rounded-xl text-[10.5px] font-extrabold border border-slate-200 whitespace-nowrap transition flex-shrink-0"
              >
                📊 EMI Calculator
              </button>
              <button
                onClick={() => handleSendChat(null, "Low salary ₹15000 loan eligibility?")}
                className="px-2.5 py-1 bg-white hover:bg-[#E4EEFF] text-[#223981] rounded-xl text-[10.5px] font-extrabold border border-slate-200 whitespace-nowrap transition flex-shrink-0"
              >
                💸 Low Salary Approval
              </button>
              <button
                onClick={() => handleSendChat(null, "What documents are needed for e-KYC?")}
                className="px-2.5 py-1 bg-white hover:bg-[#E4EEFF] text-[#223981] rounded-xl text-[10.5px] font-extrabold border border-slate-200 whitespace-nowrap transition flex-shrink-0"
              >
                📄 Required Documents
              </button>
              <button
                onClick={() => handleSendChat(null, "How fast is loan disbursal?")}
                className="px-2.5 py-1 bg-white hover:bg-[#E4EEFF] text-[#223981] rounded-xl text-[10.5px] font-extrabold border border-slate-200 whitespace-nowrap transition flex-shrink-0"
              >
                ⚡ 8-Min Disbursal
              </button>
            </div>

            {/* Pinned Bottom Chat Input Bar */}
            <form onSubmit={handleSendChat} className="p-3 bg-white border-t border-slate-200 flex items-center space-x-2">
              <input 
                type="text"
                value={inputMsg}
                onChange={(e) => setInputMsg(e.target.value)}
                placeholder={`Ask PaisaBot in ${currentLangObj.name}...`}
                className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-extrabold text-[#223981] focus:ring-2 focus:ring-[#2563EB] outline-none"
              />
              <button
                type="submit"
                disabled={isTyping}
                className="w-10 h-10 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-2xl font-bold shadow-md shadow-[#2563EB]/25 transition active:scale-95 flex items-center justify-center flex-shrink-0 disabled:opacity-50"
              >
                <Send className="w-4.5 h-4.5" />
              </button>
            </form>
          </div>
        )}

        {/* TAB 2: NOTIFICATIONS DRAWER */}
        {activeTab === 'notifications' && (
          <div className="flex-1 p-4 overflow-y-auto space-y-2 bg-[#F8FAFC]">
            {notifications.map((n) => (
              <div 
                key={n.id}
                onClick={() => markNotificationRead(n.id)}
                className={`p-3.5 rounded-2xl border text-xs cursor-pointer transition ${
                  n.unread 
                    ? 'bg-[#E4EEFF]/80 border-[#6FA8FF]/60 text-[#223981] font-bold shadow-2xs' 
                    : 'bg-white border-slate-200 text-[#1E293B] font-medium'
                }`}
              >
                <div className="flex justify-between items-center mb-1">
                  <p className="font-extrabold text-[#223981]">{n.title}</p>
                  <span className="text-[10px] text-[#717983]">{n.time}</span>
                </div>
                <p className="text-[11px] leading-relaxed text-[#717983]">{n.message}</p>
              </div>
            ))}
          </div>
        )}

        {/* TAB 3: FAQS ACCORDION */}
        {activeTab === 'faq' && (
          <div className="flex-1 p-4 overflow-y-auto space-y-2.5 text-xs bg-[#F8FAFC]">
            <div className="p-3.5 bg-white rounded-2xl border border-slate-200 shadow-2xs">
              <h4 className="font-extrabold text-[#223981]">Q: Is Paisa in Minutes an RBI-registered NBFC?</h4>
              <p className="text-[#717983] font-medium mt-1 leading-relaxed">
                A: We are an official loan aggregator partner with 100% verified lending companies (Ticket 2 Loan, Jhatpat Loans, Shubh Cash, Udhaar Now, Insta Rupees, Borrowera, Easy Fincare, Loan Within, Rupay91), ensuring full regulatory compliance and zero hidden fees.
              </p>
            </div>
            <div className="p-3.5 bg-white rounded-2xl border border-slate-200 shadow-2xs">
              <h4 className="font-extrabold text-[#223981]">Q: How fast is loan disbursal?</h4>
              <p className="text-[#717983] font-medium mt-1 leading-relaxed">
                A: Once your e-KYC and loan agreement are e-Signed, loan funds are disbursed directly into your bank account in 6 to 10 minutes.
              </p>
            </div>
            <div className="p-3.5 bg-white rounded-2xl border border-slate-200 shadow-2xs">
              <h4 className="font-extrabold text-[#223981]">Q: How do Refer & Earn rewards work?</h4>
              <p className="text-[#717983] font-medium mt-1 leading-relaxed">
                A: When your invited friend completes e-KYC and their loan is disbursed, you earn 300 Paisa Points (₹300) directly withdrawable to your UPI ID.
              </p>
            </div>
          </div>
        )}

        {/* TAB 4: REQUEST CALL-BACK FORM */}
        {activeTab === 'callback' && (
          <div className="flex-1 p-5 space-y-4 bg-[#F8FAFC] flex flex-col justify-center">
            {!callbackRequested ? (
              <form onSubmit={handleCallbackSubmit} className="space-y-3 text-left bg-white p-4 rounded-3xl border border-slate-200 shadow-sm">
                <h4 className="text-sm font-extrabold text-[#223981]">Request Immediate Manager Call-Back</h4>
                <p className="text-xs text-[#717983]">Our customer specialist will call your registered number within 15 minutes.</p>

                <div>
                  <label className="block text-xs font-bold text-[#223981] mb-1">Phone Number</label>
                  <input 
                    type="text"
                    value={callbackPhone}
                    onChange={(e) => setCallbackPhone(e.target.value)}
                    className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-[#223981]"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-extrabold rounded-2xl shadow hover:bg-[#223981] transition"
                >
                  Request Call-Back
                </button>
              </form>
            ) : (
              <div className="bg-emerald-50 p-5 rounded-3xl border border-emerald-200 text-center space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                <h4 className="text-base font-extrabold text-emerald-900">Call-Back Request Received!</h4>
                <p className="text-xs text-emerald-700">A dedicated representative will call {callbackPhone} in less than 15 minutes.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
