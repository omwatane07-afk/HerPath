'use client';

import React, { useEffect } from 'react';
import {
  MapContainer,
  TileLayer,
  Polyline,
  Marker,
  Popup,
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

// Origin: Nightbloom Ink (#1E0F28) with white casing & gold text 'A'
const originIcon = createCustomMarkerIcon(
  `<div class="w-9 h-9 rounded-full bg-[#1E0F28] border-2 border-white shadow-e2 flex items-center justify-center text-[#C9A25E] font-editorial font-bold text-xs ring-2 ring-[#1E0F28]/25" role="img" aria-label="Starting point A">A</div>`,
  '',
  [36, 36]
);

// Destination: Electric Violet (#5A2FC2) with white casing & text 'B'
const destinationIcon = createCustomMarkerIcon(
  `<div class="w-9 h-9 rounded-full bg-[#5A2FC2] border-2 border-white shadow-e2 flex items-center justify-center text-white font-editorial font-bold text-xs ring-2 ring-[#5A2FC2]/30" role="img" aria-label="Destination B">B</div>`,
  '',
  [36, 36]
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

// Community Disturbance/Hazard: Amber Triangle (#A8560A)
function getDisturbanceIcon(category: string) {
  return createCustomMarkerIcon(
    `<div class="w-8 h-8 bg-[#FDF2E3] border-2 border-[#A8560A] rounded-md flex items-center justify-center shadow-sm text-xs text-[#A8560A] font-bold" role="img" aria-label="Community Report: caution disturbance">⚠️</div>`,
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
    if (routes.length > 0 && routes[selectedRouteIndex]?.coordinates?.length > 0) {
      const coords = routes[selectedRouteIndex].coordinates;
      const bounds = L.latLngBounds(coords.map(([lat, lng]) => [lat, lng]));
      map.fitBounds(bounds, { padding: [80, 80], maxZoom: 16 });
    } else if (origin && destination) {
      const bounds = L.latLngBounds([
        [origin.lat, origin.lng],
        [destination.lat, destination.lng],
      ]);
      map.fitBounds(bounds, { padding: [90, 90], maxZoom: 15 });
    } else if (origin) {
      map.panTo([origin.lat, origin.lng]);
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
  // Muted Light Basemap Tiles (Standard OSM with CSS desaturation and warm lightness filter)
  const tileUrl =
    process.env.NEXT_PUBLIC_MAP_TILE_URL ||
    'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
  const tileAttribution =
    process.env.NEXT_PUBLIC_MAP_ATTRIBUTION ||
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

  return (
    <MapContainer
      center={[center.lat, center.lng]}
      zoom={zoom}
      zoomControl={false}
      scrollWheelZoom={true}
      className="w-full h-full z-0 font-sans"
    >
      <TileLayer url={tileUrl} attribution={tileAttribution} subdomains="abcd" />

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

      {/* Render Route Polylines */}
      {routes.map((route, idx) => {
        const isSelected = idx === selectedRouteIndex;
        const isSynthetic =
          (route as any).source === 'synthetic_fallback' ||
          route.steps.some((s) => s.instruction.includes('thoroughfare'));

        return (
          <React.Fragment key={route.id}>
            {/* White Separation Casing Halo for Selected Route */}
            {isSelected && (
              <Polyline
                positions={route.coordinates}
                pathOptions={{
                  color: '#FFFFFF',
                  weight: 10,
                  opacity: 0.98,
                  lineCap: 'round',
                  lineJoin: 'round',
                }}
              />
            )}

            {/* Route Polyline: Electric Violet #5A2FC2 for Selected, Slate #6E6090 Dashed for Alternates */}
            <Polyline
              positions={route.coordinates}
              pathOptions={{
                color: isSelected ? '#5A2FC2' : '#6E6090',
                weight: isSelected ? 6 : 4,
                opacity: isSelected ? 1 : 0.55,
                dashArray: !isSelected || isSynthetic ? '6, 6' : undefined,
                lineCap: 'round',
                lineJoin: 'round',
              }}
              eventHandlers={{
                click: () => onSelectRouteIndex(idx),
              }}
            >
              <Popup className="herpath-popup">
                <div className="p-1 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-primary font-editorial">
                    {route.perspective === 'fastest'
                      ? 'Fastest Walking Path'
                      : route.perspective === 'better_supported'
                      ? 'Better-Supported Corridor'
                      : 'Balanced Walking Route'}
                  </span>
                  <div className="font-bold text-sm text-ink">{route.summary}</div>
                  <div className="text-xs text-text-secondary font-mono">
                    {Math.round(route.durationSeconds / 60)} min · {(route.distanceMeters / 1000).toFixed(1)} km
                  </div>
                  <div className="text-[11px] text-text-muted">
                    {isSynthetic
                      ? 'Note: Approximated corridor geometry'
                      : 'Verified OSRM pedestrian corridor'}
                  </div>
                </div>
              </Popup>
            </Polyline>
          </React.Fragment>
        );
      })}

      {/* Reported-Risk Hazard Overlays on Map: Amber Dashed Line + Text Label */}
      {reports
        .filter((r) => r.status !== 'resolved')
        .slice(0, 2)
        .map((r, i) => {
          const delta = i === 0 ? 0.002 : -0.002;
          const hazardLine: [number, number][] = [
            [r.coordinates.lat - 0.0008, r.coordinates.lng - delta],
            [r.coordinates.lat + 0.0008, r.coordinates.lng + delta],
          ];
          return (
            <Polyline
              key={`hazard-overlay-${r.id}`}
              positions={hazardLine}
              pathOptions={{
                color: '#A8560A',
                weight: 4,
                dashArray: '4, 6',
                opacity: 0.8,
              }}
            >
              <Popup className="herpath-popup">
                <div className="p-1">
                  <span className="text-[10px] font-bold uppercase text-caution font-editorial">
                    Reported Observation Area
                  </span>
                  <p className="text-xs font-semibold text-ink mt-0.5">{r.locationName}</p>
                </div>
              </Popup>
            </Polyline>
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
        reports.map((rep) => (
          <Marker
            key={rep.id}
            position={[rep.coordinates.lat, rep.coordinates.lng]}
            icon={getDisturbanceIcon(rep.category)}
          >
            <Popup className="herpath-popup">
              <div className="p-1 space-y-1.5 min-w-[190px]">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold text-caution font-editorial">
                    Community Report
                  </span>
                  <span className="text-[10px] font-mono text-text-muted">
                    {formatRelativeTime(rep.createdAt)}
                  </span>
                </div>
                <div className="font-bold text-xs text-ink">{rep.locationName}</div>
                <div className="text-[11px] text-text-secondary">{rep.description}</div>
                <div className="text-[10px] text-text-muted italic">
                  Corroborated by {rep.upvotes} travelers
                </div>
                {onUpvoteReport && rep.status !== 'resolved' && (
                  <button
                    type="button"
                    onClick={() => onUpvoteReport(rep.id)}
                    className="w-full mt-1 btn-secondary py-1 text-xs"
                  >
                    Confirm Observation (+1)
                  </button>
                )}
              </div>
            </Popup>
          </Marker>
        ))}

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
