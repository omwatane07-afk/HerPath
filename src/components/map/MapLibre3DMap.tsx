'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Map, Marker } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import {
  Coordinates,
  RouteOption,
  StreetlightSegment,
  CommunityReport,
  EssentialFacility,
  TransportStop,
} from '@/types';
import { AlertCircle } from 'lucide-react';

interface MapLibre3DMapProps {
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
  onFallbackTo2D: () => void;
}

export const MapLibre3DMap: React.FC<MapLibre3DMapProps> = ({
  center,
  zoom = 15,
  origin,
  destination,
  routes,
  selectedRouteIndex,
  onSelectRouteIndex,
  streetlights,
  reports,
  facilities,
  transportStops,
  onFallbackTo2D,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<Map | null>(null);
  const markersRef = useRef<Marker[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Check WebGL support natively
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (!gl) {
      setLoadError('WebGL is not supported or hardware acceleration is disabled.');
      return;
    }

    try {
      const map = new Map({
        container: containerRef.current,
        style: 'https://tiles.openfreemap.org/styles/positron',
        center: [center.lng, center.lat],
        zoom: zoom,
        pitch: 55,
        bearing: -15,
        maxPitch: 70,
      });

      mapRef.current = map;

      map.on('error', (e: any) => {
        console.warn('MapLibre GL non-fatal error:', e);
      });

      map.on('load', () => {
        // Add 3D Extruded Buildings Layer
        try {
          const style = map.getStyle();
          let labelLayerId: string | undefined;
          if (style.layers) {
            for (let i = 0; i < style.layers.length; i++) {
              if (
                style.layers[i].type === 'symbol' &&
                (style.layers[i].layout as any)?.['text-field']
              ) {
                labelLayerId = style.layers[i].id;
                break;
              }
            }
          }

          if (style.sources && (style.sources['openmaptiles'] || style.sources['composite'])) {
            const sourceId = style.sources['openmaptiles'] ? 'openmaptiles' : 'composite';
            if (!map.getLayer('3d-buildings')) {
              map.addLayer(
                {
                  id: '3d-buildings',
                  source: sourceId,
                  'source-layer': 'building',
                  type: 'fill-extrusion',
                  minzoom: 13,
                  paint: {
                    'fill-extrusion-color': '#E4DCD3',
                    'fill-extrusion-height': [
                      'interpolate',
                      ['linear'],
                      ['zoom'],
                      13,
                      0,
                      14.5,
                      ['coalesce', ['get', 'render_height'], ['get', 'height'], 14],
                    ],
                    'fill-extrusion-base': [
                      'interpolate',
                      ['linear'],
                      ['zoom'],
                      13,
                      0,
                      14.5,
                      ['coalesce', ['get', 'render_min_height'], ['get', 'min_height'], 0],
                    ],
                    'fill-extrusion-opacity': 0.6,
                  },
                },
                labelLayerId
              );
            }
          }
        } catch (err) {
          console.warn('Could not add building extrusion layer:', err);
        }

        // Add Route GeoJSON Sources and Layers
        routes.forEach((route, idx) => {
          const isSelected = idx === selectedRouteIndex;
          const sourceId = `route-source-${route.id}`;
          const coordinates = route.coordinates.map(([lat, lng]) => [lng, lat]);

          const geojson: GeoJSON.Feature<GeoJSON.LineString> = {
            type: 'Feature',
            properties: { id: route.id, isSelected },
            geometry: {
              type: 'LineString',
              coordinates,
            },
          };

          if (!map.getSource(sourceId)) {
            map.addSource(sourceId, {
              type: 'geojson',
              data: geojson,
            });

            // Casing layer for selected route
            map.addLayer({
              id: `${sourceId}-casing`,
              type: 'line',
              source: sourceId,
              layout: {
                'line-cap': 'round',
                'line-join': 'round',
              },
              paint: {
                'line-color': '#FFFFFF',
                'line-width': isSelected ? 9 : 0,
                'line-opacity': 0.95,
              },
            });

            // Primary route line
            map.addLayer({
              id: `${sourceId}-line`,
              type: 'line',
              source: sourceId,
              layout: {
                'line-cap': 'round',
                'line-join': 'round',
              },
              paint: {
                'line-color': isSelected ? '#5A2FC2' : '#6E6090',
                'line-width': isSelected ? 6 : 3.5,
                'line-opacity': isSelected ? 1 : 0.5,
                'line-dasharray': isSelected ? [1, 0] : [2, 2],
              },
            });
          }
        });
      });

      return () => {
        markersRef.current.forEach((m) => m.remove());
        markersRef.current = [];
        map.remove();
      };
    } catch (err: any) {
      console.error('Failed to initialize MapLibre GL:', err);
      setLoadError(err.message || 'Error initializing 3D WebGL map.');
    }
  }, []);

  // Update dynamic route geometry when selection changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;

    routes.forEach((route, idx) => {
      const isSelected = idx === selectedRouteIndex;
      const sourceId = `route-source-${route.id}`;
      const lineLayer = `${sourceId}-line`;
      const casingLayer = `${sourceId}-casing`;

      if (map.getLayer(lineLayer)) {
        map.setPaintProperty(lineLayer, 'line-color', isSelected ? '#5A2FC2' : '#6E6090');
        map.setPaintProperty(lineLayer, 'line-width', isSelected ? 6 : 3.5);
        map.setPaintProperty(lineLayer, 'line-opacity', isSelected ? 1 : 0.5);
      }
      if (map.getLayer(casingLayer)) {
        map.setPaintProperty(casingLayer, 'line-width', isSelected ? 9 : 0);
      }
    });
  }, [routes, selectedRouteIndex]);

  // Update HTML Markers
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Clear previous markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    // Origin Marker (A)
    if (origin) {
      const el = document.createElement('div');
      el.className =
        'w-9 h-9 rounded-full bg-[#1E0F28] border-2 border-white shadow-e2 flex items-center justify-center text-[#C9A25E] font-editorial font-bold text-xs ring-2 ring-[#1E0F28]/25 cursor-pointer';
      el.innerText = 'A';
      const m = new Marker({ element: el })
        .setLngLat([origin.lng, origin.lat])
        .addTo(map);
      markersRef.current.push(m);
    }

    // Destination Marker (B)
    if (destination) {
      const el = document.createElement('div');
      el.className =
        'w-9 h-9 rounded-full bg-[#5A2FC2] border-2 border-white shadow-e2 flex items-center justify-center text-white font-editorial font-bold text-xs ring-2 ring-[#5A2FC2]/30 cursor-pointer';
      el.innerText = 'B';
      const m = new Marker({ element: el })
        .setLngLat([destination.lng, destination.lat])
        .addTo(map);
      markersRef.current.push(m);
    }

    // Facilities Markers
    facilities.slice(0, 8).forEach((fac) => {
      const el = document.createElement('div');
      el.className =
        'w-7 h-7 rounded-lg bg-[#8E2F7E] border-2 border-white shadow-sm flex items-center justify-center text-white text-[11px] cursor-pointer';
      el.innerText = '🚺';
      const m = new Marker({ element: el })
        .setLngLat([fac.coordinates.lng, fac.coordinates.lat])
        .addTo(map);
      markersRef.current.push(m);
    });
  }, [origin, destination, facilities]);

  if (loadError) {
    return (
      <div className="w-full h-full bg-canvas flex flex-col items-center justify-center p-6 text-center text-text-secondary gap-3">
        <AlertCircle className="w-8 h-8 text-caution" />
        <h4 className="font-editorial text-base font-bold text-ink">3D WebGL Mode Unavailable</h4>
        <p className="text-xs max-w-sm">{loadError}</p>
        <button
          type="button"
          onClick={onFallbackTo2D}
          className="btn-primary px-4 py-2 text-xs font-semibold mt-2"
        >
          Return to 2D Atlas
        </button>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative">
      <div ref={containerRef} className="w-full h-full" />
      {/* 3D City Mode Indicator Badge */}
      <div className="absolute top-4 left-4 z-10 bg-ink/90 backdrop-blur-md text-white text-[11px] font-semibold px-3 py-1.5 rounded-xl border border-champagne/30 flex items-center gap-2 shadow-e2">
        <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
        <span>3D City Extrusion Mode (55° Pitch)</span>
      </div>
    </div>
  );
};
