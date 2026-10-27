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

// Custom DivIcon Builders for pristine crisp SVG icons without 404 image errors
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
  `<div class="w-8 h-8 rounded-full bg-emerald-600 border-2 border-white shadow-xl flex items-center justify-center text-white font-bold text-sm ring-4 ring-emerald-500/30">A</div>`,
  '',
  [32, 32]
);

const destinationIcon = createCustomMarkerIcon(
  `<div class="w-8 h-8 rounded-full bg-rose-600 border-2 border-white shadow-xl flex items-center justify-center text-white font-bold text-sm ring-4 ring-rose-500/30">B</div>`,
  '',
  [32, 32]
);

function getStreetlightIcon(status: string) {
  if (status === 'working' || status === 'resolved') {
    return createCustomMarkerIcon(
      `<div class="w-6 h-6 rounded-full bg-amber-400 border border-amber-200 shadow-md flex items-center justify-center text-amber-950 font-bold text-xs ring-2 ring-amber-400/40">💡</div>`,
      '',
      [24, 24]
    );
  }
  return createCustomMarkerIcon(
    `<div class="w-6 h-6 rounded-full bg-rose-600 border border-rose-300 shadow-md flex items-center justify-center text-white font-bold text-xs animate-pulse ring-2 ring-rose-500/50">⚠️</div>`,
    '',
    [24, 24]
  );
}

function getFacilityIcon(category: string) {
  let bg = 'bg-teal-600';
  let emoji = '🏢';
  if (category === 'womens_restroom') {
    bg = 'bg-pink-600';
    emoji = '🚺';
  } else if (category === 'public_toilet') {
    bg = 'bg-cyan-700';
    emoji = '🚻';
  } else if (category === 'pharmacy') {
    bg = 'bg-emerald-600';
    emoji = '💊';
  } else if (category === 'hospital') {
    bg = 'bg-red-600';
    emoji = '🏥';
  } else if (category === 'police_station') {
    bg = 'bg-blue-700';
    emoji = '👮';
  } else if (category === 'help_point') {
    bg = 'bg-amber-600';
    emoji = 'ℹ️';
  }
  return createCustomMarkerIcon(
    `<div class="w-7 h-7 rounded-full ${bg} border border-white/90 shadow-md flex items-center justify-center text-xs ring-2 ring-white/20">${emoji}</div>`,
    '',
    [28, 28]
  );
}

function getDisturbanceIcon(category: string) {
  return createCustomMarkerIcon(
    `<div class="w-7 h-7 rounded-full bg-rose-600 border border-white shadow-lg flex items-center justify-center text-white text-xs animate-bounce ring-4 ring-rose-500/40">⚡</div>`,
    '',
    [28, 28]
  );
}

