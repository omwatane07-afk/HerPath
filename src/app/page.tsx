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
  WeatherContext,
} from '@/types';
import { StorageRepository, DEFAULT_PREFERENCES } from '@/lib/storage';
import { fetchCurrentWeather } from '@/services/weather-service';
import {
  DEMO_PRESET_ORIGINS,
  DEMO_PRESET_DESTINATIONS,
  INITIAL_STREETLIGHTS,
  INITIAL_REPORTS,
  INITIAL_FACILITIES,
  INITIAL_TRANSPORT_STOPS,
} from '@/lib/mock-data';
import { defaultRouteProvider } from '@/services/routing-service';
import { evaluateRoutes } from '@/services/route-context-engine';
import { Header, ActiveTab } from '@/components/layout/Header';
import { MobileNav } from '@/components/layout/MobileNav';
import { LeafletMap } from '@/components/map/LeafletMap';
import { RoutePlanner } from '@/components/route/RoutePlanner';
import { ActiveNavigationPanel } from '@/components/route/ActiveNavigationPanel';
import { RouteContextDrawer } from '@/components/route/RouteContextDrawer';
import { ReportModal } from '@/components/reports/ReportModal';
import { ReportList } from '@/components/reports/ReportList';
import { FacilitiesView } from '@/components/facilities/FacilitiesView';
import { FamilyJourneyModal } from '@/components/journey/FamilyJourneyModal';
import { FamilyTripsView } from '@/components/journey/FamilyTripsView';
import { ActiveJourneyBanner } from '@/components/journey/ActiveJourneyBanner';
import { EmergencyModal } from '@/components/emergency/EmergencyModal';
import { SosTripleTapButton } from '@/components/emergency/SosTripleTapButton';
import { SOSService } from '@/services/sos-service';
import { CivicInsightsView } from '@/components/civic/CivicInsightsView';
import { SettingsModal } from '@/components/settings/SettingsModal';
import { ExploreControls } from '@/components/map/ExploreControls';
import { OnboardingModal } from '@/components/ui/OnboardingModal';
import { ChevronDown, ChevronUp, ChevronRight, PhoneCall, ChevronsUpDown } from 'lucide-react';

export type MobileSheetSnap = 'peek' | 'half' | 'full';

