'use client';

import React, { useState } from 'react';
import { CommunityReport, DisturbanceCategory } from '@/types';
import { DisturbanceCategoryLabel, DataSourceBadge } from '../ui/Badge';
import { formatRelativeTime } from '@/lib/utils';
import {
  ThumbsUp,
  Flag,
  CheckCircle,
  Filter,
  Plus,
  AlertTriangle,
  Clock,
  Sparkles,
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
    <div className="flex flex-col h-full bg-navy-900 border-r border-slate-800 text-slate-100 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span>Community Reports</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Real commuter observations and infrastructure notes
          </p>
        </div>
        <button
          onClick={onOpenReportModal}
          className="flex items-center gap-1.5 py-1.5 px-3 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs uppercase tracking-wider shadow-md transition-all active:scale-95"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Report</span>
        </button>
      </div>

      {/* Filters Bar */}
      <div className="p-3 bg-navy-950/70 border-b border-slate-800 space-y-2">
        {/* Status Toggle (Active vs Resolved) */}
        <div className="flex rounded-lg bg-navy-900 p-0.5 border border-slate-800 text-xs">
          <button
            onClick={() => setFilterStatus('active')}
            className={`flex-1 py-1 rounded-md font-semibold transition-colors ${
              filterStatus === 'active'
                ? 'bg-teal-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Active Issues ({reports.filter((r) => r.status !== 'resolved').length})
          </button>
          <button
            onClick={() => setFilterStatus('resolved')}
            className={`flex-1 py-1 rounded-md font-semibold transition-colors ${
              filterStatus === 'resolved'
                ? 'bg-teal-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Resolved ({reports.filter((r) => r.status === 'resolved').length})
          </button>
          <button
            onClick={() => setFilterStatus('all')}
            className={`flex-1 py-1 rounded-md font-semibold transition-colors ${
              filterStatus === 'all'
                ? 'bg-teal-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All
          </button>
        </div>

        {/* Category Pills */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none text-[11px]">
          <button
            onClick={() => setFilterCategory('all')}
            className={`px-2.5 py-1 rounded-full whitespace-nowrap transition-colors ${
              filterCategory === 'all'
                ? 'bg-slate-700 text-white font-semibold'
                : 'bg-navy-900 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            All Categories
          </button>
          <button
            onClick={() => setFilterCategory('streetlight_issue')}
            className={`px-2.5 py-1 rounded-full whitespace-nowrap transition-colors ${
              filterCategory === 'streetlight_issue'
                ? 'bg-amber-600 text-white font-semibold'
                : 'bg-navy-900 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            💡 Streetlights
          </button>
          <button
            onClick={() => setFilterCategory('harassment')}
            className={`px-2.5 py-1 rounded-full whitespace-nowrap transition-colors ${
              filterCategory === 'harassment'
                ? 'bg-rose-600 text-white font-semibold'
                : 'bg-navy-900 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            ⚠️ Harassment
          </button>
          <button
            onClick={() => setFilterCategory('broken_footpath')}
            className={`px-2.5 py-1 rounded-full whitespace-nowrap transition-colors ${
              filterCategory === 'broken_footpath'
                ? 'bg-stone-600 text-white font-semibold'
                : 'bg-navy-900 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            🚧 Footpaths
          </button>
          <button
            onClick={() => setFilterCategory('transport_disruption')}
            className={`px-2.5 py-1 rounded-full whitespace-nowrap transition-colors ${
              filterCategory === 'transport_disruption'
                ? 'bg-blue-600 text-white font-semibold'
                : 'bg-navy-900 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            🚌 Transit
          </button>
        </div>
      </div>

      {/* Reports Scrollable List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {filtered.length > 0 ? (
          filtered.map((report) => (
            <div
              key={report.id}
              className={`p-3.5 rounded-2xl border transition-all space-y-2.5 ${
                report.status === 'resolved'
                  ? 'bg-navy-950/40 border-slate-800/60 opacity-75'
                  : 'bg-navy-950/80 border-slate-800 hover:border-slate-700'
              }`}
            >
              {/* Category & Status */}
              <div className="flex items-center justify-between gap-2">
                <DisturbanceCategoryLabel category={report.category} />
                <div className="flex items-center gap-1.5">
                  <DataSourceBadge source={report.source} />
                  {report.status === 'resolved' && (
                    <span className="px-1.5 py-0.5 rounded text-[10px] bg-teal-950 text-teal-400 border border-teal-800 font-medium">
                      Resolved
                    </span>
                  )}
                </div>
              </div>

              {/* Title & Description */}
              <div>
                <h4 className="font-semibold text-sm text-slate-100">{report.locationName}</h4>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">{report.description}</p>
              </div>

              {/* Footer with upvote, flag, resolve */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-xs text-slate-400">
                <span className="flex items-center gap-1 text-[11px]">
                  <Clock className="w-3 h-3 text-slate-500" />
                  <span>{formatRelativeTime(report.createdAt)}</span>
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onUpvoteReport(report.id)}
                    className="flex items-center gap-1 py-1 px-2.5 rounded-lg bg-navy-850 hover:bg-navy-800 border border-slate-700/80 text-xs font-semibold text-slate-200 hover:text-teal-400 transition-colors"
                    title="Corroborate this report"
                  >
                    <ThumbsUp className="w-3 h-3" />
                    <span>{report.upvotes}</span>
                  </button>

                  {report.status !== 'resolved' && (
                    <button
                      onClick={() => onResolveReport(report.id)}
                      className="py-1 px-2 rounded-lg bg-teal-950/60 hover:bg-teal-900 border border-teal-800/60 text-xs text-teal-300 font-medium transition-colors"
                      title="Mark as resolved / cleared"
                    >
                      Clear
                    </button>
                  )}

                  <button
                    onClick={() => onFlagReport(report.id)}
                    className="p-1 rounded-lg hover:bg-navy-800 text-slate-500 hover:text-rose-400 transition-colors"
                    title="Flag as inaccurate or abusive"
                  >
                    <Flag className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="h-48 flex flex-col items-center justify-center text-center p-6 text-slate-400 border border-dashed border-slate-800 rounded-2xl">
            <CheckCircle className="w-8 h-8 text-teal-500 mb-2 stroke-1" />
            <h4 className="font-semibold text-slate-300 text-sm">No Matching Reports</h4>
            <p className="text-xs text-slate-400 mt-1">
              No reports found for the selected category or status filter.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
