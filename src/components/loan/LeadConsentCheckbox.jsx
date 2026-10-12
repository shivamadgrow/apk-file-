import React from 'react';

// Shared lead-sharing consent control. Used at every point this app actually submits
// a loan enquiry (LoanApplicationWizard's own submit step, and MultiLenderComparison's
// standalone "6 Lending Partners" tab) so the same required disclosure is shown
// everywhere a submission can happen — there is no path that creates a real backend
// lead from this app without this checkbox being rendered and checked first.
//
// This wording describes what the app and backend actually do (see
// paisa/server/src/lib/intake.js — leadConsent is a hard server-side requirement for
// this app's submissions) and is NOT a legally-reviewed consent text; the business/
// legal team should review and version it before relying on it as a compliance
// artifact. DISCLOSURE_VERSION is sent to the backend with every submission so a
// future wording change is distinguishable in the stored/audited record.
export const DISCLOSURE_VERSION = 'android-lead-consent-v1-2026-10-09';

export const LeadConsentCheckbox = ({ checked, onChange, privacyPolicyUrl = 'https://paisainminutes.com/privacy-policy' }) => (
  <label className="flex items-start space-x-2.5 p-3 bg-slate-50 rounded-2xl border border-slate-200 cursor-pointer">
    <input
      type="checkbox"
      checked={checked}
      onChange={(e) => onChange(e.target.checked)}
      className="mt-0.5 w-4 h-4 accent-[#2563EB] cursor-pointer flex-shrink-0"
    />
    <span className="text-[11px] text-slate-700 font-medium leading-relaxed">
      I'm submitting this information to Paisa in Minutes for my loan enquiry. I understand it may
      be shared with the lending partner I select, so they can process my enquiry — and that once
      I'm redirected to that partner, they handle their own application review and KYC, separately
      from Paisa in Minutes. See the{' '}
      <a
        href={privacyPolicyUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="text-[#2563EB] underline font-semibold"
        onClick={(e) => e.stopPropagation()}
      >
        Privacy Policy
      </a>
      {' '}for details.
    </span>
  </label>
);
