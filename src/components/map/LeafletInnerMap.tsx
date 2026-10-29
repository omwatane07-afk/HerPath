'use client';

import React, { useEffect } from 'react';
import {
  MapContainer,
  TileLayer,
  Polyline,
  Marker,
  Popup,
  Circle,
  useMap,
  useMapEvents,
} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  Coordinates,
  RouteOption,
  StreetlightSegment,
  CommunityReport,
  EssentialFacility,
  TransportStop,
} from '@/types';
import { formatRelativeTime } from '@/lib/utils';
import { CivicReportingService } from '@/services/civic-reporting-service';
import { getCivicCategory } from '@/lib/civic-categories';
import {
  Plus,
  Minus,
  Crosshair,
  Shield,
  Lightbulb,
  Building2,
  Bus,
  AlertTriangle,
  HeartPulse,
} from 'lucide-react';

interface LeafletInnerMapProps {
  center: Coordinates;
  zoom?: number;
  origin: Coordinates | null;
  destination: Coordinates | null;
  originName?: string;
  destinationName?: string;
  currentLocation?: Coordinates | null;
  locationAccuracy?: number | null;
  routes: RouteOption[];
  selectedRouteIndex: number;
  onSelectRouteIndex: (index: number) => void;
  streetlights: StreetlightSegment[];
  reports: CommunityReport[];
  facilities: EssentialFacility[];
  transportStops: TransportStop[];
  activeLayers: {
    streetlights: boolean;
    reports: boolean;
    facilities: boolean;
    transport: boolean;
  };
  onMapClick?: (coords: Coordinates) => void;
  onSetAsDestination?: (coords: Coordinates, name: string) => void;
  onUpvoteReport?: (id: string) => void;
  onFlagReport?: (id: string) => void;
  onResolveReport?: (id: string) => void;
}

// Custom DivIcon Helper
function createCustomMarkerIcon(
  html: string,
  className: string = '',
  size: [number, number] = [36, 36]
) {
  return L.divIcon({
    html,
    className: `custom-leaflet-icon ${className}`,
    iconSize: size,
    iconAnchor: [size[0] / 2, size[1]],
    popupAnchor: [0, -size[1]],
  });
}

// Origin: Crisp Indigo Pin A
const originIcon = createCustomMarkerIcon(
  `<div class="w-8 h-8 rounded-full bg-indigo-600 border-2 border-white shadow-md flex items-center justify-center text-white font-bold text-xs ring-2 ring-indigo-200" role="img" aria-label="Starting Point A">A</div>`,
  'origin-marker',
  [32, 32]
);

// Destination: Crisp Rose Pin B
const destinationIcon = createCustomMarkerIcon(
  `<div class="w-8 h-8 rounded-full bg-rose-600 border-2 border-white shadow-md flex items-center justify-center text-white font-bold text-xs ring-2 ring-rose-200" role="img" aria-label="Destination B">B</div>`,
  'destination-marker',
  [32, 32]
);

// Live GPS Location marker: High-visibility pulsating blue jewel
const currentLocationIcon = createCustomMarkerIcon(
  `<div class="relative flex items-center justify-center w-8 h-8">
    <div class="absolute w-8 h-8 rounded-full bg-blue-500/25 animate-ping"></div>
    <div class="w-5 h-5 rounded-full bg-blue-600 border-2 border-white shadow-lg flex items-center justify-center relative z-10">
      <div class="w-1.5 h-1.5 rounded-full bg-white"></div>
    </div>
  </div>`,
  'current-location-marker',
  [32, 32]
);

// Streetlight Marker: Gold-Amber Circle (#8A6A10)
function getStreetlightIcon(status: string) {
  if (status === 'working' || status === 'resolved') {
    return createCustomMarkerIcon(
      `<div class="w-7 h-7 rounded-full bg-white border-2 border-[#8A6A10] shadow-sm flex items-center justify-center text-[12px] text-[#8A6A10]" role="img" aria-label="Streetlight: working">💡</div>`,
      '',
      [28, 28]
    );
  }
  return createCustomMarkerIcon(
    `<div class="w-7 h-7 rounded-full bg-[#FDF2E3] border-2 border-[#A8560A] shadow-sm flex items-center justify-center text-[12px] text-[#A8560A]" role="img" aria-label="Streetlight: reported out">⚠️</div>`,
    '',
    [28, 28]
  );
}

