import React from 'react';
import { DataSourceType, StreetlightStatus, DisturbanceCategory } from '../../types';
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
          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-teal-50 text-teal-700 border border-teal-200/90 shadow-xs ${className}`}
          title="Direct automated telemetry from connected sensor or municipal feed"
        >
          {showIcon && <Radio className="w-3 h-3 animate-pulse text-teal-600" />}
          Live Telemetry
        </span>
      );
    case 'official':
    case 'verified':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-powder-100 text-blue-800 border border-powder-200 shadow-xs ${className}`}
          title="Information verified by official civic source or municipality"
        >
          {showIcon && <Shield className="w-3 h-3 text-blue-600" />}
          Verified Civic
        </span>
      );
    case 'community':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-lavender-100 text-purple-800 border border-lavender-200 shadow-xs ${className}`}
          title="Observed and reported by verified community members"
        >
          {showIcon && <Users className="w-3 h-3 text-purple-600" />}
          Community Report
        </span>
      );
    case 'stale':
    case 'outdated':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-brand-pearl text-brand-text-secondary border border-brand-border shadow-xs ${className}`}
          title="Report is older than 24-48 hours and may no longer reflect current conditions"
        >
          {showIcon && <Clock className="w-3 h-3 text-brand-text-muted" />}
          Outdated (&gt;24h)
        </span>
      );
    case 'unverified':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-warning-50 text-warning-700 border border-warning-100 shadow-xs ${className}`}
          title="Report received but awaiting corroboration from other users or civic staff"
        >
          {showIcon && <AlertTriangle className="w-3 h-3 text-warning-600" />}
          Unverified
        </span>
      );
    case 'demo':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-champagne-50 text-champagne-700 border border-champagne-200 shadow-xs ${className}`}
          title="Simulated demonstration data for system evaluation"
        >
          {showIcon && <Sparkles className="w-3 h-3 text-champagne-500" />}
          Demo Preset
        </span>
      );
    case 'unknown':
    default:
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-brand-pearl text-brand-text-muted border border-brand-border shadow-xs ${className}`}
          title="No recent verified observations recorded for this point"
        >
          {showIcon && <HelpCircle className="w-3 h-3 text-brand-text-muted" />}
          Status Unknown
        </span>
      );
  }
};

export const StreetlightStatusBadge: React.FC<{ status: StreetlightStatus }> = ({ status }) => {
  switch (status) {
    case 'working':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-teal-50 text-teal-700 border border-teal-200/90 shadow-xs">
          <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse"></span>
          Illuminated
        </span>
      );
    case 'malfunctioning':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-danger-50 text-danger-700 border border-danger-100 shadow-xs">
          <span className="w-1.5 h-1.5 rounded-full bg-danger-500"></span>
          Light Off
        </span>
      );
    case 'partial_outage':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-warning-50 text-warning-700 border border-warning-100 shadow-xs">
          <span className="w-1.5 h-1.5 rounded-full bg-warning-500"></span>
          Partial Dimming
        </span>
      );
    case 'resolved':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-sage-50 text-emerald-700 border border-emerald-200/80 shadow-xs">
          <CheckCircle className="w-3 h-3 text-emerald-600" />
          Resolved
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-brand-pearl text-brand-text-muted border border-brand-border">
          Unknown
        </span>
      );
  }
};

export const DisturbanceCategoryLabel: React.FC<{ category: DisturbanceCategory }> = ({
  category,
}) => {
  const map: Record<DisturbanceCategory, { label: string; color: string }> = {
    harassment: {
      label: 'Harassment Concern',
      color: 'bg-danger-50 text-danger-700 border-danger-100',
    },
    disruptive_group: {
      label: 'Disruptive Group',
      color: 'bg-warning-50 text-warning-700 border-warning-100',
    },
    suspected_intoxication: {
      label: 'Intoxication Disturbance',
      color: 'bg-orange-50 text-orange-700 border-orange-100',
    },
    streetlight_issue: {
      label: 'Streetlight Outage',
      color: 'bg-champagne-50 text-champagne-700 border-champagne-200',
    },
    broken_footpath: {
      label: 'Broken Footpath',
      color: 'bg-stone-50 text-stone-700 border-stone-200',
    },
    blocked_road: {
      label: 'Blocked Way',
      color: 'bg-danger-50 text-danger-700 border-danger-100',
    },
    transport_disruption: {
      label: 'Transit Disruption',
      color: 'bg-powder-50 text-blue-700 border-powder-200',
    },
    facility_unavailable: {
      label: 'Facility Unavailable',
      color: 'bg-brand-pearl text-brand-text-secondary border-brand-border',
    },
    other_concern: {
      label: 'Travel Concern',
      color: 'bg-lavender-50 text-purple-700 border-lavender-100',
    },
  };

  const item = map[category] || { label: category, color: 'bg-brand-pearl text-brand-text-secondary border-brand-border' };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold border shadow-xs ${item.color}`}
    >
      {item.label}
    </span>
  );
};
