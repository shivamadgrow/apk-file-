import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  ShieldCheck, Bell, MapPin, Smartphone, Phone, Camera, 
  MessageSquare, LayoutGrid, Check, ExternalLink, X, ChevronRight, Lock
} from 'lucide-react';

export const TermsConsentModal = ({ isOpenManually = false, onCloseManual = null }) => {
  const { hasAcceptedTerms, acceptTerms } = useApp();
  const [isChecked, setIsChecked] = useState(false);
  const [isRequestingPermissions, setIsRequestingPermissions] = useState(false);

  // If already accepted and not manually opened from settings, don't show
  if (hasAcceptedTerms && !isOpenManually) return null;

  const requestDevicePermissions = async () => {
    // 1. Request Notification Permission
    try {
      if ('Notification' in window && Notification.permission === 'default') {
        await Notification.requestPermission();
      }
    } catch (e) {}

    // 2. Request Location Permission
    try {
      if ('geolocation' in navigator) {
        await new Promise((resolve) => {
          navigator.geolocation.getCurrentPosition(
            () => resolve(true),
            () => resolve(false),
            { timeout: 6000, enableHighAccuracy: false }
          );
        });
      }
    } catch (e) {}

    // 3. Request Camera Permission
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        stream.getTracks().forEach((track) => track.stop());
      }
    } catch (e) {}
  };

  const handleAgreeAndContinue = async () => {
    if (!isChecked && !isOpenManually) return;
    setIsRequestingPermissions(true);
    try {
      await requestDevicePermissions();
    } catch (e) {}
    setIsRequestingPermissions(false);
    acceptTerms();
    if (onCloseManual) onCloseManual();
  };

  const permissionItems = [
    {
      id: 'notifications',
      icon: Bell,
      iconColor: 'bg-blue-50 text-[#2563EB] border-blue-100',
      title: 'Notifications',
      description: 'Notification access is required to keep you informed about important updates, alerts, and provisional and final loan offers.'
    },
    {
      id: 'location',
      icon: MapPin,
      iconColor: 'bg-indigo-50 text-indigo-600 border-indigo-100',
      title: 'Location',
      description: 'This app collects your approximate location one-time (city or area level, not precise GPS) to check serviceability, support address verification, expedite the KYC process, and prevent fraud. We do not collect location when the app is in the background.'
    },
    {
      id: 'device_info',
      icon: Smartphone,
      iconColor: 'bg-sky-50 text-sky-600 border-sky-100',
      title: 'Device Information',
      description: 'We collect non-personal information about your device like device brand, model, OS and version, user profile information, network and SIM information, and MAC address for the device to ensure that customer identity is not compromised and we can prevent organized fraud. We do not collect any unique device identifiers like IMEI and serial number.'
    },
    {
      id: 'phone_state',
      icon: Phone,
      iconColor: 'bg-blue-50 text-[#223981] border-blue-100',
      title: 'Phone State',
      description: 'This app collects phone state information during onboarding and periodically during data sync to check SIM status and network strength. This helps us optimise data collection and detect potential fraud. All checks are performed on your device—no personal identifiers are sent to our servers. We do not collect contacts or call logs.'
    },
    {
      id: 'camera',
      icon: Camera,
      iconColor: 'bg-violet-50 text-violet-600 border-violet-100',
      title: 'Camera',
      description: 'Camera access is required for capturing your selfie(s) and scanning documents (ID proof, address proof) for the Know Your Customer (KYC) verification process. This helps us meet compliance and regulatory requirements.'
    },
    {
      id: 'sms',
      icon: MessageSquare,
      iconColor: 'bg-amber-50 text-amber-600 border-amber-100',
      title: 'Financial SMS Data',
      description: 'This app periodically collects and transmits SMS metadata and transactional SMS details (sender name, transactional amount, timestamp) to our secure servers. This data is solely used to assess income, spending patterns, and loan affordability. Personal SMS and OTPs are strictly never accessed or stored.'
    },
    {
      id: 'apps',
      icon: LayoutGrid,
      iconColor: 'bg-indigo-50 text-[#4A8DFF] border-indigo-100',
      title: 'Installed Apps',
      description: 'This app collects metadata about installed applications on your device. This information is securely processed to assess financial risk profile and detect potential fraud (such as unauthorized cloned apps or malicious software). These insights help us enable faster credit approvals and offer suitable credit limits.'
    }
  ];

  return (
    <div className="fixed inset-0 z-[100] bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto animate-fade-in">
      <div className="bg-[#F8FAFC] rounded-3xl max-w-lg w-full max-h-[96vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden relative text-left">
        
        {/* Header */}
        <div className="p-5 pb-3 bg-white border-b border-slate-200/80">
          <div className="flex items-start justify-between">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-[#2563EB] mb-2 shadow-xs">
              <ShieldCheck className="w-7 h-7" />
            </div>
            {isOpenManually && (
              <button 
                onClick={onCloseManual}
                className="p-2 rounded-full hover:bg-slate-100 text-slate-500 transition"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
          <h2 className="text-xl font-black text-[#1E293B] tracking-tight">
            Permissions & data use
          </h2>
          <p className="text-xs text-[#64748B] leading-relaxed font-medium mt-1">
            To provide credit assessment and prevent fraud, Paisa in Minutes and its partner NBFCs need your permission to access the data described below.
          </p>
        </div>

        {/* Scrollable Permissions Cards Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3.5 bg-slate-50/60">
          {permissionItems.map((item) => {
            const Icon = item.icon;
            return (
              <div 
                key={item.id}
                className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs space-y-2 transition hover:border-slate-300"
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-9 h-9 rounded-xl border flex items-center justify-center flex-shrink-0 ${item.iconColor}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-extrabold text-[#1E293B]">
                    {item.title}
                  </h3>
                </div>
                <p className="text-xs text-[#64748B] leading-relaxed font-normal pl-0.5">
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Sticky Footer with Links, Checkbox & Agree Button */}
        <div className="p-4 sm:p-5 bg-white border-t border-slate-200/80 space-y-3.5">
          {/* Policy Links */}
          <div className="text-[11.5px] text-[#64748B] leading-snug">
            See our{' '}
            <a 
              href="https://paisainminutes.com/privacy-policy" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-[#2563EB] font-bold underline hover:text-[#1D4ED8] inline-flex items-center"
            >
              Privacy Policy
            </a>
            {', '}
            <a 
              href="https://paisainminutes.com/terms-and-conditions" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-[#2563EB] font-bold underline hover:text-[#1D4ED8] inline-flex items-center"
            >
              Terms & Conditions
            </a>
            {' and '}
            <a 
              href="https://paisainminutes.com/partner-terms" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-[#2563EB] font-bold underline hover:text-[#1D4ED8] inline-flex items-center"
            >
              Partner Terms
            </a>
            .
          </div>

          {/* Agreement Checkbox */}
          <label className="flex items-start space-x-2.5 cursor-pointer select-none text-[11.5px] text-[#334155] font-semibold leading-tight">
            <input 
              type="checkbox"
              checked={isChecked || isOpenManually}
              onChange={(e) => setIsChecked(e.target.checked)}
              className="w-4 h-4 rounded border-slate-300 text-amber-500 focus:ring-amber-400 mt-0.5 cursor-pointer accent-[#F59E0B]"
            />
            <span>
              I have read and agree to the collection and use of my data as described above.
            </span>
          </label>

          {/* Action Button */}
          <button
            onClick={handleAgreeAndContinue}
            disabled={(!isChecked && !isOpenManually) || isRequestingPermissions}
            className={`w-full py-3.5 px-4 rounded-2xl font-black text-sm transition-all duration-200 shadow-md flex items-center justify-center space-x-2 ${
              (isChecked || isOpenManually) && !isRequestingPermissions
                ? 'bg-[#F59E0B] hover:bg-[#D97706] text-white active:scale-[0.99] cursor-pointer'
                : 'bg-[#FDE68A] text-[#92400E]/50 cursor-not-allowed shadow-none'
            }`}
          >
            {isRequestingPermissions ? (
              <span className="flex items-center space-x-2">
                <span className="w-4 h-4 border-2 border-white/60 border-t-white rounded-full animate-spin" />
                <span>Granting Permissions & Continuing...</span>
              </span>
            ) : (
              <span>{isOpenManually ? 'Close & Save' : 'I Agree & Continue'}</span>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};