// Facility Category Markers (Color + Glyph + Shape encoded)
function getFacilityIcon(category: string) {
  if (category === 'womens_restroom') {
    // Women's Facilities: Diamond/Pill in Plum #8E2F7E
    return createCustomMarkerIcon(
      `<div class="w-8 h-8 rounded-lg rotate-45 bg-[#8E2F7E] border-2 border-white shadow-sm flex items-center justify-center" role="img" aria-label="Women's Restroom facility">
        <span class="-rotate-45 text-white text-[11px] font-bold">🚺</span>
      </div>`,
      '',
      [32, 32]
    );
  }
  if (category === 'public_toilet') {
    return createCustomMarkerIcon(
      `<div class="w-7 h-7 rounded-full bg-white border-2 border-[#8E2F7E] shadow-sm flex items-center justify-center text-[11px] text-[#8E2F7E]" role="img" aria-label="Public Restroom">🚻</div>`,
      '',
      [28, 28]
    );
  }
  if (category === 'pharmacy' || category === 'hospital') {
    // Medical: Teal #0F766E
    return createCustomMarkerIcon(
      `<div class="w-7 h-7 rounded-md bg-[#0F766E] border-2 border-white shadow-sm flex items-center justify-center text-[11px] text-white" role="img" aria-label="Medical or Pharmacy facility">💊</div>`,
      '',
      [28, 28]
    );
  }
  if (category === 'police_station' || category === 'help_point') {
    // Police/Help: Navy #2B3A67
    return createCustomMarkerIcon(
      `<div class="w-7 h-7 rounded-md bg-[#2B3A67] border-2 border-white shadow-sm flex items-center justify-center text-[11px] text-white" role="img" aria-label="Police Assistance Booth">🛡️</div>`,
      '',
      [28, 28]
    );
  }
  return createCustomMarkerIcon(
    `<div class="w-7 h-7 rounded-full bg-white border-2 border-border-control shadow-sm flex items-center justify-center text-[11px] text-ink" role="img" aria-label="Essential Facility">🏢</div>`,
    '',
    [28, 28]
  );
}

// Community Disturbance/Civic Report Markers with accessible distinct glyphs, shapes, and colors
function getReportMarkerIcon(report: CommunityReport) {
  const staleness = CivicReportingService.checkStaleness(report);
  const isStale = staleness.isStale && report.status !== 'resolved';

  if (isStale) {
    return createCustomMarkerIcon(
      `<div class="w-8 h-8 rounded-full bg-amber-50 border-2 border-dashed border-amber-600 shadow-sm flex items-center justify-center text-xs text-amber-700 font-bold" role="img" aria-label="Stale Civic Report">🕒</div>`,
      '',
      [32, 32]
    );
  }

  if (report.status === 'verified') {
    return createCustomMarkerIcon(
      `<div class="w-8 h-8 rounded-full bg-emerald-700 border-2 border-white shadow-md flex items-center justify-center text-xs text-white font-bold ring-2 ring-emerald-300" role="img" aria-label="Verified Civic Report">🛡️</div>`,
      '',
      [32, 32]
    );
  }

  if (report.status === 'under_review') {
    return createCustomMarkerIcon(
      `<div class="w-8 h-8 rounded-lg rotate-45 bg-sky-600 border-2 border-white shadow-md flex items-center justify-center text-white" role="img" aria-label="Under Review Report"><span class="-rotate-45 text-[11px]">🔍</span></div>`,
      '',
      [32, 32]
    );
  }

  if (report.status === 'resolved') {
    return createCustomMarkerIcon(
      `<div class="w-7 h-7 rounded-full bg-purple-100 border-2 border-purple-400 shadow-sm flex items-center justify-center text-[10px] text-purple-700 font-bold" role="img" aria-label="Resolved Report">✓</div>`,
      '',
      [28, 28]
    );
  }

  // Pending
  return createCustomMarkerIcon(
    `<div class="w-8 h-8 bg-amber-100 border-2 border-amber-500 rounded-md flex items-center justify-center shadow-sm text-xs text-amber-900 font-bold" role="img" aria-label="Pending Civic Report">⚠️</div>`,
    '',
    [32, 32]
  );
}

