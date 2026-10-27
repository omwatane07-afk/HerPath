'use client';

import React from 'react';
import { RouteOption } from '@/types';
import {
  Clock,
  Lightbulb,
  Building2,
  AlertTriangle,
  ChevronRight,
  ShieldCheck,
  Scale,
  Zap,
  Navigation,
} from 'lucide-react';

interface RouteCardProps {
  route: RouteOption;
  isSelected: boolean;
  onSelect: () => void;
  onOpenDetails: () => void;
  onStartTrip?: () => void;
}

export const RouteCard: React.FC<RouteCardProps> = ({
  route,
  isSelected,
  onSelect,
  onOpenDetails,
  onStartTrip,
}) => {
  const minutes = Math.round(route.durationSeconds / 60);
  const distanceKm = (route.distanceMeters / 1000).toFixed(1);
  const arrivalTime = new Date(Date.now() + route.durationSeconds * 1000).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  const isSynthetic =
    (route as any).source === 'synthetic_fallback' ||
    route.steps.some((s) => s.instruction.includes('thoroughfare'));

  // Stable per-perspective icon and label
  const getPerspectiveMeta = () => {
    switch (route.perspective) {
      case 'better_supported':
        return {
          label: 'Better-Supported',
          icon: <ShieldCheck className="w-3.5 h-3.5 text-verified" />,
          desc: 'High infrastructure coverage & monitored streets',
        };
      case 'fastest':
        return {
          label: 'Fastest Path',
          icon: <Zap className="w-3.5 h-3.5 text-primary" />,
          desc: 'Direct pedestrian walkway (shortest physical distance)',
        };
      case 'balanced':
      default:
        return {
          label: 'Balanced Corridor',
          icon: <Scale className="w-3.5 h-3.5 text-text-secondary" />,
          desc: 'Moderate pedestrian flow with transit proximity',
        };
    }
  };

  const meta = getPerspectiveMeta();

  return (
    <article
      onClick={onSelect}
      className={`p-4 rounded-card border transition-all cursor-pointer relative select-none focus-ring-primary ${
        isSelected
          ? 'bg-primary-tint border-2 border-primary shadow-violet'
          : 'bg-card border-border hover:border-primary card-interactive shadow-e1'
      }`}
      aria-selected={isSelected}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect();
        }
      }}
    >
      {/* Header Row: Perspective Badge + Geometry Status + Duration */}
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                isSelected
                  ? 'bg-white text-primary border border-primary/30 shadow-sm'
                  : 'bg-canvas text-ink border border-border'
              }`}
            >
              {meta.icon}
              <span>{meta.label}</span>
            </span>

            {/* Geometry Provenance Badge */}
            <span
              className={`text-[10px] font-medium px-2 py-0.5 rounded border ${
                isSynthetic
                  ? 'bg-canvas text-text-muted border-border border-dashed'
                  : 'bg-verified-tint text-verified border-verified/30'
              }`}
              title={
                isSynthetic
                  ? 'Synthesized route corridor based on street layout'
                  : 'Navigable geometry verified by OpenStreetMap OSRM'
              }
            >
              {isSynthetic ? 'Approximate path' : 'OSRM Verified'}
            </span>
          </div>

          <h4 className="font-editorial text-base font-bold text-ink mt-1 leading-snug">
            {route.summary || meta.desc}
          </h4>
        </div>

        {/* Tabular Numerical Duration & Distance */}
        <div className="text-right shrink-0">
          <div className="flex items-baseline justify-end gap-1">
            <span className="font-serif text-2xl font-bold text-ink tabular-nums italic">
              {minutes}
            </span>
            <span className="text-xs text-text-secondary font-medium">min</span>
          </div>
          <p className="text-[11px] text-text-muted tabular-nums">
            {distanceKm} km · ETA {arrivalTime}
          </p>
        </div>
      </div>

      {/* Corridor Infrastructure Evidence Rows */}
      <div className="mt-3 pt-2.5 border-t border-border/80 space-y-1.5 text-xs text-text-secondary">
        <div className="flex items-center gap-2">
          <Lightbulb className="w-3.5 h-3.5 text-caution shrink-0" />
          <span className="tabular-nums">
            <strong className="text-ink font-semibold">{route.verifiedLightCount} working streetlights</strong> documented along corridor
            {route.outageReportCount > 0 && (
              <span className="text-error font-medium"> ({route.outageReportCount} reported out)</span>
            )}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Building2 className="w-3.5 h-3.5 text-info shrink-0" />
          <span className="tabular-nums">
            <strong className="text-ink font-semibold">{route.nearbyFacilityCount} essential facilities</strong> (pharmacies, restrooms, police desks)
          </span>
        </div>

        {route.activeConcernsCount > 0 && (
          <div className="flex items-center gap-2 text-caution-text">
            <AlertTriangle className="w-3.5 h-3.5 text-caution shrink-0" />
            <span className="tabular-nums">
              <strong>{route.activeConcernsCount} community report(s)</strong> noted nearby
            </span>
          </div>
        )}
      </div>

      {/* Actions Row */}
      <div className="mt-3 pt-2.5 border-t border-border/60 flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onOpenDetails();
          }}
          className="text-xs font-semibold text-text-secondary hover:text-primary flex items-center gap-1 px-2 py-1 rounded-md hover:bg-canvas transition-colors focus-ring-primary"
        >
          <span>Why this route?</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>

        {isSelected ? (
          <div className="flex items-center gap-2">
            {onStartTrip && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onStartTrip();
                }}
                className="btn-primary px-3 py-1.5 text-xs font-bold flex items-center gap-1.5"
              >
                <Navigation className="w-3.5 h-3.5 text-white" />
                <span>Start Trip</span>
              </button>
            )}
            <span className="text-xs font-bold text-primary px-2 py-1 bg-white rounded-md border border-primary/30">
              Selected
            </span>
          </div>
        ) : (
          <span className="text-xs font-medium text-text-muted">Tap to select</span>
        )}
      </div>
    </article>
  );
};
