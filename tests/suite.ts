import { evaluateRoutes } from '../src/services/route-context-engine';
import { RawRouteResult, generateSyntheticRouteAlternatives } from '../src/services/routing-service';
import { calculateDistanceMeters, formatDistance, formatDuration, isReportStale } from '../src/lib/utils';
import {
  INITIAL_STREETLIGHTS,
  INITIAL_REPORTS,
  INITIAL_FACILITIES,
  INITIAL_TRANSPORT_STOPS,
} from '../src/lib/mock-data';
import { RoutePreferences, CommunityReport } from '../src/types';
import { CivicReportingService } from '../src/services/civic-reporting-service';
import { getAllCivicCategories, getCivicCategory } from '../src/lib/civic-categories';
import { SOSService } from '../src/services/sos-service';
import { PoliceStationService } from '../src/services/police-station-service';
import { searchPlaces, reverseGeocode, PUNE_DEFAULT_COORDINATES } from '../src/services/geocoding-service';
import { isValidCoordinate, decodePolyline, parseRouteGeometry, validateRouteGeometry } from '../src/lib/geo-utils';

let passed = 0;
let failed = 0;

function assert(condition: boolean, testName: string) {
  if (condition) {
    console.log(`  ✓ PASS: ${testName}`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: ${testName}`);
    failed++;
  }
}

async function runTests() {
console.log('=== HERPATH AUTOMATED TEST SUITE ===\n');

// 1. Distance and Formatting Tests
console.log('1. Utility & Math Functions:');
const d1 = calculateDistanceMeters({ lat: 28.6328, lng: 77.2197 }, { lat: 28.6258, lng: 77.2345 });
assert(d1 > 1000 && d1 < 2500, `Calculated distance between Connaught Place and Mandi House is ${d1}m (expected ~1.6km)`);
assert(formatDistance(450) === '450 m', 'formatDistance(450) returns "450 m"');
assert(formatDistance(1750) === '1.8 km', 'formatDistance(1750) returns "1.8 km"');
assert(formatDuration(900) === '15 min', 'formatDuration(900) returns "15 min"');
assert(formatDuration(3900) === '1 hr 5 min', 'formatDuration(3900) returns "1 hr 5 min"');

// 2. Freshness Policy Tests
console.log('\n2. Freshness & Staleness Policy:');
const recentTime = new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(); // 4 hours ago
const staleTime = new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(); // 72 hours ago
assert(!isReportStale(recentTime, 24), '4-hour-old report is not stale (threshold 24h)');
assert(isReportStale(staleTime, 24), '72-hour-old report is marked stale (>24h)');

// 3. Routing Service Fallback & Corridor Alternatives
console.log('\n3. Routing Service & Corridors:');
const origin = { lat: 28.6328, lng: 77.2197 };
const dest = { lat: 28.6258, lng: 77.2345 };
const alternatives = generateSyntheticRouteAlternatives(origin, dest);
assert(alternatives.length === 3, `Generated exactly 3 corridor alternatives (received ${alternatives.length})`);
assert(alternatives[0].steps.length >= 1, 'Route 1 includes pedestrian steps');
assert(alternatives[1].distanceMeters > alternatives[0].distanceMeters, 'Alternative corridor 2 has realistic offset distance');

// 4. Route Context Engine Evaluation
console.log('\n4. Explainable Route Context Engine:');
const defaultPreferences: RoutePreferences = {
  preferWellLit: true,
  preferPublicTransport: true,
  preferEssentialFacilities: true,
  reduceIsolatedSegments: true,
  wheelchairAccessible: false,
};

const evaluated = evaluateRoutes(alternatives, {
  streetlights: INITIAL_STREETLIGHTS,
  reports: INITIAL_REPORTS,
  facilities: INITIAL_FACILITIES,
  transportStops: INITIAL_TRANSPORT_STOPS,
  preferences: defaultPreferences,
});

assert(evaluated.length === 3, 'Evaluates all 3 route candidates');
assert(evaluated[0].perspective === 'fastest', 'First route is assigned "fastest" perspective');
const perspectives = evaluated.map((r) => r.perspective);
assert(perspectives.includes('fastest'), 'Includes "fastest" perspective');
assert(perspectives.includes('better_supported'), 'Includes "better_supported" perspective');

// Check transparency factors
const firstRoute = evaluated[0];
assert(firstRoute.factors.length >= 4, `Route contains ${firstRoute.factors.length} distinct explainable factor cards`);
assert(firstRoute.dataCoveragePercent > 0 && firstRoute.dataCoveragePercent <= 100, `Data coverage percent is bounded: ${firstRoute.dataCoveragePercent}%`);
assert(!firstRoute.relativeScoreDescription.includes('100% safe'), 'Score description strictly obeys rule: NEVER labels 100% safe');
assert(firstRoute.disclaimer.length > 0, 'Mandatory advisory disclaimer is present');

// 5. Active Disturbance & Streetlight Outage Accounting
console.log('\n5. Safety Factor Accounting (Lighting & Disturbances):');
const routeWithOutages = evaluated.find((r) => r.outageReportCount > 0 || r.activeConcernsCount > 0);
assert(routeWithOutages !== undefined, 'At least one route segment intersects known outage or disturbance report');
if (routeWithOutages) {
  const lightingFactor = routeWithOutages.factors.find((f) => f.category === 'lighting');
  assert(lightingFactor !== undefined, 'Lighting factor is documented in route breakdown');
}

// 6. Duplicate Report Detection Tests
console.log('\n6. Duplicate Report Detection Service:');
const testReports: CommunityReport[] = [
  {
    id: 'dup_base_1',
    category: 'broken_streetlight',
    coordinates: { lat: 28.6330, lng: 77.2200 },
    locationName: 'Connaught Circus Block A',
    description: 'Streetlight pole #4 out of order, dark walkway',
    status: 'verified',
    source: 'community',
    upvotes: 5,
    flagCount: 0,
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 72).toISOString(),
  },
];

// Query candidate 25m away with matching category
const dupResult1 = CivicReportingService.detectDuplicates(
  {
    category: 'broken_streetlight',
    coordinates: { lat: 28.6331, lng: 77.2201 }, // ~15m away
    description: 'Streetlamp completely unlit near Block A',
    locationName: 'Near Block A circle',
  },
  testReports,
  80
);
assert(dupResult1.hasLikelyDuplicate === true, 'Detects nearby report with identical category as duplicate (15m away)');
assert(dupResult1.matches[0].similarityScore >= 0.5, `Duplicate similarity score is high (${dupResult1.matches[0].similarityScore})`);

// Query candidate 500m away (outside radius)
const dupResult2 = CivicReportingService.detectDuplicates(
  {
    category: 'broken_streetlight',
    coordinates: { lat: 28.6380, lng: 77.2250 }, // ~500m away
    description: 'Streetlamp completely unlit',
    locationName: 'Far away point',
  },
  testReports,
  80
);
assert(dupResult2.hasLikelyDuplicate === false, 'Rejects distant report as duplicate (>80m away)');

// 7. Civic Report Lifecycle & Role Permissions
console.log('\n7. Civic Report Lifecycle & Role Permissions:');
const sampleReport: CommunityReport = {
  id: 'rep_lifecycle_test',
  category: 'broken_footpath',
  coordinates: { lat: 28.6300, lng: 77.2250 },
  locationName: 'KG Marg Crossing',
  description: 'Missing drain cover on pedestrian footpath',
  status: 'pending',
  source: 'community',
  upvotes: 2,
  flagCount: 0,
  createdAt: new Date().toISOString(),
  expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 72).toISOString(),
};

// Ordinary user cannot verify reports
const userVerifyAttempt = CivicReportingService.canTransition(
  sampleReport.status,
  'verified',
  { role: 'user' }
);
assert(userVerifyAttempt.allowed === false, 'Ordinary user is denied permission to verify reports');

// Authorized reviewer can transition pending -> under_review
const reviewerReviewTransition = CivicReportingService.transitionStatus(
  sampleReport,
  'under_review',
  { role: 'reviewer', name: 'Officer Verma' },
  'Inspecting field photos'
);
assert(reviewerReviewTransition.success === true, 'Reviewer can transition pending -> under_review');
assert(reviewerReviewTransition.updatedReport?.status === 'under_review', 'Report status updated to under_review');
assert(reviewerReviewTransition.updatedReport?.statusHistory?.length === 1, 'Status transition history recorded');

// Reviewer can transition under_review -> verified
const reviewerVerifyTransition = CivicReportingService.transitionStatus(
  reviewerReviewTransition.updatedReport!,
  'verified',
  { role: 'reviewer', name: 'Officer Verma' },
  'Evidence verified against road database'
);
assert(reviewerVerifyTransition.success === true, 'Reviewer can transition under_review -> verified');
assert(reviewerVerifyTransition.updatedReport?.status === 'verified', 'Report status updated to verified');
assert(reviewerVerifyTransition.updatedReport?.reviewedBy === 'Officer Verma', 'Reviewer identity recorded in verified audit');

// Reviewer can transition verified -> resolved
const reviewerResolveTransition = CivicReportingService.transitionStatus(
  reviewerVerifyTransition.updatedReport!,
  'resolved',
  { role: 'reviewer', name: 'Civic Works Crew' },
  'Replacement slab installed and checked'
);
assert(reviewerResolveTransition.success === true, 'Reviewer can transition verified -> resolved');
assert(reviewerResolveTransition.updatedReport?.status === 'resolved', 'Report status updated to resolved');

// 8. Dispute Flagging & Re-review Trigger
console.log('\n8. Dispute Flagging & Re-review Trigger:');
let disputedReport = reviewerVerifyTransition.updatedReport!; // currently verified
disputedReport = CivicReportingService.flagReport(disputedReport, 'outdated', 'Fixed this morning', 'user');
assert(disputedReport.flagCount === 1, 'First flag increments flag count');
assert(disputedReport.status === 'verified', 'Report remains verified on single flag');

// Second flag should trigger auto-return to under_review
disputedReport = CivicReportingService.flagReport(disputedReport, 'incorrect', 'Location is wrong', 'user');
assert(disputedReport.flagCount === 2, 'Second flag increments flag count to 2');
assert(disputedReport.status === 'under_review', 'Multiple flags auto-trigger return to under_review for re-audit');

// 9. Category-Specific Freshness Policy
console.log('\n9. Category-Specific Freshness Thresholds:');
const pedObstruction = getCivicCategory('pedestrian_obstruction');
const streetLightCat = getCivicCategory('broken_streetlight');
assert(pedObstruction.defaultFreshnessHours === 24, 'Temporary obstruction expires after 24 hours');
assert(streetLightCat.defaultFreshnessHours === 168, 'Streetlight infrastructure defect lasts 7 days (168h)');

const obstructionReport: CommunityReport = {
  id: 'rep_freshness_test',
  category: 'pedestrian_obstruction',
  coordinates: { lat: 28.6328, lng: 77.2197 },
  locationName: 'Test Way',
  description: 'Debris pile',
  status: 'verified',
  source: 'community',
  upvotes: 1,
  flagCount: 0,
  createdAt: new Date(Date.now() - 1000 * 60 * 60 * 30).toISOString(), // 30 hours ago (>24h)
  expiresAt: new Date().toISOString(),
};
const stalenessCheck = CivicReportingService.checkStaleness(obstructionReport);
assert(stalenessCheck.isStale === true, '30-hour old pedestrian obstruction is marked stale (>24h)');

// 10. Photo Evidence Attachment Validation
console.log('\n10. Photo Evidence Attachment Validation:');
const validPhoto = CivicReportingService.validatePhotoAttachment({
  name: 'damaged_pavement.jpg',
  size: 2 * 1024 * 1024, // 2MB
  type: 'image/jpeg',
});
assert(validPhoto.valid === true, 'Valid 2MB JPEG photo passes validation');
assert(validPhoto.sanitizedName === 'damaged_pavement.jpg', 'Sanitizes file name safely');

const oversizedPhoto = CivicReportingService.validatePhotoAttachment({
  name: 'huge_image.png',
  size: 8 * 1024 * 1024, // 8MB (>5MB)
  type: 'image/png',
});
assert(oversizedPhoto.valid === false, 'Rejects photo exceeding 5MB limit');

const invalidMimePhoto = CivicReportingService.validatePhotoAttachment({
  name: 'script.exe',
  size: 1024,
  type: 'application/x-msdownload',
});
assert(invalidMimePhoto.valid === false, 'Rejects non-image file type');

// 11. Single Usable Route Handling
console.log('\n11. Single Usable Route Handling:');
const singleRawRoute: RawRouteResult[] = [alternatives[0]];
const singleEvaluated = evaluateRoutes(singleRawRoute, {
  streetlights: INITIAL_STREETLIGHTS,
  reports: INITIAL_REPORTS,
  facilities: INITIAL_FACILITIES,
  transportStops: INITIAL_TRANSPORT_STOPS,
  preferences: defaultPreferences,
});
assert(singleEvaluated.length === 1, 'Returns exactly 1 route when only 1 is provided');
assert(singleEvaluated[0].isOnlyAvailableRoute === true, 'Marks isOnlyAvailableRoute = true');
assert(singleEvaluated[0].recommendationRationale?.includes('Only one usable') === true, 'Truthful rationale explains single route without fabricating comparisons');

// 12. Corridor Duplicate Report Deduplication
console.log('\n12. Corridor Duplicate Report Deduplication:');
const corridorWithDups: CommunityReport[] = [
  {
    id: 'rep_orig',
    category: 'broken_streetlight',
    coordinates: { lat: 28.6320, lng: 77.2210 },
    locationName: 'Connaught Circle Pole #10',
    description: 'Broken lamp',
    status: 'verified',
    source: 'community',
    upvotes: 4,
    flagCount: 0,
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 48).toISOString(),
  },
  {
    id: 'rep_dup',
    duplicateOfId: 'rep_orig', // Linked duplicate
    category: 'broken_streetlight',
    coordinates: { lat: 28.6321, lng: 77.2211 },
    locationName: 'Connaught Circle Pole #10 (Dupe)',
    description: 'Also saw dark pole here',
    status: 'verified',
    source: 'community',
    upvotes: 2,
    flagCount: 0,
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 48).toISOString(),
  },
];

const evaluatedWithDups = evaluateRoutes(alternatives, {
  streetlights: [],
  reports: corridorWithDups,
  facilities: [],
  transportStops: [],
  preferences: defaultPreferences,
});
// Check that duplicate was not double-counted
const routeWithDupCheck = evaluatedWithDups[0];
assert(routeWithDupCheck.activeConcernsCount === 1, `Corridor reports deduplicated: count is ${routeWithDupCheck.activeConcernsCount} (expected 1, not 2)`);

// 13. Resolved Report Accounting in Routes
console.log('\n13. Resolved Report Accounting in Routes:');
const reportsWithResolved: CommunityReport[] = [
  {
    id: 'rep_resolved_item',
    category: 'broken_footpath',
    coordinates: { lat: 28.6320, lng: 77.2210 },
    locationName: 'Repaired Sidewalk',
    description: 'Tiles repaired',
    status: 'resolved',
    source: 'community',
    upvotes: 6,
    flagCount: 0,
    createdAt: new Date().toISOString(),
    expiresAt: new Date().toISOString(),
  },
];
const evaluatedWithResolved = evaluateRoutes(alternatives, {
  streetlights: [],
  reports: reportsWithResolved,
  facilities: [],
  transportStops: [],
  preferences: defaultPreferences,
});
assert(evaluatedWithResolved[0].activeConcernsCount === 0, 'Resolved reports are not counted as active hazards');

// 14. "Why this route?" Detailed Breakdown Verification
console.log('\n14. "Why this route?" Detailed Breakdown Verification:');
const alternativeRoute = evaluated[1];
assert(alternativeRoute.tradeOff !== undefined, 'Alternative route contains explicit tradeOff object');
assert(alternativeRoute.tradeOff?.headlineTradeOff.length! > 0, `Headline trade-off is populated: "${alternativeRoute.tradeOff?.headlineTradeOff}"`);
assert((alternativeRoute.recommendationRationale || '').length > 0, `Recommendation rationale is clear: "${alternativeRoute.recommendationRationale}"`);
if (alternativeRoute.nearbyFacilitiesWithDistance && alternativeRoute.nearbyFacilitiesWithDistance.length > 0) {
  const firstFac = alternativeRoute.nearbyFacilitiesWithDistance[0];
  assert(firstFac.distanceMeters >= 0, `Nearby facility distance is reliably calculated in meters (${firstFac.distanceMeters}m to ${firstFac.facility.name})`);
}

// 15. SOS Triple-Tap Detection Window & Resets
console.log('\n15. SOS Triple-Tap Detection Window & Resets:');
SOSService.resetTaps();
const t0 = 100000;
const tap1 = SOSService.registerTap(t0);
assert(!tap1.isTriggered && tap1.tapCount === 1, 'One tap does NOT trigger SOS (tapCount: 1)');

const tap2 = SOSService.registerTap(t0 + 400); // 400ms later
assert(!tap2.isTriggered && tap2.tapCount === 2, 'Two taps do NOT trigger SOS (tapCount: 2)');

const tap3 = SOSService.registerTap(t0 + 800); // 800ms later (within 2s window)
assert(tap3.isTriggered && tap3.tapCount === 3, 'Three taps within 2s window activate Emergency SOS (isTriggered: true)');

// Taps separated by > 2000ms reset
SOSService.resetTaps();
const tapSeparate1 = SOSService.registerTap(t0);
const tapSeparate2 = SOSService.registerTap(t0 + 2500); // 2.5s later, window expired
assert(!tapSeparate2.isTriggered && tapSeparate2.tapCount === 1, 'Taps separated by >2000ms reset tap counter safely');

// 16. SOS Emergency Event Lifecycle
console.log('\n16. SOS Emergency Event Lifecycle:');
const testCoords = { lat: 28.6328, lng: 77.2197 };
const event = SOSService.createEvent(testCoords, 12, 'triple_tap', true);
assert(event.status === 'countdown', 'New SOS event enters initial countdown state (status: "countdown")');
assert(event.triggerMethod === 'triple_tap', 'SOS event records triggerMethod as "triple_tap"');

SOSService.updateEventStatus(event.id, 'active');
const updatedActive = SOSService.getEvents().find((e) => e.id === event.id);
assert(updatedActive?.status === 'active', 'SOS event successfully transitions from countdown to active');

SOSService.updateEventStatus(event.id, 'resolved');
const updatedResolved = SOSService.getEvents().find((e) => e.id === event.id);
assert(updatedResolved?.status === 'resolved' && Boolean(updatedResolved?.resolvedAt), 'SOS event successfully records resolution and resolvedAt timestamp');

// 17. Nearby Police Station Discovery Service
console.log('\n17. Nearby Police Station Discovery Service:');
const stations = PoliceStationService.getFallbackStations(testCoords);
assert(stations.length >= 3, `Returned ${stations.length} verified police stations`);
assert(stations[0].distanceMeters! <= stations[1].distanceMeters!, 'Police stations are sorted by distance ascending');
const firstStation = stations[0];
assert(firstStation.isVerifiedPhone === true && Boolean(firstStation.phone), `Station "${firstStation.name}" has verified official telephone (${firstStation.phone})`);
assert(firstStation.openingHours?.includes('24/7') === true, 'Police station indicates 24/7 emergency service');

// 18. Community Reporting System & Category Completeness
console.log('\n18. Community Reporting System & Category Completeness:');
const allCats = getAllCivicCategories();
assert(allCats.some((c) => c.id === 'broken_streetlight'), 'Supports Broken Streetlight category');
assert(allCats.some((c) => c.id === 'harassment_risk'), 'Supports Harassment / Threatening Behavior category');
assert(allCats.some((c) => c.id === 'suspicious_activity'), 'Supports Suspicious / Concerning Activity category');
assert(allCats.some((c) => c.id === 'isolated_area'), 'Supports Isolated / Low Pedestrian Activity category');
assert(allCats.some((c) => c.id === 'broken_footpath'), 'Supports Damaged Footpath category');
assert(allCats.some((c) => c.id === 'road_damage'), 'Supports Road Damage category');

const suspCat = getCivicCategory('suspicious_activity');
assert(suspCat.defaultFreshnessHours === 24, 'Temporary suspicious activity has 24h freshness window');

const stlCat = getCivicCategory('broken_streetlight');
assert(stlCat.defaultFreshnessHours === 168, 'Streetlight infrastructure failure persists 7 days (168h)');

// 19. Pune Geocoding & Emergency Directory
console.log('\n19. Pune Geocoding & Emergency Directory:');
const puneStations = PoliceStationService.getFallbackStations(PUNE_DEFAULT_COORDINATES);
assert(puneStations.length >= 3, `Returned ${puneStations.length} verified police stations for Pune`);
assert(puneStations[0].distanceMeters! < 10000, `Closest Pune police station is nearby (${puneStations[0].distanceMeters}m), not 1000km away`);
assert(puneStations.some((s) => s.name.includes('Shivajinagar') || s.name.includes('Swargate')), 'Pune emergency directory includes authentic local stations');

const emptyResults = await searchPlaces(' ');
assert(emptyResults.length === 0, 'Single-character or empty query returns 0 results without crashing');

const shortResults = await searchPlaces('a');
assert(shortResults.length === 0, 'Query shorter than 2 chars returns empty array');

const katrajCoords = { lat: 18.4537, lng: 73.8563 };
const resolvedAddress = await reverseGeocode(katrajCoords);
assert(resolvedAddress.length > 0 && !resolvedAddress.includes('Janpath'), 'Reverse geocoding resolves without returning hardcoded Delhi presets');

// 20. Real Pune Pedestrian Routing
console.log('\n20. Pune Pedestrian Corridor Routing:');
const katraj = { lat: 18.4537, lng: 73.8563 };
const bibwewadi = { lat: 18.4752, lng: 73.8562 };
const puneRoutesRaw = generateSyntheticRouteAlternatives(katraj, bibwewadi);
assert(puneRoutesRaw.length === 3, `Generated ${puneRoutesRaw.length} route alternatives in Pune`);
assert(puneRoutesRaw[0].coordinates[0][0] >= 18.4 && puneRoutesRaw[0].coordinates[0][0] <= 18.5, 'Route geometry coordinates correspond to authentic Pune latitude');
assert(puneRoutesRaw[0].coordinates[0][1] >= 73.8 && puneRoutesRaw[0].coordinates[0][1] <= 73.9, 'Route geometry coordinates correspond to authentic Pune longitude');
const evaluatedPune = evaluateRoutes(puneRoutesRaw, {
  streetlights: [],
  reports: [],
  facilities: [],
  transportStops: [],
  preferences: defaultPreferences,
});
assert(evaluatedPune.length === 3, 'Successfully evaluated Pune walking routes');
assert(evaluatedPune[0].distanceMeters > 0 && evaluatedPune[0].durationSeconds > 0, 'Route duration and distance metrics are real and positive');

// 21. Geospatial Validation & Truthful Single-Route Guarantees
console.log('\n21. Geospatial Validation & Single-Route Handling:');
assert(isValidCoordinate({ lat: 18.5204, lng: 73.8567 }) === true, 'isValidCoordinate returns true for valid Pune coordinates');
assert(isValidCoordinate({ lat: '18.5', lng: 73.8 }) === false, 'isValidCoordinate rejects string types');
assert(isValidCoordinate({ lat: 95, lng: 73 }) === false, 'isValidCoordinate rejects latitude > 90');
assert(isValidCoordinate({ lat: 18, lng: 190 }) === false, 'isValidCoordinate rejects longitude > 180');
assert(isValidCoordinate(null) === false, 'isValidCoordinate rejects null');
assert(isValidCoordinate({ lat: NaN, lng: 73 }) === false, 'isValidCoordinate rejects NaN');

// Test GeoJSON LineString coordinate parser
const geoJsonSample = {
  type: 'LineString',
  coordinates: [
    [73.8567, 18.5204],
    [73.8580, 18.5220],
  ],
};
const parsedCoords = parseRouteGeometry(geoJsonSample);
assert(parsedCoords.length === 2, 'parseRouteGeometry successfully extracts points from GeoJSON LineString');
assert(parsedCoords[0][0] === 18.5204 && parsedCoords[0][1] === 73.8567, 'parseRouteGeometry correctly swaps [lng, lat] to Leaflet [lat, lng]');

// Test polyline decoder
const encodedTest = '_p~iF~ps|U_ulLnnqC_mqNvxq`@';
const decodedPoints = decodePolyline(encodedTest, 5);
assert(decodedPoints.length > 0, `decodePolyline extracted ${decodedPoints.length} points from encoded string`);

// Test validateRouteGeometry
const originCoord = { lat: 18.5204, lng: 73.8567 };
const destCoord = { lat: 18.5220, lng: 73.8580 };
assert(validateRouteGeometry(parsedCoords, originCoord, destCoord) === true, 'validateRouteGeometry confirms points connect near origin and destination');
assert(validateRouteGeometry([[0, 0]], originCoord, destCoord) === false, 'validateRouteGeometry rejects routes with less than 2 points');

// Test Truthful Single-Route: When 1 raw route is provided, engine preserves single route with isOnlyAvailableRoute
const truthfulSingleRoute: RawRouteResult = {
  source: 'osrm',
  distanceMeters: 1200,
  durationSeconds: 840,
  coordinates: parsedCoords,
  summary: 'via Gokhale Road',
  steps: [{ instruction: 'Head north on Gokhale Road', distanceMeters: 1200, durationSeconds: 840, coordinates: parsedCoords[0] }],
};
const evaluatedSingle = evaluateRoutes([truthfulSingleRoute], {
  streetlights: [],
  reports: [],
  facilities: [],
  transportStops: [],
  preferences: defaultPreferences,
});
assert(evaluatedSingle.length === 1, 'evaluateRoutes preserves exactly 1 route when routing provider yields 1 route');
assert(evaluatedSingle[0].isOnlyAvailableRoute === true, 'Route has isOnlyAvailableRoute = true flag for truthful UI disclosure');
assert(evaluatedSingle[0].perspective === 'fastest', 'Single route receives "fastest" perspective');

// 22. Summary
console.log(`\n========================================`);
console.log(`TEST RESULTS: ${passed} passed, ${failed} failed.`);
console.log(`========================================\n`);

process.exitCode = failed > 0 ? 1 : 0;
}

runTests();
