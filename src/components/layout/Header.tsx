'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Navigation,
  MapPin,
  Building2,
  AlertTriangle,
  Users,
  Layers,
  PhoneCall,
  SlidersHorizontal,
  Compass,
  Info,
  X,
  ShieldCheck,
} from 'lucide-react';

export type ActiveTab = 'route' | 'map' | 'facilities' | 'reports' | 'family' | 'civic';

interface HeaderProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  onOpenEmergency: () => void;
  onOpenReportModal: () => void;
  onOpenSettings: () => void;
  hasActiveJourney: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onSelectTab,
  onOpenEmergency,
  onOpenReportModal,
  onOpenSettings,
  hasActiveJourney,
}) => {
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const infoRef = useRef<HTMLDivElement>(null);

  // Close info popover when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (infoRef.current && !infoRef.current.contains(event.target as Node)) {
        setIsInfoOpen(false);
      }
    }
    if (isInfoOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isInfoOpen]);

  const navItems: { id: ActiveTab; label: string; icon: React.ReactNode }[] = [
    { id: 'route', label: 'Plan Route', icon: <Navigation className="w-3.5 h-3.5" /> },
    { id: 'map', label: 'Explore', icon: <MapPin className="w-3.5 h-3.5" /> },
    { id: 'facilities', label: 'Places', icon: <Building2 className="w-3.5 h-3.5" /> },
    { id: 'reports', label: 'Reports', icon: <AlertTriangle className="w-3.5 h-3.5" /> },
    { id: 'family', label: 'Family', icon: <Users className="w-3.5 h-3.5" /> },
    { id: 'civic', label: 'Civic', icon: <Layers className="w-3.5 h-3.5" /> },
  ];

  return (
    <header className="h-14 w-full max-w-full bg-ink text-white border-b border-champagne/25 px-3 sm:px-6 flex items-center justify-between z-30 sticky top-0 shadow-e2 shrink-0">
      {/* Brand Wordmark & Compass Emblem */}
      <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
        <button
          onClick={() => onSelectTab('route')}
          className="flex items-center gap-2 text-left focus-ring-on-dark rounded-lg py-1 transition-transform active:scale-95"
          aria-label="HERPATH Home"
        >
          <div className="w-8 h-8 rounded-lg bg-ink-2 flex items-center justify-center text-champagne border border-champagne/40">
            <Compass className="w-4 h-4 stroke-[2]" />
          </div>
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="font-editorial text-xl sm:text-2xl font-bold tracking-tight text-white leading-none">
                HERPATH
              </span>
              <span className="text-[9px] uppercase font-bold tracking-widest text-champagne px-1.5 py-0.5 rounded bg-champagne/15 border border-champagne/30 hidden sm:inline">
                Nightbloom
              </span>
            </div>
            <p className="text-[9px] font-sans font-medium text-text-muted tracking-normal hidden md:block">
              Safety-Aware Navigation & Journey Companion
            </p>
          </div>
        </button>
      </div>

      {/* Six Module Navigation Tabs (Center) */}
      <nav className="hidden lg:flex items-center gap-1 bg-ink-2/80 p-1 rounded-xl border border-border-control/30" aria-label="Main Navigation">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 focus-ring-on-dark ${
                isActive
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-text-muted hover:text-white hover:bg-white/10'
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
              {item.id === 'family' && hasActiveJourney && (
                <span
                  className="w-2 h-2 rounded-full bg-champagne ml-0.5 animate-pulse"
                  title="Journey active"
                  aria-label="Journey active"
                />
              )}
            </button>
          );
        })}
      </nav>

      {/* Right Action Suite: Info Popover, Report, Settings, Dedicated Emergency SOS */}
      <div className="flex items-center gap-2 sm:gap-2.5">
        {/* Transparent Info Popover Trigger (Clears permanent top banner space) */}
        <div className="relative" ref={infoRef}>
          <button
            type="button"
            onClick={() => setIsInfoOpen(!isInfoOpen)}
            className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors focus-ring-on-dark ${
              isInfoOpen ? 'bg-primary text-white' : 'text-text-muted hover:text-white hover:bg-white/10'
            }`}
            title="How HERPATH route information works"
            aria-label="How route information works"
            aria-expanded={isInfoOpen}
          >
            <Info className="w-4 h-4" />
          </button>

          {isInfoOpen && (
            <div className="absolute right-0 top-11 w-80 sm:w-96 bg-card text-ink rounded-card border border-border shadow-e3 p-4 z-50 animate-modal">
              <div className="flex items-start justify-between gap-3 pb-2.5 border-b border-border">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-verified" />
                  <h4 className="font-editorial font-bold text-sm text-ink">How HERPATH Works</h4>
                </div>
                <button
                  type="button"
                  onClick={() => setIsInfoOpen(false)}
                  className="text-text-muted hover:text-ink p-1 rounded-md"
                  aria-label="Close information"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="pt-2.5 text-xs text-text-secondary space-y-2">
                <p>
                  HERPATH provides transparent infrastructure data (streetlights, open facilities, and community reports) to help you choose walking corridors.
                </p>
                <div className="p-2.5 rounded-md bg-canvas text-ink border border-border text-[11px] space-y-1">
                  <p className="font-semibold text-primary">Core Transparency Promises:</p>
                  <ul className="list-disc list-inside space-y-0.5 text-text-secondary">
                    <li>We <strong>never claim any route is 100% safe</strong>.</li>
                    <li>Missing data represents a municipal gap, never a neighborhood risk.</li>
                    <li>No secret tracking; your location is never sold or shared without permission.</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Quick Report Trigger */}
        <button
          onClick={onOpenReportModal}
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border-control/40 text-xs font-semibold text-white hover:bg-white/10 transition-colors focus-ring-on-dark"
          title="Contribute a streetlight or infrastructure report"
        >
          <AlertTriangle className="w-3.5 h-3.5 text-caution" />
          <span>Report</span>
        </button>

        {/* Settings Trigger */}
        <button
          onClick={onOpenSettings}
          className="w-9 h-9 rounded-lg flex items-center justify-center text-text-muted hover:text-white hover:bg-white/10 transition-colors focus-ring-on-dark"
          title="Privacy, sharing & accessibility settings"
          aria-label="Open settings"
        >
          <SlidersHorizontal className="w-4 h-4" />
        </button>

        {/* Dedicated Emergency SOS Button (Instant, un-animated, isolated control) */}
        <button
          onClick={onOpenEmergency}
          className="btn-emergency-sos h-10 px-3.5 sm:px-4 flex items-center justify-center gap-2 focus-ring-on-dark shrink-0"
          aria-label="Emergency SOS - Open immediate assistance dialer and GPS coordinates"
        >
          <PhoneCall className="w-4 h-4 text-white stroke-[2.5]" />
          <span className="font-sans font-bold text-xs sm:text-sm tracking-wider">SOS</span>
        </button>
      </div>
    </header>
  );
};