export default function HerPathHome() {
  // Navigation State with URL synchronization
  const [activeTab, setActiveTab] = useState<ActiveTab>('route');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get('tab') as ActiveTab;
      if (
        tabParam &&
        ['route', 'map', 'facilities', 'reports', 'family', 'civic'].includes(tabParam)
      ) {
        setActiveTab(tabParam);
      }
    }
  }, []);

  const handleSelectTab = (tab: ActiveTab) => {
    setActiveTab(tab);
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('tab', tab);
      window.history.replaceState(null, '', url.toString());
    }
    setSheetSnap('half');
  };

  // Mobile Bottom Sheet 3-Snap Height State (peek ~80px, half ~50vh, full ~88vh)
  const [sheetSnap, setSheetSnap] = useState<MobileSheetSnap>('half');

  const cycleSheetSnap = () => {
    setSheetSnap((prev) => {
      if (prev === 'peek') return 'half';
      if (prev === 'half') return 'full';
      return 'peek';
    });
  };

  // Map and Route Coordinates: Default fallback to Pune, Maharashtra (18.5204° N, 73.8567° E)
  const [mapCenter, setMapCenter] = useState<Coordinates>({ lat: 18.5204, lng: 73.8567 });
  const [origin, setOrigin] = useState<Coordinates | null>(null);
  const [originName, setOriginName] = useState<string>('');
  const [destination, setDestination] = useState<Coordinates | null>(null);
  const [destinationName, setDestinationName] = useState<string>('');

  // User Current Location & Live Navigation
  const [currentLocation, setCurrentLocation] = useState<Coordinates | null>(null);
  const [locationAccuracy, setLocationAccuracy] = useState<number | null>(null);
  const [isNavigatingLive, setIsNavigatingLive] = useState<boolean>(false);
  const [navigatingRoute, setNavigatingRoute] = useState<RouteOption | null>(null);

  // Domain Entities from Local Repository
  const [streetlights, setStreetlights] = useState<StreetlightSegment[]>([]);
  const [reports, setReports] = useState<CommunityReport[]>([]);
  const [facilities, setFacilities] = useState<EssentialFacility[]>([]);
  const [transportStops, setTransportStops] = useState<TransportStop[]>([]);
  const [activeJourney, setActiveJourney] = useState<JourneySession | null>(null);
  const [trustedContacts, setTrustedContacts] = useState<TrustedContact[]>([]);
  const [preferences, setPreferences] = useState<RoutePreferences>(DEFAULT_PREFERENCES);

  // Routing State: Starts clean without artificial hardcoded paths
  const [routes, setRoutes] = useState<RouteOption[]>([]);
  const [selectedRouteIndex, setSelectedRouteIndex] = useState<number>(0);
  const [isLoadingRoutes, setIsLoadingRoutes] = useState<boolean>(false);
  const [routingError, setRoutingError] = useState<string | null>(null);
  const [inspectedRoute, setInspectedRoute] = useState<RouteOption | null>(null);

  // Live Weather Telemetry State (OpenWeatherMap)
  const [weather, setWeather] = useState<WeatherContext | null>(null);
  const [isLoadingWeather, setIsLoadingWeather] = useState<boolean>(false);

  // Fetch live weather when origin coordinates change
  useEffect(() => {
    if (origin) {
      let active = true;
      setIsLoadingWeather(true);
      fetchCurrentWeather(origin)
        .then((w) => {
          if (active) setWeather(w);
        })
        .finally(() => {
          if (active) setIsLoadingWeather(false);
        });
      return () => {
        active = false;
      };
    }
  }, [origin?.lat, origin?.lng]);

  // Modal States
  const [isEmergencyModalOpen, setIsEmergencyModalOpen] = useState(false);
  const [emergencyTriggerMethod, setEmergencyTriggerMethod] = useState<'triple_tap' | 'quick_action'>('triple_tap');
  const [isSosTestMode, setIsSosTestMode] = useState<boolean>(() => SOSService.isTestMode());
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isJourneyModalOpen, setIsJourneyModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [reportModalCoords, setReportModalCoords] = useState<Coordinates>(mapCenter);

  const handleOpenEmergency = (method: 'triple_tap' | 'quick_action' = 'quick_action') => {
    setEmergencyTriggerMethod(method);
    setIsEmergencyModalOpen(true);
  };

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

    try {
      const completed = localStorage.getItem('herpath_onboarding_completed');
      if (!completed) {
        setIsOnboardingOpen(true);
      }
    } catch {
      // storage unavailable
    }

    if (typeof window !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setCurrentLocation(coords);
          setLocationAccuracy(Math.round(pos.coords.accuracy));
        },
        () => {},
        { timeout: 6000, enableHighAccuracy: false }
      );
    }

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key && e.key.startsWith('herpath_')) {
        loadData();
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [loadData]);

  // Route Calculation Handler
  const handleCalculateRoutes = useCallback(async () => {
    if (!origin || !destination) return;

    setIsLoadingRoutes(true);
    setRoutingError(null);
    try {
      const rawRoutes = await defaultRouteProvider.fetchRoutes(origin, destination);

      if (!rawRoutes || rawRoutes.length === 0) {
        throw new Error('No pedestrian route could be found connecting these locations. Please choose points nearer to mapped roads or walking paths.');
      }

      const evaluated = evaluateRoutes(rawRoutes, {
        streetlights,
        reports,
        facilities,
        transportStops,
        preferences,
      });

      setRoutes(evaluated);
      setSelectedRouteIndex(0);
    } catch (err) {
      console.error('Pedestrian routing error:', err);
      const message = err instanceof Error ? err.message : 'Unable to calculate a pedestrian route between these locations.';
      setRoutingError(message);
      setRoutes([]);
    } finally {
      setIsLoadingRoutes(false);
    }
  }, [origin, destination, streetlights, reports, facilities, transportStops, preferences]);

  // Destination selection from Facilities or Map clicks
  const handleSetFacilityAsDestination = (coords: Coordinates, name: string) => {
    setDestination(coords);
    setDestinationName(name);
    setRoutingError(null);
    setRoutes([]);
    handleSelectTab('route');
  };

  // Community Report Interaction Handlers
  const handleUpvoteReport = (id: string) => {
    StorageRepository.upvoteReport(id);
    loadData();
  };

  const handleFlagReport = (id: string) => {
    StorageRepository.flagReport(id);
    loadData();
  };

  const handleFlagReportWithDetails = (id: string, reason: any, details?: string) => {
    StorageRepository.flagReportWithDetails(id, reason, details);
    loadData();
  };

  const handleTransitionStatus = (id: string, newStatus: any, note?: string) => {
    StorageRepository.transitionReportStatus(
      id,
      newStatus,
      { role: 'reviewer', name: 'Authorized Civic Reviewer' },
      note
    );
    loadData();
  };

  const handleResolveReport = (id: string) => {
    StorageRepository.resolveReport(id);
    loadData();
  };

  // Dynamically refresh route context whenever reports or streetlights change
  useEffect(() => {
    if (routes.length > 0) {
      try {
        const rawList = routes.map((r) => ({
          source: (r as any).source || 'osrm',
          distanceMeters: r.distanceMeters,
          durationSeconds: r.durationSeconds,
          coordinates: r.coordinates,
          summary: r.summary,
          steps: r.steps,
        }));
        const reEvaluated = evaluateRoutes(rawList, {
          streetlights,
          reports,
          facilities,
          transportStops,
          preferences,
        });
        setRoutes(reEvaluated);
      } catch {
        // silent fallback
      }
    }
  }, [reports, streetlights]);

  // Family Journey Handlers
  const handleUpdateJourney = (journey: JourneySession) => {
    StorageRepository.saveActiveJourney(journey);
    setActiveJourney(journey);
  };

  const handleEndJourney = () => {
    StorageRepository.saveActiveJourney(null);
    setActiveJourney(null);
  };

  return (
    <div className="flex flex-col h-screen w-full max-w-full overflow-hidden bg-canvas text-ink font-sans">
      {/* 1. Global Header (56px compact ink bar with info popover & SOS) */}
      <Header
        activeTab={activeTab}
        onSelectTab={handleSelectTab}
        onOpenEmergency={handleOpenEmergency}
        onOpenReportModal={() => {
          setReportModalCoords(mapCenter);
          setIsReportModalOpen(true);
        }}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
        onOpenOnboarding={() => setIsOnboardingOpen(true)}
        hasActiveJourney={Boolean(activeJourney && activeJourney.status !== 'arrived')}
        isTestMode={isSosTestMode}
      />

      {/* 2. Main Full-Bleed Map Canvas with Floating Left Desk */}
      <main className="flex-1 w-full h-[calc(100vh-56px)] relative overflow-hidden">
        {/* Full-Bleed Map Layer (Leaflet 2D + Optional MapLibre 3D City) */}
        <div className="absolute inset-0 w-full h-full z-0">
          <LeafletMap
            center={mapCenter}
            origin={origin}
            destination={destination}
            originName={originName}
            destinationName={destinationName}
            currentLocation={currentLocation}
            locationAccuracy={locationAccuracy}
            routes={routes}
            selectedRouteIndex={selectedRouteIndex}
            onSelectRouteIndex={setSelectedRouteIndex}
            streetlights={streetlights}
            reports={reports}
            facilities={facilities}
            transportStops={transportStops}
            onMapClick={(coords) => setMapCenter(coords)}
            onSetAsDestination={handleSetFacilityAsDestination}
            onUpvoteReport={handleUpvoteReport}
            onFlagReport={handleFlagReport}
            onResolveReport={handleResolveReport}
            onRequestSubmitReportAtCenter={() => {
              setReportModalCoords(mapCenter);
              setIsReportModalOpen(true);
            }}
          />
        </div>

        {/* Explore Mode Full-Screen Controls (Visible only in 'map' mode) */}
        {activeTab === 'map' && (
          <ExploreControls
            streetlights={streetlights}
            facilities={facilities}
            reports={reports}
            transportStops={transportStops}
            onCenterMap={(coords: Coordinates) => setMapCenter(coords)}
            onSetAsDestination={handleSetFacilityAsDestination}
            onRequestReport={(coords: Coordinates) => {
              setReportModalCoords(coords);
              setIsReportModalOpen(true);
            }}
          />
        )}

        {/* Desktop Left Floating Panel (440px wide, 16px inset, 24px radius, glassmorphism) */}
        {activeTab !== 'map' && (
          <aside className="hidden lg:flex absolute top-4 left-4 bottom-4 w-[440px] z-20 flex-col bg-white/95 backdrop-blur-xl border border-slate-200/80 rounded-[24px] shadow-xl overflow-hidden">
            {isNavigatingLive && navigatingRoute ? (
              <ActiveNavigationPanel
                route={navigatingRoute}
                onEndNavigation={() => {
                  setIsNavigatingLive(false);
                  setNavigatingRoute(null);
                }}
                onRecenterMap={(coords) => setMapCenter(coords)}
                onUserLocationUpdate={(coords) => setCurrentLocation(coords)}
                nearbyReports={reports}
              />
            ) : (
              <>
                {/* Active Journey Banner shown ONLY in Family module to preserve vertical space */}
                {activeTab === 'family' && activeJourney && activeJourney.status !== 'arrived' && (
                  <ActiveJourneyBanner
                    journey={activeJourney}
                    onUpdateJourney={handleUpdateJourney}
                    onEndJourney={handleEndJourney}
                  />
                )}

                {activeTab === 'route' && (
                  <RoutePlanner
                    origin={origin}
                    destination={destination}
                    originName={originName}
                    destinationName={destinationName}
                    onSetOrigin={(c, name) => {
                      setOrigin(c);
                      setOriginName(name);
                      setRoutingError(null);
                      setRoutes([]);
                    }}
                    onSetDestination={(c, name) => {
                      setDestination(c);
                      setDestinationName(name);
                      setRoutingError(null);
                      setRoutes([]);
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
                    onStartLiveNavigation={(r) => {
                      setNavigatingRoute(r);
                      setIsNavigatingLive(true);
                    }}
                    weather={weather}
                    isLoadingWeather={isLoadingWeather}
                    routingError={routingError}
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
                    onTransitionStatus={handleTransitionStatus}
                    onFlagReportWithDetails={handleFlagReportWithDetails}
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
                      handleSelectTab('map');
                    }}
                  />
                )}
              </>
            )}
          </aside>
        )}

        {/* Mobile 3-Snap Bottom Sheet (peek ~80px, half ~50vh, full ~88vh) */}
        {activeTab !== 'map' && (
          <div
            className={`lg:hidden fixed left-0 right-0 bottom-0 z-30 bg-white/95 backdrop-blur-xl rounded-t-[28px] border-t border-slate-200/90 shadow-[0_-8px_30px_rgba(15,23,42,0.08)] flex flex-col transition-all duration-300 ease-out ${
              sheetSnap === 'peek'
                ? 'h-24'
                : sheetSnap === 'half'
                ? 'h-[52vh]'
                : 'h-[88vh]'
            }`}
          >
            {/* Sheet Handle */}
            <div
              onClick={cycleSheetSnap}
              className="w-full py-2.5 flex flex-col items-center justify-center cursor-pointer select-none shrink-0"
              role="button"
              tabIndex={0}
              aria-label={`Current sheet height: ${sheetSnap}. Tap to toggle snap height.`}
            >
              <div className="w-12 h-1.5 bg-slate-300 rounded-full mb-1" />
              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-600">
                <span className="capitalize">{activeTab}</span>
                <ChevronsUpDown className="w-3 h-3 text-slate-400" />
              </div>
            </div>

            {/* Sheet Body */}
            <div className="flex-1 overflow-y-auto pb-28 pb-safe overscroll-contain">
              {isNavigatingLive && navigatingRoute ? (
                <ActiveNavigationPanel
                  route={navigatingRoute}
                  onEndNavigation={() => {
                    setIsNavigatingLive(false);
                    setNavigatingRoute(null);
                  }}
                  onRecenterMap={(coords) => setMapCenter(coords)}
                  onUserLocationUpdate={(coords) => setCurrentLocation(coords)}
                  nearbyReports={reports}
                />
              ) : (
                <>
                  {activeTab === 'family' && activeJourney && activeJourney.status !== 'arrived' && (
                    <ActiveJourneyBanner
                      journey={activeJourney}
                      onUpdateJourney={handleUpdateJourney}
                      onEndJourney={handleEndJourney}
                    />
                  )}

                  {activeTab === 'route' && (
                    <RoutePlanner
                      origin={origin}
                      destination={destination}
                      originName={originName}
                      destinationName={destinationName}
                      onSetOrigin={(c, name) => {
                        setOrigin(c);
                        setOriginName(name);
                        setRoutingError(null);
                        setRoutes([]);
                      }}
                      onSetDestination={(c, name) => {
                        setDestination(c);
                        setDestinationName(name);
                        setRoutingError(null);
                        setRoutes([]);
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
                      onStartLiveNavigation={(r) => {
                        setNavigatingRoute(r);
                        setIsNavigatingLive(true);
                        setSheetSnap('half');
                      }}
                      weather={weather}
                      isLoadingWeather={isLoadingWeather}
                      routingError={routingError}
                      onExpandSheet={() => setSheetSnap('full')}
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
                      onTransitionStatus={handleTransitionStatus}
                      onFlagReportWithDetails={handleFlagReportWithDetails}
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
                        handleSelectTab('map');
                      }}
                    />
                  )}
                </>
              )}
            </div>
          </div>
        )}

        {/* Fixed Isolated Floating SOS Triple-Tap Jewel (Bottom-Right) */}
        <SosTripleTapButton
          variant="floating"
          onTriggerSOS={(method) => handleOpenEmergency(method)}
          isTestMode={isSosTestMode}
        />
      </main>

      {/* 3. Mobile Navigation Dock */}
      <MobileNav
        activeTab={activeTab}
        onSelectTab={handleSelectTab}
        hasActiveJourney={Boolean(activeJourney && activeJourney.status !== 'arrived')}
      />

      {/* 4. Modals and Drawers */}
      {inspectedRoute && (
        <RouteContextDrawer
          route={inspectedRoute}
          weather={weather}
          onClose={() => setInspectedRoute(null)}
          onStartJourney={() => {
            setInspectedRoute(null);
            setIsJourneyModalOpen(true);
          }}
        />
      )}

      {isEmergencyModalOpen && (
        <EmergencyModal
          currentLocation={currentLocation || mapCenter}
          trustedContacts={trustedContacts}
          triggerMethod={emergencyTriggerMethod}
          initialTestMode={isSosTestMode}
          onClose={() => setIsEmergencyModalOpen(false)}
        />
      )}

      {isReportModalOpen && (
        <ReportModal
          isOpen={isReportModalOpen}
          defaultCoords={reportModalCoords}
          existingReports={reports}
          onSubmitReport={(newReport) => {
            StorageRepository.saveReport(newReport);
            loadData();
          }}
          onClose={() => setIsReportModalOpen(false)}
        />
      )}

      {isJourneyModalOpen && (
        <FamilyJourneyModal
          isOpen={isJourneyModalOpen}
          origin={origin}
          destination={destination}
          originName={originName}
          destinationName={destinationName}
          selectedRoute={routes[selectedRouteIndex] || null}
          trustedContacts={trustedContacts}
          onAddContact={(contact) => {
            StorageRepository.saveTrustedContact(contact);
            loadData();
          }}
          onStartJourney={(session) => {
            StorageRepository.saveActiveJourney(session);
            loadData();
            setIsJourneyModalOpen(false);
            handleSelectTab('family');
          }}
          onClose={() => setIsJourneyModalOpen(false)}
        />
      )}

      {isSettingsModalOpen && (
        <SettingsModal
          isOpen={isSettingsModalOpen}
          preferences={preferences}
          onUpdatePreferences={(p) => {
            setPreferences(p);
            StorageRepository.savePreferences(p);
          }}
          onClose={() => setIsSettingsModalOpen(false)}
          onResetDemoData={() => {
            StorageRepository.resetToDemoDefaults();
            loadData();
            setOrigin(null);
            setOriginName('');
            setDestination(null);
            setDestinationName('');
            setRoutes([]);
            setMapCenter({ lat: 18.5204, lng: 73.8567 });
          }}
        />
      )}

      {/* 5. Scrapbook Onboarding Guide */}
      <OnboardingModal
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
        onStartPlanning={() => {
          setIsOnboardingOpen(false);
          handleSelectTab('route');
        }}
      />
    </div>
  );
}
