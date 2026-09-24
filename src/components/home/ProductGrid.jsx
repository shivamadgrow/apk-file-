import React from 'react';
import { useApp } from '../../context/AppContext';
import { BILINGUAL_TEXT } from '../../data/mockData';
import { UserCheck, CreditCard, Coins, Briefcase, Users, Sparkles, ChevronRight, Zap } from 'lucide-react';

export const ProductGrid = ({ onProductSelect }) => {
  const { language, setActiveTab } = useApp();
  const t = BILINGUAL_TEXT[language] || BILINGUAL_TEXT.en;

  const products = [
    {
      id: 'personal',
      name: t.personalLoan,
      limit: 'Up to ₹15 Lakhs',
      rate: 'upto 1.0% / day',
      icon: UserCheck,
      color: 'bg-blue-50 text-[#4A8DFF] border-blue-200/80',
      badge: 'Popular'
    },
    {
      id: 'business',
      name: t.businessLoan,
      limit: 'Up to ₹50 Lakhs',
      rate: 'Zero Collateral',
      icon: Briefcase,
      color: 'bg-indigo-50 text-indigo-600 border-indigo-200/80',
      badge: 'Fast Track'
    },
    {
      id: 'gold',
      name: t.goldLoan,
      limit: 'Up to ₹25 Lakhs',
      rate: 'upto 1.0% / day',
      icon: Coins,
      color: 'bg-amber-50 text-amber-600 border-amber-200/80',
      badge: 'Lowest Rate'
    },
    {
      id: 'credit_card',
      name: t.creditCard,
      limit: 'Instant Approval',
      rate: 'Lifetime Free',
      icon: CreditCard,
      color: 'bg-emerald-50 text-emerald-600 border-emerald-200/80',
      badge: 'Rewards'
    },
    {
      id: 'referral',
      name: 'Refer & Earn Rewards',
      limit: 'Invite Friends & Family',
      rate: 'Earn Paisa Points & Cash Bonus',
      icon: Users,
      isAffiliateHighlight: true,
      badge: 'REFERRAL 🎁'
    }
  ];

  return (
    <div className="my-4 text-left">
      <div className="flex items-center justify-between mb-2.5">
        <h2 className="text-sm font-extrabold text-[#223981] tracking-tight">
          Instant Loan Suite & Referral Program
        </h2>
        <button 
          onClick={() => setActiveTab('loans')}
          className="text-[11px] font-bold text-[#4A8DFF] flex items-center hover:underline"
        >
          View All <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        {products.map((prod) => {
          const Icon = prod.icon;

          if (prod.isAffiliateHighlight) {
            return (
              <div
                key={prod.id}
                onClick={() => setActiveTab('referral')}
                className="col-span-2 paisa-affiliate-card p-4 rounded-2xl text-white cursor-pointer hover:scale-[1.01] transition-all duration-300 relative overflow-hidden group"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-400/10 rounded-full blur-2xl pointer-events-none" />

                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-10 h-10 rounded-xl bg-amber-400 text-[#0F172A] flex items-center justify-center font-black shadow-md group-hover:rotate-6 transition-transform">
                      <Icon className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-xs font-black text-white group-hover:text-amber-300 transition-colors flex items-center">
                        {prod.name}
                        <Sparkles className="w-3 h-3 text-amber-400 ml-1" />
                      </h3>
                      <p className="text-[10px] text-amber-300 font-bold mt-0.5">{prod.rate}</p>
                    </div>
                  </div>

                  <span className="bg-amber-400 text-[#0F172A] text-[9.5px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow">
                    {prod.badge}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-white/10 text-[11px]">
                  <span className="text-slate-300 font-medium">{prod.limit}</span>
                  <span className="font-extrabold text-amber-300 flex items-center group-hover:translate-x-1 transition-transform">
                    Refer Now →
                  </span>
                </div>
              </div>
            );
          }

          return (
            <div
              key={prod.id}
              onClick={() => onProductSelect(prod.id)}
              className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md hover:border-[#4A8DFF]/60 cursor-pointer transition-all duration-200 group"
            >
              <div className="flex items-center justify-between mb-2">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center border ${prod.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                {prod.badge && (
                  <span className="text-[9px] font-extrabold bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-md">
                    {prod.badge}
                  </span>
                )}
              </div>
              <h3 className="text-xs font-bold text-[#223981] group-hover:text-[#4A8DFF] transition-colors">
                {prod.name}
              </h3>
              <p className="text-[11px] font-extrabold text-[#1E293B] mt-0.5">{prod.limit}</p>
              <p className={`text-[10px] font-bold ${prod.rate.includes('/ day') ? 'text-emerald-600' : 'text-slate-500'}`}>{prod.rate}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
