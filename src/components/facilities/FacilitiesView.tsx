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
} from 'lucide-react';

interface FacilitiesViewProps {
  facilities: EssentialFacility[];
  currentLocation: Coordinates | null;
  onSetAsDestination: (coords: Coordinates, name: string) => void;
  onFlagFacility?: (id: string) => void;
}

const CATEGORY_TABS: { id: string; label: string; icon: string }[] = [
  { id: 'all', label: 'All Services', icon: '✨' },
  { id: 'womens_restroom', label: 'Women Restrooms', icon: '🚺' },
  { id: 'public_toilet', label: 'Public Toilets', icon: '🚻' },
  { id: 'pharmacy', label: 'Pharmacies', icon: '💊' },
  { id: 'police_station', label: 'Police Desks', icon: '👮' },
  { id: 'hospital', label: 'Hospitals', icon: '🏥' },
  { id: 'help_point', label: 'Help Kiosks', icon: 'ℹ️' },
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
    <div className="flex flex-col h-full bg-brand-bg text-brand-text overflow-hidden w-full">
      {/* Header */}
      <div className="p-3.5 sm:p-5 border-b border-brand-border/70 glass-pearl">
        <h2 className="text-base sm:text-lg font-black text-brand-text flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-pink-50 text-pink-600 flex items-center justify-center border border-pink-200/90 shadow-xs ring-1 ring-champagne-300/60">
            <Building2 className="w-4 h-4 text-pink-600" />
          </div>
          <span>Essential Support & Facilities</span>
        </h2>
        <p className="text-[11px] sm:text-xs text-brand-text-secondary mt-1 font-medium leading-relaxed">
          Verified women's facilities, emergency desks, and essential public points
        </p>
      </div>

      {/* Search & Category Filter */}
      <div className="p-3 sm:p-4 bg-white/70 backdrop-blur-md border-b border-brand-border/70 space-y-2.5 shadow-xs">
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search facility name, street, or service..."
            className="w-full py-2.5 pl-9 pr-3 text-xs rounded-2xl bg-white/80 border border-brand-border/90 focus:border-teal-500 focus:bg-white focus:ring-2 focus:ring-teal-100 outline-none text-brand-text placeholder-brand-text-muted font-medium transition-all shadow-inner-glass"
          />
          <Search className="w-4 h-4 text-brand-text-muted absolute left-3 top-3" />
        </div>

        {/* Category Pills */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
          {CATEGORY_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedCategory(tab.id)}
              className={`px-3 py-1.5 rounded-full whitespace-nowrap font-bold transition-all flex items-center gap-1.5 text-xs ${
                selectedCategory === tab.id
                  ? 'bg-teal-500 text-white shadow-xs font-bold'
                  : 'bg-white/80 text-brand-text-secondary hover:text-brand-text border border-brand-border/80 hover:bg-champagne-50/50'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Feature Toggles */}
        <div className="flex items-center gap-4 text-xs text-brand-text-secondary pt-0.5 font-medium">
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={accessibleOnly}
              onChange={(e) => setAccessibleOnly(e.target.checked)}
              className="rounded text-teal-600 focus:ring-teal-400 h-3.5 w-3.5 border-brand-border"
            />
            <span>♿ Wheelchair Accessible</span>
          </label>
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={femaleStaffOnly}
              onChange={(e) => setFemaleStaffOnly(e.target.checked)}
              className="rounded text-teal-600 focus:ring-teal-400 h-3.5 w-3.5 border-brand-border"
            />
            <span>👩 Female Staff Present</span>
          </label>
        </div>
      </div>

      {/* Facilities List */}
      <div className="flex-1 overflow-y-auto p-3.5 sm:p-4 space-y-3 pb-24 lg:pb-6">
        {filtered.length > 0 ? (
          filtered.map((facility) => {
            const distance = currentLocation
              ? calculateDistanceMeters(currentLocation, facility.coordinates)
              : null;

            return (
              <div
                key={facility.id}
                className="p-4 rounded-royal surface-pearl border border-brand-border/80 shadow-card hover:border-teal-200 transition-all space-y-2.5"
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-teal-700 tracking-wider">
                      {facility.category.replace(/_/g, ' ')}
                    </span>
                    <h3 className="font-bold text-sm text-brand-text leading-tight mt-0.5">
                      {facility.name}
                    </h3>
                  </div>
                  <DataSourceBadge source={facility.source} />
                </div>

                {/* Address & distance */}
                <p className="text-xs text-brand-text-secondary leading-relaxed font-medium">
                  {facility.address}
                </p>

                {/* Details Badges */}
                <div className="flex flex-wrap items-center gap-1.5 text-xs">
                  {distance !== null && (
                    <span className="px-2.5 py-0.5 rounded-full bg-brand-pearl text-brand-text font-mono text-[11px] border border-brand-border font-semibold shadow-xs">
                      📍 {formatDistance(distance)} away
                    </span>
                  )}
                  {facility.openingHours && (
                    <span className="px-2.5 py-0.5 rounded-full bg-brand-pearl text-brand-text text-[11px] border border-brand-border flex items-center gap-1 font-medium shadow-xs">
                      <Clock className="w-3 h-3 text-brand-text-muted" />
                      <span>{facility.openingHours}</span>
                    </span>
                  )}
                  {facility.isAccessible && (
                    <span className="px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-700 text-[11px] border border-teal-200 font-semibold shadow-xs">
                      ♿ Accessible
                    </span>
                  )}
                  {facility.hasFemaleStaff && (
                    <span className="px-2.5 py-0.5 rounded-full bg-pink-50 text-pink-700 text-[11px] border border-pink-200 font-semibold shadow-xs">
                      👩 Women Attendants
                    </span>
                  )}
                </div>

                {/* Notes if present */}
                {facility.notes && (
                  <p className="text-[11px] text-brand-text-secondary bg-brand-bg/70 p-2.5 rounded-xl border border-brand-border/80 font-medium">
                    💡 {facility.notes}
                  </p>
                )}

                {/* Actions */}
                <div className="pt-2 border-t border-brand-border/70 flex items-center justify-between gap-2">
                  {facility.phone ? (
                    <a
                      href={`tel:${facility.phone}`}
                      className="text-xs text-teal-700 hover:text-teal-900 flex items-center gap-1 font-semibold py-1.5 px-3 rounded-full bg-teal-50 hover:bg-teal-100 border border-teal-200/60 transition-colors"
                    >
                      <Phone className="w-3.5 h-3.5 text-teal-600" />
                      <span>Call Facility</span>
                    </a>
                  ) : (
                    <span className="text-[11px] text-brand-text-muted font-medium">
                      Official listing verified
                    </span>
                  )}

                  <button
                    onClick={() => onSetAsDestination(facility.coordinates, facility.name)}
                    className="py-1.5 px-3.5 rounded-full bg-gradient-to-r from-teal-500 to-teal-700 hover:from-teal-600 hover:to-teal-800 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-xs active:scale-95"
                  >
                    <Navigation className="w-3.5 h-3.5" />
                    <span>Get Directions</span>
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="h-44 flex flex-col items-center justify-center text-center p-6 text-brand-text-secondary border border-dashed border-brand-border/80 rounded-royal bg-white/50">
            <Building2 className="w-8 h-8 text-brand-text-muted mb-2 stroke-1" />
            <h4 className="font-bold text-brand-text text-sm">No Facilities Found</h4>
            <p className="text-xs text-brand-text-secondary mt-1">
              Try switching category filters or clearing the search query.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
