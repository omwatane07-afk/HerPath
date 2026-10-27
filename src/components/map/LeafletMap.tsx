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

const LeafletInnerMap = dynamic(
  () => import('./LeafletInnerMap').then((mod) => mod.LeafletInnerMap),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full bg-canvas flex flex-col items-center justify-center text-text-secondary gap-3">
        <div className="w-9 h-9 border-3 border-rose-gold border-t-transparent rounded-full animate-spin" />
        <span className="text-xs font-semibold tracking-wide text-bordeaux font-editorial">
          Loading Atelier Atlas...
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

  const activeCount = Object.values(activeLayers).filter(Boolean).length;

  return (
    <div className="relative w-full h-full overflow-hidden bg-canvas">
      <LeafletInnerMap {...props} activeLayers={activeLayers} />

      {/* Floating Consolidated Layers Control (Top Right) */}
      <div className="absolute top-4 right-4 z-[1000] flex flex-col items-end gap-2">
        <button
          type="button"
          onClick={() => setLayersOpen(!layersOpen)}
          className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-semibold shadow-atelier transition-all focus-ring-bordeaux ${
            layersOpen
              ? 'bg-bordeaux text-white'
              : 'bg-white/95 backdrop-blur-md text-bordeaux border border-border hover:border-champagne'
          }`}
          title="Toggle map infrastructure layers"
          aria-expanded={layersOpen}
          aria-label="Toggle map layers"
        >
          <Layers className="w-4 h-4 text-champagne" />
          <span className="font-sans font-medium">Layers</span>
          <span
            className={`w-5 h-5 rounded-full text-[11px] font-bold flex items-center justify-center ${
              layersOpen ? 'bg-champagne text-bordeaux' : 'bg-canvas text-bordeaux border border-border'
            }`}
          >
            {activeCount}
          </span>
        </button>

        {layersOpen && (
          <div className="bg-white/98 backdrop-blur-md border border-border-gold rounded-2xl p-3.5 shadow-atelier text-xs text-bordeaux w-64 space-y-1.5 animate-modal">
            <div className="font-editorial font-bold text-sm text-bordeaux pb-2 border-b border-border flex items-center justify-between">
              <span>Map Layers</span>
              <span className="text-[11px] font-sans font-normal text-text-secondary">
                {activeCount} of 4 visible
              </span>
            </div>

            <label className="flex items-center justify-between p-2 rounded-xl hover:bg-canvas cursor-pointer transition-colors">
              <span className="flex items-center gap-2.5 text-bordeaux font-medium">
                <Lightbulb className="w-4 h-4 text-caution" />
                <span>Streetlights</span>
              </span>
              <input
                type="checkbox"
                checked={activeLayers.streetlights}
                onChange={() => toggleLayer('streetlights')}
                className="rounded border-border text-rose-gold focus:ring-rose-gold h-4 w-4"
              />
            </label>

            <label className="flex items-center justify-between p-2 rounded-xl hover:bg-canvas cursor-pointer transition-colors">
              <span className="flex items-center gap-2.5 text-bordeaux font-medium">
                <Building2 className="w-4 h-4 text-rose-gold" />
                <span>Facilities</span>
              </span>
              <input
                type="checkbox"
                checked={activeLayers.facilities}
                onChange={() => toggleLayer('facilities')}
                className="rounded border-border text-rose-gold focus:ring-rose-gold h-4 w-4"
              />
            </label>

            <label className="flex items-center justify-between p-2 rounded-xl hover:bg-canvas cursor-pointer transition-colors">
              <span className="flex items-center gap-2.5 text-bordeaux font-medium">
                <AlertTriangle className="w-4 h-4 text-danger" />
                <span>Community Reports</span>
              </span>
              <input
                type="checkbox"
                checked={activeLayers.reports}
                onChange={() => toggleLayer('reports')}
                className="rounded border-border text-rose-gold focus:ring-rose-gold h-4 w-4"
              />
            </label>

            <label className="flex items-center justify-between p-2 rounded-xl hover:bg-canvas cursor-pointer transition-colors">
              <span className="flex items-center gap-2.5 text-bordeaux font-medium">
                <Bus className="w-4 h-4 text-info" />
                <span>Public Transit</span>
              </span>
              <input
                type="checkbox"
                checked={activeLayers.transport}
                onChange={() => toggleLayer('transport')}
                className="rounded border-border text-rose-gold focus:ring-rose-gold h-4 w-4"
              />
            </label>
          </div>
        )}
      </div>

      {/* Quick Report Floating Action Button */}
      {props.onRequestSubmitReportAtCenter && (
        <div className="absolute bottom-24 lg:bottom-6 right-4 z-[1000] flex flex-col gap-2">
          <button
            type="button"
            onClick={props.onRequestSubmitReportAtCenter}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/95 backdrop-blur-md border border-border hover:border-champagne text-bordeaux font-semibold text-xs shadow-atelier active:scale-95 transition-all focus-ring-bordeaux"
            title="Report a condition at current map position"
          >
            <Plus className="w-4 h-4 text-rose-gold" />
            <span>Report Issue</span>
          </button>
        </div>
      )}
    </div>
  );
};
