'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import {
  Coordinates,
  RouteOption,
  StreetlightSegment,
  CommunityReport,
  EssentialFacility,
  TransportStop,
} from '@/types';
import {
  Layers,
  Lightbulb,
  Building2,
  Bus,
  AlertTriangle,
  Plus,
  Box,
  Map as MapIcon,
} from 'lucide-react';

const LeafletInnerMap = dynamic(
  () => import('./LeafletInnerMap').then((mod) => mod.LeafletInnerMap),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full bg-canvas flex flex-col items-center justify-center text-text-secondary gap-3">
        <div className="w-9 h-9 border-3 border-primary border-t-transparent rounded-full animate-spin" />
        <span className="text-xs font-semibold tracking-wide text-ink font-editorial">
          Loading Nightbloom Atlas...
        </span>
      </div>
    ),
  }
);

const MapLibre3DMap = dynamic(
  () => import('./MapLibre3DMap').then((mod) => mod.MapLibre3DMap),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full bg-canvas flex flex-col items-center justify-center text-text-secondary gap-3">
        <div className="w-9 h-9 border-3 border-primary border-t-transparent rounded-full animate-spin" />
        <span className="text-xs font-semibold tracking-wide text-ink font-editorial">
          Initializing 3D City View...
        </span>
      </div>
    ),
  }
);

interface LeafletMapProps {
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
  onMapClick?: (coords: Coordinates) => void;
  onSetAsDestination?: (coords: Coordinates, name: string) => void;
  onUpvoteReport?: (id: string) => void;
  onFlagReport?: (id: string) => void;
  onResolveReport?: (id: string) => void;
  onRequestSubmitReportAtCenter?: () => void;
}

export const LeafletMap: React.FC<LeafletMapProps> = (props) => {
  const [is3DCityActive, setIs3DCityActive] = useState(false);
  const [layersOpen, setLayersOpen] = useState(false);
  const [activeLayers, setActiveLayers] = useState({
    streetlights: true,
    reports: true,
    facilities: true,
    transport: true,
  });

  const toggleLayer = (key: keyof typeof activeLayers) => {
    setActiveLayers((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const activeCount = Object.values(activeLayers).filter(Boolean).length;

  return (
    <div className="relative w-full h-full overflow-hidden bg-canvas">
      {/* Either MapLibre 3D or Leaflet 2D (Never both simultaneously) */}
      {is3DCityActive ? (
        <MapLibre3DMap
          {...props}
          onFallbackTo2D={() => setIs3DCityActive(false)}
        />
      ) : (
        <LeafletInnerMap {...props} activeLayers={activeLayers} />
      )}

      {/* Floating Controls Bar (Top Right) */}
      <div className="absolute top-4 right-4 z-[1000] flex items-center gap-2">
        {/* Feature-Flagged 3D City Toggle */}
        <button
          type="button"
          onClick={() => setIs3DCityActive(!is3DCityActive)}
          className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold shadow-e2 transition-all focus-ring-primary ${
            is3DCityActive
              ? 'bg-primary text-white shadow-violet'
              : 'bg-card text-ink border border-border hover:border-primary'
          }`}
          title="Toggle between 2D Atlas and 3D Extruded City mode"
          aria-label="Toggle 3D City mode"
        >
          {is3DCityActive ? <MapIcon className="w-3.5 h-3.5" /> : <Box className="w-3.5 h-3.5 text-primary" />}
          <span>{is3DCityActive ? '2D Atlas' : '3D City'}</span>
        </button>

        {/* Consolidated Layers Control */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setLayersOpen(!layersOpen)}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold shadow-e2 transition-all focus-ring-primary ${
              layersOpen
                ? 'bg-ink text-white'
                : 'bg-card text-ink border border-border hover:border-primary'
            }`}
            title="Toggle map infrastructure layers"
            aria-expanded={layersOpen}
            aria-label="Toggle map layers"
          >
            <Layers className="w-3.5 h-3.5 text-champagne" />
            <span className="font-sans font-medium">Layers</span>
            <span
              className={`w-4 h-4 rounded-full text-[10px] font-bold flex items-center justify-center ${
                layersOpen ? 'bg-champagne text-ink' : 'bg-canvas text-ink border border-border'
              }`}
            >
              {activeCount}
            </span>
          </button>

          {/* Consolidated Layers Popover Panel */}
          {layersOpen && (
            <div className="absolute right-0 top-11 w-64 bg-card rounded-card border border-border shadow-e3 p-3 text-xs space-y-2 z-50 animate-fade-in">
              <div className="flex items-center justify-between pb-2 border-b border-border font-semibold text-ink text-[11px] uppercase tracking-wider font-editorial">
                <span>Infrastructure Layers</span>
                <span className="text-text-muted font-normal text-[10px]">
                  {activeCount} of 4 visible
                </span>
              </div>

              {/* Layer 1: Streetlights */}
              <label className="flex items-center justify-between p-1.5 rounded-lg hover:bg-canvas cursor-pointer transition-colors">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-md bg-[#8A6A10]/15 text-[#8A6A10] flex items-center justify-center text-xs">
                    💡
                  </span>
                  <span className="font-medium text-ink">Streetlights</span>
                </div>
                <input
                  type="checkbox"
                  checked={activeLayers.streetlights}
                  onChange={() => toggleLayer('streetlights')}
                  className="rounded border-border-control text-primary focus:ring-primary h-4 w-4"
                />
              </label>

              {/* Layer 2: Essential Facilities */}
              <label className="flex items-center justify-between p-1.5 rounded-lg hover:bg-canvas cursor-pointer transition-colors">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-md bg-[#8E2F7E]/15 text-[#8E2F7E] flex items-center justify-center text-xs">
                    🏢
                  </span>
                  <span className="font-medium text-ink">Essential Facilities</span>
                </div>
                <input
                  type="checkbox"
                  checked={activeLayers.facilities}
                  onChange={() => toggleLayer('facilities')}
                  className="rounded border-border-control text-primary focus:ring-primary h-4 w-4"
                />
              </label>

              {/* Layer 3: Community Reports */}
              <label className="flex items-center justify-between p-1.5 rounded-lg hover:bg-canvas cursor-pointer transition-colors">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-md bg-caution-tint text-caution flex items-center justify-center text-xs">
                    ⚠️
                  </span>
                  <span className="font-medium text-ink">Community Reports</span>
                </div>
                <input
                  type="checkbox"
                  checked={activeLayers.reports}
                  onChange={() => toggleLayer('reports')}
                  className="rounded border-border-control text-primary focus:ring-primary h-4 w-4"
                />
              </label>

              {/* Layer 4: Public Transit */}
              <label className="flex items-center justify-between p-1.5 rounded-lg hover:bg-canvas cursor-pointer transition-colors">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-md bg-info-tint text-info flex items-center justify-center text-xs">
                    🚇
                  </span>
                  <span className="font-medium text-ink">Transit & Metro</span>
                </div>
                <input
                  type="checkbox"
                  checked={activeLayers.transport}
                  onChange={() => toggleLayer('transport')}
                  className="rounded border-border-control text-primary focus:ring-primary h-4 w-4"
                />
              </label>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
