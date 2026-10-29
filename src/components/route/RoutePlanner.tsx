'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Coordinates, RouteOption, RoutePreferences, WeatherContext, PlaceSuggestion } from '@/types';
import { RouteCard } from './RouteCard';
import { WeatherWidget } from '../weather/WeatherWidget';
import { searchPlaces, reverseGeocode, PUNE_DEFAULT_COORDINATES } from '@/services/geocoding-service';
import {
  Navigation,
  MapPin,
  ArrowUpDown,
  SlidersHorizontal,
  ChevronDown,
  AlertCircle,
  Footprints,
  Bus,
  X,
  Compass,
  Search,
  Loader2,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';

interface RoutePlannerProps {
  origin: Coordinates | null;
  destination: Coordinates | null;
  originName?: string;
  destinationName?: string;
  onSetOrigin: (coords: Coordinates | null, name: string) => void;
  onSetDestination: (coords: Coordinates | null, name: string) => void;
  routes: RouteOption[];
  selectedRouteIndex: number;
  onSelectRouteIndex: (index: number) => void;
  isLoadingRoutes: boolean;
  onFetchRoutes: () => void;
  preferences: RoutePreferences;
  onUpdatePreferences: (prefs: RoutePreferences) => void;
  onOpenRouteDetails: (route: RouteOption) => void;
  onStartJourneyWithRoute: (route: RouteOption) => void;
  onStartLiveNavigation?: (route: RouteOption) => void;
  weather?: WeatherContext | null;
  isLoadingWeather?: boolean;
  routingError?: string | null;
  onExpandSheet?: () => void;
}

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
  onStartLiveNavigation,
  weather,
  isLoadingWeather = false,
  routingError = null,
  onExpandSheet,
}) => {
  const [travelMode, setTravelMode] = useState<'walk' | 'transit'>('walk');

  // Input text states
  const [originInput, setOriginInput] = useState(originName);
  const [destInput, setDestInput] = useState(destinationName);

  // Dropdown open states
  const [showOriginDropdown, setShowOriginDropdown] = useState(false);
  const [showDestDropdown, setShowDestDropdown] = useState(false);

  // Live suggestions
  const [originSuggestions, setOriginSuggestions] = useState<PlaceSuggestion[]>([]);
  const [destSuggestions, setDestSuggestions] = useState<PlaceSuggestion[]>([]);

  // Search status states
  const [isSearchingOrigin, setIsSearchingOrigin] = useState(false);
  const [isSearchingDest, setIsSearchingDest] = useState(false);
  const [originSearchError, setOriginSearchError] = useState<string | null>(null);
  const [destSearchError, setDestSearchError] = useState<string | null>(null);

  // Keyboard navigation indexes (-1 means none selected)
  const [originFocusedIndex, setOriginFocusedIndex] = useState<number>(-1);
  const [destFocusedIndex, setDestFocusedIndex] = useState<number>(-1);

  // Geolocation state
  const [isLocatingUser, setIsLocatingUser] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  // Preferences panel state
  const [showPreferences, setShowPreferences] = useState(false);

  // Debounce & Abort controller refs
  const originDebounceTimer = useRef<NodeJS.Timeout | null>(null);
  const destDebounceTimer = useRef<NodeJS.Timeout | null>(null);
  const originAbortController = useRef<AbortController | null>(null);
  const destAbortController = useRef<AbortController | null>(null);

  const originContainerRef = useRef<HTMLDivElement>(null);
  const destContainerRef = useRef<HTMLDivElement>(null);

  // Keep local inputs in sync with parent props when changed externally
  useEffect(() => {
    setOriginInput(originName);
  }, [originName]);

  useEffect(() => {
    setDestInput(destinationName);
  }, [destinationName]);

  // Click-away listener to close dropdowns
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (originContainerRef.current && !originContainerRef.current.contains(e.target as Node)) {
        setShowOriginDropdown(false);
      }
      if (destContainerRef.current && !destContainerRef.current.contains(e.target as Node)) {
        setShowDestDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Cleanup abort controllers on unmount
  useEffect(() => {
    return () => {
      if (originAbortController.current) originAbortController.current.abort();
      if (destAbortController.current) destAbortController.current.abort();
      if (originDebounceTimer.current) clearTimeout(originDebounceTimer.current);
      if (destDebounceTimer.current) clearTimeout(destDebounceTimer.current);
    };
  }, []);

  // Handle Origin Text Changes: Invalidate origin coordinates on edit!
  const handleOriginInputChange = (val: string) => {
    setOriginInput(val);
    setShowOriginDropdown(true);
    setOriginFocusedIndex(-1);
    setOriginSearchError(null);

    // CRITICAL: Invalidate previous coordinates when user edits text
    if (origin !== null) {
      onSetOrigin(null, val);
    }

    if (originDebounceTimer.current) clearTimeout(originDebounceTimer.current);
    if (originAbortController.current) originAbortController.current.abort();

    if (!val || val.trim().length < 2) {
      setOriginSuggestions([]);
      setIsSearchingOrigin(false);
      return;
    }

    setIsSearchingOrigin(true);
    originDebounceTimer.current = setTimeout(async () => {
      const controller = new AbortController();
      originAbortController.current = controller;

      try {
        const results = await searchPlaces(val, {
          biasCoords: destination || PUNE_DEFAULT_COORDINATES,
          signal: controller.signal,
          limit: 6,
        });
        setOriginSuggestions(results);
        setOriginSearchError(null);
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          console.warn('Origin search error:', err);
          setOriginSearchError('Unable to load suggestions. Check connection.');
        }
      } finally {
        setIsSearchingOrigin(false);
      }
    }, 300);
  };

  // Handle Destination Text Changes: Invalidate destination coordinates on edit!
  const handleDestInputChange = (val: string) => {
    setDestInput(val);
    setShowDestDropdown(true);
    setDestFocusedIndex(-1);
    setDestSearchError(null);

    // CRITICAL: Invalidate previous coordinates when user edits text
    if (destination !== null) {
      onSetDestination(null, val);
    }

    if (destDebounceTimer.current) clearTimeout(destDebounceTimer.current);
    if (destAbortController.current) destAbortController.current.abort();

    if (!val || val.trim().length < 2) {
      setDestSuggestions([]);
      setIsSearchingDest(false);
      return;
    }

    setIsSearchingDest(true);
    destDebounceTimer.current = setTimeout(async () => {
      const controller = new AbortController();
      destAbortController.current = controller;

      try {
        const results = await searchPlaces(val, {
          biasCoords: origin || PUNE_DEFAULT_COORDINATES,
          signal: controller.signal,
          limit: 6,
        });
        setDestSuggestions(results);
        setDestSearchError(null);
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          console.warn('Destination search error:', err);
          setDestSearchError('Unable to load suggestions. Check connection.');
        }
      } finally {
        setIsSearchingDest(false);
      }
    }, 300);
  };

  // Select an Origin Suggestion
  const handleSelectOrigin = (suggestion: PlaceSuggestion) => {
    onSetOrigin(suggestion.coordinates, suggestion.name);
    setOriginInput(suggestion.name);
    setShowOriginDropdown(false);
    setOriginSuggestions([]);
    setOriginFocusedIndex(-1);
    setLocationError(null);
  };

  // Select a Destination Suggestion
  const handleSelectDestination = (suggestion: PlaceSuggestion) => {
    onSetDestination(suggestion.coordinates, suggestion.name);
    setDestInput(suggestion.name);
    setShowDestDropdown(false);
    setDestSuggestions([]);
    setDestFocusedIndex(-1);
    setLocationError(null);
  };

  // Keyboard navigation for Origin
  const handleOriginKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showOriginDropdown || originSuggestions.length === 0) {
      if (e.key === 'Escape') setShowOriginDropdown(false);
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setOriginFocusedIndex((prev) => (prev < originSuggestions.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setOriginFocusedIndex((prev) => (prev > 0 ? prev - 1 : originSuggestions.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (originFocusedIndex >= 0 && originSuggestions[originFocusedIndex]) {
        handleSelectOrigin(originSuggestions[originFocusedIndex]);
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setShowOriginDropdown(false);
    }
  };

  // Keyboard navigation for Destination
  const handleDestKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showDestDropdown || destSuggestions.length === 0) {
      if (e.key === 'Escape') setShowDestDropdown(false);
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setDestFocusedIndex((prev) => (prev < destSuggestions.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setDestFocusedIndex((prev) => (prev > 0 ? prev - 1 : destSuggestions.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (destFocusedIndex >= 0 && destSuggestions[destFocusedIndex]) {
        handleSelectDestination(destSuggestions[destFocusedIndex]);
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setShowDestDropdown(false);
    }
  };

  // Swap origin and destination coordinates AND labels simultaneously
  const handleSwapPoints = () => {
    const prevOrigin = origin;
    const prevOriginName = originInput;
    const prevDest = destination;
    const prevDestName = destInput;

    onSetOrigin(prevDest, prevDestName);
    onSetDestination(prevOrigin, prevOriginName);
    setOriginInput(prevDestName);
    setDestInput(prevOriginName);
  };

  // Use current GPS location
  const handleUseCurrentLocation = () => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser.');
      return;
    }

    setIsLocatingUser(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const coords: Coordinates = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        };

        try {
          const resolvedName = await reverseGeocode(coords);
          const finalName = resolvedName || 'My Location';
          onSetOrigin(coords, finalName);
          setOriginInput(finalName);
        } catch {
          onSetOrigin(coords, 'Current GPS Location');
          setOriginInput('Current GPS Location');
        } finally {
          setIsLocatingUser(false);
          setShowOriginDropdown(false);
        }
      },
      (err) => {
        setIsLocatingUser(false);
        setLocationError(`Location acquisition failed (${err.message}).`);
      },
      { timeout: 9000, enableHighAccuracy: true }
    );
  };

  const activePrioritiesCount = [
    preferences.preferWellLit,
    preferences.preferPublicTransport,
    preferences.preferEssentialFacilities,
    preferences.wheelchairAccessible,
  ].filter(Boolean).length;

  const isFormValid = Boolean(origin && destination);
  const selectedRoute = routes[selectedRouteIndex] || null;

  return (
    <div className="flex flex-col h-full overflow-y-auto font-sans bg-slate-50/70 text-slate-800">
      {/* Refined Glassmorphic Header */}
      <div className="p-4 sm:p-5 border-b border-slate-200/80 bg-white/95 backdrop-blur-xl relative">
        <div className="flex items-center justify-between mb-3.5">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-50 border border-indigo-100/80 text-indigo-700 text-[11px] font-semibold mb-1">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
              <span>Safety-Aware Route Guidance</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Route Planner
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Compare transparent walking corridors and verified street lighting
            </p>
          </div>

          {/* Mode Switcher */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-full border border-slate-200">
            <button
              type="button"
              onClick={() => setTravelMode('walk')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                travelMode === 'walk'
                  ? 'bg-white text-indigo-700 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Footprints className="w-3.5 h-3.5 text-indigo-600" />
              <span>Walk</span>
            </button>
            <button
              type="button"
              onClick={() => setTravelMode('transit')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                travelMode === 'transit'
                  ? 'bg-white text-indigo-700 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Bus className="w-3.5 h-3.5 text-indigo-600" />
              <span>Transit</span>
            </button>
          </div>
        </div>

        {/* Origin and Destination Search Inputs */}
        <div className="mt-3 relative">
          <div className="flex items-stretch gap-2.5">
            {/* Visual Route Connector Track */}
            <div className="flex flex-col items-center justify-between py-2 shrink-0 w-6">
              <span className="w-6 h-6 rounded-full bg-indigo-600 text-white text-[11px] font-bold flex items-center justify-center shadow-xs">
                A
              </span>
              <div className="w-0.5 flex-1 bg-slate-200 border-dashed my-1" />
              <span className="w-6 h-6 rounded-full bg-rose-500 text-white text-[11px] font-bold flex items-center justify-center shadow-xs">
                B
              </span>
            </div>

            {/* Inputs Container */}
            <div className="flex-1 space-y-2.5">
              {/* Origin Input Container */}
              <div ref={originContainerRef} className="relative">
                <div
                  className={`flex items-center rounded-2xl border bg-white shadow-xs transition-all ${
                    origin
                      ? 'border-emerald-300 ring-1 ring-emerald-100'
                      : 'border-slate-200/90 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-100'
                  }`}
                >
                  <div className="pl-3.5 text-slate-400">
                    {isSearchingOrigin ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-600" />
                    ) : (
                      <Search className="w-3.5 h-3.5" />
                    )}
                  </div>
                  <input
                    type="text"
                    value={originInput}
                    onChange={(e) => handleOriginInputChange(e.target.value)}
                    onFocus={() => {
                      setShowOriginDropdown(true);
                      onExpandSheet?.();
                    }}
                    onKeyDown={handleOriginKeyDown}
                    placeholder="Enter starting point, street, or landmark..."
                    className="w-full text-xs font-medium px-2.5 py-2.5 text-slate-900 placeholder:text-slate-400 bg-transparent rounded-2xl focus:outline-none"
                    aria-label="Starting location"
                    role="combobox"
                    aria-expanded={showOriginDropdown}
                    aria-autocomplete="list"
                  />
                  {origin && (
                    <span title="Valid location selected" className="pr-1 text-emerald-600">
                      <CheckCircle2 className="w-4 h-4" />
                    </span>
                  )}
                  {originInput && (
                    <button
                      type="button"
                      onClick={() => {
                        setOriginInput('');
                        onSetOrigin(null, '');
                        setOriginSuggestions([]);
                      }}
                      className="pr-3 text-slate-400 hover:text-slate-600 p-1"
                      aria-label="Clear starting point"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Origin Dropdown */}
                {showOriginDropdown && (
                  <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 max-h-60 overflow-y-auto p-1.5 divide-y divide-slate-100 animate-in fade-in slide-in-from-top-1 duration-150">
                    {/* GPS Action */}
                    <button
                      type="button"
                      onClick={handleUseCurrentLocation}
                      disabled={isLocatingUser}
                      className="w-full text-left px-3 py-2 text-xs font-semibold text-indigo-700 hover:bg-indigo-50 rounded-xl flex items-center gap-2 transition-colors disabled:opacity-50"
                    >
                      {isLocatingUser ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-600" />
                      ) : (
                        <Compass className="w-3.5 h-3.5 text-indigo-600" />
                      )}
                      <span>
                        {isLocatingUser ? 'Acquiring GPS fix...' : 'Use my current GPS location'}
                      </span>
                    </button>

                    {/* Loading State */}
                    {isSearchingOrigin && (
                      <div className="p-3 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-600" />
                        <span>Searching places...</span>
                      </div>
                    )}

                    {/* Error State */}
                    {originSearchError && (
                      <div className="p-2.5 text-xs text-rose-600 bg-rose-50 rounded-xl">
                        {originSearchError}
                      </div>
                    )}

                    {/* Geocoded Live Suggestions */}
                    {!isSearchingOrigin && originSuggestions.length > 0 && (
                      <div className="py-1">
                        <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          Suggestions ({originSuggestions.length})
                        </div>
                        {originSuggestions.map((place, idx) => (
                          <button
                            key={place.id}
                            type="button"
                            onClick={() => handleSelectOrigin(place)}
                            className={`w-full text-left px-3 py-2 text-xs rounded-xl transition-colors ${
                              originFocusedIndex === idx
                                ? 'bg-indigo-50 text-indigo-900 font-semibold'
                                : 'hover:bg-slate-50 text-slate-800'
                            }`}
                          >
                            <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                              <MapPin className="w-3 h-3 text-indigo-600 shrink-0" />
                              <span>{place.name}</span>
                            </div>
                            <div className="text-[11px] text-slate-500 truncate mt-0.5">
                              {place.displayName}
                            </div>
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Empty Result State */}
                    {!isSearchingOrigin &&
                      originInput.trim().length >= 2 &&
                      originSuggestions.length === 0 &&
                      !originSearchError && (
                        <div className="p-3 text-center text-xs text-slate-400">
                          No matching places found for &ldquo;{originInput}&rdquo;
                        </div>
                      )}
                  </div>
                )}
              </div>

              {/* Destination Input Container */}
              <div ref={destContainerRef} className="relative">
                <div
                  className={`flex items-center rounded-2xl border bg-white shadow-xs transition-all ${
                    destination
                      ? 'border-emerald-300 ring-1 ring-emerald-100'
                      : 'border-slate-200/90 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-100'
                  }`}
                >
                  <div className="pl-3.5 text-slate-400">
                    {isSearchingDest ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-600" />
                    ) : (
                      <MapPin className="w-3.5 h-3.5 text-rose-500" />
                    )}
                  </div>
                  <input
                    type="text"
                    value={destInput}
                    onChange={(e) => handleDestInputChange(e.target.value)}
                    onFocus={() => {
                      setShowDestDropdown(true);
                      onExpandSheet?.();
                    }}
                    onKeyDown={handleDestKeyDown}
                    placeholder="Where are you walking to?..."
                    className="w-full text-xs font-medium px-2.5 py-2.5 text-slate-900 placeholder:text-slate-400 bg-transparent rounded-2xl focus:outline-none"
                    aria-label="Destination location"
                    role="combobox"
                    aria-expanded={showDestDropdown}
                    aria-autocomplete="list"
                  />
                  {destination && (
                    <span title="Valid destination selected" className="pr-1 text-emerald-600">
                      <CheckCircle2 className="w-4 h-4" />
                    </span>
                  )}
                  {destInput && (
                    <button
                      type="button"
                      onClick={() => {
                        setDestInput('');
                        onSetDestination(null, '');
                        setDestSuggestions([]);
                      }}
                      className="pr-3 text-slate-400 hover:text-slate-600 p-1"
                      aria-label="Clear destination"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Destination Dropdown */}
                {showDestDropdown && (
                  <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 max-h-60 overflow-y-auto p-1.5 divide-y divide-slate-100 animate-in fade-in slide-in-from-top-1 duration-150">
                    {/* Loading State */}
                    {isSearchingDest && (
                      <div className="p-3 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-600" />
                        <span>Searching places...</span>
                      </div>
                    )}

                    {/* Error State */}
                    {destSearchError && (
                      <div className="p-2.5 text-xs text-rose-600 bg-rose-50 rounded-xl">
                        {destSearchError}
                      </div>
                    )}

                    {/* Geocoded Live Suggestions */}
                    {!isSearchingDest && destSuggestions.length > 0 && (
                      <div className="py-1">
                        <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          Suggestions ({destSuggestions.length})
                        </div>
                        {destSuggestions.map((place, idx) => (
                          <button
                            key={place.id}
                            type="button"
                            onClick={() => handleSelectDestination(place)}
                            className={`w-full text-left px-3 py-2 text-xs rounded-xl transition-colors ${
                              destFocusedIndex === idx
                                ? 'bg-indigo-50 text-indigo-900 font-semibold'
                                : 'hover:bg-slate-50 text-slate-800'
                            }`}
                          >
                            <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                              <MapPin className="w-3 h-3 text-rose-500 shrink-0" />
                              <span>{place.name}</span>
                            </div>
                            <div className="text-[11px] text-slate-500 truncate mt-0.5">
                              {place.displayName}
                            </div>
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Empty Result State */}
                    {!isSearchingDest &&
                      destInput.trim().length >= 2 &&
                      destSuggestions.length === 0 &&
                      !destSearchError && (
                        <div className="p-3 text-center text-xs text-slate-400">
                          No matching places found for &ldquo;{destInput}&rdquo;
                        </div>
                      )}
                  </div>
                )}
              </div>
            </div>

            {/* Swap Button */}
            <div className="flex items-center shrink-0">
              <button
                type="button"
                onClick={handleSwapPoints}
                className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 border border-slate-200/80 flex items-center justify-center transition-all focus:outline-none focus:ring-2 focus:ring-indigo-200 active:rotate-180"
                title="Swap origin and destination"
                aria-label="Swap origin and destination"
              >
                <ArrowUpDown className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {locationError && (
            <div className="mt-2.5 p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-[11px] flex items-start gap-1.5 font-medium">
              <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-rose-600" />
              <span>{locationError}</span>
            </div>
          )}
        </div>

        {/* Priorities & Action Buttons */}
        <div className="mt-3.5 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => setShowPreferences(!showPreferences)}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 rounded-full px-3 py-1.5 bg-slate-100 hover:bg-slate-200/80 transition-colors border border-slate-200"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-600" />
            <span>Priorities</span>
            {activePrioritiesCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-indigo-600 text-white text-[10px] font-bold flex items-center justify-center">
                {activePrioritiesCount}
              </span>
            )}
            <ChevronDown
              className={`w-3.5 h-3.5 transition-transform ${showPreferences ? 'rotate-180' : ''}`}
            />
          </button>

          <button
            type="button"
            onClick={onFetchRoutes}
            disabled={isLoadingRoutes || !isFormValid}
            className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 active:scale-98"
            title={!isFormValid ? 'Please select valid origin and destination from suggestions' : 'Calculate pedestrian route'}
          >
            {isLoadingRoutes ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
            ) : (
              <Navigation className="w-3.5 h-3.5 text-white" />
            )}
            <span>{isLoadingRoutes ? 'Calculating...' : 'Plan Route'}</span>
          </button>
        </div>

        {/* Collapsible Priorities Panel */}
        {showPreferences && (
          <div className="mt-3 p-4 rounded-2xl bg-white border border-slate-200 text-xs space-y-2.5 shadow-sm animate-in fade-in slide-in-from-top-1 duration-150">
            <div className="font-bold text-slate-800 text-xs uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-600" />
              <span>Pedestrian Routing Priorities</span>
            </div>

            <label className="flex items-center justify-between cursor-pointer py-1">
              <span className="text-slate-700 font-medium">Prioritize well-lit streets</span>
              <input
                type="checkbox"
                checked={preferences.preferWellLit}
                onChange={(e) =>
                  onUpdatePreferences({ ...preferences, preferWellLit: e.target.checked })
                }
                className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer py-1">
              <span className="text-slate-700 font-medium">Transit stops & busier thoroughfares</span>
              <input
                type="checkbox"
                checked={preferences.preferPublicTransport}
                onChange={(e) =>
                  onUpdatePreferences({ ...preferences, preferPublicTransport: e.target.checked })
                }
                className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer py-1">
              <span className="text-slate-700 font-medium">Proximity to open essential facilities</span>
              <input
                type="checkbox"
                checked={preferences.preferEssentialFacilities}
                onChange={(e) =>
                  onUpdatePreferences({
                    ...preferences,
                    preferEssentialFacilities: e.target.checked,
                  })
                }
                className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer py-1">
              <span className="text-slate-700 font-medium">Wheelchair accessible walkways</span>
              <input
                type="checkbox"
                checked={preferences.wheelchairAccessible}
                onChange={(e) =>
                  onUpdatePreferences({
                    ...preferences,
                    wheelchairAccessible: e.target.checked,
                  })
                }
                className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
              />
            </label>
          </div>
        )}
      </div>

      {/* Route Cards Container */}
      <div className="p-4 space-y-3.5 pb-24 lg:pb-6">
        {/* Routing Failure Alert Banner */}
        {routingError && (
          <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-start gap-2.5 animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-rose-900">Route calculation failed</p>
              <p className="text-[11px] text-rose-600 mt-0.5">{routingError}</p>
            </div>
          </div>
        )}

        {/* Live Walk Navigation CTA Bar */}
        {selectedRoute && (
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-md flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shrink-0">
                <Navigation className="w-5 h-5 text-white" />
              </div>
              <div className="min-w-0">
                <h4 className="font-bold text-xs leading-tight text-white flex items-center gap-1.5">
                  <span>Turn-by-Turn Walk Mode</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse inline-block" />
                </h4>
                <p className="text-[11px] text-indigo-100 truncate mt-0.5">
                  Follow GPS navigation with civic radar alerts
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                if (onStartLiveNavigation) {
                  onStartLiveNavigation(selectedRoute);
                } else {
                  onStartJourneyWithRoute(selectedRoute);
                }
              }}
              className="px-3.5 py-2 rounded-xl bg-white text-indigo-700 hover:bg-indigo-50 text-xs font-bold shrink-0 shadow-sm transition-all active:scale-95 flex items-center gap-1.5"
            >
              <Footprints className="w-3.5 h-3.5 text-indigo-600" />
              <span>Start Walk</span>
            </button>
          </div>
        )}

        {/* Live Weather Widget for Journey */}
        {(weather || isLoadingWeather) && (
          <WeatherWidget weather={weather || null} isLoading={isLoadingWeather} />
        )}

        {routes.length > 0 && (
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Available Routes ({routes.length})
            </span>
            <span className="text-[11px] text-slate-400 font-medium">
              Tap a card to inspect on map
            </span>
          </div>
        )}

        {routes.length === 1 && !isLoadingRoutes && (
          <div className="p-3.5 rounded-2xl bg-white border border-slate-200 text-xs text-slate-600 space-y-1 shadow-xs">
            <div className="flex items-center gap-2 font-bold text-indigo-700">
              <ShieldCheck className="w-4 h-4 text-indigo-600" />
              <span>Direct Navigable Corridor</span>
            </div>
            <p className="text-[11px] leading-relaxed text-slate-500">
              A single walkable path was identified for these points. Infrastructure evidence and verified civic reports along this path are detailed below without simulated alternatives.
            </p>
          </div>
        )}

        {routes.length === 0 && !isLoadingRoutes && (
          <div className="p-8 text-center text-slate-500 space-y-2 bg-white rounded-2xl border border-slate-200">
            <MapPin className="w-8 h-8 text-slate-400 mx-auto" />
            <p className="font-bold text-slate-800 text-sm">
              {!origin || !destination ? 'Enter origin & destination' : 'Ready to plan route'}
            </p>
            <p className="text-xs text-slate-400 max-w-[260px] mx-auto">
              {!origin || !destination
                ? 'Type in your starting location and destination above to see real walking corridors.'
                : 'Tap "Plan Route" to evaluate lighting and pedestrian infrastructure along your path.'}
            </p>
          </div>
        )}

        {routes.map((route, idx) => (
          <RouteCard
            key={route.id}
            route={route}
            isSelected={idx === selectedRouteIndex}
            onSelect={() => onSelectRouteIndex(idx)}
            onOpenDetails={() => onOpenRouteDetails(route)}
            onStartTrip={() => {
              if (onStartLiveNavigation) {
                onStartLiveNavigation(route);
              } else {
                onStartJourneyWithRoute(route);
              }
            }}
          />
        ))}
      </div>
    </div>
  );
};
