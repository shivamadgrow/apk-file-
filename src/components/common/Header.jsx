import React from 'react';
import { useApp } from '../../context/AppContext';
import { BILINGUAL_TEXT } from '../../data/mockData';
import { Shield, Bell, Globe, User, Sparkles } from 'lucide-react';

export const Header = () => {
  const { language, setLanguage, notifications, setIsSupportOpen, setActiveTab, user } = useApp();
  const t = BILINGUAL_TEXT[language] || BILINGUAL_TEXT.en;
  const unreadCount = notifications.filter(n => n.unread).length;

  return (
    <header className="bg-white/95 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-30 px-4 py-2.5 flex items-center justify-between shadow-xs">
      {/* Brand Mobile Logo & Tagline */}
      <div 
        onClick={() => setActiveTab('home')}
        className="flex items-center space-x-2 cursor-pointer group"
      >
        <img 
          src="/logo.png" 
          alt="Paisa in Minutes Logo" 
          className="h-12 sm:h-14 w-auto object-contain max-w-[170px] sm:max-w-[210px] transition-transform group-hover:scale-[1.03]" 
        />
        <div className="hidden sm:inline-flex items-center text-[9.5px] font-bold text-[#4A8DFF] bg-[#E4EEFF] px-2 py-0.5 rounded-full">
          <Sparkles className="w-2.5 h-2.5 mr-1 text-[#4A8DFF]" />
          <span>{t.tagline}</span>
        </div>
      </div>

      {/* Right Mobile Actions */}
      <div className="flex items-center space-x-2">
        {/* Language Toggle Pill */}
        <button 
          onClick={() => setLanguage(l => l === 'en' ? 'hi' : 'en')}
          className="px-2.5 py-1 bg-slate-100 hover:bg-[#E4EEFF] rounded-xl text-[11px] font-bold text-[#223981] flex items-center space-x-1 border border-slate-200/80 transition"
        >
          <Globe className="w-3 h-3 text-[#4A8DFF]" />
          <span>{language === 'en' ? 'हिन्दी' : 'EN'}</span>
        </button>

        {/* Notification Bell */}
        <button 
          onClick={() => setIsSupportOpen(true)}
          className="relative p-2 text-[#223981] hover:bg-slate-100 rounded-xl transition"
          title="Notifications"
        >
          <Bell className="w-5 h-5 text-[#223981]" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-extrabold rounded-full flex items-center justify-center ring-2 ring-white">
              {unreadCount}
            </span>
          )}
        </button>

        {/* User Profile Avatar */}
        <button 
          onClick={() => setActiveTab('profile')}
          className="w-8 h-8 rounded-xl bg-[#223981] text-white flex items-center justify-center font-bold text-xs shadow-sm ring-2 ring-[#E4EEFF] hover:opacity-90 transition"
        >
          <User className="w-4 h-4 text-[#6FA8FF]" />
        </button>
      </div>
    </header>
  );
};
