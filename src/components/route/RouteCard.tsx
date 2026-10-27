'use client';

import React from 'react';
import { RouteOption } from '@/types';
import {
  Clock,
  Lightbulb,
  Building2,
  Bus,
  AlertTriangle,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
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
  const arrivalTime = new Date(Date.now() + route.durationSeconds * 1000).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  const getPerspectiveStyle = () => {
    switch (route.perspective) {
      case 'better_supported':
        return {
          badgeBg: 'bg-teal-50 text-teal-800 border-teal-200/90 ring-1 ring-champagne-300/60',
          ringColor: 'ring-teal-500/40',
          borderSelected: 'border-teal-400 glass-pearl shadow-glass-pearl',
          accentColor: 'text-teal-600',
        };
      case 'fastest':
        return {
          badgeBg: 'bg-lavender-50 text-purple-800 border-lavender-200/90',
          ringColor: 'ring-purple-400/40',
          borderSelected: 'border-purple-400 glass-pearl shadow-glass-pearl',
          accentColor: 'text-purple-600',
        };
      case 'balanced':
      default:
        return {
          badgeBg: 'bg-powder-50 text-blue-800 border-powder-200/90',
          ringColor: 'ring-blue-400/40',
          borderSelected: 'border-blue-400 glass-pearl shadow-glass-pearl',
          accentColor: 'text-blue-600',
        };
    }
  };

  const style = getPerspectiveStyle();

  return (
    <div
      onClick={onSelect}
      className={`p-4 rounded-royal border transition-all duration-200 cursor-pointer relative overflow-hidden ${
        isSelected
          ? `${style.borderSelected} ring-2 ${style.ringColor}`
          : 'surface-pearl border-brand-border/80 hover:border-teal-200 hover:bg-white shadow-card'
      }`}
    >
      {/* Top perspective badge and duration */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <span
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider border shadow-xs ${style.badgeBg}`}
        >
          {route.perspective === 'better_supported' && <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />}
          {route.perspective === 'fastest' && <Clock className="w-3.5 h-3.5 text-purple-600" />}
          {route.perspective === 'balanced' && <Sparkles className="w-3.5 h-3.5 text-blue-600" />}
          {route.name}
        </span>
        <div className="flex flex-col items-end">
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl font-black text-brand-text">{minutes}</span>
            <span className="text-xs text-brand-text-secondary font-medium">min ({distanceKm} km)</span>
          </div>
          <span className="text-[10px] text-teal-700 font-bold tracking-tight">ETA ~{arrivalTime}</span>
        </div>
      </div>

      {/* Route tagline */}
      <p className="text-xs text-brand-text-secondary leading-relaxed line-clamp-2 mb-3 font-medium">
        {route.tagline}
      </p>

      {/* Metrics Row (Translucent Glass Pills) */}
      <div className="grid grid-cols-4 gap-1.5 py-2.5 px-2 rounded-2xl bg-white/70 border border-brand-border/70 backdrop-blur-sm mb-3 text-center shadow-inner-glass">
        {/* Lighting */}
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-1 text-[11px] text-amber-700 font-bold">
            <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
            <span>{route.verifiedLightCount} lit</span>
          </div>
          <span className="text-[10px] text-brand-text-muted mt-0.5 font-medium">
            {route.outageReportCount > 0 ? (
              <span className="text-danger-600 font-semibold">{route.outageReportCount} out</span>
            ) : (
              '0 outages'
            )}
          </span>
        </div>

        {/* Facilities */}
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-1 text-[11px] text-pink-700 font-bold">
            <Building2 className="w-3.5 h-3.5 text-pink-500" />
            <span>{route.nearbyFacilityCount}</span>
          </div>
          <span className="text-[10px] text-brand-text-muted mt-0.5 font-medium">Services</span>
        </div>

        {/* Transport */}
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-1 text-[11px] text-blue-700 font-bold">
            <Bus className="w-3.5 h-3.5 text-blue-500" />
            <span>{route.transportStopsNearby}</span>
          </div>
          <span className="text-[10px] text-brand-text-muted mt-0.5 font-medium">Transit</span>
        </div>

        {/* Data Coverage */}
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-1 text-[11px] text-teal-700 font-bold">
            <CheckCircle2 className="w-3.5 h-3.5 text-teal-500" />
            <span>{route.dataCoveragePercent}%</span>
          </div>
          <span className="text-[10px] text-brand-text-muted mt-0.5 font-medium">Coverage</span>
        </div>
      </div>

      {/* Active disturbance warning if present */}
      {route.activeConcernsCount > 0 && (
        <div className="flex items-center gap-2 p-2.5 rounded-xl bg-danger-50 border border-danger-100 text-danger-700 text-xs mb-3">
          <AlertTriangle className="w-4 h-4 shrink-0 text-danger-500" />
          <span className="font-medium text-[11px]">
            {route.activeConcernsCount} community disturbance concern(s) along this stretch
          </span>
        </div>
      )}

      {/* Card Footer */}
      <div className="flex items-center justify-between pt-2.5 border-t border-brand-border/70 text-xs">
        <span className="text-[11px] text-brand-text-secondary flex items-center gap-1 font-medium">
          {isSelected ? (
            <span className="text-teal-700 font-bold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-teal-500 ring-2 ring-teal-200 animate-pulse" />
              Active on Map
            </span>
          ) : (
            <span>Tap to view on map</span>
          )}
        </span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onOpenDetails();
          }}
          className="text-teal-700 hover:text-teal-900 font-bold flex items-center gap-1 text-xs py-1 px-3 rounded-full bg-teal-50/80 hover:bg-teal-100/80 border border-teal-200/70 transition-all shadow-xs"
        >
          <span>Why this route?</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