// Transit Stops: Blue Square Pill (#1F5FA8)
function getTransportIcon(type: string) {
  const emoji = type === 'metro_station' ? '🚇' : type === 'railway_station' ? '🚆' : '🚌';
  return createCustomMarkerIcon(
    `<div class="w-7 h-7 rounded-lg bg-[#1F5FA8] border-2 border-white shadow-sm flex items-center justify-center text-[11px] text-white" role="img" aria-label="Transit stop">
      <span>${emoji}</span>
    </div>`,
    '',
    [28, 28]
  );
}

// Dynamic Map Resizer to eliminate blank tiles across flex containers
function MapResizer() {
  const map = useMap();
  useEffect(() => {
    map.invalidateSize();
    const t1 = setTimeout(() => map.invalidateSize(), 150);
    const t2 = setTimeout(() => map.invalidateSize(), 600);
    const handleResize = () => map.invalidateSize();
    window.addEventListener('resize', handleResize);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      window.removeEventListener('resize', handleResize);
    };
  }, [map]);
  return null;
}

// Controller to auto-pan and fit bounds when routes change
function MapBoundsController({
  routes,
  selectedRouteIndex,
  origin,
  destination,
}: {
  routes: RouteOption[];
  selectedRouteIndex: number;
  origin: Coordinates | null;
  destination: Coordinates | null;
}) {
  const map = useMap();

  useEffect(() => {
    map.invalidateSize();
    if (routes.length > 0 && routes[selectedRouteIndex]?.coordinates?.length > 0) {
      const coords = routes[selectedRouteIndex].coordinates;
      const bounds = L.latLngBounds(coords.map(([lat, lng]) => [lat, lng]));
      map.fitBounds(bounds, { padding: [60, 60], maxZoom: 16 });
    } else if (origin && destination) {
      const bounds = L.latLngBounds([
        [origin.lat, origin.lng],
        [destination.lat, destination.lng],
      ]);
      map.fitBounds(bounds, { padding: [60, 60], maxZoom: 15 });
    } else if (origin) {
      map.panTo([origin.lat, origin.lng], { animate: true });
    }
  }, [map, routes, selectedRouteIndex, origin, destination]);

  return null;
}

// Map Click Listener
function MapClickHandler({ onMapClick }: { onMapClick?: (coords: Coordinates) => void }) {
  useMapEvents({
    click(e) {
      if (onMapClick) {
        onMapClick({ lat: e.latlng.lat, lng: e.latlng.lng });
      }
    },
  });
  return null;
}

// Custom Zoom and Re-center controls at bottom-right (≥44px touch targets)
function CustomMapControls({ center }: { center: Coordinates }) {
  const map = useMap();
  return (
    <div className="leaflet-bottom leaflet-right !mb-28 lg:!mb-8 !mr-4 z-[990] flex flex-col gap-2 pointer-events-auto">
      {/* Zoom In & Out Stack */}
      <div className="flex flex-col rounded-xl bg-card border border-border shadow-e2 overflow-hidden">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            map.zoomIn();
          }}
          className="w-11 h-11 flex items-center justify-center text-ink hover:bg-canvas active:bg-raised transition-colors border-b border-border text-base font-bold focus-ring-primary"
          title="Zoom in"
          aria-label="Zoom in"
        >
          <Plus className="w-4 h-4 text-ink" />
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            map.zoomOut();
          }}
          className="w-11 h-11 flex items-center justify-center text-ink hover:bg-canvas active:bg-raised transition-colors text-base font-bold focus-ring-primary"
          title="Zoom out"
          aria-label="Zoom out"
        >
          <Minus className="w-4 h-4 text-ink" />
        </button>
      </div>

      {/* Re-center Tool */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          map.setView([center.lat, center.lng], 15, { animate: true });
        }}
        className="w-11 h-11 rounded-xl bg-card border border-border shadow-e2 flex items-center justify-center text-ink hover:bg-canvas active:bg-raised transition-colors focus-ring-primary"
        title="Re-center map"
        aria-label="Re-center map"
      >
        <Crosshair className="w-4 h-4 text-primary" />
      </button>
    </div>
  );
}

