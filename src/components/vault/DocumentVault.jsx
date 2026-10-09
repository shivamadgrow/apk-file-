import React from 'react';
import { useApp } from '../../context/AppContext';
import { Lock, FileText, Info } from 'lucide-react';

// There is currently no backend document storage endpoint (confirmed by inspecting
// paisa/server — no document upload/retrieval route exists), and the website's own
// journey never stores KYC documents either: identity verification happens directly
// with the lending partner after redirect. This screen must not show fabricated
// documents or claim encryption/download capabilities that don't exist.
export const DocumentVault = () => {
  const { activeLoan } = useApp();

  return (
    <div className="bg-white rounded-3xl p-5 border border-paisa-light shadow-xl my-3 text-left space-y-4">
      <div className="flex items-center space-x-2 pb-3 border-b border-slate-100">
        <div className="w-9 h-9 rounded-xl bg-paisa-light text-paisa-primary flex items-center justify-center font-bold">
          <Lock className="w-5 h-5 text-paisa-primary" />
        </div>
        <div>
          <h2 className="text-base font-extrabold text-paisa-navy">Document Vault</h2>
          <p className="text-xs text-paisa-secondaryText">Your KYC documents are handled by your lending partner, not stored here.</p>
        </div>
      </div>

      <div className="p-4 bg-blue-50 rounded-2xl border border-blue-200 flex items-start space-x-2.5">
        <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-blue-800 font-medium leading-relaxed">
          Paisa in Minutes does not currently store or issue PAN, Aadhaar, sanction letter, or loan
          agreement documents. These are verified and issued directly by the lending partner you choose,
          on their own platform, after you're redirected to them.
        </p>
      </div>

      {activeLoan?.hasActiveLoan && (
        <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex items-center space-x-3">
          <FileText className="w-5 h-5 text-paisa-primary flex-shrink-0" />
          <div>
            <p className="text-xs font-bold text-paisa-navy">
              {activeLoan.selectedNbfc?.name || 'Your selected lender'}
            </p>
            <p className="text-[10.5px] text-paisa-secondaryText">
              Visit their site to check your document and agreement status directly.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
