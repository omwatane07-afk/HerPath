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
  CheckCircle2,
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

  const isSynthetic = (route as any).source === 'synthetic_fallback' || route.steps.some((s) => s.instruction.includes('thoroughfare'));

  // Get route perspective display label
  const getPerspectiveLabel = () => {
    switch (route.perspective) {
      case 'better_supported':
        return 'Better-Supported';
      case 'fastest':
        return 'Fastest Path';
      case 'balanced':
      default:
        return 'Balanced Route';
    }
  };

  return (
    <article
      onClick={onSelect}
      className={`p-4 rounded-card border transition-all cursor-pointer relative select-none focus-ring-bordeaux ${
        isSelected
          ? 'bg-rose-tint border-2 border-rose-gold shadow-md'
          : 'bg-white border-border hover:border-champagne card-interactive shadow-e1'
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
      {/* Header Row: Priority + ETA */}
      <div className="flex items-start justify-between gap-3 mb-2">
        <div>
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                isSelected
                  ? 'bg-white text-rose-gold border border-rose-gold/40 shadow-sm'
                  : 'bg-canvas text-bordeaux border border-border'
              }`}
            >
              {route.perspective === 'better_supported' && <ShieldCheck className="w-3.5 h-3.5 text-champagne-dark" />}
              {route.perspective === 'fastest' && <Clock className="w-3.5 h-3.5 text-bordeaux" />}
              {route.perspective === 'balanced' && <CheckCircle2 className="w-3.5 h-3.5 text-bordeaux" />}
              <span>{getPerspectiveLabel()}</span>
            </span>

            {/* Truthful Geometry Status */}
            <span
              className={`text-[11px] font-medium px-2 py-0.5 rounded border ${
                isSynthetic
                  ? 'bg-canvas text-text-secondary border-border border-dashed'
                  : 'bg-verified-tint text-verified border-verified/30'
              }`}
              title={isSynthetic ? 'Synthesized route corridor based on street layout' : 'Navigable geometry verified by OpenStreetMap OSRM'}
            >
              {isSynthetic ? 'Approximate path' : 'OSRM Verified'}
            </span>
          </div>

          <h4 className="font-editorial text-lg font-bold text-bordeaux mt-1.5 leading-snug">
            {route.summary || route.name}
          </h4>
        </div>

        {/* Large ETA Figure */}
        <div className="text-right shrink-0">
          <div className="font-editorial text-3xl font-bold italic text-bordeaux leading-none">
            {minutes}
            <span className="font-sans text-xs not-italic font-medium text-text-secondary ml-1">min</span>
          </div>
          <div className="text-[12px] text-text-secondary mt-1 font-medium">
            {distanceKm} km · ETA {arrivalTime}
          </div>
        </div>
      </div>

      {/* Supporting Evidence Lines (Truthful data only) */}
      <div className="mt-3 pt-3 border-t border-border/80 space-y-1.5 text-xs text-text-secondary">
        <div className="flex items-center gap-2">
          <Lightbulb className="w-3.5 h-3.5 text-caution shrink-0" />
          <span>
            {route.verifiedLightCount > 0 ? (
              <>
                <strong className="text-bordeaux font-semibold">{route.verifiedLightCount} working streetlights</strong> documented along corridor
                {route.outageReportCount > 0 && (
                  <span className="text-danger font-semibold"> ({route.outageReportCount} reported out)</span>
                )}
              </>
            ) : (
              <span className="text-text-muted">No streetlight data recorded for this stretch</span>
            )}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Building2 className="w-3.5 h-3.5 text-rose-gold shrink-0" />
          <span>
            {route.nearbyFacilityCount > 0 ? (
              <>
                <strong className="text-bordeaux font-semibold">{route.nearbyFacilityCount} essential facilities</strong> (pharmacies, restrooms, police desks)
              </>
            ) : (
              <span className="text-text-muted">No open facilities mapped directly on route</span>
            )}
          </span>
        </div>

        {route.activeConcernsCount > 0 && (
          <div className="flex items-center gap-2 text-danger font-medium">
            <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-danger" />
            <span>{route.activeConcernsCount} community report(s) noted nearby</span>
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="mt-3.5 pt-2.5 border-t border-border/70 flex items-center justify-between text-xs">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onOpenDetails();
          }}
          className="text-rose-gold hover:text-bordeaux font-semibold flex items-center gap-1 focus-ring-bordeaux rounded-lg py-1 px-1.5 -ml-1.5 transition-colors"
        >
          <span>Why this route?</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>

        <div className="flex items-center gap-2">
          {onStartTrip && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onStartTrip();
              }}
              className="btn-bordeaux px-3 py-1.5 text-xs flex items-center gap-1.5 shadow-sm"
            >
              <Navigation className="w-3 h-3 text-champagne" />
              <span>Start Trip</span>
            </button>
          )}

          <span className="text-[11px] font-medium text-text-secondary">
            {isSelected ? (
              <span className="text-rose-gold font-bold">Selected</span>
            ) : (
              <span>Select route</span>
            )}
          </span>
        </div>
      </div>
    </article>
  );
};
