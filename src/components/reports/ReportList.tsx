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
} from 'lucide-react';

interface ReportListProps {
  reports: CommunityReport[];
  onUpvoteReport: (id: string) => void;
  onFlagReport: (id: string) => void;
  onResolveReport: (id: string) => void;
  onOpenReportModal: () => void;
}

export const ReportList: React.FC<ReportListProps> = ({
  reports,
  onUpvoteReport,
  onFlagReport,
  onResolveReport,
  onOpenReportModal,
}) => {
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('active');

  const filtered = reports.filter((rep) => {
    if (filterStatus === 'active' && rep.status === 'resolved') return false;
    if (filterStatus === 'resolved' && rep.status !== 'resolved') return false;
    if (filterCategory !== 'all' && rep.category !== filterCategory) return false;
    return true;
  });

  return (
    <div className="flex flex-col h-full bg-brand-bg text-brand-text overflow-hidden w-full">
      {/* Header */}
      <div className="p-3.5 sm:p-5 border-b border-brand-border/70 glass-pearl flex items-center justify-between">
        <div>
          <h2 className="text-base sm:text-lg font-black text-brand-text flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-200 shadow-xs ring-1 ring-champagne-300/60">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
            </div>
            <span>Community Reports</span>
          </h2>
          <p className="text-[11px] sm:text-xs text-brand-text-secondary mt-1 font-medium leading-relaxed">
            Real commuter observations and infrastructure notes
          </p>
        </div>
        <button
          onClick={onOpenReportModal}
          className="flex items-center gap-1.5 py-2 px-3.5 rounded-full bg-gradient-to-r from-teal-500 to-teal-700 hover:from-teal-600 hover:to-teal-800 text-white font-bold text-xs uppercase tracking-wider shadow-xs transition-all active:scale-95"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Report</span>
        </button>
      </div>

      {/* Filters Bar */}
      <div className="p-3 sm:p-3.5 bg-white/70 backdrop-blur-md border-b border-brand-border/70 space-y-2.5 shadow-xs">
        {/* Status Toggle (Active vs Resolved) */}
        <div className="flex rounded-full bg-white/80 p-1 border border-brand-border/90 text-xs shadow-inner-glass">
          <button
            onClick={() => setFilterStatus('active')}
            className={`flex-1 py-1.5 rounded-full font-bold transition-all ${
              filterStatus === 'active'
                ? 'bg-teal-500 text-white shadow-xs font-bold'
                : 'text-brand-text-secondary hover:text-brand-text'
            }`}
          >
            Active ({reports.filter((r) => r.status !== 'resolved').length})
          </button>
          <button
            onClick={() => setFilterStatus('resolved')}
            className={`flex-1 py-1.5 rounded-full font-bold transition-all ${
              filterStatus === 'resolved'
                ? 'bg-teal-500 text-white shadow-xs font-bold'
                : 'text-brand-text-secondary hover:text-brand-text'
            }`}
          >
            Resolved ({reports.filter((r) => r.status === 'resolved').length})
          </button>
          <button
            onClick={() => setFilterStatus('all')}
            className={`flex-1 py-1.5 rounded-full font-bold transition-all ${
              filterStatus === 'all'
                ? 'bg-teal-500 text-white shadow-xs font-bold'
                : 'text-brand-text-secondary hover:text-brand-text'
            }`}
          >
            All
          </button>
        </div>

        {/* Category Pills */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
          <button
            onClick={() => setFilterCategory('all')}
            className={`px-3 py-1 rounded-full whitespace-nowrap transition-all font-semibold ${
              filterCategory === 'all'
                ? 'bg-brand-text text-white shadow-xs'
                : 'bg-white/80 text-brand-text-secondary hover:text-brand-text border border-brand-border'
            }`}
          >
            All Categories
          </button>
          <button
            onClick={() => setFilterCategory('streetlight_issue')}
            className={`px-3 py-1 rounded-full whitespace-nowrap transition-all font-semibold ${
              filterCategory === 'streetlight_issue'
                ? 'bg-amber-500 text-white shadow-xs'
                : 'bg-white/80 text-brand-text-secondary hover:text-brand-text border border-brand-border'
            }`}
          >
            💡 Streetlights
          </button>
          <button
            onClick={() => setFilterCategory('harassment')}
            className={`px-3 py-1 rounded-full whitespace-nowrap transition-all font-semibold ${
              filterCategory === 'harassment'
                ? 'bg-danger-500 text-white shadow-xs'
                : 'bg-white/80 text-brand-text-secondary hover:text-brand-text border border-brand-border'
            }`}
          >
            ⚠️ Harassment
          </button>
          <button
            onClick={() => setFilterCategory('broken_footpath')}
            className={`px-3 py-1 rounded-full whitespace-nowrap transition-all font-semibold ${
              filterCategory === 'broken_footpath'
                ? 'bg-stone-600 text-white shadow-xs'
                : 'bg-white/80 text-brand-text-secondary hover:text-brand-text border border-brand-border'
            }`}
          >
            🚧 Footpaths
          </button>
          <button
            onClick={() => setFilterCategory('transport_disruption')}
            className={`px-3 py-1 rounded-full whitespace-nowrap transition-all font-semibold ${
              filterCategory === 'transport_disruption'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white/80 text-brand-text-secondary hover:text-brand-text border border-brand-border'
            }`}
          >
            🚌 Transit
          </button>
        </div>
      </div>

      {/* Reports Scrollable List */}
      <div className="flex-1 overflow-y-auto p-3.5 sm:p-4 space-y-3 pb-24 lg:pb-6">
        {filtered.length > 0 ? (
          filtered.map((report) => (
            <div
              key={report.id}
              className={`p-4 rounded-royal border transition-all space-y-2.5 ${
                report.status === 'resolved'
                  ? 'bg-white/60 border-brand-border/60 opacity-75 shadow-xs'
                  : 'surface-pearl border-brand-border/80 hover:border-teal-200 shadow-card'
              }`}
            >
              {/* Category & Status */}
              <div className="flex items-center justify-between gap-2">
                <DisturbanceCategoryLabel category={report.category} />
                <div className="flex items-center gap-1.5">
                  <DataSourceBadge source={report.source} />
                  {report.status === 'resolved' && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] bg-teal-50 text-teal-700 border border-teal-200 font-bold">
                      Resolved
                    </span>
                  )}
                </div>
              </div>

              {/* Title & Description */}
              <div>
                <h4 className="font-bold text-sm text-brand-text">{report.locationName}</h4>
                <p className="text-xs text-brand-text-secondary mt-1 leading-relaxed font-medium">
                  {report.description}
                </p>
              </div>

              {/* Footer with upvote, flag, resolve */}
              <div className="flex items-center justify-between pt-2.5 border-t border-brand-border/70 text-xs text-brand-text-secondary">
                <span className="flex items-center gap-1.5 text-[11px] font-medium text-brand-text-muted">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{formatRelativeTime(report.createdAt)}</span>
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onUpvoteReport(report.id)}
                    className="flex items-center gap-1.5 py-1 px-3 rounded-full bg-white/80 hover:bg-teal-50 border border-brand-border text-xs font-bold text-brand-text hover:text-teal-700 transition-colors shadow-xs active:scale-95"
                    title="Corroborate this report"
                  >
                    <ThumbsUp className="w-3.5 h-3.5 text-teal-600" />
                    <span>{report.upvotes}</span>
                  </button>

                  {report.status !== 'resolved' && (
                    <button
                      onClick={() => onResolveReport(report.id)}
                      className="flex items-center gap-1 py-1 px-3 rounded-full bg-teal-50 hover:bg-teal-100 text-teal-700 border border-teal-200/80 text-xs font-bold transition-colors shadow-xs active:scale-95"
                      title="Mark condition resolved"
                    >
                      <CheckCircle className="w-3.5 h-3.5 text-teal-600" />
                      <span>Resolve</span>
                    </button>
                  )}

                  <button
                    onClick={() => onFlagReport(report.id)}
                    className="p-1.5 rounded-full text-brand-text-muted hover:text-danger-600 hover:bg-danger-50 transition-colors"
                    title="Flag as inaccurate or inappropriate"
                  >
                    <Flag className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="h-44 flex flex-col items-center justify-center text-center p-6 text-brand-text-secondary border border-dashed border-brand-border/80 rounded-royal bg-white/50">
            <AlertTriangle className="w-8 h-8 text-brand-text-muted mb-2 stroke-1" />
            <h4 className="font-bold text-brand-text text-sm">No Reports Match Filter</h4>
            <p className="text-xs text-brand-text-secondary mt-1">
              There are no active observations in this category.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
