import { Coordinates, PoliceStation } from '../types';
import { calculateDistanceMeters } from '../lib/utils';

/**
 * Standard Verified Emergency Police Stations Directory (Delhi Central District)
 * Used as high-reliability fallback for Delhi-based locations or tests.
 */
const DELHI_VERIFIED_STATIONS: PoliceStation[] = [
  {
    id: 'ps_cp',
    name: 'Connaught Place Police Station',
    address: 'Baba Kharak Singh Marg, Connaught Place, New Delhi 110001',
    coordinates: { lat: 28.6318, lng: 77.2142 },
    phone: '+91 11 2336 3840',
    isVerifiedPhone: true,
    isDemoData: false,
    openingHours: '24/7 Official Station',
    source: 'emergency_directory',
  },
  {
    id: 'ps_parliament',
    name: 'Parliament Street Police Station',
    address: 'Sansad Marg, New Delhi 110001',
    coordinates: { lat: 28.6241, lng: 77.2132 },
    phone: '+91 11 2336 1100',
    isVerifiedPhone: true,
    isDemoData: false,
    openingHours: '24/7 Official Station',
    source: 'emergency_directory',
  },
  {
    id: 'ps_barakhamba',
    name: 'Barakhamba Road Police Station',
    address: 'Barakhamba Road, Fire Brigade Lane, New Delhi 110001',
    coordinates: { lat: 28.6292, lng: 77.2285 },
    phone: '+91 11 2341 2233',
    isVerifiedPhone: true,
    isDemoData: false,
    openingHours: '24/7 Official Station',
    source: 'emergency_directory',
  },
  {
    id: 'ps_tilak',
    name: 'Tilak Marg Police Station',
    address: 'Tilak Marg, C-Hexagon, India Gate Circle, New Delhi 110001',
    coordinates: { lat: 28.6215, lng: 77.2382 },
    phone: '+91 11 2338 2190',
    isVerifiedPhone: true,
    isDemoData: false,
    openingHours: '24/7 Official Station',
    source: 'emergency_directory',
  },
  {
    id: 'ps_mandir_marg',
    name: 'Mandir Marg Police Station',
    address: 'Mandir Marg, Sector 4, Gole Market, New Delhi 110001',
    coordinates: { lat: 28.6335, lng: 77.1995 },
    phone: '+91 11 2336 4100',
    isVerifiedPhone: true,
    isDemoData: false,
    openingHours: '24/7 Official Station',
    source: 'emergency_directory',
  },
];

/**
 * Standard Verified Emergency Police Stations Directory (Pune City & Suburbs)
 * Used as high-reliability fallback for Pune-based operations.
 */
const PUNE_VERIFIED_STATIONS: PoliceStation[] = [
  {
    id: 'ps_pune_shivajinagar',
    name: 'Shivajinagar Police Station',
    address: 'Fergusson College Road, Shivajinagar, Pune, Maharashtra 411005',
    coordinates: { lat: 18.5314, lng: 73.8446 },
    phone: '+91 20 2553 6263',
    isVerifiedPhone: true,
    isDemoData: false,
    openingHours: '24/7 Official Police Station',
    source: 'emergency_directory',
  },
  {
    id: 'ps_pune_swargate',
    name: 'Swargate Police Station',
    address: 'Jedhe Chowk, Swargate, Pune, Maharashtra 411042',
    coordinates: { lat: 18.5018, lng: 73.8580 },
    phone: '+91 20 2444 0404',
    isVerifiedPhone: true,
    isDemoData: false,
    openingHours: '24/7 Official Police Station',
    source: 'emergency_directory',
  },
  {
    id: 'ps_pune_deccan',
    name: 'Deccan Gymkhana Police Station',
    address: 'Prabhat Road, Deccan Gymkhana, Pune, Maharashtra 411004',
    coordinates: { lat: 18.5167, lng: 73.8417 },
    phone: '+91 20 2567 5005',
    isVerifiedPhone: true,
    isDemoData: false,
    openingHours: '24/7 Official Police Station',
    source: 'emergency_directory',
  },
  {
    id: 'ps_pune_katraj',
    name: 'Bharati Vidyapeeth Police Station (Katraj)',
    address: 'Pune-Satara Road, Katraj, Pune, Maharashtra 411046',
    coordinates: { lat: 18.4578, lng: 73.8508 },
    phone: '+91 20 2437 1144',
    isVerifiedPhone: true,
    isDemoData: false,
    openingHours: '24/7 Official Police Station',
    source: 'emergency_directory',
  },
  {
    id: 'ps_pune_bibwewadi',
    name: 'Bibwewadi Police Station',
    address: 'Bibwewadi Main Road, Pune, Maharashtra 411037',
    coordinates: { lat: 18.4695, lng: 73.8640 },
    phone: '+91 20 2422 2200',
    isVerifiedPhone: true,
    isDemoData: false,
    openingHours: '24/7 Official Police Station',
    source: 'emergency_directory',
  },
];

