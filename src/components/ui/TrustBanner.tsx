'use client';

import React, { useState, useEffect } from 'react';
import { ShieldCheck, X } from 'lucide-react';

export const TrustBanner: React.FC = () => {
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isDismissed = localStorage.getItem('herpath_trust_dismissed') === 'true';
      setDismissed(isDismissed);
    }
  }, []);

  const handleDismiss = () => {
    setDismissed(true);
    if (typeof window !== 'undefined') {
      localStorage.setItem('herpath_trust_dismissed', 'true');
    }
  };

  if (dismissed) return null;

  return (
    <div className="bg-surface-raised border-b border-border-gold/40 px-4 py-2.5 text-xs text-bordeaux transition-all shadow-sm">
      <div className="max-w-7xl mx-auto flex items-start sm:items-center justify-between gap-3">
        <div className="flex items-start sm:items-center gap-2.5 min-w-0">
          <div className="w-5 h-5 rounded-full bg-champagne-tint flex items-center justify-center shrink-0 mt-0.5 sm:mt-0 text-champagne-dark border border-champagne/40">
            <ShieldCheck className="w-3.5 h-3.5" />
          </div>
          <p className="leading-relaxed text-[12px] text-text-secondary">
            <strong className="text-bordeaux font-semibold">How route information works:</strong> HERPATH provides transparent infrastructure data (streetlights, open facilities, and community reports). We{' '}
            <span className="text-bordeaux font-semibold">
              never claim any route is 100% safe
            </span>
            , never profile neighborhoods, and never track you covertly.
          </p>
        </div>
        <button
          onClick={handleDismiss}
          className="text-text-secondary hover:text-bordeaux p-1 shrink-0 transition-colors rounded-lg hover:bg-canvas"
          title="Dismiss notice"
          aria-label="Dismiss notice"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
