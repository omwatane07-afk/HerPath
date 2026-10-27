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
import { ExploreControls } from '@/components/map/ExploreControls';
import { ChevronDown, ChevronUp, ChevronRight, Navigation, ChevronsUpDown } from 'lucide-react';

export type MobileSheetSnap = 'peek' | 'half' | 'full';

export default function HerPathHome() {
  // Navigation State with URL sync
  const [activeTab, setActiveTab] = useState<ActiveTab>('route');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get('tab') as ActiveTab;
      if (tabParam && ['route', 'map', 'facilities', 'reports', 'family', 'civic'].includes(tabParam)) {
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
    // Snap to half when switching modules on mobile
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
          // Graceful handling without alert
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

  // Map Click Handler
  const handleMapClick = (coords: Coordinates) => {
    setReportModalCoords(coords);
  };

  // Facility "Get Directions" trigger
  const handleSetFacilityAsDestination = (coords: Coordinates, name: string) => {
    setDestination(coords);
    setDestinationName(name);
    handleSelectTab('route');
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
    <div className="flex flex-col h-screen w-full max-w-full overflow-hidden bg-paper text-ink font-sans">
      {/* 1. Global Header */}
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

      {/* 2. Educational Transparency Banner (Dismissible first-use) */}
      <TrustBanner />

      {/* 3. Active Family Journey Companion Banner */}
      {activeJourney && (
        <ActiveJourneyBanner
          journey={activeJourney}
          onUpdateJourney={handleUpdateJourney}
          onEndJourney={handleEndJourney}
        />
      )}

      {/* 4. Main Body Workspace: Framed Luxury Atelier & Atlas */}
      <div className="flex-1 flex overflow-hidden relative p-0 lg:p-3 xl:p-4 lg:gap-3 xl:gap-4 bg-canvas">
        {/* Desktop Left Atelier Panel (Curved luxury atelier desk, hidden in 'map' mode) */}
        {activeTab !== 'map' && (
          <aside className="hidden lg:flex w-[420px] xl:w-[450px] h-full flex-col z-20 shrink-0 bg-white/98 backdrop-blur-md border border-border-gold/50 rounded-atelier shadow-atelier overflow-hidden">
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

        {/* Mobile 3-Snap Bottom Sheet (Visible on <lg when activeTab !== 'map') */}
        {activeTab !== 'map' && (
          <section
            aria-label="Module Content Sheet"
            className={`lg:hidden fixed left-0 right-0 z-30 transition-all duration-280 ease-standard flex flex-col bg-white/98 backdrop-blur-md border-t border-border-gold/50 shadow-atelier ${
              sheetSnap === 'peek'
                ? 'bottom-[68px] h-20 rounded-t-[28px] overflow-hidden'
                : sheetSnap === 'half'
                ? 'bottom-[68px] h-[52vh] rounded-t-[28px]'
                : 'bottom-[68px] h-[86vh] rounded-t-[28px]'
            }`}
          >
            {/* Sheet Handle & Height Controls (touch + keyboard accessible) */}
            <div
              onClick={cycleSheetSnap}
              className="w-full pt-2.5 pb-2 flex flex-col items-center justify-center cursor-pointer select-none shrink-0 border-b border-border/60 bg-canvas/80 hover:bg-canvas transition-colors"
            >
              <div className="w-10 h-1.5 rounded-full bg-border-strong mb-1.5" />
              <div className="flex items-center justify-between w-full px-4">
                <span className="text-xs font-editorial font-bold text-bordeaux flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-rose-gold" />
                  {activeTab === 'route' && 'Plan Journey'}
                  {activeTab === 'facilities' && 'Nearby Facilities'}
                  {activeTab === 'reports' && 'Community Reports'}
                  {activeTab === 'family' && 'Family Journey'}
                  {activeTab === 'civic' && 'Civic Infrastructure'}
                </span>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    cycleSheetSnap();
                  }}
                  className="p-1 rounded-lg text-text-secondary hover:text-bordeaux flex items-center gap-1 text-[11px] font-medium"
                  aria-label="Toggle sheet height"
                >
                  <span>{sheetSnap === 'peek' ? 'Expand' : sheetSnap === 'half' ? 'Full view' : 'Minimize'}</span>
                  <ChevronsUpDown className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Mobile Sheet Content */}
            <div className="flex-1 overflow-y-auto overscroll-contain pb-6 px-3 sm:px-4">
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
          </section>
        )}

        {/* Interactive Map Canvas (Framed Luxury Atlas) */}
        <main className="flex-1 h-full relative z-10 overflow-hidden lg:rounded-atelier border-0 lg:border border-border-gold/40 shadow-none lg:shadow-atelier">
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

          {/* Full-canvas Explore Map Controls (When activeTab === 'map') */}
          {activeTab === 'map' && (
            <ExploreControls
              streetlights={streetlights}
              facilities={facilities}
              reports={reports}
              transportStops={transportStops}
              onSetAsDestination={handleSetFacilityAsDestination}
              onRequestReport={(coords) => {
                setReportModalCoords(coords);
                setIsReportModalOpen(true);
              }}
              onCenterMap={setMapCenter}
            />
          )}
        </main>
      </div>

      {/* 5. Mobile Bottom Dock */}
      <MobileNav
        activeTab={activeTab}
        onSelectTab={handleSelectTab}
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

      {/* Emergency SOS Dedicated Modal */}
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
        onOpenEmergency={() => setIsEmergencyModalOpen(true)}
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

      {/* Settings & Privacy Modal */}
      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        preferences={preferences}
        onUpdatePreferences={(p) => {
          setPreferences(p);
          StorageRepository.savePreferences(p);
        }}
        onResetDemoData={handleResetDemoData}
        trustedContacts={trustedContacts}
      />
    </div>
  );
}
