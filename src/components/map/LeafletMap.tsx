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
} from 'lucide-react';

// Dynamic import with ssr: false for Leaflet
const LeafletInnerMap = dynamic(
  () => import('./LeafletInnerMap').then((mod) => mod.LeafletInnerMap),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full bg-brand-bg flex flex-col items-center justify-center text-brand-text-secondary gap-3">
        <div className="w-9 h-9 border-3 border-teal-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-xs font-semibold tracking-wide text-brand-text">
          Loading Royal Map Canvas...
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

  return (
    <div className="relative w-full h-full overflow-hidden bg-brand-bg">
      <LeafletInnerMap {...props} activeLayers={activeLayers} />

      {/* Floating Layer Controls (Top Right - Crystal Glass) */}
      <div className="absolute top-4 right-4 z-[1000] flex flex-col items-end gap-2">
        <button
          onClick={() => setLayersOpen(!layersOpen)}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-full text-xs font-bold transition-all ${
            layersOpen
              ? 'bg-teal-500 text-white shadow-md shadow-teal-600/30 ring-2 ring-champagne-300'
              : 'glass-crystal text-brand-text hover:border-teal-300'
          }`}
          title="Toggle Map Data Layers"
        >
          <Layers className="w-4 h-4" />
          <span className="hidden sm:inline">Map Overlays</span>
        </button>

        {layersOpen && (
          <div className="glass-pearl border border-white/95 rounded-royal p-4 shadow-glass-floating text-xs text-brand-text w-60 space-y-2.5 animate-fadeIn">
            <div className="font-black text-[11px] uppercase tracking-wider text-teal-800 border-b border-brand-border/70 pb-2 flex items-center justify-between">
              <span>Telemetry Layers</span>
              <span className="text-[10px] text-brand-text-muted lowercase font-normal">toggle on/off</span>
            </div>

            <label className="flex items-center justify-between p-2 rounded-xl hover:bg-white/80 cursor-pointer transition-colors">
              <span className="flex items-center gap-2.5 text-brand-text font-semibold">
                <Lightbulb className="w-4 h-4 text-amber-500" />
                <span>Streetlights</span>
              </span>
              <input
                type="checkbox"
                checked={activeLayers.streetlights}
                onChange={() => toggleLayer('streetlights')}
                className="rounded text-teal-600 focus:ring-teal-400 h-4 w-4 border-brand-border"
              />
            </label>

            <label className="flex items-center justify-between p-2 rounded-xl hover:bg-white/80 cursor-pointer transition-colors">
              <span className="flex items-center gap-2.5 text-brand-text font-semibold">
                <Building2 className="w-4 h-4 text-pink-500" />
                <span>Facilities</span>
              </span>
              <input
                type="checkbox"
                checked={activeLayers.facilities}
                onChange={() => toggleLayer('facilities')}
                className="rounded text-teal-600 focus:ring-teal-400 h-4 w-4 border-brand-border"
              />
            </label>

            <label className="flex items-center justify-between p-2 rounded-xl hover:bg-white/80 cursor-pointer transition-colors">
              <span className="flex items-center gap-2.5 text-brand-text font-semibold">
                <AlertTriangle className="w-4 h-4 text-danger-500" />
                <span>Disturbances</span>
              </span>
              <input
                type="checkbox"
                checked={activeLayers.reports}
                onChange={() => toggleLayer('reports')}
                className="rounded text-teal-600 focus:ring-teal-400 h-4 w-4 border-brand-border"
              />
            </label>

            <label className="flex items-center justify-between p-2 rounded-xl hover:bg-white/80 cursor-pointer transition-colors">
              <span className="flex items-center gap-2.5 text-brand-text font-semibold">
                <Bus className="w-4 h-4 text-blue-500" />
                <span>Public Transit</span>
              </span>
              <input
                type="checkbox"
                checked={activeLayers.transport}
                onChange={() => toggleLayer('transport')}
                className="rounded text-teal-600 focus:ring-teal-400 h-4 w-4 border-brand-border"
              />
            </label>
          </div>
        )}
      </div>

      {/* Quick Report Floating Action Button (Bottom Right) */}
      {props.onRequestSubmitReportAtCenter && (
        <div className="absolute bottom-24 lg:bottom-6 right-4 z-[1000] flex flex-col gap-2">
          <button
            onClick={props.onRequestSubmitReportAtCenter}
            className="flex items-center gap-2 px-4 py-2.5 rounded-full glass-pearl border border-champagne-200/90 hover:border-champagne-300 text-teal-900 font-bold text-xs shadow-glass-pearl hover:shadow-glass-floating active:scale-95 transition-all group"
            title="Report a condition at map position"
          >
            <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform text-teal-600" />
            <span className="font-bold">Report Issue</span>
          </button>
        </div>
      )}
    </div>
  );
};
