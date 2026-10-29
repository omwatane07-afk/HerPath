import { PlaceSuggestion, Coordinates } from '../types';

const NOMINATIM_BASE =
  process.env.NEXT_PUBLIC_NOMINATIM_API_URL || 'https://nominatim.openstreetmap.org';

// Default bias: Pune, Maharashtra (18.5204° N, 73.8567° E)
export const PUNE_DEFAULT_COORDINATES: Coordinates = {
  lat: 18.5204,
  lng: 73.8567,
};

export interface AutocompleteOptions {
  biasCoords?: Coordinates | null;
  countryCode?: string;
  limit?: number;
  signal?: AbortSignal;
}

/**
 * Searches places using official Geoapify Address Autocomplete API
 * Documentation: https://apidocs.geoapify.com/docs/geocoding/address-autocomplete/
 *
 * Gracefully falls back to OpenStreetMap Nominatim with Pune/India proximity biasing.
 * Returns only genuine provider results with exact returned coordinates.
 * NEVER returns hardcoded demonstration places.
 */
export async function searchPlaces(
  query: string,
  options: AutocompleteOptions = {}
): Promise<PlaceSuggestion[]> {
  const trimmed = query.trim();
  if (!trimmed || trimmed.length < 2) return [];

  const bias = options.biasCoords || PUNE_DEFAULT_COORDINATES;
  const limit = options.limit || 6;
  const country = options.countryCode || 'in';

  const geoapifyKey =
    process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY ||
    process.env.GEOAPIFY_API_KEY;

  // 1. Try official Geoapify Address Autocomplete endpoint if API key configured
  if (geoapifyKey && geoapifyKey.trim().length > 0) {
    try {
      // Geoapify Autocomplete API with country filter and proximity bias
      // Proximity format in Geoapify is lon,lat
      const biasParam = `&bias=proximity:${bias.lng},${bias.lat}`;
      const filterParam = country ? `&filter=countrycode:${country.toLowerCase()}` : '';
      const url = `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(
        trimmed
      )}${filterParam}${biasParam}&limit=${limit}&apiKey=${geoapifyKey}&lang=en`;

      const controller = new AbortController();
      const internalTimeout = setTimeout(() => controller.abort(), 4000);

      // Link external abort signal if provided
      if (options.signal) {
        options.signal.addEventListener('abort', () => controller.abort());
      }

      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(internalTimeout);

      if (response.ok) {
        const data = await response.json();
        const features = data.features || (data.results ? data.results.map((r: any) => ({ properties: r })) : []);

        if (Array.isArray(features) && features.length > 0) {
          const suggestions: PlaceSuggestion[] = features.map((f: any, idx: number) => {
            const props = f.properties || f;
            const lat = props.lat || f.geometry?.coordinates?.[1];
            const lon = props.lon || f.geometry?.coordinates?.[0];

            const name =
              props.name ||
              props.address_line1 ||
              props.formatted?.split(',')[0] ||
              trimmed;

            const displayName =
              props.formatted ||
              [props.address_line1, props.address_line2].filter(Boolean).join(', ') ||
              name;

            return {
              id: `geo_${props.place_id || idx}_${Date.now()}`,
              name,
              displayName,
              coordinates: {
                lat: Number(lat),
                lng: Number(lon),
              },
              type: props.result_type || props.category || 'place',
            };
          }).filter((s) => !isNaN(s.coordinates.lat) && !isNaN(s.coordinates.lng));

          if (suggestions.length > 0) {
            return suggestions;
          }
        }
      } else {
        console.warn(`Geoapify Autocomplete HTTP ${response.status}: ${await response.text()}`);
      }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        throw err; // Allow abort signal propagation
      }
      console.warn('Geoapify autocomplete error, trying Nominatim fallback:', err);
    }
  }

  // 2. Fallback to OpenStreetMap Nominatim search API with proximity viewbox
  try {
    // Biased around Pune/Maharashtra with bounded=0 so other cities still resolve
    const viewbox = `${bias.lng - 0.4},${bias.lat + 0.4},${bias.lng + 0.4},${bias.lat - 0.4}`;
    const countryParam = country ? `&countrycodes=${country.toLowerCase()}` : '';
    const url = `${NOMINATIM_BASE}/search?format=json&q=${encodeURIComponent(
      trimmed
    )}${countryParam}&viewbox=${viewbox}&bounded=0&limit=${limit}&addressdetails=1`;

    const controller = new AbortController();
    const internalTimeout = setTimeout(() => controller.abort(), 4500);

    if (options.signal) {
      options.signal.addEventListener('abort', () => controller.abort());
    }

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
        'User-Agent': 'HerPath-Pedestrian-Safety/2.0',
      },
    });
    clearTimeout(internalTimeout);

    if (response.ok) {
      const data = await response.json();
      if (Array.isArray(data)) {
        return data.map((item: any) => {
          const lat = parseFloat(item.lat);
          const lng = parseFloat(item.lon);

          // Build clean concise place name from address details if available
          const addr = item.address || {};
          const primaryName =
            item.name ||
            addr.suburb ||
            addr.neighbourhood ||
            addr.amenity ||
            addr.road ||
            item.display_name.split(',')[0];

          return {
            id: `nom_${item.place_id}`,
            name: primaryName,
            displayName: item.display_name,
            coordinates: { lat, lng },
            type: item.type || item.class || 'place',
          };
        }).filter((s) => !isNaN(s.coordinates.lat) && !isNaN(s.coordinates.lng));
      }
    }
  } catch (err: any) {
    if (err.name === 'AbortError') {
      throw err;
    }
    console.warn('Nominatim search request failed:', err);
  }

  // Return empty array when no genuine provider results are found
  return [];
}

/**
 * Reverse geocodes coordinates to an authentic, human-readable street name
 */
export async function reverseGeocode(coords: Coordinates): Promise<string> {
  const geoapifyKey =
    process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY ||
    process.env.GEOAPIFY_API_KEY;

  // 1. Try Geoapify Reverse Geocoding
  if (geoapifyKey && geoapifyKey.trim().length > 0) {
    try {
      const url = `https://api.geoapify.com/v1/geocode/reverse?lat=${coords.lat}&lon=${coords.lng}&format=json&apiKey=${geoapifyKey}`;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);

      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        const first = data.results?.[0];
        if (first) {
          const name = first.name || first.address_line1 || first.formatted?.split(',').slice(0, 2).join(', ');
          if (name) return name;
        }
      }
    } catch (err) {
      console.warn('Geoapify reverse geocode failed, trying Nominatim fallback:', err);
    }
  }

  // 2. Fallback to Nominatim Reverse Geocoding
  try {
    const url = `${NOMINATIM_BASE}/reverse?format=json&lat=${coords.lat}&lon=${coords.lng}&zoom=18&addressdetails=1`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
        'User-Agent': 'HerPath-Pedestrian-Safety/2.0',
      },
    });
    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      if (data && data.display_name) {
        const parts = data.display_name.split(',').map((s: string) => s.trim());
        // Return first 2-3 significant street/area components
        return parts.slice(0, 3).join(', ');
      }
    }
  } catch (err) {
    console.warn('Nominatim reverse geocode failed:', err);
  }

  // Return formatted coordinate fallback if offline or unavailable
  return `Location (${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)})`;
}
