import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { PARTNER_NBFCS, AFFILIATE_SLABS, MARKETING_KITS } from '../../data/mockData';
import { 
  Users, DollarSign, ArrowUpRight, Copy, Check, Share2, 
  Search, Filter, Plus, ShieldCheck, ChevronRight, CheckCircle2, 
  Clock, AlertCircle, Sparkles, Building2, User, ExternalLink, 
  Send, Phone, Briefcase, CreditCard, Coins, X, Wallet, ArrowRight
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const AffiliateDashboard = () => {
  const { affiliate, setAffiliate, addLead, currentPhone, user } = useApp();
  const [subTab, setSubTab] = useState('leads'); // 'leads' | 'partners' | 'commissions' | 'marketing'
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedKitId, setCopiedKitId] = useState(null);
  const [copiedPartnerId, setCopiedPartnerId] = useState(null);
  const [leadFilter, setLeadFilter] = useState('all'); // 'all' | 'Disbursed' | 'Approved' | 'In Review'
  const [searchQuery, setSearchQuery] = useState('');
  
  // New Lead Submission Modal State
  const [showAddLeadModal, setShowAddLeadModal] = useState(false);
  const [newLeadForm, setNewLeadForm] = useState({
    name: '',
    phone: '',
    type: 'Personal Loan',
    amount: '300000',
    nbfc: 'Rupay91 Instant Loan'
  });
  const [leadSubmitting, setLeadSubmitting] = useState(false);
  const [leadSuccessMsg, setLeadSuccessMsg] = useState(false);

  // Dynamic affiliate referral link
  const partnerCode = affiliate.referralCode || 'ROHAN8821';
  const affiliateRefLink = `https://paisainminutes.com/ref/${partnerCode}?utm_source=paisainminutesapp&utm_medium=affiliate&aff_id=${affiliate.partnerId || 'PM-AFF-88219'}`;

  const handleCopyAffiliateLink = () => {
    navigator.clipboard.writeText(affiliateRefLink);
    setCopiedLink(true);
    try {
      confetti({ particleCount: 40, spread: 50 });
    } catch (e) {}
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const resolvePartnerUrl = (nbfc) => {
    let url = nbfc.outboundUrl || '';
    const leadId = affiliate.partnerId || 'PIM-AFF' + Date.now().toString().slice(-4);
    const rawPhone = user?.phone || localStorage.getItem('paisainminute_current_phone') || '9876543210';
    const cleanPhone = rawPhone.replace(/\D/g, '').slice(-10) || '9876543210';
    return url
      .replace('{LEAD_ID}', encodeURIComponent(leadId))
      .replace('{PHONE}', encodeURIComponent(cleanPhone));
  };

  const handleCopyPartnerDirectLink = (nbfc) => {
    const url = resolvePartnerUrl(nbfc);
    navigator.clipboard.writeText(url);
    setCopiedPartnerId(nbfc.id);
    setTimeout(() => setCopiedPartnerId(null), 2000);
  };

  const handleCopyMarketingKit = (kit) => {
    const textToCopy = kit.content.replace('{REFERRAL_LINK}', affiliateRefLink);
    navigator.clipboard.writeText(textToCopy);
    setCopiedKitId(kit.id);
    setTimeout(() => setCopiedKitId(null), 2000);
  };

  const handleShareWhatsAppKit = (kit) => {
    const textToShare = kit.content.replace('{REFERRAL_LINK}', affiliateRefLink);
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(textToShare)}`, '_blank');
  };

  const handleDirectPartnerOpen = (nbfc) => {
    if (nbfc.outboundUrl) {
      window.open(resolvePartnerUrl(nbfc), '_blank');
    }
  };

  const handleCreateLead = (e) => {
    e.preventDefault();
    if (!newLeadForm.name || !newLeadForm.phone) return;

    setLeadSubmitting(true);
    setTimeout(() => {
      addLead(newLeadForm);
      setLeadSubmitting(false);
      setLeadSuccessMsg(true);
      try {
        confetti({ particleCount: 70, spread: 60 });
      } catch (e) {}

      setTimeout(() => {
        setLeadSuccessMsg(false);
        setShowAddLeadModal(false);
        setNewLeadForm({
          name: '',
          phone: '',
          type: 'Personal Loan',
          amount: '300000',
          nbfc: 'Rupay91 Instant Loan'
        });
      }, 1500);
    }, 600);
  };

  const allLeads = affiliate.leads || [];
  const filteredLeads = allLeads.filter(lead => {
    const matchesFilter = leadFilter === 'all' || lead.status.toLowerCase().includes(leadFilter.toLowerCase());
    const matchesSearch = lead.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          lead.phone.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          lead.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (lead.nbfc && lead.nbfc.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-4 my-3 text-left font-sans w-full max-w-full overflow-hidden">
      
      {/* Top Header Card: Affiliate Partner Identity & Wallet Summary */}
      <div className="bg-gradient-to-r from-[#223981] via-[#1E3A8A] to-[#4A8DFF] text-white p-4.5 sm:p-5 rounded-3xl shadow-lg border border-[#6FA8FF]/30 space-y-4 relative overflow-hidden w-full max-w-full">
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2.5 sm:space-x-3 min-w-0 flex-1">
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center font-black text-amber-300 text-lg shadow-inner flex-shrink-0">
              <Building2 className="w-5 h-5 sm:w-6 sm:h-6 text-amber-300" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-1.5">
                <h1 className="text-sm sm:text-base font-black tracking-tight text-white truncate">
                  Affiliate CRM
                </h1>
                <span className="text-[9px] font-black bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded-full border border-emerald-400/30 uppercase flex-shrink-0">
                  Verified Partner
                </span>
              </div>
              <p className="text-[10.5px] text-[#E4EEFF] font-medium truncate">
                ID: <span className="font-mono font-bold text-white">{affiliate.partnerId || 'PM-AFF-88219'}</span> • Code: <span className="font-mono font-bold text-amber-300">{partnerCode}</span>
              </p>
            </div>
          </div>
        </div>

        {/* 3 Metric Summary Boxes */}
        <div className="grid grid-cols-3 gap-2 pt-1 w-full">
          <div className="bg-white/10 backdrop-blur-md p-2 rounded-2xl border border-white/15 text-center min-w-0">
            <span className="text-[9px] font-bold text-[#E4EEFF] uppercase block truncate">Total Earned</span>
            <span className="text-xs sm:text-sm font-black text-amber-300 truncate block">₹{affiliate.totalEarned ? affiliate.totalEarned.toLocaleString() : '32,300'}</span>
          </div>

          <div className="bg-white/10 backdrop-blur-md p-2 rounded-2xl border border-white/15 text-center min-w-0">
            <span className="text-[9px] font-bold text-[#E4EEFF] uppercase block truncate">Pending</span>
            <span className="text-xs sm:text-sm font-black text-white truncate block">₹{affiliate.pendingPayout ? affiliate.pendingPayout.toLocaleString() : '14,500'}</span>
          </div>

          <div className="bg-white/10 backdrop-blur-md p-2 rounded-2xl border border-white/15 text-center min-w-0">
            <span className="text-[9px] font-bold text-[#E4EEFF] uppercase block truncate">Active Leads</span>
            <span className="text-xs sm:text-sm font-black text-emerald-300 truncate block">{allLeads.length} Leads</span>
          </div>
        </div>

        {/* Shareable Link Row */}
        <div className="bg-black/20 p-2 rounded-2xl border border-white/10 flex items-center justify-between space-x-2 text-xs w-full max-w-full min-w-0 overflow-hidden">
          <span className="truncate font-mono text-[10.5px] text-[#E4EEFF] min-w-0 flex-1">{affiliateRefLink}</span>
          <button
            onClick={handleCopyAffiliateLink}
            className="px-2.5 py-1.5 bg-amber-400 hover:bg-amber-300 text-[#0F172A] font-extrabold text-xs rounded-xl shadow transition flex items-center space-x-1 flex-shrink-0"
          >
            {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedLink ? 'Copied' : 'Copy Link'}</span>
          </button>
        </div>
      </div>

      {/* Sub-Navigation Tabs: 4-Column Strict Mobile Grid (No Horizontal Overflow) */}
      <div className="grid grid-cols-4 gap-1 p-1 bg-white rounded-2xl border border-slate-200 shadow-2xs w-full max-w-full overflow-hidden">
        <button
          onClick={() => setSubTab('leads')}
          className={`py-2 px-1 rounded-xl text-[11px] font-extrabold transition flex items-center justify-center space-x-1 min-w-0 ${
            subTab === 'leads'
              ? 'bg-[#2563EB] text-white shadow-sm'
              : 'text-[#717983] hover:text-[#223981] hover:bg-slate-50'
          }`}
        >
          <Users className="w-3.5 h-3.5 flex-shrink-0" />
          <span className="truncate">Leads</span>
          <span className={`text-[9px] px-1 rounded-full font-black flex-shrink-0 ${subTab === 'leads' ? 'bg-white/20 text-white' : 'bg-slate-100 text-[#717983]'}`}>
            {allLeads.length}
          </span>
        </button>

        <button
          onClick={() => setSubTab('partners')}
          className={`py-2 px-1 rounded-xl text-[11px] font-extrabold transition flex items-center justify-center space-x-1 min-w-0 ${
            subTab === 'partners'
              ? 'bg-[#2563EB] text-white shadow-sm'
              : 'text-[#717983] hover:text-[#223981] hover:bg-slate-50'
          }`}
        >
          <ExternalLink className="w-3.5 h-3.5 flex-shrink-0" />
          <span className="truncate">Lenders</span>
        </button>

        <button
          onClick={() => setSubTab('commissions')}
          className={`py-2 px-1 rounded-xl text-[11px] font-extrabold transition flex items-center justify-center space-x-1 min-w-0 ${
            subTab === 'commissions'
              ? 'bg-[#2563EB] text-white shadow-sm'
              : 'text-[#717983] hover:text-[#223981] hover:bg-slate-50'
          }`}
        >
          <Wallet className="w-3.5 h-3.5 flex-shrink-0" />
          <span className="truncate">Payouts</span>
        </button>

        <button
          onClick={() => setSubTab('marketing')}
          className={`py-2 px-1 rounded-xl text-[11px] font-extrabold transition flex items-center justify-center space-x-1 min-w-0 ${
            subTab === 'marketing'
              ? 'bg-[#2563EB] text-white shadow-sm'
              : 'text-[#717983] hover:text-[#223981] hover:bg-slate-50'
          }`}
        >
          <Share2 className="w-3.5 h-3.5 flex-shrink-0" />
          <span className="truncate">Marketing</span>
        </button>
      </div>

      {/* TAB 1: LEAD MANAGEMENT CRM */}
      {subTab === 'leads' && (
        <div className="space-y-3 w-full max-w-full overflow-hidden">
          
          {/* Action Bar: Search, Status Filters & "+ Submit New Lead" */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-[#717983] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search leads by name, phone, ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-[#223981] placeholder-slate-400 focus:outline-none focus:border-[#2563EB]"
              />
            </div>

            <button
              onClick={() => setShowAddLeadModal(true)}
              className="px-4 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-extrabold text-xs rounded-xl shadow-sm transition flex items-center justify-center space-x-1.5 flex-shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Submit New Lead</span>
            </button>
          </div>

          {/* Status Filter Pills */}
          <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 text-xs">
            {['all', 'Disbursed', 'Approved', 'In Review'].map((filter) => (
              <button
                key={filter}
                onClick={() => setLeadFilter(filter)}
                className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap transition ${
                  leadFilter === filter
                    ? 'bg-[#223981] text-white'
                    : 'bg-white text-[#717983] border border-slate-200 hover:bg-slate-50'
                }`}
              >
                {filter === 'all' ? 'All Leads' : filter}
              </button>
            ))}
          </div>

          {/* Leads List */}
          {filteredLeads.length === 0 ? (
            <div className="bg-white p-8 rounded-3xl border border-slate-200 text-center space-y-3 shadow-2xs">
              <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto text-[#717983]">
                <Users className="w-6 h-6" />
              </div>
              <p className="text-xs font-extrabold text-[#223981]">No leads match your filter</p>
              <p className="text-[11px] text-[#717983]">
                Click "+ Submit New Lead" or share your partner referral link to start monetizing loan applications.
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {filteredLeads.map((lead) => {
                const isDisbursed = lead.status === 'Disbursed';
                const isApproved = lead.status === 'Approved' || lead.status.includes('Approved');
                const isReview = lead.status === 'In Review';

                return (
                  <div
                    key={lead.id}
                    className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs hover:border-[#4A8DFF] transition space-y-2.5"
                  >
                    {/* Header: Lead Name, ID & Status Badge */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-2.5">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#223981] to-[#4A8DFF] text-white flex items-center justify-center font-black text-xs shadow-xs">
                          {lead.name.charAt(0)}
                        </div>
                        <div>
                          <div className="flex items-center space-x-1.5">
                            <h3 className="text-xs font-black text-[#223981]">{lead.name}</h3>
                            <span className="text-[9.5px] font-mono text-[#717983]">({lead.id})</span>
                          </div>
                          <p className="text-[10.5px] text-[#717983] font-mono mt-0.5 flex items-center">
                            <Phone className="w-2.5 h-2.5 mr-1" />
                            {lead.phone}
                          </p>
                        </div>
                      </div>

                      <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full border ${
                        isDisbursed
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : isApproved
                          ? 'bg-blue-50 text-blue-700 border-blue-200'
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}>
                        {lead.status}
                      </span>
                    </div>

                    {/* Middle Details Grid: Amount, Type, NBFC & Commission */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-xs">
                      <div>
                        <span className="text-[9px] font-bold text-[#717983] uppercase block">Loan Type</span>
                        <span className="font-extrabold text-[#223981] text-[11px]">{lead.type}</span>
                      </div>
                      <div>
                        <span className="text-[9px] font-bold text-[#717983] uppercase block">Loan Amount</span>
                        <span className="font-black text-[#223981] text-[11px]">{lead.amount}</span>
                      </div>
                      <div>
                        <span className="text-[9px] font-bold text-[#717983] uppercase block">Lender Partner</span>
                        <span className="font-extrabold text-[#4A8DFF] text-[11px] truncate block">{lead.nbfc || 'Rupay91'}</span>
                      </div>
                      <div>
                        <span className="text-[9px] font-bold text-[#717983] uppercase block">Your Commission</span>
                        <span className="font-black text-emerald-600 text-[11px]">{lead.commission}</span>
                      </div>
                    </div>

                    {/* Footer Row: Date & Payout Status */}
                    <div className="flex items-center justify-between text-[10px] text-[#717983] pt-1 border-t border-slate-100">
                      <span>Submitted: {lead.date}</span>
                      <span className="font-extrabold text-emerald-700 flex items-center">
                        <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-500" />
                        Payout: {lead.payoutStatus || 'Credited'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>
      )}

      {/* TAB 2: DIRECT PARTNER LENDER LINKS */}
      {subTab === 'partners' && (
        <div className="space-y-3.5 w-full max-w-full overflow-hidden">
          
          <div className="bg-[#E4EEFF]/80 p-3.5 rounded-2xl border border-[#6FA8FF]/30 text-xs text-[#223981] space-y-1">
            <p className="font-black text-[#223981] flex items-center">
              <ExternalLink className="w-4 h-4 mr-1.5 text-[#2563EB]" />
              Verified Direct Partner Loan Application Links
            </p>
            <p className="text-[11px] text-[#475569]">
              Each partner link below includes your master affiliate tracking ID (<strong>{affiliate.partnerId || 'PIM-812385'}</strong>). Clicking <strong>"Apply Now"</strong> opens the lender's official loan application directly.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {PARTNER_NBFCS.map((nbfc) => (
              <div
                key={nbfc.id}
                className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-md hover:border-[#2563EB] transition-all flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-2.5">
                      <div className="w-16 h-9 rounded-xl bg-white p-1 flex items-center justify-center border border-slate-200 shadow-2xs overflow-hidden flex-shrink-0">
                        {nbfc.logo && nbfc.logo.startsWith('/') ? (
                          <img src={nbfc.logo} alt={nbfc.name} className="w-full h-full object-contain bg-white" />
                        ) : (
                          <span className="font-black text-xs text-[#223981]">{nbfc.name.slice(0, 4)}</span>
                        )}
                      </div>
                      <div>
                        <h3 className="text-xs font-extrabold text-[#223981]">{nbfc.name}</h3>
                        <span className="text-[10px] text-emerald-600 font-bold">★ {nbfc.rating} / 5.0 • {nbfc.approvalChance} Approval</span>
                      </div>
                    </div>

                    <span className="text-[9px] font-black bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-full">
                      {nbfc.tag}
                    </span>
                  </div>

                  {/* Limits & Rate Box */}
                  <div className="grid grid-cols-2 gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-left my-2">
                    <div>
                      <span className="text-[9px] font-bold text-[#717983] uppercase block">Max Loan</span>
                      <span className="text-xs font-black text-[#2563EB]">{nbfc.maxLoanDisplay}</span>
                    </div>
                    <div>
                      <span className="text-[9px] font-bold text-[#717983] uppercase block">INTEREST RATE</span>
                      <span className="text-xs font-black text-emerald-600">{nbfc.interestRateDisplay}</span>
                    </div>
                  </div>

                  {/* Feature Highlights */}
                  <div className="space-y-1 my-1.5">
                    {nbfc.features.slice(0, 2).map((feat, idx) => (
                      <div key={idx} className="flex items-center text-[10.5px] text-[#475569] font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 mr-1.5 flex-shrink-0" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actions: Copy Link & Direct Apply Button */}
                <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100">
                  <button
                    onClick={() => handleCopyPartnerDirectLink(nbfc)}
                    className="py-2 px-2 bg-slate-100 hover:bg-[#E4EEFF] text-[#223981] text-[11px] font-extrabold rounded-xl transition flex items-center justify-center space-x-1"
                    title="Copy unique tracking link"
                  >
                    {copiedPartnerId === nbfc.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedPartnerId === nbfc.id ? 'Copied' : 'Copy Link'}</span>
                  </button>

                  <button
                    onClick={() => handleDirectPartnerOpen(nbfc)}
                    className="py-2 px-3 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-[11px] font-extrabold rounded-xl shadow-xs transition flex items-center justify-center space-x-1"
                  >
                    <span>Apply Now</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

        </div>
      )}

      {/* TAB 3: COMMISSION SLABS & PAYOUT WALLET */}
      {subTab === 'commissions' && (
        <div className="space-y-3.5 w-full max-w-full overflow-hidden">
          
          {/* Commission Slabs List */}
          <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-2xs space-y-3">
            <h3 className="text-xs font-extrabold text-[#223981] uppercase tracking-wider">
              Affiliate Partner Commission Slabs
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {AFFILIATE_SLABS.map((slab, sIdx) => (
                <div key={sIdx} className="bg-slate-50 p-3 rounded-2xl border border-slate-200/80 flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-extrabold text-[#223981]">{slab.product}</h4>
                    <p className="text-[11px] font-black text-emerald-600 mt-0.5">{slab.commission}</p>
                    <p className="text-[10px] text-[#717983]">{slab.avgEarningsPerLead}</p>
                  </div>
                  <span className="text-xs font-black text-[#2563EB] bg-[#E4EEFF] px-2.5 py-1 rounded-xl">
                    Instant Payout
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Payout History */}
          <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-2xs space-y-3">
            <h3 className="text-xs font-extrabold text-[#223981] uppercase tracking-wider">
              Completed Payout History
            </h3>

            <div className="space-y-2 text-xs">
              {(affiliate.payoutHistory || []).map((po) => (
                <div key={po.id} className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-center justify-between">
                  <div>
                    <div className="flex items-center space-x-1.5">
                      <span className="font-extrabold text-[#223981]">{po.id}</span>
                      <span className="text-[10px] text-[#717983]">({po.date})</span>
                    </div>
                    <p className="text-[10.5px] text-[#717983] mt-0.5">{po.mode}</p>
                  </div>
                  <div className="text-right">
                    <span className="font-black text-emerald-600 text-sm block">{po.amount}</span>
                    <span className="text-[9.5px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.2 rounded-md">
                      {po.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* TAB 4: MARKETING KIT & TOOLS */}
      {subTab === 'marketing' && (
        <div className="space-y-3.5 w-full max-w-full overflow-hidden">
          
          <div className="bg-gradient-to-r from-amber-500 to-amber-600 text-[#0F172A] p-4 rounded-3xl shadow-sm flex items-center justify-between w-full max-w-full overflow-hidden">
            <div className="min-w-0 flex-1">
              <span className="text-[9px] font-black uppercase bg-white/30 text-[#0F172A] px-2 py-0.5 rounded-full">
                HIGH CONVERTING KIT
              </span>
              <h3 className="text-sm font-black mt-1 truncate">High-Impact Referral Promos</h3>
              <p className="text-[11px] font-semibold text-[#0F172A]/80 line-clamp-2">Share directly with your network to earn instant commission.</p>
            </div>
          </div>

          <div className="space-y-3 w-full max-w-full">
            {MARKETING_KITS.map((kit) => (
              <div key={kit.id} className="bg-white p-4 rounded-3xl border border-slate-200 shadow-2xs space-y-3 w-full max-w-full overflow-hidden">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-extrabold text-[#223981] truncate">{kit.title}</span>
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 flex-shrink-0">
                    {kit.shares}
                  </span>
                </div>

                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 text-xs font-medium text-[#223981] leading-relaxed break-words break-all overflow-hidden select-all">
                  {kit.content.replace('{REFERRAL_LINK}', affiliateRefLink)}
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1 w-full">
                  <button
                    onClick={() => handleCopyMarketingKit(kit)}
                    className="py-2.5 px-2 bg-slate-100 hover:bg-[#E4EEFF] text-[#223981] text-xs font-extrabold rounded-xl transition flex items-center justify-center space-x-1 min-w-0"
                  >
                    {copiedKitId === kit.id ? <Check className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" /> : <Copy className="w-3.5 h-3.5 flex-shrink-0" />}
                    <span className="truncate">{copiedKitId === kit.id ? 'Copied' : 'Copy Text'}</span>
                  </button>

                  <button
                    onClick={() => handleShareWhatsAppKit(kit)}
                    className="py-2.5 px-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold rounded-xl shadow-xs transition flex items-center justify-center space-x-1 min-w-0"
                  >
                    <Share2 className="w-3.5 h-3.5 flex-shrink-0" />
                    <span className="truncate">WhatsApp</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

        </div>
      )}

      {/* SUBMIT NEW LEAD MODAL */}
      {showAddLeadModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl p-5 max-w-md w-full space-y-4 shadow-2xl text-left border border-slate-200 relative">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-xl bg-[#E4EEFF] text-[#2563EB] flex items-center justify-center font-black">
                  <Plus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-[#223981]">Submit New Customer Lead</h3>
                  <p className="text-[10px] text-[#717983]">Auto-linked with your Partner ID: {affiliate.partnerId || 'PM-AFF-88219'}</p>
                </div>
              </div>
              <button 
                onClick={() => setShowAddLeadModal(false)}
                className="p-1.5 hover:bg-slate-100 rounded-full text-[#717983]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {leadSuccessMsg ? (
              <div className="p-6 text-center space-y-3">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h4 className="text-base font-extrabold text-[#223981]">Lead Submitted Successfully!</h4>
                <p className="text-xs text-[#717983]">
                  The application has been forwarded to <strong>{newLeadForm.nbfc}</strong>. Commission tracking is now active in your CRM.
                </p>
              </div>
            ) : (
              <form onSubmit={handleCreateLead} className="space-y-3 text-xs">
                <div>
                  <label className="block text-xs font-bold text-[#223981] mb-1">Borrower Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder=""
                    value={newLeadForm.name}
                    onChange={(e) => setNewLeadForm({ ...newLeadForm, name: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-[#223981] focus:outline-none focus:border-[#2563EB]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#223981] mb-1">Borrower Mobile Number</label>
                  <input
                    type="tel"
                    required
                    placeholder=""
                    value={newLeadForm.phone}
                    onChange={(e) => setNewLeadForm({ ...newLeadForm, phone: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-[#223981] focus:outline-none focus:border-[#2563EB]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-bold text-[#223981] mb-1">Loan Product</label>
                    <select
                      value={newLeadForm.type}
                      onChange={(e) => setNewLeadForm({ ...newLeadForm, type: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-[#223981] focus:outline-none focus:border-[#2563EB]"
                    >
                      <option value="Personal Loan">Personal Loan</option>
                      <option value="Business Loan">Business Loan</option>
                      <option value="Gold Loan">Gold Loan</option>
                      <option value="Credit Card">Credit Card</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#223981] mb-1">Requested Amount (₹)</label>
                    <input
                      type="number"
                      required
                      placeholder="300000"
                      value={newLeadForm.amount}
                      onChange={(e) => setNewLeadForm({ ...newLeadForm, amount: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-[#223981] focus:outline-none focus:border-[#2563EB]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#223981] mb-1">Target Lending Partner</label>
                  <select
                    value={newLeadForm.nbfc}
                    onChange={(e) => setNewLeadForm({ ...newLeadForm, nbfc: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-[#223981] focus:outline-none focus:border-[#2563EB]"
                  >
                    {PARTNER_NBFCS.map((n) => (
                      <option key={n.id} value={n.name}>{n.name}</option>
                    ))}
                  </select>
                </div>

                <div className="bg-[#E4EEFF]/70 p-3 rounded-2xl border border-[#6FA8FF]/30 space-y-1">
                  <div className="flex justify-between items-center text-[11px] font-bold text-[#223981]">
                    <span>Estimated Partner Commission:</span>
                    <span className="text-emerald-700 font-black">
                      ₹{Math.round((Number(newLeadForm.amount) || 300000) * 0.025).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-[10px] text-[#475569]">
                    ✓ Disbursal in &lt; 8 mins • Instant wallet credit upon disbursal.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={leadSubmitting}
                  className="w-full py-3 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-extrabold text-xs rounded-2xl shadow-md transition flex items-center justify-center space-x-1.5"
                >
                  {leadSubmitting ? <span>Submitting to Lender...</span> : (
                    <>
                      <span>Submit Lead to Lender</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}

          </div>
        </div>
      )}

    </div>
  );
};
