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
    { id: 'route', label: 'Plan', icon: <Navigation className="w-4 h-4" /> },
    { id: 'map', label: 'Explore', icon: <MapPin className="w-4 h-4" /> },
    { id: 'facilities', label: 'Places', icon: <Building2 className="w-4 h-4" /> },
    { id: 'reports', label: 'Reports', icon: <AlertTriangle className="w-4 h-4" /> },
    { id: 'family', label: 'Family', icon: <Users className="w-4 h-4" /> },
    { id: 'civic', label: 'Civic', icon: <Layers className="w-4 h-4" /> },
  ];

  return (
    <header className="h-16 sm:h-[68px] w-full max-w-full bg-white border-b border-border px-4 sm:px-6 flex items-center justify-between text-ink z-30 sticky top-0 shadow-e1">
      {/* Brand Wordmark */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={() => onSelectTab('route')}
          className="flex items-baseline gap-1 text-left focus-ring-peacock rounded-md px-1 py-0.5"
          aria-label="HERPATH Home"
        >
          <span className="font-serif text-2xl font-bold tracking-tight text-ink">
            HERPATH
          </span>
          <span className="text-[11px] font-sans font-medium text-text-secondary tracking-normal hidden md:inline ml-2.5 pl-2.5 border-l border-border">
            Safety-Aware Navigation & Journey Companion
          </span>
        </button>
      </div>

      {/* Desktop Navigation Tabs */}
      <nav className="hidden lg:flex items-center gap-1 text-sm font-medium" aria-label="Main Navigation">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`relative flex items-center gap-1.5 px-3.5 py-2 rounded-md transition-colors focus-ring-peacock ${
                isActive
                  ? 'text-ink font-bold'
                  : 'text-text-secondary hover:text-ink hover:bg-paper'
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
              {item.id === 'family' && hasActiveJourney && (
                <span
                  className="w-2 h-2 rounded-full bg-peacock ml-0.5"
                  title="Journey active"
                  aria-label="Journey active"
                />
              )}
              {/* Active ink underline indicator */}
              {isActive && (
                <span className="absolute bottom-0 left-3 right-3 h-[2px] bg-ink rounded-full" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Right Controls: Report, Settings, and Persistent SOS */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        <button
          onClick={onOpenReportModal}
          className="hidden sm:inline-flex items-center gap-1.5 py-2 px-3.5 rounded-md bg-paper hover:bg-raised text-xs font-semibold text-ink border border-border transition-colors focus-ring-peacock"
          title="Submit a community report or streetlight condition"
        >
          <Plus className="w-3.5 h-3.5 text-peacock" />
          <span>Report</span>
        </button>

        <button
          onClick={onOpenSettings}
          className="p-2 sm:p-2.5 rounded-md text-text-secondary hover:text-ink hover:bg-paper border border-transparent hover:border-border transition-colors focus-ring-peacock"
          title="Settings and Privacy"
          aria-label="Settings and Privacy"
        >
          <SlidersHorizontal className="w-4 h-4 text-text-secondary" />
        </button>

        {/* SOS Emergency Control - Restrained, high-contrast solid red, no animation at rest */}
        <button
          onClick={onOpenEmergency}
          className="btn-emergency-sos min-w-[64px] h-10 sm:h-10 px-3.5 sm:px-4 flex items-center justify-center gap-1.5 text-xs font-bold shadow-e1 focus-ring-peacock"
          title="Open Emergency SOS"
          aria-label="Emergency SOS"
        >
          <PhoneCall className="w-3.5 h-3.5 text-white" />
          <span className="font-extrabold tracking-wider">SOS</span>
        </button>
      </div>
    </header>
  );
};
