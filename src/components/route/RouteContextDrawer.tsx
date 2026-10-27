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
      className="fixed inset-0 z-[9998] flex items-center justify-end bg-bordeaux/40 backdrop-blur-sm animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="route-context-title"
    >
      <div className="bg-canvas border-l border-border-gold/60 w-full max-w-md h-full flex flex-col text-bordeaux shadow-atelier overflow-hidden">
        {/* Drawer Header */}
        <div className="p-4 sm:p-5 border-b border-border bg-white flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-rose-gold font-editorial">
                Corridor Evaluation
              </span>
              <span className="text-xs text-text-secondary">• {route.name}</span>
            </div>
            <h3 id="route-context-title" className="font-editorial text-xl font-bold text-bordeaux">
              Why this route?
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-text-secondary hover:text-bordeaux p-2 rounded-xl bg-canvas hover:bg-canvas-subtle transition-colors focus-ring-bordeaux"
            aria-label="Close drawer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {/* Summary Figures */}
          <div className="surface-card p-4 grid grid-cols-3 divide-x divide-border text-center shadow-atelier">
            <div>
              <div className="font-editorial text-2xl font-bold text-bordeaux">{minutes} min</div>
              <div className="text-[11px] text-text-secondary font-medium">Walking Time</div>
            </div>
            <div>
              <div className="font-editorial text-2xl font-bold text-bordeaux">{distanceKm} km</div>
              <div className="text-[11px] text-text-secondary font-medium">Distance</div>
            </div>
            <div>
              <div className="font-editorial text-2xl font-bold text-champagne-dark">
                {route.dataCoveragePercent}%
              </div>
              <div className="text-[11px] text-text-secondary font-medium">Data Coverage</div>
            </div>
          </div>

          {/* Perspective Reasoning */}
          <div className="p-4 rounded-card bg-rose-tint border border-rose-gold/30">
            <h4 className="text-xs font-bold text-rose-gold uppercase tracking-wider mb-1 flex items-center gap-1.5 font-editorial">
              <Info className="w-3.5 h-3.5 text-rose-gold" />
              Routing Recommendation
            </h4>
            <p className="text-xs text-bordeaux leading-relaxed font-medium">
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
                className="surface-card p-3.5 space-y-1.5 border border-border hover:border-champagne transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {factor.category === 'lighting' && (
                      <Lightbulb className="w-4 h-4 text-caution shrink-0" />
                    )}
                    {factor.category === 'facilities' && (
                      <Building2 className="w-4 h-4 text-rose-gold shrink-0" />
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
                    <span className="text-xs font-bold text-bordeaux">{factor.name}</span>
                  </div>
                  <DataSourceBadge source={factor.source} />
                </div>
                <div className="text-xs font-semibold text-bordeaux">{factor.summary}</div>
                <p className="text-[11px] text-text-secondary leading-relaxed">
                  {factor.details}
                </p>
              </div>
            ))}
          </div>

          {/* Turn-by-turn guidance */}
          {route.steps.length > 0 && (
            <div className="space-y-2.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-text-secondary px-0.5 flex items-center gap-1.5 font-editorial">
                <Footprints className="w-3.5 h-3.5 text-rose-gold" />
                Waypoints ({route.steps.length} steps)
              </h4>

              <div className="space-y-1.5">
                {route.steps.map((step, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-2.5 p-3 rounded-xl bg-white border border-border text-xs"
                  >
                    <span className="w-5 h-5 rounded-full bg-canvas text-bordeaux font-bold flex items-center justify-center shrink-0 text-[11px] border border-border-gold/50">
                      {idx + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-bordeaux font-semibold">{step.instruction}</p>
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
          <div className="p-3.5 rounded-xl bg-surface-raised border border-border text-[11px] text-text-secondary flex items-start gap-2.5">
            <ShieldAlert className="w-4 h-4 text-caution shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong className="text-bordeaux font-semibold">Honest Decision Support:</strong> Infrastructure data reflects documented municipal databases and community reports. Missing information represents a data gap, not proof that a street is unsafe or empty.
            </p>
          </div>
        </div>

        {/* Footer with Journey Trigger */}
        <div className="p-4 border-t border-border bg-white flex gap-3">
          <button
            onClick={() => onStartJourney(route)}
            className="btn-bordeaux flex-1 py-2.5 px-4 text-xs font-bold flex items-center justify-center gap-2 shadow-md"
          >
            <Navigation className="w-4 h-4 text-champagne" />
            <span>Start Family Journey</span>
          </button>
        </div>
      </div>
    </div>
  );
};
