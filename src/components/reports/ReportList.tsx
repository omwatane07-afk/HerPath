'use client';

import React, { useState } from 'react';
import { CommunityReport } from '@/types';
import { DisturbanceCategoryLabel, DataSourceBadge } from '../ui/Badge';
import { formatRelativeTime } from '@/lib/utils';
import {
  ThumbsUp,
  Flag,
  Plus,
  AlertTriangle,
  Clock,
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
    <div className="flex flex-col h-full bg-card text-ink overflow-hidden w-full font-sans">
      {/* Header */}
      <div className="p-4 sm:p-5 border-b border-border bg-card">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-editorial text-xl sm:text-2xl font-bold text-ink">Community Reports</h2>
            <p className="text-xs text-text-secondary mt-0.5">
              Verified road observations, infrastructure notices, and commuter alerts.
            </p>
          </div>
          <button
            type="button"
            onClick={onOpenReportModal}
            className="btn-primary py-2 px-3.5 text-xs font-semibold flex items-center gap-1.5 shadow-sm"
          >
            <Plus className="w-3.5 h-3.5 text-white" />
            <span>Submit Report</span>
          </button>
        </div>

        {/* Local Storage Honesty Notice */}
        <div className="mt-3 p-2.5 rounded-xl bg-canvas border border-border text-[11px] text-text-secondary flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <HardDrive className="w-3.5 h-3.5 text-primary shrink-0" />
            <span>Saved on this device only (Demo LocalStorage Mode)</span>
          </div>
          <span className="text-[10px] font-semibold text-text-muted">Not remote synced</span>
        </div>

        {/* Status Toggle: Active, Resolved, All */}
        <div className="mt-3 flex rounded-xl bg-canvas p-1 border border-border text-xs font-semibold" role="tablist">
          <button
            type="button"
            onClick={() => setFilterStatus('active')}
            className={`flex-1 py-1.5 rounded-lg transition-all focus-ring-primary ${
              filterStatus === 'active'
                ? 'bg-primary text-white font-bold shadow-sm'
                : 'text-text-secondary hover:text-ink'
            }`}
            role="tab"
            aria-selected={filterStatus === 'active'}
          >
            Active ({activeCount})
          </button>
          <button
            type="button"
            onClick={() => setFilterStatus('resolved')}
            className={`flex-1 py-1.5 rounded-lg transition-all focus-ring-primary ${
              filterStatus === 'resolved'
                ? 'bg-primary text-white font-bold shadow-sm'
                : 'text-text-secondary hover:text-ink'
            }`}
            role="tab"
            aria-selected={filterStatus === 'resolved'}
          >
            Resolved ({resolvedCount})
          </button>
          <button
            type="button"
            onClick={() => setFilterStatus('all')}
            className={`flex-1 py-1.5 rounded-lg transition-all focus-ring-primary ${
              filterStatus === 'all'
                ? 'bg-primary text-white font-bold shadow-sm'
                : 'text-text-secondary hover:text-ink'
            }`}
            role="tab"
            aria-selected={filterStatus === 'all'}
          >
            All ({reports.length})
          </button>
        </div>
      </div>

      {/* Reports Feed */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3">
        <div className="flex items-center justify-between text-xs text-text-muted px-0.5">
          <span className="font-semibold uppercase tracking-wider text-[11px] text-text-secondary font-editorial">
            {filtered.length} Reports
          </span>
          <span className="text-[11px]">Filtered by status & proximity</span>
        </div>

        {filtered.length === 0 ? (
          <div className="surface-card p-8 text-center text-text-secondary space-y-2 border border-border">
            <AlertTriangle className="w-8 h-8 text-border-control mx-auto" />
            <p className="text-sm font-semibold text-ink font-editorial">No reports in this view</p>
            <p className="text-xs">
              No community reports match your selected status and category filter.
            </p>
          </div>
        ) : (
          filtered.map((rep) => {
            const isStale = Date.now() - new Date(rep.createdAt).getTime() > 24 * 60 * 60 * 1000;

            return (
              <article
                key={rep.id}
                className={`surface-card p-4 space-y-2.5 transition-all card-interactive shadow-e1 border border-border hover:border-primary ${
                  isStale ? 'opacity-70' : ''
                }`}
              >
                {/* Header: Title, Category Badge, Provenance */}
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <DisturbanceCategoryLabel category={rep.category} />
                      {rep.status === 'verified' && (
                        <span className="text-[10px] bg-verified-tint text-verified font-bold px-1.5 py-0.5 rounded border border-verified/30">
                          Corroborated
                        </span>
                      )}
                      {rep.status === 'resolved' && (
                        <span className="text-[10px] bg-canvas text-text-muted font-bold px-1.5 py-0.5 rounded border border-border">
                          Resolved
                        </span>
                      )}
                    </div>
                    <h3 className="font-editorial text-base font-bold text-ink leading-snug">
                      {rep.locationName}
                    </h3>
                    <p className="text-xs text-text-secondary mt-0.5 capitalize">{rep.category.replace(/_/g, ' ')}</p>
                  </div>

                  <DataSourceBadge source={rep.source} />
                </div>

                {/* Body Description */}
                <p className="text-xs text-text-secondary leading-relaxed">{rep.description}</p>

                {/* Metadata & Actions */}
                <div className="pt-2 border-t border-border flex items-center justify-between text-xs text-text-secondary">
                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1 text-[11px] text-text-muted">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{formatRelativeTime(rep.createdAt)}</span>
                    </span>
                    {isStale && (
                      <span className="text-[10px] bg-canvas text-text-muted px-1.5 py-0.5 rounded border border-border">
                        Stale (&gt;24h)
                      </span>
                    )}
                  </div>

                  {rep.status !== 'resolved' && (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => onUpvoteReport(rep.id)}
                        className="py-1 px-2.5 rounded-lg text-xs font-medium border border-border hover:border-primary hover:text-primary transition-colors flex items-center gap-1.5"
                        title="Corroborate this observation"
                      >
                        <ThumbsUp className="w-3 h-3 text-primary" />
                        <span className="tabular-nums">Confirm ({rep.upvotes})</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => onFlagReport(rep.id)}
                        className="p-1.5 rounded-lg text-text-muted hover:text-error hover:bg-canvas transition-colors"
                        title="Flag inaccurate report"
                        aria-label="Flag report"
                      >
                        <Flag className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </article>
            );
          })
        )}
      </div>
    </div>
  );
};
