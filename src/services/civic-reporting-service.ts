import {
  CommunityReport,
  Coordinates,
  ReportLifecycleStatus,
  ReportFlag,
  ReportFlagReason,
  ReportStatusTransition,
  ReportEvidence,
} from '../types';
import { calculateDistanceMeters } from '../lib/utils';
import { getCivicCategory, getCategoryFreshnessThresholdHours } from '../lib/civic-categories';

export interface DuplicateMatch {
  report: CommunityReport;
  distanceMeters: number;
  similarityScore: number; // 0 to 1
  reason: string;
}

export interface DuplicateDetectionResult {
  hasLikelyDuplicate: boolean;
  matches: DuplicateMatch[];
}

export interface ActorContext {
  role: 'user' | 'reviewer' | 'system';
  id?: string;
  name?: string;
}

/**
 * Calculates simple token overlap similarity between two strings
 */
function calculateTextSimilarity(str1: string, str2: string): number {
  const tokenize = (s: string) =>
    s
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter((w) => w.length > 2);

  const tokens1 = new Set(tokenize(str1));
  const tokens2 = new Set(tokenize(str2));

  if (tokens1.size === 0 || tokens2.size === 0) return 0;

  let intersection = 0;
  tokens1.forEach((token) => {
    if (tokens2.has(token)) {
      intersection++;
    }
  });

  const unionTokens = new Set<string>();
  tokens1.forEach((t) => unionTokens.add(t));
  tokens2.forEach((t) => unionTokens.add(t));

  return unionTokens.size > 0 ? intersection / unionTokens.size : 0;
}

export class CivicReportingService {
  /**
   * Evaluates if an incoming candidate report is a duplicate of any existing active report.
   * Considers:
   * 1. Geospatial distance (proximity threshold, default 80m)
   * 2. Category matching or related infrastructure domain
   * 3. Description text similarity
   * 4. Active status (resolved/invalidated reports are excluded from active duplicate warnings)
   */
  static detectDuplicates(
    candidate: {
      category: string;
      coordinates: Coordinates;
      description?: string;
      locationName?: string;
    },
    existingReports: CommunityReport[],
    maxRadiusMeters: number = 80
  ): DuplicateDetectionResult {
    const candidateCatConfig = getCivicCategory(candidate.category);
    const matches: DuplicateMatch[] = [];

    // Filter to active reports
    const activeReports = existingReports.filter(
      (r) => r.status !== 'resolved' && r.status !== 'invalidated'
    );

    for (const report of activeReports) {
      const distance = calculateDistanceMeters(candidate.coordinates, report.coordinates);

      if (distance <= maxRadiusMeters) {
        const reportCatConfig = getCivicCategory(report.category);
        const isSameCategory =
          report.category === candidate.category ||
          reportCatConfig.id === candidateCatConfig.id ||
          reportCatConfig.legacyAlias === candidate.category;

        const isSameDomain = reportCatConfig.infrastructureDomain === candidateCatConfig.infrastructureDomain;

        let similarity = 0;
        let reasons: string[] = [];

        if (isSameCategory) {
          similarity += 0.55;
          reasons.push(`Identical issue type (${reportCatConfig.shortName}) within ${distance}m`);
        } else if (isSameDomain) {
          similarity += 0.3;
          reasons.push(`Related ${reportCatConfig.infrastructureDomain} issue within ${distance}m`);
        }

        // Distance proximity boost
        if (distance <= 30) {
          similarity += 0.35;
        } else if (distance <= 60) {
          similarity += 0.2;
        }

        // Textual similarity
        if (candidate.description && report.description) {
          const textSim = calculateTextSimilarity(candidate.description, report.description);
          if (textSim > 0.3) {
            similarity += textSim * 0.25;
            reasons.push('Matching description keywords');
          }
        }

        const normalizedScore = Math.min(1.0, Math.round(similarity * 100) / 100);

        // If score exceeds 0.5, we flag it as a duplicate candidate
        if (normalizedScore >= 0.5) {
          matches.push({
            report,
            distanceMeters: distance,
            similarityScore: normalizedScore,
            reason: reasons.join(' · '),
          });
        }
      }
    }

    // Sort descending by similarity
    matches.sort((a, b) => b.similarityScore - a.similarityScore);

    return {
      hasLikelyDuplicate: matches.length > 0,
      matches,
    };
  }

