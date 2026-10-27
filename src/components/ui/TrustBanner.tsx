import React, { useState } from 'react';
import { Info, X, ShieldAlert } from 'lucide-react';

export const TrustBanner: React.FC = () => {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="bg-navy-900/90 border-b border-teal-500/20 px-4 py-2.5 text-xs text-slate-300 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto flex items-start sm:items-center justify-between gap-3">
        <div className="flex items-start sm:items-center gap-2.5">
          <ShieldAlert className="w-4 h-4 text-teal-400 shrink-0 mt-0.5 sm:mt-0" />
          <p className="leading-relaxed">
            <strong className="text-teal-300 font-semibold">Transparency Promise:</strong> HERPATH
            provides relative infrastructure context and community observations. We{' '}
            <span className="text-slate-100 font-medium">never label any route 100% safe</span>,
            fabricate live crowd counts, or track users covertly.
          </p>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="text-slate-400 hover:text-slate-200 p-1 shrink-0 transition-colors"
          title="Dismiss advisory"
          aria-label="Dismiss advisory"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
