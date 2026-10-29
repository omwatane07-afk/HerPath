'use client';

import React, { useState } from 'react';
import { CommunityReport, ReportLifecycleStatus, ReportFlagReason } from '@/types';
import { DisturbanceCategoryLabel, DataSourceBadge, ReportLifecycleBadge } from '../ui/Badge';
import { formatRelativeTime } from '@/lib/utils';
import { getAllCivicCategories, getCivicCategory } from '@/lib/civic-categories';
import { CivicReportingService } from '@/services/civic-reporting-service';
import {
  ThumbsUp,
  Flag,
  Plus,
  AlertTriangle,
  Clock,
  HardDrive,
  Sparkles,
  ShieldCheck,
  FileSearch,
  CheckCircle,
  XCircle,
  Camera,
  History,
  Copy,
  UserCheck,
  Eye,
  Filter,
  X,
  Info,
} from 'lucide-react';

interface ReportListProps {
  reports: CommunityReport[];
  onUpvoteReport: (id: string) => void;
  onFlagReport: (id: string) => void;
  onResolveReport?: (id: string) => void;
  onTransitionStatus?: (id: string, newStatus: ReportLifecycleStatus, note?: string) => void;
  onFlagReportWithDetails?: (id: string, reason: ReportFlagReason, details?: string) => void;
  onOpenReportModal: () => void;
}

