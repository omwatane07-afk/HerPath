'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Coordinates,
  PlaceSuggestion,
  RouteOption,
  RoutePreferences,
} from '@/types';
import { searchPlaces, reverseGeocode } from '@/services/geocoding-service';
import { DEMO_PRESET_ORIGINS, DEMO_PRESET_DESTINATIONS } from '@/lib/mock-data';
import { RouteCard } from './RouteCard';
import {
  MapPin,
  Navigation,
  ArrowUpDown,
  SlidersHorizontal,
  Search,
  Crosshair,
  Compass,
  Check,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface RoutePlannerProps {
  origin: Coordinates | null;
  destination: Coordinates | null;
  originName: string;
  destinationName: string;
  onSetOrigin: (coords: Coordinates, name: string) => void;
  onSetDestination: (coords: Coordinates, name: string) => void;
  routes: RouteOption[];
  selectedRouteIndex: number;
  onSelectRouteIndex: (idx: number) => void;
  isLoadingRoutes: boolean;
  onFetchRoutes: () => void;
  preferences: RoutePreferences;
  onUpdatePreferences: (prefs: RoutePreferences) => void;
  onOpenRouteDetails: (route: RouteOption) => void;
  onStartJourneyWithRoute: (route: RouteOption) => void;
}

export const RoutePlanner: React.FC<RoutePlannerProps> = ({
  origin,
  destination,
  originName,
  destinationName,
  onSetOrigin,
  onSetDestination,
  routes,
  selectedRouteIndex,
  onSelectRouteIndex,
  isLoadingRoutes,
  onFetchRoutes,
  preferences,
  onUpdatePreferences,
  onOpenRouteDetails,
  onStartJourneyWithRoute,
}) => {
  const [originInput, setOriginInput] = useState(originName);
  const [destInput, setDestInput] = useState(destinationName);
  const [originSuggestions, setOriginSuggestions] = useState<PlaceSuggestion[]>([]);
  const [destSuggestions, setDestSuggestions] = useState<PlaceSuggestion[]>([]);
  const [showOriginDropdown, setShowOriginDropdown] = useState(false);
  const [showDestDropdown, setShowDestDropdown] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  // Sync prop changes into inputs
  useEffect(() => {
    setOriginInput(originName);
  }, [originName]);

  useEffect(() => {
    setDestInput(destinationName);
  }, [destinationName]);

  // Debounced search for Origin
  useEffect(() => {
    if (!originInput || originInput.length < 2) {
      setOriginSuggestions([]);
      return;
    }
    const timer = setTimeout(async () => {
      const results = await searchPlaces(originInput);
      setOriginSuggestions(results);
    }, 250);
    return () => clearTimeout(timer);
  }, [originInput]);

  // Debounced search for Destination
  useEffect(() => {
    if (!destInput || destInput.length < 2) {
      setDestSuggestions([]);
      return;
    }
    const timer = setTimeout(async () => {
      const results = await searchPlaces(destInput);
      setDestSuggestions(results);
    }, 250);
    return () => clearTimeout(timer);
  }, [destInput]);

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser.');
      return;
    }
    setIsLocating(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        const address = await reverseGeocode(coords);
        onSetOrigin(coords, address);
        setOriginInput(address);
        setIsLocating(false);
      },
      (err) => {
        setIsLocating(false);
        setLocationError(
          err.code === 1
            ? 'Location access was denied. You can select a preset or type an address.'
            : 'Unable to retrieve your current location.'
        );
      },
      { timeout: 7000 }
    );
  };

  const handleSwap = () => {
    if (!origin || !destination) return;
    const tempCoords = origin;
    const tempName = originName;
    onSetOrigin(destination, destinationName);
    onSetDestination(tempCoords, tempName);
  };

  return (
    <div className="flex flex-col h-full bg-navy-900 border-r border-slate-800 text-slate-100 overflow-y-auto">
      {/* Title / Header */}
      <div className="p-4 border-b border-slate-800">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <Navigation className="w-4 h-4 text-teal-400" />
          <span>Plan a Safety-Aware Route</span>
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Compare verified lighting, facility support, and community reports
        </p>
      </div>

      {/* Inputs Area */}
      <div className="p-4 space-y-3 bg-navy-950/60 border-b border-slate-800">
        {/* Origin Input */}
        <div className="relative">
          <label className="block text-[11px] font-bold text-emerald-400 uppercase tracking-wider mb-1 flex items-center justify-between">
            <span>Starting Point (Origin)</span>
            <button
              onClick={handleUseCurrentLocation}
              disabled={isLocating}
              className="text-[11px] text-teal-400 hover:text-teal-300 flex items-center gap-1 font-medium capitalize disabled:opacity-50"
            >
              <Crosshair className={`w-3 h-3 ${isLocating ? 'animate-spin' : ''}`} />
              <span>{isLocating ? 'Locating...' : 'Use my GPS'}</span>
            </button>
          </label>
          <div className="relative">
            <input
              type="text"
              value={originInput}
              onChange={(e) => {
                setOriginInput(e.target.value);
                setShowOriginDropdown(true);
              }}
              onFocus={() => setShowOriginDropdown(true)}
              placeholder="Search origin address or metro station..."
              className="w-full py-2.5 pl-9 pr-3 text-xs rounded-xl bg-navy-900 border border-slate-700 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none text-slate-100 placeholder-slate-500 transition-colors"
            />
            <MapPin className="w-4 h-4 text-emerald-500 absolute left-3 top-3" />
          </div>

          {/* Origin Autocomplete Dropdown */}
          {showOriginDropdown && originSuggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-navy-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden max-h-48 overflow-y-auto">
              {originSuggestions.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    onSetOrigin(item.coordinates, item.name);
                    setOriginInput(item.name);
                    setShowOriginDropdown(false);
                  }}
                  className="w-full text-left p-2.5 hover:bg-navy-800 transition-colors border-b border-slate-800/80 last:border-b-0 text-xs"
                >
                  <div className="font-semibold text-slate-200">{item.name}</div>
                  <div className="text-[10px] text-slate-400 truncate">{item.displayName}</div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Swap Origin & Destination Button */}
        <div className="flex justify-center -my-1">
          <button
            onClick={handleSwap}
            disabled={!origin || !destination}
            className="p-1.5 rounded-full bg-navy-800 hover:bg-navy-750 text-slate-400 hover:text-teal-400 border border-slate-700 transition-all disabled:opacity-40"
            title="Swap Origin and Destination"
          >
            <ArrowUpDown className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Destination Input */}
        <div className="relative">
          <label className="block text-[11px] font-bold text-rose-400 uppercase tracking-wider mb-1">
            Destination
          </label>
          <div className="relative">
            <input
              type="text"
              value={destInput}
              onChange={(e) => {
                setDestInput(e.target.value);
                setShowDestDropdown(true);
              }}
              onFocus={() => setShowDestDropdown(true)}
              placeholder="Search destination, college, or facility..."
              className="w-full py-2.5 pl-9 pr-3 text-xs rounded-xl bg-navy-900 border border-slate-700 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none text-slate-100 placeholder-slate-500 transition-colors"
            />
            <MapPin className="w-4 h-4 text-rose-500 absolute left-3 top-3" />
          </div>

          {/* Destination Autocomplete Dropdown */}
          {showDestDropdown && destSuggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-navy-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden max-h-48 overflow-y-auto">
              {destSuggestions.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    onSetDestination(item.coordinates, item.name);
                    setDestInput(item.name);
                    setShowDestDropdown(false);
                  }}
                  className="w-full text-left p-2.5 hover:bg-navy-800 transition-colors border-b border-slate-800/80 last:border-b-0 text-xs"
                >
                  <div className="font-semibold text-slate-200">{item.name}</div>
                  <div className="text-[10px] text-slate-400 truncate">{item.displayName}</div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Presets Quick Picker */}
        <div className="pt-1">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">
            Demo Presets (Instant Demonstration)
          </span>
          <div className="flex flex-wrap gap-1.5">
            {DEMO_PRESET_DESTINATIONS.map((preset) => (
              <button
                key={preset.id}
                onClick={() => {
                  if (!origin) {
                    onSetOrigin(DEMO_PRESET_ORIGINS[0].coordinates, DEMO_PRESET_ORIGINS[0].name);
                  }
                  onSetDestination(preset.coordinates, preset.name);
                }}
                className="px-2 py-1 rounded-lg bg-navy-850 hover:bg-navy-800 border border-slate-700 text-[11px] text-slate-300 hover:text-white transition-colors"
              >
                📍 {preset.name.split(' ')[0]}
              </button>
            ))}
          </div>
        </div>

        {/* Location Error Notice */}
        {locationError && (
          <p className="text-[11px] text-amber-400 bg-amber-950/40 p-2 rounded-lg border border-amber-800/50">
            {locationError}
          </p>
        )}

        {/* Preferences Accordion Toggle */}
        <div className="pt-2">
          <button
            onClick={() => setShowPreferences(!showPreferences)}
            className="w-full flex items-center justify-between text-xs font-semibold text-slate-300 hover:text-white py-1 transition-colors"
          >
            <span className="flex items-center gap-1.5">
              <SlidersHorizontal className="w-3.5 h-3.5 text-teal-400" />
              <span>Route Routing Priorities</span>
            </span>
            {showPreferences ? (
              <ChevronUp className="w-3.5 h-3.5" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" />
            )}
          </button>

          {showPreferences && (
            <div className="mt-2.5 p-3 rounded-xl bg-navy-900 border border-slate-800 space-y-2 text-xs text-slate-300 animate-fadeIn">
              <label className="flex items-center justify-between cursor-pointer">
                <span>Prefer well-lit illuminated stretches</span>
                <input
                  type="checkbox"
                  checked={preferences.preferWellLit}
                  onChange={(e) =>
                    onUpdatePreferences({ ...preferences, preferWellLit: e.target.checked })
                  }
                  className="rounded text-teal-500 focus:ring-teal-500 h-3.5 w-3.5 bg-navy-950 border-slate-700"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer">
                <span>Prioritise routes near public transport</span>
                <input
                  type="checkbox"
                  checked={preferences.preferPublicTransport}
                  onChange={(e) =>
                    onUpdatePreferences({
                      ...preferences,
                      preferPublicTransport: e.target.checked,
                    })
                  }
                  className="rounded text-teal-500 focus:ring-teal-500 h-3.5 w-3.5 bg-navy-950 border-slate-700"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer">
                <span>Include mapped essential support points</span>
                <input
                  type="checkbox"
                  checked={preferences.preferEssentialFacilities}
                  onChange={(e) =>
                    onUpdatePreferences({
                      ...preferences,
                      preferEssentialFacilities: e.target.checked,
                    })
                  }
                  className="rounded text-teal-500 focus:ring-teal-500 h-3.5 w-3.5 bg-navy-950 border-slate-700"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer">
                <span>Reduce exposure to documented isolated paths</span>
                <input
                  type="checkbox"
                  checked={preferences.reduceIsolatedSegments}
                  onChange={(e) =>
                    onUpdatePreferences({
                      ...preferences,
                      reduceIsolatedSegments: e.target.checked,
                    })
                  }
                  className="rounded text-teal-500 focus:ring-teal-500 h-3.5 w-3.5 bg-navy-950 border-slate-700"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer">
                <span>Step-free / Wheelchair accessible</span>
                <input
                  type="checkbox"
                  checked={preferences.wheelchairAccessible}
                  onChange={(e) =>
                    onUpdatePreferences({
                      ...preferences,
                      wheelchairAccessible: e.target.checked,
                    })
                  }
                  className="rounded text-teal-500 focus:ring-teal-500 h-3.5 w-3.5 bg-navy-950 border-slate-700"
                />
              </label>
            </div>
          )}
        </div>

        {/* Find Routes Trigger Button */}
        <button
          onClick={onFetchRoutes}
          disabled={!origin || !destination || isLoadingRoutes}
          className="w-full mt-2 py-3 px-4 rounded-xl bg-teal-600 hover:bg-teal-500 active:scale-98 disabled:opacity-40 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-teal-950/60 transition-all"
        >
          {isLoadingRoutes ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Analyzing Infrastructure Corridors...</span>
            </>
          ) : (
            <>
              <Search className="w-4 h-4" />
              <span>Calculate Safety-Aware Routes</span>
            </>
          )}
        </button>
      </div>

      {/* Routes List Section */}
      <div className="p-4 flex-1 space-y-3">
        {routes.length > 0 ? (
          <>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Route Perspectives ({routes.length} options)
              </span>
              <span className="text-[11px] text-teal-400 font-medium">Click card to view</span>
            </div>

            <div className="space-y-3">
              {routes.map((route, idx) => (
                <RouteCard
                  key={route.id}
                  route={route}
                  isSelected={idx === selectedRouteIndex}
                  onSelect={() => onSelectRouteIndex(idx)}
                  onOpenDetails={() => onOpenRouteDetails(route)}
                />
              ))}
            </div>

            {/* Quick Action to Launch Family Companion with Selected Route */}
            {routes[selectedRouteIndex] && (
              <div className="pt-3">
                <button
                  onClick={() => onStartJourneyWithRoute(routes[selectedRouteIndex])}
                  className="w-full py-3 px-4 rounded-xl bg-navy-800 hover:bg-navy-750 border border-teal-500/50 text-teal-300 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md group"
                >
                  <Compass className="w-4 h-4 text-teal-400 group-hover:rotate-45 transition-transform" />
                  <span>Track with Family Companion</span>
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="h-48 flex flex-col items-center justify-center text-center p-6 text-slate-400 border border-dashed border-slate-800 rounded-2xl">
            <Compass className="w-8 h-8 text-slate-500 mb-2 stroke-1" />
            <h4 className="font-semibold text-slate-300 text-sm">No Routes Calculated</h4>
            <p className="text-xs text-slate-400 mt-1 max-w-xs">
              Select an origin and destination above or click one of the demo presets to compare corridor perspectives.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
