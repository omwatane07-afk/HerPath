'use client';

import React, { useState } from 'react';
import { CommunityReport } from '@/types';
import { DisturbanceCategoryLabel, DataSourceBadge } from '../ui/Badge';
import { formatRelativeTime } from '@/lib/utils';
import {
  ThumbsUp,
  Flag,
  CheckCircle,
  Plus,
  AlertTriangle,
  Clock,
  Check,
  ShieldAlert,
  HardDrive,
} from 'lucide-react';

interface ReportListProps {
  reports: CommunityReport[];
  onUpvoteReport: (id: string) => void;
  onFlagReport: (id: string) => void;
  onResolveReport?: (id: string) => void;
  onOpenReportModal: () => void;
}

export const ReportList: React.FC<ReportListProps> = ({
  reports,
  onUpvoteReport,
  onFlagReport,
  onOpenReportModal,
}) => {
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<'active' | 'resolved' | 'all'>('active');

  const filtered = reports.filter((rep) => {
    if (filterStatus === 'active' && rep.status === 'resolved') return false;
    if (filterStatus === 'resolved' && rep.status !== 'resolved') return false;
    if (filterCategory !== 'all' && rep.category !== filterCategory) return false;
    return true;
  });

  const activeCount = reports.filter((r) => r.status !== 'resolved').length;
  const resolvedCount = reports.filter((r) => r.status === 'resolved').length;

  return (
    <div className="flex flex-col h-full bg-canvas text-bordeaux overflow-hidden w-full">
      {/* Header */}
      <div className="p-4 sm:p-5 border-b border-border bg-white shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-editorial text-xl font-bold text-bordeaux">Community Reports</h2>
            <p className="text-xs text-text-secondary mt-0.5">
              Verified road observations, infrastructure notices, and commuter alerts.
            </p>
          </div>
          <button
            type="button"
            onClick={onOpenReportModal}
            className="btn-bordeaux py-2 px-3.5 text-xs font-semibold flex items-center gap-1.5 shadow-sm"
          >
            <Plus className="w-3.5 h-3.5 text-champagne" />
            <span>Submit Report</span>
          </button>
        </div>

        {/* Local Storage Honesty Notice */}
        <div className="mt-3 p-2.5 rounded-xl bg-surface-raised border border-border text-[11px] text-text-secondary flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <HardDrive className="w-3.5 h-3.5 text-champagne-dark shrink-0" />
            <span>Saved on this device only (Demo LocalStorage Mode)</span>
          </div>
          <span className="text-[10px] font-semibold text-text-muted">Not remote synced</span>
        </div>

        {/* Status Toggle: Active, Resolved, All */}
        <div className="mt-3 flex rounded-xl bg-canvas p-1 border border-border text-xs font-semibold" role="tablist">
          <button
            type="button"
            onClick={() => setFilterStatus('active')}
            className={`flex-1 py-1.5 rounded-lg transition-all focus-ring-bordeaux ${
              filterStatus === 'active'
                ? 'bg-bordeaux text-white font-bold shadow-sm'
                : 'text-text-secondary hover:text-bordeaux'
            }`}
            role="tab"
            aria-selected={filterStatus === 'active'}
          >
            Active ({activeCount})
          </button>
          <button
            type="button"
            onClick={() => setFilterStatus('resolved')}
            className={`flex-1 py-1.5 rounded-lg transition-all focus-ring-bordeaux ${
              filterStatus === 'resolved'
                ? 'bg-bordeaux text-white font-bold shadow-sm'
                : 'text-text-secondary hover:text-bordeaux'
            }`}
            role="tab"
            aria-selected={filterStatus === 'resolved'}
          >
            Resolved ({resolvedCount})
          </button>
          <button
            type="button"
            onClick={() => setFilterStatus('all')}
            className={`flex-1 py-1.5 rounded-lg transition-all focus-ring-bordeaux ${
              filterStatus === 'all'
                ? 'bg-bordeaux text-white font-bold shadow-sm'
                : 'text-text-secondary hover:text-bordeaux'
            }`}
            role="tab"
            aria-selected={filterStatus === 'all'}
          >
            All ({reports.length})
          </button>
        </div>

        {/* Single-select category filter row */}
        <div className="mt-2.5 flex gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
          {[
            { id: 'all', label: 'All Concerns' },
            { id: 'streetlight_issue', label: 'Streetlights' },
            { id: 'harassment', label: 'Harassment' },
            { id: 'broken_footpath', label: 'Footpaths' },
            { id: 'transport_disruption', label: 'Transit' },
          ].map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setFilterCategory(cat.id)}
              className={`px-3 py-1 rounded-full whitespace-nowrap text-xs font-medium transition-all focus-ring-bordeaux ${
                filterCategory === cat.id
                  ? 'bg-bordeaux text-white font-semibold shadow-sm'
                  : 'bg-white text-text-secondary hover:text-bordeaux border border-border'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Reports Feed */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3 pb-24 lg:pb-6">
        {filtered.length === 0 ? (
          <div className="surface-card p-6 text-center text-text-secondary space-y-1 border border-border">
            <AlertTriangle className="w-8 h-8 text-border-strong mx-auto" />
            <h4 className="font-semibold text-bordeaux text-sm font-editorial">No Reports in this View</h4>
            <p className="text-xs">
              No community disturbance reports match the selected filters.
            </p>
          </div>
        ) : (
          filtered.map((report) => {
            const isResolved = report.status === 'resolved';

            return (
              <article
                key={report.id}
                className={`surface-card p-4 space-y-2.5 transition-all card-interactive shadow-e1 border border-border hover:border-champagne ${
                  isResolved ? 'opacity-75 bg-canvas/60' : ''
                }`}
              >
                {/* Header: Category, Status, Source */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <DisturbanceCategoryLabel category={report.category} />
                    {isResolved ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-verified-tint text-verified border border-verified/30">
                        <Check className="w-3 h-3 text-verified" />
                        <span>Resolved</span>
                      </span>
                    ) : report.upvotes >= 2 ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-verified-tint text-verified border border-verified/30">
                        <CheckCircle className="w-3 h-3 text-verified" />
                        <span>Confirmed</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-canvas text-text-secondary border border-border">
                        <span>Unverified</span>
                      </span>
                    )}
                  </div>
                  <DataSourceBadge source={report.source} />
                </div>

                {/* Location & Description */}
                <div>
                  <h4 className="font-editorial font-bold text-base text-bordeaux">{report.locationName}</h4>
                  <p className="text-xs text-text-secondary mt-1 leading-relaxed">
                    {report.description}
                  </p>
                </div>

                {/* Vertical timeline evidence */}
                <div className="pt-2 border-t border-border flex items-center justify-between text-xs text-text-secondary">
                  <span className="flex items-center gap-1.5 text-[11px]">
                    <Clock className="w-3.5 h-3.5 text-champagne" />
                    <span>Reported {formatRelativeTime(report.createdAt)}</span>
                    {isResolved && report.resolvedAt && (
                      <span className="text-verified font-medium ml-1">
                        · Resolved {formatRelativeTime(report.resolvedAt)}
                      </span>
                    )}
                  </span>

                  {/* Confirmation Actions: Still an issue & Flag */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onUpvoteReport(report.id)}
                      className="btn-secondary py-1.5 px-3 text-xs flex items-center gap-1.5 font-medium shadow-sm"
                      title="Corroborate this condition"
                    >
                      <ThumbsUp className="w-3 h-3 text-rose-gold" />
                      <span>Still an issue ({report.upvotes})</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onFlagReport(report.id)}
                      className="p-1.5 rounded-lg text-text-muted hover:text-danger hover:bg-danger-tint transition-colors"
                      title="Flag inaccurate report"
                      aria-label="Flag report"
                    >
                      <Flag className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </article>
            );
          })
        )}
      </div>
    </div>
  );
};
