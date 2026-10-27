import {
  RouteOption,
  RoutePerspective,
  FactorBreakdown,
  StreetlightSegment,
  CommunityReport,
  EssentialFacility,
  TransportStop,
  RoutePreferences,
} from '../types';
import { RawRouteResult } from './routing-service';
import { distanceToPolylineMeters, isReportStale } from '../lib/utils';

interface EvaluationContext {
  streetlights: StreetlightSegment[];
  reports: CommunityReport[];
  facilities: EssentialFacility[];
  transportStops: TransportStop[];
  preferences: RoutePreferences;
}

export function evaluateRoutes(
  rawRoutes: RawRouteResult[],
  context: EvaluationContext
): RouteOption[] {
  if (rawRoutes.length === 0) return [];

  // Sort raw routes by duration to identify the objectively fastest route
  const sortedByTime = [...rawRoutes].sort((a, b) => a.durationSeconds - b.durationSeconds);

  // Compute metrics for each route
  const analyzed = sortedByTime.map((raw, index) => {
    return analyzeSingleRoute(raw, context, index);
  });

  // Assign distinct perspectives:
  // Route 0 is always 'fastest'
  analyzed[0].perspective = 'fastest';
  analyzed[0].name = 'Fastest Route';
  analyzed[0].tagline = 'Prioritises shortest physical distance and minimal transit time';

  // For the remaining routes, identify the one with the highest infrastructure support
  if (analyzed.length > 1) {
    let bestSupportedIndex = 1;
    let highestSupportScore = -1;

    for (let i = 1; i < analyzed.length; i++) {
      const score =
        analyzed[i].nearbyFacilityCount * 3 +
        analyzed[i].transportStopsNearby * 2 +
        analyzed[i].verifiedLightCount * 2 -
        analyzed[i].outageReportCount * 3 -
        analyzed[i].activeConcernsCount * 4;

      if (score > highestSupportScore) {
        highestSupportScore = score;
        bestSupportedIndex = i;
      }
    }

    analyzed[bestSupportedIndex].perspective = 'better_supported';
    analyzed[bestSupportedIndex].name = 'Better-Supported Route';
    analyzed[bestSupportedIndex].tagline =
      'Higher presence of verified streetlights, active transit hubs, and essential facilities';

    // If there is a third route, it becomes 'balanced'
    for (let i = 1; i < analyzed.length; i++) {
      if (i !== bestSupportedIndex) {
        analyzed[i].perspective = 'balanced';
        analyzed[i].name = 'Balanced Route';
        analyzed[i].tagline =
          'Balanced trade-off between walking travel time and documented corridor infrastructure';
      }
    }
  }

  return analyzed;
}

