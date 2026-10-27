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
  Compass,
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
    <div className="fixed inset-0 z-[9998] flex items-center justify-end bg-brand-text/30 backdrop-blur-sm animate-fadeIn">
      <div className="surface-pearl border-l border-white/95 w-full max-w-md h-full flex flex-col text-brand-text shadow-glass-floating overflow-hidden animate-slideIn">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-brand-border/70 flex items-center justify-between glass-pearl">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-black uppercase tracking-wider text-teal-700">
                Route Analysis
              </span>
              <span className="text-xs font-mono text-brand-text-secondary">• {route.name}</span>
            </div>
            <h3 className="text-lg font-black text-brand-text">Transparent Route Context</h3>
          </div>
          <button
            onClick={onClose}
            className="text-brand-text-secondary hover:text-brand-text p-2 rounded-xl glass-crystal transition-colors active:scale-95"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {/* Quick Metrics */}
          <div className="p-4 rounded-royal surface-pearl border border-brand-border/80 flex items-center justify-around text-center shadow-card">
            <div>
              <div className="text-2xl font-black text-brand-text">{minutes} min</div>
              <div className="text-xs text-brand-text-secondary font-medium">Travel Time</div>
            </div>
            <div className="h-8 w-px bg-brand-border" />
            <div>
              <div className="text-2xl font-black text-brand-text">{distanceKm} km</div>
              <div className="text-xs text-brand-text-secondary font-medium">Total Distance</div>
            </div>
            <div className="h-8 w-px bg-brand-border" />
            <div>
              <div className="text-2xl font-black text-teal-700">
                {route.dataCoveragePercent}%
              </div>
              <div className="text-xs text-brand-text-secondary font-medium">Documented</div>
            </div>
          </div>

          {/* Perspective Rationalization */}
          <div className="p-4 rounded-royal bg-teal-50/80 border border-teal-100 shadow-xs">
            <h4 className="text-xs font-bold text-teal-800 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Info className="w-4 h-4 text-teal-600" />
              Why this perspective?
            </h4>
            <p className="text-xs text-teal-950 leading-relaxed font-medium">
              {route.relativeScoreDescription}
            </p>
          </div>

          {/* Factor-by-factor breakdown list */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-brand-text-muted">
              Evaluated Infrastructure Factors
            </h4>

            {route.factors.map((factor) => (
              <div
                key={factor.id}
                className="p-4 rounded-royal surface-pearl border border-brand-border/80 shadow-card space-y-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {factor.category === 'lighting' && (
                      <Lightbulb className="w-4 h-4 text-amber-500 shrink-0" />
                    )}
                    {factor.category === 'facilities' && (
                      <Building2 className="w-4 h-4 text-pink-500 shrink-0" />
                    )}
                    {factor.category === 'transport' && (
                      <Bus className="w-4 h-4 text-blue-500 shrink-0" />
                    )}
                    {factor.category === 'community' && (
                      <AlertTriangle className="w-4 h-4 text-danger-500 shrink-0" />
                    )}
                    {factor.category === 'coverage' && (
                      <CheckCircle className="w-4 h-4 text-teal-500 shrink-0" />
                    )}
                    <span className="text-xs font-bold text-brand-text">{factor.name}</span>
                  </div>
                  <DataSourceBadge source={factor.source} />
                </div>
                <div className="text-xs font-bold text-brand-text">{factor.summary}</div>
                <p className="text-[11px] text-brand-text-secondary leading-relaxed font-medium">
                  {factor.details}
                </p>
              </div>
            ))}
          </div>

          {/* Turn-by-turn guidance */}
          {route.steps.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-brand-text-muted flex items-center gap-1.5">
                <Footprints className="w-4 h-4 text-teal-600" />
                Turn-by-Turn Waypoints ({route.steps.length} steps)
              </h4>

              <div className="space-y-2">
                {route.steps.map((step, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-3 p-3 rounded-2xl bg-white/80 border border-brand-border/80 text-xs shadow-xs"
                  >
                    <span className="w-6 h-6 rounded-full bg-white text-teal-700 font-bold flex items-center justify-center shrink-0 text-xs border border-brand-border shadow-xs">
                      {idx + 1}
                    </span>
                    <div className="flex-1">
                      <p className="text-brand-text font-semibold">{step.instruction}</p>
                      <div className="text-[11px] text-brand-text-secondary mt-0.5 font-medium">
                        {step.distanceMeters} m • approx {Math.ceil(step.durationSeconds / 60)} min
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Disclaimer reminder */}
          <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-100 text-[11px] text-amber-900 flex items-start gap-2.5">
            <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong className="font-bold text-amber-950">Decision Support Advisory:</strong> Safety ratings
              are relative context, not guarantees of personal security. Conditions change rapidly. Stay observant of
              your surroundings and trust your instincts.
            </p>
          </div>
        </div>

        {/* Footer with Journey Trigger */}
        <div className="p-4 border-t border-brand-border/70 glass-pearl flex gap-3 shadow-glass">
          <button
            onClick={() => onStartJourney(route)}
            className="flex-1 py-3 px-5 rounded-full bg-gradient-to-r from-teal-500 via-teal-600 to-teal-700 hover:from-teal-600 hover:to-teal-800 active:scale-98 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md shadow-teal-600/25 transition-all"
          >
            <Compass className="w-4 h-4" />
            <span>Start Family Journey</span>
          </button>
        </div>
      </div>
    </div>
  );
};
