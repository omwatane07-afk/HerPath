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
  Check,
} from 'lucide-react';

const LeafletInnerMap = dynamic(
  () => import('./LeafletInnerMap').then((mod) => mod.LeafletInnerMap),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full bg-paper flex flex-col items-center justify-center text-text-secondary gap-3">
        <div className="w-8 h-8 border-3 border-peacock border-t-transparent rounded-full animate-spin" />
        <span className="text-xs font-semibold tracking-wide text-ink">
          Loading Map Canvas...
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
    <div className="relative w-full h-full overflow-hidden bg-paper">
      <LeafletInnerMap {...props} activeLayers={activeLayers} />

      {/* Floating Consolidated Layers Control (Top Right) */}
      <div className="absolute top-4 right-4 z-[1000] flex flex-col items-end gap-2">
        <button
          type="button"
          onClick={() => setLayersOpen(!layersOpen)}
          className={`flex items-center gap-2 px-3.5 py-2.5 rounded-lg text-xs font-semibold shadow-e2 transition-all focus-ring-peacock ${
            layersOpen
              ? 'bg-ink text-white'
              : 'bg-white text-ink border border-border hover:border-border-strong'
          }`}
          title="Toggle map infrastructure layers"
          aria-expanded={layersOpen}
          aria-label="Toggle map layers"
        >
          <Layers className="w-4 h-4 text-peacock" />
          <span className="font-sans">Layers</span>
          <span
            className={`w-5 h-5 rounded-full text-[11px] font-bold flex items-center justify-center ${
              layersOpen ? 'bg-peacock text-white' : 'bg-paper text-ink border border-border'
            }`}
          >
            {activeCount}
          </span>
        </button>

        {layersOpen && (
          <div className="bg-white border border-border rounded-card p-3 shadow-e3 text-xs text-ink w-64 space-y-1.5 animate-fade-in">
            <div className="font-serif font-bold text-sm text-ink pb-2 border-b border-border flex items-center justify-between">
              <span>Map Layers</span>
              <span className="text-[11px] font-sans font-normal text-text-secondary">
                {activeCount} of 4 visible
              </span>
            </div>

            <label className="flex items-center justify-between p-2 rounded-md hover:bg-paper cursor-pointer transition-colors">
              <span className="flex items-center gap-2.5 text-ink font-medium">
                <Lightbulb className="w-4 h-4 text-caution" />
                <span>Streetlights</span>
              </span>
              <input
                type="checkbox"
                checked={activeLayers.streetlights}
                onChange={() => toggleLayer('streetlights')}
                className="rounded border-border text-peacock focus:ring-peacock h-4 w-4"
              />
            </label>

            <label className="flex items-center justify-between p-2 rounded-md hover:bg-paper cursor-pointer transition-colors">
              <span className="flex items-center gap-2.5 text-ink font-medium">
                <Building2 className="w-4 h-4 text-peacock" />
                <span>Facilities</span>
              </span>
              <input
                type="checkbox"
                checked={activeLayers.facilities}
                onChange={() => toggleLayer('facilities')}
                className="rounded border-border text-peacock focus:ring-peacock h-4 w-4"
              />
            </label>

            <label className="flex items-center justify-between p-2 rounded-md hover:bg-paper cursor-pointer transition-colors">
              <span className="flex items-center gap-2.5 text-ink font-medium">
                <AlertTriangle className="w-4 h-4 text-danger" />
                <span>Community Reports</span>
              </span>
              <input
                type="checkbox"
                checked={activeLayers.reports}
                onChange={() => toggleLayer('reports')}
                className="rounded border-border text-peacock focus:ring-peacock h-4 w-4"
              />
            </label>

            <label className="flex items-center justify-between p-2 rounded-md hover:bg-paper cursor-pointer transition-colors">
              <span className="flex items-center gap-2.5 text-ink font-medium">
                <Bus className="w-4 h-4 text-info" />
                <span>Public Transit</span>
              </span>
              <input
                type="checkbox"
                checked={activeLayers.transport}
                onChange={() => toggleLayer('transport')}
                className="rounded border-border text-peacock focus:ring-peacock h-4 w-4"
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
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white border border-border hover:border-border-strong text-ink font-semibold text-xs shadow-e2 active:scale-95 transition-all focus-ring-peacock"
            title="Report a condition at current map position"
          >
            <Plus className="w-4 h-4 text-peacock" />
            <span>Report Issue</span>
          </button>
        </div>
      )}
    </div>
  );
};
