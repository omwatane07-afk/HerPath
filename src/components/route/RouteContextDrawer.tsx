'use client';

import React from 'react';
import { RouteOption } from '@/types';
import { DataSourceBadge } from '../ui/Badge';
import {
  X,
  Lightbulb,
  Building2,
  Bus,
  AlertTriangle,
  Navigation,
  Info,
  CheckCircle,
} from 'lucide-react';

interface RouteContextDrawerProps {
  route: RouteOption | null;
  onClose: () => void;
  onStartJourney: (route: RouteOption) => void;
}

export const RouteContextDrawer: React.FC<RouteContextDrawerProps> = ({
  route,
  onClose,
  onStartJourney,
}) => {
  if (!route) return null;

  const minutes = Math.round(route.durationSeconds / 60);
  const distanceKm = (route.distanceMeters / 1000).toFixed(1);

  return (
    <div
      className="fixed inset-0 z-[9998] flex items-center justify-end bg-ink/40 backdrop-blur-sm animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="route-context-title"
    >
      <div className="bg-canvas border-l border-border w-full max-w-md h-full flex flex-col text-ink shadow-e3 overflow-hidden">
        {/* Drawer Header */}
        <div className="p-4 sm:p-5 border-b border-border bg-card flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-primary font-editorial">
                Corridor Evaluation
              </span>
              <span className="text-xs text-text-secondary">• {route.name}</span>
            </div>
            <h3 id="route-context-title" className="font-editorial text-xl font-bold text-ink">
              Why this route?
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-text-secondary hover:text-ink p-2 rounded-xl bg-canvas hover:bg-canvas-2 transition-colors focus-ring-primary"
            aria-label="Close drawer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {/* Summary Figures */}
          <div className="surface-card p-4 grid grid-cols-3 divide-x divide-border text-center shadow-e1">
            <div>
              <div className="font-editorial text-2xl font-bold text-ink tabular-nums">{minutes} min</div>
              <div className="text-[11px] text-text-secondary font-medium">Walking Time</div>
            </div>
            <div>
              <div className="font-editorial text-2xl font-bold text-ink tabular-nums">{distanceKm} km</div>
              <div className="text-[11px] text-text-secondary font-medium">Distance</div>
            </div>
            <div>
              <div className="font-editorial text-2xl font-bold text-primary tabular-nums">
                {route.dataCoveragePercent}%
              </div>
              <div className="text-[11px] text-text-secondary font-medium">Data Coverage</div>
            </div>
          </div>

          {/* Perspective Reasoning */}
          <div className="p-4 rounded-card bg-primary-tint border border-primary/25">
            <h4 className="text-xs font-bold text-primary uppercase tracking-wider mb-1 flex items-center gap-1.5 font-editorial">
              <Info className="w-3.5 h-3.5 text-primary" />
              Routing Recommendation
            </h4>
            <p className="text-xs text-ink leading-relaxed font-medium">
              {route.relativeScoreDescription}
            </p>
          </div>

          {/* Factor-by-factor breakdown list */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-text-secondary px-0.5 font-editorial">
              Evaluated Infrastructure Evidence
            </h4>

            {route.factors.map((factor) => (
              <div
                key={factor.id}
                className="surface-card p-3.5 space-y-2 border border-border"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {factor.category === 'lighting' && (
                      <Lightbulb className="w-4 h-4 text-caution" />
                    )}
                    {factor.category === 'facilities' && (
                      <Building2 className="w-4 h-4 text-info" />
                    )}
                    {factor.category === 'transport' && (
                      <Bus className="w-4 h-4 text-info" />
                    )}
                    {factor.category === 'community' && (
                      <AlertTriangle className="w-4 h-4 text-caution" />
                    )}
                    {factor.category === 'coverage' && (
                      <CheckCircle className="w-4 h-4 text-verified" />
                    )}

                    <h5 className="font-editorial text-xs font-bold text-ink">
                      {factor.name}
                    </h5>
                  </div>

                  <DataSourceBadge source={factor.source} />
                </div>

                <p className="text-xs text-text-secondary leading-relaxed">
                  {factor.summary}
                </p>

                <div className="text-[11px] font-mono text-text-muted bg-canvas p-1.5 rounded-lg border border-border">
                  Telemetry Evidence: {factor.details}
                </div>
              </div>
            ))}
          </div>

          {/* Transparent limitations advisory */}
          <div className="p-3.5 rounded-xl bg-canvas border border-border text-xs text-text-secondary space-y-1">
            <div className="font-semibold text-ink text-[11px] flex items-center gap-1.5">
              <span>Decision Support Advisory</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              HERPATH displays verified municipal lighting and community reports. Scores reflect documented infrastructure coverage, not a guarantee of security. Always remain aware of surroundings.
            </p>
          </div>
        </div>

        {/* Footer with Primary Start Trip Button */}
        <div className="p-4 border-t border-border bg-card">
          <button
            type="button"
            onClick={() => onStartJourney(route)}
            className="btn-primary w-full py-2.5 text-xs font-bold flex items-center justify-center gap-2"
          >
            <Navigation className="w-4 h-4 text-white" />
            <span>Start trip along this corridor</span>
          </button>
        </div>
      </div>
    </div>
  );
};