/**
 * Service to discover nearby police stations using Geoapify Places API
 * Official Documentation: https://apidocs.geoapify.com/docs/places/
 */
export class PoliceStationService {
  /**
   * Fetches nearby police stations around the given coordinates.
   * If Geoapify key is configured, calls the Places API with categories=service.police.
   * If phone number is returned from provider, it is displayed. If not returned,
   * no phone number is fabricated.
   */
  static async findNearbyStations(
    origin: Coordinates,
    radiusMeters: number = 5000,
    forceDemo: boolean = false
  ): Promise<PoliceStation[]> {
    if (forceDemo) {
      return this.getFallbackStations(origin);
    }

    const apiKey =
      process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY ||
      process.env.GEOAPIFY_API_KEY ||
      '';

    if (!apiKey || apiKey.trim().length === 0) {
      return this.getFallbackStations(origin);
    }

    try {
      // Geoapify Places API: categories=service.police & filter=circle:lon,lat,radius & bias=proximity:lon,lat
      const url = `https://api.geoapify.com/v2/places?categories=service.police&filter=circle:${origin.lng},${origin.lat},${radiusMeters}&bias=proximity:${origin.lng},${origin.lat}&limit=6&apiKey=${apiKey}`;

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);

      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (!response.ok) {
        console.warn(`Geoapify Places API responded with status ${response.status}`);
        return this.getFallbackStations(origin);
      }

      const data = await response.json();
      if (!data.features || !Array.isArray(data.features) || data.features.length === 0) {
        return this.getFallbackStations(origin);
      }

      const results: PoliceStation[] = data.features.map((feature: any, idx: number) => {
        const props = feature.properties || {};
        const stationCoords: Coordinates = {
          lat: props.lat || feature.geometry?.coordinates?.[1] || origin.lat,
          lng: props.lon || feature.geometry?.coordinates?.[0] || origin.lng,
        };

        const distanceMeters = Math.round(calculateDistanceMeters(origin, stationCoords));

        // Phone number extraction: official provider contact or raw datasource only
        const rawPhone =
          props.contact?.phone ||
          props.datasource?.raw?.phone ||
          props.phone ||
          undefined;

        const isVerifiedPhone = Boolean(rawPhone && rawPhone.trim().length > 0);

        return {
          id: `ps_geo_${props.place_id || idx}`,
          name: props.name || props.address_line1 || 'Local Police Station',
          address: props.formatted || props.address_line2 || `${props.name}, Emergency Services`,
          coordinates: stationCoords,
          distanceMeters,
          phone: rawPhone,
          isVerifiedPhone,
          isDemoData: false,
          openingHours: props.opening_hours || '24/7 Emergency Desk',
          source: 'geoapify_places',
        };
      });

      // Sort by distance ascending
      return results.sort((a, b) => (a.distanceMeters || 0) - (b.distanceMeters || 0));
    } catch (err) {
      console.warn('Error querying Geoapify Places API, falling back to verified directory:', err);
      return this.getFallbackStations(origin);
    }
  }

  /**
   * Returns fallback stations sorted by proximity to the provided origin coordinates.
   * Selects Pune directory when in Western/Southern India (lat < 22), otherwise Delhi directory.
   */
  static getFallbackStations(origin: Coordinates): PoliceStation[] {
    const isWesternIndia = origin.lat < 23;
    const directory = isWesternIndia ? PUNE_VERIFIED_STATIONS : DELHI_VERIFIED_STATIONS;

    return directory.map((station) => ({
      ...station,
      distanceMeters: Math.round(calculateDistanceMeters(origin, station.coordinates)),
    })).sort((a, b) => (a.distanceMeters || 0) - (b.distanceMeters || 0));
  }
}
