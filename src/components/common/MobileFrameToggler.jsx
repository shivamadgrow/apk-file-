import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Smartphone, Monitor, ShieldCheck, UserCheck, Play, Sparkles, QrCode, X, Copy, Check, RefreshCw, AlertTriangle } from 'lucide-react';

export const MobileFrameToggler = () => {
  const { deviceView, setDeviceView, loadDemoPreset } = useApp();
  const [showPhoneQr, setShowPhoneQr] = useState(false);
  const [copied, setCopied] = useState(false);
  
  // Detect current hostname or default to active Wi-Fi LAN IP
  const defaultNetworkUrl = typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1'
    ? `${window.location.protocol}//${window.location.host}/`
    : "http://192.168.1.17:3000/";

  const [customUrl, setCustomUrl] = useState(defaultNetworkUrl);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
      setCustomUrl(`${window.location.protocol}//${window.location.host}/`);
    }
  }, []);

  const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(customUrl)}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(customUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

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
          <div className="bg-white text-paisa-navy rounded-3xl p-5 sm:p-6 max-w-md w-full text-center space-y-4 shadow-2xl relative max-h-[90vh] overflow-y-auto">
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
              <p className="text-xs text-paisa-secondaryText mt-0.5">
                Scan this QR code with your Mobile Camera / Google Lens / Paytm:
              </p>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-2xl border-2 border-paisa-primary inline-block shadow-inner">
              <img 
                src={qrApiUrl} 
                alt="Mobile Dev Server QR" 
                className="w-44 h-44 mx-auto rounded-lg"
              />
            </div>

            {/* Direct Link + Copy Button */}
            <div className="bg-paisa-light p-3 rounded-2xl text-xs space-y-1.5">
              <p className="text-paisa-secondaryText font-medium">Or type this URL in phone browser:</p>
              <div className="flex items-center justify-between bg-white border border-slate-200 rounded-xl px-3 py-2">
                <input
                  type="text"
                  value={customUrl}
                  onChange={(e) => setCustomUrl(e.target.value)}
                  className="text-paisa-navy font-mono font-bold text-xs bg-transparent focus:outline-none w-full"
                />
                <button
                  onClick={handleCopy}
                  className="ml-2 px-2.5 py-1 bg-paisa-primary text-white rounded-lg font-bold flex items-center space-x-1 shrink-0 hover:bg-paisa-accent transition"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              
              {/* IP Presets */}
              <div className="flex items-center justify-center space-x-2 pt-1 text-[11px]">
                <span className="text-slate-500 font-medium">Switch IP:</span>
                <button
                  onClick={() => setCustomUrl('http://192.168.1.17:3000/')}
                  className="px-2 py-0.5 bg-white rounded border border-slate-200 hover:border-paisa-primary text-paisa-navy font-bold font-mono text-[10px]"
                >
                  192.168.1.17 (Wi-Fi)
                </button>
                <button
                  onClick={() => setCustomUrl('http://172.22.176.1:3000/')}
                  className="px-2 py-0.5 bg-white rounded border border-slate-200 hover:border-paisa-primary text-paisa-navy font-bold font-mono text-[10px]"
                >
                  172.22.176.1 (vEthernet)
                </button>
              </div>
            </div>

            {/* Crucial Instructions */}
            <div className="bg-amber-50 border border-amber-200 p-3 rounded-2xl text-left space-y-1.5 text-xs text-amber-900">
              <p className="font-bold flex items-center text-amber-800">
                <AlertTriangle className="w-4 h-4 mr-1 text-amber-600 shrink-0" />
                Phone par connect karne ke important rules:
              </p>
              <ul className="list-disc list-inside space-y-1 text-[11px] text-amber-900/90 pl-1 leading-relaxed">
                <li>Aapka <strong>Phone aur Laptop dono same Wi-Fi</strong> par connect hone chahiye.</li>
                <li>Agar router isolation hai, toh laptop ko phone ke <strong>Mobile Hotspot</strong> se connect karke check karein.</li>
                <li>Windows Firewall me Node.js / Port 3000 allowed hona chahiye.</li>
              </ul>
            </div>

            {/* Install as App Guide */}
            <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-2xl text-left space-y-1">
              <p className="text-xs font-extrabold text-emerald-900 flex items-center">
                <span>📲 Install as App on Mobile:</span>
              </p>
              <p className="text-[11px] text-emerald-800 leading-relaxed">
                1. Open link in Chrome on your phone.<br/>
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

