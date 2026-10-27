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
import { ExploreControls } from '@/components/map/ExploreControls';
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

  // Routing State
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
    try {
      const rawRoutes = await defaultRouteProvider.fetchRoutes(origin, destination);

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
      console.warn('Live routing failed, falling back to synthetic alternatives:', err);
      const fallbackRaw = generateSyntheticRouteAlternatives(origin, destination);
      const fallbackEvaluated = evaluateRoutes(fallbackRaw, {
        streetlights,
        reports,
        facilities,
        transportStops,
        preferences,
      });
      setRoutes(fallbackEvaluated);
      setSelectedRouteIndex(0);
    } finally {
      setIsLoadingRoutes(false);
    }
  }, [origin, destination, streetlights, reports, facilities, transportStops, preferences]);

  // Destination selection from Facilities or Map clicks
  const handleSetFacilityAsDestination = (coords: Coordinates, name: string) => {
    setDestination(coords);
    setDestinationName(name);
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

  const handleResolveReport = (id: string) => {
    StorageRepository.resolveReport(id);
    loadData();
  };

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
        onOpenEmergency={() => setIsEmergencyModalOpen(true)}
        onOpenReportModal={() => {
          setReportModalCoords(mapCenter);
          setIsReportModalOpen(true);
        }}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
        hasActiveJourney={Boolean(activeJourney && activeJourney.status !== 'arrived')}
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

        {/* Desktop Left Floating Panel (440px wide, 16px inset, 20px radius, e2 shadow) */}
        {activeTab !== 'map' && (
          <aside className="hidden lg:flex absolute top-4 left-4 bottom-4 w-[440px] z-20 flex-col bg-card/98 backdrop-blur-md border border-border rounded-[20px] shadow-e2 overflow-hidden">
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
                  handleSelectTab('map');
                }}
              />
            )}
          </aside>
        )}

        {/* Mobile 3-Snap Bottom Sheet (peek ~80px, half ~50vh, full ~88vh) */}
        {activeTab !== 'map' && (
          <div
            className={`lg:hidden fixed left-0 right-0 bottom-0 z-30 bg-card rounded-t-[28px] border-t border-border shadow-e3 flex flex-col transition-all duration-300 ease-out ${
              sheetSnap === 'peek'
                ? 'h-24'
                : sheetSnap === 'half'
                ? 'h-[52vh]'
                : 'h-[86vh]'
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
              <div className="w-12 h-1.5 bg-border-control/40 rounded-full mb-1" />
              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-text-secondary">
                <span className="capitalize">{activeTab}</span>
                <ChevronsUpDown className="w-3 h-3 text-text-muted" />
              </div>
            </div>

            {/* Sheet Body */}
            <div className="flex-1 overflow-y-auto pb-20">
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
                    handleSelectTab('map');
                  }}
                />
              )}
            </div>
          </div>
        )}

        {/* Fixed Isolated Desktop SOS Jewel (Bottom-Right, 56x56px, #C21428 fill) */}
        <button
          onClick={() => setIsEmergencyModalOpen(true)}
          className="hidden lg:flex fixed bottom-6 right-6 z-[1000] w-14 h-14 rounded-2xl bg-emergency hover:bg-emergency-hover text-white shadow-e3 items-center justify-center flex-col gap-0.5 focus-ring-on-dark transition-transform active:scale-95"
          aria-label="Emergency SOS - Open immediate assistance dialer and GPS coordinates"
          title="Emergency SOS"
        >
          <PhoneCall className="w-5 h-5 text-white stroke-[2.5]" />
          <span className="text-[10px] font-bold tracking-wider leading-none">SOS</span>
        </button>
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
          onClose={() => setIsEmergencyModalOpen(false)}
        />
      )}

      {isReportModalOpen && (
        <ReportModal
          isOpen={isReportModalOpen}
          defaultCoords={reportModalCoords}
          onSubmitReport={(newReport) => {
            StorageRepository.saveReport(newReport);
            loadData();
            setIsReportModalOpen(false);
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
            setOrigin(DEMO_PRESET_ORIGINS[0].coordinates);
            setOriginName(DEMO_PRESET_ORIGINS[0].name);
            setDestination(DEMO_PRESET_DESTINATIONS[0].coordinates);
            setDestinationName(DEMO_PRESET_DESTINATIONS[0].name);
            handleCalculateRoutes();
          }}
        />
      )}
    </div>
  );
}