export const LeafletInnerMap: React.FC<LeafletInnerMapProps> = ({
  center,
  zoom = 14,
  origin,
  destination,
  originName,
  destinationName,
  currentLocation,
  locationAccuracy,
  routes,
  selectedRouteIndex,
  onSelectRouteIndex,
  streetlights,
  reports,
  facilities,
  transportStops,
  activeLayers,
  onMapClick,
  onSetAsDestination,
  onUpvoteReport,
  onFlagReport,
  onResolveReport,
}) => {
  // Map Tiles: Uses Geoapify osm-bright-smooth tiles if API key configured, otherwise OSM default
  const geoapifyKey = process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY;
  const tileUrl = geoapifyKey && geoapifyKey.trim().length > 0
    ? `https://maps.geoapify.com/v1/tile/osm-bright-smooth/{z}/{x}/{y}.png?apiKey=${geoapifyKey}`
    : process.env.NEXT_PUBLIC_MAP_TILE_URL ||
      'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
  const tileAttribution = geoapifyKey && geoapifyKey.trim().length > 0
    ? 'Powered by <a href="https://www.geoapify.com/" target="_blank">Geoapify</a> | &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    : process.env.NEXT_PUBLIC_MAP_ATTRIBUTION ||
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

  return (
    <MapContainer
      center={[center.lat, center.lng]}
      zoom={zoom}
      zoomControl={false}
      scrollWheelZoom={true}
      className="w-full h-full z-0 font-sans"
    >
      <TileLayer url={tileUrl} attribution={tileAttribution} subdomains="abc" maxZoom={19} />

      <MapResizer />

      <CustomMapControls center={center} />

      <MapBoundsController
        routes={routes}
        selectedRouteIndex={selectedRouteIndex}
        origin={origin}
        destination={destination}
      />

      <MapClickHandler onMapClick={onMapClick} />

      {/* Origin Waypoint Marker (A) */}
      {origin && (
        <Marker position={[origin.lat, origin.lng]} icon={originIcon}>
          <Popup className="herpath-popup">
            <div className="p-1">
              <span className="text-[10px] uppercase font-bold text-ink tracking-wider font-editorial">
                Starting Point (A)
              </span>
              <h4 className="font-editorial font-bold text-sm text-ink mt-0.5">
                {originName || 'Starting Point'}
              </h4>
              <p className="text-[11px] text-text-secondary font-mono mt-0.5">
                {origin.lat.toFixed(4)}, {origin.lng.toFixed(4)}
              </p>
            </div>
          </Popup>
        </Marker>
      )}

      {/* Destination Waypoint Marker (B) */}
      {destination && (
        <Marker position={[destination.lat, destination.lng]} icon={destinationIcon}>
          <Popup className="herpath-popup">
            <div className="p-1">
              <span className="text-[10px] uppercase font-bold text-primary tracking-wider font-editorial">
                Destination (B)
              </span>
              <h4 className="font-editorial font-bold text-sm text-ink mt-0.5">
                {destinationName || 'Destination'}
              </h4>
              <p className="text-[11px] text-text-secondary font-mono mt-0.5">
                {destination.lat.toFixed(4)}, {destination.lng.toFixed(4)}
              </p>
            </div>
          </Popup>
        </Marker>
      )}

      {/* Live User GPS Location Marker & Accuracy Halo */}
      {currentLocation && (
        <>
          <Circle
            center={[currentLocation.lat, currentLocation.lng]}
            radius={Math.min(locationAccuracy || 20, 150)}
            pathOptions={{
              color: '#3B82F6',
              fillColor: '#60A5FA',
              fillOpacity: 0.15,
              weight: 1.5,
              dashArray: '3, 4',
            }}
          />
          <Marker position={[currentLocation.lat, currentLocation.lng]} icon={currentLocationIcon}>
            <Popup className="herpath-popup">
              <div className="p-1 space-y-1">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-blue-600 animate-ping" />
                  <span className="text-[10px] uppercase font-bold text-blue-700 tracking-wider">
                    Your Live GPS Location
                  </span>
                </div>
                <div className="text-xs font-bold text-ink">
                  Current Position
                </div>
                <div className="text-[11px] text-text-secondary">
                  Accuracy: ±{locationAccuracy || 10} meters
                </div>
                <div className="text-[10px] text-text-muted font-mono">
                  {currentLocation.lat.toFixed(5)}, {currentLocation.lng.toFixed(5)}
                </div>
              </div>
            </Popup>
          </Marker>
        </>
      )}

      {/* Render Genuine Route Polylines */}
      {routes.map((route, idx) => {
        const isSelected = idx === selectedRouteIndex;

        return (
          <React.Fragment key={route.id}>
            {/* White Separation Casing Halo for Selected Route */}
            {isSelected && (
              <Polyline
                positions={route.coordinates}
                pathOptions={{
                  color: '#FFFFFF',
                  weight: 8,
                  opacity: 0.95,
                  lineCap: 'round',
                  lineJoin: 'round',
                }}
              />
            )}

            {/* Core Navigation Polyline: Solid Indigo for Selected, Solid Slate for Valid Alternatives */}
            <Polyline
              positions={route.coordinates}
              pathOptions={{
                color: isSelected ? '#4F46E5' : '#94A3B8',
                weight: isSelected ? 5 : 3.5,
                opacity: isSelected ? 1 : 0.8,
                lineCap: 'round',
                lineJoin: 'round',
              }}
              eventHandlers={{
                click: () => onSelectRouteIndex(idx),
              }}
            >
              <Popup className="herpath-popup">
                <div className="p-1.5 space-y-1">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-indigo-600 inline-block" />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 font-sans">
                      {route.perspective === 'fastest'
                        ? 'Primary Pedestrian Path'
                        : route.perspective === 'better_supported'
                        ? 'Infrastructure-Informed Alternative'
                        : 'Pedestrian Route Corridor'}
                    </span>
                  </div>
                  <div className="font-bold text-sm text-slate-900">{route.summary}</div>
                  <div className="text-xs text-slate-600 font-medium">
                    {Math.round(route.durationSeconds / 60)} min · {(route.distanceMeters / 1000).toFixed(1)} km
                  </div>
                </div>
              </Popup>
            </Polyline>
          </React.Fragment>
        );
      })}

      {/* Streetlight Markers */}
      {activeLayers.streetlights &&
        streetlights.map((sl) => (
          <Marker
            key={sl.id}
            position={[sl.coordinates.lat, sl.coordinates.lng]}
            icon={getStreetlightIcon(sl.status)}
          >
            <Popup className="herpath-popup">
              <div className="p-1 space-y-1">
                <div className="flex items-center gap-1.5">
                  <Lightbulb className="w-3.5 h-3.5 text-caution" />
                  <span className="text-xs font-bold text-ink">Streetlight Infrastructure</span>
                </div>
                <div className="text-xs text-text-secondary">
                  Status: <strong className="text-ink capitalize">{sl.status}</strong>
                </div>
                <div className="text-[11px] text-text-muted">Segment: {sl.segmentName}</div>
                <div className="text-[10px] text-text-muted">
                  Reported: {formatRelativeTime(sl.lastReportedAt)}
                </div>
              </div>
            </Popup>
          </Marker>
        ))}

      {/* Essential Facilities Markers */}
      {activeLayers.facilities &&
        facilities.map((fac) => (
          <Marker
            key={fac.id}
            position={[fac.coordinates.lat, fac.coordinates.lng]}
            icon={getFacilityIcon(fac.category)}
          >
            <Popup className="herpath-popup">
              <div className="p-1 space-y-1.5 min-w-[180px]">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold text-primary font-editorial">
                    {fac.category.replace('_', ' ')}
                  </span>
                  {fac.verificationStatus === 'official_verified' && (
                    <span className="text-[9px] bg-verified-tint text-verified font-bold px-1.5 py-0.5 rounded">
                      Verified Civic
                    </span>
                  )}
                </div>
                <div className="font-bold text-xs text-ink">{fac.name}</div>
                <div className="text-[11px] text-text-secondary">{fac.address}</div>
                <div className="text-[11px] text-text-muted">
                  Hours: {fac.openingHours || 'Hours not listed'}
                </div>
                {onSetAsDestination && (
                  <button
                    type="button"
                    onClick={() => onSetAsDestination(fac.coordinates, fac.name)}
                    className="w-full mt-1 btn-primary py-1 text-xs font-semibold"
                  >
                    Set as Destination
                  </button>
                )}
              </div>
            </Popup>
          </Marker>
        ))}

      {/* Community Report Markers */}
      {activeLayers.reports &&
        reports.map((rep) => {
          const catConfig = getCivicCategory(rep.category);
          const staleness = CivicReportingService.checkStaleness(rep);
          const isStale = staleness.isStale && rep.status !== 'resolved';

          return (
            <Marker
              key={rep.id}
              position={[rep.coordinates.lat, rep.coordinates.lng]}
              icon={getReportMarkerIcon(rep)}
            >
              <Popup className="herpath-popup">
                <div className="p-1 space-y-1.5 min-w-[240px] text-xs">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] uppercase font-bold text-grape font-editorial flex items-center gap-1">
                      <span>{catConfig.icon}</span>
                      <span>{catConfig.shortName}</span>
                    </span>
                    <span className="text-[10px] font-mono text-text-muted">
                      {formatRelativeTime(rep.observedAt || rep.createdAt)}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                        rep.status === 'verified'
                          ? 'bg-emerald-100 text-emerald-800'
                          : rep.status === 'under_review'
                          ? 'bg-sky-100 text-sky-800'
                          : rep.status === 'resolved'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {rep.status.toUpperCase()}
                    </span>

                    {/* Truthful Freshness Tag */}
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                        rep.status === 'resolved'
                          ? 'bg-purple-50 text-purple-800'
                          : isStale
                          ? 'bg-amber-100 text-amber-900 border border-amber-300'
                          : staleness.ageHours < 6
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : 'bg-sky-50 text-sky-800'
                      }`}
                    >
                      {rep.status === 'resolved'
                        ? 'Marked resolved'
                        : isStale
                        ? 'Not recently confirmed'
                        : staleness.ageHours < 6
                        ? 'Recent report'
                        : 'Older report'}
                    </span>

                    <span className="text-[9px] bg-canvas text-soft-ink px-1 py-0.5 rounded border border-border">
                      {rep.isDemoData ? 'Demo data' : 'Local submission'}
                    </span>
                  </div>

                  <div className="font-bold text-xs text-ink">{rep.locationName}</div>
                  <div className="text-[11px] text-text-secondary">{rep.description}</div>

                  {rep.evidence?.photoUrl && (
                    <img
                      src={rep.evidence.photoUrl}
                      alt="Report evidence thumbnail"
                      className="w-full h-20 object-cover rounded-lg border border-purple-100"
                    />
                  )}

                  <div className="text-[10px] text-text-muted">
                    Corroborated by {rep.confirmationCount || rep.upvotes} commuters · {rep.flagCount || 0} disputes
                  </div>

                  {rep.status !== 'resolved' ? (
                    <div className="flex items-center gap-1 pt-1 flex-wrap">
                      {onUpvoteReport && (
                        <button
                          type="button"
                          onClick={() => onUpvoteReport(rep.id)}
                          className="flex-1 btn-secondary py-1 text-[10px] font-bold"
                          title="Confirm this issue is still active"
                        >
                          Still happening ({rep.confirmationCount || rep.upvotes})
                        </button>
                      )}
                      {onResolveReport && (
                        <button
                          type="button"
                          onClick={() => onResolveReport(rep.id)}
                          className="px-2 py-1 rounded bg-purple-50 hover:bg-purple-100 text-grape font-bold text-[10px] border border-purple-200"
                          title="Report as resolved/cleared"
                        >
                          Resolved
                        </button>
                      )}
                      {onFlagReport && (
                        <button
                          type="button"
                          onClick={() => onFlagReport(rep.id)}
                          className="px-2 py-1 rounded text-[10px] text-soft-ink hover:text-danger hover:bg-danger-tint"
                          title="Report inaccurate"
                        >
                          Inaccurate
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="text-[10px] text-purple-700 font-bold bg-purple-50 p-1 rounded text-center">
                      ✓ This report was verified resolved
                    </div>
                  )}

                  <div className="text-[9px] text-amber-900/80 bg-amber-50 p-1 rounded border border-amber-200 leading-tight">
                    Notice: Unverified community feedback. No reports does not mean a location is safe.
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}

      {/* Transit Stop Markers */}
      {activeLayers.transport &&
        transportStops.map((ts) => (
          <Marker
            key={ts.id}
            position={[ts.coordinates.lat, ts.coordinates.lng]}
            icon={getTransportIcon(ts.type)}
          >
            <Popup className="herpath-popup">
              <div className="p-1 space-y-1">
                <span className="text-[10px] uppercase font-bold text-info font-editorial">
                  {ts.type.replace('_', ' ')}
                </span>
                <div className="font-bold text-xs text-ink">{ts.name}</div>
                {ts.lines && ts.lines.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {ts.lines.map((line) => (
                      <span
                        key={line}
                        className="text-[10px] bg-canvas text-ink px-1.5 py-0.5 rounded border border-border"
                      >
                        {line}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
    </MapContainer>
  );
};
