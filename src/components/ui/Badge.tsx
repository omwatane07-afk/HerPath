import React from 'react';
import { DataSourceType, ReportStatus, StreetlightStatus, FacilityCategory, DisturbanceCategory } from '@/types';
import { Shield, Users, Radio, CheckCircle, AlertTriangle, Clock, HelpCircle, Sparkles } from 'lucide-react';

interface DataSourceBadgeProps {
  source: DataSourceType;
  className?: string;
  showIcon?: boolean;
}

export const DataSourceBadge: React.FC<DataSourceBadgeProps> = ({
  source,
  className = '',
  showIcon = true,
}) => {
  switch (source) {
    case 'live_feed':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-950/60 text-emerald-400 border border-emerald-800/60 ${className}`}
          title="Direct automated telemetry from connected sensor or municipal feed"
        >
          {showIcon && <Radio className="w-3 h-3 animate-pulse text-emerald-400" />}
          Live Telemetry
        </span>
      );
    case 'official':
    case 'verified':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-cyan-950/60 text-cyan-300 border border-cyan-800/60 ${className}`}
          title="Information verified by official civic source or municipality"
        >
          {showIcon && <Shield className="w-3 h-3 text-cyan-400" />}
          Verified Civic
        </span>
      );
    case 'community':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-violet-950/60 text-violet-300 border border-violet-800/60 ${className}`}
          title="Observed and reported by verified community members"
        >
          {showIcon && <Users className="w-3 h-3 text-violet-400" />}
          Community Report
        </span>
      );
    case 'stale':
    case 'outdated':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-slate-900/80 text-slate-400 border border-slate-700/60 ${className}`}
          title="Report is older than 24-48 hours and may no longer reflect current conditions"
        >
          {showIcon && <Clock className="w-3 h-3 text-slate-400" />}
          Outdated (&gt;24h)
        </span>
      );
    case 'unverified':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-950/60 text-amber-300 border border-amber-800/60 ${className}`}
          title="Report received but awaiting corroboration from other users or civic staff"
        >
          {showIcon && <AlertTriangle className="w-3 h-3 text-amber-400" />}
          Unverified
        </span>
      );
    case 'demo':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-950/60 text-indigo-300 border border-indigo-800/60 ${className}`}
          title="Simulated demonstration data for system evaluation"
        >
          {showIcon && <Sparkles className="w-3 h-3 text-indigo-400" />}
          Demo Preset
        </span>
      );
    case 'unknown':
    default:
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-slate-900/80 text-slate-400 border border-slate-700 ${className}`}
          title="No recent verified observations recorded for this point"
        >
          {showIcon && <HelpCircle className="w-3 h-3 text-slate-400" />}
          Status Unknown
        </span>
      );
  }
};

export const StreetlightStatusBadge: React.FC<{ status: StreetlightStatus }> = ({ status }) => {
  switch (status) {
    case 'working':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-950/60 text-emerald-300 border border-emerald-800/60">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
          Illuminated
        </span>
      );
    case 'malfunctioning':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-rose-950/60 text-rose-300 border border-rose-800/60">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
          Light Off / Malfunctioning
        </span>
      );
    case 'partial_outage':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-950/60 text-amber-300 border border-amber-800/60">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
          Partial Dimming
        </span>
      );
    case 'resolved':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-teal-950/60 text-teal-300 border border-teal-800/60">
          <CheckCircle className="w-3 h-3 text-teal-400" />
          Resolved
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-slate-800 text-slate-300">
          Unknown
        </span>
      );
  }
};

export const DisturbanceCategoryLabel: React.FC<{ category: DisturbanceCategory }> = ({
  category,
}) => {
  const map: Record<DisturbanceCategory, { label: string; color: string }> = {
    harassment: { label: 'Harassment Concern', color: 'bg-rose-950/80 text-rose-300 border-rose-800' },
    disruptive_group: {
      label: 'Disruptive Group',
      color: 'bg-amber-950/80 text-amber-300 border-amber-800',
    },
    suspected_intoxication: {
      label: 'Intoxication Disturbance',
      color: 'bg-orange-950/80 text-orange-300 border-orange-800',
    },
    streetlight_issue: {
      label: 'Streetlight Outage',
      color: 'bg-yellow-950/80 text-yellow-300 border-yellow-800',
    },
    broken_footpath: {
      label: 'Broken Footpath',
      color: 'bg-stone-900/80 text-stone-300 border-stone-700',
    },
    blocked_road: { label: 'Blocked Way', color: 'bg-red-950/80 text-red-300 border-red-800' },
    transport_disruption: {
      label: 'Transit Disruption',
      color: 'bg-blue-950/80 text-blue-300 border-blue-800',
    },
    facility_unavailable: {
      label: 'Facility Unavailable',
      color: 'bg-slate-900/80 text-slate-300 border-slate-700',
    },
    other_concern: {
      label: 'Travel Concern',
      color: 'bg-indigo-950/80 text-indigo-300 border-indigo-800',
    },
  };

  const item = map[category] || { label: category, color: 'bg-slate-800 text-slate-300' };

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${item.color}`}
    >
      {item.label}
    </span>
  );
};
