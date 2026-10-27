'use client';

import React from 'react';
import {
  Navigation,
  MapPin,
  Building2,
  AlertTriangle,
  Users,
  Layers,
  PhoneCall,
  SlidersHorizontal,
  Plus,
  Compass,
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
  const navItems: { id: ActiveTab; label: string; icon: React.ReactNode }[] = [
    { id: 'route', label: 'Plan Route', icon: <Navigation className="w-3.5 h-3.5" /> },
    { id: 'map', label: 'Explore', icon: <MapPin className="w-3.5 h-3.5" /> },
    { id: 'facilities', label: 'Places', icon: <Building2 className="w-3.5 h-3.5" /> },
    { id: 'reports', label: 'Reports', icon: <AlertTriangle className="w-3.5 h-3.5" /> },
    { id: 'family', label: 'Family', icon: <Users className="w-3.5 h-3.5" /> },
    { id: 'civic', label: 'Civic', icon: <Layers className="w-3.5 h-3.5" /> },
  ];

  return (
    <header className="h-16 sm:h-[72px] w-full max-w-full bg-white/95 backdrop-blur-md border-b border-border px-4 sm:px-6 flex items-center justify-between text-bordeaux z-30 sticky top-0 shadow-e1">
      {/* Brand Wordmark & Editorial Crest */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={() => onSelectTab('route')}
          className="flex items-center gap-2.5 text-left focus-ring-bordeaux rounded-lg px-1.5 py-1 transition-transform active:scale-95"
          aria-label="HERPATH Home"
        >
          <div className="w-9 h-9 rounded-xl bg-bordeaux flex items-center justify-center text-champagne shadow-md border border-champagne/40">
            <Compass className="w-5 h-5 stroke-[1.75]" />
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="font-editorial text-2xl font-bold tracking-tight text-bordeaux leading-none">
                HERPATH
              </span>
              <span className="text-[10px] uppercase font-semibold tracking-widest text-champagne-dark px-1.5 py-0.5 rounded bg-champagne-tint/60 border border-champagne/30 hidden sm:inline">
                Atelier
              </span>
            </div>
            <p className="text-[10px] font-sans font-medium text-text-secondary tracking-normal hidden md:block">
              Safety-Aware Navigation & Journey Companion
            </p>
          </div>
        </button>
      </div>

      {/* Haute Editorial Navigation Tabs */}
      <nav className="hidden lg:flex items-center gap-1.5 bg-canvas/80 p-1 rounded-2xl border border-border/80" aria-label="Main Navigation">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`relative flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 focus-ring-bordeaux ${
                isActive
                  ? 'bg-bordeaux text-white shadow-md'
                  : 'text-text-secondary hover:text-bordeaux hover:bg-white/80'
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
              {item.id === 'family' && hasActiveJourney && (
                <span
                  className="w-2 h-2 rounded-full bg-rose-gold ml-0.5 animate-pulse"
                  title="Journey active"
                  aria-label="Journey active"
                />
              )}
              {/* Subtle gold accent for active item */}
              {isActive && (
                <span className="w-1 h-1 rounded-full bg-champagne ml-0.5" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Right Controls: Report, Settings, and Persistent Emergency SOS */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        <button
          onClick={onOpenReportModal}
          className="hidden sm:inline-flex items-center gap-1.5 py-2 px-3.5 rounded-xl bg-canvas hover:bg-canvas-subtle text-xs font-semibold text-bordeaux border border-border transition-all focus-ring-bordeaux"
          title="Submit a community report or streetlight condition"
        >
          <Plus className="w-3.5 h-3.5 text-rose-gold" />
          <span>Report</span>
        </button>

        <button
          onClick={onOpenSettings}
          className="p-2 sm:p-2.5 rounded-xl text-text-secondary hover:text-bordeaux hover:bg-canvas border border-transparent hover:border-border transition-colors focus-ring-bordeaux"
          title="Settings and Privacy"
          aria-label="Settings and Privacy"
        >
          <SlidersHorizontal className="w-4 h-4 text-text-secondary" />
        </button>

        {/* SOS Emergency Control - High-contrast crimson jewel with gold border */}
        <button
          onClick={onOpenEmergency}
          className="btn-emergency-sos min-w-[76px] h-11 px-4 flex items-center justify-center gap-2 text-xs font-bold border border-white/30 focus-ring-bordeaux"
          title="Open Emergency SOS"
          aria-label="Emergency SOS"
        >
          <PhoneCall className="w-4 h-4 text-white" />
          <span className="font-extrabold tracking-wider">SOS</span>
        </button>
      </div>
    </header>
  );
};
