'use client';

import React, { useState, useEffect } from 'react';
import { Coordinates, RouteOption, RoutePreferences } from '@/types';
import { RouteCard } from './RouteCard';
import { SpatialJourneyOrb } from '../spatial/SpatialJourneyOrb';
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
        setIsLocating(false);
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        onSetOrigin(coords, 'Current Location');
        setOriginInput('Current Location (GPS)');
        setShowOriginDropdown(false);
      },
      (err) => {
        setIsLocating(false);
        let msg = 'Unable to acquire location.';
        if (err.code === err.PERMISSION_DENIED) {
          msg = 'Location access denied. Please select a starting point below.';
        } else if (err.code === err.TIMEOUT) {
          msg = 'Location request timed out. Please select a starting point below.';
        }
        setLocationError(msg);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const activePrioritiesCount = [
    preferences.preferWellLit,
    preferences.preferPublicTransport,
    preferences.preferEssentialFacilities,
    preferences.wheelchairAccessible,
  ].filter(Boolean).length;

  return (
    <div className="w-full flex flex-col divide-y divide-border/60">
      {/* Route Planning Header Card */}
      <div className="p-4 sm:p-5 space-y-4">
        {/* Top Control Bar: Walk / Transit segmented switch */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-editorial text-xl font-bold text-bordeaux tracking-tight">
              Plan Journey
            </h2>
            <p className="text-xs text-text-secondary mt-0.5">
              Select waypoints to compare verified walking corridors
            </p>
          </div>

          <div
            className="flex items-center p-1 rounded-xl bg-canvas border border-border text-xs font-semibold"
            role="tablist"
            aria-label="Travel mode selection"
          >
            <button
              type="button"
              onClick={() => setTravelMode('walk')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition-all focus-ring-bordeaux ${
                travelMode === 'walk'
                  ? 'bg-bordeaux text-white shadow-sm'
                  : 'text-text-secondary hover:text-bordeaux'
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
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition-all focus-ring-bordeaux ${
                travelMode === 'transit'
                  ? 'bg-bordeaux text-white shadow-sm'
                  : 'text-text-secondary hover:text-bordeaux'
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
        <div className="surface-card p-3.5 relative border border-border-gold/50 shadow-atelier">
          <div className="flex items-stretch gap-2.5">
            {/* Visual connector line A to B */}
            <div className="flex flex-col items-center justify-between py-2 shrink-0 select-none">
              <div className="w-6 h-6 rounded-full bg-bordeaux text-champagne font-bold text-xs flex items-center justify-center border border-champagne/40">
                A
              </div>
              <div className="w-0.5 flex-1 bg-border-strong my-1" />
              <div className="w-6 h-6 rounded-full bg-rose-gold text-white font-bold text-xs flex items-center justify-center border border-white">
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
                  className="w-full text-xs font-medium bg-canvas rounded-xl px-3 py-2.5 border border-border focus:border-rose-gold focus-ring-bordeaux text-bordeaux placeholder:text-text-muted transition-colors"
                  aria-label="Starting location"
                />

                {showOriginDropdown && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-border-gold rounded-xl shadow-atelier z-30 max-h-48 overflow-y-auto">
                    <button
                      type="button"
                      onClick={handleUseCurrentLocation}
                      disabled={isLocating}
                      className="w-full text-left px-3 py-2 text-xs font-semibold text-rose-gold hover:bg-rose-tint flex items-center gap-2 border-b border-border"
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
                        className="w-full text-left px-3 py-2 text-xs hover:bg-canvas border-b border-border/50 last:border-b-0"
                      >
                        <div className="font-semibold text-bordeaux">{place.name}</div>
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
                  className="w-full text-xs font-medium bg-canvas rounded-xl px-3 py-2.5 border border-border focus:border-rose-gold focus-ring-bordeaux text-bordeaux placeholder:text-text-muted transition-colors"
                  aria-label="Destination location"
                />

                {showDestDropdown && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-border-gold rounded-xl shadow-atelier z-30 max-h-48 overflow-y-auto">
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
                        <div className="font-semibold text-bordeaux">{place.name}</div>
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
                className="p-2.5 rounded-xl bg-canvas hover:bg-canvas-subtle text-text-secondary hover:text-bordeaux border border-border transition-colors focus-ring-bordeaux"
                title="Swap starting point and destination"
                aria-label="Swap starting point and destination"
              >
                <ArrowUpDown className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Location Error Notice if GPS failed */}
          {locationError && (
            <div className="mt-2.5 p-2 rounded-lg bg-danger-tint border border-danger/30 text-danger text-[11px] flex items-start gap-1.5 font-medium">
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
            className="flex items-center gap-1.5 text-xs font-semibold text-text-secondary hover:text-bordeaux focus-ring-bordeaux rounded-lg px-2 py-1"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-champagne" />
            <span>Priorities & Accessibility</span>
            {activePrioritiesCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-champagne-tint text-champagne-dark text-[10px] font-bold flex items-center justify-center">
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
            className="btn-bordeaux px-4 py-2.5 text-xs font-bold shadow-md disabled:opacity-50 flex items-center gap-2"
          >
            <Navigation className="w-3.5 h-3.5 text-champagne" />
            <span>{isLoadingRoutes ? 'Evaluating...' : 'Find routes'}</span>
          </button>
        </div>

        {/* Collapsible Priorities Panel */}
        {showPreferences && (
          <div className="mt-3 p-3.5 rounded-xl bg-surface-raised border border-border text-xs space-y-2 animate-fade-in">
            <div className="font-semibold text-bordeaux text-[11px] uppercase tracking-wider mb-1">
              Active Routing Factors
            </div>
            
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-bordeaux font-medium">Better street lighting</span>
              <input
                type="checkbox"
                checked={preferences.preferWellLit}
                onChange={(e) => onUpdatePreferences({ ...preferences, preferWellLit: e.target.checked })}
                className="rounded border-border text-rose-gold focus:ring-rose-gold h-4 w-4"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-bordeaux font-medium">Busier streets & transit access</span>
              <input
                type="checkbox"
                checked={preferences.preferPublicTransport}
                onChange={(e) => onUpdatePreferences({ ...preferences, preferPublicTransport: e.target.checked })}
                className="rounded border-border text-rose-gold focus:ring-rose-gold h-4 w-4"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-bordeaux font-medium">Proximity to open essential facilities</span>
              <input
                type="checkbox"
                checked={preferences.preferEssentialFacilities}
                onChange={(e) => onUpdatePreferences({ ...preferences, preferEssentialFacilities: e.target.checked })}
                className="rounded border-border text-rose-gold focus:ring-rose-gold h-4 w-4"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-bordeaux font-medium">Step-free wheelchair accessibility</span>
              <input
                type="checkbox"
                checked={preferences.wheelchairAccessible}
                onChange={(e) => onUpdatePreferences({ ...preferences, wheelchairAccessible: e.target.checked })}
                className="rounded border-border text-rose-gold focus:ring-rose-gold h-4 w-4"
              />
            </label>
          </div>
        )}
      </div>

      {/* Interactive 3D Spatial Journey Orb */}
      <div className="px-4 py-3 bg-canvas/60">
        <SpatialJourneyOrb
          routePerspective={routes[selectedRouteIndex]?.perspective ? `${routes[selectedRouteIndex].perspective.replace('_', ' ').toUpperCase()} CORRIDOR` : 'CONNAUGHT ATELIER AXIS'}
          isEvaluating={isLoadingRoutes}
        />
      </div>

      {/* Route Results Section */}
      <div className="p-4 sm:p-5 space-y-3">
        <div className="flex items-center justify-between text-xs text-text-secondary px-0.5">
          <span className="font-semibold uppercase tracking-wider text-[11px] text-text-secondary font-editorial">
            {routes.length} Route Alternatives
          </span>
          <span className="text-[11px]">Sorted by travel context</span>
        </div>

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
            <MapPin className="w-8 h-8 text-border-strong mx-auto" />
            <p className="text-sm font-semibold text-bordeaux font-editorial">No routes computed yet</p>
            <p className="text-xs">Select your origin and destination above to compare transparent walking corridors.</p>
          </div>
        )}
      </div>
    </div>
  );
};
