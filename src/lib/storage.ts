import {
  CommunityReport,
  StreetlightSegment,
  EssentialFacility,
  TransportStop,
  JourneySession,
  TrustedContact,
  RoutePreferences,
  ReportLifecycleStatus,
  ReportFlagReason,
} from '../types';
import {
  INITIAL_REPORTS,
  INITIAL_STREETLIGHTS,
  INITIAL_FACILITIES,
  INITIAL_TRANSPORT_STOPS,
  DEMO_TRUSTED_CONTACTS,
} from './mock-data';
import { CivicReportingService, ActorContext } from '../services/civic-reporting-service';
import { supabase, isSupabaseConfigured } from './supabase';

const STORAGE_KEYS = {
  REPORTS: 'herpath_community_reports',
  STREETLIGHTS: 'herpath_streetlight_segments',
  FACILITIES: 'herpath_essential_facilities',
  TRANSPORT: 'herpath_transport_stops',
  JOURNEY: 'herpath_active_journey',
  CONTACTS: 'herpath_trusted_contacts',
  PREFERENCES: 'herpath_user_preferences',
  REVIEWER_MODE: 'herpath_civic_reviewer_mode',
};

export const DEFAULT_PREFERENCES: RoutePreferences = {
  preferWellLit: true,
  preferPublicTransport: true,
  preferEssentialFacilities: true,
  reduceIsolatedSegments: true,
  wheelchairAccessible: false,
};

function safeGet<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch (err) {
    console.error(`Error reading ${key} from storage:`, err);
    return fallback;
  }
}

function safeSet<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
    window.dispatchEvent(new CustomEvent('herpath_storage_update', { detail: { key } }));
  } catch (err) {
    console.error(`Error writing ${key} to storage:`, err);
  }
}

