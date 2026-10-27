import { PlaceSuggestion, Coordinates } from '../types';
import { DEMO_PRESET_ORIGINS, DEMO_PRESET_DESTINATIONS } from '../lib/mock-data';

const NOMINATIM_BASE =
  process.env.NEXT_PUBLIC_NOMINATIM_API_URL || 'https://nominatim.openstreetmap.org';

const ALL_PRESETS = [...DEMO_PRESET_ORIGINS, ...DEMO_PRESET_DESTINATIONS];

export async function searchPlaces(query: string): Promise<PlaceSuggestion[]> {
  const trimmed = query.trim().toLowerCase();
  if (!trimmed || trimmed.length < 2) return [];

  // First check demo presets for immediate instant response
  const presetMatches = ALL_PRESETS.filter(
    (p) =>
      p.name.toLowerCase().includes(trimmed) ||
      p.displayName.toLowerCase().includes(trimmed)
  );

  try {
    const url = `${NOMINATIM_BASE}/search?format=json&q=${encodeURIComponent(
      query
    )}&limit=5&addressdetails=1`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
      },
    });
    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      const nominatimResults: PlaceSuggestion[] = data.map((item: any) => ({
        id: `nom_${item.place_id}`,
        name: item.name || item.display_name.split(',')[0],
        displayName: item.display_name,
        coordinates: {
          lat: parseFloat(item.lat),
          lng: parseFloat(item.lon),
        },
        type: item.type || 'place',
      }));

      // Combine presets + remote results without duplicates
      const combined = [...presetMatches];
      for (const res of nominatimResults) {
        if (!combined.some((c) => Math.abs(c.coordinates.lat - res.coordinates.lat) < 0.001 && Math.abs(c.coordinates.lng - res.coordinates.lng) < 0.001)) {
          combined.push(res);
        }
      }
      return combined.slice(0, 6);
    }
  } catch (err) {
    console.warn('Nominatim search failed or timed out, using local presets:', err);
  }

  return presetMatches;
}

export async function reverseGeocode(coords: Coordinates): Promise<string> {
  // Check preset proximity
  for (const p of ALL_PRESETS) {
    const dLat = Math.abs(p.coordinates.lat - coords.lat);
    const dLng = Math.abs(p.coordinates.lng - coords.lng);
    if (dLat < 0.002 && dLng < 0.002) {
      return p.name;
    }
  }

  try {
    const url = `${NOMINATIM_BASE}/reverse?format=json&lat=${coords.lat}&lon=${coords.lng}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);

    const response = await fetch(url, {
      signal: controller.signal,
      headers: { Accept: 'application/json' },
    });
    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      return data.display_name ? data.display_name.split(',').slice(0, 3).join(',') : `${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}`;
    }
  } catch (err) {
    console.warn('Reverse geocode failed:', err);
  }

  return `Current Location (${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)})`;
}
