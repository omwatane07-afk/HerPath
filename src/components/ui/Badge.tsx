import React from 'react';
import { DataSourceType, StreetlightStatus, DisturbanceCategory, ReportLifecycleStatus } from '../../types';
import { getCivicCategory } from '../../lib/civic-categories';
import {
  Shield,
  Users,
  Radio,
  CheckCircle,
  AlertTriangle,
  Clock,
  HelpCircle,
  Sparkles,
  AlertCircle,
  FileSearch,
  CheckCircle2,
  XCircle,
} from 'lucide-react';

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

export const ReportLifecycleBadge: React.FC<{ status: ReportLifecycleStatus | string }> = ({
  status,
}) => {
  switch (status) {
    case 'verified':
      return (
        <span
          className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-300 shadow-xs"
          title="Evidence corroborated and verified according to municipal criteria"
        >
          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
          <span>Verified Civic</span>
        </span>
      );
    case 'under_review':
      return (
        <span
          className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-sky-50 text-sky-800 border border-sky-300 shadow-xs"
          title="Authorized reviewer or municipal engineer is currently examining report evidence"
        >
          <FileSearch className="w-3 h-3 text-sky-600" />
          <span>Under Review</span>
        </span>
      );
    case 'resolved':
      return (
        <span
          className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#F1EAFF] text-soft-ink border border-lilac"
          title="Reported issue confirmed as resolved by municipal or maintenance workflow"
        >
          <CheckCircle className="w-3 h-3 text-grape" />
          <span>Resolved</span>
        </span>
      );
    case 'invalidated':
      return (
        <span
          className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 text-gray-600 border border-gray-300"
          title="Report evidence was reviewed and determined to be invalid or erroneous"
        >
          <XCircle className="w-3 h-3 text-gray-500" />
          <span>Invalidated</span>
        </span>
      );
    case 'outdated':
      return (
        <span
          className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-300"
          title="Report has expired its category freshness threshold"
        >
          <Clock className="w-3 h-3 text-amber-600" />
          <span>Stale / Outdated</span>
        </span>
      );
    case 'pending':
    default:
      return (
        <span
          className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200"
          title="Initial submission received; pending authorized review"
        >
          <AlertTriangle className="w-3 h-3 text-amber-600" />
          <span>Pending Review</span>
        </span>
      );
  }
};

export const DisturbanceCategoryLabel: React.FC<{ category: DisturbanceCategory | string }> = ({
  category,
}) => {
  const catConfig = getCivicCategory(category);

  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border shadow-xs bg-white text-ink border-purple-200"
      title={catConfig.description}
    >
      <span className="text-xs">{catConfig.icon}</span>
      <span className="font-bold text-ink">{catConfig.shortName}</span>
    </span>
  );
};
