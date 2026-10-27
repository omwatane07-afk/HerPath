import { evaluateRoutes } from '../src/services/route-context-engine';
import { RawRouteResult, generateSyntheticRouteAlternatives } from '../src/services/routing-service';
import { calculateDistanceMeters, formatDistance, formatDuration, isReportStale } from '../src/lib/utils';
import {
  INITIAL_STREETLIGHTS,
  INITIAL_REPORTS,
  INITIAL_FACILITIES,
  INITIAL_TRANSPORT_STOPS,
} from '../src/lib/mock-data';
import { RoutePreferences } from '../src/types';

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

// 6. Summary
console.log(`\n========================================`);
console.log(`TEST RESULTS: ${passed} passed, ${failed} failed.`);
console.log(`========================================\n`);

if (failed > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
