import { Coordinates, RouteStep } from '../types';
import { calculateDistanceMeters } from '../lib/utils';

export interface RawRouteResult {
  source: 'osrm' | 'synthetic_fallback';
  distanceMeters: number;
  durationSeconds: number;
  coordinates: [number, number][]; // [lat, lng]
  summary: string;
  steps: RouteStep[];
}

const OSRM_BASE = process.env.NEXT_PUBLIC_OSRM_API_URL || 'https://router.project-osrm.org';

export interface RouteProvider {
  fetchRoutes(origin: Coordinates, destination: Coordinates): Promise<RawRouteResult[]>;
}

export class OSRMRouteProvider implements RouteProvider {
  async fetchRoutes(origin: Coordinates, destination: Coordinates): Promise<RawRouteResult[]> {
    const url = `${OSRM_BASE}/route/v1/walking/${origin.lng},${origin.lat};${destination.lng},${destination.lat}?overview=full&geometries=geojson&alternatives=true&steps=true`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1200);

    try {
      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        if (data.code === 'Ok' && Array.isArray(data.routes) && data.routes.length > 0) {
          const results: RawRouteResult[] = data.routes.map((r: any, idx: number) => {
            // OSRM coordinates are [lng, lat], convert to [lat, lng] for Leaflet
            const coords: [number, number][] = r.geometry.coordinates.map(
              ([lng, lat]: [number, number]) => [lat, lng]
            );

            const steps: RouteStep[] = (r.legs?.[0]?.steps || []).map((s: any) => ({
              instruction: s.maneuver?.instruction || s.name || 'Continue on route',
              distanceMeters: Math.round(s.distance || 0),
              durationSeconds: Math.round(s.duration || 0),
              coordinates: [s.maneuver?.location?.[1] || coords[0][0], s.maneuver?.location?.[0] || coords[0][1]],
            }));

            return {
              source: 'osrm' as const,
              distanceMeters: Math.round(r.distance),
              durationSeconds: Math.round(r.duration),
              coordinates: coords,
              summary: r.legs?.[0]?.summary || `Route Alternative ${idx + 1}`,
              steps: steps.length > 0 ? steps : [
                {
                  instruction: 'Head towards destination',
                  distanceMeters: Math.round(r.distance),
                  durationSeconds: Math.round(r.duration),
                  coordinates: coords[0],
                },
              ],
            };
          });

          // If OSRM only returned 1 route, synthesize secondary corridor alternatives
          if (results.length === 1) {
            const secondRoute = generateCorridorAlternative(origin, destination, results[0], 0.002, 'Parallel Transit Corridor');
            const thirdRoute = generateCorridorAlternative(origin, destination, results[0], -0.002, 'Main Commercial Avenue');
            results.push(secondRoute, thirdRoute);
          }

          return results;
        }
      }
    } catch (err) {
      console.warn('OSRM routing request failed or timed out. Falling back to explainable local corridor routing:', err);
    }

    // Graceful fallback when remote OSRM is unreachable
    return generateSyntheticRouteAlternatives(origin, destination);
  }
}

/**
 * Generates an alternative corridor by offsetting intermediate waypoints
 */
function generateCorridorAlternative(
  origin: Coordinates,
  destination: Coordinates,
  baseRoute: RawRouteResult,
  offset: number,
  label: string
): RawRouteResult {
  const newCoords: [number, number][] = baseRoute.coordinates.map(([lat, lng], i, arr) => {
    // Keep start and end fixed
    if (i === 0 || i === arr.length - 1) return [lat, lng];
    const factor = Math.sin((i / arr.length) * Math.PI); // bell curve offset
    return [lat + offset * factor, lng + offset * factor * 0.8];
  });

  const distIncrease = Math.round(baseRoute.distanceMeters * 1.12);
  const durIncrease = Math.round(baseRoute.durationSeconds * 1.15);

  return {
    source: 'synthetic_fallback',
    distanceMeters: distIncrease,
    durationSeconds: durIncrease,
    coordinates: newCoords,
    summary: label,
    steps: [
      {
        instruction: `Follow ${label} via pedestrian thoroughfare`,
        distanceMeters: Math.round(distIncrease * 0.5),
        durationSeconds: Math.round(durIncrease * 0.5),
        coordinates: newCoords[0],
      },
      {
        instruction: 'Turn towards destination along well-lit crossing',
        distanceMeters: Math.round(distIncrease * 0.5),
        durationSeconds: Math.round(durIncrease * 0.5),
        coordinates: newCoords[Math.floor(newCoords.length / 2)],
      },
    ],
  };
}

/**
 * Creates 3 realistic pedestrian route corridors between two points when offline
 */
export function generateSyntheticRouteAlternatives(
  origin: Coordinates,
  destination: Coordinates
): RawRouteResult[] {
  const directDist = calculateDistanceMeters(origin, destination);
  const walkingPaceSecondsPerMeter = 0.75; // ~4.8 km/h pedestrian walking pace

  // Corridor 1: Direct route with subtle street curvature
  const points1: [number, number][] = [];
  const segments = 12;
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const lat = origin.lat + (destination.lat - origin.lat) * t + Math.sin(t * Math.PI) * 0.0004;
    const lng = origin.lng + (destination.lng - origin.lng) * t;
    points1.push([lat, lng]);
  }

  // Corridor 2: North/East main avenue offset (well-supported boulevard)
  const points2: [number, number][] = [];
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const lat = origin.lat + (destination.lat - origin.lat) * t + Math.sin(t * Math.PI) * 0.0025;
    const lng = origin.lng + (destination.lng - origin.lng) * t + Math.sin(t * Math.PI) * 0.0018;
    points2.push([lat, lng]);
  }

  // Corridor 3: South/West commercial arcade offset
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
        {
          instruction: 'Continue towards destination waypoint',
          distanceMeters: Math.round(directDist * 0.58),
          durationSeconds: Math.round(directDist * 0.58 * walkingPaceSecondsPerMeter),
          coordinates: points1[6],
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
        {
          instruction: 'Cross at signalised pedestrian junction towards destination',
          distanceMeters: Math.round(directDist * 0.52),
          durationSeconds: Math.round(directDist * 0.52 * walkingPaceSecondsPerMeter),
          coordinates: points2[6],
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
        {
          instruction: 'Turn into final destination street',
          distanceMeters: Math.round(directDist * 0.56),
          durationSeconds: Math.round(directDist * 0.56 * walkingPaceSecondsPerMeter),
          coordinates: points3[6],
        },
      ],
    },
  ];
}

export const defaultRouteProvider = new OSRMRouteProvider();
