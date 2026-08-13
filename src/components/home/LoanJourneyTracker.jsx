import React from 'react';
import { useApp } from '../../context/AppContext';
import { Activity, CheckCircle2, Clock, ShieldCheck, ChevronRight, FileText, Landmark } from 'lucide-react';

export const LoanJourneyTracker = () => {
  const { activeLoan, setActiveTab } = useApp();

  if (!activeLoan || !activeLoan.hasActiveLoan) {
    return null;
  }

  return (
    <div className="bg-white rounded-3xl p-5 border border-paisa-light shadow-paisa-card my-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <Activity className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="text-xs font-extrabold text-paisa-navy uppercase tracking-wider">
              Track Active Loan Application
            </h3>
            <p className="text-xs font-bold text-paisa-primary">{activeLoan.type} • ₹{activeLoan.amount.toLocaleString()}</p>
          </div>
        </div>

        <button
          onClick={() => setActiveTab('track')}
          className="text-xs font-bold text-paisa-primary hover:underline flex items-center"
        >
          View Full Timeline <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
        </button>
      </div>

      {/* Stepper Timeline */}
      <div className="relative pl-3 space-y-4">
        {/* Vertical line connecting steps */}
        <div className="absolute left-[19px] top-3 bottom-3 w-0.5 bg-paisa-light z-0" />

        {activeLoan.stepLabels.map((step, idx) => (
          <div key={step.id} className="relative z-10 flex items-start space-x-3">
            {/* Step Icon */}
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
              step.done 
                ? 'bg-emerald-500 text-white ring-4 ring-emerald-100' 
                : idx === activeLoan.currentStep - 1
                  ? 'bg-paisa-primary text-white ring-4 ring-paisa-light animate-pulse'
                  : 'bg-slate-200 text-slate-500'
            }`}>
              {step.done ? (
                <CheckCircle2 className="w-4 h-4" />
              ) : (
                <span>{step.id}</span>
              )}
            </div>

            {/* Step Info */}
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <p className={`text-xs font-bold ${step.done || idx === activeLoan.currentStep - 1 ? 'text-paisa-navy' : 'text-paisa-secondaryText'}`}>
                  {step.title}
                </p>
                <span className="text-[10px] font-semibold text-paisa-secondaryText">{step.time}</span>
              </div>

              {idx === activeLoan.currentStep - 1 && (
                <div className="mt-1 bg-paisa-light/60 p-2 rounded-xl border border-paisa-sky/30">
                  <p className="text-[11px] font-semibold text-paisa-navy flex items-center">
                    <Landmark className="w-3.5 h-3.5 mr-1 text-paisa-primary" />
                    Lender: {activeLoan.selectedNbfc.name} ({activeLoan.selectedNbfc.rate})
                  </p>
                  <p className="text-[10px] text-emerald-700 font-bold mt-0.5 flex items-center">
                    <Clock className="w-3 h-3 mr-1" />
                    Status: {activeLoan.status}
                  </p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
