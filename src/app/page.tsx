'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Coordinates,
  RouteOption,
  StreetlightSegment,
  CommunityReport,
  EssentialFacility,
  TransportStop,
  JourneySession,
  TrustedContact,
  RoutePreferences,
} from '@/types';
import { StorageRepository } from '@/lib/storage';
import {
  DEMO_PRESET_ORIGINS,
  DEMO_PRESET_DESTINATIONS,
  INITIAL_STREETLIGHTS,
  INITIAL_REPORTS,
  INITIAL_FACILITIES,
  INITIAL_TRANSPORT_STOPS,
} from '@/lib/mock-data';
import { defaultRouteProvider, generateSyntheticRouteAlternatives } from '@/services/routing-service';
import { evaluateRoutes } from '@/services/route-context-engine';
import { Header, ActiveTab } from '@/components/layout/Header';
import { MobileNav } from '@/components/layout/MobileNav';
import { TrustBanner } from '@/components/ui/TrustBanner';
import { LeafletMap } from '@/components/map/LeafletMap';
import { RoutePlanner } from '@/components/route/RoutePlanner';
import { RouteContextDrawer } from '@/components/route/RouteContextDrawer';
import { ReportModal } from '@/components/reports/ReportModal';
import { ReportList } from '@/components/reports/ReportList';
import { FacilitiesView } from '@/components/facilities/FacilitiesView';
import { FamilyJourneyModal } from '@/components/journey/FamilyJourneyModal';
import { FamilyTripsView } from '@/components/journey/FamilyTripsView';
import { ActiveJourneyBanner } from '@/components/journey/ActiveJourneyBanner';
import { EmergencyModal } from '@/components/emergency/EmergencyModal';
import { CivicInsightsView } from '@/components/civic/CivicInsightsView';
import { SettingsModal } from '@/components/settings/SettingsModal';
import { ChevronDown, ChevronUp, MapPin, Navigation } from 'lucide-react';

