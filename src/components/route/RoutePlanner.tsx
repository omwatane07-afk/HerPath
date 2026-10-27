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
  AlertCircle,
  Footprints,
  Bus,
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

const PRESET_PLACES = [
  { id: 'rajiv_chowk', name: 'Rajiv Chowk Metro Station', coordinates: { lat: 28.6328, lng: 77.2197 }, detail: 'Connaught Place Gate 2' },
  { id: 'patel_chowk', name: 'Patel Chowk Metro', coordinates: { lat: 28.6232, lng: 77.2142 }, detail: 'Ashoka Road' },
  { id: 'janpath', name: 'Janpath Market Entry', coordinates: { lat: 28.6275, lng: 77.2190 }, detail: 'Tolstoy Road Corner' },
  { id: 'mandi_house', name: 'Mandi House Cultural Center', coordinates: { lat: 28.6258, lng: 77.2345 }, detail: 'Sikandra Road' },
  { id: 'bengali_market', name: 'Bengali Market Circle', coordinates: { lat: 28.6290, lng: 77.2310 }, detail: 'Tansen Marg' },
  { id: 'parliament_st', name: 'Parliament Street Kiosk', coordinates: { lat: 28.6240, lng: 77.2120 }, detail: 'Sansad Marg' },
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
  const [isFormCollapsed, setIsFormCollapsed] = useState(false);

  useEffect(() => {
    setOriginInput(originName);
  }, [originName]);

  useEffect(() => {
    setDestInput(destinationName);
  }, [destinationName]);

  const handleSwapPoints = () => {
    if (!origin || !destination) return;
    const prevOrigin = origin;
    const prevOriginName = originName;
    onSetOrigin(destination, destinationName);
    onSetDestination(prevOrigin, prevOriginName);
  };

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
      (err) => {
        setIsLocating(false);
        // Honest error handling per truthfulness rules: never silently substitute a fake demo location!
        setLocationError(
          err.code === 1
            ? 'Location permission was denied. Please select a starting point from the list below.'
            : 'Could not acquire GPS fix. Please select a starting place manually.'
        );
      },
      { timeout: 8000 }
    );
  };

  const activePrioritiesCount = [
    preferences.preferWellLit,
    preferences.preferPublicTransport,
    preferences.preferEssentialFacilities,
    preferences.wheelchairAccessible,
  ].filter(Boolean).length;

  return (
    <div className="flex flex-col h-full bg-paper text-ink overflow-y-auto">
      {/* Header section with Walk / Transit control */}
      <div className="p-4 sm:p-5 border-b border-border bg-white sticky top-0 z-10 shadow-e1">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-serif text-xl font-bold text-ink">Plan Route</h2>
          
          {/* Walk / Transit Segmented Control */}
          <div className="inline-flex p-0.5 rounded-lg bg-paper border border-border text-xs font-semibold" role="tablist">
            <button
              type="button"
              onClick={() => setTravelMode('walk')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition-colors focus-ring-peacock ${
                travelMode === 'walk'
                  ? 'bg-white text-ink font-bold shadow-e1'
                  : 'text-text-secondary hover:text-ink'
              }`}
              role="tab"
              aria-selected={travelMode === 'walk'}
            >
              <Footprints className="w-3.5 h-3.5" />
              <span>Walk</span>
            </button>
            <button
              type="button"
              onClick={() => setTravelMode('transit')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition-colors focus-ring-peacock ${
                travelMode === 'transit'
                  ? 'bg-white text-ink font-bold shadow-e1'
                  : 'text-text-secondary hover:text-ink'
              }`}
              role="tab"
              aria-selected={travelMode === 'transit'}
            >
              <Bus className="w-3.5 h-3.5" />
              <span>Transit</span>
            </button>
          </div>
        </div>

        {/* Connected Origin & Destination Card */}
        <div className="surface-card p-3 relative">
          <div className="flex items-stretch gap-2.5">
            {/* Visual connector line A to B */}
            <div className="flex flex-col items-center justify-between py-2 shrink-0 select-none">
              <div className="w-6 h-6 rounded-full bg-ink text-white font-bold text-xs flex items-center justify-center">
                A
              </div>
              <div className="w-0.5 flex-1 bg-border-strong my-1" />
              <div className="w-6 h-6 rounded-full bg-peacock text-white font-bold text-xs flex items-center justify-center">
                B
              </div>
            </div>

            {/* Inputs */}
            <div className="flex-1 space-y-2 min-w-0">
              {/* Origin Input */}
              <div className="relative">
                <input
                  type="text"
                  value={originInput}
                  onChange={(e) => {
                    setOriginInput(e.target.value);
                    setShowOriginDropdown(true);
                  }}
                  onFocus={() => setShowOriginDropdown(true)}
                  placeholder="Starting point or GPS location..."
                  className="w-full text-xs font-medium bg-paper rounded-lg px-3 py-2 border border-border focus:border-peacock focus-ring-peacock text-ink placeholder:text-text-muted"
                  aria-label="Starting location"
                />

                {showOriginDropdown && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-border rounded-lg shadow-e2 z-30 max-h-48 overflow-y-auto">
                    <button
                      type="button"
                      onClick={handleUseCurrentLocation}
                      disabled={isLocating}
                      className="w-full text-left px-3 py-2 text-xs font-semibold text-peacock-dark hover:bg-peacock-tint flex items-center gap-2 border-b border-border"
                    >
                      <Crosshair className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin' : ''}`} />
                      <span>{isLocating ? 'Locating device...' : 'Use current location'}</span>
                    </button>
                    {PRESET_PLACES.map((place) => (
                      <button
                        key={place.id}
                        type="button"
                        onClick={() => {
                          onSetOrigin(place.coordinates, place.name);
                          setOriginInput(place.name);
                          setShowOriginDropdown(false);
                          setLocationError(null);
                        }}
                        className="w-full text-left px-3 py-2 text-xs hover:bg-paper border-b border-border/50 last:border-b-0"
                      >
                        <div className="font-semibold text-ink">{place.name}</div>
                        <div className="text-[11px] text-text-secondary">{place.detail}</div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Destination Input */}
              <div className="relative">
                <input
                  type="text"
                  value={destInput}
                  onChange={(e) => {
                    setDestInput(e.target.value);
                    setShowDestDropdown(true);
                  }}
                  onFocus={() => setShowDestDropdown(true)}
                  placeholder="Where would you like to walk?..."
                  className="w-full text-xs font-medium bg-paper rounded-lg px-3 py-2 border border-border focus:border-peacock focus-ring-peacock text-ink placeholder:text-text-muted"
                  aria-label="Destination location"
                />

                {showDestDropdown && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-border rounded-lg shadow-e2 z-30 max-h-48 overflow-y-auto">
                    {PRESET_PLACES.map((place) => (
                      <button
                        key={place.id}
                        type="button"
                        onClick={() => {
                          onSetDestination(place.coordinates, place.name);
                          setDestInput(place.name);
                          setShowDestDropdown(false);
                        }}
                        className="w-full text-left px-3 py-2 text-xs hover:bg-paper border-b border-border/50 last:border-b-0"
                      >
                        <div className="font-semibold text-ink">{place.name}</div>
                        <div className="text-[11px] text-text-secondary">{place.detail}</div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Swap Button */}
            <div className="flex items-center shrink-0">
              <button
                type="button"
                onClick={handleSwapPoints}
                className="p-2 rounded-lg bg-paper hover:bg-raised text-text-secondary hover:text-ink border border-border transition-colors focus-ring-peacock"
                title="Swap starting point and destination"
                aria-label="Swap starting point and destination"
              >
                <ArrowUpDown className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Location Error Notice if GPS failed */}
          {locationError && (
            <div className="mt-2.5 p-2 rounded bg-danger-tint border border-danger/30 text-danger text-[11px] flex items-start gap-1.5 font-medium">
              <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              <span>{locationError}</span>
            </div>
          )}
        </div>

        {/* Compact Priorities Toggle */}
        <div className="mt-3 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setShowPreferences(!showPreferences)}
            className="flex items-center gap-1.5 text-xs font-semibold text-text-secondary hover:text-ink focus-ring-peacock rounded px-1.5 py-1"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-peacock" />
            <span>Priorities & Accessibility</span>
            {activePrioritiesCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-peacock-tint text-peacock-dark text-[10px] font-bold flex items-center justify-center">
                {activePrioritiesCount}
              </span>
            )}
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showPreferences ? 'rotate-180' : ''}`} />
          </button>

          {/* Primary Action Button */}
          <button
            type="button"
            onClick={onFetchRoutes}
            disabled={isLoadingRoutes || !origin || !destination}
            className="btn-ink px-4 py-2 text-xs font-bold shadow-e1 disabled:opacity-50 flex items-center gap-1.5"
          >
            <Navigation className="w-3.5 h-3.5 text-peacock-tint" />
            <span>{isLoadingRoutes ? 'Calculating...' : 'Find routes'}</span>
          </button>
        </div>

        {/* Collapsible Priorities Panel */}
        {showPreferences && (
          <div className="mt-3 p-3 rounded-lg bg-raised border border-border text-xs space-y-2 animate-fade-in">
            <div className="font-semibold text-ink text-[11px] uppercase tracking-wider mb-1">
              Active Routing Factors
            </div>
            
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-text font-medium">Better street lighting</span>
              <input
                type="checkbox"
                checked={preferences.preferWellLit}
                onChange={(e) => onUpdatePreferences({ ...preferences, preferWellLit: e.target.checked })}
                className="rounded border-border text-peacock focus:ring-peacock h-4 w-4"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-text font-medium">Busier streets & transit access</span>
              <input
                type="checkbox"
                checked={preferences.preferPublicTransport}
                onChange={(e) => onUpdatePreferences({ ...preferences, preferPublicTransport: e.target.checked })}
                className="rounded border-border text-peacock focus:ring-peacock h-4 w-4"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-text font-medium">Proximity to open essential facilities</span>
              <input
                type="checkbox"
                checked={preferences.preferEssentialFacilities}
                onChange={(e) => onUpdatePreferences({ ...preferences, preferEssentialFacilities: e.target.checked })}
                className="rounded border-border text-peacock focus:ring-peacock h-4 w-4"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-text font-medium">Step-free wheelchair accessibility</span>
              <input
                type="checkbox"
                checked={preferences.wheelchairAccessible}
                onChange={(e) => onUpdatePreferences({ ...preferences, wheelchairAccessible: e.target.checked })}
                className="rounded border-border text-peacock focus:ring-peacock h-4 w-4"
              />
            </label>
          </div>
        )}
      </div>

      {/* Route Results Section */}
      <div className="p-4 sm:p-5 space-y-3">
        <div className="flex items-center justify-between text-xs text-text-secondary px-0.5">
          <span className="font-semibold uppercase tracking-wider text-[11px] text-text-secondary">
            {routes.length} Route Alternatives
          </span>
          <span className="text-[11px]">Sorted by travel context</span>
        </div>

        {isLoadingRoutes ? (
          <div className="space-y-3 py-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="surface-card p-4 space-y-3 animate-pulse">
                <div className="h-4 bg-raised rounded w-1/3" />
                <div className="h-6 bg-raised rounded w-2/3" />
                <div className="h-3 bg-raised rounded w-full" />
              </div>
            ))}
          </div>
        ) : routes.length > 0 ? (
          <div className="space-y-3" role="region" aria-label="Route comparison results">
            {routes.map((route, idx) => (
              <RouteCard
                key={route.id}
                route={route}
                isSelected={idx === selectedRouteIndex}
                onSelect={() => onSelectRouteIndex(idx)}
                onOpenDetails={() => onOpenRouteDetails(route)}
                onStartTrip={() => onStartJourneyWithRoute(route)}
              />
            ))}
          </div>
        ) : (
          <div className="surface-card p-6 text-center text-text-secondary space-y-2">
            <MapPin className="w-8 h-8 text-border-strong mx-auto" />
            <p className="text-sm font-semibold text-ink">No routes computed yet</p>
            <p className="text-xs">Select your origin and destination above to compare transparent walking corridors.</p>
          </div>
        )}
      </div>
    </div>
  );
};