export const StorageRepository = {
  getReports(): CommunityReport[] {
    return safeGet<CommunityReport[]>(STORAGE_KEYS.REPORTS, INITIAL_REPORTS);
  },

  saveReport(report: CommunityReport): void {
    const current = this.getReports();
    const updated = [report, ...current.filter((r) => r.id !== report.id)];
    safeSet(STORAGE_KEYS.REPORTS, updated);

    // If Supabase is configured, sync in background
    if (isSupabaseConfigured && supabase) {
      supabase
        .from('community_reports')
        .upsert({
          id: report.id,
          category: report.category,
          latitude: report.coordinates.lat,
          longitude: report.coordinates.lng,
          location_name: report.locationName,
          description: report.description,
          status: report.status,
          source: report.source,
          upvotes: report.upvotes,
          confirmation_count: report.confirmationCount || report.upvotes || 1,
          flag_count: report.flagCount,
          is_demo_data: report.isDemoData || false,
          observed_at: report.observedAt || report.createdAt,
          submitted_at: report.submittedAt || report.createdAt,
          photo_url: report.evidence?.photoUrl,
          photo_name: report.evidence?.photoName,
          photo_size_bytes: report.evidence?.photoSizeBytes,
          photo_mime_type: report.evidence?.photoMimeType,
          submitted_with_gps: report.evidence?.submittedWithGps || false,
          duplicate_of_id: report.duplicateOfId || null,
          created_at: report.createdAt,
          expires_at: report.expiresAt,
          resolved_at: report.resolvedAt,
          reviewed_at: report.reviewedAt,
          reviewed_by: report.reviewedBy,
        })
        .then(({ error }: any) => {
          if (error) console.warn('Supabase report sync notice:', error.message);
        });
    }
  },

  async syncRemoteReports(): Promise<CommunityReport[]> {
    if (!isSupabaseConfigured || !supabase) {
      return this.getReports();
    }
    try {
      const { data, error } = await supabase
        .from('community_reports')
        .select('*')
        .order('created_at', { ascending: false });

      if (error || !data) {
        return this.getReports();
      }

      const remoteReports: CommunityReport[] = data.map((row: any) => ({
        id: row.id,
        category: row.category,
        coordinates: { lat: row.latitude, lng: row.longitude },
        locationName: row.location_name || 'Reported Location',
        description: row.description || '',
        status: row.status,
        source: row.source,
        upvotes: row.upvotes || 0,
        confirmationCount: row.confirmation_count || row.upvotes || 1,
        flagCount: row.flag_count || 0,
        isDemoData: row.is_demo_data || false,
        observedAt: row.observed_at || row.created_at,
        submittedAt: row.submitted_at || row.created_at,
        lastConfirmedAt: row.last_confirmed_at,
        createdAt: row.created_at,
        expiresAt: row.expires_at,
        resolvedAt: row.resolved_at,
        reviewedAt: row.reviewed_at,
        reviewedBy: row.reviewed_by,
        resolvedBy: row.resolved_by,
        evidence: row.photo_name ? {
          photoName: row.photo_name,
          photoUrl: row.photo_url,
          photoSizeBytes: row.photo_size_bytes,
          photoMimeType: row.photo_mime_type,
          submittedWithGps: row.submitted_with_gps || false,
        } : undefined,
      }));

      const current = this.getReports();
      const remoteIds = new Set(remoteReports.map((r) => r.id));
      const combined = [...remoteReports, ...current.filter((r) => !remoteIds.has(r.id))];
      safeSet(STORAGE_KEYS.REPORTS, combined);
      return combined;
    } catch (err) {
      console.warn('Error syncing remote reports from Supabase:', err);
      return this.getReports();
    }
  },

  upvoteReport(id: string): void {
    const current = this.getReports();
    const now = new Date().toISOString();
    const updated = current.map((r) =>
      r.id === id
        ? {
            ...r,
            upvotes: r.upvotes + 1,
            confirmationCount: (r.confirmationCount || r.upvotes) + 1,
            lastConfirmedAt: now,
          }
        : r
    );
    safeSet(STORAGE_KEYS.REPORTS, updated);
  },

  flagReport(id: string): void {
    this.flagReportWithDetails(id, 'other', 'Flagged by commuter');
  },

  flagReportWithDetails(
    id: string,
    reason: ReportFlagReason,
    details?: string,
    role: 'user' | 'reviewer' = 'user'
  ): void {
    const current = this.getReports();
    const target = current.find((r) => r.id === id);
    if (!target) return;

    const updatedReport = CivicReportingService.flagReport(target, reason, details, role);
    const updated = current.map((r) => (r.id === id ? updatedReport : r));
    safeSet(STORAGE_KEYS.REPORTS, updated);

    if (isSupabaseConfigured && supabase) {
      supabase
        .from('report_flags')
        .insert({
          report_id: id,
          reason,
          details,
          flagged_by_role: role,
        })
        .then(({ error }: any) => {
          if (error) console.warn('Supabase flag sync notice:', error.message);
        });
    }
  },

  transitionReportStatus(
    id: string,
    targetStatus: ReportLifecycleStatus,
    actor: ActorContext,
    note?: string
  ): { success: boolean; error?: string } {
    const current = this.getReports();
    const target = current.find((r) => r.id === id);
    if (!target) return { success: false, error: 'Report not found' };

    const result = CivicReportingService.transitionStatus(target, targetStatus, actor, note);
    if (!result.success || !result.updatedReport) {
      return { success: false, error: result.error || 'Transition denied' };
    }

    const updated = current.map((r) => (r.id === id ? result.updatedReport! : r));
    safeSet(STORAGE_KEYS.REPORTS, updated);

    if (isSupabaseConfigured && supabase) {
      supabase
        .from('community_reports')
        .update({
          status: targetStatus,
          reviewed_at: result.updatedReport.reviewedAt,
          reviewed_by: result.updatedReport.reviewedBy,
          resolved_at: result.updatedReport.resolvedAt,
          resolved_by: result.updatedReport.resolvedBy,
        })
        .eq('id', id)
        .then(({ error }: any) => {
          if (error) console.warn('Supabase status transition notice:', error.message);
        });

      supabase
        .from('report_status_history')
        .insert({
          report_id: id,
          from_status: target.status,
          to_status: targetStatus,
          actor: actor.role,
          note,
        })
        .then(({ error }: any) => {
          if (error) console.warn('Supabase history insert notice:', error.message);
        });
    }

    return { success: true };
  },

  resolveReport(id: string): void {
    this.transitionReportStatus(
      id,
      'resolved',
      { role: 'reviewer', name: 'Authorized Resolver' },
      'Resolved via quick action'
    );
  },

  isReviewerMode(): boolean {
    return safeGet<boolean>(STORAGE_KEYS.REVIEWER_MODE, false);
  },

  setReviewerMode(enabled: boolean): void {
    safeSet(STORAGE_KEYS.REVIEWER_MODE, enabled);
  },

  getStreetlights(): StreetlightSegment[] {
    return safeGet<StreetlightSegment[]>(STORAGE_KEYS.STREETLIGHTS, INITIAL_STREETLIGHTS);
  },

  saveStreetlight(streetlight: StreetlightSegment): void {
    const current = this.getStreetlights();
    const updated = [streetlight, ...current.filter((s) => s.id !== streetlight.id)];
    safeSet(STORAGE_KEYS.STREETLIGHTS, updated);
  },

  getFacilities(): EssentialFacility[] {
    return safeGet<EssentialFacility[]>(STORAGE_KEYS.FACILITIES, INITIAL_FACILITIES);
  },

  saveFacility(facility: EssentialFacility): void {
    const current = this.getFacilities();
    const updated = [facility, ...current.filter((f) => f.id !== facility.id)];
    safeSet(STORAGE_KEYS.FACILITIES, updated);
  },

  getTransportStops(): TransportStop[] {
    return safeGet<TransportStop[]>(STORAGE_KEYS.TRANSPORT, INITIAL_TRANSPORT_STOPS);
  },

  getActiveJourney(): JourneySession | null {
    return safeGet<JourneySession | null>(STORAGE_KEYS.JOURNEY, null);
  },

  saveActiveJourney(journey: JourneySession | null): void {
    safeSet(STORAGE_KEYS.JOURNEY, journey);
  },

  getTrustedContacts(): TrustedContact[] {
    return safeGet<TrustedContact[]>(STORAGE_KEYS.CONTACTS, DEMO_TRUSTED_CONTACTS);
  },

  saveTrustedContact(contact: TrustedContact): void {
    const current = this.getTrustedContacts();
    const updated = [...current.filter((c) => c.id !== contact.id), contact];
    safeSet(STORAGE_KEYS.CONTACTS, updated);
  },

  getPreferences(): RoutePreferences {
    return safeGet<RoutePreferences>(STORAGE_KEYS.PREFERENCES, DEFAULT_PREFERENCES);
  },

  savePreferences(prefs: RoutePreferences): void {
    safeSet(STORAGE_KEYS.PREFERENCES, prefs);
  },

  resetToDemoDefaults(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(STORAGE_KEYS.REPORTS);
    localStorage.removeItem(STORAGE_KEYS.STREETLIGHTS);
    localStorage.removeItem(STORAGE_KEYS.FACILITIES);
    localStorage.removeItem(STORAGE_KEYS.TRANSPORT);
    localStorage.removeItem(STORAGE_KEYS.JOURNEY);
    localStorage.removeItem(STORAGE_KEYS.CONTACTS);
    localStorage.removeItem(STORAGE_KEYS.PREFERENCES);
    window.dispatchEvent(new CustomEvent('herpath_storage_update', { detail: { key: 'all' } }));
  },
};
