import { DataSourceType } from '../types';

export type CivicCategoryKey =
  | 'broken_streetlight'
  | 'broken_footpath'
  | 'road_damage'
  | 'pedestrian_obstruction'
  | 'harassment_risk'
  | 'suspicious_activity'
  | 'isolated_area'
  | 'transit_disruption'
  | 'facility_unavailable'
  | 'other_hazard';

export interface CivicCategoryConfig {
  id: CivicCategoryKey;
  legacyAlias?: string;
  label: string;
  shortName: string;
  icon: string;
  description: string;
  defaultFreshnessHours: number; // Category-specific expiry/staleness window
  severityLevel: 'low' | 'medium' | 'high';
  infrastructureDomain: 'lighting' | 'surface' | 'transit' | 'safety' | 'services';
  affectsRoutingEvaluation: boolean;
}

/**
 * Configurable Civic Categories Registry.
 * New categories can be added here without rewriting reporting workflows.
 */
export const CIVIC_CATEGORIES: Record<CivicCategoryKey, CivicCategoryConfig> = {
  broken_streetlight: {
    id: 'broken_streetlight',
    legacyAlias: 'streetlight_issue',
    label: 'Broken / Nonfunctional Streetlight',
    shortName: 'Streetlight Outage',
    icon: '💡',
    description: 'Dark roadway, failing fixture, blinking luminaire, or unlit pedestrian stretch',
    defaultFreshnessHours: 168, // 7 days (infrastructure persists until fixed)
    severityLevel: 'medium',
    infrastructureDomain: 'lighting',
    affectsRoutingEvaluation: true,
  },
  broken_footpath: {
    id: 'broken_footpath',
    legacyAlias: 'broken_footpath',
    label: 'Damaged Footpath / Sidewalk',
    shortName: 'Footpath Damage',
    icon: '🚧',
    description: 'Broken paving slabs, uncovered drainage, curb hazards, or inaccessible curb-ramps',
    defaultFreshnessHours: 336, // 14 days
    severityLevel: 'medium',
    infrastructureDomain: 'surface',
    affectsRoutingEvaluation: true,
  },
  road_damage: {
    id: 'road_damage',
    legacyAlias: 'blocked_road',
    label: 'Road Damage / Severe Potholes',
    shortName: 'Road Damage',
    icon: '⚠️',
    description: 'Major road subsidence, large potholes, open trenches, or broken crossing pavement',
    defaultFreshnessHours: 336, // 14 days
    severityLevel: 'medium',
    infrastructureDomain: 'surface',
    affectsRoutingEvaluation: true,
  },
  pedestrian_obstruction: {
    id: 'pedestrian_obstruction',
    legacyAlias: 'blocked_road',
    label: 'Pedestrian Obstruction',
    shortName: 'Walkway Blocked',
    icon: '⛔',
    description: 'Illegal dumping, construction debris, fallen branches, or barrier blocking walkway',
    defaultFreshnessHours: 24, // 24 hours (temporary issue)
    severityLevel: 'medium',
    infrastructureDomain: 'surface',
    affectsRoutingEvaluation: true,
  },
  harassment_risk: {
    id: 'harassment_risk',
    legacyAlias: 'harassment',
    label: 'Harassment / Threatening Behavior',
    shortName: 'Harassment Concern',
    icon: '🚨',
    description: 'Hostile loitering, catcalling, intimidation, or poorly monitored gathering points',
    defaultFreshnessHours: 48, // 48 hours
    severityLevel: 'high',
    infrastructureDomain: 'safety',
    affectsRoutingEvaluation: true,
  },
  suspicious_activity: {
    id: 'suspicious_activity',
    legacyAlias: 'suspicious_behavior',
    label: 'Suspicious / Concerning Observable Behavior',
    shortName: 'Concerning Behavior',
    icon: '👁️',
    description: 'Unattended property, tampering with safety fixtures, or concerning observable activity',
    defaultFreshnessHours: 24, // 24 hours (temporary issue)
    severityLevel: 'medium',
    infrastructureDomain: 'safety',
    affectsRoutingEvaluation: true,
  },
  isolated_area: {
    id: 'isolated_area',
    legacyAlias: 'deserted_segment',
    label: 'Isolated / Low Pedestrian Activity',
    shortName: 'Low Pedestrian Activity',
    icon: '🚶',
    description: 'Personally observed low foot traffic, deserted stretch, or lack of commercial activity',
    defaultFreshnessHours: 24, // 24 hours
    severityLevel: 'low',
    infrastructureDomain: 'safety',
    affectsRoutingEvaluation: true,
  },
  transit_disruption: {
    id: 'transit_disruption',
    legacyAlias: 'transport_disruption',
    label: 'Transit Facility Disruption',
    shortName: 'Transit Disruption',
    icon: '🚌',
    description: 'Closed metro station gate, unlit bus shelter, or suspended transit line',
    defaultFreshnessHours: 24, // 24 hours
    severityLevel: 'medium',
    infrastructureDomain: 'transit',
    affectsRoutingEvaluation: true,
  },
  facility_unavailable: {
    id: 'facility_unavailable',
    legacyAlias: 'facility_unavailable',
    label: 'Essential Facility Unavailable',
    shortName: 'Facility Closed/Down',
    icon: '🏥',
    description: 'Reported closure of 24/7 medical booth, pharmacy, or women\'s restroom facility',
    defaultFreshnessHours: 48, // 48 hours
    severityLevel: 'medium',
    infrastructureDomain: 'services',
    affectsRoutingEvaluation: true,
  },
  other_hazard: {
    id: 'other_hazard',
    legacyAlias: 'other_concern',
    label: 'Other Public Infrastructure Issue',
    shortName: 'Civic Hazard',
    icon: 'ℹ️',
    description: 'General public infrastructure defect or municipal concern',
    defaultFreshnessHours: 72, // 3 days
    severityLevel: 'low',
    infrastructureDomain: 'services',
    affectsRoutingEvaluation: true,
  },
};

/**
 * Normalizes legacy disturbance category strings to standardized CivicCategoryConfig
 */
export function getCivicCategory(categoryKey: string): CivicCategoryConfig {
  if (categoryKey in CIVIC_CATEGORIES) {
    return CIVIC_CATEGORIES[categoryKey as CivicCategoryKey];
  }

  // Check legacy aliases
  for (const cat of Object.values(CIVIC_CATEGORIES)) {
    if (cat.legacyAlias === categoryKey) {
      return cat;
    }
  }

  // Fallback
  return CIVIC_CATEGORIES.other_hazard;
}

export function getAllCivicCategories(): CivicCategoryConfig[] {
  return Object.values(CIVIC_CATEGORIES);
}

export function getCategoryFreshnessThresholdHours(categoryKey: string): number {
  return getCivicCategory(categoryKey).defaultFreshnessHours;
}
