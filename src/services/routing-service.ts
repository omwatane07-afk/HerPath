import { Coordinates, RouteStep } from '../types';
import { parseRouteGeometry, validateRouteGeometry } from '../lib/geo-utils';
import { calculateDistanceMeters } from '../lib/utils';

export interface RawRouteResult {
  source: 'geoapify' | 'osrm' | 'synthetic_fallback';
  distanceMeters: number;
  durationSeconds: number;
  coordinates: [number, number][]; // [lat, lng] array
  summary: string;
  steps: RouteStep[];
}

const OSRM_BASE = process.env.NEXT_PUBLIC_OSRM_API_URL || 'https://router.project-osrm.org';

export interface RouteProvider {
  fetchRoutes(origin: Coordinates, destination: Coordinates): Promise<RawRouteResult[]>;
}

/**
 * Geoapify Routing API Provider
 * Official Documentation: https://apidocs.geoapify.com/docs/routing/
 * Uses genuine pedestrian walking profile (mode=walk).
 * Strictly renders real road geometry returned by the API.
 */
export class GeoapifyRouteProvider implements RouteProvider {
  private apiKey: string;

  constructor(apiKey?: string) {
    this.apiKey =
      apiKey ||
      process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY ||
      process.env.GEOAPIFY_API_KEY ||
      '';
  }

