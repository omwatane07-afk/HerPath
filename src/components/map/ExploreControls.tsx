'use client';

import React, { useState } from 'react';
import {
  Search,
  List,
  Map,
  X,
  Navigation,
  AlertTriangle,
  Lightbulb,
  Building2,
  Bus,
  Shield,
  Clock,
  ArrowRight,
} from 'lucide-react';
import {
  StreetlightSegment,
  CommunityReport,
  EssentialFacility,
  TransportStop,
  Coordinates,
} from '@/types';
import { formatRelativeTime } from '@/lib/utils';
import { DataSourceBadge } from '../ui/Badge';

export type ExploreFilter = 'all' | 'streetlights' | 'facilities' | 'reports' | 'transit';

export interface SelectedMapItem {
  id: string;
  type: 'streetlight' | 'facility' | 'report' | 'transit';
  title: string;
  subtitle: string;
  description?: string;
  coordinates: Coordinates;
  timestamp?: string;
  source: any;
  statusText?: string;
}

interface ExploreControlsProps {
  streetlights: StreetlightSegment[];
  facilities: EssentialFacility[];
  reports: CommunityReport[];
  transportStops: TransportStop[];
  onSetAsDestination: (coords: Coordinates, name: string) => void;
  onRequestReport: (coords: Coordinates) => void;
  onCenterMap: (coords: Coordinates) => void;
}