export default function HerPathHome() {
  // Navigation State
  const [activeTab, setActiveTab] = useState<ActiveTab>('route');

  // Mobile Sheet Expanded / Collapsed State
  const [isMobileSheetMinimized, setIsMobileSheetMinimized] = useState<boolean>(false);

  // Map and Route Coordinates (defaulted to Connaught Place demo hub)
  const [mapCenter, setMapCenter] = useState<Coordinates>({ lat: 28.6328, lng: 77.2197 });
  const [origin, setOrigin] = useState<Coordinates | null>(DEMO_PRESET_ORIGINS[0].coordinates);
  const [originName, setOriginName] = useState<string>(DEMO_PRESET_ORIGINS[0].name);
  const [destination, setDestination] = useState<Coordinates | null>(
    DEMO_PRESET_DESTINATIONS[0].coordinates
  );
  const [destinationName, setDestinationName] = useState<string>(
    DEMO_PRESET_DESTINATIONS[0].name
  );

  // User Current Location
  const [currentLocation, setCurrentLocation] = useState<Coordinates | null>(null);

  // Domain Entities from Local Repository
  const [streetlights, setStreetlights] = useState<StreetlightSegment[]>([]);
  const [reports, setReports] = useState<CommunityReport[]>([]);
  const [facilities, setFacilities] = useState<EssentialFacility[]>([]);
  const [transportStops, setTransportStops] = useState<TransportStop[]>([]);
  const [activeJourney, setActiveJourney] = useState<JourneySession | null>(null);
  const [trustedContacts, setTrustedContacts] = useState<TrustedContact[]>([]);
  const [preferences, setPreferences] = useState<RoutePreferences>(
    StorageRepository.getPreferences()
  );

  // Routing State (pre-initialized with high-speed evaluated corridors for immediate interactivity)
  const [routes, setRoutes] = useState<RouteOption[]>(() => {
    try {
      const initialRaw = generateSyntheticRouteAlternatives(
        DEMO_PRESET_ORIGINS[0].coordinates,
        DEMO_PRESET_DESTINATIONS[0].coordinates
      );
      return evaluateRoutes(initialRaw, {
        streetlights: INITIAL_STREETLIGHTS,
        reports: INITIAL_REPORTS,
        facilities: INITIAL_FACILITIES,
        transportStops: INITIAL_TRANSPORT_STOPS,
        preferences: StorageRepository.getPreferences(),
      });
    } catch {
      return [];
    }
  });
  const [selectedRouteIndex, setSelectedRouteIndex] = useState<number>(0);
  const [isLoadingRoutes, setIsLoadingRoutes] = useState<boolean>(false);
  const [inspectedRoute, setInspectedRoute] = useState<RouteOption | null>(null);

  // Modal States
  const [isEmergencyModalOpen, setIsEmergencyModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isJourneyModalOpen, setIsJourneyModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [reportModalCoords, setReportModalCoords] = useState<Coordinates>(mapCenter);

  // Load Initial Repository Data on Mount
  const loadData = useCallback(() => {
    setStreetlights(StorageRepository.getStreetlights());
    setReports(StorageRepository.getReports());
    setFacilities(StorageRepository.getFacilities());
    setTransportStops(StorageRepository.getTransportStops());
    setActiveJourney(StorageRepository.getActiveJourney());
    setTrustedContacts(StorageRepository.getTrustedContacts());
    setPreferences(StorageRepository.getPreferences());
  }, []);

  useEffect(() => {
    loadData();

    // Listen to local storage updates
    const handleStorageUpdate = () => loadData();
    window.addEventListener('herpath_storage_update', handleStorageUpdate);

    // Try unobtrusive GPS probe
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setCurrentLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        },
        () => {
          // Graceful fallback to demo coordinates without alerts
        },
        { timeout: 5000 }
      );
    }

    return () => {
      window.removeEventListener('herpath_storage_update', handleStorageUpdate);
    };
  }, [loadData]);

  // Route Calculation Handler
  const handleCalculateRoutes = useCallback(async () => {
    if (!origin || !destination) return;

    setIsLoadingRoutes(true);
    try {
      const rawRoutes = await defaultRouteProvider.fetchRoutes(origin, destination);
      const evaluated = evaluateRoutes(rawRoutes, {
        streetlights: StorageRepository.getStreetlights(),
        reports: StorageRepository.getReports(),
        facilities: StorageRepository.getFacilities(),
        transportStops: StorageRepository.getTransportStops(),
        preferences,
      });

      setRoutes(evaluated);
      setSelectedRouteIndex(0);
      setMapCenter(origin);
    } catch (err) {
      console.error('Error computing routes:', err);
    } finally {
      setIsLoadingRoutes(false);
    }
  }, [origin, destination, preferences]);

  // Compute initial routes on first mount only if not already loaded
  useEffect(() => {
    if (routes.length === 0) {
      handleCalculateRoutes();
    }
  }, [handleCalculateRoutes, routes.length]);

  // Map Click Handler
  const handleMapClick = (coords: Coordinates) => {
    setReportModalCoords(coords);
  };

  // Facility "Get Directions" trigger
  const handleSetFacilityAsDestination = (coords: Coordinates, name: string) => {
    setDestination(coords);
    setDestinationName(name);
    setActiveTab('route');
    setIsMobileSheetMinimized(false);
    // Recalculate routes immediately
    setTimeout(() => {
      handleCalculateRoutes();
    }, 100);
  };

  // Report Actions
  const handleReportSubmitted = (newReport: CommunityReport) => {
    StorageRepository.saveReport(newReport);
    loadData();
    handleCalculateRoutes();
  };

  const handleStreetlightSubmitted = (newStreetlight: StreetlightSegment) => {
    StorageRepository.saveStreetlight(newStreetlight);
    loadData();
    handleCalculateRoutes();
  };

  const handleUpvoteReport = (id: string) => {
    StorageRepository.upvoteReport(id);
    loadData();
  };

  const handleFlagReport = (id: string) => {
    StorageRepository.flagReport(id);
    loadData();
  };

  const handleResolveReport = (id: string) => {
    StorageRepository.resolveReport(id);
    loadData();
    handleCalculateRoutes();
  };

  // Family Journey Actions
  const handleStartJourney = (journey: JourneySession) => {
    StorageRepository.saveActiveJourney(journey);
    setActiveJourney(journey);
  };

  const handleUpdateJourney = (journey: JourneySession) => {
    StorageRepository.saveActiveJourney(journey);
    setActiveJourney(journey);
  };

  const handleEndJourney = () => {
    StorageRepository.saveActiveJourney(null);
    setActiveJourney(null);
  };

  const handleAddContact = (contact: TrustedContact) => {
    StorageRepository.saveTrustedContact(contact);
    loadData();
  };

  const handleResetDemoData = () => {
    StorageRepository.resetToDemoDefaults();
    loadData();
    setOrigin(DEMO_PRESET_ORIGINS[0].coordinates);
    setOriginName(DEMO_PRESET_ORIGINS[0].name);
    setDestination(DEMO_PRESET_DESTINATIONS[0].coordinates);
    setDestinationName(DEMO_PRESET_DESTINATIONS[0].name);
    handleCalculateRoutes();
  };

  return (
    <div className="flex flex-col h-screen w-full max-w-full overflow-hidden bg-brand-bg font-sans">
      {/* 1. Light-Mode Glass Header */}
      <Header
        activeTab={activeTab}
        onSelectTab={(tab) => {
          setActiveTab(tab);
          setIsMobileSheetMinimized(false);
        }}
        onOpenEmergency={() => setIsEmergencyModalOpen(true)}
        onOpenReportModal={() => {
          setReportModalCoords(mapCenter);
          setIsReportModalOpen(true);
        }}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
        hasActiveJourney={Boolean(activeJourney && activeJourney.status !== 'arrived')}
      />

      {/* 2. Educational Transparency Banner */}
      <TrustBanner />

      {/* 3. Active Family Journey Companion Banner (if a trip is running) */}
      {activeJourney && (
        <ActiveJourneyBanner
          journey={activeJourney}
          onUpdateJourney={handleUpdateJourney}
          onEndJourney={handleEndJourney}
        />
      )}

      {/* 4. Main Body: Split Desktop & Floating Mobile Experience */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Desktop Left Drawer (Visible on lg+) */}
        <aside className="hidden lg:flex w-[460px] xl:w-[480px] h-full flex-col z-20 shrink-0 glass-pearl border-r border-white/80 shadow-glass-pearl overflow-hidden">
          {activeTab === 'route' && (
            <RoutePlanner
              origin={origin}
              destination={destination}
              originName={originName}
              destinationName={destinationName}
              onSetOrigin={(c, name) => {
                setOrigin(c);
                setOriginName(name);
              }}
              onSetDestination={(c, name) => {
                setDestination(c);
                setDestinationName(name);
              }}
              routes={routes}
              selectedRouteIndex={selectedRouteIndex}
              onSelectRouteIndex={setSelectedRouteIndex}
              isLoadingRoutes={isLoadingRoutes}
              onFetchRoutes={handleCalculateRoutes}
              preferences={preferences}
              onUpdatePreferences={(p) => {
                setPreferences(p);
                StorageRepository.savePreferences(p);
              }}
              onOpenRouteDetails={setInspectedRoute}
              onStartJourneyWithRoute={(r) => {
                setInspectedRoute(null);
                setIsJourneyModalOpen(true);
              }}
            />
          )}

          {activeTab === 'facilities' && (
            <FacilitiesView
              facilities={facilities}
              currentLocation={currentLocation || origin}
              onSetAsDestination={handleSetFacilityAsDestination}
            />
          )}

          {activeTab === 'reports' && (
            <ReportList
              reports={reports}
              onUpvoteReport={handleUpvoteReport}
              onFlagReport={handleFlagReport}
              onResolveReport={handleResolveReport}
              onOpenReportModal={() => {
                setReportModalCoords(mapCenter);
                setIsReportModalOpen(true);
              }}
            />
          )}

          {activeTab === 'family' && (
            <FamilyTripsView
              activeJourney={activeJourney}
              trustedContacts={trustedContacts}
              onOpenStartJourneyModal={() => setIsJourneyModalOpen(true)}
              onEndJourney={handleEndJourney}
              onOpenAddContact={() => setIsJourneyModalOpen(true)}
            />
          )}

          {activeTab === 'civic' && (
            <CivicInsightsView
              streetlights={streetlights}
              reports={reports}
              facilities={facilities}
              transportStops={transportStops}
              onSelectCoordinate={(coords) => {
                setMapCenter(coords);
                setActiveTab('map');
              }}
            />
          )}

          {activeTab === 'map' && (
            <div className="p-6 flex flex-col h-full bg-brand-bg text-brand-text space-y-4">
              <div className="p-4 rounded-2xl bg-white border border-brand-border shadow-card space-y-2">
                <span className="text-[11px] font-bold text-teal-600 uppercase tracking-wider">
                  Full Canvas Map Mode
                </span>
                <h3 className="font-black text-base text-brand-text">Explore Ground Telemetry</h3>
                <p className="text-xs text-brand-text-secondary leading-relaxed font-medium">
                  Use the floating layer controls in the top right corner of the map to toggle
                  Streetlight status, Community Reports, Facilities, and Transit Stops.
                </p>
              </div>

              <button
                onClick={() => setActiveTab('route')}
                className="py-3 px-5 rounded-full bg-teal-500 hover:bg-teal-600 text-white font-bold text-xs uppercase tracking-wider shadow-sm transition-all"
              >
                Return to Route Planner
              </button>
            </div>
          )}
        </aside>

        {/* Mobile Floating Sheet (Visible on <lg when activeTab !== 'map') */}
        {activeTab !== 'map' && (
          <div
            className={`lg:hidden fixed left-0 right-0 z-30 transition-all duration-300 ease-out flex flex-col ${
              isMobileSheetMinimized
                ? 'bottom-24 h-13 mx-3.5 rounded-full glass-crystal border border-white/95 shadow-glass-floating justify-center overflow-hidden'
                : 'bottom-0 max-h-[82vh] h-auto glass-sheet rounded-t-[32px] shadow-glass-floating border-t border-x border-white/95'
            }`}
          >
            {/* When Minimized: Compact Pill */}
            {isMobileSheetMinimized ? (
              <div
                onClick={() => setIsMobileSheetMinimized(false)}
                className="w-full h-full flex items-center justify-between px-4 cursor-pointer hover:bg-white/80 transition-colors"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-6 h-6 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center border border-teal-200 shrink-0">
                    <Navigation className="w-3.5 h-3.5 text-teal-600" />
                  </div>
                  <span className="text-xs font-bold text-brand-text truncate">
                    {activeTab === 'route' &&
                      (originName
                        ? `${originName.split(' ')[0]} → ${destinationName ? destinationName.split(' ')[0] : 'Destination'}`
                        : 'Plan Safe Journey')}
                    {activeTab === 'facilities' && 'Browse Nearby Facilities'}
                    {activeTab === 'reports' && 'Community Observations'}
                    {activeTab === 'family' && 'Family Companion Status'}
                    {activeTab === 'civic' && 'Civic Ward Telemetry'}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-[11px] font-bold text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200/80 shrink-0 shadow-xs">
                  <span>Open Planner</span>
                  <ChevronUp className="w-3.5 h-3.5" />
                </div>
              </div>
            ) : (
              <>
                {/* Sheet Drag / Toggle Handle */}
                <div
                  onClick={() => setIsMobileSheetMinimized(true)}
                  className="w-full pt-3 pb-2 flex flex-col items-center justify-center cursor-pointer select-none shrink-0 group"
                >
                  <div className="w-12 h-1.5 rounded-full bg-slate-300/80 mb-1 group-hover:bg-teal-500 transition-colors" />
                  <div className="flex items-center justify-between w-full px-5 pt-0.5">
                    <span className="text-xs font-black text-brand-text uppercase tracking-wider flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
                      {activeTab === 'route' && 'Safe Journey Planner'}
                      {activeTab === 'facilities' && 'Nearby Essential Facilities'}
                      {activeTab === 'reports' && 'Verified Community Reports'}
                      {activeTab === 'family' && 'Family Journey Companion'}
                      {activeTab === 'civic' && 'Civic Infrastructure Insights'}
                    </span>
                    <button
                      type="button"
                      className="text-brand-text-secondary p-1 rounded-full hover:bg-teal-50/80 transition-colors"
                      aria-label="Minimize sheet"
                    >
                      <ChevronDown className="w-4 h-4 text-brand-text-muted" />
                    </button>
                  </div>
                </div>

                {/* Mobile Sheet Content */}
                <div className="flex-1 overflow-y-auto overscroll-contain pb-24 px-3 sm:px-5">
                {activeTab === 'route' && (
                  <RoutePlanner
                    origin={origin}
                    destination={destination}
                    originName={originName}
                    destinationName={destinationName}
                    onSetOrigin={(c, name) => {
                      setOrigin(c);
                      setOriginName(name);
                    }}
                    onSetDestination={(c, name) => {
                      setDestination(c);
                      setDestinationName(name);
                    }}
                    routes={routes}
                    selectedRouteIndex={selectedRouteIndex}
                    onSelectRouteIndex={setSelectedRouteIndex}
                    isLoadingRoutes={isLoadingRoutes}
                    onFetchRoutes={handleCalculateRoutes}
                    preferences={preferences}
                    onUpdatePreferences={(p) => {
                      setPreferences(p);
                      StorageRepository.savePreferences(p);
                    }}
                    onOpenRouteDetails={setInspectedRoute}
                    onStartJourneyWithRoute={(r) => {
                      setInspectedRoute(null);
                      setIsJourneyModalOpen(true);
                    }}
                  />
                )}

                {activeTab === 'facilities' && (
                  <FacilitiesView
                    facilities={facilities}
                    currentLocation={currentLocation || origin}
                    onSetAsDestination={handleSetFacilityAsDestination}
                  />
                )}

                {activeTab === 'reports' && (
                  <ReportList
                    reports={reports}
                    onUpvoteReport={handleUpvoteReport}
                    onFlagReport={handleFlagReport}
                    onResolveReport={handleResolveReport}
                    onOpenReportModal={() => {
                      setReportModalCoords(mapCenter);
                      setIsReportModalOpen(true);
                    }}
                  />
                )}

                {activeTab === 'family' && (
                  <FamilyTripsView
                    activeJourney={activeJourney}
                    trustedContacts={trustedContacts}
                    onOpenStartJourneyModal={() => setIsJourneyModalOpen(true)}
                    onEndJourney={handleEndJourney}
                    onOpenAddContact={() => setIsJourneyModalOpen(true)}
                  />
                )}

                {activeTab === 'civic' && (
                  <CivicInsightsView
                    streetlights={streetlights}
                    reports={reports}
                    facilities={facilities}
                    transportStops={transportStops}
                    onSelectCoordinate={(coords) => {
                      setMapCenter(coords);
                      setActiveTab('map');
                    }}
                  />
                )}
              </div>
            </>
          )}
        </div>
      )}

        {/* Interactive Map Canvas (Always Mounted and Visible) */}
        <main className="flex-1 h-full relative z-10 overflow-hidden">
          <LeafletMap
            center={mapCenter}
            origin={origin}
            destination={destination}
            originName={originName}
            destinationName={destinationName}
            routes={routes}
            selectedRouteIndex={selectedRouteIndex}
            onSelectRouteIndex={setSelectedRouteIndex}
            streetlights={streetlights}
            reports={reports}
            facilities={facilities}
            transportStops={transportStops}
            onMapClick={handleMapClick}
            onSetAsDestination={handleSetFacilityAsDestination}
            onUpvoteReport={handleUpvoteReport}
            onFlagReport={handleFlagReport}
            onResolveReport={handleResolveReport}
            onRequestSubmitReportAtCenter={() => {
              setReportModalCoords(mapCenter);
              setIsReportModalOpen(true);
            }}
          />
        </main>
      </div>

      {/* 5. Floating Mobile Bottom Dock */}
      <MobileNav
        activeTab={activeTab}
        onSelectTab={(tab) => {
          setActiveTab(tab);
          setIsMobileSheetMinimized(false);
        }}
        hasActiveJourney={Boolean(activeJourney && activeJourney.status !== 'arrived')}
      />

      {/* 6. Modals & Overlays */}
      {/* Route Context Factor-by-factor Breakdown */}
      <RouteContextDrawer
        route={inspectedRoute}
        onClose={() => setInspectedRoute(null)}
        onStartJourney={(r) => {
          setInspectedRoute(null);
          setIsJourneyModalOpen(true);
        }}
      />

      {/* Emergency SOS High-Priority Modal */}
      <EmergencyModal
        isOpen={isEmergencyModalOpen}
        onClose={() => setIsEmergencyModalOpen(false)}
        currentLocation={currentLocation || origin}
        trustedContacts={trustedContacts}
      />

      {/* Community Report Submission Modal */}
      <ReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        defaultCoords={reportModalCoords}
        onSubmitReport={handleReportSubmitted}
        onSubmitStreetlight={handleStreetlightSubmitted}
      />

      {/* Family Journey Start Modal */}
      <FamilyJourneyModal
        isOpen={isJourneyModalOpen}
        onClose={() => setIsJourneyModalOpen(false)}
        origin={origin}
        destination={destination}
        originName={originName}
        destinationName={destinationName}
        selectedRoute={routes[selectedRouteIndex] || null}
        trustedContacts={trustedContacts}
        onAddContact={handleAddContact}
        onStartJourney={handleStartJourney}
      />

      {/* Settings & Preferences Modal */}
      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        preferences={preferences}
        onUpdatePreferences={(p) => {
          setPreferences(p);
          StorageRepository.savePreferences(p);
        }}
        onResetDemoData={handleResetDemoData}
      />
    </div>
  );
}