  /**
   * Validates whether an actor has authority to transition report lifecycle status
   */
  static canTransition(
    currentStatus: ReportLifecycleStatus,
    targetStatus: ReportLifecycleStatus,
    actor: ActorContext
  ): { allowed: boolean; reason?: string } {
    if (currentStatus === targetStatus) {
      return { allowed: false, reason: 'Report is already in this status' };
    }

    // Ordinary users can only submit ('pending') or add corroboration/flags
    if (actor.role === 'user') {
      return {
        allowed: false,
        reason: 'Ordinary users cannot verify, invalidate, or resolve civic reports. Authorized review is required.',
      };
    }

    // Authorized reviewer or system
    const validTransitions: Record<ReportLifecycleStatus, ReportLifecycleStatus[]> = {
      pending: ['under_review', 'invalidated'],
      under_review: ['verified', 'resolved', 'invalidated', 'pending'],
      verified: ['under_review', 'resolved', 'invalidated'],
      resolved: ['under_review', 'verified'], // Can be reopened if reported resolved incorrectly
      invalidated: ['under_review', 'pending'],
      outdated: ['under_review', 'resolved', 'invalidated'],
    };

    const allowedTargets = validTransitions[currentStatus] || [];
    if (!allowedTargets.includes(targetStatus)) {
      return {
        allowed: false,
        reason: `Illegal lifecycle transition from "${currentStatus}" to "${targetStatus}".`,
      };
    }

    return { allowed: true };
  }

  /**
   * Applies an authorized state transition to a report with complete audit history
   */
  static transitionStatus(
    report: CommunityReport,
    targetStatus: ReportLifecycleStatus,
    actor: ActorContext,
    note?: string
  ): { success: boolean; error?: string; updatedReport?: CommunityReport } {
    const check = this.canTransition(report.status, targetStatus, actor);
    if (!check.allowed) {
      return { success: false, error: check.reason };
    }

    const now = new Date().toISOString();
    const transition: ReportStatusTransition = {
      fromStatus: report.status,
      toStatus: targetStatus,
      changedAt: now,
      actor: actor.role === 'reviewer' ? 'reviewer' : 'system',
      note: note || `Status transitioned to ${targetStatus} by ${actor.name || actor.role}`,
    };

    const updatedHistory = [...(report.statusHistory || []), transition];

    const updated: CommunityReport = {
      ...report,
      status: targetStatus,
      statusHistory: updatedHistory,
    };

    if (targetStatus === 'verified') {
      updated.reviewedAt = now;
      updated.reviewedBy = actor.name || 'Municipal Auditor';
    } else if (targetStatus === 'resolved') {
      updated.resolvedAt = now;
      updated.resolvedBy = actor.name || 'Civic Works Crew';
    }

    return { success: true, updatedReport: updated };
  }

  /**
   * Flags an existing report as potentially inaccurate, outdated, duplicate, or resolved incorrectly.
   */
  static flagReport(
    report: CommunityReport,
    reason: ReportFlagReason,
    details?: string,
    actorRole: 'user' | 'reviewer' = 'user'
  ): CommunityReport {
    const flag: ReportFlag = {
      id: `flg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      reason,
      details,
      createdAt: new Date().toISOString(),
      flaggedByRole: actorRole,
    };

    const updatedFlags = [...(report.flags || []), flag];
    const newFlagCount = (report.flagCount || 0) + 1;

    let targetStatus = report.status;
    let statusHistory = report.statusHistory || [];

    // If report was verified, but accumulates multiple flags, prompt re-review
    if (report.status === 'verified' && newFlagCount >= 2) {
      targetStatus = 'under_review';
      statusHistory = [
        ...statusHistory,
        {
          fromStatus: 'verified',
          toStatus: 'under_review',
          changedAt: new Date().toISOString(),
          actor: 'system',
          note: `Auto-returned to Under Review due to multiple community disputes (${newFlagCount} flags)`,
        },
      ];
    }

    return {
      ...report,
      flagCount: newFlagCount,
      flags: updatedFlags,
      status: targetStatus,
      statusHistory,
    };
  }

  /**
   * Determines if a report is past its category-specific freshness window
   */
  static checkStaleness(report: CommunityReport): { isStale: boolean; ageHours: number; thresholdHours: number } {
    const thresholdHours = getCategoryFreshnessThresholdHours(report.category);
    const createdTime = new Date(report.createdAt).getTime();
    const now = Date.now();
    const ageHours = (now - createdTime) / (1000 * 60 * 60);

    const isStale = ageHours > thresholdHours;
    return {
      isStale,
      ageHours: Math.round(ageHours * 10) / 10,
      thresholdHours,
    };
  }

  /**
   * Validates photo attachment metadata
   */
  static validatePhotoAttachment(file: {
    name: string;
    size: number;
    type: string;
  }): { valid: boolean; error?: string; sanitizedName?: string } {
    const ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/webp', 'image/heic'];
    const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB limit

    if (!ALLOWED_MIME.includes(file.type.toLowerCase())) {
      return {
        valid: false,
        error: 'Only JPEG, PNG, or WebP images are permitted for evidence verification.',
      };
    }

    if (file.size > MAX_SIZE_BYTES) {
      return {
        valid: false,
        error: `File size (${(file.size / (1024 * 1024)).toFixed(1)}MB) exceeds maximum allowed 5MB limit.`,
      };
    }

    // Strip sensitive file paths and non-alphanumeric chars
    const baseName = file.name.split(/[\\/]/).pop() || 'evidence.jpg';
    const sanitizedName = baseName.replace(/[^a-zA-Z0-9._-]/g, '_');

    return { valid: true, sanitizedName };
  }
}
