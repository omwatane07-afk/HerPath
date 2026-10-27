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

// Custom DivIcon Builders for pristine light-mode glass & soft rounded markers
function createCustomMarkerIcon(html: string, className: string = '', size: [number, number] = [32, 32]) {
  return L.divIcon({
    html,
    className: `custom-leaflet-icon ${className}`,
    iconSize: size,
    iconAnchor: [size[0] / 2, size[1]],
    popupAnchor: [0, -size[1]],
  });
}

const originIcon = createCustomMarkerIcon(
  `<div class="w-8 h-8 rounded-full bg-[#159F91] border-2 border-white shadow-float flex items-center justify-center text-white font-black text-xs ring-4 ring-teal-100/90">A</div>`,
  '',
  [32, 32]
);

const destinationIcon = createCustomMarkerIcon(
  `<div class="w-8 h-8 rounded-full bg-[#E11D48] border-2 border-white shadow-float flex items-center justify-center text-white font-black text-xs ring-4 ring-rose-100/90">B</div>`,
  '',
  [32, 32]
);

function getStreetlightIcon(status: string) {
  if (status === 'working' || status === 'resolved') {
    return createCustomMarkerIcon(
      `<div class="w-7 h-7 rounded-full bg-white border border-amber-200 shadow-card flex items-center justify-center text-xs ring-2 ring-amber-100">💡</div>`,
      '',
      [28, 28]
    );
  }
  return createCustomMarkerIcon(
    `<div class="w-7 h-7 rounded-full bg-white border border-rose-200 shadow-card flex items-center justify-center text-xs animate-pulse ring-2 ring-rose-100">⚠️</div>`,
    '',
    [28, 28]
  );
}

function getFacilityIcon(category: string) {
  let emoji = '🏢';
  let ring = 'ring-teal-100';
  let border = 'border-teal-200';
  if (category === 'womens_restroom') {
    emoji = '🚺';
    ring = 'ring-pink-100';
    border = 'border-pink-200';
  } else if (category === 'public_toilet') {
    emoji = '🚻';
    ring = 'ring-cyan-100';
    border = 'border-cyan-200';
  } else if (category === 'pharmacy') {
    emoji = '💊';
    ring = 'ring-emerald-100';
    border = 'border-emerald-200';
  } else if (category === 'hospital') {
    emoji = '🏥';
    ring = 'ring-rose-100';
    border = 'border-rose-200';
  } else if (category === 'police_station') {
    emoji = '👮';
    ring = 'ring-blue-100';
    border = 'border-blue-200';
  } else if (category === 'help_point') {
    emoji = 'ℹ️';
    ring = 'ring-amber-100';
    border = 'border-amber-200';
  }
  return createCustomMarkerIcon(
    `<div class="w-7 h-7 rounded-full bg-white border ${border} shadow-card flex items-center justify-center text-xs ring-2 ${ring}">${emoji}</div>`,
    '',
    [28, 28]
  );
}

function getDisturbanceIcon(category: string) {
  return createCustomMarkerIcon(
    `<div class="w-7 h-7 rounded-full bg-white border border-rose-300 shadow-card flex items-center justify-center text-xs ring-4 ring-rose-100/90 animate-bounce">⚡</div>`,
    '',
    [28, 28]
  );
}

function getTransportIcon(type: string) {
  const emoji = type === 'metro_station' ? '🚇' : type === 'railway_station' ? '🚆' : '🚌';
  return createCustomMarkerIcon(
    `<div class="w-7 h-7 rounded-full bg-white border border-softblue-200 shadow-card flex items-center justify-center text-xs ring-2 ring-softblue-100">${emoji}</div>`,
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
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 16 });
    } else if (origin && destination) {
      const bounds = L.latLngBounds([
        [origin.lat, origin.lng],
        [destination.lat, destination.lng],
      ]);
      map.fitBounds(bounds, { padding: [60, 60], maxZoom: 15 });
    } else if (origin) {
      map.setView([origin.lat, origin.lng], 15);
    }
  }, [routes, selectedRouteIndex, origin, destination, map]);

  return null;
}

