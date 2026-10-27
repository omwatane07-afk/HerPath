import React from 'react';
import { RouteOption } from '@/types';
import { DataSourceBadge } from '../ui/Badge';
import {
  Clock,
  Navigation,
  Lightbulb,
  Building2,
  Bus,
  AlertTriangle,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';

interface RouteCardProps {
  route: RouteOption;
  isSelected: boolean;
  onSelect: () => void;
  onOpenDetails: () => void;
}

export const RouteCard: React.FC<RouteCardProps> = ({
  route,
  isSelected,
  onSelect,
  onOpenDetails,
}) => {
  const minutes = Math.round(route.durationSeconds / 60);
  const distanceKm = (route.distanceMeters / 1000).toFixed(1);

  const getPerspectiveStyle = () => {
    switch (route.perspective) {
      case 'better_supported':
        return {
          badgeBg: 'bg-teal-950/90 text-teal-300 border-teal-500/50',
          ringColor: 'ring-teal-500',
          borderSelected: 'border-teal-500 bg-navy-850/95',
          accentColor: 'text-teal-400',
        };
      case 'fastest':
        return {
          badgeBg: 'bg-indigo-950/90 text-indigo-300 border-indigo-500/50',
          ringColor: 'ring-indigo-500',
          borderSelected: 'border-indigo-500 bg-navy-850/95',
          accentColor: 'text-indigo-400',
        };
      case 'balanced':
      default:
        return {
          badgeBg: 'bg-sky-950/90 text-sky-300 border-sky-500/50',
          ringColor: 'ring-sky-500',
          borderSelected: 'border-sky-500 bg-navy-850/95',
          accentColor: 'text-sky-400',
        };
    }
  };

  const style = getPerspectiveStyle();

  return (
    <div
      onClick={onSelect}
      className={`p-4 rounded-2xl border transition-all cursor-pointer relative overflow-hidden ${
        isSelected
          ? `${style.borderSelected} shadow-xl shadow-navy-950/60 ring-2 ${style.ringColor}`
          : 'bg-navy-900/80 border-slate-800 hover:border-slate-700 hover:bg-navy-850/90'
      }`}
    >
      {/* Top perspective badge and duration */}
      <div className="flex items-center justify-between gap-2 mb-2.5">
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider border ${style.badgeBg}`}
        >
          {route.perspective === 'better_supported' && <ShieldCheck className="w-3.5 h-3.5" />}
          {route.perspective === 'fastest' && <Clock className="w-3.5 h-3.5" />}
          {route.name}
        </span>
        <div className="flex items-baseline gap-1.5">
          <span className="text-xl font-extrabold text-white">{minutes}</span>
          <span className="text-xs text-slate-400 font-medium">min ({distanceKm} km)</span>
        </div>
      </div>

      {/* Route tagline */}
      <p className="text-xs text-slate-300 leading-relaxed line-clamp-2 mb-3">
        {route.tagline}
      </p>

      {/* Metrics Row */}
      <div className="grid grid-cols-4 gap-1.5 py-2 px-2.5 rounded-xl bg-navy-950/80 border border-slate-800/80 mb-3 text-center">
        {/* Lighting */}
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-1 text-[11px] text-amber-400 font-semibold">
            <Lightbulb className="w-3 h-3" />
            <span>{route.verifiedLightCount} lit</span>
          </div>
          <span className="text-[10px] text-slate-400">
            {route.outageReportCount > 0 ? (
              <span className="text-rose-400 font-medium">{route.outageReportCount} out</span>
            ) : (
              '0 outages'
            )}
          </span>
        </div>

        {/* Facilities */}
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-1 text-[11px] text-pink-400 font-semibold">
            <Building2 className="w-3 h-3" />
            <span>{route.nearbyFacilityCount}</span>
          </div>
          <span className="text-[10px] text-slate-400">Services</span>
        </div>

        {/* Transport */}
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-1 text-[11px] text-indigo-400 font-semibold">
            <Bus className="w-3 h-3" />
            <span>{route.transportStopsNearby}</span>
          </div>
          <span className="text-[10px] text-slate-400">Transit stops</span>
        </div>

        {/* Data Coverage */}
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-1 text-[11px] text-teal-400 font-semibold">
            <CheckCircle2 className="w-3 h-3" />
            <span>{route.dataCoveragePercent}%</span>
          </div>
          <span className="text-[10px] text-slate-400">Coverage</span>
        </div>
      </div>

      {/* Active disturbance warning if present */}
      {route.activeConcernsCount > 0 && (
        <div className="flex items-center gap-2 p-2 rounded-lg bg-rose-950/60 border border-rose-800/60 text-rose-300 text-xs mb-3">
          <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
          <span className="font-medium text-[11px]">
            {route.activeConcernsCount} community disturbance concern(s) along this stretch
          </span>
        </div>
      )}

      {/* Card Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-xs">
        <span className="text-[11px] text-slate-400 flex items-center gap-1">
          {isSelected ? (
            <span className="text-teal-400 font-medium">● Active on Map</span>
          ) : (
            <span>Click to view route on map</span>
          )}
        </span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onOpenDetails();
          }}
          className="text-teal-400 hover:text-teal-300 font-semibold flex items-center gap-0.5 text-xs py-1 px-2 rounded-lg hover:bg-teal-950/50 transition-colors"
        >
          <span>Why this route?</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
