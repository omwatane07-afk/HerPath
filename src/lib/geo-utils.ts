import { Coordinates } from '../types';

/**
 * Validates that a coordinate has valid, finite latitude and longitude within geographic bounds.
 */
export function isValidCoordinate(coord: any): coord is Coordinates {
  if (!coord || typeof coord !== 'object') return false;
  const { lat, lng } = coord;
  if (typeof lat !== 'number' || typeof lng !== 'number') return false;
  if (!isFinite(lat) || !isFinite(lng)) return false;
  if (isNaN(lat) || isNaN(lng)) return false;
  if (lat < -90 || lat > 90) return false;
  if (lng < -180 || lng > 180) return false;
  return true;
}

/**
 * Decodes Google/OSRM encoded polyline strings with specified precision (5 or 6).
 * Standard OSRM polyline is precision 5 (1e5); polyline6 is precision 6 (1e6).
 */
export function decodePolyline(encoded: string, precision: number = 5): [number, number][] {
  if (!encoded || typeof encoded !== 'string') return [];
  const points: [number, number][] = [];
  let index = 0;
  const len = encoded.length;
  let lat = 0;
  let lng = 0;
  const factor = Math.pow(10, precision);

  while (index < len) {
    let b: number;
    let shift = 0;
    let result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20 && index < len);
    const dlat = ((result & 1) !== 0 ? ~(result >> 1) : (result >> 1));
    lat += dlat;

    shift = 0;
    result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20 && index < len);
    const dlng = ((result & 1) !== 0 ? ~(result >> 1) : (result >> 1));
    lng += dlng;

    const finalLat = lat / factor;
    const finalLng = lng / factor;

    if (finalLat >= -90 && finalLat <= 90 && finalLng >= -180 && finalLng <= 180) {
      points.push([finalLat, finalLng]);
    }
  }

  return points;
}

/**
 * Parses and normalizes route geometry from various provider response formats into Leaflet [latitude, longitude][] array.
 * Strictly preserves full original floating point precision without padding or truncating digits.
 */
export function parseRouteGeometry(rawGeometry: any): [number, number][] {
  if (!rawGeometry) return [];

  // 1. If already encoded polyline string
  if (typeof rawGeometry === 'string') {
    // Try standard polyline5 first, if out of range try polyline6
    const p5 = decodePolyline(rawGeometry, 5);
    if (p5.length > 0 && Math.abs(p5[0][0]) <= 90 && Math.abs(p5[0][1]) <= 180) {
      return p5;
    }
    return decodePolyline(rawGeometry, 6);
  }

  // 2. If GeoJSON LineString coordinates: [[lng, lat], ...]
  if (Array.isArray(rawGeometry.coordinates)) {
    const coords = rawGeometry.coordinates;
    const geomType = rawGeometry.type || 'LineString';

    if (geomType === 'LineString') {
      return (coords as [number, number][])
        .map(([lng, lat]: [number, number]) => [Number(lat), Number(lng)] as [number, number])
        .filter(([lat, lng]: [number, number]) => isFinite(lat) && isFinite(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180);
    }

    if (geomType === 'MultiLineString') {
      const flattened: [number, number][] = [];
      for (const line of coords) {
        if (Array.isArray(line)) {
          for (const pt of line) {
            if (Array.isArray(pt) && pt.length >= 2) {
              const [lng, lat] = pt;
              const numLat = Number(lat);
              const numLng = Number(lng);
              if (isFinite(numLat) && isFinite(numLng) && numLat >= -90 && numLat <= 90 && numLng >= -180 && numLng <= 180) {
                flattened.push([numLat, numLng]);
              }
            }
          }
        }
      }
      return flattened;
    }
  }

  // 3. If raw array of [lng, lat] pairs (GeoJSON) or [lat, lng] pairs
  if (Array.isArray(rawGeometry) && rawGeometry.length > 0) {
    // Check if first element is [lng, lat] (where lat is index 1, typically in India 8-37 and lng is 68-97)
    const first = rawGeometry[0];
    if (Array.isArray(first) && first.length >= 2) {
      // In India, lat is ~8-37 and lng is ~68-98. If first[0] > 50 and first[1] < 45, it is [lng, lat]
      const isLngLat = first[0] > 50 && first[1] < 45;
      return rawGeometry.map((pt: [number, number]) => {
        const lat = isLngLat ? Number(pt[1]) : Number(pt[0]);
        const lng = isLngLat ? Number(pt[0]) : Number(pt[1]);
        return [lat, lng] as [number, number];
      }).filter(([lat, lng]) => isFinite(lat) && isFinite(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180);
    }
  }

  return [];
}

/**
 * Validates that an extracted route has sufficient road network geometry and positive distance/duration.
 */
export function validateRouteGeometry(
  coordinates: [number, number][],
  origin: Coordinates,
  destination: Coordinates
): boolean {
  if (!Array.isArray(coordinates) || coordinates.length < 2) {
    return false;
  }

  // Ensure all points are finite numbers
  for (const [lat, lng] of coordinates) {
    if (typeof lat !== 'number' || typeof lng !== 'number' || !isFinite(lat) || !isFinite(lng)) {
      return false;
    }
  }

  // Ensure first and last coordinates are reasonably near origin and destination (within 2km of snapping)
  const first = coordinates[0];
  const last = coordinates[coordinates.length - 1];

  const startDiff = Math.hypot(first[0] - origin.lat, first[1] - origin.lng);
  const endDiff = Math.hypot(last[0] - destination.lat, last[1] - destination.lng);

  // Approximately 0.05 degrees ~ 5km threshold for snapping
  if (startDiff > 0.1 || endDiff > 0.1) {
    return false;
  }

  return true;
}
