'use client';

import React from 'react';
import { RouteOption } from '@/types';
import {
  Lightbulb,
  Building2,
  AlertTriangle,
  ChevronRight,
  ShieldCheck,
  Scale,
  Zap,
  Navigation,
  Check,
  Info,
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
  const [isClient, setIsClient] = React.useState(false);
  React.useEffect(() => {
    setIsClient(true);
  }, []);

  const minutes = Math.round(route.durationSeconds / 60);
  const distanceKm = (route.distanceMeters / 1000).toFixed(1);
  const arrivalTime = isClient
    ? new Date(Date.now() + route.durationSeconds * 1000).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      })
    : null;

  const providerName =
    (route as any).source === 'geoapify'
      ? 'Geoapify Pedestrian'
      : (route as any).source === 'osrm'
      ? 'OSRM Road Network'
      : 'Pedestrian Network';

  // Stable per-perspective icon and label
  const getPerspectiveMeta = () => {
    if (route.isOnlyAvailableRoute) {
      return {
        label: 'Direct Navigable Route',
        icon: <Info className="w-3.5 h-3.5 text-grape" />,
        desc: 'Sole corridor available from routing provider',
        badgeBg: 'bg-lilac text-grape border-purple-200',
      };
    }

    switch (route.perspective) {
      case 'better_supported':
        return {
          label: 'Infrastructure-Informed Alternative',
          icon: <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />,
          desc: 'Corridor with verified streetlights and open public services',
          badgeBg: 'bg-emerald-50 text-emerald-800 border-emerald-300',
        };
      case 'fastest':
        return {
          label: 'Fastest Path',
          icon: <Zap className="w-3.5 h-3.5 text-grape" />,
          desc: 'Direct pedestrian walkway (shortest physical transit time)',
          badgeBg: 'bg-lilac text-grape border-purple-200',
        };
      case 'balanced':
      default:
        return {
          label: 'Balanced Corridor',
          icon: <Scale className="w-3.5 h-3.5 text-indigo-700" />,
          desc: 'Intermediate option between transit pace and street illumination',
          badgeBg: 'bg-blue-50 text-indigo-800 border-indigo-200',
        };
    }
  };

  const meta = getPerspectiveMeta();

  return (
    <article
      onClick={onSelect}
      className={`p-4 rounded-[22px] transition-all cursor-pointer relative select-none focus-ring-primary backdrop-blur-md ${
        isSelected
          ? 'bg-white/95 border-2 border-grape shadow-lg -translate-y-0.5 ring-2 ring-purple-200/50'
          : 'bg-white/80 border border-purple-100 hover:border-grape/50 shadow-sm hover:shadow-md hover:-translate-y-0.5'
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
          <div className="flex items-center flex-wrap gap-1.5">
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold border shadow-xs ${meta.badgeBg}`}
            >
              {meta.icon}
              <span>{meta.label}</span>
            </span>

            {/* Geometry Provenance Badge */}
            <span
              className="text-[10px] font-semibold px-2 py-0.5 rounded-full border bg-emerald-50 text-emerald-800 border-emerald-200"
              title="Geometry calculated along the actual mapped pedestrian street network"
            >
              {providerName}
            </span>
          </div>

          <h4 className="font-heading text-base font-extrabold text-ink mt-1 leading-snug">
            {route.summary || meta.desc}
          </h4>
        </div>

        {/* Tabular Numerical Duration & Distance */}
        <div className="text-right shrink-0">
          <div className="flex items-baseline justify-end gap-1">
            <span className="font-heading text-2xl font-extrabold text-ink tabular-nums">
              {minutes}
            </span>
            <span className="text-xs text-soft-ink font-bold">min</span>
          </div>
          <p className="text-[11px] text-soft-ink tabular-nums font-medium">
            {distanceKm} km{arrivalTime ? ` · ETA ${arrivalTime}` : ''}
          </p>
        </div>
      </div>

      {/* Trade-off Highlight Badge */}
      {route.tradeOff && route.tradeOff.headlineTradeOff && (
        <div className="my-2 p-2 rounded-xl bg-[#FCFAFF] border border-purple-100/90 text-[11px] text-soft-ink font-medium flex items-center gap-1.5">
          <Scale className="w-3.5 h-3.5 text-grape shrink-0" />
          <span className="text-ink font-semibold">{route.tradeOff.headlineTradeOff}</span>
        </div>
      )}

      {/* Corridor Infrastructure Evidence Rows */}
      <div className="mt-2.5 pt-2 border-t border-purple-100/80 space-y-1.5 text-xs text-soft-ink">
        <div className="flex items-center gap-2">
          <Lightbulb className="w-3.5 h-3.5 text-amber-500 shrink-0" />
          <span className="tabular-nums">
            <strong className="text-ink font-bold">{route.verifiedLightCount} working streetlights</strong> documented along corridor
            {route.outageReportCount > 0 && (
              <span className="text-danger font-semibold"> ({route.outageReportCount} reported out)</span>
            )}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Building2 className="w-3.5 h-3.5 text-grape shrink-0" />
          <span className="tabular-nums">
            <strong className="text-ink font-bold">{route.nearbyFacilityCount} open facilities</strong> (pharmacies, medical, restrooms)
          </span>
        </div>

        {route.activeConcernsCount > 0 && (
          <div className="flex items-center gap-2 text-danger">
            <AlertTriangle className="w-3.5 h-3.5 text-danger shrink-0" />
            <span className="tabular-nums">
              <strong>{route.activeConcernsCount} civic report(s)</strong> noted nearby
            </span>
          </div>
        )}
      </div>

      {/* Actions Row */}
      <div className="mt-3 pt-2.5 border-t border-purple-100 flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onOpenDetails();
          }}
          className="min-h-[38px] text-xs font-bold text-grape hover:text-grape-hover flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-lilac/50 hover:bg-lilac border border-purple-200 transition-colors focus-ring-primary"
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
                className="btn-primary min-h-[38px] px-3.5 py-1.5 text-xs font-bold flex items-center gap-1.5"
              >
                <Navigation className="w-3.5 h-3.5 text-white" />
                <span>Start Trip</span>
              </button>
            )}
            <span className="text-xs font-bold text-grape px-2.5 py-1.5 bg-[#F1EAFF] rounded-full border border-grape/30 flex items-center gap-1">
              <Check className="w-3 h-3 stroke-[3]" />
              <span>Selected</span>
            </span>
          </div>
        ) : (
          <span className="text-xs font-bold text-soft-ink hover:text-grape py-1">Tap to select</span>
        )}
      </div>
    </article>
  );
};
