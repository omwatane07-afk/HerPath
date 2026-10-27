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
import { DataSourceBadge, StreetlightStatusBadge, DisturbanceCategoryLabel } from '../ui/Badge';
import { formatRelativeTime } from '@/lib/utils';
import {
  Navigation,
  MapPin,
  Lightbulb,
  Building2,
  Bus,
  Shield,
  AlertTriangle,
  HeartPulse,
  Crosshair,
  Plus,
  Minus,
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

// Custom DivIcon Builder
function createCustomMarkerIcon(html: string, className: string = '', size: [number, number] = [32, 32]) {
  return L.divIcon({
    html,
    className: `custom-leaflet-icon ${className}`,
    iconSize: size,
    iconAnchor: [size[0] / 2, size[1]],
    popupAnchor: [0, -size[1]],
  });
}

// Origin: Ink pin with contrasting white border
const originIcon = createCustomMarkerIcon(
  `<div class="w-8 h-8 rounded-full bg-[#14213D] border-2 border-white shadow-e2 flex items-center justify-center text-white font-serif font-bold text-xs ring-2 ring-[#14213D]/20">A</div>`,
  '',
  [32, 32]
);

// Destination: Peacock pin with contrasting white border
const destinationIcon = createCustomMarkerIcon(
  `<div class="w-8 h-8 rounded-full bg-[#0E7C86] border-2 border-white shadow-e2 flex items-center justify-center text-white font-serif font-bold text-xs ring-2 ring-[#0E7C86]/20">B</div>`,
  '',
  [32, 32]
);

function getStreetlightIcon(status: string) {
  if (status === 'working' || status === 'resolved') {
    return createCustomMarkerIcon(
      `<div class="w-7 h-7 rounded-full bg-white border border-[#E3DCCD] shadow-e1 flex items-center justify-center text-xs text-[#1B6B4A]">💡</div>`,
      '',
      [28, 28]
    );
  }
  return createCustomMarkerIcon(
    `<div class="w-7 h-7 rounded-full bg-[#FDF1E0] border border-[#B25E00] shadow-e1 flex items-center justify-center text-xs text-[#B25E00]">⚠️</div>`,
    '',
    [28, 28]
  );
}

function getFacilityIcon(category: string) {
  let emoji = '🏢';
  let border = 'border-[#E3DCCD]';
  if (category === 'womens_restroom') {
    emoji = '🚺';
  } else if (category === 'public_toilet') {
    emoji = '🚻';
  } else if (category === 'pharmacy') {
    emoji = '💊';
  } else if (category === 'hospital') {
    emoji = '🏥';
  } else if (category === 'police_station') {
    emoji = '🛡️';
  } else if (category === 'help_point') {
    emoji = 'ℹ️';
  }
  return createCustomMarkerIcon(
    `<div class="w-7 h-7 rounded-full bg-white border ${border} shadow-e1 flex items-center justify-center text-xs text-[#14213D]">${emoji}</div>`,
    '',
    [28, 28]
  );
}

function getDisturbanceIcon(category: string) {
  return createCustomMarkerIcon(
    `<div class="w-7 h-7 rounded-full bg-[#FBE9EA] border border-[#A4161A] shadow-e1 flex items-center justify-center text-xs text-[#A4161A]">⚠️</div>`,
    '',
    [28, 28]
  );
}

function getTransportIcon(type: string) {
  const emoji = type === 'metro_station' ? '🚇' : type === 'railway_station' ? '🚆' : '🚌';
  return createCustomMarkerIcon(
    `<div class="w-7 h-7 rounded-full bg-white border border-[#1D5FA8]/30 shadow-e1 flex items-center justify-center text-xs text-[#1D5FA8]">${emoji}</div>`,
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
      map.fitBounds(bounds, { padding: [60, 60], maxZoom: 16 });
    } else if (origin && destination) {
      const bounds = L.latLngBounds([
        [origin.lat, origin.lng],
        [destination.lat, destination.lng],
      ]);
      map.fitBounds(bounds, { padding: [70, 70], maxZoom: 15 });
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

// Consolidate zoom and re-center controls at bottom-right (≥44px targets)
function CustomMapControls({ center }: { center: Coordinates }) {
  const map = useMap();
  return (
    <div className="leaflet-bottom leaflet-right !mb-28 lg:!mb-8 !mr-4 z-[990] flex flex-col gap-2 pointer-events-auto">
      {/* Zoom In & Out Stack (44px touch targets) */}
      <div className="flex flex-col rounded-lg bg-white border border-border shadow-e2 overflow-hidden">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            map.zoomIn();
          }}
          className="w-11 h-11 flex items-center justify-center text-ink hover:bg-paper active:bg-raised transition-colors border-b border-border text-base font-bold focus-ring-peacock"
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
          className="w-11 h-11 flex items-center justify-center text-ink hover:bg-paper active:bg-raised transition-colors text-base font-bold focus-ring-peacock"
          title="Zoom out"
          aria-label="Zoom out"
        >
          <Minus className="w-4 h-4 text-ink" />
        </button>
      </div>

      {/* Re-center / GPS Location Tool (44px target) */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          map.setView([center.lat, center.lng], 15, { animate: true });
        }}
        className="w-11 h-11 rounded-lg bg-white border border-border shadow-e2 flex items-center justify-center text-ink hover:bg-paper active:bg-raised transition-colors focus-ring-peacock"
        title="Re-center map"
        aria-label="Re-center map"
      >
        <Crosshair className="w-4 h-4 text-peacock" />
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
  const tileUrl =
    process.env.NEXT_PUBLIC_MAP_TILE_URL || 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
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
      <TileLayer url={tileUrl} attribution={tileAttribution} />

      <CustomMapControls center={center} />

      <MapBoundsController
        routes={routes}
        selectedRouteIndex={selectedRouteIndex}
        origin={origin}
        destination={destination}
      />

      <MapClickHandler onMapClick={onMapClick} />

      {/* Origin Marker */}
      {origin && (
        <Marker position={[origin.lat, origin.lng]} icon={originIcon}>
          <Popup className="herpath-popup">
            <div className="p-1">
              <span className="text-[10px] uppercase font-bold text-ink tracking-wider">
                Starting Point (A)
              </span>
              <h4 className="font-serif font-bold text-sm text-ink mt-0.5">{originName || 'Starting Point'}</h4>
              <p className="text-[11px] text-text-secondary font-mono mt-0.5">
                {origin.lat.toFixed(4)}, {origin.lng.toFixed(4)}
              </p>
            </div>
          </Popup>
        </Marker>
      )}

      {/* Destination Marker */}
      {destination && (
        <Marker position={[destination.lat, destination.lng]} icon={destinationIcon}>
          <Popup className="herpath-popup">
            <div className="p-1">
              <span className="text-[10px] uppercase font-bold text-peacock-dark tracking-wider">
                Destination (B)
              </span>
              <h4 className="font-serif font-bold text-sm text-ink mt-0.5">{destinationName || 'Destination'}</h4>
              <p className="text-[11px] text-text-secondary font-mono mt-0.5">
                {destination.lat.toFixed(4)}, {destination.lng.toFixed(4)}
              </p>
            </div>
          </Popup>
        </Marker>
      )}

      {/* Render Routes */}
      {routes.map((route, idx) => {
        const isSelected = idx === selectedRouteIndex;
        const isSynthetic = (route as any).source === 'synthetic_fallback' || route.steps.some((s) => s.instruction.includes('thoroughfare'));

        return (
          <React.Fragment key={route.id}>
            {/* White halo casing for separation (selected route) */}
            {isSelected && (
              <Polyline
                positions={route.coordinates}
                pathOptions={{
                  color: '#FFFFFF',
                  weight: 10,
                  opacity: 0.95,
                  lineCap: 'round',
                  lineJoin: 'round',
                }}
              />
            )}
            {/* Route Polyline: Peacock #0E7C86 for selected, Slate #55607A for alternates */}
            <Polyline
              positions={route.coordinates}
              pathOptions={{
                color: isSelected ? '#0E7C86' : '#55607A',
                weight: isSelected ? 6 : 3.5,
                opacity: isSelected ? 1 : 0.55,
                dashArray: isSynthetic ? '8, 8' : undefined,
                lineCap: 'round',
                lineJoin: 'round',
              }}
              eventHandlers={{
                click: () => onSelectRouteIndex(idx),
              }}
            >
              <Popup className="herpath-popup">
                <div className="p-1 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-peacock-dark">
                    {route.name}
                  </span>
                  <div className="font-serif font-bold text-sm text-ink">{route.summary}</div>
                  <div className="text-xs text-text-secondary">
                    {Math.round(route.durationSeconds / 60)} min · {(route.distanceMeters / 1000).toFixed(1)} km
                  </div>
                  {isSynthetic && (
                    <div className="text-[10px] text-text-secondary bg-paper px-1.5 py-0.5 rounded border border-border inline-block">
                      Approximate path model
                    </div>
                  )}
                </div>
              </Popup>
            </Polyline>
          </React.Fragment>
        );
      })}

      {/* Streetlight Markers Layer */}
      {activeLayers.streetlights &&
        streetlights.map((sl) => (
          <Marker
            key={sl.id}
            position={[sl.coordinates.lat, sl.coordinates.lng]}
            icon={getStreetlightIcon(sl.status)}
          >
            <Popup className="herpath-popup">
              <div className="p-1 space-y-1.5 min-w-[200px]">
                <div className="flex items-center justify-between">
                  <StreetlightStatusBadge status={sl.status} />
                  <DataSourceBadge source={sl.reportedSource} />
                </div>
                <h4 className="font-bold text-xs text-ink">{sl.segmentName}</h4>
                {sl.notes && <p className="text-[11px] text-text-secondary">{sl.notes}</p>}
                <div className="text-[10px] text-text-secondary pt-1 border-t border-border">
                  Reported {formatRelativeTime(sl.lastReportedAt)}
                </div>
              </div>
            </Popup>
          </Marker>
        ))}

      {/* Facility Markers Layer */}
      {activeLayers.facilities &&
        facilities.map((fac) => (
          <Marker
            key={fac.id}
            position={[fac.coordinates.lat, fac.coordinates.lng]}
            icon={getFacilityIcon(fac.category)}
          >
            <Popup className="herpath-popup">
              <div className="p-1 space-y-2 min-w-[220px]">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold text-peacock-dark">
                    {fac.category.replace(/_/g, ' ')}
                  </span>
                  <DataSourceBadge source={fac.source} />
                </div>
                <div>
                  <h4 className="font-serif font-bold text-sm text-ink">{fac.name}</h4>
                  <p className="text-[11px] text-text-secondary mt-0.5">{fac.address}</p>
                </div>
                <div className="text-[11px] text-text-secondary">
                  <strong>Hours:</strong> {fac.openingHours || 'Hours not listed'}
                </div>
                {onSetAsDestination && (
                  <button
                    type="button"
                    onClick={() => onSetAsDestination(fac.coordinates, fac.name)}
                    className="w-full btn-ink py-1.5 px-3 text-xs flex items-center justify-center gap-1.5"
                  >
                    <Navigation className="w-3 h-3 text-peacock-tint" />
                    <span>Get Directions</span>
                  </button>
                )}
              </div>
            </Popup>
          </Marker>
        ))}

      {/* Community Disturbance Markers Layer */}
      {activeLayers.reports &&
        reports
          .filter((r) => r.status !== 'resolved')
          .map((rep) => (
            <Marker
              key={rep.id}
              position={[rep.coordinates.lat, rep.coordinates.lng]}
              icon={getDisturbanceIcon(rep.category)}
            >
              <Popup className="herpath-popup">
                <div className="p-1 space-y-2 min-w-[220px]">
                  <div className="flex items-center justify-between">
                    <DisturbanceCategoryLabel category={rep.category} />
                    <span className="text-[10px] text-text-secondary">
                      {formatRelativeTime(rep.createdAt)}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-ink">{rep.locationName}</h4>
                    <p className="text-[11px] text-text-secondary mt-0.5">{rep.description}</p>
                  </div>
                  {/* Community Corroboration Actions */}
                  <div className="flex gap-2 pt-1 border-t border-border">
                    {onUpvoteReport && (
                      <button
                        type="button"
                        onClick={() => onUpvoteReport(rep.id)}
                        className="btn-secondary flex-1 py-1 px-2 text-[11px]"
                      >
                        Still an issue ({rep.upvotes})
                      </button>
                    )}
                    {onFlagReport && (
                      <button
                        type="button"
                        onClick={() => onFlagReport(rep.id)}
                        className="btn-secondary py-1 px-2 text-[11px] text-text-secondary"
                        title="Flag inaccurate report"
                      >
                        Flag
                      </button>
                    )}
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}

      {/* Transport Stops Layer */}
      {activeLayers.transport &&
        transportStops.map((trn) => (
          <Marker
            key={trn.id}
            position={[trn.coordinates.lat, trn.coordinates.lng]}
            icon={getTransportIcon(trn.type)}
          >
            <Popup className="herpath-popup">
              <div className="p-1 space-y-1.5 min-w-[200px]">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold text-info">
                    {trn.type.replace(/_/g, ' ')}
                  </span>
                  <DataSourceBadge source={trn.source} />
                </div>
                <h4 className="font-bold text-xs text-ink">{trn.name}</h4>
                {trn.hasWomensCoach && (
                  <div className="text-[10px] font-semibold text-peacock-dark bg-peacock-tint px-2 py-0.5 rounded">
                    Designated Women’s Coach Available
                  </div>
                )}
                {trn.lines.length > 0 && (
                  <div className="text-[11px] text-text-secondary">
                    Lines: {trn.lines.join(', ')}
                  </div>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
    </MapContainer>
  );
};
