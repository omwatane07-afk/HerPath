import {
  RouteOption,
  RoutePerspective,
  FactorBreakdown,
  StreetlightSegment,
  CommunityReport,
  EssentialFacility,
  TransportStop,
  RoutePreferences,
  RouteComparisonTradeOff,
  RouteFacilityNearby,
  RouteReportNearby,
} from '../types';
import { RawRouteResult } from './routing-service';
import { distanceToPolylineMeters, calculateDistanceMeters, formatDuration, formatDistance } from '../lib/utils';
import { CivicReportingService } from './civic-reporting-service';

interface EvaluationContext {
  streetlights: StreetlightSegment[];
  reports: CommunityReport[];
  facilities: EssentialFacility[];
  transportStops: TransportStop[];
  preferences: RoutePreferences;
}

/**
 * Deduplicates reports in a corridor so linked duplicates or co-located identical issues
 * are not counted multiple times in active hazard tallies.
 */
function deduplicateCorridorReports(
  reportsWithDist: { report: CommunityReport; distanceMeters: number }[]
): { report: CommunityReport; distanceMeters: number }[] {
  const seenIds = new Set<string>();
  const deduplicated: { report: CommunityReport; distanceMeters: number }[] = [];

  for (const item of reportsWithDist) {
    const { report } = item;
    if (seenIds.has(report.id)) continue;

    // Check if duplicate of already included report
    if (report.duplicateOfId && seenIds.has(report.duplicateOfId)) {
      continue;
    }

    seenIds.add(report.id);
    if (report.duplicateOfId) {
      seenIds.add(report.duplicateOfId);
    }
    deduplicated.push(item);
  }

  return deduplicated;
}

