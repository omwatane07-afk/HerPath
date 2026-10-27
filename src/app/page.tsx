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
} from '@/lib/mock-data';
import { defaultRouteProvider } from '@/services/routing-service';
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

export default function HerPathHome() {
  // Navigation State
  const [activeTab, setActiveTab] = useState<ActiveTab>('route');

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
  const [routes, setRoutes] = useState<RouteOption[]>([]);
  const [selectedRouteIndex, setSelectedRouteIndex] = useState<number>(0);
  const [isLoadingRoutes, setIsLoadingRoutes] = useState<boolean>(false);
  const [inspectedRoute, setInspectedRoute] = useState<RouteOption | null>(null);

  // Modal States
  const [isEmergencyModalOpen, setIsEmergencyModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isJourneyModalOpen, setIsJourneyModalOpen] = useState(false);
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

  // Compute initial routes on first mount
  useEffect(() => {
    handleCalculateRoutes();
  }, [handleCalculateRoutes]);

  // Map Click Handler
  const handleMapClick = (coords: Coordinates) => {
    // If destination not set or user clicked, allow placing report at position
    setReportModalCoords(coords);
  };

  // Facility "Get Directions" trigger
  const handleSetFacilityAsDestination = (coords: Coordinates, name: string) => {
    setDestination(coords);
    setDestinationName(name);
    setActiveTab('route');
    // Recalculate routes immediately
    setTimeout(() => {
      handleCalculateRoutes();
    }, 100);
  };

  // Report Actions
  const handleReportSubmitted = (newReport: CommunityReport) => {
    StorageRepository.saveReport(newReport);
    loadData();
    // Re-evaluate routes with new report in mind
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
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-navy-950 font-sans">
      {/* 1. Header with Brand & Navigation */}
      <Header
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenEmergency={() => setIsEmergencyModalOpen(true)}
        onOpenReportModal={() => {
          setReportModalCoords(mapCenter);
          setIsReportModalOpen(true);
        }}
        onResetDemoData={handleResetDemoData}
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

      {/* 4. Main Body: Responsive Split-Pane Interface */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Drawer / Panel (Collapsible / Dynamic on Mobile) */}
        <aside
          className={`w-full lg:w-[460px] xl:w-[480px] h-full flex flex-col z-20 shrink-0 transition-all ${
            activeTab === 'map' ? 'hidden lg:flex' : 'flex'
          }`}
        >
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
            <div className="p-4 flex flex-col h-full bg-navy-900 border-r border-slate-800 text-slate-100 space-y-4">
              <h3 className="font-bold text-sm text-white">Full-Screen Exploration Mode</h3>
              <p className="text-xs text-slate-300">
                You are currently exploring the interactive map. Use the floating layer controls in
                the top right to toggle Streetlights, Community Reports, Facilities, and Transit
                Stops.
              </p>
              <button
                onClick={() => setActiveTab('route')}
                className="py-2.5 px-4 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs uppercase tracking-wider"
              >
                Return to Route Planner
              </button>
            </div>
          )}
        </aside>

        {/* Right Canvas: Interactive Map */}
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

      {/* 5. Mobile Bottom Navigation */}
      <MobileNav
        activeTab={activeTab}
        onSelectTab={setActiveTab}
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
    </div>
  );
}
