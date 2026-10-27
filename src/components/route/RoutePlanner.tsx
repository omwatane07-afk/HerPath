'use client';

import React, { useState, useEffect } from 'react';
import { Coordinates, RouteOption, RoutePreferences } from '@/types';
import { RouteCard } from './RouteCard';
import {
  Navigation,
  MapPin,
  ArrowUpDown,
  Search,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  Crosshair,
  Compass,
  Sparkles,
} from 'lucide-react';

interface RoutePlannerProps {
  origin: Coordinates | null;
  destination: Coordinates | null;
  originName?: string;
  destinationName?: string;
  onSetOrigin: (coords: Coordinates, name: string) => void;
  onSetDestination: (coords: Coordinates, name: string) => void;
  routes: RouteOption[];
  selectedRouteIndex: number;
  onSelectRouteIndex: (index: number) => void;
  isLoadingRoutes: boolean;
  onFetchRoutes: () => void;
  preferences: RoutePreferences;
  onUpdatePreferences: (prefs: RoutePreferences) => void;
  onOpenRouteDetails: (route: RouteOption) => void;
  onStartJourneyWithRoute: (route: RouteOption) => void;
}

// Preset demonstration locations for Delhi NCR
const DEMO_PRESET_ORIGINS = [
  { id: 'rajiv_chowk', name: 'Rajiv Chowk Metro Station', coordinates: { lat: 28.6328, lng: 77.2197 }, displayName: 'Gate 2, Connaught Place' },
  { id: 'patel_chowk', name: 'Patel Chowk Metro', coordinates: { lat: 28.6232, lng: 77.2142 }, displayName: 'Ashoka Road Exit' },
  { id: 'janpath', name: 'Janpath Market Entry', coordinates: { lat: 28.6275, lng: 77.2190 }, displayName: 'Tolstoy Road Corner' },
];

const DEMO_PRESET_DESTINATIONS = [
  { id: 'mandi_house', name: 'Mandi House Cultural Center', coordinates: { lat: 28.6258, lng: 77.2345 }, displayName: 'Sikandra Road, New Delhi' },
  { id: 'bengali_market', name: 'Bengali Market Circle', coordinates: { lat: 28.6290, lng: 77.2310 }, displayName: 'Tansen Marg' },
  { id: 'parliament_st', name: 'Parliament Street Kiosk', coordinates: { lat: 28.6240, lng: 77.2120 }, displayName: 'Sansad Marg' },
];

