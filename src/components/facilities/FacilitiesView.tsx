'use client';

import React, { useState } from 'react';
import { EssentialFacility, FacilityCategory, Coordinates } from '@/types';
import { DataSourceBadge } from '../ui/Badge';
import { calculateDistanceMeters, formatDistance } from '@/lib/utils';
import {
  Building2,
  Navigation,
  Clock,
  Phone,
  CheckCircle2,
  AlertCircle,
  Search,
  Sparkles,
  HeartHandshake,
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
  { id: 'help_point', label: 'Assistance Kiosks', icon: 'ℹ️' },
];

export const FacilitiesView: React.FC<FacilitiesViewProps> = ({
  facilities,
  currentLocation,
  onSetAsDestination,
  onFlagFacility,
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
    <div className="flex flex-col h-full bg-navy-900 border-r border-slate-800 text-slate-100 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-slate-800">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <Building2 className="w-4 h-4 text-pink-400" />
          <span>Essential Support & Facilities</span>
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Verified women's facilities, emergency desks, and essential public points
        </p>
      </div>

      {/* Search & Category Filter */}
      <div className="p-3 bg-navy-950/70 border-b border-slate-800 space-y-2.5">
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search facility name, street, or service..."
            className="w-full py-2 pl-9 pr-3 text-xs rounded-xl bg-navy-900 border border-slate-700 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none text-slate-100 placeholder-slate-500"
          />
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
        </div>

        {/* Category Pills */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none text-[11px]">
          {CATEGORY_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedCategory(tab.id)}
              className={`px-3 py-1 rounded-full whitespace-nowrap font-medium transition-colors flex items-center gap-1 ${
                selectedCategory === tab.id
                  ? 'bg-teal-600 text-white shadow-sm'
                  : 'bg-navy-900 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Feature Toggles */}
        <div className="flex items-center gap-4 text-xs text-slate-300 pt-1">
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={accessibleOnly}
              onChange={(e) => setAccessibleOnly(e.target.checked)}
              className="rounded text-teal-500 focus:ring-teal-500 h-3.5 w-3.5 bg-navy-950 border-slate-700"
            />
            <span>♿ Wheelchair Accessible</span>
          </label>
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={femaleStaffOnly}
              onChange={(e) => setFemaleStaffOnly(e.target.checked)}
              className="rounded text-teal-500 focus:ring-teal-500 h-3.5 w-3.5 bg-navy-950 border-slate-700"
            />
            <span>👩 Female Staff Present</span>
          </label>
        </div>
      </div>

      {/* Facilities List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {filtered.length > 0 ? (
          filtered.map((facility) => {
            const distance = currentLocation
              ? calculateDistanceMeters(currentLocation, facility.coordinates)
              : null;

            return (
              <div
                key={facility.id}
                className="p-4 rounded-2xl bg-navy-950/80 border border-slate-800 hover:border-slate-700 transition-all space-y-2.5"
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-teal-400 tracking-wider">
                      {facility.category.replace(/_/g, ' ')}
                    </span>
                    <h3 className="font-bold text-sm text-white leading-tight mt-0.5">
                      {facility.name}
                    </h3>
                  </div>
                  <DataSourceBadge source={facility.source} />
                </div>

                {/* Address & distance */}
                <p className="text-xs text-slate-300 leading-relaxed">{facility.address}</p>

                {/* Details Badges */}
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  {distance !== null && (
                    <span className="px-2 py-0.5 rounded-md bg-navy-850 text-slate-300 font-mono text-[11px] border border-slate-800">
                      📍 {formatDistance(distance)} away
                    </span>
                  )}
                  {facility.openingHours && (
                    <span className="px-2 py-0.5 rounded-md bg-navy-850 text-slate-300 text-[11px] border border-slate-800 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span>{facility.openingHours}</span>
                    </span>
                  )}
                  {facility.isAccessible && (
                    <span className="px-2 py-0.5 rounded-md bg-emerald-950/80 text-emerald-300 text-[11px] border border-emerald-800/60 font-medium">
                      ♿ Accessible
                    </span>
                  )}
                  {facility.hasFemaleStaff && (
                    <span className="px-2 py-0.5 rounded-md bg-pink-950/80 text-pink-300 text-[11px] border border-pink-800/60 font-medium">
                      👩 Women Attendants
                    </span>
                  )}
                </div>

                {/* Notes if present */}
                {facility.notes && (
                  <p className="text-[11px] text-slate-400 bg-navy-900/60 p-2 rounded-lg border border-slate-800/80">
                    💡 {facility.notes}
                  </p>
                )}

                {/* Actions */}
                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2">
                  {facility.phone ? (
                    <a
                      href={`tel:${facility.phone}`}
                      className="text-xs text-slate-300 hover:text-white flex items-center gap-1 font-medium py-1 px-2 rounded-lg hover:bg-navy-850 transition-colors"
                    >
                      <Phone className="w-3.5 h-3.5 text-teal-400" />
                      <span>Call Facility</span>
                    </a>
                  ) : (
                    <span className="text-[10px] text-slate-500">Official listing verified</span>
                  )}

                  <button
                    onClick={() => onSetAsDestination(facility.coordinates, facility.name)}
                    className="py-1.5 px-3 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-md active:scale-95"
                  >
                    <Navigation className="w-3.5 h-3.5" />
                    <span>Get Directions</span>
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="h-48 flex flex-col items-center justify-center text-center p-6 text-slate-400 border border-dashed border-slate-800 rounded-2xl">
            <Building2 className="w-8 h-8 text-slate-500 mb-2 stroke-1" />
            <h4 className="font-semibold text-slate-300 text-sm">No Facilities Found</h4>
            <p className="text-xs text-slate-400 mt-1">
              Try switching category filters or clearing the search query.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
