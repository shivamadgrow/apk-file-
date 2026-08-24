import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Shield, Phone, ArrowRight, CheckCircle2, Lock, X, User, Mail, FileText, Sparkles } from 'lucide-react';

export const AuthModal = () => {
  const { isAuthOpen, setIsAuthOpen, loginUser, referredBy } = useApp();

  const [step, setStep] = useState('phone'); // 'phone' | 'otp' | 'signup'
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('1234');
  
  // Registration Form State for new users
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [pan, setPan] = useState('');
  const [city, setCity] = useState('');
  const [isExistingUser, setIsExistingUser] = useState(true);

  if (!isAuthOpen) return null;

  const handleSendOtp = (e) => {
    e.preventDefault();
    if (phone.length < 10) return;

    // Check if user exists in database
    const usersDb = JSON.parse(localStorage.getItem('paisainminute_users_db') || '{}');
    const cleanPhone = phone.replace(/\D/g, '');
    const userExists = !!usersDb[cleanPhone];

    setIsExistingUser(userExists);
    setStep('otp');
  };

  const handleVerifyOtp = (e) => {
    e.preventDefault();
    const cleanPhone = phone.replace(/\D/g, '');
    const usersDb = JSON.parse(localStorage.getItem('paisainminute_users_db') || '{}');

    if (isExistingUser && usersDb[cleanPhone]) {
      // Login existing user directly
      loginUser(cleanPhone);
      setIsAuthOpen(false);
      setStep('phone');
    } else {
      // Go to Signup Registration for new number
      setStep('signup');
    }
  };

  const handleCompleteRegistration = (e) => {
    e.preventDefault();
    const cleanPhone = phone.replace(/\D/g, '');
    const newUserData = {
      name: name.trim() || `User ${cleanPhone.slice(-4)}`,
      phone: `+91 ${cleanPhone}`,
      email: email.trim() || '',
      pan: pan.trim().toUpperCase() || '',
      city: city.trim() || '',
      creditScore: null,
      scoreCategory: null,
      lastChecked: null,
      kycVerified: false,
      bankDetails: null,
      loanHistory: []
    };

    loginUser(cleanPhone, newUserData);
    setIsAuthOpen(false);
    setStep('phone');
  };

  const fillQuickDemoNumber = (demoNum) => {
    setPhone(demoNum);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/65 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-sm w-full p-5 space-y-4 shadow-2xl relative text-left border border-slate-200 animate-in fade-in zoom-in duration-200">
        
        {/* Close Button */}
        <button
          onClick={() => setIsAuthOpen(false)}
          className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Brand Header */}
        <div className="flex items-center space-x-2.5">
          <img src="/logo.png" alt="Paisa in Minutes" className="h-12 sm:h-14 w-auto object-contain" />
          <div>
            <p className="text-[11px] text-[#4A8DFF] font-bold">Mobile OTP Login & Signup Portal</p>
          </div>
        </div>

        {/* Referral Invitation Welcome Banner */}
        {referredBy && (
          <div className="bg-gradient-to-r from-amber-50 to-amber-100 p-3 rounded-2xl border border-amber-300 space-y-1">
            <p className="text-xs font-black text-amber-900 flex items-center">
              🎁 Invited by {referredBy.name}!
            </p>
            <p className="text-[10.5px] text-amber-800 font-medium">
              Enter your mobile number below to claim your ₹15 Lakhs Instant Credit Line & 0% processing fee offer.
            </p>
          </div>
        )}

        {/* STEP 1: PHONE NUMBER INPUT */}
        {step === 'phone' && (
          <form onSubmit={handleSendOtp} className="space-y-4 pt-1">
            <div>
              <label className="block text-xs font-bold text-[#223981] mb-1.5">
                Enter 10-Digit Mobile Number
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-3 text-xs font-bold text-slate-500">+91</span>
                <input
                  type="tel"
                  maxLength={10}
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Enter Mobile Number"
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-extrabold text-[#223981] focus:ring-2 focus:ring-[#4A8DFF] outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-[#4A8DFF] hover:bg-[#223981] text-white text-xs font-extrabold rounded-2xl shadow-md flex items-center justify-center space-x-2 transition"
            >
              <span>Send 4-Digit OTP</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* STEP 2: OTP VERIFICATION */}
        {step === 'otp' && (
          <form onSubmit={handleVerifyOtp} className="space-y-4 pt-1">
            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 text-xs">
              <p className="text-[#717983]">OTP sent to linked mobile:</p>
              <p className="font-bold text-[#223981]">+91 {phone}</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#223981] mb-1.5">
                Enter 4-Digit Security OTP
              </label>
              <input
                type="text"
                maxLength={4}
                required
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="w-full py-3 bg-slate-50 border border-slate-200 rounded-2xl text-lg font-black text-center tracking-widest text-[#223981] focus:ring-2 focus:ring-[#4A8DFF] outline-none"
              />
              <p className="text-[10px] text-emerald-600 font-bold mt-1 text-center">
                Demo OTP: 1234 (Auto-filled)
              </p>
            </div>

            <div className="flex space-x-2">
              <button
                type="button"
                onClick={() => setStep('phone')}
                className="px-4 py-3 border border-slate-200 text-[#223981] text-xs font-bold rounded-2xl"
              >
                Back
              </button>
              <button
                type="submit"
                className="flex-1 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold rounded-2xl shadow-md flex items-center justify-center space-x-2 transition"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Verify & {isExistingUser ? 'Login' : 'Continue Signup'}</span>
              </button>
            </div>
          </form>
        )}

        {/* STEP 3: NEW USER REGISTRATION FORM */}
        {step === 'signup' && (
          <form onSubmit={handleCompleteRegistration} className="space-y-3 pt-1">
            <div className="bg-[#E4EEFF]/60 p-2.5 rounded-2xl border border-[#6FA8FF]/30 text-xs">
              <p className="font-bold text-[#223981]">First Time Mobile Registration</p>
              <p className="text-[10px] text-[#717983]">Enter your official details to create your borrower profile.</p>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#223981] mb-1">Full Legal Name (as per PAN)</label>
              <input
                type="text"
                required
                placeholder="e.g. Ramesh Kumar"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-[#223981]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#223981] mb-1">Email Address</label>
              <input
                type="email"
                required
                placeholder="ramesh@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-[#223981]"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-bold text-[#223981] mb-1">PAN Card</label>
                <input
                  type="text"
                  maxLength={10}
                  required
                  placeholder="ABCDE1234F"
                  value={pan}
                  onChange={(e) => setPan(e.target.value.toUpperCase())}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-[#223981]"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-[#223981] mb-1">City</label>
                <input
                  type="text"
                  required
                  placeholder="Mumbai"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-[#223981]"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold rounded-2xl shadow-md flex items-center justify-center space-x-2 transition mt-2"
            >
              <span>Create Account & Access Portal</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        <div className="pt-2 border-t border-slate-100 text-center">
          <p className="text-[10px] text-slate-400 font-semibold flex items-center justify-center">
            <Lock className="w-3 h-3 mr-1 text-emerald-600" />
            256-Bit Encrypted Secure Mobile Authentication
          </p>
        </div>
      </div>
    </div>
  );
};
