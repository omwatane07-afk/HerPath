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
  { id: 'all', label: 'All Places' },
  { id: 'womens_restroom', label: "Women's Restrooms" },
  { id: 'public_toilet', label: 'Public Toilets' },
  { id: 'pharmacy', label: 'Pharmacies' },
  { id: 'police_station', label: 'Police Desks' },
  { id: 'hospital', label: 'Hospitals' },
  { id: 'help_point', label: 'Help Kiosks' },
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

  return (
    <div className="flex flex-col h-full bg-canvas text-bordeaux overflow-hidden w-full">
      {/* Header */}
      <div className="p-4 sm:p-5 border-b border-border bg-white shadow-sm">
        <h2 className="font-editorial text-xl font-bold text-bordeaux">Essential Facilities</h2>
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
            className="w-full py-2.5 pl-9 pr-3 text-xs rounded-xl bg-canvas border border-border focus:border-rose-gold focus-ring-bordeaux text-bordeaux placeholder:text-text-muted font-medium transition-colors"
            aria-label="Search facilities"
          />
          <Search className="w-4 h-4 text-text-secondary absolute left-3 top-3" />
        </div>

        {/* Horizontally scrollable category filter row */}
        <div className="mt-3 flex gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs" role="tablist">
          {CATEGORY_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedCategory(tab.id)}
              className={`px-3 py-1.5 rounded-xl whitespace-nowrap font-semibold transition-all focus-ring-bordeaux ${
                selectedCategory === tab.id
                  ? 'bg-bordeaux text-white font-bold shadow-sm'
                  : 'bg-canvas text-text-secondary hover:text-bordeaux hover:bg-canvas-subtle border border-border'
              }`}
              role="tab"
              aria-selected={selectedCategory === tab.id}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Attribute toggles */}
        <div className="mt-2.5 flex items-center gap-3 pt-2 border-t border-border/70 text-xs">
          <label className="flex items-center gap-1.5 cursor-pointer select-none text-text-secondary hover:text-bordeaux">
            <input
              type="checkbox"
              checked={accessibleOnly}
              onChange={(e) => setAccessibleOnly(e.target.checked)}
              className="rounded border-border text-rose-gold focus:ring-rose-gold h-3.5 w-3.5"
            />
            <span>Step-free access</span>
          </label>
          <label className="flex items-center gap-1.5 cursor-pointer select-none text-text-secondary hover:text-bordeaux">
            <input
              type="checkbox"
              checked={femaleStaffOnly}
              onChange={(e) => setFemaleStaffOnly(e.target.checked)}
              className="rounded border-border text-rose-gold focus:ring-rose-gold h-3.5 w-3.5"
            />
            <span>Female staff on duty</span>
          </label>
        </div>
      </div>

      {/* Facility List */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3">
        <div className="flex items-center justify-between text-xs text-text-secondary px-0.5">
          <span className="font-semibold uppercase tracking-wider text-[11px] font-editorial">
            {filtered.length} Facilities Located
          </span>
          {currentLocation && (
            <span className="text-[11px]">Distances from current position</span>
          )}
        </div>

        {filtered.length === 0 ? (
          <div className="surface-card p-6 text-center text-text-secondary space-y-1 border border-border">
            <Building2 className="w-8 h-8 text-border-strong mx-auto" />
            <p className="text-sm font-semibold text-bordeaux font-editorial">No facilities match your filter</p>
            <p className="text-xs">Try selecting a different category or clearing search terms.</p>
          </div>
        ) : (
          filtered.map((fac) => {
            const dist = currentLocation
              ? calculateDistanceMeters(currentLocation, fac.coordinates)
              : null;
            const isSaved = savedIds.has(fac.id);

            return (
              <article
                key={fac.id}
                className="surface-card p-4 space-y-2.5 transition-all card-interactive shadow-e1 border border-border hover:border-champagne"
              >
                {/* Header: Name, Distance, Verification */}
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-[10px] font-bold text-rose-gold uppercase tracking-wider font-editorial">
                        {fac.category.replace(/_/g, ' ')}
                      </span>
                      {dist !== null && (
                        <span className="text-[11px] text-text-secondary font-medium">
                          · {formatDistance(dist)} away
                        </span>
                      )}
                    </div>
                    <h3 className="font-editorial text-base font-bold text-bordeaux leading-snug">
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
                      <Phone className="w-3.5 h-3.5 text-text-secondary" />
                      <a
                        href={`tel:${fac.phone.replace(/[^0-9+]/g, '')}`}
                        className="hover:text-bordeaux font-medium underline"
                      >
                        {fac.phone}
                      </a>
                    </div>
                  )}
                </div>

                {/* Maximum 2 Attribute Chips */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {fac.hasFemaleStaff && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-rose-tint text-rose-gold border border-rose-gold/30">
                      <UserCheck className="w-3 h-3 text-rose-gold" />
                      <span>Female Staff</span>
                    </span>
                  )}
                  {fac.isAccessible && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-surface-raised text-bordeaux border border-border">
                      <Accessibility className="w-3 h-3 text-text-secondary" />
                      <span>Step-Free Access</span>
                    </span>
                  )}
                </div>

                {/* Actions: Get Directions & Save */}
                <div className="pt-2.5 border-t border-border flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => onSetAsDestination(fac.coordinates, fac.name)}
                    className="btn-bordeaux py-2 px-3.5 text-xs font-semibold flex items-center gap-1.5 shadow-sm"
                  >
                    <Navigation className="w-3 h-3 text-champagne" />
                    <span>Get directions</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => toggleSave(fac.id)}
                    className={`py-1.5 px-3 rounded-xl text-xs font-medium border transition-colors flex items-center gap-1.5 ${
                      isSaved
                        ? 'bg-rose-tint text-rose-gold border-rose-gold/40'
                        : 'bg-canvas text-text-secondary hover:text-bordeaux hover:bg-canvas-subtle border-border'
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
