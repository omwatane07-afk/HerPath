import React from 'react';
import { DataSourceType, StreetlightStatus, DisturbanceCategory } from '../../types';
import { Shield, Users, Radio, CheckCircle, AlertTriangle, Clock, HelpCircle, Sparkles, AlertCircle } from 'lucide-react';

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
          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-peacock-tint text-peacock-dark border border-peacock/25 shadow-e1 ${className}`}
          title="Direct automated telemetry from connected sensor or municipal feed"
        >
          {showIcon && <Radio className="w-3 h-3 text-peacock" />}
          Live Telemetry
        </span>
      );
    case 'official':
    case 'verified':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-verified-tint text-verified border border-verified/25 shadow-e1 ${className}`}
          title="Information verified by official civic source or municipality"
        >
          {showIcon && <Shield className="w-3 h-3 text-verified" />}
          Verified Civic
        </span>
      );
    case 'community':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-raised text-text border border-border-strong shadow-e1 ${className}`}
          title="Observed and reported by community members"
        >
          {showIcon && <Users className="w-3 h-3 text-text-secondary" />}
          Community Report
        </span>
      );
    case 'stale':
    case 'outdated':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-raised text-text-secondary border border-border shadow-e1 ${className}`}
          title="Report is older than 24-48 hours and may no longer reflect current conditions"
        >
          {showIcon && <Clock className="w-3 h-3 text-text-secondary" />}
          Outdated (&gt;24h)
        </span>
      );
    case 'unverified':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-caution-tint text-caution-dark border border-caution/30 shadow-e1 ${className}`}
          title="Report received but awaiting corroboration from other users or civic staff"
        >
          {showIcon && <AlertTriangle className="w-3 h-3 text-caution" />}
          Unverified
        </span>
      );
    case 'demo':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-raised text-text-secondary border border-border shadow-e1 ${className}`}
          title="Demonstration preset for system evaluation"
        >
          {showIcon && <Sparkles className="w-3 h-3 text-clay" />}
          Demo Preset
        </span>
      );
    case 'unknown':
    default:
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-paper text-text-secondary border border-border shadow-e1 ${className}`}
          title="No recent verified observations recorded for this point"
        >
          {showIcon && <HelpCircle className="w-3 h-3 text-text-secondary" />}
          No Data
        </span>
      );
  }
};

export const StreetlightStatusBadge: React.FC<{ status: StreetlightStatus }> = ({ status }) => {
  switch (status) {
    case 'working':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-verified-tint text-verified border border-verified/25 shadow-e1">
          <span className="w-1.5 h-1.5 rounded-full bg-verified"></span>
          Illuminated
        </span>
      );
    case 'malfunctioning':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-danger-tint text-danger border border-danger/25 shadow-e1">
          <span className="w-1.5 h-1.5 rounded-full bg-danger"></span>
          Light Off
        </span>
      );
    case 'partial_outage':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-caution-tint text-caution-dark border border-caution/30 shadow-e1">
          <span className="w-1.5 h-1.5 rounded-full bg-caution"></span>
          Partial Dimming
        </span>
      );
    case 'resolved':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-verified-tint text-verified border border-verified/25 shadow-e1">
          <CheckCircle className="w-3 h-3 text-verified" />
          Resolved
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-paper text-text-secondary border border-border">
          <HelpCircle className="w-3 h-3 text-text-secondary" />
          No Data
        </span>
      );
  }
};

export const DisturbanceCategoryLabel: React.FC<{ category: DisturbanceCategory }> = ({
  category,
}) => {
  const map: Record<DisturbanceCategory, { label: string; style: string; icon: React.ReactNode }> = {
    harassment: {
      label: 'Harassment Concern',
      style: 'bg-danger-tint text-danger border-danger/30',
      icon: <AlertCircle className="w-3 h-3 text-danger" />,
    },
    disruptive_group: {
      label: 'Disruptive Group',
      style: 'bg-caution-tint text-caution-dark border-caution/30',
      icon: <AlertTriangle className="w-3 h-3 text-caution" />,
    },
    suspected_intoxication: {
      label: 'Intoxication Disturbance',
      style: 'bg-caution-tint text-caution-dark border-caution/30',
      icon: <AlertTriangle className="w-3 h-3 text-caution" />,
    },
    streetlight_issue: {
      label: 'Streetlight Outage',
      style: 'bg-caution-tint text-caution-dark border-caution/30',
      icon: <AlertTriangle className="w-3 h-3 text-caution" />,
    },
    broken_footpath: {
      label: 'Broken Footpath',
      style: 'bg-raised text-text border-border-strong',
      icon: <AlertTriangle className="w-3 h-3 text-text-secondary" />,
    },
    blocked_road: {
      label: 'Blocked Way',
      style: 'bg-danger-tint text-danger border-danger/30',
      icon: <AlertCircle className="w-3 h-3 text-danger" />,
    },
    transport_disruption: {
      label: 'Transit Disruption',
      style: 'bg-info/10 text-info border-info/30',
      icon: <AlertTriangle className="w-3 h-3 text-info" />,
    },
    facility_unavailable: {
      label: 'Facility Unavailable',
      style: 'bg-raised text-text border-border-strong',
      icon: <AlertTriangle className="w-3 h-3 text-text-secondary" />,
    },
    other_concern: {
      label: 'Travel Concern',
      style: 'bg-raised text-text border-border-strong',
      icon: <AlertTriangle className="w-3 h-3 text-text-secondary" />,
    },
  };

  const item = map[category] || {
    label: category.replace(/_/g, ' '),
    style: 'bg-raised text-text border-border',
    icon: <AlertTriangle className="w-3 h-3 text-text-secondary" />,
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border shadow-e1 ${item.style}`}
    >
      {item.icon}
      <span>{item.label}</span>
    </span>
  );
};