export const RoutePlanner: React.FC<RoutePlannerProps> = ({
  origin,
  destination,
  originName = '',
  destinationName = '',
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
  const [travelMode, setTravelMode] = useState<'walk' | 'transit'>('walk');
  const [originInput, setOriginInput] = useState(originName);
  const [destInput, setDestInput] = useState(destinationName);
  const [showPreferences, setShowPreferences] = useState(false);
  const [showOriginDropdown, setShowOriginDropdown] = useState(false);
  const [showDestDropdown, setShowDestDropdown] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  useEffect(() => {
    setOriginInput(originName);
  }, [originName]);

  useEffect(() => {
    setDestInput(destinationName);
  }, [destinationName]);

  // Autocomplete suggestions
  const originSuggestions = DEMO_PRESET_ORIGINS.filter(
    (item) =>
      item.name.toLowerCase().includes(originInput.toLowerCase()) ||
      item.displayName.toLowerCase().includes(originInput.toLowerCase())
  );

  const destSuggestions = DEMO_PRESET_DESTINATIONS.filter(
    (item) =>
      item.name.toLowerCase().includes(destInput.toLowerCase()) ||
      item.displayName.toLowerCase().includes(destInput.toLowerCase())
  );

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser.');
      return;
    }

    setIsLocating(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        onSetOrigin(coords, 'Current GPS Location');
        setOriginInput('Current GPS Location');
        setIsLocating(false);
      },
      () => {
        setIsLocating(false);
        const fallback = DEMO_PRESET_ORIGINS[0];
        onSetOrigin(fallback.coordinates, `${fallback.name} (Simulated GPS)`);
        setOriginInput(`${fallback.name} (Simulated GPS)`);
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
    <div className="w-full text-brand-text space-y-3.5">
      {/* Search & Planner Card Container */}
      <div className="space-y-3.5">
        {/* Title / Header */}
        <div>
          <h2 className="text-base sm:text-lg font-black text-brand-text flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-teal-50 to-teal-100 text-teal-700 flex items-center justify-center border border-teal-200/90 shadow-xs ring-1 ring-champagne-300/60 shrink-0">
              <Navigation className="w-4 h-4 text-teal-600" />
            </div>
            <span>Plan Your Safe Route</span>
          </h2>
          <p className="text-[11px] sm:text-xs text-brand-text-secondary mt-1 font-medium leading-relaxed">
            Compare verified streetlights, transport hubs, and community observations
          </p>
        </div>

        {/* Floating Route Search Surface (Royal Soft Glass) */}
        <div className="p-4 rounded-royal glass-pearl border border-white/95 shadow-glass-pearl space-y-3.5 relative">
          {/* Travel Mode Segmented Control (Google Maps Usability Benchmark) */}
          <div className="flex p-1 rounded-2xl bg-white/75 border border-brand-border/80 shadow-inner-glass text-xs font-semibold gap-1">
            <button
              type="button"
              onClick={() => {
                setTravelMode('walk');
                onUpdatePreferences({ ...preferences, preferPublicTransport: false });
              }}
              className={`flex-1 py-1.5 px-2 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                travelMode === 'walk'
                  ? 'bg-gradient-to-r from-teal-500 to-teal-600 text-white shadow-sm font-bold'
                  : 'text-brand-text-secondary hover:text-brand-text hover:bg-white/50'
              }`}
            >
              <span>🚶</span>
              <span>Walk Focus</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setTravelMode('transit');
                onUpdatePreferences({ ...preferences, preferPublicTransport: true });
              }}
              className={`flex-1 py-1.5 px-2 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                travelMode === 'transit'
                  ? 'bg-gradient-to-r from-teal-500 to-teal-600 text-white shadow-sm font-bold'
                  : 'text-brand-text-secondary hover:text-brand-text hover:bg-white/50'
              }`}
            >
              <span>🚇</span>
              <span>Transit Hubs</span>
            </button>
          </div>

          {/* Unified Journey Track: Origin & Destination */}
          <div className="rounded-2xl bg-white/70 backdrop-blur-md border border-brand-border/80 shadow-inner-glass p-3 space-y-2 relative">
            {/* Absolute Centered Swap Jewel Button */}
            <button
              type="button"
              onClick={handleSwap}
              disabled={!origin || !destination}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 z-20 w-7 h-7 rounded-full glass-crystal hover:border-teal-400 text-teal-700 hover:text-teal-900 border border-champagne-300/90 shadow-glass-crystal flex items-center justify-center transition-all active:scale-90 disabled:opacity-40 hover:rotate-180 duration-300"
              title="Swap Origin and Destination"
              aria-label="Swap Origin and Destination"
            >
              <ArrowUpDown className="w-3.5 h-3.5" />
            </button>

            {/* Origin row */}
            <div className="relative flex items-start gap-2.5 pr-8">
              <div className="pt-2 shrink-0">
                <div className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center ring-2 ring-emerald-200/80 shadow-xs">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                  <label className="text-[10px] font-bold text-teal-900 uppercase tracking-wider">
                    Origin (Start)
                  </label>
                  <button
                    onClick={handleUseCurrentLocation}
                    disabled={isLocating}
                    className="text-[9px] text-teal-700 hover:text-teal-900 bg-teal-50 hover:bg-teal-100/90 px-2 py-0.5 rounded-full font-bold border border-teal-200/80 flex items-center gap-1 transition-all disabled:opacity-50 shadow-xs shrink-0"
                  >
                    <Crosshair className={`w-2.5 h-2.5 ${isLocating ? 'animate-spin text-teal-600' : ''}`} />
                    <span>{isLocating ? 'Locating...' : 'GPS'}</span>
                  </button>
                </div>

                <div className="relative">
                  <input
                    type="text"
                    value={originInput}
                    onChange={(e) => {
                      setOriginInput(e.target.value);
                      setShowOriginDropdown(true);
                    }}
                    onFocus={() => setShowOriginDropdown(true)}
                    placeholder="Search starting location..."
                    className="w-full py-1.5 px-2.5 text-xs rounded-xl bg-white/85 border border-brand-border/80 focus:border-teal-500 focus:bg-white focus:ring-2 focus:ring-teal-100 outline-none text-brand-text placeholder-brand-text-muted transition-all font-semibold shadow-inner-glass"
                  />
                </div>

                {/* Origin Autocomplete Dropdown */}
                {showOriginDropdown && originSuggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 z-50 mt-1 surface-pearl border border-brand-border rounded-2xl shadow-float-lg overflow-hidden max-h-48 overflow-y-auto">
                    {originSuggestions.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => {
                          onSetOrigin(item.coordinates, item.name);
                          setOriginInput(item.name);
                          setShowOriginDropdown(false);
                        }}
                        className="w-full text-left p-2.5 hover:bg-teal-50/50 transition-colors border-b border-brand-border/60 last:border-b-0 text-xs"
                      >
                        <div className="font-bold text-brand-text">{item.name}</div>
                        <div className="text-[10px] text-brand-text-secondary truncate">{item.displayName}</div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Connecting Visual Rail Line */}
            <div className="pl-4 -my-1">
              <div className="w-0.5 h-3 border-l-2 border-dashed border-champagne-300" />
            </div>

            {/* Destination row */}
            <div className="relative flex items-start gap-2.5 pr-8">
              <div className="pt-2 shrink-0">
                <div className="w-5 h-5 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center ring-2 ring-rose-200/80 shadow-xs">
                  <MapPin className="w-3 h-3 text-rose-500" />
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <label className="block text-[10px] font-bold text-rose-700 uppercase tracking-wider mb-0.5">
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
                    placeholder="Search destination..."
                    className="w-full py-1.5 px-2.5 text-xs rounded-xl bg-white/85 border border-brand-border/80 focus:border-rose-400 focus:bg-white focus:ring-2 focus:ring-rose-100 outline-none text-brand-text placeholder-brand-text-muted transition-all font-semibold shadow-inner-glass"
                  />
                </div>

                {/* Destination Autocomplete Dropdown */}
                {showDestDropdown && destSuggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 z-50 mt-1 surface-pearl border border-brand-border rounded-2xl shadow-float-lg overflow-hidden max-h-48 overflow-y-auto">
                    {destSuggestions.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => {
                          onSetDestination(item.coordinates, item.name);
                          setDestInput(item.name);
                          setShowDestDropdown(false);
                        }}
                        className="w-full text-left p-2.5 hover:bg-teal-50/50 transition-colors border-b border-brand-border/60 last:border-b-0 text-xs"
                      >
                        <div className="font-bold text-brand-text">{item.name}</div>
                        <div className="text-[10px] text-brand-text-secondary truncate">{item.displayName}</div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Location Error Notice */}
          {locationError && (
            <p className="text-[11px] text-danger-700 bg-danger-50 p-2.5 rounded-xl border border-danger-100">
              {locationError}
            </p>
          )}

          {/* Presets Quick Picker */}
          <div className="pt-2">
            <span className="text-[10px] uppercase font-bold text-brand-text-muted tracking-wider block mb-1.5 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-champagne-500" />
              <span>Popular Demo Destinations</span>
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
                  className="px-3 py-1.5 rounded-full bg-white/70 hover:bg-champagne-50/80 border border-champagne-200/70 text-[11px] font-semibold text-brand-text hover:text-teal-800 transition-all shadow-xs"
                >
                  📍 {preset.name.split(' ')[0]}
                </button>
              ))}
            </div>
          </div>

          {/* Preferences Accordion Toggle */}
          <div className="pt-1 border-t border-brand-border/70">
            <button
              onClick={() => setShowPreferences(!showPreferences)}
              className="w-full flex items-center justify-between text-xs font-semibold text-brand-text-secondary hover:text-brand-text py-1 transition-colors"
            >
              <span className="flex items-center gap-1.5 text-teal-800 font-bold">
                <SlidersHorizontal className="w-3.5 h-3.5 text-teal-600" />
                <span>Route Preferences & Priorities</span>
              </span>
              {showPreferences ? (
                <ChevronUp className="w-3.5 h-3.5 text-brand-text-muted" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5 text-brand-text-muted" />
              )}
            </button>

            {showPreferences && (
              <div className="mt-2.5 p-3 rounded-2xl bg-white/80 border border-brand-border/90 space-y-2 text-xs text-brand-text animate-fadeIn font-medium">
                <label className="flex items-center justify-between cursor-pointer">
                  <span>Prefer well-lit illuminated stretches</span>
                  <input
                    type="checkbox"
                    checked={preferences.preferWellLit}
                    onChange={(e) =>
                      onUpdatePreferences({ ...preferences, preferWellLit: e.target.checked })
                    }
                    className="rounded text-teal-600 focus:ring-teal-400 h-3.5 w-3.5 border-brand-border"
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
                    className="rounded text-teal-600 focus:ring-teal-400 h-3.5 w-3.5 border-brand-border"
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
                    className="rounded text-teal-600 focus:ring-teal-400 h-3.5 w-3.5 border-brand-border"
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
                    className="rounded text-teal-600 focus:ring-teal-400 h-3.5 w-3.5 border-brand-border"
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
                    className="rounded text-teal-600 focus:ring-teal-400 h-3.5 w-3.5 border-brand-border"
                  />
                </label>
              </div>
            )}
          </div>

          {/* Find Routes Trigger Button (Royal Teal Gradient) */}
          <button
            onClick={onFetchRoutes}
            disabled={!origin || !destination || isLoadingRoutes}
            className="w-full mt-2 py-3.5 px-4 rounded-full bg-gradient-to-r from-teal-500 via-teal-600 to-teal-700 hover:from-teal-600 hover:to-teal-800 active:scale-98 disabled:opacity-40 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md shadow-teal-600/25 transition-all"
          >
            {isLoadingRoutes ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Evaluating Infrastructure Corridors...</span>
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
        <div className="space-y-3">
          {isLoadingRoutes ? (
            <div className="p-6 rounded-royal glass-pearl border border-white/95 shadow-glass-pearl text-center space-y-3 animate-pulse">
              <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-200 text-teal-600 mx-auto flex items-center justify-center ring-2 ring-champagne-200">
                <Compass className="w-6 h-6 animate-spin-slow text-teal-600" />
              </div>
              <div className="text-xs font-bold text-brand-text">Evaluating Corridor Infrastructure...</div>
              <p className="text-[11px] text-brand-text-secondary max-w-xs mx-auto font-medium">
                Scanning verified streetlights, open essential facilities, and active community reports along paths.
              </p>
            </div>
          ) : routes.length > 0 ? (
            <>
              <div className="flex items-center justify-between pt-1">
                <span className="text-xs font-bold uppercase tracking-wider text-brand-text-muted">
                  Route Alternatives ({routes.length} options)
                </span>
                <span className="text-[11px] text-teal-700 font-bold">Tap card to select</span>
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
                <div className="pt-2 pb-6 lg:pb-2">
                  <button
                    onClick={() => onStartJourneyWithRoute(routes[selectedRouteIndex])}
                    className="w-full py-3.5 px-4 rounded-full glass-pearl border border-champagne-200/90 hover:border-champagne-300 text-teal-900 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-glass-pearl group active:scale-98"
                  >
                    <Compass className="w-4 h-4 text-teal-600 group-hover:rotate-45 transition-transform" />
                    <span>Track with Family Companion</span>
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="h-44 flex flex-col items-center justify-center text-center p-6 text-brand-text-secondary border border-dashed border-brand-border/80 rounded-royal bg-white/50 backdrop-blur-md">
              <Compass className="w-8 h-8 text-brand-text-muted mb-2 stroke-1" />
              <h4 className="font-bold text-brand-text text-sm">No Routes Calculated</h4>
              <p className="text-xs text-brand-text-secondary mt-1 max-w-xs font-medium">
                Select an origin and destination above or tap one of the preset chips to compare corridor perspectives.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