function getTransportIcon(type: string) {
  const emoji = type === 'metro_station' ? '🚇' : type === 'railway_station' ? '🚆' : '🚌';
  return createCustomMarkerIcon(
    `<div class="w-7 h-7 rounded-full bg-indigo-700 border border-white/90 shadow-md flex items-center justify-center text-xs ring-2 ring-indigo-400/40">${emoji}</div>`,
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
              <h4 className="font-semibold text-sm text-slate-800">{originName || 'Starting Point'}</h4>
              <p className="text-xs text-slate-500 font-mono mt-0.5">
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
              <span className="text-[10px] uppercase font-bold text-rose-600 tracking-wider">
                Destination
              </span>
              <h4 className="font-semibold text-sm text-slate-800">{destinationName || 'Destination Point'}</h4>
              <p className="text-xs text-slate-500 font-mono mt-0.5">
                {destination.lat.toFixed(4)}, {destination.lng.toFixed(4)}
              </p>
            </div>
          </Popup>
        </Marker>
      )}

      {/* Render Routes */}
      {routes.map((route, idx) => {
        const isSelected = idx === selectedRouteIndex;
        // Styling based on perspective
        let color = '#64748b'; // slate fallback
        if (isSelected) {
          if (route.perspective === 'better_supported') color = '#0d9488'; // teal
          else if (route.perspective === 'fastest') color = '#4f46e5'; // indigo
          else color = '#0284c7'; // sky blue
        }

        return (
          <React.Fragment key={route.id}>
            {/* Outer halo outline for selected route */}
            {isSelected && (
              <Polyline
                positions={route.coordinates}
                pathOptions={{
                  color: '#ffffff',
                  weight: 9,
                  opacity: 0.9,
                  lineCap: 'round',
                  lineJoin: 'round',
                }}
              />
            )}
            <Polyline
              positions={route.coordinates}
              pathOptions={{
                color: color,
                weight: isSelected ? 6 : 4,
                opacity: isSelected ? 1 : 0.6,
                dashArray: isSelected ? undefined : '6, 8',
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
                  <div className="text-sm font-semibold text-slate-800">{route.summary}</div>
                  <div className="text-xs text-slate-600 mt-1 flex gap-3">
                    <span>⏱️ {Math.round(route.durationSeconds / 60)} min</span>
                    <span>📏 {(route.distanceMeters / 1000).toFixed(1)} km</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1.5 italic">
                    {route.relativeScoreDescription}
                  </p>
                  {!isSelected && (
                    <button
                      onClick={() => onSelectRouteIndex(idx)}
                      className="mt-2 w-full py-1 px-2 text-xs font-medium bg-teal-600 text-white rounded hover:bg-teal-700 transition-colors"
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
              <div className="p-1 space-y-1.5 min-w-[200px]">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] uppercase font-bold text-slate-500">Streetlight</span>
                  <StreetlightStatusBadge status={sl.status} />
                </div>
                <h4 className="font-semibold text-sm text-slate-800 leading-snug">{sl.segmentName}</h4>
                <div className="text-xs text-slate-600">{sl.notes || 'Infrastructure pole record'}</div>
                <div className="pt-1 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
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
                <h4 className="font-semibold text-sm text-slate-800 leading-tight">{fac.name}</h4>
                <div className="text-xs text-slate-600">{fac.address}</div>
                {fac.openingHours && (
                  <div className="text-xs text-slate-500 font-mono">🕒 {fac.openingHours}</div>
                )}
                <div className="flex flex-wrap gap-1 mt-1 text-[11px]">
                  {fac.isAccessible && (
                    <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-medium">
                      ♿ Accessible
                    </span>
                  )}
                  {fac.hasFemaleStaff && (
                    <span className="px-1.5 py-0.5 rounded bg-pink-100 text-pink-800 font-medium">
                      👩 Female Staff On Duty
                    </span>
                  )}
                </div>
                {onSetAsDestination && (
                  <button
                    onClick={() => onSetAsDestination(fac.coordinates, fac.name)}
                    className="mt-2 w-full py-1 px-2 text-xs font-medium bg-teal-600 hover:bg-teal-700 text-white rounded transition-colors flex items-center justify-center gap-1"
                  >
                    <Navigation className="w-3 h-3" />
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
                  <h4 className="font-semibold text-sm text-slate-800 leading-tight">
                    {rep.locationName}
                  </h4>
                  <p className="text-xs text-slate-700 italic bg-slate-50 p-1.5 rounded border border-slate-200">
                    "{rep.description}"
                  </p>
                  <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-200">
                    <span>{formatRelativeTime(rep.createdAt)}</span>
                    <div className="flex items-center gap-2">
                      {onUpvoteReport && (
                        <button
                          onClick={() => onUpvoteReport(rep.id)}
                          className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium"
                          title="Corroborate report"
                        >
                          👍 {rep.upvotes}
                        </button>
                      )}
                      {onResolveReport && (
                        <button
                          onClick={() => onResolveReport(rep.id)}
                          className="px-2 py-0.5 rounded bg-teal-50 hover:bg-teal-100 text-teal-700 text-xs font-medium"
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
              <div className="p-1 space-y-1.5 min-w-[200px]">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] uppercase font-bold text-indigo-600">
                    {trn.type.replace(/_/g, ' ')}
                  </span>
                  <DataSourceBadge source={trn.source} />
                </div>
                <h4 className="font-semibold text-sm text-slate-800 leading-tight">{trn.name}</h4>
                <div className="text-xs text-slate-600">
                  Lines: {trn.lines.join(', ') || 'Regional Transit'}
                </div>
                <div className="flex flex-wrap gap-1 mt-1 text-[11px]">
                  {trn.hasWomensCoach && (
                    <span className="px-1.5 py-0.5 rounded bg-pink-100 text-pink-800 font-medium">
                      🚺 Women's Coach Available
                    </span>
                  )}
                  {trn.hasCCTV && (
                    <span className="px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 font-medium">
                      📹 CCTV Monitored
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-slate-400 italic">
                  *Static mapped location. Live real-time arrivals unverified.
                </p>
              </div>
            </Popup>
          </Marker>
        ))}
    </MapContainer>
  );
};
