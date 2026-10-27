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
  LocateFixed,
  Eye,
  Plus,
} from 'lucide-react';

// Dynamic import with ssr: false for Leaflet
const LeafletInnerMap = dynamic(
  () => import('./LeafletInnerMap').then((mod) => mod.LeafletInnerMap),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full bg-navy-950 flex flex-col items-center justify-center text-slate-400 gap-3">
        <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-xs font-medium tracking-wide">Loading OpenStreetMap Canvas...</span>
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
    <div className="relative w-full h-full overflow-hidden bg-navy-950">
      <LeafletInnerMap {...props} activeLayers={activeLayers} />

      {/* Floating Layer Controls (Top Right) */}
      <div className="absolute top-4 right-4 z-[1000] flex flex-col items-end gap-2">
        <button
          onClick={() => setLayersOpen(!layersOpen)}
          className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold shadow-lg backdrop-blur-md transition-all ${
            layersOpen
              ? 'bg-teal-600 text-white shadow-teal-900/50'
              : 'bg-navy-900/90 text-slate-200 border border-slate-700/80 hover:bg-navy-850'
          }`}
          title="Toggle Map Data Layers"
        >
          <Layers className="w-4 h-4" />
          <span className="hidden sm:inline">Map Layers</span>
        </button>

        {layersOpen && (
          <div className="bg-navy-900/95 border border-slate-700/80 rounded-2xl p-3 shadow-2xl backdrop-blur-md text-xs text-slate-200 w-52 space-y-2 animate-fadeIn">
            <div className="font-bold text-[11px] uppercase tracking-wider text-teal-400 border-b border-slate-800 pb-1.5 flex items-center justify-between">
              <span>Active Overlays</span>
              <span className="text-[10px] text-slate-400 lowercase">click to toggle</span>
            </div>

            <label className="flex items-center justify-between p-1.5 rounded-lg hover:bg-navy-800 cursor-pointer transition-colors">
              <span className="flex items-center gap-2 text-slate-200">
                <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
                <span>Streetlights</span>
              </span>
              <input
                type="checkbox"
                checked={activeLayers.streetlights}
                onChange={() => toggleLayer('streetlights')}
                className="rounded border-slate-700 text-teal-500 focus:ring-teal-500 h-3.5 w-3.5 bg-navy-950"
              />
            </label>

            <label className="flex items-center justify-between p-1.5 rounded-lg hover:bg-navy-800 cursor-pointer transition-colors">
              <span className="flex items-center gap-2 text-slate-200">
                <Building2 className="w-3.5 h-3.5 text-pink-400" />
                <span>Facilities</span>
              </span>
              <input
                type="checkbox"
                checked={activeLayers.facilities}
                onChange={() => toggleLayer('facilities')}
                className="rounded border-slate-700 text-teal-500 focus:ring-teal-500 h-3.5 w-3.5 bg-navy-950"
              />
            </label>

            <label className="flex items-center justify-between p-1.5 rounded-lg hover:bg-navy-800 cursor-pointer transition-colors">
              <span className="flex items-center gap-2 text-slate-200">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                <span>Disturbance Reports</span>
              </span>
              <input
                type="checkbox"
                checked={activeLayers.reports}
                onChange={() => toggleLayer('reports')}
                className="rounded border-slate-700 text-teal-500 focus:ring-teal-500 h-3.5 w-3.5 bg-navy-950"
              />
            </label>

            <label className="flex items-center justify-between p-1.5 rounded-lg hover:bg-navy-800 cursor-pointer transition-colors">
              <span className="flex items-center gap-2 text-slate-200">
                <Bus className="w-3.5 h-3.5 text-indigo-400" />
                <span>Public Transit</span>
              </span>
              <input
                type="checkbox"
                checked={activeLayers.transport}
                onChange={() => toggleLayer('transport')}
                className="rounded border-slate-700 text-teal-500 focus:ring-teal-500 h-3.5 w-3.5 bg-navy-950"
              />
            </label>
          </div>
        )}
      </div>

      {/* Quick Report Trigger on Map (Bottom Right) */}
      {props.onRequestSubmitReportAtCenter && (
        <div className="absolute bottom-6 right-4 z-[1000] flex flex-col gap-2">
          <button
            onClick={props.onRequestSubmitReportAtCenter}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-full bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs shadow-xl shadow-rose-950/60 active:scale-95 transition-all group"
            title="Report a condition at map position"
          >
            <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform" />
            <span className="hidden sm:inline">Report Disturbance / Light</span>
          </button>
        </div>
      )}
    </div>
  );
};