// Click event listener on map
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
      scrollWheelZoom={true}
      className="w-full h-full z-0 font-sans"
    >
      <TileLayer url={tileUrl} attribution={tileAttribution} />

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
              <span className="text-[10px] uppercase font-bold text-emerald-600 tracking-wider">
                Origin / Start
              </span>
              <h4 className="font-bold text-sm text-brand-text mt-0.5">{originName || 'Starting Point'}</h4>
              <p className="text-[11px] text-brand-text-secondary font-mono mt-0.5">
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
              <span className="text-[10px] uppercase font-bold text-danger-600 tracking-wider">
                Destination
              </span>
              <h4 className="font-bold text-sm text-brand-text mt-0.5">{destinationName || 'Destination Point'}</h4>
              <p className="text-[11px] text-brand-text-secondary font-mono mt-0.5">
                {destination.lat.toFixed(4)}, {destination.lng.toFixed(4)}
              </p>
            </div>
          </Popup>
        </Marker>
      )}

      {/* Render Routes */}
      {routes.map((route, idx) => {
        const isSelected = idx === selectedRouteIndex;
        // Styling based on perspective (Royal Soft Glass palette)
        let color = '#94A3B8'; // soft slate
        if (isSelected) {
          if (route.perspective === 'better_supported') color = '#159F91'; // Royal Teal
          else if (route.perspective === 'fastest') color = '#7C3AED'; // Royal Purple
          else color = '#2563EB'; // Royal Blue
        }

        return (
          <React.Fragment key={route.id}>
            {/* Outer halo outline for selected route */}
            {isSelected && (
              <Polyline
                positions={route.coordinates}
                pathOptions={{
                  color: '#FFFFFF',
                  weight: 9,
                  opacity: 0.95,
                  lineCap: 'round',
                  lineJoin: 'round',
                }}
              />
            )}
            <Polyline
              positions={route.coordinates}
              pathOptions={{
                color: color,
                weight: isSelected ? 5.5 : 3.5,
                opacity: isSelected ? 1 : 0.65,
                dashArray: isSelected ? undefined : '5, 8',
                lineCap: 'round',
                lineJoin: 'round',
              }}
              eventHandlers={{
                click: () => onSelectRouteIndex(idx),
              }}
            >
              <Popup className="herpath-popup">
                <div className="p-1 max-w-xs">
                  <span className="text-[10px] uppercase font-bold text-teal-600 tracking-wider">
                    {route.name}
                  </span>
                  <div className="text-sm font-bold text-brand-text mt-0.5">{route.summary}</div>
                  <div className="text-xs text-brand-text-secondary mt-1 flex gap-3 font-medium">
                    <span>⏱️ {Math.round(route.durationSeconds / 60)} min</span>
                    <span>📏 {(route.distanceMeters / 1000).toFixed(1)} km</span>
                  </div>
                  <p className="text-[11px] text-brand-text-secondary mt-1.5 leading-relaxed">
                    {route.relativeScoreDescription}
                  </p>
                  {!isSelected && (
                    <button
                      onClick={() => onSelectRouteIndex(idx)}
                      className="mt-2.5 w-full py-1.5 px-3 text-xs font-bold bg-teal-500 hover:bg-teal-600 text-white rounded-xl transition-colors shadow-sm"
                    >
                      Select this Route
                    </button>
                  )}
                </div>
              </Popup>
            </Polyline>
          </React.Fragment>
        );
      })}

      {/* Streetlights Layer */}
      {activeLayers.streetlights &&
        streetlights.map((sl) => (
          <Marker
            key={sl.id}
            position={[sl.coordinates.lat, sl.coordinates.lng]}
            icon={getStreetlightIcon(sl.status)}
          >
            <Popup className="herpath-popup">
              <div className="p-1 space-y-1.5 min-w-[210px]">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] uppercase font-bold text-brand-text-muted">Streetlight</span>
                  <StreetlightStatusBadge status={sl.status} />
                </div>
                <h4 className="font-bold text-sm text-brand-text leading-snug">{sl.segmentName}</h4>
                <div className="text-xs text-brand-text-secondary">{sl.notes || 'Infrastructure pole record'}</div>
                <div className="pt-1.5 border-t border-brand-border flex items-center justify-between text-[11px] text-brand-text-secondary">
                  <DataSourceBadge source={sl.reportedSource} />
                  <span>{formatRelativeTime(sl.lastReportedAt)}</span>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}

      {/* Facilities Layer */}
      {activeLayers.facilities &&
        facilities.map((fac) => (
          <Marker
            key={fac.id}
            position={[fac.coordinates.lat, fac.coordinates.lng]}
            icon={getFacilityIcon(fac.category)}
          >
            <Popup className="herpath-popup">
              <div className="p-1 space-y-1.5 min-w-[220px]">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] uppercase font-bold text-teal-600">
                    {fac.category.replace(/_/g, ' ')}
                  </span>
                  <DataSourceBadge source={fac.source} />
                </div>
                <h4 className="font-bold text-sm text-brand-text leading-tight">{fac.name}</h4>
                <div className="text-xs text-brand-text-secondary">{fac.address}</div>
                {fac.openingHours && (
                  <div className="text-xs text-brand-text-secondary font-mono">🕒 {fac.openingHours}</div>
                )}
                <div className="flex flex-wrap gap-1 mt-1 text-[11px]">
                  {fac.isAccessible && (
                    <span className="px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 font-semibold border border-teal-200">
                      ♿ Accessible
                    </span>
                  )}
                  {fac.hasFemaleStaff && (
                    <span className="px-2 py-0.5 rounded-full bg-pink-50 text-pink-700 font-semibold border border-pink-200">
                      👩 Female Staff On Duty
                    </span>
                  )}
                </div>
                {onSetAsDestination && (
                  <button
                    onClick={() => onSetAsDestination(fac.coordinates, fac.name)}
                    className="mt-2.5 w-full py-1.5 px-3 text-xs font-bold bg-teal-500 hover:bg-teal-600 text-white rounded-xl transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <Navigation className="w-3.5 h-3.5" />
                    <span>Get Directions Here</span>
                  </button>
                )}
              </div>
            </Popup>
          </Marker>
        ))}

      {/* Community Reports Layer */}
      {activeLayers.reports &&
        reports
          .filter((rep) => rep.status !== 'resolved')
          .map((rep) => (
            <Marker
              key={rep.id}
              position={[rep.coordinates.lat, rep.coordinates.lng]}
              icon={getDisturbanceIcon(rep.category)}
            >
              <Popup className="herpath-popup">
                <div className="p-1 space-y-2 min-w-[240px]">
                  <div className="flex items-center justify-between gap-1">
                    <DisturbanceCategoryLabel category={rep.category} />
                    <DataSourceBadge source={rep.source} />
                  </div>
                  <h4 className="font-bold text-sm text-brand-text leading-tight">
                    {rep.locationName}
                  </h4>
                  <p className="text-xs text-brand-text-secondary italic bg-brand-bg p-2 rounded-xl border border-brand-border">
                    "{rep.description}"
                  </p>
                  <div className="flex items-center justify-between text-xs text-brand-text-secondary pt-1.5 border-t border-brand-border">
                    <span>{formatRelativeTime(rep.createdAt)}</span>
                    <div className="flex items-center gap-2">
                      {onUpvoteReport && (
                        <button
                          onClick={() => onUpvoteReport(rep.id)}
                          className="px-2 py-1 rounded-lg bg-brand-bg hover:bg-brand-bg-secondary text-brand-text text-xs font-semibold border border-brand-border transition-colors"
                          title="Corroborate report"
                        >
                          👍 {rep.upvotes}
                        </button>
                      )}
                      {onResolveReport && (
                        <button
                          onClick={() => onResolveReport(rep.id)}
                          className="px-2.5 py-1 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-700 text-xs font-bold transition-colors"
                          title="Mark resolved"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}

      {/* Public Transport Layer */}
      {activeLayers.transport &&
        transportStops.map((trn) => (
          <Marker
            key={trn.id}
            position={[trn.coordinates.lat, trn.coordinates.lng]}
            icon={getTransportIcon(trn.type)}
          >
            <Popup className="herpath-popup">
              <div className="p-1 space-y-1.5 min-w-[210px]">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] uppercase font-bold text-softblue-500">
                    {trn.type.replace(/_/g, ' ')}
                  </span>
                  <DataSourceBadge source={trn.source} />
                </div>
                <h4 className="font-bold text-sm text-brand-text leading-tight">{trn.name}</h4>
                <div className="text-xs text-brand-text-secondary">
                  Lines: {trn.lines.join(', ') || 'Regional Transit'}
                </div>
                <div className="flex flex-wrap gap-1 mt-1 text-[11px]">
                  {trn.hasWomensCoach && (
                    <span className="px-2 py-0.5 rounded-full bg-pink-50 text-pink-700 font-semibold border border-pink-200">
                      🚺 Women's Coach Available
                    </span>
                  )}
                  {trn.hasCCTV && (
                    <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-semibold border border-blue-200">
                      📹 CCTV Monitored
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-brand-text-muted italic pt-1">
                  *Static mapped location. Live real-time arrivals unverified.
                </p>
              </div>
            </Popup>
          </Marker>
        ))}
    </MapContainer>
  );
};
