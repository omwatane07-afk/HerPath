export type DataSourceType =
  | 'live_feed'
  | 'official'
  | 'community'
  | 'verified'
  | 'unverified'
  | 'stale'
  | 'outdated'
  | 'demo'
  | 'unknown';

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface PlaceSuggestion {
  id: string;
  name: string;
  displayName: string;
  coordinates: Coordinates;
  type?: string;
}

export type RoutePerspective = 'fastest' | 'balanced' | 'better_supported';

export interface FactorBreakdown {
  id: string;
  name: string;
  category: 'lighting' | 'facilities' | 'transport' | 'community' | 'coverage';
  status: 'positive' | 'neutral' | 'concern' | 'unknown';
  summary: string;
  details: string;
  source: DataSourceType;
  lastUpdated?: string;
}

export interface RouteOption {
  id: string;
  perspective: RoutePerspective;
  name: string;
  tagline: string;
  distanceMeters: number;
  durationSeconds: number;
  coordinates: [number, number][]; // [lat, lng] array
  summary: string;
  steps: RouteStep[];
  factors: FactorBreakdown[];
  lightingCoveragePercent: number;
  verifiedLightCount: number;
  outageReportCount: number;
  nearbyFacilityCount: number;
  transportStopsNearby: number;
  activeConcernsCount: number;
  dataCoveragePercent: number; // transparent representation of known vs unknown segments
  relativeScoreDescription: string;
  disclaimer: string;
}

export interface RouteStep {
  instruction: string;
  distanceMeters: number;
  durationSeconds: number;
  coordinates: [number, number];
  infrastructureNote?: string;
}

export interface RoutePreferences {
  preferWellLit: boolean;
  preferPublicTransport: boolean;
  preferEssentialFacilities: boolean;
  reduceIsolatedSegments: boolean;
  wheelchairAccessible: boolean;
}

export type DisturbanceCategory =
  | 'harassment'
  | 'disruptive_group'
  | 'suspected_intoxication'
  | 'streetlight_issue'
  | 'broken_footpath'
  | 'blocked_road'
  | 'transport_disruption'
  | 'facility_unavailable'
  | 'other_concern';

export type ReportStatus = 'pending' | 'verified' | 'resolved' | 'outdated';

export interface CommunityReport {
  id: string;
  category: DisturbanceCategory;
  coordinates: Coordinates;
  locationName: string;
  description: string;
  status: ReportStatus;
  source: DataSourceType;
  upvotes: number;
  flagCount: number;
  createdAt: string;
  expiresAt: string;
  resolvedAt?: string;
  isStale?: boolean;
}

export type StreetlightStatus =
  | 'working'
  | 'malfunctioning'
  | 'partial_outage'
  | 'unverified'
  | 'unknown'
  | 'resolved';

export interface StreetlightSegment {
  id: string;
  segmentName: string;
  coordinates: Coordinates;
  status: StreetlightStatus;
  reportedSource: DataSourceType;
  verificationStatus: 'unverified' | 'community_corroborated' | 'official_confirmed';
  lastReportedAt: string;
  resolvedAt?: string;
  notes?: string;
  isStale?: boolean;
}

export type FacilityCategory =
  | 'womens_restroom'
  | 'public_toilet'
  | 'pharmacy'
  | 'hospital'
  | 'police_station'
  | 'help_point'
  | 'accessible_facility';

export interface EssentialFacility {
  id: string;
  name: string;
  category: FacilityCategory;
  coordinates: Coordinates;
  address: string;
  phone?: string;
  openingHours?: string;
  isAccessible: boolean;
  hasFemaleStaff?: boolean;
  verificationStatus: 'official_verified' | 'community_reported' | 'unverified' | 'reported_closed';
  lastVerifiedAt: string;
  source: DataSourceType;
  notes?: string;
}

export type TransportType = 'bus_stop' | 'metro_station' | 'railway_station' | 'terminal';

export interface TransportStop {
  id: string;
  name: string;
  type: TransportType;
  coordinates: Coordinates;
  hasWomensCoach: boolean;
  isWellLit: boolean;
  hasCCTV: boolean;
  lines: string[];
  accessibilityInfo?: string;
  scheduleType: 'mapped_location_only' | 'static_schedule' | 'live_feed_unavailable';
  source: DataSourceType;
}

export type JourneyStatus =
  | 'planned'
  | 'in_progress'
  | 'check_in_due'
  | 'arrived'
  | 'completed'
  | 'cancelled';

export interface TrustedContact {
  id: string;
  name: string;
  phone: string;
  relation: string;
  isEmergencyAlertContact: boolean;
}

export interface JourneyCheckIn {
  id: string;
  timestamp: string;
  coordinates: Coordinates;
  status: 'ok' | 'delayed' | 'help_needed' | 'arrived';
  note?: string;
}

export interface JourneySession {
  id: string;
  originName: string;
  originCoords: Coordinates;
  destinationName: string;
  destCoords: Coordinates;
  routeGeometry: [number, number][];
  estimatedArrival: string;
  checkInIntervalMinutes: number;
  status: JourneyStatus;
  trustedContact?: TrustedContact;
  shareToken: string;
  currentCoords: Coordinates;
  lastCheckInAt?: string;
  nextCheckInDueAt?: string;
  createdAt: string;
  endedAt?: string;
  checkIns: JourneyCheckIn[];
  isDemoMode: boolean; // explicitly clarifies simulated vs remote broadcast
}
