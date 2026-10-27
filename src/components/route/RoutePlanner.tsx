'use client';

import React, { useState, useEffect } from 'react';
import { Coordinates, RouteOption, RoutePreferences } from '@/types';
import { RouteCard } from './RouteCard';
import {
  Navigation,
  MapPin,
  ArrowUpDown,
  SlidersHorizontal,
  ChevronDown,
  AlertCircle,
  Footprints,
  Bus,
  Zap,
  Scale,
  ShieldCheck,
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
  const [locationError, setLocationError] = useState<string | null>(null);

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

  const activePrioritiesCount = [
    preferences.preferWellLit,
    preferences.preferPublicTransport,
    preferences.preferEssentialFacilities,
    preferences.wheelchairAccessible,
  ].filter(Boolean).length;

  return (
    <div className="flex flex-col h-full overflow-y-auto font-sans bg-card">
      {/* Editorial Header & Travel Mode */}
      <div className="p-4 sm:p-5 border-b border-border bg-card">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h2 className="font-editorial text-xl sm:text-2xl font-bold text-ink">
              Plan Journey
            </h2>
            <p className="text-xs text-text-secondary mt-0.5">
              Compare transparent walking corridors and lighting coverage
            </p>
          </div>

          {/* Mode Switcher */}
          <div className="flex items-center gap-1 bg-canvas p-1 rounded-xl border border-border">
            <button
              type="button"
              onClick={() => setTravelMode('walk')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                travelMode === 'walk'
                  ? 'bg-ink text-white shadow-sm'
                  : 'text-text-secondary hover:text-ink'
              }`}
            >
              <Footprints className="w-3.5 h-3.5" />
              <span>Walk</span>
            </button>
            <button
              type="button"
              onClick={() => setTravelMode('transit')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                travelMode === 'transit'
                  ? 'bg-ink text-white shadow-sm'
                  : 'text-text-secondary hover:text-ink'
              }`}
            >
              <Bus className="w-3.5 h-3.5" />
              <span>Transit</span>
            </button>
          </div>
        </div>

        {/* Connected Origin & Destination Inputs */}
        <div className="mt-3 relative">
          <div className="flex items-stretch gap-2.5">
            {/* Waypoint Indicator Track */}
            <div className="flex flex-col items-center justify-between py-2.5 shrink-0 w-6">
              <span className="w-6 h-6 rounded-full bg-ink text-white text-[11px] font-bold flex items-center justify-center font-editorial">
                A
              </span>
              <div className="w-0.5 flex-1 bg-border-control my-1" />
              <span className="w-6 h-6 rounded-full bg-primary text-white text-[11px] font-bold flex items-center justify-center font-editorial">
                B
              </span>
            </div>

            {/* Inputs Container */}
            <div className="flex-1 space-y-2">
              {/* Origin Field */}
              <div className="relative">
                <input
                  type="text"
                  value={originInput}
                  onChange={(e) => {
                    setOriginInput(e.target.value);
                    setShowOriginDropdown(true);
                  }}
                  onFocus={() => setShowOriginDropdown(true)}
                  placeholder="Starting point or metro station..."
                  className="input-control w-full text-xs font-medium px-3 py-2.5 text-ink placeholder:text-text-muted"
                  aria-label="Starting location"
                />

                {showOriginDropdown && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-xl shadow-e3 z-30 max-h-48 overflow-y-auto">
                    {PRESET_PLACES.map((place) => (
                      <button
                        key={place.id}
                        type="button"
                        onClick={() => {
                          onSetOrigin(place.coordinates, place.name);
                          setOriginInput(place.name);
                          setShowOriginDropdown(false);
                        }}
                        className="w-full text-left px-3 py-2 text-xs hover:bg-canvas border-b border-border/50 last:border-b-0"
                      >
                        <div className="font-semibold text-ink">{place.name}</div>
                        <div className="text-[11px] text-text-secondary">{place.detail}</div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Destination Field */}
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
                  className="input-control w-full text-xs font-medium px-3 py-2.5 text-ink placeholder:text-text-muted"
                  aria-label="Destination location"
                />

                {showDestDropdown && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-xl shadow-e3 z-30 max-h-48 overflow-y-auto">
                    {PRESET_PLACES.map((place) => (
                      <button
                        key={place.id}
                        type="button"
                        onClick={() => {
                          onSetDestination(place.coordinates, place.name);
                          setDestInput(place.name);
                          setShowDestDropdown(false);
                        }}
                        className="w-full text-left px-3 py-2 text-xs hover:bg-canvas border-b border-border/50 last:border-b-0"
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
                className="w-10 h-10 rounded-xl bg-canvas hover:bg-canvas-2 text-text-secondary hover:text-ink border border-border flex items-center justify-center transition-colors focus-ring-primary"
                title="Swap origin and destination"
                aria-label="Swap origin and destination"
              >
                <ArrowUpDown className="w-4 h-4" />
              </button>
            </div>
          </div>

          {locationError && (
            <div className="mt-2.5 p-2 rounded-lg bg-error-tint border border-error/30 text-error text-[11px] flex items-start gap-1.5 font-medium">
              <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              <span>{locationError}</span>
            </div>
          )}
        </div>

        {/* Priorities & Single Primary Action Button */}
        <div className="mt-3.5 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => setShowPreferences(!showPreferences)}
            className="flex items-center gap-1.5 text-xs font-semibold text-text-secondary hover:text-ink focus-ring-primary rounded-lg px-2 py-1.5"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-champagne" />
            <span>Priorities</span>
            {activePrioritiesCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-primary-tint text-primary text-[10px] font-bold flex items-center justify-center">
                {activePrioritiesCount}
              </span>
            )}
            <ChevronDown
              className={`w-3.5 h-3.5 transition-transform ${showPreferences ? 'rotate-180' : ''}`}
            />
          </button>

          {/* Primary Action Button (Violet #5A2FC2, white text, 44px min height) */}
          <button
            type="button"
            onClick={onFetchRoutes}
            disabled={isLoadingRoutes || !origin || !destination}
            className="btn-primary px-5 py-2.5 text-xs font-bold disabled:opacity-50 flex items-center gap-2"
          >
            <Navigation className="w-3.5 h-3.5 text-white" />
            <span>{isLoadingRoutes ? 'Evaluating...' : 'Find routes'}</span>
          </button>
        </div>

        {/* Collapsible Priorities Panel */}
        {showPreferences && (
          <div className="mt-3 p-3.5 rounded-xl bg-surface-raised border border-border text-xs space-y-2 animate-fade-in">
            <div className="font-semibold text-ink text-[11px] uppercase tracking-wider mb-1">
              Active Routing Priorities
            </div>

            <label className="flex items-center justify-between cursor-pointer py-0.5">
              <span className="text-ink font-medium">Better street lighting</span>
              <input
                type="checkbox"
                checked={preferences.preferWellLit}
                onChange={(e) =>
                  onUpdatePreferences({ ...preferences, preferWellLit: e.target.checked })
                }
                className="rounded border-border-control text-primary focus:ring-primary h-4 w-4"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer py-0.5">
              <span className="text-ink font-medium">Busier streets & transit access</span>
              <input
                type="checkbox"
                checked={preferences.preferPublicTransport}
                onChange={(e) =>
                  onUpdatePreferences({ ...preferences, preferPublicTransport: e.target.checked })
                }
                className="rounded border-border-control text-primary focus:ring-primary h-4 w-4"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer py-0.5">
              <span className="text-ink font-medium">Proximity to open essential facilities</span>
              <input
                type="checkbox"
                checked={preferences.preferEssentialFacilities}
                onChange={(e) =>
                  onUpdatePreferences({
                    ...preferences,
                    preferEssentialFacilities: e.target.checked,
                  })
                }
                className="rounded border-border-control text-primary focus:ring-primary h-4 w-4"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer py-0.5">
              <span className="text-ink font-medium">Step-free wheelchair accessibility</span>
              <input
                type="checkbox"
                checked={preferences.wheelchairAccessible}
                onChange={(e) =>
                  onUpdatePreferences({
                    ...preferences,
                    wheelchairAccessible: e.target.checked,
                  })
                }
                className="rounded border-border-control text-primary focus:ring-primary h-4 w-4"
              />
            </label>
          </div>
        )}
      </div>

      {/* Perspective Tabs Header */}
      {routes.length > 0 && (
        <div className="px-4 sm:px-5 pt-3 pb-2 border-b border-border bg-canvas/40 flex items-center justify-between gap-1">
          <div className="flex items-center gap-1.5">
            {routes.map((r, i) => {
              const isSelected = i === selectedRouteIndex;
              const icon =
                r.perspective === 'fastest' ? (
                  <Zap className="w-3 h-3" />
                ) : r.perspective === 'better_supported' ? (
                  <ShieldCheck className="w-3 h-3" />
                ) : (
                  <Scale className="w-3 h-3" />
                );
              const label =
                r.perspective === 'fastest'
                  ? 'Fastest'
                  : r.perspective === 'better_supported'
                  ? 'Supported'
                  : 'Balanced';

              return (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => onSelectRouteIndex(i)}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                    isSelected
                      ? 'bg-primary text-white shadow-sm'
                      : 'bg-card text-text-secondary hover:text-ink border border-border'
                  }`}
                >
                  {icon}
                  <span>{label}</span>
                </button>
              );
            })}
          </div>
          <span className="text-[11px] text-text-muted font-medium">
            {routes.length} options
          </span>
        </div>
      )}

      {/* Route Cards Stream (Reclaimed full height) */}
      <div className="p-4 sm:p-5 space-y-3 flex-1 overflow-y-auto">
        {isLoadingRoutes ? (
          <div className="space-y-3 py-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="surface-card p-4 space-y-3 animate-pulse">
                <div className="h-4 bg-surface-raised rounded w-1/3" />
                <div className="h-6 bg-surface-raised rounded w-2/3" />
                <div className="h-3 bg-surface-raised rounded w-full" />
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
          <div className="surface-card p-6 text-center text-text-secondary space-y-2 border border-border">
            <MapPin className="w-8 h-8 text-border-control mx-auto" />
            <p className="text-sm font-semibold text-ink font-editorial">No routes computed yet</p>
            <p className="text-xs">
              Select origin and destination above to compare transparent walking corridors.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
