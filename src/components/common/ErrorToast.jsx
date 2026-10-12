import React, { useEffect } from 'react';
import { AlertTriangle, X } from 'lucide-react';

// A fixed-position popup, not an inline box — so it is always visible regardless of
// scroll position (an inline error box near the top of a long scrollable list could
// be scrolled out of view, leaving the user with no visible feedback at all).
export const ErrorToast = ({ message, onDismiss, autoDismissMs = 6000 }) => {
  useEffect(() => {
    if (!message) return;
    const t = setTimeout(() => onDismiss && onDismiss(), autoDismissMs);
    return () => clearTimeout(t);
  }, [message, autoDismissMs, onDismiss]);

  if (!message) return null;

  return (
    <div className="fixed inset-x-4 top-4 z-50 flex justify-center pointer-events-none">
      <div className="pointer-events-auto w-full max-w-md bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-2xl shadow-xl p-3.5 flex items-start space-x-2.5 animate-[fadeIn_0.2s_ease-out]">
        <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
        <span className="flex-1">{message}</span>
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss"
          className="flex-shrink-0 text-red-400 hover:text-red-600"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
