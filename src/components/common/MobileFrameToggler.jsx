import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Smartphone, Monitor, ShieldCheck, UserCheck, Play, Sparkles, QrCode, X } from 'lucide-react';

export const MobileFrameToggler = () => {
  const { deviceView, setDeviceView, loadDemoPreset } = useApp();
  const [showPhoneQr, setShowPhoneQr] = useState(false);

  // Network IP address for mobile testing
  const networkUrl = "http://192.168.1.15:3000/";
  const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(networkUrl)}`;

  return (
    <div className="bg-paisa-navy text-white text-xs py-2 px-4 border-b border-paisa-primary/30 flex flex-wrap items-center justify-between gap-2 shadow-inner">
      {/* Device Emulator Frame Toggle */}
      <div className="flex items-center space-x-2">
        <span className="font-semibold text-paisa-light hidden sm:inline">📱 Device View:</span>
        <div className="bg-white/10 p-1 rounded-xl flex items-center space-x-1">
          <button
            onClick={() => setDeviceView('mobileFrame')}
            className={`px-2.5 py-1 rounded-lg flex items-center space-x-1 font-medium transition ${
              deviceView === 'mobileFrame' 
                ? 'bg-paisa-primary text-white font-bold shadow' 
                : 'text-paisa-light hover:bg-white/10'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>iOS App</span>
          </button>
          <button
            onClick={() => setDeviceView('androidFrame')}
            className={`px-2.5 py-1 rounded-lg flex items-center space-x-1 font-medium transition ${
              deviceView === 'androidFrame' 
                ? 'bg-paisa-primary text-white font-bold shadow' 
                : 'text-paisa-light hover:bg-white/10'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Android APK</span>
          </button>
          <button
            onClick={() => setDeviceView('fullWidth')}
            className={`px-2.5 py-1 rounded-lg flex items-center space-x-1 font-medium transition ${
              deviceView === 'fullWidth' 
                ? 'bg-paisa-primary text-white font-bold shadow' 
                : 'text-paisa-light hover:bg-white/10'
            }`}
          >
            <Monitor className="w-3.5 h-3.5" />
            <span>Full Responsive Web</span>
          </button>
        </div>
      </div>

      {/* Mobile QR Scan Button */}
      <button
        onClick={() => setShowPhoneQr(true)}
        className="px-3 py-1 bg-amber-400 hover:bg-amber-300 text-paisa-navy text-xs font-black rounded-xl shadow transition flex items-center space-x-1.5 animate-pulse"
      >
        <QrCode className="w-4 h-4" />
        <span>Scan & Open on Phone 📲</span>
      </button>

      {/* Demo Preset Tester Toolbar */}
      <div className="flex items-center space-x-2">
        <span className="font-semibold text-amber-400 flex items-center">
          <Sparkles className="w-3 h-3 mr-1" />
          Test Demo States:
        </span>
        <div className="flex items-center space-x-1 bg-white/10 p-1 rounded-xl">
          <button
            onClick={() => loadDemoPreset('new_user')}
            className="px-2 py-0.5 text-[11px] rounded bg-white/10 hover:bg-white/20 text-paisa-light font-medium transition flex items-center"
            title="Reset to New Unregistered User"
          >
            <UserCheck className="w-3 h-3 mr-1" />
            New User
          </button>
          <button
            onClick={() => loadDemoPreset('applicant')}
            className="px-2 py-0.5 text-[11px] rounded bg-emerald-600 hover:bg-emerald-500 text-white font-medium transition flex items-center"
            title="Load Active Loan Disbursal Stepper"
          >
            <Play className="w-3 h-3 mr-1" />
            Active Borrower
          </button>
          <button
            onClick={() => loadDemoPreset('affiliate')}
            className="px-2 py-0.5 text-[11px] rounded bg-amber-500 hover:bg-amber-400 text-paisa-navy font-bold transition flex items-center"
            title="Load Approved Affiliate Dashboard & Payouts"
          >
            <ShieldCheck className="w-3 h-3 mr-1" />
            Approved Affiliate
          </button>
        </div>
      </div>

      {/* Phone Scan QR Code Modal */}
      {showPhoneQr && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white text-paisa-navy rounded-3xl p-6 max-w-sm w-full text-center space-y-4 shadow-2xl relative">
            <button 
              onClick={() => setShowPhoneQr(false)}
              className="absolute top-4 right-4 p-1.5 bg-slate-100 hover:bg-slate-200 rounded-full text-paisa-navy font-bold"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-12 h-12 rounded-2xl bg-paisa-light text-paisa-primary flex items-center justify-center mx-auto">
              <Smartphone className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-lg font-extrabold text-paisa-navy">Open Directly on Your Phone</h3>
              <p className="text-xs text-paisa-secondaryText mt-1">
                Scan this QR code with your Mobile Camera / PayTM / Google Lens:
              </p>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border-2 border-paisa-primary inline-block shadow-inner">
              <img 
                src={qrApiUrl} 
                alt="Mobile Dev Server QR" 
                className="w-48 h-48 mx-auto"
              />
            </div>

            <div className="bg-paisa-light p-3 rounded-2xl text-xs font-semibold">
              <p className="text-paisa-secondaryText font-medium">Or type this URL in phone browser:</p>
              <p className="text-paisa-navy font-mono font-bold text-sm select-all mt-0.5">{networkUrl}</p>
              <p className="text-[10px] text-emerald-700 font-bold mt-1">
                ✓ Make sure phone is connected to same Wi-Fi network!
              </p>
            </div>

            <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-2xl text-left space-y-1">
              <p className="text-xs font-extrabold text-emerald-900 flex items-center">
                <span>📲 Install as App on Mobile:</span>
              </p>
              <p className="text-[11px] text-emerald-800">
                1. Open link on phone Chrome browser.<br/>
                2. Tap top 3 dots menu ➔ Select <strong>"Add to Home screen"</strong> or <strong>"Install App"</strong>.<br/>
                3. App icon phone screen par install ho jayega!
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
