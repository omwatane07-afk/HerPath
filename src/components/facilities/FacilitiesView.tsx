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
  Sparkles,
} from 'lucide-react';

interface FacilitiesViewProps {
  facilities: EssentialFacility[];
  currentLocation: Coordinates | null;
  onSetAsDestination: (coords: Coordinates, name: string) => void;
  onFlagFacility?: (id: string) => void;
}

const CATEGORY_TABS = [
  { id: 'all', label: 'All Places', glyph: '✨' },
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
    if (category === 'womens_restroom' || category === 'public_toilet') return 'text-hotpink font-bold';
    if (category === 'pharmacy' || category === 'hospital') return 'text-emerald-700 font-bold';
    if (category === 'police_station' || category === 'help_point') return 'text-grape font-bold';
    return 'text-grape font-bold';
  };

  return (
    <div className="flex flex-col h-full bg-[#FCFAFF] text-ink overflow-hidden w-full font-sans">
      {/* Header */}
      <div className="p-4 sm:p-5 border-b border-border bg-white">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-lilac text-grape text-[10px] font-bold mb-1">
          <Sparkles className="w-3 h-3 text-grape" />
          <span>Verified Places</span>
        </div>
        <h2 className="font-heading text-xl sm:text-2xl font-extrabold text-ink">Essential Facilities</h2>
        <p className="text-xs text-soft-ink mt-0.5 leading-relaxed font-medium">
          Verified directory of women’s restrooms, 24/7 pharmacies, and police assistance desks.
        </p>

        {/* Search Input */}
        <div className="mt-3.5 relative luggage-tag">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search facility name, address, or service..."
            className="w-full py-2.5 pl-9 pr-3 text-xs text-ink placeholder:text-soft-ink/70 font-semibold bg-transparent rounded-[18px] focus:outline-none"
            aria-label="Search facilities"
          />
          <Search className="w-4 h-4 text-soft-ink absolute left-3 top-3" />
        </div>

        {/* Horizontally scrollable sticker category filter row */}
        <div className="mt-3 flex gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs" role="tablist">
          {CATEGORY_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedCategory(tab.id)}
              className={`px-3 py-1.5 rounded-full whitespace-nowrap font-bold transition-all focus-ring-primary flex items-center gap-1.5 ${
                selectedCategory === tab.id
                  ? 'bg-grape text-white shadow-sm'
                  : 'bg-[#F1EAFF] text-soft-ink hover:text-ink hover:bg-lilac border border-purple-100'
              }`}
            >
              <span>{tab.glyph}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Accessibility & Staff Filter Checkboxes */}
        <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-soft-ink pt-2 border-t border-purple-100">
          <label className="flex items-center gap-1.5 cursor-pointer font-semibold">
            <input
              type="checkbox"
              checked={accessibleOnly}
              onChange={(e) => setAccessibleOnly(e.target.checked)}
              className="rounded-md border-border-control text-grape focus:ring-grape h-3.5 w-3.5"
            />
            <span>Step-free access</span>
          </label>
          <label className="flex items-center gap-1.5 cursor-pointer font-semibold">
            <input
              type="checkbox"
              checked={femaleStaffOnly}
              onChange={(e) => setFemaleStaffOnly(e.target.checked)}
              className="rounded-md border-border-control text-grape focus:ring-grape h-3.5 w-3.5"
            />
            <span>Female staff on duty</span>
          </label>
        </div>
      </div>

      {/* Directory Content List */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3 pb-24 lg:pb-6">
        <div className="flex items-center justify-between text-xs text-soft-ink px-0.5">
          <span className="font-heading font-extrabold uppercase tracking-wider text-[11px] text-soft-ink">
            {filtered.length} Facilities Located
          </span>
          <span className="text-[11px] font-medium">Distances from current position</span>
        </div>

        {filtered.length === 0 ? (
          <div className="sticker-card p-8 text-center text-soft-ink space-y-2 bg-white">
            <Building2 className="w-8 h-8 text-purple-300 mx-auto" />
            <p className="text-sm font-extrabold text-ink font-heading">No matching facilities found</p>
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
                className="sticker-card p-4 space-y-2.5 transition-all bg-white"
              >
                {/* Header: Name, Distance, Verification */}
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className={`text-[10px] font-extrabold uppercase tracking-wider font-heading ${colorClass}`}>
                        {fac.category.replace(/_/g, ' ')}
                      </span>
                      {dist !== null && (
                        <span className="text-[11px] text-soft-ink font-semibold tabular-nums">
                          · {formatDistance(dist)} away
                        </span>
                      )}
                    </div>
                    <h3 className="font-heading text-base font-extrabold text-ink leading-snug">
                      {fac.name}
                    </h3>
                    <p className="text-xs text-soft-ink mt-0.5 line-clamp-1 font-medium">
                      {fac.address}
                    </p>
                  </div>

                  <DataSourceBadge source={fac.source} />
                </div>

                {/* Operating hours & phone if known */}
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-soft-ink">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-butter" />
                    <span className="font-medium">{fac.openingHours ? fac.openingHours : 'Hours not listed'}</span>
                  </div>

                  {fac.phone && (
                    <div className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-soft-ink" />
                      <a
                        href={`tel:${fac.phone.replace(/[^0-9+]/g, '')}`}
                        className="hover:text-grape font-bold underline"
                      >
                        {fac.phone}
                      </a>
                    </div>
                  )}
                </div>

                {/* Attribute Badges */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {fac.hasFemaleStaff && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-pink-50 text-pink-700 border border-pink-200">
                      <UserCheck className="w-3 h-3 text-pink-600" />
                      <span>Female Staff</span>
                    </span>
                  )}
                  {fac.isAccessible && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                      <Accessibility className="w-3 h-3 text-blue-600" />
                      <span>Step-Free Access</span>
                    </span>
                  )}
                  {fac.verificationStatus === 'official_verified' && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                      <span>✓ Civic Verified</span>
                    </span>
                  )}
                </div>

                {/* Primary Action Button: Set as Destination */}
                <div className="pt-2 border-t border-purple-100 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => toggleSave(fac.id)}
                    className={`text-xs font-bold px-3 py-1.5 rounded-full border transition-colors flex items-center gap-1.5 ${
                      isSaved
                        ? 'bg-butter/30 text-amber-900 border-butter'
                        : 'bg-paper text-soft-ink border-border hover:text-ink'
                    }`}
                  >
                    <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-amber-500 text-amber-600' : ''}`} />
                    <span>{isSaved ? 'Saved' : 'Save'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onSetAsDestination(fac.coordinates, fac.name)}
                    className="btn-primary px-4 py-1.5 text-xs font-bold flex items-center gap-1.5"
                  >
                    <Navigation className="w-3.5 h-3.5 text-white" />
                    <span>Walk Here</span>
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