export const ExploreControls: React.FC<ExploreControlsProps> = ({
  streetlights,
  facilities,
  reports,
  transportStops,
  onSetAsDestination,
  onRequestReport,
  onCenterMap,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<ExploreFilter>('all');
  const [showList, setShowList] = useState(false);
  const [selectedItem, setSelectedItem] = useState<SelectedMapItem | null>(null);

  // Filter items
  const allItems: SelectedMapItem[] = [
    ...facilities.map((f) => ({
      id: f.id,
      type: 'facility' as const,
      title: f.name,
      subtitle: f.category.replace(/_/g, ' '),
      description: f.address,
      coordinates: f.coordinates,
      timestamp: f.lastVerifiedAt,
      source: f.source,
      statusText: f.openingHours || 'Hours not listed',
    })),
    ...reports.filter((r) => r.status !== 'resolved').map((r) => ({
      id: r.id,
      type: 'report' as const,
      title: r.locationName,
      subtitle: r.category.replace(/_/g, ' '),
      description: r.description,
      coordinates: r.coordinates,
      timestamp: r.createdAt,
      source: r.source,
      statusText: `${r.upvotes} corroboration(s)`,
    })),
    ...streetlights.map((s) => ({
      id: s.id,
      type: 'streetlight' as const,
      title: s.segmentName,
      subtitle: 'Streetlight Segment',
      description: s.notes || 'Lighting infrastructure',
      coordinates: s.coordinates,
      timestamp: s.lastReportedAt,
      source: s.reportedSource,
      statusText: s.status === 'working' ? 'Illuminated' : 'Reported Dim/Out',
    })),
    ...transportStops.map((t) => ({
      id: t.id,
      type: 'transit' as const,
      title: t.name,
      subtitle: t.type.replace(/_/g, ' '),
      description: `${t.lines.length} lines: ${t.lines.join(', ')}`,
      coordinates: t.coordinates,
      source: t.source,
      statusText: 'Transit Hub',
    })),
  ];

  const filteredItems = allItems.filter((item) => {
    if (activeFilter === 'streetlights' && item.type !== 'streetlight') return false;
    if (activeFilter === 'facilities' && item.type !== 'facility') return false;
    if (activeFilter === 'reports' && item.type !== 'report') return false;
    if (activeFilter === 'transit' && item.type !== 'transit') return false;

    if (
      searchQuery &&
      !item.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !(item.description || '').toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  return (
    <>
      {/* Floating Search & Filter Pill (Top Left of Map) */}
      <div className="absolute top-4 left-4 z-[995] flex flex-col gap-2 max-w-[calc(100vw-32px)] sm:max-w-md w-full pointer-events-auto font-sans">
        <div className="p-1.5 flex items-center gap-2 shadow-md bg-white/95 backdrop-blur-xl border border-slate-200/90 rounded-2xl">
          <div className="relative flex-1 flex items-center">
            <Search className="w-4 h-4 text-slate-400 absolute left-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search places, lighting, reports..."
              className="w-full text-xs font-semibold pl-8 pr-2 py-1.5 rounded-xl bg-slate-100 border border-transparent focus:border-indigo-500 focus:outline-none text-slate-900 placeholder:text-slate-400"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="p-1 text-slate-400 hover:text-slate-600 mr-1"
                aria-label="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Toggle List View button */}
          <button
            type="button"
            onClick={() => setShowList(!showList)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition-all ${
              showList
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
            }`}
            title="Toggle accessible list view"
          >
            {showList ? <Map className="w-3.5 h-3.5" /> : <List className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{showList ? 'Map' : 'List'}</span>
          </button>
        </div>

        {/* Filter Chips Row */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
          {[
            { id: 'all' as const, label: '✨ All' },
            { id: 'streetlights' as const, label: '💡 Lighting' },
            { id: 'facilities' as const, label: '🏢 Facilities' },
            { id: 'reports' as const, label: '📌 Reports' },
            { id: 'transit' as const, label: '🚌 Transit' },
          ].map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setActiveFilter(f.id)}
              className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap border shadow-xs transition-all ${
                activeFilter === f.id
                  ? 'bg-grape text-white border-grape shadow-sm'
                  : 'bg-white/95 backdrop-blur-sm text-soft-ink hover:text-ink border-lilac hover:bg-[#F1EAFF]'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Accessible List Panel (Overlay on Desktop / Drawer on Mobile) */}
      {showList && (
        <div className="absolute top-24 left-4 bottom-24 lg:bottom-8 z-[995] w-full max-w-[calc(100vw-32px)] sm:w-80 shadow-sticker-lg flex flex-col overflow-hidden bg-white/98 backdrop-blur-md border-2 border-lilac rounded-2xl animate-modal pointer-events-auto font-sans">
          <div className="p-3 border-b border-purple-100 flex items-center justify-between bg-[#F1EAFF]/80">
            <span className="font-heading font-extrabold text-xs text-ink uppercase tracking-wider">
              {filteredItems.length} Mapped Points
            </span>
            <button
              type="button"
              onClick={() => setShowList(false)}
              className="p-1 rounded-lg text-soft-ink hover:text-ink"
              aria-label="Close list"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-1.5 divide-y divide-purple-100/60">
            {filteredItems.slice(0, 50).map((item) => (
              <div
                key={`${item.type}-${item.id}`}
                onClick={() => {
                  setSelectedItem(item);
                  onCenterMap(item.coordinates);
                }}
                className="pt-2 pb-1.5 px-2.5 rounded-xl hover:bg-[#F1EAFF] cursor-pointer transition-colors"
              >
                <div className="flex items-center justify-between text-[11px] mb-0.5">
                  <span className="font-extrabold text-grape uppercase tracking-wider text-[10px]">
                    {item.subtitle}
                  </span>
                  <DataSourceBadge source={item.source} showIcon={false} />
                </div>
                <div className="font-bold text-xs text-ink">{item.title}</div>
                {item.description && (
                  <p className="text-[11px] text-soft-ink line-clamp-1 mt-0.5">
                    {item.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Selected Marker Detail Card (Float Bottom Left) */}
      {selectedItem && (
        <div className="absolute bottom-24 lg:bottom-8 left-4 z-[995] max-w-[calc(100vw-32px)] sm:w-80 p-4 shadow-sticker-lg border-2 border-lilac bg-white/98 backdrop-blur-md rounded-2xl animate-modal pointer-events-auto font-sans">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-hotpink font-heading">
                {selectedItem.subtitle}
              </span>
              <h3 className="font-heading font-extrabold text-base text-ink leading-snug">
                {selectedItem.title}
              </h3>
            </div>
            <button
              type="button"
              onClick={() => setSelectedItem(null)}
              className="p-1 text-soft-ink hover:text-ink rounded-lg"
              aria-label="Close details"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {selectedItem.description && (
            <p className="text-xs text-soft-ink leading-relaxed mb-2 font-medium">
              {selectedItem.description}
            </p>
          )}

          <div className="flex items-center justify-between text-[11px] text-soft-ink py-1.5 border-t border-purple-100">
            <span className="font-medium">{selectedItem.statusText || 'Status documented'}</span>
            <DataSourceBadge source={selectedItem.source} />
          </div>

          {selectedItem.timestamp && (
            <div className="text-[10px] text-soft-ink/70 flex items-center gap-1 pb-2">
              <Clock className="w-3 h-3 text-grape" />
              <span>Observed {formatRelativeTime(selectedItem.timestamp)}</span>
            </div>
          )}

          {/* Action buttons: Directions & Report Issue */}
          <div className="pt-2 border-t border-purple-100 flex items-center gap-2">
            <button
              type="button"
              onClick={() => onSetAsDestination(selectedItem.coordinates, selectedItem.title)}
              className="btn-primary flex-1 py-2 px-3 text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm"
            >
              <Navigation className="w-3.5 h-3.5 text-white" />
              <span>Directions</span>
            </button>
            <button
              type="button"
              onClick={() => onRequestReport(selectedItem.coordinates)}
              className="btn-secondary py-2 px-3 text-xs font-bold"
            >
              Report Issue
            </button>
          </div>
        </div>
      )}
    </>
  );
};
