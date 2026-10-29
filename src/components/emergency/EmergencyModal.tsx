'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Phone,
  Share2,
  Copy,
  Check,
  X,
  ShieldAlert,
  AlertOctagon,
  RefreshCw,
  MapPin,
  Clock,
  ShieldCheck,
  Building2,
  PhoneForwarded,
  CheckCircle2,
  AlertTriangle,
  Info,
  ExternalLink,
} from 'lucide-react';
import { Coordinates, TrustedContact, PoliceStation, SOSEvent } from '@/types';
import { PoliceStationService } from '@/services/police-station-service';
import { SOSService } from '@/services/sos-service';
import { formatDistance } from '@/lib/utils';

interface EmergencyModalProps {
  isOpen?: boolean;
  onClose: () => void;
  currentLocation: Coordinates | null;
  trustedContacts: TrustedContact[];
  triggerMethod?: 'triple_tap' | 'quick_action';
  initialTestMode?: boolean;
}

export const EmergencyModal: React.FC<EmergencyModalProps> = ({
  isOpen = true,
  onClose,
  currentLocation: propLocation,
  trustedContacts,
  triggerMethod = 'triple_tap',
  initialTestMode = false,
}) => {
  // Test Mode State
  const [isTestMode, setIsTestMode] = useState<boolean>(() => {
    return initialTestMode || SOSService.isTestMode();
  });

  // Countdown State (Accidental trigger cancellation window: 5 seconds)
  const [countdownSeconds, setCountdownSeconds] = useState<number>(5);
  const [isCountdownActive, setIsCountdownActive] = useState<boolean>(true);
  const countdownTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Active Emergency Event
  const [activeEvent, setActiveEvent] = useState<SOSEvent | null>(null);
  const [activationTimestamp, setActivationTimestamp] = useState<string>(() =>
    new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  );

  // Location Acquisition State
  const [location, setLocation] = useState<Coordinates | null>(propLocation);
  const [locationAccuracy, setLocationAccuracy] = useState<number | null>(null);
  const [locationTimestamp, setLocationTimestamp] = useState<string | null>(null);
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [manualCoordsInput, setManualCoordsInput] = useState<string>('');
  const [showManualInput, setShowManualInput] = useState<boolean>(false);

  // Nearby Police Stations State
  const [policeStations, setPoliceStations] = useState<PoliceStation[]>([]);
  const [isLoadingStations, setIsLoadingStations] = useState<boolean>(false);
  const [stationsError, setStationsError] = useState<string | null>(null);

  // Broadcast & Action States
  const [copied, setCopied] = useState<boolean>(false);
  const [alertStatus, setAlertStatus] = useState<'idle' | 'preparing' | 'dispatched' | 'failed'>('idle');
  const [alertStatusMessage, setAlertStatusMessage] = useState<string | null>(null);
  const [simulatedCallNotice, setSimulatedCallNotice] = useState<string | null>(null);

  const defaultEmergencyNumber = process.env.NEXT_PUBLIC_DEFAULT_EMERGENCY_NUMBER || '112';
  const womenHelplineNumber = process.env.NEXT_PUBLIC_WOMEN_HELPLINE_NUMBER || '1091';

  // Toggle Test Mode
  const handleToggleTestMode = (enabled: boolean) => {
    setIsTestMode(enabled);
    SOSService.setTestMode(enabled);
    if (location) {
      loadPoliceStations(location, enabled);
    }
  };

  // Location Acquisition Handler
  const acquireLocation = useCallback(() => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      setLocationError('Geolocation not supported by device browser');
      return;
    }

    setIsLocating(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const freshCoords = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        };
        setLocation(freshCoords);
        setLocationAccuracy(Math.round(pos.coords.accuracy));
        setLocationTimestamp(new Date(pos.timestamp).toLocaleTimeString());
        setIsLocating(false);
      },
      (err) => {
        setIsLocating(false);
        setLocationError(
          err.code === 1
            ? 'Location permission denied. You can proceed with emergency options or enter coordinates below.'
            : 'Unable to acquire fresh GPS signal. Proceeding with best known location.'
        );
      },
      { enableHighAccuracy: true, timeout: 6000, maximumAge: 10000 }
    );
  }, []);

  // Fetch Nearby Police Stations
  const loadPoliceStations = useCallback(
    async (coords: Coordinates, testMode: boolean) => {
      setIsLoadingStations(true);
      setStationsError(null);
      try {
        const stations = await PoliceStationService.findNearbyStations(coords, 5000, testMode);
        setPoliceStations(stations);
      } catch (err: any) {
        setStationsError('Unable to query live police stations. Fallback directory active.');
        setPoliceStations(PoliceStationService.getFallbackStations(coords));
      } finally {
        setIsLoadingStations(false);
      }
    },
    []
  );

  // Initialize on mount
  useEffect(() => {
    if (!isOpen) return;

    // Create and record SOS event
    const event = SOSService.createEvent(
      propLocation || undefined,
      undefined,
      triggerMethod,
      isTestMode
    );
    setActiveEvent(event);
    setActivationTimestamp(
      new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    );

    // Start 5-second countdown
    setIsCountdownActive(true);
    setCountdownSeconds(5);

    countdownTimerRef.current = setInterval(() => {
      setCountdownSeconds((prev) => {
        if (prev <= 1) {
          if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
          setIsCountdownActive(false);
          if (event) SOSService.updateEventStatus(event.id, 'active');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Acquire GPS
    acquireLocation();

    return () => {
      if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
    };
  }, [isOpen]);

  // Load police stations when location changes
  useEffect(() => {
    if (location) {
      loadPoliceStations(location, isTestMode);
    }
  }, [location?.lat, location?.lng, isTestMode, loadPoliceStations]);

  if (!isOpen) return null;

  // Immediate "Skip Countdown / I Need Help Now"
  const handleSkipCountdown = () => {
    if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
    setIsCountdownActive(false);
    setCountdownSeconds(0);
    if (activeEvent) {
      SOSService.updateEventStatus(activeEvent.id, 'active');
    }
  };

  // Accidental Trigger Cancellation
  const handleCancelSOS = () => {
    if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
    if (activeEvent) {
      SOSService.updateEventStatus(activeEvent.id, 'cancelled');
    }
    onClose();
  };

  // Safe Recovery / End Emergency
  const handleResolveEmergency = () => {
    if (activeEvent) {
      SOSService.updateEventStatus(activeEvent.id, 'resolved');
    }
    onClose();
  };

  // Manual Coordinates Submit
  const handleApplyManualCoords = (e: React.FormEvent) => {
    e.preventDefault();
    const parts = manualCoordsInput.split(',').map((p) => parseFloat(p.trim()));
    if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
      const manual = { lat: parts[0], lng: parts[1] };
      setLocation(manual);
      setLocationAccuracy(0);
      setLocationTimestamp('Manual input');
      setShowManualInput(false);
      setLocationError(null);
    } else {
      setLocationError('Invalid format. Please use: latitude, longitude (e.g. 28.6328, 77.2197)');
    }
  };

  // Emergency Share Text
  const shareText = location
    ? `EMERGENCY ALERT: I am using HERPATH and sharing my urgent location: https://www.google.com/maps?q=${location.lat.toFixed(5)},${location.lng.toFixed(5)} (Lat: ${location.lat.toFixed(5)}, Lng: ${location.lng.toFixed(5)}${
        locationAccuracy ? `, ±${locationAccuracy}m` : ''
      }) at ${activationTimestamp}. Please contact me immediately.`
    : `EMERGENCY ALERT: I am using HERPATH and need urgent assistance at ${activationTimestamp}. Please contact me immediately.`;

  // Copy Location
  const handleCopyLocation = () => {
    try {
      navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch {
      // fallback
    }
  };

  // Simulate or Execute Call Action
  const handleCallAction = (
    e: React.MouseEvent<HTMLAnchorElement>,
    phoneNumber: string,
    recipientLabel: string
  ) => {
    if (isTestMode) {
      e.preventDefault();
      setSimulatedCallNotice(
        `[TEST MODE SIMULATION]: Dial action to ${recipientLabel} (${phoneNumber}) registered safely. No cellular call placed.`
      );
      setTimeout(() => setSimulatedCallNotice(null), 4000);
    }
  };

  // Broadcast Alert to Trusted Contacts
  const handleBroadcastAlert = async () => {
    setAlertStatus('preparing');
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    if (isTestMode) {
      setAlertStatus('dispatched');
      setAlertStatusMessage(
        `[TEST MODE SIMULATION]: Distress message prepared at ${timeStr}. Native SMS/WhatsApp intent simulated.`
      );
      return;
    }

    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: 'HERPATH EMERGENCY DISTRESS ALERT',
          text: `${shareText}`,
        });
        setAlertStatus('dispatched');
        setAlertStatusMessage(`Distress location handed off to device sharing intent at ${timeStr}.`);
      } catch (err: any) {
        if (err.name === 'AbortError') {
          setAlertStatus('idle');
        } else {
          setAlertStatus('failed');
          handleCopyLocation();
          setAlertStatusMessage(
            "Device share unavailable — exact GPS coordinates copied to clipboard. Paste into your messaging app."
          );
        }
      }
    } else {
      handleCopyLocation();
      setAlertStatus('dispatched');
      setAlertStatusMessage(
        `Exact GPS coordinates copied to clipboard at ${timeStr}. Paste into WhatsApp or SMS.`
      );
    }
  };

  const emergencyContact =
    trustedContacts.find((c) => c.isEmergencyAlertContact) || trustedContacts[0];

  return (
    <div
      className="fixed inset-0 z-[10000] flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="sos-modal-title"
    >
      <div className="bg-[#170E26] border-2 border-[#C1121F] rounded-2xl sm:rounded-3xl max-w-xl w-full max-h-[92dvh] flex flex-col p-4 sm:p-6 text-white shadow-2xl relative overflow-hidden font-sans my-auto">
        {/* Top Emergency Red Warning Banner */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-[#C1121F] animate-pulse" />

        {/* 1. Header with Mode Badge and Emergency Trigger Info */}
        <div className="flex items-start justify-between gap-3 pb-3 mb-2 border-b border-white/20 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#C1121F] flex items-center justify-center text-white shrink-0 shadow-lg ring-4 ring-[#C1121F]/30 animate-pulse">
              <ShieldAlert className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 id="sos-modal-title" className="text-xl sm:text-2xl font-black text-white tracking-wide">
                  EMERGENCY SOS
                </h2>
                {isTestMode ? (
                  <span className="bg-emerald-950 text-emerald-300 border border-emerald-500/80 px-2 py-0.5 rounded-full text-[10px] font-black tracking-wider uppercase">
                    Demo Test Mode
                  </span>
                ) : (
                  <span className="bg-red-950 text-red-300 border border-red-500/80 px-2 py-0.5 rounded-full text-[10px] font-black tracking-wider uppercase">
                    Live Emergency
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-300 font-medium">
                Triggered via {triggerMethod === 'triple_tap' ? 'triple-tap sequence' : 'emergency action'} at {activationTimestamp}
              </p>
            </div>
          </div>

          <button
            onClick={handleCancelSOS}
            className="text-gray-300 hover:text-white p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors focus-ring-on-dark shrink-0"
            aria-label="Close emergency modal"
            title="Close emergency modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Modal Body */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-3.5 my-1">
          {/* Test Mode Toggle for Hackathon Demonstration */}
        <div className="mb-3.5 p-2.5 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="text-sm">🧪</span>
            <span className="font-bold text-gray-200">Hackathon Evaluation Mode:</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleToggleTestMode(false)}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                !isTestMode
                  ? 'bg-[#C1121F] text-white shadow-sm'
                  : 'bg-white/10 text-gray-400 hover:text-white'
              }`}
            >
              Live Calls
            </button>
            <button
              type="button"
              onClick={() => handleToggleTestMode(true)}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                isTestMode
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-white/10 text-gray-400 hover:text-white'
              }`}
            >
              Demo Test
            </button>
          </div>
        </div>

        {/* Simulated Call Notification Toast */}
        {simulatedCallNotice && (
          <div className="mb-3 p-3 rounded-xl bg-emerald-950 border border-emerald-400 text-emerald-200 text-xs flex items-start gap-2 animate-fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div className="leading-snug">{simulatedCallNotice}</div>
          </div>
        )}

        {/* 2. Cancellation Countdown Banner (Accidental trigger prevention) */}
        {isCountdownActive && countdownSeconds > 0 ? (
          <div className="mb-4 p-4 rounded-2xl bg-amber-950/90 border-2 border-amber-500 text-amber-200 space-y-3 animate-fade-in">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertOctagon className="w-5 h-5 text-amber-400 animate-spin" />
                <span className="font-black text-sm uppercase tracking-wide">
                  Accidental Trigger? Cancelling in {countdownSeconds}s...
                </span>
              </div>
              <span className="font-mono font-bold text-base bg-amber-900/60 px-2 py-0.5 rounded">
                0:0{countdownSeconds}
              </span>
            </div>

            <div className="w-full bg-amber-950 rounded-full h-2 overflow-hidden border border-amber-600/40">
              <div
                className="bg-amber-400 h-2 transition-all duration-1000 ease-linear rounded-full"
                style={{ width: `${(countdownSeconds / 5) * 100}%` }}
              />
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={handleCancelSOS}
                className="py-2.5 px-3 rounded-xl bg-white text-ink font-bold text-xs hover:bg-gray-100 transition-colors shadow-sm"
              >
                Cancel SOS (False Alarm)
              </button>
              <button
                type="button"
                onClick={handleSkipCountdown}
                className="py-2.5 px-3 rounded-xl bg-[#C1121F] hover:bg-[#A30E1A] text-white font-bold text-xs transition-colors shadow-sm flex items-center justify-center gap-1.5"
              >
                <span>Help Now (Skip)</span>
                <span>→</span>
              </button>
            </div>
          </div>
        ) : null}

        {/* 3. Primary Universal 112 & Women Helpline Buttons */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-gray-400">
              Direct Telephone Hotlines
            </span>
            <span className="text-[10px] text-gray-400">Opens native phone interface</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {/* 112 Universal Emergency */}
            <a
              href={`tel:${defaultEmergencyNumber}`}
              onClick={(e) => handleCallAction(e, defaultEmergencyNumber, '112 Universal Emergency')}
              className="py-3.5 px-4 rounded-xl bg-[#C1121F] hover:bg-[#A30E1A] text-white flex items-center justify-between shadow-lg font-bold transition-transform active:scale-98 focus-ring-on-dark"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-black/20 flex items-center justify-center">
                  <Phone className="w-5 h-5 stroke-[2.5]" />
                </div>
                <div className="text-left">
                  <div className="text-sm font-black uppercase tracking-wide">Call 112</div>
                  <div className="text-[10px] text-gray-200">National ERSS (India)</div>
                </div>
              </div>
              <PhoneForwarded className="w-4 h-4 text-white/80" />
            </a>

            {/* 1091 Women Helpline Desk */}
            <a
              href={`tel:${womenHelplineNumber}`}
              onClick={(e) => handleCallAction(e, womenHelplineNumber, '1091 Women Helpline')}
              className="py-3.5 px-4 rounded-xl bg-purple-900/90 hover:bg-purple-800 text-white border border-purple-400/40 flex items-center justify-between shadow-lg font-bold transition-transform active:scale-98 focus-ring-on-dark"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-black/20 flex items-center justify-center">
                  <Phone className="w-5 h-5 text-pink-300 stroke-[2.5]" />
                </div>
                <div className="text-left">
                  <div className="text-sm font-black uppercase tracking-wide">Call 1091</div>
                  <div className="text-[10px] text-pink-200">Women Safety Desk</div>
                </div>
              </div>
              <PhoneForwarded className="w-4 h-4 text-pink-300" />
            </a>
          </div>
        </div>

        {/* 4. Live GPS Location Panel & Accuracy */}
        <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-2 mb-4">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 font-bold text-gray-300">
              <MapPin className="w-4 h-4 text-[#C1121F]" />
              <span>Urgent GPS Coordinates:</span>
            </div>
            <button
              type="button"
              onClick={acquireLocation}
              disabled={isLocating}
              className="text-[11px] text-gray-400 hover:text-white flex items-center gap-1 font-semibold"
            >
              <RefreshCw className={`w-3 h-3 ${isLocating ? 'animate-spin' : ''}`} />
              <span>{isLocating ? 'Locating...' : 'Refresh GPS'}</span>
            </button>
          </div>

          <div className="flex items-center justify-between bg-black/30 p-2.5 rounded-lg border border-white/10">
            <span className="font-mono font-bold text-amber-300 text-xs sm:text-sm">
              {location
                ? `${location.lat.toFixed(5)}, ${location.lng.toFixed(5)}`
                : 'Acquiring GPS fix...'}
            </span>
            {locationAccuracy !== null && (
              <span className="text-[10px] bg-white/10 text-gray-300 px-2 py-0.5 rounded-full font-mono">
                ±{locationAccuracy}m accuracy
              </span>
            )}
          </div>

          {locationError && (
            <div className="text-[11px] text-amber-300 flex items-start gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              <span>{locationError}</span>
            </div>
          )}

          {/* Manual coordinate entry toggle */}
          <div className="pt-1 flex items-center justify-between text-[11px]">
            <button
              type="button"
              onClick={() => setShowManualInput(!showManualInput)}
              className="text-gray-400 hover:text-white underline"
            >
              {showManualInput ? 'Hide manual entry' : 'Enter coordinates manually'}
            </button>
            {locationTimestamp && (
              <span className="text-[10px] text-gray-500">Fix at {locationTimestamp}</span>
            )}
          </div>

          {showManualInput && (
            <form onSubmit={handleApplyManualCoords} className="flex gap-2 pt-1">
              <input
                type="text"
                placeholder="28.6328, 77.2197"
                value={manualCoordsInput}
                onChange={(e) => setManualCoordsInput(e.target.value)}
                className="flex-1 text-xs bg-black/40 border border-white/20 rounded-lg px-2.5 py-1.5 text-white font-mono"
              />
              <button
                type="submit"
                className="px-3 py-1.5 bg-white text-ink text-xs font-bold rounded-lg hover:bg-gray-200"
              >
                Apply
              </button>
            </form>
          )}

          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              type="button"
              onClick={handleCopyLocation}
              className="py-2 px-3 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center justify-center gap-1.5 border border-white/20 transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Coordinates</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleBroadcastAlert}
              className="py-2 px-3 rounded-lg bg-[#C1121F] hover:bg-[#A30E1A] text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
            >
              <Share2 className="w-3.5 h-3.5 text-white" />
              <span>{alertStatus === 'failed' ? 'Retry Broadcast' : 'Broadcast Location'}</span>
            </button>
          </div>

          {alertStatusMessage && (
            <p className="text-[11px] text-gray-300 bg-white/5 p-2 rounded border border-white/10 mt-1">
              {alertStatusMessage}
            </p>
          )}
        </div>

        {/* 5. Nearby Police Stations (Geoapify Places API) */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 font-bold uppercase tracking-widest text-gray-400 text-[11px]">
              <Building2 className="w-3.5 h-3.5 text-sky-400" />
              <span>Nearby Police Stations</span>
            </div>
            {location && (
              <button
                type="button"
                onClick={() => loadPoliceStations(location, isTestMode)}
                disabled={isLoadingStations}
                className="text-[10px] text-gray-400 hover:text-white flex items-center gap-1 font-semibold"
              >
                <RefreshCw className={`w-2.5 h-2.5 ${isLoadingStations ? 'animate-spin' : ''}`} />
                <span>Reload</span>
              </button>
            )}
          </div>

          {isLoadingStations ? (
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-center text-xs text-gray-400 flex items-center justify-center gap-2">
              <RefreshCw className="w-4 h-4 animate-spin text-sky-400" />
              <span>Querying nearby stations via Geoapify Places...</span>
            </div>
          ) : policeStations.length === 0 ? (
            <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-xs text-gray-400 text-center">
              No police stations returned in immediate 5km radius. Call 112 for central dispatch.
            </div>
          ) : (
            <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
              {policeStations.slice(0, 3).map((station) => (
                <div
                  key={station.id}
                  className="p-2.5 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-white truncate">{station.name}</span>
                      {station.distanceMeters !== undefined && (
                        <span className="text-[10px] font-mono text-amber-300 font-bold shrink-0">
                          {formatDistance(station.distanceMeters)}
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-gray-400 truncate">{station.address}</p>
                  </div>

                  <div className="shrink-0 flex items-center gap-1.5">
                    {station.phone && station.isVerifiedPhone ? (
                      <a
                        href={`tel:${station.phone.replace(/[^0-9+]/g, '')}`}
                        onClick={(e) => handleCallAction(e, station.phone!, station.name)}
                        className="py-1.5 px-2.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-bold text-[11px] flex items-center gap-1 transition-colors"
                      >
                        <Phone className="w-3 h-3" />
                        <span>Call</span>
                      </a>
                    ) : (
                      <span className="text-[10px] text-gray-500 font-medium italic px-2">
                        No Phone Listed
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 6. Designated Family Contact */}
        {emergencyContact && (
          <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between gap-3 text-xs mb-4">
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-white">{emergencyContact.name}</span>
                <span className="text-[10px] bg-purple-500/30 text-purple-200 px-2 py-0.2 rounded-full border border-purple-400/30">
                  {emergencyContact.relation}
                </span>
              </div>
              <p className="text-[11px] text-gray-400 font-mono">{emergencyContact.phone}</p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <a
                href={`tel:${emergencyContact.phone.replace(/[^0-9+]/g, '')}`}
                onClick={(e) => handleCallAction(e, emergencyContact.phone, emergencyContact.name)}
                className="py-1.5 px-3 rounded-lg bg-white text-ink font-bold text-xs flex items-center gap-1.5 hover:bg-gray-200 transition-colors"
              >
                <Phone className="w-3.5 h-3.5 text-ink" />
                <span>Call</span>
              </a>
            </div>
          </div>
        )}

        </div>

        {/* 7. Bottom Recovery / Resolution Control */}
        <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs shrink-0">
          <p className="text-[10px] text-gray-400 leading-snug max-w-[260px]">
            Notice: Cellular 112 connects directly to authorized police and emergency dispatchers.
          </p>
          <button
            type="button"
            onClick={handleResolveEmergency}
            className="py-2 px-3.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>I Am Safe (End SOS)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
