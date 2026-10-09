import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../../services/api';
import { RefreshCw, AlertTriangle, Loader2, Inbox, WifiOff } from 'lucide-react';

// Real application history from the backend (GET /api/loan-applications/my, which the
// backend scopes to the authenticated user — see paisa/server/src/routes/loans.js). This
// screen only ever shows what the server actually returns: no fabricated status, amount,
// or id. It never attempts to show another user's records (impossible anyway, since the
// backend scopes the query server-side to req.auth.id).
const STATUS_STYLE = {
  FRESH: 'bg-blue-50 text-blue-700 border-blue-200',
  CALLBACK: 'bg-amber-50 text-amber-700 border-amber-200',
  INTERESTED: 'bg-amber-50 text-amber-700 border-amber-200',
  APPROVED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  DISBURSED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  REJECTED: 'bg-red-50 text-red-700 border-red-200'
};

const STATUS_LABEL = {
  FRESH: 'Submitted',
  CALLBACK: 'Callback Requested',
  INTERESTED: 'In Review',
  APPROVED: 'Approved',
  DISBURSED: 'Disbursed',
  REJECTED: 'Rejected'
};

export const ApplicationHistory = ({ refreshKey }) => {
  const [applications, setApplications] = useState(null); // null = not loaded yet
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setIsLoading(true);
    setError('');
    if (typeof navigator !== 'undefined' && navigator.onLine === false) {
      setError({ reason: 'offline', error: "You're offline. Connect to the internet to see your application history." });
      setIsLoading(false);
      return;
    }
    const res = await api.getMyLoans();
    if (res.ok) {
      setApplications(res.applications);
    } else {
      setError(res);
      setApplications((prev) => prev); // keep any previously loaded list visible on a transient refresh error
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    load();
    // refreshKey lets a parent (e.g. after a successful new submission) force a refetch.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [load, refreshKey]);

  return (
    <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-3">
      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
        <h3 className="text-sm font-extrabold text-[#223981]">Application History</h3>
        <button
          onClick={load}
          disabled={isLoading}
          className="p-1.5 text-[#2563EB] hover:bg-blue-50 rounded-full transition disabled:opacity-50"
          aria-label="Refresh"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {isLoading && applications === null && (
        <div className="flex items-center justify-center py-8 text-slate-400">
          <Loader2 className="w-5 h-5 animate-spin mr-2" />
          <span className="text-xs font-semibold">Loading your applications...</span>
        </div>
      )}

      {error && error.reason === 'offline' && (
        <div className="flex items-center space-x-2 p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs font-semibold text-slate-600">
          <WifiOff className="w-4 h-4 flex-shrink-0" />
          <span>{error.error}</span>
        </div>
      )}

      {error && error.reason !== 'offline' && (
        <div className="flex items-center space-x-2 p-3 bg-red-50 rounded-2xl border border-red-200 text-xs font-semibold text-red-700">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          <span>{error.error}</span>
        </div>
      )}

      {!isLoading && applications !== null && applications.length === 0 && (
        <div className="flex flex-col items-center py-8 text-center space-y-2">
          <Inbox className="w-8 h-8 text-slate-300" />
          <p className="text-xs font-semibold text-slate-400">No applications submitted yet.</p>
        </div>
      )}

      {applications && applications.length > 0 && (
        <div className="space-y-2.5">
          {applications.map((appItem) => {
            const status = String(appItem.status || 'FRESH').toUpperCase();
            const date = appItem.createdAt ? new Date(appItem.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : null;
            return (
              <div key={appItem.id || appItem.leadCode} className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#223981] font-mono">{appItem.leadCode || appItem.displayId || 'Pending ID'}</span>
                  <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${STATUS_STYLE[status] || 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                    {STATUS_LABEL[status] || status}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span>{appItem.amount ? `₹${Number(appItem.amount).toLocaleString('en-IN')}` : 'Amount not specified'}</span>
                  {date && <span>{date}</span>}
                </div>
                {appItem.assignedCompany && appItem.assignedCompany !== 'Pending Details' && (
                  <p className="text-[10.5px] text-slate-500">Lender: <span className="font-semibold text-slate-700">{appItem.assignedCompany}</span></p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