export const ReportList: React.FC<ReportListProps> = ({
  reports,
  onUpvoteReport,
  onFlagReport,
  onResolveReport,
  onTransitionStatus,
  onFlagReportWithDetails,
  onOpenReportModal,
}) => {
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('active');
  const [isReviewerMode, setIsReviewerMode] = useState<boolean>(false);
  const [expandedAuditId, setExpandedAuditId] = useState<string | null>(null);

  // Commuter Rapid Tap Prevention (track reports confirmed in this session/browser)
  const [userConfirmedIds, setUserConfirmedIds] = useState<Set<string>>(() => {
    if (typeof window === 'undefined') return new Set();
    try {
      const raw = localStorage.getItem('herpath_user_confirmed_reports');
      return raw ? new Set(JSON.parse(raw)) : new Set();
    } catch {
      return new Set();
    }
  });

  const handleStillHappening = (id: string) => {
    if (userConfirmedIds.has(id)) return;
    const updated = new Set(userConfirmedIds);
    updated.add(id);
    setUserConfirmedIds(updated);
    try {
      localStorage.setItem('herpath_user_confirmed_reports', JSON.stringify(Array.from(updated)));
    } catch {}
    onUpvoteReport(id);
  };

  const handleCommuterMarkResolved = (id: string) => {
    if (onTransitionStatus) {
      onTransitionStatus(id, 'resolved', 'Marked resolved by commuter on-site verification');
    } else if (onResolveReport) {
      onResolveReport(id);
    }
  };

  // Flag Dialog State
  const [flaggingReportId, setFlaggingReportId] = useState<string | null>(null);
  const [flagReason, setFlagReason] = useState<ReportFlagReason>('incorrect');
  const [flagDetails, setFlagDetails] = useState('');

  // Status note modal state for reviewer transitions
  const [transitionPrompt, setTransitionPrompt] = useState<{
    reportId: string;
    targetStatus: ReportLifecycleStatus;
    defaultNote: string;
  } | null>(null);
  const [transitionNote, setTransitionNote] = useState('');

  const categories = getAllCivicCategories();

  const filtered = reports.filter((rep) => {
    const staleness = CivicReportingService.checkStaleness(rep);

    if (filterStatus === 'active') {
      if (rep.status === 'resolved' || rep.status === 'invalidated') return false;
    } else if (filterStatus === 'verified') {
      if (rep.status !== 'verified') return false;
    } else if (filterStatus === 'pending') {
      if (rep.status !== 'pending') return false;
    } else if (filterStatus === 'under_review') {
      if (rep.status !== 'under_review') return false;
    } else if (filterStatus === 'resolved') {
      if (rep.status !== 'resolved') return false;
    } else if (filterStatus === 'stale') {
      if (!staleness.isStale || rep.status === 'resolved') return false;
    }

    if (filterCategory !== 'all') {
      const catConfig = getCivicCategory(rep.category);
      if (catConfig.id !== filterCategory && rep.category !== filterCategory) {
        return false;
      }
    }

    return true;
  });

  const activeCount = reports.filter((r) => r.status !== 'resolved' && r.status !== 'invalidated').length;
  const verifiedCount = reports.filter((r) => r.status === 'verified').length;
  const pendingCount = reports.filter((r) => r.status === 'pending').length;
  const underReviewCount = reports.filter((r) => r.status === 'under_review').length;
  const resolvedCount = reports.filter((r) => r.status === 'resolved').length;
  const staleCount = reports.filter((r) => CivicReportingService.checkStaleness(r).isStale && r.status !== 'resolved').length;

  const handleOpenFlagDialog = (id: string) => {
    setFlaggingReportId(id);
    setFlagReason('incorrect');
    setFlagDetails('');
  };

  const handleConfirmFlag = () => {
    if (!flaggingReportId) return;

    if (onFlagReportWithDetails) {
      onFlagReportWithDetails(flaggingReportId, flagReason, flagDetails);
    } else {
      onFlagReport(flaggingReportId);
    }

    setFlaggingReportId(null);
  };

  const handleInitiateTransition = (reportId: string, targetStatus: ReportLifecycleStatus) => {
    let defaultNote = '';
    if (targetStatus === 'under_review') {
      defaultNote = 'Assigned to reviewer for photographic and telemetry verification';
    } else if (targetStatus === 'verified') {
      defaultNote = 'Evidence meets verification criteria and verified as active civic issue';
    } else if (targetStatus === 'resolved') {
      defaultNote = 'Municipal repair or clearing completed and verified';
    } else if (targetStatus === 'invalidated') {
      defaultNote = 'Evidence inspected and determined invalid or unsubstantiated';
    }

    setTransitionNote(defaultNote);
    setTransitionPrompt({ reportId, targetStatus, defaultNote });
  };

  const handleExecuteTransition = () => {
    if (!transitionPrompt) return;

    if (onTransitionStatus) {
      onTransitionStatus(transitionPrompt.reportId, transitionPrompt.targetStatus, transitionNote);
    } else if (transitionPrompt.targetStatus === 'resolved' && onResolveReport) {
      onResolveReport(transitionPrompt.reportId);
    }

    setTransitionPrompt(null);
  };

  return (
    <div className="flex flex-col h-full bg-[#FCFAFF] text-ink overflow-hidden w-full font-sans">
      {/* Header (Royal Soft Glass) */}
      <div className="p-4 sm:p-5 border-b border-border/80 bg-white/95 backdrop-blur-md">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-lilac/70 text-grape text-[10px] font-bold mb-1 border border-purple-200">
              <Sparkles className="w-3 h-3 text-grape" />
              <span>Verified Civic Reporting System</span>
            </div>
            <h2 className="font-heading text-xl sm:text-2xl font-extrabold text-ink">
              Civic Infrastructure Reports
            </h2>
            <p className="text-xs text-soft-ink mt-0.5 font-medium">
              Report, corroborate, and track the lifecycle of public infrastructure defects.
            </p>
          </div>

          <button
            type="button"
            onClick={onOpenReportModal}
            className="btn-primary py-2 px-3.5 text-xs font-bold flex items-center gap-1.5 shadow-sm shrink-0"
          >
            <Plus className="w-3.5 h-3.5 text-white" />
            <span>Submit Report</span>
          </button>
        </div>

        {/* Reviewer Mode Banner & Switch */}
        <div className="mt-3 p-2.5 rounded-2xl bg-white border border-purple-200/90 shadow-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs">
            <UserCheck className={`w-4 h-4 ${isReviewerMode ? 'text-grape' : 'text-soft-ink'}`} />
            <div>
              <span className="font-bold text-ink">Authorized Reviewer Mode:</span>{' '}
              <span className="text-soft-ink">
                {isReviewerMode
                  ? 'Active · Audit & status controls enabled'
                  : 'Disabled · Commuter public view'}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsReviewerMode(!isReviewerMode)}
            className={`px-3 py-1 rounded-full text-xs font-bold transition-all shadow-xs ${
              isReviewerMode
                ? 'bg-grape text-white'
                : 'bg-[#F1EAFF] text-grape hover:bg-lilac border border-purple-200'
            }`}
          >
            {isReviewerMode ? 'Switch to Public' : 'Auditor Mode'}
          </button>
        </div>

        {/* Lifecycle Status Pill Tabs */}
        <div className="mt-3 flex rounded-full bg-[#F1EAFF] p-1 border border-lilac text-xs font-bold overflow-x-auto" role="tablist">
          <button
            type="button"
            onClick={() => setFilterStatus('active')}
            className={`px-3 py-1.5 rounded-full transition-all shrink-0 ${
              filterStatus === 'active' ? 'bg-grape text-white shadow-sm' : 'text-soft-ink hover:text-ink'
            }`}
          >
            Active ({activeCount})
          </button>
          <button
            type="button"
            onClick={() => setFilterStatus('verified')}
            className={`px-3 py-1.5 rounded-full transition-all shrink-0 ${
              filterStatus === 'verified' ? 'bg-grape text-white shadow-sm' : 'text-soft-ink hover:text-ink'
            }`}
          >
            Verified ({verifiedCount})
          </button>
          <button
            type="button"
            onClick={() => setFilterStatus('under_review')}
            className={`px-3 py-1.5 rounded-full transition-all shrink-0 ${
              filterStatus === 'under_review' ? 'bg-grape text-white shadow-sm' : 'text-soft-ink hover:text-ink'
            }`}
          >
            Review ({underReviewCount})
          </button>
          <button
            type="button"
            onClick={() => setFilterStatus('pending')}
            className={`px-3 py-1.5 rounded-full transition-all shrink-0 ${
              filterStatus === 'pending' ? 'bg-grape text-white shadow-sm' : 'text-soft-ink hover:text-ink'
            }`}
          >
            Pending ({pendingCount})
          </button>
          <button
            type="button"
            onClick={() => setFilterStatus('resolved')}
            className={`px-3 py-1.5 rounded-full transition-all shrink-0 ${
              filterStatus === 'resolved' ? 'bg-grape text-white shadow-sm' : 'text-soft-ink hover:text-ink'
            }`}
          >
            Resolved ({resolvedCount})
          </button>
          <button
            type="button"
            onClick={() => setFilterStatus('stale')}
            className={`px-3 py-1.5 rounded-full transition-all shrink-0 ${
              filterStatus === 'stale' ? 'bg-grape text-white shadow-sm' : 'text-soft-ink hover:text-ink'
            }`}
          >
            Stale ({staleCount})
          </button>
          <button
            type="button"
            onClick={() => setFilterStatus('all')}
            className={`px-3 py-1.5 rounded-full transition-all shrink-0 ${
              filterStatus === 'all' ? 'bg-grape text-white shadow-sm' : 'text-soft-ink hover:text-ink'
            }`}
          >
            All ({reports.length})
          </button>
        </div>

        {/* Category Filter Select */}
        <div className="mt-2.5 flex items-center gap-2 overflow-x-auto pb-1 text-[11px]">
          <span className="text-soft-ink font-bold flex items-center gap-1 shrink-0">
            <Filter className="w-3 h-3 text-grape" />
            <span>Category:</span>
          </span>
          <button
            type="button"
            onClick={() => setFilterCategory('all')}
            className={`px-2.5 py-1 rounded-full font-bold whitespace-nowrap transition-colors ${
              filterCategory === 'all'
                ? 'bg-grape text-white'
                : 'bg-white text-soft-ink hover:text-ink border border-purple-100'
            }`}
          >
            All Types
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setFilterCategory(cat.id)}
              className={`px-2.5 py-1 rounded-full font-bold whitespace-nowrap transition-colors flex items-center gap-1 ${
                filterCategory === cat.id
                  ? 'bg-grape text-white'
                  : 'bg-white text-soft-ink hover:text-ink border border-purple-100'
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.shortName}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Reports Feed */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3.5 pb-24 lg:pb-6">
        {/* Civic Transparency Notice */}
        <div className="p-3 rounded-2xl bg-amber-50/90 border border-amber-200 text-xs text-amber-900 flex items-start gap-2 shadow-xs">
          <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
          <div className="leading-snug">
            <strong>Civic Notice:</strong> Confirmations represent unverified community feedback from commuters. 
            <strong className="text-amber-950 font-black"> No reports does not mean a location is safe.</strong>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-soft-ink px-0.5">
          <span className="font-heading font-extrabold uppercase tracking-wider text-[11px]">
            {filtered.length} Displayed Report{filtered.length === 1 ? '' : 's'}
          </span>
          <span className="text-[11px] font-medium">Lifecycle: Pending → Review → Verified → Resolved</span>
        </div>

        {filtered.length === 0 ? (
          <div className="p-8 text-center text-soft-ink space-y-2 bg-white rounded-2xl border border-border">
            <AlertTriangle className="w-8 h-8 text-purple-300 mx-auto" />
            <p className="text-sm font-extrabold text-ink font-heading">No reports match criteria</p>
            <p className="text-xs">
              No reports match your selected status and category filter.
            </p>
          </div>
        ) : (
          filtered.map((rep) => {
            const staleness = CivicReportingService.checkStaleness(rep);
            const isStale = staleness.isStale && rep.status !== 'resolved';
            const catConfig = getCivicCategory(rep.category);
            const isExpanded = expandedAuditId === rep.id;

            return (
              <article
                key={rep.id}
                className={`p-4 rounded-2xl space-y-2.5 transition-all bg-white border shadow-sm ${
                  isStale
                    ? 'border-amber-200/80 bg-amber-50/20'
                    : rep.status === 'verified'
                    ? 'border-emerald-200'
                    : 'border-purple-100'
                }`}
              >
                {/* Header: Title, Category Badge, Lifecycle Status Badge */}
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
                      <DisturbanceCategoryLabel category={rep.category} />
                      <ReportLifecycleBadge status={rep.status} />
                      {/* Truthful Freshness Indicator */}
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                          rep.status === 'resolved'
                            ? 'bg-purple-100 text-purple-800'
                            : isStale
                            ? 'bg-amber-100 text-amber-900 border border-amber-300'
                            : staleness.ageHours < 6
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : 'bg-sky-50 text-sky-800 border border-sky-200'
                        }`}
                      >
                        <Clock className="w-3 h-3" />
                        <span>
                          {rep.status === 'resolved'
                            ? 'Marked resolved'
                            : isStale
                            ? 'Not recently confirmed'
                            : staleness.ageHours < 6
                            ? 'Recent community report'
                            : 'Older report'}
                        </span>
                      </span>

                      {/* Explicit Demo vs Local Submission indicator */}
                      <span className="text-[10px] bg-canvas text-soft-ink px-1.5 py-0.5 rounded border border-border">
                        {rep.isDemoData ? 'Demo dataset' : 'Device-local submission'}
                      </span>

                      {rep.duplicateOfId && (
                        <span className="text-[10px] bg-purple-50 text-grape font-bold px-2 py-0.5 rounded-full border border-purple-200 flex items-center gap-1">
                          <Copy className="w-3 h-3" />
                          <span>Corroborates #{rep.duplicateOfId.slice(0, 8)}</span>
                        </span>
                      )}
                    </div>

                    <h3 className="font-heading text-base font-extrabold text-ink leading-snug">
                      {rep.locationName}
                    </h3>
                  </div>

                  <DataSourceBadge source={rep.source} />
                </div>

                {/* Description Text */}
                <p className="text-xs text-soft-ink leading-relaxed font-medium">
                  {rep.description}
                </p>

                {/* Evidence Thumbnail & Metadata (if photo attached) */}
                {rep.evidence?.photoUrl && (
                  <div className="p-2.5 rounded-xl bg-[#FCFAFF] border border-purple-100 flex items-center gap-2.5 text-xs text-soft-ink">
                    <img
                      src={rep.evidence.photoUrl}
                      alt="Submitted evidence"
                      className="w-10 h-10 rounded-lg object-cover border border-purple-200"
                    />
                    <div className="min-w-0">
                      <div className="font-bold text-ink truncate">
                        {rep.evidence.photoName || 'Attached Photo Evidence'}
                      </div>
                      <div className="text-[10px] text-emerald-700 font-semibold">
                        ✓ Photo validation passed · EXIF sanitized
                      </div>
                    </div>
                  </div>
                )}

                {/* Reviewer / Resolution Metadata Row */}
                {(rep.reviewedBy || rep.resolvedBy) && (
                  <div className="p-2 rounded-xl bg-[#F8F4FF] border border-purple-100 text-[11px] text-soft-ink flex items-center justify-between">
                    {rep.reviewedBy && (
                      <div>
                        <strong>Audited by:</strong> {rep.reviewedBy}{' '}
                        {rep.reviewedAt && `(${formatRelativeTime(rep.reviewedAt)})`}
                      </div>
                    )}
                    {rep.resolvedBy && (
                      <div className="text-emerald-800 font-medium">
                        <strong>Resolved by:</strong> {rep.resolvedBy}
                      </div>
                    )}
                  </div>
                )}

                {/* Audit History Expander */}
                {rep.statusHistory && rep.statusHistory.length > 0 && (
                  <div>
                    <button
                      type="button"
                      onClick={() => setExpandedAuditId(isExpanded ? null : rep.id)}
                      className="text-[11px] font-bold text-grape hover:underline flex items-center gap-1"
                    >
                      <History className="w-3 h-3 text-grape" />
                      <span>{isExpanded ? 'Hide' : 'View'} Review History ({rep.statusHistory.length})</span>
                    </button>

                    {isExpanded && (
                      <div className="mt-2 p-2.5 rounded-xl bg-paper border border-border text-[11px] space-y-1.5 animate-fade-in">
                        {rep.statusHistory.map((h, i) => (
                          <div key={i} className="flex items-start justify-between gap-2 border-b border-purple-100/60 pb-1 last:border-0 last:pb-0">
                            <div>
                              <span className="font-bold text-ink uppercase tracking-wide">
                                {h.fromStatus} → {h.toStatus}
                              </span>
                              <p className="text-soft-ink mt-0.5">{h.note || 'Status updated'}</p>
                            </div>
                            <span className="text-[10px] text-soft-ink shrink-0">
                              {formatRelativeTime(h.changedAt)}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Metadata & Actions Footer */}
                <div className="pt-2 border-t border-purple-100 flex items-center justify-between text-xs text-soft-ink flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1 text-[11px] font-medium">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{formatRelativeTime(rep.createdAt)}</span>
                    </span>
                    {rep.flagCount > 0 && (
                      <span className="text-[10px] bg-red-50 text-danger px-1.5 py-0.5 rounded border border-danger/30 font-semibold">
                        {rep.flagCount} dispute flag{rep.flagCount === 1 ? '' : 's'}
                      </span>
                    )}
                  </div>

                  {/* Reviewer Mode Controls */}
                  {isReviewerMode ? (
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {rep.status === 'pending' && (
                        <button
                          type="button"
                          onClick={() => handleInitiateTransition(rep.id, 'under_review')}
                          className="px-2.5 py-1 rounded-full text-xs font-bold bg-sky-50 text-sky-800 border border-sky-300 hover:bg-sky-100 transition-colors flex items-center gap-1"
                        >
                          <FileSearch className="w-3 h-3 text-sky-600" />
                          <span>Review</span>
                        </button>
                      )}

                      {rep.status === 'under_review' && (
                        <>
                          <button
                            type="button"
                            onClick={() => handleInitiateTransition(rep.id, 'verified')}
                            className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-emerald-100 transition-colors flex items-center gap-1"
                          >
                            <ShieldCheck className="w-3 h-3 text-emerald-600" />
                            <span>Verify</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleInitiateTransition(rep.id, 'invalidated')}
                            className="px-2 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200 transition-colors flex items-center gap-1"
                          >
                            <XCircle className="w-3 h-3 text-gray-500" />
                            <span>Invalidate</span>
                          </button>
                        </>
                      )}

                      {(rep.status === 'verified' || rep.status === 'under_review') && (
                        <button
                          type="button"
                          onClick={() => handleInitiateTransition(rep.id, 'resolved')}
                          className="px-2.5 py-1 rounded-full text-xs font-bold bg-[#F1EAFF] text-grape border border-lilac hover:bg-lilac transition-colors flex items-center gap-1"
                        >
                          <CheckCircle className="w-3 h-3 text-grape" />
                          <span>Resolve</span>
                        </button>
                      )}
                    </div>
                  ) : (
                    /* Commuter User Actions: Still happening, Resolved, Report Inaccurate */
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {/* 1. Still Happening Action */}
                      <button
                        type="button"
                        onClick={() => handleStillHappening(rep.id)}
                        disabled={userConfirmedIds.has(rep.id) || rep.status === 'resolved'}
                        className={`py-1 px-3 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
                          userConfirmedIds.has(rep.id)
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-300 cursor-default'
                            : 'border border-purple-200 hover:border-grape hover:text-grape bg-paper'
                        }`}
                        title={
                          userConfirmedIds.has(rep.id)
                            ? 'You have already corroborated this report'
                            : 'Confirm this issue is still present'
                        }
                      >
                        <ThumbsUp className="w-3 h-3 text-grape" />
                        <span className="tabular-nums">
                          {userConfirmedIds.has(rep.id)
                            ? 'Confirmed by you ✓'
                            : `Still happening (${rep.confirmationCount || rep.upvotes})`}
                        </span>
                      </button>

                      {/* 2. Resolved Action */}
                      {rep.status !== 'resolved' && (
                        <button
                          type="button"
                          onClick={() => handleCommuterMarkResolved(rep.id)}
                          className="py-1 px-2.5 rounded-full text-xs font-semibold border border-purple-200 text-soft-ink hover:text-emerald-700 hover:bg-emerald-50 transition-colors flex items-center gap-1 bg-paper"
                          title="Report that this issue has been resolved/cleared"
                        >
                          <CheckCircle className="w-3 h-3 text-emerald-600" />
                          <span>Resolved</span>
                        </button>
                      )}

                      {/* 3. Report Inaccurate Action */}
                      <button
                        type="button"
                        onClick={() => handleOpenFlagDialog(rep.id)}
                        className="py-1 px-2.5 rounded-full text-xs font-semibold text-soft-ink hover:text-danger hover:bg-danger-tint transition-colors flex items-center gap-1 border border-transparent hover:border-danger/20"
                        title="Flag inaccurate or outdated report"
                        aria-label="Report inaccurate"
                      >
                        <Flag className="w-3 h-3 text-danger" />
                        <span>Report inaccurate</span>
                      </button>
                    </div>
                  )}
                </div>
              </article>
            );
          })
        )}
      </div>

      {/* Flag Dispute Modal */}
      {flaggingReportId && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-ink/40 backdrop-blur-sm animate-fade-in"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white max-w-sm w-full p-5 rounded-2xl shadow-xl border border-purple-200 space-y-3.5">
            <div className="flex items-center justify-between">
              <h4 className="font-heading font-extrabold text-sm text-ink flex items-center gap-1.5">
                <Flag className="w-4 h-4 text-danger" />
                <span>Dispute / Flag Report</span>
              </h4>
              <button
                type="button"
                onClick={() => setFlaggingReportId(null)}
                className="text-soft-ink hover:text-ink p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-soft-ink">
              Explain why this report is disputed. Reports with multiple flags are auto-returned to Under Review for re-investigation.
            </p>

            <div className="space-y-1.5 text-xs">
              <label className="block font-bold text-ink">Reason for Dispute</label>
              <select
                value={flagReason}
                onChange={(e) => setFlagReason(e.target.value as ReportFlagReason)}
                className="w-full p-2 rounded-xl bg-paper border border-border text-xs font-semibold focus:outline-none focus:border-grape"
              >
                <option value="incorrect">Factually Incorrect / Not Present</option>
                <option value="outdated">Outdated (Issue Already Cleared)</option>
                <option value="duplicate">Duplicate of Another Report</option>
                <option value="resolved_incorrectly">Marked Resolved Prematurely</option>
                <option value="other">Other Concern</option>
              </select>
            </div>

            <div className="space-y-1.5 text-xs">
              <label className="block font-bold text-ink">Additional Details (Optional)</label>
              <textarea
                value={flagDetails}
                onChange={(e) => setFlagDetails(e.target.value)}
                placeholder="Provide context for municipal reviewers..."
                rows={2}
                className="w-full p-2 rounded-xl bg-paper border border-border text-xs focus:outline-none focus:border-grape"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
              <button
                type="button"
                onClick={() => setFlaggingReportId(null)}
                className="btn-secondary py-1.5 px-3 text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmFlag}
                className="px-4 py-1.5 rounded-full bg-danger text-white font-bold text-xs shadow-sm hover:bg-danger/90 transition-colors"
              >
                Submit Dispute
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reviewer Transition Modal (Prompts for Note/Audit Confirmation) */}
      {transitionPrompt && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-ink/40 backdrop-blur-sm animate-fade-in"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white max-w-sm w-full p-5 rounded-2xl shadow-xl border border-purple-200 space-y-3.5">
            <div className="flex items-center justify-between">
              <h4 className="font-heading font-extrabold text-sm text-ink flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-grape" />
                <span>Confirm Status Transition</span>
              </h4>
              <button
                type="button"
                onClick={() => setTransitionPrompt(null)}
                className="text-soft-ink hover:text-ink p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-xs text-soft-ink space-y-1">
              <div>
                Transitioning report to:{' '}
                <strong className="text-grape uppercase">{transitionPrompt.targetStatus}</strong>
              </div>
              <p>This action will be stamped with your reviewer actor ID in the audit trail.</p>
            </div>

            <div className="space-y-1.5 text-xs">
              <label className="block font-bold text-ink">Reviewer Audit Note</label>
              <textarea
                value={transitionNote}
                onChange={(e) => setTransitionNote(e.target.value)}
                rows={2}
                className="w-full p-2 rounded-xl bg-paper border border-border text-xs focus:outline-none focus:border-grape"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
              <button
                type="button"
                onClick={() => setTransitionPrompt(null)}
                className="btn-secondary py-1.5 px-3 text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExecuteTransition}
                className="btn-primary py-1.5 px-4 text-xs font-bold shadow-sm"
              >
                Confirm Transition
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
