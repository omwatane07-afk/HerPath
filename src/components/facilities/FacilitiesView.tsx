'use client';

import React, { useState } from 'react';
import { EssentialFacility, Coordinates } from '@/types';
import { DataSourceBadge } from '../ui/Badge';
import { calculateDistanceMeters, formatDistance } from '@/lib/utils';
import {
  Building2,
  Navigation,
  Clock,
  Phone,
  Search,
  Accessibility,
  UserCheck,
  Bookmark,
} from 'lucide-react';

interface FacilitiesViewProps {
  facilities: EssentialFacility[];
  currentLocation: Coordinates | null;
  onSetAsDestination: (coords: Coordinates, name: string) => void;
  onFlagFacility?: (id: string) => void;
}

const CATEGORY_TABS = [
  { id: 'all', label: 'All Places', glyph: '🏢' },
  { id: 'womens_restroom', label: "Women's Restrooms", glyph: '🚺' },
  { id: 'public_toilet', label: 'Public Toilets', glyph: '🚻' },
  { id: 'pharmacy', label: 'Pharmacies', glyph: '💊' },
  { id: 'police_station', label: 'Police Desks', glyph: '🛡️' },
  { id: 'hospital', label: 'Hospitals', glyph: '🏥' },
  { id: 'help_point', label: 'Help Kiosks', glyph: 'ℹ️' },
];

