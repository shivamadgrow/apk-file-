import React from 'react';
import { useApp } from '../../context/AppContext';
import { BILINGUAL_TEXT } from '../../data/mockData';
import { Home, CreditCard, Users, Activity, User, Sparkles } from 'lucide-react';

export const BottomNav = () => {
  const { activeTab, setActiveTab, language, activeLoan, affiliate } = useApp();
  const t = BILINGUAL_TEXT[language] || BILINGUAL_TEXT.en;

  const navItems = [
    { id: 'home', label: t.homeTab, icon: Home },
    { id: 'loans', label: t.loansTab, icon: CreditCard },
    { 
      id: 'affiliate', 
      label: t.affiliateTab, 
      icon: Users,
      badge: affiliate.isApproved ? 'Partner' : 'Earn'
    },
    { 
      id: 'track', 
      label: t.trackTab, 
      icon: Activity,
      dot: activeLoan.hasActiveLoan
    },
    { id: 'profile', label: t.profileTab, icon: User }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-paisa-light shadow-lg">
      <div className="max-w-md mx-auto px-3 py-1.5 flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`relative flex flex-col items-center py-1.5 px-3 rounded-2xl transition-all duration-200 ${
                isActive 
                  ? 'text-paisa-primary font-bold scale-105' 
                  : 'text-paisa-secondaryText hover:text-paisa-navy font-medium'
              }`}
            >
              {/* Active Indicator Top Pill */}
              {isActive && (
                <span className="absolute -top-1.5 w-6 h-1 bg-paisa-primary rounded-full animate-pulse" />
              )}

              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5px] text-paisa-primary' : 'stroke-[1.75px]'}`} />
                
                {/* Active loan dot indicator */}
                {item.dot && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-white animate-ping" />
                )}

                {/* Affiliate Earn Badge */}
                {item.badge && (
                  <span className="absolute -top-2 -right-4 bg-amber-500 text-white text-[9px] font-black px-1.5 py-0.2 rounded-full uppercase tracking-tighter shadow-sm flex items-center">
                    <Sparkles className="w-2 h-2 mr-0.5" />
                    {item.badge}
                  </span>
                )}
              </div>

              <span className="text-[11px] mt-1 font-semibold">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
