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
    <div className="fixed inset-0 z-[9998] flex items-center justify-end bg-navy-950/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-navy-900 border-l border-slate-700/80 w-full max-w-md h-full flex flex-col text-slate-100 shadow-2xl overflow-hidden animate-slideIn">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider text-teal-400">
                Route Analysis
              </span>
              <span className="text-xs font-mono text-slate-400">• {route.name}</span>
            </div>
            <h3 className="text-lg font-bold text-white">Transparent Route Breakdown</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-lg bg-navy-800 hover:bg-navy-750 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {/* Quick Metrics */}
          <div className="p-4 rounded-2xl bg-navy-950 border border-slate-800 flex items-center justify-around text-center">
            <div>
              <div className="text-xl font-extrabold text-white">{minutes} min</div>
              <div className="text-xs text-slate-400">Travel Time</div>
            </div>
            <div className="h-8 w-px bg-slate-800" />
            <div>
              <div className="text-xl font-extrabold text-white">{distanceKm} km</div>
              <div className="text-xs text-slate-400">Total Distance</div>
            </div>
            <div className="h-8 w-px bg-slate-800" />
            <div>
              <div className="text-xl font-extrabold text-teal-400">
                {route.dataCoveragePercent}%
              </div>
              <div className="text-xs text-slate-400">Documented</div>
            </div>
          </div>

          {/* Perspective Rationalization */}
          <div className="p-4 rounded-xl bg-navy-850 border border-teal-500/30">
            <h4 className="text-xs font-bold text-teal-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Info className="w-4 h-4 text-teal-400" />
              Why this perspective?
            </h4>
            <p className="text-xs text-slate-200 leading-relaxed">{route.relativeScoreDescription}</p>
          </div>

          {/* Factor-by-factor breakdown list */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Evaluated Infrastructure Factors
            </h4>

            {route.factors.map((factor) => (
              <div
                key={factor.id}
                className="p-3.5 rounded-xl bg-navy-950/80 border border-slate-800 space-y-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {factor.category === 'lighting' && (
                      <Lightbulb className="w-4 h-4 text-amber-400 shrink-0" />
                    )}
                    {factor.category === 'facilities' && (
                      <Building2 className="w-4 h-4 text-pink-400 shrink-0" />
                    )}
                    {factor.category === 'transport' && (
                      <Bus className="w-4 h-4 text-indigo-400 shrink-0" />
                    )}
                    {factor.category === 'community' && (
                      <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                    )}
                    {factor.category === 'coverage' && (
                      <CheckCircle className="w-4 h-4 text-teal-400 shrink-0" />
                    )}
                    <span className="text-xs font-bold text-slate-200">{factor.name}</span>
                  </div>
                  <DataSourceBadge source={factor.source} />
                </div>
                <div className="text-xs font-medium text-slate-100">{factor.summary}</div>
                <p className="text-[11px] text-slate-400 leading-relaxed">{factor.details}</p>
              </div>
            ))}
          </div>

          {/* Turn-by-turn guidance */}
          {route.steps.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Footprints className="w-4 h-4 text-teal-400" />
                Turn-by-Turn Waypoints ({route.steps.length} steps)
              </h4>

              <div className="space-y-2">
                {route.steps.map((step, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-3 p-2.5 rounded-lg bg-navy-950/60 border border-slate-800/80 text-xs"
                  >
                    <span className="w-5 h-5 rounded-full bg-navy-800 text-slate-300 font-bold flex items-center justify-center shrink-0 text-[10px]">
                      {idx + 1}
                    </span>
                    <div className="flex-1">
                      <p className="text-slate-200 font-medium">{step.instruction}</p>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        {step.distanceMeters} m • approx {Math.ceil(step.durationSeconds / 60)} min
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Disclaimer reminder */}
          <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-700/60 text-[11px] text-slate-400 flex items-start gap-2.5">
            <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong className="text-slate-200">Decision Support Advisory:</strong> Safety ratings
              are not guarantees of personal security. Conditions change rapidly. Stay observant of
              your surroundings and trust your instincts.
            </p>
          </div>
        </div>

        {/* Footer with Journey Trigger */}
        <div className="p-4 border-t border-slate-800 bg-navy-950/90 flex gap-3">
          <button
            onClick={() => onStartJourney(route)}
            className="flex-1 py-3 px-4 rounded-xl bg-teal-600 hover:bg-teal-500 active:scale-98 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-teal-950/60 transition-all"
          >
            <Compass className="w-4 h-4" />
            <span>Start Family Journey</span>
          </button>
        </div>
      </div>
    </div>
  );
};
