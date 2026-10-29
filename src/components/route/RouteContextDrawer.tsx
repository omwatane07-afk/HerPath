'use client';

import React, { useState } from 'react';
import { RouteOption, WeatherContext } from '@/types';
import { DataSourceBadge } from '../ui/Badge';
import { WeatherWidget } from '../weather/WeatherWidget';
import { formatDistance, formatDuration, formatRelativeTime } from '@/lib/utils';
import {
  X,
  Lightbulb,
  Building2,
  Bus,
  AlertTriangle,
  Navigation,
  Info,
  CheckCircle2,
  Sparkles,
  Scale,
  ShieldCheck,
  Clock,
  EyeOff,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface RouteContextDrawerProps {
  route: RouteOption | null;
  weather?: WeatherContext | null;
  onClose: () => void;
  onStartJourney: (route: RouteOption) => void;
}

export const RouteContextDrawer: React.FC<RouteContextDrawerProps> = ({
  route,
  weather,
  onClose,
  onStartJourney,
}) => {
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false);

  if (!route) return null;

  const minutes = Math.round(route.durationSeconds / 60);
  const distanceKm = (route.distanceMeters / 1000).toFixed(1);
  const isFastest = route.perspective === 'fastest';

  return (
    <div
      className="fixed inset-0 z-[9998] flex items-center justify-end bg-ink/40 backdrop-blur-sm animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="route-context-title"
    >
      <div className="bg-[#FCFAFF] border-l border-white/60 w-full max-w-lg h-full flex flex-col text-ink shadow-2xl overflow-hidden relative backdrop-blur-xl">
        {/* Subtle Pearl Glass Accent Line */}
        <div className="h-1.5 w-full bg-gradient-to-r from-grape via-periwinkle to-butter/80" />

        {/* Drawer Header (Royal Soft Glass) */}
        <div className="p-4 sm:p-5 border-b border-border/80 bg-white/90 backdrop-blur-md flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-lilac/70 text-grape border border-purple-200">
                <Sparkles className="w-3 h-3 text-grape" />
                <span>Explainable Route Intelligence</span>
              </span>
              <span className="text-xs text-soft-ink font-semibold">• {route.name}</span>
            </div>
            <h3 id="route-context-title" className="font-heading text-xl font-extrabold text-ink">
              Why this route?
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-soft-ink hover:text-ink p-2 rounded-full bg-paper hover:bg-lilac/60 transition-colors focus-ring-primary"
            aria-label="Close route explanation"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {/* Section 1: Why the Route Was Suggested (Headline Rationale) */}
          <div className="p-4 rounded-[22px] bg-white border border-purple-200/80 shadow-sm space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-grape uppercase tracking-wider font-heading">
              <Info className="w-4 h-4 text-grape shrink-0" />
              <span>Core Recommendation Rationale</span>
            </div>
            <p className="text-sm text-ink leading-relaxed font-semibold">
              {route.recommendationRationale || route.relativeScoreDescription}
            </p>
            {route.tradeOff && (
              <div className="mt-2 pt-2 border-t border-purple-100 flex items-center gap-2 text-xs font-medium text-soft-ink">
                <Scale className="w-3.5 h-3.5 text-grape shrink-0" />
                <span>{route.tradeOff.headlineTradeOff}</span>
              </div>
            )}
          </div>

          {/* Section 2: Travel-Time & Distance Comparison Numbers */}
          <div className="p-4 rounded-[22px] bg-white border border-border shadow-sm grid grid-cols-3 divide-x divide-border text-center">
            <div>
              <div className="font-heading text-2xl font-extrabold text-ink tabular-nums">{minutes} min</div>
              <div className="text-[11px] text-soft-ink font-bold">Walking Time</div>
              {route.tradeOff && route.tradeOff.timeDeltaSeconds !== 0 && (
                <div className="text-[10px] text-soft-ink font-semibold mt-0.5">
                  +{formatDuration(route.tradeOff.timeDeltaSeconds)} vs fastest
                </div>
              )}
            </div>
            <div>
              <div className="font-heading text-2xl font-extrabold text-ink tabular-nums">{distanceKm} km</div>
              <div className="text-[11px] text-soft-ink font-bold">Physical Distance</div>
              {route.tradeOff && route.tradeOff.distanceDeltaMeters !== 0 && (
                <div className="text-[10px] text-soft-ink font-semibold mt-0.5">
                  +{formatDistance(route.tradeOff.distanceDeltaMeters)} vs fastest
                </div>
              )}
            </div>
            <div>
              <div className="font-heading text-2xl font-extrabold text-grape tabular-nums">
                {route.dataCoveragePercent}%
              </div>
              <div className="text-[11px] text-soft-ink font-bold">Data Coverage</div>
              <div className="text-[10px] text-soft-ink font-semibold mt-0.5">
                {100 - route.dataCoveragePercent}% unmapped
              </div>
            </div>
          </div>

          {/* Section 2b: Live Atmospheric Weather Telemetry (OpenWeatherMap) */}
          {weather && (
            <WeatherWidget weather={weather} />
          )}

          {/* Section 3: Streetlight Infrastructure Breakdown */}
          <div className="p-4 rounded-[22px] bg-white border border-border shadow-sm space-y-2.5">
            <div className="flex items-center justify-between">
              <h4 className="font-heading font-extrabold text-xs text-ink uppercase tracking-wider flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-amber-500" />
                <span>Streetlight Illumination</span>
              </h4>
              <span className="text-[11px] font-bold text-soft-ink">
                {route.lightingCoveragePercent}% Corridor Coverage
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-200">
                <div className="font-heading font-extrabold text-base text-emerald-800 tabular-nums">
                  {route.verifiedLightCount}
                </div>
                <div className="text-[11px] text-emerald-700 font-medium">Verified Working Poles</div>
              </div>
              <div className={`p-2.5 rounded-xl border ${route.outageReportCount > 0 ? 'bg-danger-tint/60 border-danger/30' : 'bg-[#F1EAFF] border-lilac'}`}>
                <div className={`font-heading font-extrabold text-base tabular-nums ${route.outageReportCount > 0 ? 'text-danger' : 'text-soft-ink'}`}>
                  {route.outageReportCount}
                </div>
                <div className={`text-[11px] font-medium ${route.outageReportCount > 0 ? 'text-danger' : 'text-soft-ink'}`}>
                  Reported Luminaire Outages
                </div>
              </div>
            </div>

            <p className="text-xs text-soft-ink leading-relaxed">
              Streetlight observations reflect municipal records and corroborated community notes.
              Portions without telemetry are evaluated strictly as unknown, never assumed lit.
            </p>
          </div>

          {/* Section 4: Relevant Civic & Community Reports Along Route */}
          <div className="p-4 rounded-[22px] bg-white border border-border shadow-sm space-y-2.5">
            <div className="flex items-center justify-between">
              <h4 className="font-heading font-extrabold text-xs text-ink uppercase tracking-wider flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-grape" />
                <span>Civic Observations Along Corridor</span>
              </h4>
              <span className="text-[11px] font-bold text-soft-ink">
                {route.activeConcernsCount} Active Concern{route.activeConcernsCount === 1 ? '' : 's'}
              </span>
            </div>

            {route.relevantReports && route.relevantReports.length > 0 ? (
              <div className="space-y-2">
                {route.relevantReports.map((item) => (
                  <div
                    key={item.report.id}
                    className={`p-3 rounded-xl border text-xs space-y-1 ${
                      item.isVerified
                        ? 'bg-amber-50/60 border-amber-300/80'
                        : item.isOutdatedOrStale
                        ? 'bg-gray-50 border-gray-200 opacity-75'
                        : 'bg-white border-purple-100'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-bold text-ink">{item.report.locationName}</span>
                        {item.isVerified && (
                          <span className="text-[10px] bg-emerald-50 text-emerald-800 font-bold px-1.5 py-0.5 rounded border border-emerald-200">
                            Verified
                          </span>
                        )}
                        {item.isOutdatedOrStale && (
                          <span className="text-[10px] bg-gray-100 text-gray-600 font-bold px-1.5 py-0.5 rounded border border-gray-300">
                            Stale (&gt;threshold)
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] font-mono text-soft-ink tabular-nums">
                        {item.distanceMeters}m from path
                      </span>
                    </div>
                    <p className="text-[11px] text-soft-ink leading-snug font-medium">
                      {item.report.description}
                    </p>
                    <div className="text-[10px] text-soft-ink pt-0.5 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-soft-ink" />
                      <span>Reported {formatRelativeTime(item.report.createdAt)}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-200 text-xs text-emerald-800 font-medium">
                No active disturbance or infrastructure reports recorded within 180m of this corridor in the past 48 hours.
              </div>
            )}
          </div>

          {/* Section 5: Nearby Public Facilities (With Verified Distances) */}
          <div className="p-4 rounded-[22px] bg-white border border-border shadow-sm space-y-2.5">
            <div className="flex items-center justify-between">
              <h4 className="font-heading font-extrabold text-xs text-ink uppercase tracking-wider flex items-center gap-2">
                <Building2 className="w-4 h-4 text-grape" />
                <span>Nearby Essential Facilities</span>
              </h4>
              <span className="text-[11px] font-bold text-soft-ink">
                {route.nearbyFacilityCount} Open Points
              </span>
            </div>

            {route.nearbyFacilitiesWithDistance && route.nearbyFacilitiesWithDistance.length > 0 ? (
              <div className="space-y-2">
                {route.nearbyFacilitiesWithDistance.map(({ facility, distanceMeters }) => (
                  <div
                    key={facility.id}
                    className="p-3 rounded-xl bg-[#FCFAFF] border border-purple-100 flex items-start justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="font-bold text-ink leading-snug">{facility.name}</div>
                      <div className="text-[11px] text-soft-ink mt-0.5">
                        {facility.address || facility.category.replace(/_/g, ' ')}
                      </div>
                      {facility.hasFemaleStaff && (
                        <span className="inline-block mt-1 text-[10px] font-bold text-grape bg-lilac/50 px-2 py-0.5 rounded-full">
                          Female Staff Verified
                        </span>
                      )}
                    </div>
                    <span className="text-xs font-mono font-bold text-grape shrink-0 tabular-nums">
                      {distanceMeters}m
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-soft-ink leading-relaxed">
                No 24/7 pharmacies, police assistance desks, or public restrooms recorded directly along this stretch.
              </p>
            )}
          </div>

          {/* Section 6: Honest Uncertainty & Missing Information */}
          <div className="p-4 rounded-[22px] bg-amber-50/60 border border-amber-200 text-xs space-y-2">
            <div className="flex items-center gap-2 font-heading font-extrabold text-amber-900">
              <EyeOff className="w-4 h-4 text-amber-700" />
              <span>Honest Uncertainty & Data Limitations</span>
            </div>
            <p className="text-[11px] text-amber-900/90 leading-relaxed font-medium">
              {route.unknownStretchesSummary || 'Coverage is partial along secondary thoroughfares.'}
            </p>
            <p className="text-[11px] text-amber-900/80 leading-relaxed font-medium">
              <strong>Ground Rule:</strong> Lack of reported issues indicates an absence of data, never a guarantee of absolute safety. Missing segments are never scored as safe.
            </p>
          </div>

          {/* Collapsible Factor Technical Cards */}
          <div className="pt-1">
            <button
              type="button"
              onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
              className="w-full flex items-center justify-between text-xs font-bold text-soft-ink hover:text-ink py-2 px-1 focus-ring-primary rounded-xl"
            >
              <span>Detailed Evaluation Factors ({route.factors.length})</span>
              {showTechnicalDetails ? (
                <ChevronUp className="w-4 h-4 text-soft-ink" />
              ) : (
                <ChevronDown className="w-4 h-4 text-soft-ink" />
              )}
            </button>

            {showTechnicalDetails && (
              <div className="mt-2 space-y-2.5 animate-fade-in">
                {route.factors.map((factor) => (
                  <div key={factor.id} className="p-3.5 rounded-xl bg-white border border-border space-y-1 text-xs">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-heading font-extrabold text-ink">{factor.name}</span>
                      <DataSourceBadge source={factor.source} />
                    </div>
                    <div className="font-bold text-grape">{factor.summary}</div>
                    <p className="text-[11px] text-soft-ink leading-relaxed">{factor.details}</p>
                    {factor.lastUpdated && (
                      <div className="text-[10px] text-soft-ink pt-0.5">
                        Last confirmed: {formatRelativeTime(factor.lastUpdated)}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Mandatory Truthfulness Disclaimer */}
          <div className="p-3.5 rounded-[18px] bg-[#FFF9E6] border border-[#FFD966]/80 text-[11px] text-amber-950 leading-relaxed font-medium">
            <strong className="text-amber-950 font-bold">HERPATH Advisory Principle:</strong> {route.disclaimer}
          </div>
        </div>

        {/* Footer Action */}
        <div className="p-4 border-t border-border/80 bg-white/95 backdrop-blur-md flex items-center gap-3">
          <button
            type="button"
            onClick={() => onStartJourney(route)}
            className="btn-primary w-full py-3 text-xs font-bold flex items-center justify-center gap-2 shadow-md"
          >
            <Navigation className="w-4 h-4 text-white" />
            <span>Start Trip along this Corridor</span>
          </button>
        </div>
      </div>
    </div>
  );
};