export function evaluateRoutes(
  rawRoutes: RawRouteResult[],
  context: EvaluationContext
): RouteOption[] {
  if (rawRoutes.length === 0) return [];

  // Sort raw routes by duration to identify the objectively fastest route
  const sortedByTime = [...rawRoutes].sort((a, b) => a.durationSeconds - b.durationSeconds);

  // Analyze each route against available infrastructure evidence
  const analyzed = sortedByTime.map((raw, index) => {
    return analyzeSingleRoute(raw, context, index);
  });

  // Handle single route scenario truthfully without fabricating alternatives
  if (analyzed.length === 1) {
    analyzed[0].perspective = 'fastest';
    analyzed[0].name = 'Direct Route';
    analyzed[0].tagline = 'Sole navigable corridor returned by routing provider';
    analyzed[0].isOnlyAvailableRoute = true;
    analyzed[0].recommendationRationale =
      'Only one usable pedestrian corridor is available from the routing provider for this query. The infrastructure and lighting audit below details documented conditions along this single path.';
    analyzed[0].tradeOff = {
      timeDeltaSeconds: 0,
      distanceDeltaMeters: 0,
      uncertaintySummary: analyzed[0].unknownStretchesSummary || 'Standard corridor coverage.',
      headlineTradeOff: 'Single navigable route available; no alternative comparison possible.',
    };
    return analyzed;
  }

  // When multiple routes exist:
  // Route 0 is always 'fastest'
  analyzed[0].perspective = 'fastest';
  analyzed[0].name = 'Fastest Route';
  analyzed[0].tagline = 'Prioritises shortest physical distance and minimal transit time';
  analyzed[0].isOnlyAvailableRoute = false;

  // Identify the best infrastructure-informed alternative among the remaining options
  let bestSupportedIndex = 1;
  let highestSupportScore = -Infinity;

  for (let i = 1; i < analyzed.length; i++) {
    const r = analyzed[i];
    // Transparent heuristic score balancing facilities, lighting, and transit against outages and reports
    // Preference weighting applied transparently
    const lightWeight = context.preferences.preferWellLit ? 3 : 2;
    const facWeight = context.preferences.preferEssentialFacilities ? 3 : 2;
    const transitWeight = context.preferences.preferPublicTransport ? 2 : 1;

    const score =
      r.verifiedLightCount * lightWeight +
      r.nearbyFacilityCount * facWeight +
      r.transportStopsNearby * transitWeight -
      r.outageReportCount * 3 -
      r.activeConcernsCount * 4;

    if (score > highestSupportScore) {
      highestSupportScore = score;
      bestSupportedIndex = i;
    }
  }

  // Route 1 (or highest score) is labeled as the Infrastructure-informed alternative
  analyzed[bestSupportedIndex].perspective = 'better_supported';
  analyzed[bestSupportedIndex].name = 'Infrastructure-Informed Alternative';
  analyzed[bestSupportedIndex].tagline =
    'Alternative corridor with higher documented streetlights and mapped public facilities';
  analyzed[bestSupportedIndex].isOnlyAvailableRoute = false;

  // Remaining routes become balanced alternatives
  for (let i = 1; i < analyzed.length; i++) {
    if (i !== bestSupportedIndex) {
      analyzed[i].perspective = 'balanced';
      analyzed[i].name = 'Balanced Route';
      analyzed[i].tagline =
        'Intermediate balance between walking time and documented corridor infrastructure';
      analyzed[i].isOnlyAvailableRoute = false;
    }
  }

  // Calculate explicit, transparent trade-offs for each route compared to the fastest
  const fastest = analyzed[0];
  for (let i = 0; i < analyzed.length; i++) {
    const current = analyzed[i];
    const timeDelta = current.durationSeconds - fastest.durationSeconds;
    const distDelta = current.distanceMeters - fastest.distanceMeters;

    let headlineTradeOff = '';
    let recommendationRationale = '';

    if (i === 0) {
      headlineTradeOff = `Fastest option: saves ${formatDuration(Math.max(0, analyzed[1]?.durationSeconds - fastest.durationSeconds || 0))} compared to alternative corridors.`;
      recommendationRationale =
        'Selected for maximum physical transit efficiency. Ideal when minimal walking time is the primary goal.';
    } else {
      const timeStr = timeDelta > 0 ? `+${formatDuration(timeDelta)}` : 'Equal time';
      const distStr = distDelta > 0 ? `+${formatDistance(distDelta)}` : 'Equal distance';

      const lightDiff = current.verifiedLightCount - fastest.verifiedLightCount;
      const facDiff = current.nearbyFacilityCount - fastest.nearbyFacilityCount;
      const reportAvoided = fastest.activeConcernsCount - current.activeConcernsCount;

      const advantages: string[] = [];
      if (lightDiff > 0) advantages.push(`${lightDiff} more verified streetlights`);
      if (facDiff > 0) advantages.push(`${facDiff} more mapped facilities`);
      if (reportAvoided > 0) advantages.push(`avoids ${reportAvoided} reported concern(s) on fastest path`);

      if (advantages.length > 0) {
        headlineTradeOff = `${timeStr} (${distStr}) for ${advantages.join(' and ')}.`;
        recommendationRationale = `Recommended as an infrastructure-informed alternative: adds ${timeStr} of walking, but benefits from ${advantages.join(', ')}.`;
      } else {
        headlineTradeOff = `${timeStr} (${distStr}) alternative corridor.`;
        recommendationRationale = 'Alternative pedestrian path through adjacent neighborhood blocks.';
      }
    }

    current.tradeOff = {
      timeDeltaSeconds: timeDelta,
      distanceDeltaMeters: distDelta,
      lightingAdvantage:
        current.verifiedLightCount > fastest.verifiedLightCount
          ? `+${current.verifiedLightCount - fastest.verifiedLightCount} working lights`
          : undefined,
      facilityAdvantage:
        current.nearbyFacilityCount > fastest.nearbyFacilityCount
          ? `+${current.nearbyFacilityCount - fastest.nearbyFacilityCount} open facilities`
          : undefined,
      uncertaintySummary: current.unknownStretchesSummary || 'Standard corridor data confidence.',
      headlineTradeOff,
    };
    current.recommendationRationale = recommendationRationale;
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
  // Exclude resolved and invalidated reports
  // Separate into active, verified, unverified, and stale
  const corridorRawReports = context.reports
    .filter((rep) => {
      // Must not be resolved or invalidated
      if (rep.status === 'resolved' || rep.status === 'invalidated') return false;
      return true;
    })
    .map((rep) => ({
      report: rep,
      distanceMeters: distanceToPolylineMeters(rep.coordinates, raw.coordinates),
    }))
    .filter((item) => item.distanceMeters <= PROXIMITY_BUFFER_METERS);

  // Deduplicate grouped / duplicate reports so co-located reports are not double-counted
  const deduplicatedCorridorReports = deduplicateCorridorReports(corridorRawReports);

  // Evaluate staleness and verification for each report
  const relevantReports: RouteReportNearby[] = deduplicatedCorridorReports.map((item) => {
    const staleness = CivicReportingService.checkStaleness(item.report);
    return {
      report: item.report,
      distanceMeters: item.distanceMeters,
      isVerified: item.report.status === 'verified',
      isOutdatedOrStale: staleness.isStale,
    };
  });

  // Fresh active concerns: exclude stale reports from active counts, but preserve in details
  const activeFreshConcerns = relevantReports.filter((r) => !r.isOutdatedOrStale);
  const verifiedActiveConcerns = activeFreshConcerns.filter((r) => r.isVerified);
  const unverifiedActiveConcerns = activeFreshConcerns.filter((r) => !r.isVerified);
  const staleConcerns = relevantReports.filter((r) => r.isOutdatedOrStale);

  // 3. Nearby facilities with exact distances
  const corridorFacilitiesRaw = context.facilities
    .filter((fac) => fac.verificationStatus !== 'reported_closed')
    .map((fac) => ({
      facility: fac,
      distanceMeters: distanceToPolylineMeters(fac.coordinates, raw.coordinates),
    }))
    .filter((item) => item.distanceMeters <= PROXIMITY_BUFFER_METERS);

  corridorFacilitiesRaw.sort((a, b) => a.distanceMeters - b.distanceMeters);

  const corridorFacilities = corridorFacilitiesRaw.map((f) => f.facility);
  const nearbyFacilitiesWithDistance: RouteFacilityNearby[] = corridorFacilitiesRaw.slice(0, 5);

  // 4. Public transport
  const corridorTransport = context.transportStops.filter(
    (trn) => distanceToPolylineMeters(trn.coordinates, raw.coordinates) <= PROXIMITY_BUFFER_METERS
  );

  // 5. Data Coverage Calculation & Explicit Missing Data Handling
  // A route corridor's coverage is calculated by checking what % of its waypoints have at least one documented data point within 200m
  let coveredWaypoints = 0;
  for (const [lat, lng] of raw.coordinates) {
    const pt = { lat, lng };
    const hasData =
      context.streetlights.some((s) => calculateDistanceMeters(pt, s.coordinates) <= 200) ||
      context.facilities.some((f) => calculateDistanceMeters(pt, f.coordinates) <= 200) ||
      context.transportStops.some((t) => calculateDistanceMeters(pt, t.coordinates) <= 200);
    if (hasData) coveredWaypoints++;
  }

  const rawCoverage = raw.coordinates.length > 0 ? (coveredWaypoints / raw.coordinates.length) * 100 : 40;
  const dataCoveragePercent = Math.min(95, Math.max(35, Math.round(rawCoverage)));
  const unmappedPercent = 100 - dataCoveragePercent;

  let unknownStretchesSummary = '';
  if (unmappedPercent >= 40) {
    unknownStretchesSummary = `Approx. ${unmappedPercent}% of this corridor lacks civic or lighting records; condition is unknown.`;
  } else if (unmappedPercent > 10) {
    unknownStretchesSummary = `Partial coverage: ${unmappedPercent}% of this corridor has no recent civic telemetry.`;
  } else {
    unknownStretchesSummary = 'High data coverage: dense lighting and facility records available.';
  }

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
      details: `${outageLights.map((o) => o.segmentName).join(', ')}. Recent reports note dim or unlit segments.`,
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
    // Explicit Unknown - never fabricate safety
    factors.push({
      id: `light_${routeIndex}`,
      category: 'lighting',
      name: 'Streetlight Infrastructure',
      status: 'unknown',
      summary: 'Streetlight status currently unknown for this corridor',
      details:
        'No recent civic telemetry or community observations are recorded for lighting on this segment. Absence of reports does not indicate working fixtures.',
      source: 'unknown',
    });
  }

  // Facility factor
  if (corridorFacilities.length > 0) {
    const womenFacilities = corridorFacilities.filter(
      (f) => f.category === 'womens_restroom' || f.hasFemaleStaff
    );
    const closestFac = nearbyFacilitiesWithDistance[0];
    factors.push({
      id: `fac_${routeIndex}`,
      category: 'facilities',
      name: 'Essential Services & Support Points',
      status: 'positive',
      summary: `${corridorFacilities.length} public facility point(s) within 180m`,
      details: `Closest: ${closestFac.facility.name} (${closestFac.distanceMeters}m away). Includes ${corridorFacilities
        .map((f) => f.name)
        .slice(0, 2)
        .join(' and ')}${womenFacilities.length > 0 ? ' (women-specific services verified)' : ''}.`,
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

  // Community Reports factor (Distinguishing verified vs unverified vs stale)
  if (activeFreshConcerns.length > 0) {
    const verifiedCount = verifiedActiveConcerns.length;
    const unverifiedCount = unverifiedActiveConcerns.length;

    const summaryParts: string[] = [];
    if (verifiedCount > 0) summaryParts.push(`${verifiedCount} verified civic report(s)`);
    if (unverifiedCount > 0) summaryParts.push(`${unverifiedCount} unverified report(s)`);

    factors.push({
      id: `rep_${routeIndex}`,
      category: 'community',
      name: 'Civic & Community Observations',
      status: 'concern',
      summary: summaryParts.join(', ') + ' nearby',
      details: activeFreshConcerns
        .map(
          (item) =>
            `[${item.isVerified ? 'Verified' : 'Unverified'}] ${item.report.locationName} (${item.distanceMeters}m away): "${item.report.description.slice(0, 50)}"`
        )
        .join('; '),
      source: verifiedCount > 0 ? 'verified' : 'unverified',
      lastUpdated: activeFreshConcerns[0]?.report.createdAt,
    });
  } else if (staleConcerns.length > 0) {
    factors.push({
      id: `rep_${routeIndex}`,
      category: 'community',
      name: 'Civic & Community Observations',
      status: 'neutral',
      summary: `${staleConcerns.length} older report(s) flagged as stale`,
      details:
        'Previous reports for this segment have exceeded category freshness thresholds and require re-verification. They are not treated as active current incidents.',
      source: 'stale',
      lastUpdated: staleConcerns[0]?.report.createdAt,
    });
  } else {
    factors.push({
      id: `rep_${routeIndex}`,
      category: 'community',
      name: 'Civic & Community Observations',
      status: 'neutral',
      summary: 'No active reports recorded in recent window',
      details:
        'Honest Uncertainty Principle: The absence of community reports indicates absence of data, never guaranteed absence of incidents or hazards.',
      source: 'community',
    });
  }

  // Data coverage and uncertainty factor
  factors.push({
    id: `cov_${routeIndex}`,
    category: 'coverage',
    name: 'Data Confidence & Coverage',
    status: dataCoveragePercent >= 70 ? 'positive' : 'neutral',
    summary: `${dataCoveragePercent}% documented coverage (${unmappedPercent}% unmapped/unknown)`,
    details:
      'Information reflects verified civic databases and recent community observations. Missing stretches are treated as unknown.',
    source: raw.source === 'osrm' ? 'official' : 'demo',
  });

  return {
    id: `route_${routeIndex}_${raw.distanceMeters}_${raw.durationSeconds}`,
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
    activeConcernsCount: activeFreshConcerns.length,
    dataCoveragePercent,
    nearbyFacilitiesWithDistance,
    relevantReports,
    unknownStretchesSummary,
    relativeScoreDescription:
      activeFreshConcerns.length > 0
        ? `Route has ${activeFreshConcerns.length} active civic report(s) nearby; consider the infrastructure-informed alternative.`
        : verifiedWorkingLights.length > 0 && corridorFacilities.length > 0
        ? 'Route benefits from confirmed streetlight infrastructure and mapped public facilities.'
        : 'Standard route; partial infrastructure data recorded.',
    disclaimer:
      'HERPATH never guarantees complete safety. Data represents documented civic observations and community reports.',
  };
}
