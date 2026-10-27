import {
  CommunityReport,
  StreetlightSegment,
  EssentialFacility,
  TransportStop,
  JourneySession,
  TrustedContact,
  RoutePreferences,
} from '../types';
import {
  INITIAL_REPORTS,
  INITIAL_STREETLIGHTS,
  INITIAL_FACILITIES,
  INITIAL_TRANSPORT_STOPS,
  DEMO_TRUSTED_CONTACTS,
} from './mock-data';

const STORAGE_KEYS = {
  REPORTS: 'herpath_community_reports',
  STREETLIGHTS: 'herpath_streetlight_segments',
  FACILITIES: 'herpath_essential_facilities',
  TRANSPORT: 'herpath_transport_stops',
  JOURNEY: 'herpath_active_journey',
  CONTACTS: 'herpath_trusted_contacts',
  PREFERENCES: 'herpath_user_preferences',
};

const DEFAULT_PREFERENCES: RoutePreferences = {
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
  },

  upvoteReport(id: string): void {
    const current = this.getReports();
    const updated = current.map((r) => (r.id === id ? { ...r, upvotes: r.upvotes + 1 } : r));
    safeSet(STORAGE_KEYS.REPORTS, updated);
  },

  flagReport(id: string): void {
    const current = this.getReports();
    const updated = current.map((r) =>
      r.id === id ? { ...r, flagCount: (r.flagCount || 0) + 1 } : r
    );
    safeSet(STORAGE_KEYS.REPORTS, updated);
  },

  resolveReport(id: string): void {
    const current = this.getReports();
    const updated = current.map((r) =>
      r.id === id ? { ...r, status: 'resolved' as const, resolvedAt: new Date().toISOString() } : r
    );
    safeSet(STORAGE_KEYS.REPORTS, updated);
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