  async fetchRoutes(origin: Coordinates, destination: Coordinates): Promise<RawRouteResult[]> {
    const key =
      this.apiKey ||
      process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY ||
      process.env.GEOAPIFY_API_KEY ||
      '';

    if (!key || key.trim().length === 0) {
      throw new Error('Geoapify API key not configured');
    }

    // Geoapify Routing API: waypoints=lat,lon|lat,lon & mode=walk & details=instruction_details
    const url = `https://api.geoapify.com/v1/routing?waypoints=${origin.lat},${origin.lng}|${destination.lat},${destination.lng}&mode=walk&details=instruction_details&alternatives=true&apiKey=${key}`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Geoapify routing error (${response.status}): ${errText}`);
    }

    const data = await response.json();
    if (!data.features || !Array.isArray(data.features) || data.features.length === 0) {
      throw new Error('No pedestrian routes found between these locations');
    }

    const results: RawRouteResult[] = [];

    for (let idx = 0; idx < data.features.length; idx++) {
      const feature = data.features[idx];
      // Parse exact GeoJSON geometry coordinates [[lng, lat]] -> [[lat, lng]]
      const coords = parseRouteGeometry(feature.geometry);

      if (!validateRouteGeometry(coords, origin, destination)) {
        continue;
      }

      const prop = feature.properties || {};
      const leg = prop.legs?.[0];
      const steps: RouteStep[] = (leg?.steps || []).map((s: any) => ({
        instruction: s.instruction?.text || 'Continue along pedestrian path',
        distanceMeters: Math.round(s.distance || 0),
        durationSeconds: Math.round(s.time || 0),
        coordinates: coords[s.from_index] || coords[0],
      }));

      const summary =
        prop.summary ||
        (idx === 0 ? 'Primary Pedestrian Corridor' : `Alternative Corridor ${idx + 1}`);

      results.push({
        source: 'geoapify',
        distanceMeters: Math.round(prop.distance || 0),
        durationSeconds: Math.round(prop.time || 0),
        coordinates: coords,
        summary,
        steps: steps.length > 0 ? steps : [
          {
            instruction: 'Follow pedestrian thoroughfare towards destination',
            distanceMeters: Math.round(prop.distance || 0),
            durationSeconds: Math.round(prop.time || 0),
            coordinates: coords[0],
          },
        ],
      });
    }

    if (results.length === 0) {
      throw new Error('Unable to parse valid road geometry from Geoapify response');
    }

    return results;
  }
}

/**
 * OpenStreetMap OSRM Pedestrian Foot Provider
 * Official Documentation: http://project-osrm.org/docs/v5.24.0/api/
 * Profile: /route/v1/foot/
 * Queries genuine road network graph. Never fabricates sine-wave paths.
 */
export class OSRMRouteProvider implements RouteProvider {
  async fetchRoutes(origin: Coordinates, destination: Coordinates): Promise<RawRouteResult[]> {
    // In OSRM coordinates format: {lon},{lat};{lon},{lat}
    const url = `${OSRM_BASE}/route/v1/foot/${origin.lng},${origin.lat};${destination.lng},${destination.lat}?overview=full&geometries=geojson&alternatives=true&steps=true`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
        'User-Agent': 'HerPath-Pedestrian-Safety/2.0',
      },
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`OSRM routing service responded with status ${response.status}`);
    }

    const data = await response.json();
    if (data.code !== 'Ok' || !Array.isArray(data.routes) || data.routes.length === 0) {
      throw new Error(data.message || 'No walkable path found between these locations');
    }

    const results: RawRouteResult[] = [];

    for (let idx = 0; idx < data.routes.length; idx++) {
      const r = data.routes[idx];
      // Parse exact GeoJSON LineString geometry
      const coords = parseRouteGeometry(r.geometry);

      if (!validateRouteGeometry(coords, origin, destination)) {
        continue;
      }

      const leg = r.legs?.[0];
      const steps: RouteStep[] = (leg?.steps || []).map((s: any) => ({
        instruction: s.maneuver?.instruction || s.name || 'Continue on pedestrian path',
        distanceMeters: Math.round(s.distance || 0),
        durationSeconds: Math.round(s.duration || 0),
        coordinates: [s.maneuver?.location?.[1] || coords[0][0], s.maneuver?.location?.[0] || coords[0][1]],
      }));

      // Genuine street name summary from OpenStreetMap road attributes
      const streetSummary = leg?.summary ? `via ${leg.summary}` : (idx === 0 ? 'Direct Pedestrian Route' : `Alternative Route ${idx + 1}`);

      results.push({
        source: 'osrm',
        distanceMeters: Math.round(r.distance),
        durationSeconds: Math.round(r.duration),
        coordinates: coords,
        summary: streetSummary,
        steps: steps.length > 0 ? steps : [
          {
            instruction: 'Head towards destination along pedestrian walkway',
            distanceMeters: Math.round(r.distance),
            durationSeconds: Math.round(r.duration),
            coordinates: coords[0],
          },
        ],
      });
    }

    if (results.length === 0) {
      throw new Error('No valid pedestrian paths could be snapped to the road network');
    }

    // RETURN ONLY REAL ROUTES RETURNED BY THE ENGINE.
    // Never synthesize fake sine-wave offsets!
    return results;
  }
}

/**
 * Smart Hybrid Route Provider
 * Automatically prefers Geoapify when configured, gracefully falling back to OSRM.
 * Never fabricates synthetic paths when live routing is available.
 */
export class SmartHybridRouteProvider implements RouteProvider {
  private geoapifyProvider = new GeoapifyRouteProvider();
  private osrmProvider = new OSRMRouteProvider();

  async fetchRoutes(origin: Coordinates, destination: Coordinates): Promise<RawRouteResult[]> {
    const geoapifyKey =
      process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY ||
      process.env.GEOAPIFY_API_KEY;

    if (geoapifyKey && geoapifyKey.trim().length > 0) {
      try {
        const routes = await this.geoapifyProvider.fetchRoutes(origin, destination);
        if (routes && routes.length > 0) {
          return routes;
        }
      } catch (err) {
        console.warn('Geoapify routing failed, attempting OSRM fallback:', err);
      }
    }

    // Fall back to public OSRM pedestrian foot routing
    return this.osrmProvider.fetchRoutes(origin, destination);
  }
}

export const defaultRouteProvider = new SmartHybridRouteProvider();

/**
 * Mathematical route corridor generator for offline test suite verification only.
 * NOT used for live pedestrian navigation.
 */
export function generateSyntheticRouteAlternatives(
  origin: Coordinates,
  destination: Coordinates
): RawRouteResult[] {
  const directDist = calculateDistanceMeters(origin, destination);
  const walkingPaceSecondsPerMeter = 0.75; // ~4.8 km/h pedestrian walking pace

  // Corridor 1: Direct route with subtle curvature
  const points1: [number, number][] = [];
  const segments = 12;
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const lat = origin.lat + (destination.lat - origin.lat) * t + Math.sin(t * Math.PI) * 0.0004;
    const lng = origin.lng + (destination.lng - origin.lng) * t;
    points1.push([lat, lng]);
  }

  // Corridor 2: Offset corridor 2
  const points2: [number, number][] = [];
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const lat = origin.lat + (destination.lat - origin.lat) * t + Math.sin(t * Math.PI) * 0.0025;
    const lng = origin.lng + (destination.lng - origin.lng) * t + Math.sin(t * Math.PI) * 0.0018;
    points2.push([lat, lng]);
  }

  // Corridor 3: Offset corridor 3
  const points3: [number, number][] = [];
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const lat = origin.lat + (destination.lat - origin.lat) * t - Math.sin(t * Math.PI) * 0.0022;
    const lng = origin.lng + (destination.lng - origin.lng) * t - Math.sin(t * Math.PI) * 0.0015;
    points3.push([lat, lng]);
  }

  return [
    {
      source: 'synthetic_fallback',
      distanceMeters: Math.round(directDist * 1.08),
      durationSeconds: Math.round(directDist * 1.08 * walkingPaceSecondsPerMeter),
      coordinates: points1,
      summary: 'Direct pedestrian walkway (shortest physical distance)',
      steps: [
        {
          instruction: 'Proceed straight along standard pedestrian path',
          distanceMeters: Math.round(directDist * 0.5),
          durationSeconds: Math.round(directDist * 0.5 * walkingPaceSecondsPerMeter),
          coordinates: points1[0],
        },
      ],
    },
    {
      source: 'synthetic_fallback',
      distanceMeters: Math.round(directDist * 1.22),
      durationSeconds: Math.round(directDist * 1.22 * walkingPaceSecondsPerMeter),
      coordinates: points2,
      summary: 'Main transit boulevard (higher infrastructure density)',
      steps: [
        {
          instruction: 'Turn onto primary illuminated avenue with bus/metro stations',
          distanceMeters: Math.round(directDist * 0.7),
          durationSeconds: Math.round(directDist * 0.7 * walkingPaceSecondsPerMeter),
          coordinates: points2[0],
        },
      ],
    },
    {
      source: 'synthetic_fallback',
      distanceMeters: Math.round(directDist * 1.16),
      durationSeconds: Math.round(directDist * 1.16 * walkingPaceSecondsPerMeter),
      coordinates: points3,
      summary: 'Commercial arcade & public market corridor',
      steps: [
        {
          instruction: 'Follow market perimeter route alongside open shopfronts',
          distanceMeters: Math.round(directDist * 0.6),
          durationSeconds: Math.round(directDist * 0.6 * walkingPaceSecondsPerMeter),
          coordinates: points3[0],
        },
      ],
    },
  ];
}
