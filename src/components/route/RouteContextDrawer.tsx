'use client';

import React from 'react';
import { RouteOption } from '@/types';
import { DataSourceBadge } from '../ui/Badge';
import {
  X,
  ShieldAlert,
  Lightbulb,
  Building2,
  Bus,
  AlertTriangle,
  Navigation,
  Footprints,
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
      className="fixed inset-0 z-[9998] flex items-center justify-end bg-ink/30 backdrop-blur-sm animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="route-context-title"
    >
      <div className="bg-paper border-l border-border w-full max-w-md h-full flex flex-col text-ink shadow-e3 overflow-hidden">
        {/* Drawer Header */}
        <div className="p-4 sm:p-5 border-b border-border bg-white flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-peacock-dark">
                Route Analysis
              </span>
              <span className="text-xs text-text-secondary">• {route.name}</span>
            </div>
            <h3 id="route-context-title" className="font-serif text-xl font-bold text-ink">
              Why this route?
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-text-secondary hover:text-ink p-2 rounded-lg bg-paper hover:bg-raised transition-colors focus-ring-peacock"
            aria-label="Close drawer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {/* Summary Figures */}
          <div className="surface-card p-4 grid grid-cols-3 divide-x divide-border text-center">
            <div>
              <div className="font-serif text-2xl font-bold text-ink">{minutes} min</div>
              <div className="text-[11px] text-text-secondary font-medium">Walking Time</div>
            </div>
            <div>
              <div className="font-serif text-2xl font-bold text-ink">{distanceKm} km</div>
              <div className="text-[11px] text-text-secondary font-medium">Distance</div>
            </div>
            <div>
              <div className="font-serif text-2xl font-bold text-peacock-dark">
                {route.dataCoveragePercent}%
              </div>
              <div className="text-[11px] text-text-secondary font-medium">Data Coverage</div>
            </div>
          </div>

          {/* Perspective Reasoning */}
          <div className="p-4 rounded-card bg-peacock-tint border border-peacock/25">
            <h4 className="text-xs font-bold text-peacock-dark uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-peacock" />
              Routing Recommendation
            </h4>
            <p className="text-xs text-ink leading-relaxed font-medium">
              {route.relativeScoreDescription}
            </p>
          </div>

          {/* Factor-by-factor breakdown list */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-text-secondary px-0.5">
              Evaluated Infrastructure Evidence
            </h4>

            {route.factors.map((factor) => (
              <div
                key={factor.id}
                className="surface-card p-3.5 space-y-1.5"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {factor.category === 'lighting' && (
                      <Lightbulb className="w-4 h-4 text-caution shrink-0" />
                    )}
                    {factor.category === 'facilities' && (
                      <Building2 className="w-4 h-4 text-peacock shrink-0" />
                    )}
                    {factor.category === 'transport' && (
                      <Bus className="w-4 h-4 text-info shrink-0" />
                    )}
                    {factor.category === 'community' && (
                      <AlertTriangle className="w-4 h-4 text-danger shrink-0" />
                    )}
                    {factor.category === 'coverage' && (
                      <CheckCircle className="w-4 h-4 text-verified shrink-0" />
                    )}
                    <span className="text-xs font-bold text-ink">{factor.name}</span>
                  </div>
                  <DataSourceBadge source={factor.source} />
                </div>
                <div className="text-xs font-semibold text-ink">{factor.summary}</div>
                <p className="text-[11px] text-text-secondary leading-relaxed">
                  {factor.details}
                </p>
              </div>
            ))}
          </div>

          {/* Turn-by-turn guidance */}
          {route.steps.length > 0 && (
            <div className="space-y-2.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-text-secondary px-0.5 flex items-center gap-1.5">
                <Footprints className="w-3.5 h-3.5 text-peacock" />
                Waypoints ({route.steps.length} steps)
              </h4>

              <div className="space-y-1.5">
                {route.steps.map((step, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-2.5 p-3 rounded-lg bg-white border border-border text-xs"
                  >
                    <span className="w-5 h-5 rounded-full bg-paper text-ink font-bold flex items-center justify-center shrink-0 text-[11px] border border-border">
                      {idx + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-ink font-semibold">{step.instruction}</p>
                      <div className="text-[11px] text-text-secondary mt-0.5">
                        {step.distanceMeters} m · approx {Math.ceil(step.durationSeconds / 60)} min
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Transparent limitation reminder */}
          <div className="p-3.5 rounded-lg bg-raised border border-border text-[11px] text-text-secondary flex items-start gap-2.5">
            <ShieldAlert className="w-4 h-4 text-caution shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong className="text-ink font-semibold">Honest Decision Support:</strong> Infrastructure data reflects documented municipal databases and community reports. Missing information represents a data gap, not proof that a street is unsafe or empty.
            </p>
          </div>
        </div>

        {/* Footer with Journey Trigger */}
        <div className="p-4 border-t border-border bg-white flex gap-3">
          <button
            onClick={() => onStartJourney(route)}
            className="btn-ink flex-1 py-2.5 px-4 text-xs font-bold flex items-center justify-center gap-2 shadow-e1"
          >
            <Navigation className="w-4 h-4 text-peacock-tint" />
            <span>Start Family Journey</span>
          </button>
        </div>
      </div>
    </div>
  );
};
