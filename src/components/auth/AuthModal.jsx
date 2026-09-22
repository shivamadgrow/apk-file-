import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { api, warmBackend } from '../../services/api';
import { Shield, Phone, ArrowRight, CheckCircle2, Lock, X, User, Mail, FileText, Sparkles, Loader2, RefreshCw, AlertCircle, Zap } from 'lucide-react';

export const AuthModal = () => {
  const { isAuthOpen, setIsAuthOpen, loginUser, referredBy } = useApp();

  const [step, setStep] = useState('phone'); // 'phone' | 'otp' | 'signup'
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  
  // Loading & Error States
  const [isLoading, setIsLoading] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [infoMsg, setInfoMsg] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);

  // Registration Form State for new users
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [pan, setPan] = useState('');
  const [city, setCity] = useState('');
  const [isExistingUser, setIsExistingUser] = useState(false);

  // Pre-warm backend as soon as modal is triggered
  useEffect(() => {
    if (isAuthOpen) {
      warmBackend();
    }
  }, [isAuthOpen]);

  // Countdown timer for Resend OTP
  useEffect(() => {
    let timer;
    if (resendCooldown > 0) {
      timer = setInterval(() => {
        setResendCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [resendCooldown]);

  if (!isAuthOpen) return null;

  const handleSendOtp = async (e) => {
    if (e) e.preventDefault();
    const cleanPhone = phone.replace(/\D/g, '').slice(-10);
    if (cleanPhone.length !== 10) {
      setErrorMsg('Please enter a valid 10-digit mobile number.');
      return;
    }

    setIsSendingOtp(true);
    setErrorMsg('');
    setInfoMsg(`Sending 6-digit OTP via SMS to +91 ${cleanPhone}...`);

    // INSTANT OPTIMISTIC TRANSITION: Zero perceived delay for the user!
    setStep('otp');
    setOtp('');
    setResendCooldown(45);

    try {
      const res = await api.sendOtp(cleanPhone);
      if (res.ok) {
        setInfoMsg(`✓ 6-digit OTP sent via SMS to +91 ${cleanPhone}`);
      } else {
        setErrorMsg(res.error || 'Failed to send OTP. Please try again.');
        setStep('phone');
      }
    } catch (err) {
      setErrorMsg('Connection error. Please check your network and try again.');
      setStep('phone');
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    const cleanPhone = phone.replace(/\D/g, '').slice(-10);
    const cleanOtp = otp.trim();

    if (cleanOtp.length < 6) {
      setErrorMsg('Please enter the complete 6-digit OTP received via SMS.');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');
    setInfoMsg('');

    try {
      const res = await api.verifyOtp(cleanPhone, cleanOtp);

      if (res.ok) {
        // Fetch existing profile from backend database
        const profile = await api.getProfile();

        if (profile && profile.name) {
          // User already registered on server
          loginUser(cleanPhone, {
            name: profile.name,
            phone: `+91 ${cleanPhone}`,
            email: profile.email || '',
            pan: profile.pan || '',
            city: profile.city || '',
            creditScore: profile.creditScore || null,
            scoreCategory: profile.scoreCategory || null,
            lastChecked: profile.lastChecked || null,
            kycVerified: !!profile.pan,
            bankDetails: profile.bankDetails || null,
            loanHistory: profile.loanHistory || []
          });
          setIsAuthOpen(false);
          setStep('phone');
        } else {
          // Check local database fallback
          const usersDb = JSON.parse(localStorage.getItem('paisainminute_users_db') || '{}');
          if (usersDb[cleanPhone] && usersDb[cleanPhone].name && usersDb[cleanPhone].name !== `User ${cleanPhone.slice(-4)}`) {
            loginUser(cleanPhone);
            setIsAuthOpen(false);
            setStep('phone');
          } else {
            // New user needs to complete profile registration
            setStep('signup');
          }
        }
      } else {
        setErrorMsg(res.error || 'Invalid OTP code. Please check your SMS.');
      }
    } catch (err) {
      setErrorMsg('Verification failed. Please check connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCompleteRegistration = async (e) => {
    e.preventDefault();
    const cleanPhone = phone.replace(/\D/g, '').slice(-10);
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    const cleanPan = pan.trim().toUpperCase();
    const trimmedCity = city.trim();

    // Strict Validations for All Mandatory Fields
    if (!trimmedName || trimmedName.length < 2) {
      setErrorMsg('Full Legal Name (as per PAN) is strictly mandatory.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!trimmedEmail || !emailRegex.test(trimmedEmail)) {
      setErrorMsg('A valid Email Address is strictly mandatory.');
      return;
    }

    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    if (!cleanPan || !panRegex.test(cleanPan)) {
      setErrorMsg('A valid 10-character PAN Card (e.g. ABCDE1234F) is strictly mandatory.');
      return;
    }

    if (!trimmedCity || trimmedCity.length < 2) {
      setErrorMsg('City name is strictly mandatory.');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');

    const newUserData = {
      name: trimmedName,
      phone: `+91 ${cleanPhone}`,
      email: trimmedEmail,
      pan: cleanPan,
      city: trimmedCity,
      creditScore: null,
      scoreCategory: null,
      lastChecked: null,
      kycVerified: true,
      bankDetails: null,
      loanHistory: []
    };

    try {
      // Sync profile to cloud database on server
      await api.updateProfile({
        name: newUserData.name,
        email: newUserData.email,
        pan: newUserData.pan
      });
    } catch (err) {
      console.warn('Profile sync warning:', err);
    }

    loginUser(cleanPhone, newUserData);
    setIsLoading(false);
    setIsAuthOpen(false);
    setStep('phone');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/65 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-sm w-full p-5 space-y-4 shadow-2xl relative text-left border border-slate-200 animate-in fade-in zoom-in duration-200">
        
        {/* Close Button */}
        <button
          onClick={() => {
            setIsAuthOpen(false);
            setErrorMsg('');
            setInfoMsg('');
          }}
          className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Brand Header */}
        <div className="flex items-center space-x-2.5">
          <img src="/logo.png" alt="Paisa in Minutes" className="h-12 sm:h-14 w-auto object-contain" />
          <div>
            <p className="text-[11px] text-[#4A8DFF] font-bold">Live SMS OTP Verification Portal</p>
            <span className="text-[9.5px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 inline-flex items-center mt-0.5">
              ✓ Secure Instant SMS Connected
            </span>
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

        {/* Global Error Banner */}
        {errorMsg && (
          <div className="bg-red-50 border border-red-200 p-2.5 rounded-2xl text-xs text-red-700 flex items-start space-x-2 animate-in fade-in duration-150">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
            <p className="font-semibold leading-tight">{errorMsg}</p>
          </div>
        )}

        {/* Global Info Banner */}
        {infoMsg && (
          <div className={`border p-2.5 rounded-2xl text-xs flex items-start space-x-2 animate-in fade-in duration-150 ${
            isSendingOtp
              ? 'bg-blue-50 border-blue-200 text-[#223981]'
              : 'bg-emerald-50 border-emerald-200 text-emerald-800'
          }`}>
            {isSendingOtp ? (
              <Loader2 className="w-4 h-4 text-[#4A8DFF] shrink-0 mt-0.5 animate-spin" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            )}
            <p className="font-semibold leading-tight">{infoMsg}</p>
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
                  disabled={isSendingOtp}
                  value={phone}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                    setPhone(val);
                    if (errorMsg) setErrorMsg('');
                    if (val.length >= 4) {
                      warmBackend();
                    }
                  }}
                  placeholder="Enter Mobile Number"
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-extrabold text-[#223981] focus:ring-2 focus:ring-[#4A8DFF] outline-none disabled:opacity-50"
                />
              </div>
              <p className="text-[10.5px] text-[#717983] mt-1">
                Real 6-digit SMS OTP will be sent to your mobile phone.
              </p>
            </div>

            <button
              type="submit"
              disabled={isSendingOtp || phone.replace(/\D/g, '').length < 10}
              className="w-full py-3.5 bg-[#4A8DFF] hover:bg-[#223981] disabled:bg-slate-300 text-white text-xs font-extrabold rounded-2xl shadow-md flex items-center justify-center space-x-2 transition"
            >
              {isSendingOtp ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Connecting to SMS Gateway...</span>
                </>
              ) : (
                <>
                  <span>Send 6-Digit SMS OTP</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        {/* STEP 2: OTP VERIFICATION */}
        {step === 'otp' && (
          <form onSubmit={handleVerifyOtp} className="space-y-4 pt-1">
            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 text-xs flex justify-between items-center">
              <div>
                <p className="text-[#717983]">OTP sent via SMS to:</p>
                <p className="font-bold text-[#223981]">+91 {phone.replace(/\D/g, '').slice(-10)}</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setStep('phone');
                  setErrorMsg('');
                  setInfoMsg('');
                }}
                className="text-[11px] font-bold text-[#4A8DFF] hover:underline"
              >
                Change
              </button>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#223981] mb-1.5">
                Enter 6-Digit SMS OTP
              </label>
              <input
                type="text"
                maxLength={6}
                required
                autoFocus
                disabled={isLoading}
                value={otp}
                onChange={(e) => {
                  setOtp(e.target.value.replace(/\D/g, ''));
                  if (errorMsg) setErrorMsg('');
                }}
                placeholder="• • • • • •"
                className="w-full py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xl sm:text-2xl font-black text-center tracking-[0.25em] sm:tracking-[0.35em] text-[#223981] focus:ring-2 focus:ring-[#4A8DFF] outline-none disabled:opacity-50"
              />
              
              {/* Resend OTP Bar */}
              <div className="flex items-center justify-between mt-2 px-1 text-xs">
                <span className="text-[#717983] text-[11px]">Didn't receive SMS?</span>
                {resendCooldown > 0 ? (
                  <span className="text-[#717983] text-[11px] font-semibold">
                    Resend in {resendCooldown}s
                  </span>
                ) : (
                  <button
                    type="button"
                    disabled={isLoading}
                    onClick={() => handleSendOtp()}
                    className="text-[#4A8DFF] font-bold text-[11px] hover:underline flex items-center space-x-1"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Resend OTP</span>
                  </button>
                )}
              </div>
            </div>

            <div className="flex space-x-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  setStep('phone');
                  setErrorMsg('');
                  setInfoMsg('');
                }}
                className="px-4 py-3 border border-slate-200 text-[#223981] text-xs font-bold rounded-2xl hover:bg-slate-50 transition"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={isLoading || otp.trim().length < 6}
                className="flex-1 py-3.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white text-xs font-extrabold rounded-2xl shadow-md flex items-center justify-center space-x-2 transition"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Verifying OTP...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Verify & Continue</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* STEP 3: NEW USER REGISTRATION FORM */}
        {step === 'signup' && (
          <form onSubmit={handleCompleteRegistration} className="space-y-3 pt-1">
            <div className="bg-[#E4EEFF]/70 p-2.5 rounded-2xl border border-[#6FA8FF]/40 text-xs">
              <p className="font-bold text-[#223981] flex items-center">
                <span>Mobile Verified Successfully! 🎉</span>
              </p>
              <p className="text-[10.5px] text-[#475569] mt-0.5">
                All fields marked with <span className="text-red-500 font-black">*</span> are <strong className="text-[#223981]">strictly mandatory</strong> as per RBI lending compliance.
              </p>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#223981] mb-1">
                Full Legal Name (as per PAN) <span className="text-red-500 font-black">*</span>
              </label>
              <input
                type="text"
                required
                placeholder=""
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (errorMsg) setErrorMsg('');
                }}
                className={`w-full p-2.5 bg-slate-50 border ${!name.trim() && errorMsg ? 'border-red-400 bg-red-50/30' : 'border-slate-200'} rounded-xl text-xs font-bold text-[#223981] focus:ring-2 focus:ring-[#4A8DFF] outline-none transition`}
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#223981] mb-1">
                Email Address <span className="text-red-500 font-black">*</span>
              </label>
              <input
                type="email"
                required
                placeholder=""
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errorMsg) setErrorMsg('');
                }}
                className={`w-full p-2.5 bg-slate-50 border ${!email.trim() && errorMsg ? 'border-red-400 bg-red-50/30' : 'border-slate-200'} rounded-xl text-xs font-bold text-[#223981] focus:ring-2 focus:ring-[#4A8DFF] outline-none transition`}
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-bold text-[#223981] mb-1">
                  PAN Card <span className="text-red-500 font-black">*</span>
                </label>
                <input
                  type="text"
                  maxLength={10}
                  required
                  placeholder=""
                  value={pan}
                  onChange={(e) => {
                    setPan(e.target.value.toUpperCase());
                    if (errorMsg) setErrorMsg('');
                  }}
                  className={`w-full p-2.5 bg-slate-50 border ${!pan.trim() && errorMsg ? 'border-red-400 bg-red-50/30' : 'border-slate-200'} rounded-xl text-xs font-mono font-bold text-[#223981] focus:ring-2 focus:ring-[#4A8DFF] outline-none transition`}
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-[#223981] mb-1">
                  City <span className="text-red-500 font-black">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder=""
                  value={city}
                  onChange={(e) => {
                    setCity(e.target.value);
                    if (errorMsg) setErrorMsg('');
                  }}
                  className={`w-full p-2.5 bg-slate-50 border ${!city.trim() && errorMsg ? 'border-red-400 bg-red-50/30' : 'border-slate-200'} rounded-xl text-xs font-bold text-[#223981] focus:ring-2 focus:ring-[#4A8DFF] outline-none transition`}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || !name.trim() || !email.trim() || !pan.trim() || !city.trim()}
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white text-xs font-extrabold rounded-2xl shadow-md flex items-center justify-center space-x-2 transition mt-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving Profile...</span>
                </>
              ) : (
                <>
                  <span>Create Account & Access Portal</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
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