function analyzeSingleRoute(
  raw: RawRouteResult,
  context: EvaluationContext,
  routeIndex: number
): RouteOption {
  const PROXIMITY_BUFFER_METERS = 180; // Distance to consider a point "along the route corridor"

  // 1. Streetlight analysis
  const corridorLights = context.streetlights.filter(
    (sl) => distanceToPolylineMeters(sl.coordinates, raw.coordinates) <= PROXIMITY_BUFFER_METERS
  );

  const verifiedWorkingLights = corridorLights.filter(
    (sl) => sl.status === 'working' || sl.status === 'resolved'
  );
  const outageLights = corridorLights.filter(
    (sl) => sl.status === 'malfunctioning' || sl.status === 'partial_outage'
  );

  // 2. Disturbance & community concerns
  const corridorReports = context.reports.filter(
    (rep) =>
      rep.status !== 'resolved' &&
      distanceToPolylineMeters(rep.coordinates, raw.coordinates) <= PROXIMITY_BUFFER_METERS &&
      !isReportStale(rep.createdAt, 48)
  );

  // 3. Nearby facilities
  const corridorFacilities = context.facilities.filter(
    (fac) =>
      fac.verificationStatus !== 'reported_closed' &&
      distanceToPolylineMeters(fac.coordinates, raw.coordinates) <= PROXIMITY_BUFFER_METERS
  );

  // 4. Public transport
  const corridorTransport = context.transportStops.filter(
    (trn) => distanceToPolylineMeters(trn.coordinates, raw.coordinates) <= PROXIMITY_BUFFER_METERS
  );

  // 5. Data Coverage Calculation
  // A route corridor's coverage is calculated by checking what % of its waypoints have at least one documented data point within 200m
  let coveredWaypoints = 0;
  for (const [lat, lng] of raw.coordinates) {
    const pt = { lat, lng };
    const hasData =
      context.streetlights.some((s) => distanceToPolylineMeters(s.coordinates, [[pt.lat, pt.lng]]) <= 200) ||
      context.facilities.some((f) => distanceToPolylineMeters(f.coordinates, [[pt.lat, pt.lng]]) <= 200) ||
      context.transportStops.some((t) => distanceToPolylineMeters(t.coordinates, [[pt.lat, pt.lng]]) <= 200);
    if (hasData) coveredWaypoints++;
  }

  const rawCoverage = raw.coordinates.length > 0 ? (coveredWaypoints / raw.coordinates.length) * 100 : 40;
  const dataCoveragePercent = Math.min(95, Math.max(35, Math.round(rawCoverage)));

  // Streetlight coverage estimated percentage
  const lightingCoveragePercent = Math.min(
    95,
    Math.max(20, Math.round((verifiedWorkingLights.length / Math.max(1, corridorLights.length || 2)) * 85))
  );

  // Generate transparent factor breakdowns
  const factors: FactorBreakdown[] = [];

  // Streetlight factor
  if (outageLights.length > 0) {
    factors.push({
      id: `light_${routeIndex}`,
      category: 'lighting',
      name: 'Streetlight Infrastructure',
      status: 'concern',
      summary: `${outageLights.length} streetlight outage(s) reported along this stretch`,
      details: `${outageLights.map((o) => o.segmentName).join(', ')}. Recent community reports note dim or unlit segments.`,
      source: 'community',
      lastUpdated: outageLights[0]?.lastReportedAt,
    });
  } else if (verifiedWorkingLights.length > 0) {
    factors.push({
      id: `light_${routeIndex}`,
      category: 'lighting',
      name: 'Streetlight Infrastructure',
      status: 'positive',
      summary: `${verifiedWorkingLights.length} verified illuminated segment(s)`,
      details: 'Recent civic maintenance records and community confirmations indicate active illumination.',
      source: verifiedWorkingLights[0]?.reportedSource || 'official',
      lastUpdated: verifiedWorkingLights[0]?.lastReportedAt,
    });
  } else {
    factors.push({
      id: `light_${routeIndex}`,
      category: 'lighting',
      name: 'Streetlight Infrastructure',
      status: 'unknown',
      summary: 'Streetlight status currently unknown for this corridor',
      details: 'No recent civic telemetry or community observations are recorded for lighting on this segment.',
      source: 'unknown',
    });
  }

  // Facility factor
  if (corridorFacilities.length > 0) {
    const womenFacilities = corridorFacilities.filter(
      (f) => f.category === 'womens_restroom' || f.hasFemaleStaff
    );
    factors.push({
      id: `fac_${routeIndex}`,
      category: 'facilities',
      name: 'Essential Services & Support Points',
      status: 'positive',
      summary: `${corridorFacilities.length} public facility point(s) within 180m`,
      details: `Includes ${corridorFacilities.map((f) => f.name).slice(0, 2).join(' and ')}${
        womenFacilities.length > 0 ? ' (women-specific services verified)' : ''
      }.`,
      source: corridorFacilities[0]?.source || 'official',
      lastUpdated: corridorFacilities[0]?.lastVerifiedAt,
    });
  } else {
    factors.push({
      id: `fac_${routeIndex}`,
      category: 'facilities',
      name: 'Essential Services & Support Points',
      status: 'neutral',
      summary: 'Few mapped essential services directly adjacent',
      details: 'No 24/7 pharmacies, police desks, or open public facilities recorded within immediate 180m corridor.',
      source: 'official',
    });
  }

  // Public Transport factor
  if (corridorTransport.length > 0) {
    const hasWomensCoach = corridorTransport.some((t) => t.hasWomensCoach);
    factors.push({
      id: `trn_${routeIndex}`,
      category: 'transport',
      name: 'Public Transport Access',
      status: 'positive',
      summary: `${corridorTransport.length} transit station(s) / stop(s) along route`,
      details: `${corridorTransport.map((t) => t.name).join(', ')}${
        hasWomensCoach ? ' (includes designated women’s coaches on rail/metro lines)' : ''
      }.`,
      source: 'official',
    });
  } else {
    factors.push({
      id: `trn_${routeIndex}`,
      category: 'transport',
      name: 'Public Transport Access',
      status: 'neutral',
      summary: 'Low direct public transit density along segment',
      details: 'Route relies primarily on independent pedestrian thoroughfare rather than major transit corridors.',
      source: 'official',
    });
  }

  // Disturbance & community factor
  if (corridorReports.length > 0) {
    factors.push({
      id: `rep_${routeIndex}`,
      category: 'community',
      name: 'Community Disturbance Reports',
      status: 'concern',
      summary: `${corridorReports.length} active community report(s) nearby`,
      details: corridorReports
        .map((r) => `${r.category.replace(/_/g, ' ')}: "${r.description.slice(0, 50)}..."`)
        .join('; '),
      source: 'community',
      lastUpdated: corridorReports[0]?.createdAt,
    });
  } else {
    factors.push({
      id: `rep_${routeIndex}`,
      category: 'community',
      name: 'Community Disturbance Reports',
      status: 'neutral',
      summary: 'No active disturbances reported in past 48 hours',
      details: 'Notice: Lack of community reports indicates absence of data, not guaranteed absence of incidents.',
      source: 'community',
    });
  }

  // Data coverage factor
  factors.push({
    id: `cov_${routeIndex}`,
    category: 'coverage',
    name: 'Data Confidence & Coverage',
    status: dataCoveragePercent >= 70 ? 'positive' : 'neutral',
    summary: `${dataCoveragePercent}% documented coverage (${100 - dataCoveragePercent}% unmapped/unknown)`,
    details:
      'Information reflects verified civic databases and recent community observations. Missing stretches are treated as unknown.',
    source: raw.source === 'osrm' ? 'official' : 'demo',
  });

  return {
    id: `route_${routeIndex}_${Date.now()}`,
    perspective: 'fastest', // Will be re-assigned by evaluateRoutes
    name: `Route Option ${routeIndex + 1}`,
    tagline: raw.summary,
    distanceMeters: raw.distanceMeters,
    durationSeconds: raw.durationSeconds,
    coordinates: raw.coordinates,
    summary: raw.summary,
    steps: raw.steps,
    factors,
    lightingCoveragePercent,
    verifiedLightCount: verifiedWorkingLights.length,
    outageReportCount: outageLights.length,
    nearbyFacilityCount: corridorFacilities.length,
    transportStopsNearby: corridorTransport.length,
    activeConcernsCount: corridorReports.length,
    dataCoveragePercent,
    relativeScoreDescription:
      corridorReports.length > 0
        ? 'Route has active community-reported concerns; consider better-supported alternative if walking late.'
        : verifiedWorkingLights.length > 0 && corridorFacilities.length > 0
        ? 'Route benefits from confirmed streetlight infrastructure and mapped public facilities.'
        : 'Standard route; partial infrastructure data recorded.',
    disclaimer:
      'HERPATH never guarantees complete safety. Data represents documented civic observations and community reports.',
  };
}
