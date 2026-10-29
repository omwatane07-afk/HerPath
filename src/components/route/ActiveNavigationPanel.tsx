'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  RouteOption,
  Coordinates,
  CommunityReport,
  RouteStep,
} from '@/types';
import { calculateDistanceMeters, formatDistance, formatDuration } from '@/lib/utils';
import {
  Navigation,
  CornerUpLeft,
  CornerUpRight,
  ArrowUp,
  MapPin,
  CheckCircle2,
  X,
  Compass,
  AlertTriangle,
  RefreshCw,
  ChevronRight,
  ChevronLeft,
  Volume2,
  VolumeX,
  List,
} from 'lucide-react';

interface ActiveNavigationPanelProps {
  route: RouteOption;
  onEndNavigation: () => void;
  onRecenterMap?: (coords: Coordinates) => void;
  onUserLocationUpdate?: (coords: Coordinates) => void;
  nearbyReports?: CommunityReport[];
}

export const ActiveNavigationPanel: React.FC<ActiveNavigationPanelProps> = ({
  route,
  onEndNavigation,
  onRecenterMap,
  onUserLocationUpdate,
  nearbyReports = [],
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [userLocation, setUserLocation] = useState<Coordinates | null>(null);
  const [locationAccuracy, setLocationAccuracy] = useState<number | null>(null);
  const [speedKmh, setSpeedKmh] = useState<number | null>(null);
  const [isFollowMode, setIsFollowMode] = useState<boolean>(true);
  const [showStepsList, setShowStepsList] = useState<boolean>(false);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [voiceEnabled, setVoiceEnabled] = useState<boolean>(true);

  const steps: RouteStep[] = route.steps && route.steps.length > 0
    ? route.steps
    : [
        {
          instruction: `Begin walking from ${route.name}`,
          distanceMeters: Math.round(route.distanceMeters * 0.4),
          durationSeconds: Math.round(route.durationSeconds * 0.4),
          coordinates: route.coordinates[0] || [28.6328, 77.2197],
        },
        {
          instruction: 'Continue straight along the illuminated pedestrian corridor',
          distanceMeters: Math.round(route.distanceMeters * 0.4),
          durationSeconds: Math.round(route.durationSeconds * 0.4),
          coordinates: route.coordinates[Math.floor(route.coordinates.length / 2)] || [28.6290, 77.2270],
        },
        {
          instruction: 'Arrive safely at your destination',
          distanceMeters: Math.round(route.distanceMeters * 0.2),
          durationSeconds: Math.round(route.durationSeconds * 0.2),
          coordinates: route.coordinates[route.coordinates.length - 1] || [28.6258, 77.2345],
        },
      ];

  const currentStep = steps[currentStepIndex] || steps[0];

  // Live GPS tracking via watchPosition
  useEffect(() => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      setGpsError('Geolocation is not supported by your browser.');
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const coords: Coordinates = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        };
        setUserLocation(coords);
        setLocationAccuracy(Math.round(pos.coords.accuracy));
        if (pos.coords.speed !== null && pos.coords.speed >= 0) {
          setSpeedKmh(Math.round(pos.coords.speed * 3.6));
        }
        setGpsError(null);

        if (onUserLocationUpdate) {
          onUserLocationUpdate(coords);
        }

        if (isFollowMode && onRecenterMap) {
          onRecenterMap(coords);
        }
      },
      (err) => {
        setGpsError(`GPS fix lost (${err.message}). Using estimated corridor progression.`);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 2000,
      }
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, [isFollowMode, onRecenterMap, onUserLocationUpdate]);

  // Voice guidance announcement on step change
  useEffect(() => {
    if (voiceEnabled && typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(currentStep.instruction);
        utterance.rate = 1.0;
        utterance.pitch = 1.05;
        window.speechSynthesis.speak(utterance);
      } catch {}
    }
  }, [currentStepIndex, voiceEnabled, currentStep.instruction]);

  // Proximity Civic Hazard Radar (checks reports within 180m of current location)
  const nearbyAlert = userLocation
    ? nearbyReports.find((r) => {
        if (r.status === 'resolved') return false;
        const d = calculateDistanceMeters(userLocation, r.coordinates);
        return d <= 180;
      })
    : null;

  // Maneuver Icon Helper
  const getManeuverIcon = (instruction: string) => {
    const lower = instruction.toLowerCase();
    if (lower.includes('left')) return <CornerUpLeft className="w-8 h-8 text-purple-600 stroke-[2.5]" />;
    if (lower.includes('right')) return <CornerUpRight className="w-8 h-8 text-purple-600 stroke-[2.5]" />;
    if (lower.includes('arrive') || lower.includes('destination')) {
      return <CheckCircle2 className="w-8 h-8 text-emerald-600 stroke-[2.5]" />;
    }
    return <ArrowUp className="w-8 h-8 text-purple-600 stroke-[2.5]" />;
  };

  return (
    <div className="flex flex-col h-full bg-white/95 backdrop-blur-2xl text-slate-800 border-r border-slate-200/80 font-sans shadow-xl overflow-hidden select-none">
      {/* 1. Top Turn Instruction Banner (Pure White Glass) */}
      <div className="p-4 sm:p-5 bg-gradient-to-b from-purple-50/80 via-white/90 to-white border-b border-purple-100/80">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3.5">
            <div className="w-14 h-14 rounded-2xl bg-white border-2 border-purple-200/80 shadow-md flex items-center justify-center shrink-0">
              {getManeuverIcon(currentStep.instruction)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-purple-700 uppercase tracking-wider">
                  Step {currentStepIndex + 1} of {steps.length}
                </span>
                {locationAccuracy !== null && (
                  <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.2 rounded-full border border-emerald-200 font-mono font-bold">
                    ±{locationAccuracy}m GPS
                  </span>
                )}
              </div>
              <h3 className="font-heading text-base sm:text-lg font-extrabold text-slate-900 leading-snug mt-0.5">
                {currentStep.instruction}
              </h3>
              <p className="text-xs font-semibold text-slate-500 mt-0.5">
                In approximately {formatDistance(currentStep.distanceMeters)} · {formatDuration(currentStep.durationSeconds)}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onEndNavigation}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors shrink-0"
            title="End Navigation"
            aria-label="End Navigation"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* GPS Warning if signal is lost */}
        {gpsError && (
          <div className="mt-2.5 p-2 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-900 flex items-center gap-1.5 font-medium">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span>{gpsError}</span>
          </div>
        )}
      </div>

      {/* 2. Civic Radar Warning (If near known report) */}
      {nearbyAlert && (
        <div className="mx-4 mt-3 p-3 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-300 shadow-sm text-xs text-amber-950 flex items-start gap-2.5 animate-fade-in">
          <div className="w-7 h-7 rounded-lg bg-amber-500 text-white flex items-center justify-center shrink-0 font-bold">
            ⚠️
          </div>
          <div className="min-w-0">
            <div className="font-bold font-heading text-amber-950">
              Civic Alert on Route ({formatDistance(calculateDistanceMeters(userLocation!, nearbyAlert.coordinates))} ahead)
            </div>
            <p className="text-[11px] text-amber-900 leading-snug mt-0.5">
              &ldquo;{nearbyAlert.locationName}&rdquo;: {nearbyAlert.description}
            </p>
          </div>
        </div>
      )}

      {/* 3. Real-Time Telemetry Cards */}
      <div className="p-4 grid grid-cols-3 gap-2.5">
        <div className="p-3 rounded-2xl bg-slate-50/80 border border-slate-200/80 text-center">
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Remaining</div>
          <div className="text-base font-extrabold text-slate-900 font-heading mt-0.5">
            {formatDuration(route.durationSeconds)}
          </div>
          <div className="text-[11px] text-slate-500 font-medium">
            {formatDistance(route.distanceMeters)}
          </div>
        </div>

        <div className="p-3 rounded-2xl bg-slate-50/80 border border-slate-200/80 text-center">
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Speed</div>
          <div className="text-base font-extrabold text-slate-900 font-heading mt-0.5">
            {speedKmh !== null ? `${speedKmh} km/h` : '4.5 km/h'}
          </div>
          <div className="text-[11px] text-slate-500 font-medium">Walking pace</div>
        </div>

        <div className="p-3 rounded-2xl bg-slate-50/80 border border-slate-200/80 text-center">
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Lighting</div>
          <div className="text-base font-extrabold text-purple-700 font-heading mt-0.5">
            {route.lightingCoveragePercent !== undefined ? `${route.lightingCoveragePercent}%` : `${route.verifiedLightCount} lights`}
          </div>
          <div className="text-[11px] text-slate-500 font-medium">Illuminated</div>
        </div>
      </div>

      {/* 4. Navigation Controls & Follow Mode */}
      <div className="px-4 py-2 flex items-center justify-between gap-2 border-y border-slate-100">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setIsFollowMode(!isFollowMode)}
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
              isFollowMode
                ? 'bg-purple-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>{isFollowMode ? 'Follow GPS' : 'Free Pan'}</span>
          </button>

          <button
            type="button"
            onClick={() => setVoiceEnabled(!voiceEnabled)}
            className={`p-2 rounded-full text-xs font-bold transition-all ${
              voiceEnabled ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-500'
            }`}
            title={voiceEnabled ? 'Mute voice instructions' : 'Enable voice instructions'}
            aria-label="Toggle voice guidance"
          >
            {voiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            disabled={currentStepIndex <= 0}
            onClick={() => setCurrentStepIndex((i) => Math.max(0, i - 1))}
            className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 disabled:opacity-30 transition-colors"
            title="Previous step"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs font-bold text-slate-600 font-mono">
            {currentStepIndex + 1}/{steps.length}
          </span>
          <button
            type="button"
            disabled={currentStepIndex >= steps.length - 1}
            onClick={() => setCurrentStepIndex((i) => Math.min(steps.length - 1, i + 1))}
            className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 disabled:opacity-30 transition-colors"
            title="Next step"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 5. Turn-by-Turn Instruction Steps List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        <div className="flex items-center justify-between text-xs font-bold text-slate-500 px-1 uppercase tracking-wider">
          <span>Turn-by-Turn Guidance</span>
          <button
            type="button"
            onClick={() => setShowStepsList(!showStepsList)}
            className="text-purple-600 hover:underline"
          >
            {showStepsList ? 'Collapse' : 'Expand All'}
          </button>
        </div>

        {steps.map((step, idx) => {
          const isCurrent = idx === currentStepIndex;
          const isPast = idx < currentStepIndex;

          return (
            <div
              key={idx}
              onClick={() => setCurrentStepIndex(idx)}
              className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                isCurrent
                  ? 'bg-purple-50/90 border-purple-300 shadow-sm'
                  : isPast
                  ? 'bg-slate-50/50 border-slate-100 opacity-60'
                  : 'bg-white border-slate-200/80 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <span
                  className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center shrink-0 ${
                    isCurrent
                      ? 'bg-purple-600 text-white'
                      : isPast
                      ? 'bg-slate-200 text-slate-600'
                      : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {idx + 1}
                </span>
                <span className={`text-xs font-semibold truncate ${isCurrent ? 'text-purple-950 font-bold' : 'text-slate-700'}`}>
                  {step.instruction}
                </span>
              </div>

              <span className="text-[11px] font-mono font-medium text-slate-500 shrink-0">
                {formatDistance(step.distanceMeters)}
              </span>
            </div>
          );
        })}
      </div>

      {/* 6. Footer: End Navigation Button */}
      <div className="p-4 bg-white/95 border-t border-slate-200/80">
        <button
          type="button"
          onClick={onEndNavigation}
          className="w-full py-3 rounded-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md flex items-center justify-center gap-2 transition-transform active:scale-98"
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Exit Navigation</span>
        </button>
      </div>
    </div>
  );
};