export const FacilitiesView: React.FC<FacilitiesViewProps> = ({
  facilities,
  currentLocation,
  onSetAsDestination,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [accessibleOnly, setAccessibleOnly] = useState(false);
  const [femaleStaffOnly, setFemaleStaffOnly] = useState(false);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());

  const toggleSave = (id: string) => {
    setSavedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const filtered = facilities.filter((fac) => {
    if (selectedCategory !== 'all' && fac.category !== selectedCategory) return false;
    if (accessibleOnly && !fac.isAccessible) return false;
    if (femaleStaffOnly && !fac.hasFemaleStaff) return false;
    if (
      searchQuery.trim() &&
      !fac.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !fac.address.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  const getCategoryColor = (category: string) => {
    if (category === 'womens_restroom' || category === 'public_toilet') return 'text-[#8E2F7E]';
    if (category === 'pharmacy' || category === 'hospital') return 'text-[#0F766E]';
    if (category === 'police_station' || category === 'help_point') return 'text-[#2B3A67]';
    return 'text-primary';
  };

  return (
    <div className="flex flex-col h-full bg-card text-ink overflow-hidden w-full font-sans">
      {/* Header */}
      <div className="p-4 sm:p-5 border-b border-border bg-card">
        <h2 className="font-editorial text-xl sm:text-2xl font-bold text-ink">Essential Facilities</h2>
        <p className="text-xs text-text-secondary mt-0.5 leading-relaxed">
          Curated directory of verified women’s restrooms, pharmacies, and 24/7 assistance points.
        </p>

        {/* Search Input */}
        <div className="mt-3.5 relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search facility name, address, or service..."
            className="input-control w-full py-2.5 pl-9 pr-3 text-xs text-ink placeholder:text-text-muted font-medium"
            aria-label="Search facilities"
          />
          <Search className="w-4 h-4 text-text-muted absolute left-3 top-3" />
        </div>

        {/* Horizontally scrollable category filter row */}
        <div className="mt-3 flex gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs" role="tablist">
          {CATEGORY_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedCategory(tab.id)}
              className={`px-3 py-1.5 rounded-xl whitespace-nowrap font-semibold transition-all focus-ring-primary flex items-center gap-1.5 ${
                selectedCategory === tab.id
                  ? 'bg-primary text-white font-bold shadow-sm'
                  : 'bg-canvas text-text-secondary hover:text-ink hover:bg-canvas-2 border border-border'
              }`}
            >
              <span>{tab.glyph}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Accessibility & Staff Filter Checkboxes */}
        <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-text-secondary pt-1 border-t border-border/60">
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={accessibleOnly}
              onChange={(e) => setAccessibleOnly(e.target.checked)}
              className="rounded border-border-control text-primary focus:ring-primary h-3.5 w-3.5"
            />
            <span>Step-free access</span>
          </label>
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={femaleStaffOnly}
              onChange={(e) => setFemaleStaffOnly(e.target.checked)}
              className="rounded border-border-control text-primary focus:ring-primary h-3.5 w-3.5"
            />
            <span>Female staff on duty</span>
          </label>
        </div>
      </div>

      {/* Directory Content List */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3">
        <div className="flex items-center justify-between text-xs text-text-muted px-0.5">
          <span className="font-semibold uppercase tracking-wider text-[11px] text-text-secondary font-editorial">
            {filtered.length} Facilities Located
          </span>
          <span className="text-[11px]">Distances from current position</span>
        </div>

        {filtered.length === 0 ? (
          <div className="surface-card p-8 text-center text-text-secondary space-y-2 border border-border">
            <Building2 className="w-8 h-8 text-border-control mx-auto" />
            <p className="text-sm font-semibold text-ink font-editorial">No matching facilities found</p>
            <p className="text-xs">
              Try adjusting your category selection, search terms, or accessibility filters.
            </p>
          </div>
        ) : (
          filtered.map((fac) => {
            const dist = currentLocation
              ? calculateDistanceMeters(currentLocation, fac.coordinates)
              : null;
            const isSaved = savedIds.has(fac.id);
            const colorClass = getCategoryColor(fac.category);

            return (
              <article
                key={fac.id}
                className="surface-card p-4 space-y-2.5 transition-all card-interactive shadow-e1 border border-border hover:border-primary"
              >
                {/* Header: Name, Distance, Verification */}
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className={`text-[10px] font-bold uppercase tracking-wider font-editorial ${colorClass}`}>
                        {fac.category.replace(/_/g, ' ')}
                      </span>
                      {dist !== null && (
                        <span className="text-[11px] text-text-secondary font-medium tabular-nums">
                          · {formatDistance(dist)} away
                        </span>
                      )}
                    </div>
                    <h3 className="font-editorial text-base font-bold text-ink leading-snug">
                      {fac.name}
                    </h3>
                    <p className="text-xs text-text-secondary mt-0.5 line-clamp-1">
                      {fac.address}
                    </p>
                  </div>

                  <DataSourceBadge source={fac.source} />
                </div>

                {/* Operating hours & phone if known */}
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-text-secondary">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-champagne" />
                    <span>{fac.openingHours ? fac.openingHours : 'Hours not listed'}</span>
                  </div>

                  {fac.phone && (
                    <div className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-text-muted" />
                      <a
                        href={`tel:${fac.phone.replace(/[^0-9+]/g, '')}`}
                        className="hover:text-primary font-medium underline"
                      >
                        {fac.phone}
                      </a>
                    </div>
                  )}
                </div>

                {/* Attribute Badges */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {fac.hasFemaleStaff && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#8E2F7E]/10 text-[#8E2F7E] border border-[#8E2F7E]/30">
                      <UserCheck className="w-3 h-3 text-[#8E2F7E]" />
                      <span>Female Staff</span>
                    </span>
                  )}
                  {fac.isAccessible && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-canvas text-ink border border-border">
                      <Accessibility className="w-3 h-3 text-text-secondary" />
                      <span>Step-Free Access</span>
                    </span>
                  )}
                </div>

                {/* Single Primary Action: Get Directions & Secondary Save */}
                <div className="pt-2.5 border-t border-border flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => onSetAsDestination(fac.coordinates, fac.name)}
                    className="btn-primary py-2 px-4 text-xs font-semibold flex items-center gap-1.5 shadow-sm"
                  >
                    <Navigation className="w-3.5 h-3.5 text-white" />
                    <span>Get directions</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => toggleSave(fac.id)}
                    className={`py-2 px-3 rounded-xl text-xs font-medium border transition-colors flex items-center gap-1.5 ${
                      isSaved
                        ? 'bg-primary-tint text-primary border-primary/40'
                        : 'bg-card text-text-secondary hover:text-ink hover:bg-canvas border-border-control/50'
                    }`}
                    title={isSaved ? 'Saved to places' : 'Save place'}
                  >
                    <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-current' : ''}`} />
                    <span>{isSaved ? 'Saved' : 'Save'}</span>
                  </button>
                </div>
              </article>
            );
          })
        )}
      </div>
    </div>
  );
};
