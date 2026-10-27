import React, { useState } from 'react';
import { ShieldCheck, X } from 'lucide-react';

export const TrustBanner: React.FC = () => {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="bg-teal-25/90 border-b border-teal-100/70 px-3 sm:px-4 py-2 text-xs text-brand-text backdrop-blur-md transition-all">
      <div className="max-w-7xl mx-auto flex items-start sm:items-center justify-between gap-2.5">
        <div className="flex items-start sm:items-center gap-2 min-w-0">
          <div className="w-5 h-5 rounded-full bg-teal-100 flex items-center justify-center shrink-0 mt-0.5 sm:mt-0 text-teal-700 ring-1 ring-champagne-300/60 shadow-xs">
            <ShieldCheck className="w-3.5 h-3.5" />
          </div>
          <p className="leading-relaxed text-[11px] sm:text-xs text-brand-text-secondary">
            <strong className="text-brand-text font-bold">Transparency Promise:</strong> Relative infrastructure context & verified community observations. We{' '}
            <span className="text-teal-700 font-semibold underline decoration-teal-300">
              never label any route 100% safe
            </span>
            , fabricate live crowd numbers, or track users covertly.
          </p>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="text-brand-text-muted hover:text-brand-text p-1 shrink-0 transition-colors rounded-lg hover:bg-teal-100/50"
          title="Dismiss advisory"
          aria-label="Dismiss advisory"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
