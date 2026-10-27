'use client';

import React from 'react';
import {
  Compass,
  Navigation,
  MapPin,
  Building2,
  AlertTriangle,
  Users,
  Layers,
  PhoneCall,
  SlidersHorizontal,
  Plus,
  Sparkles,
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
  return (
    <header className="h-16 w-full max-w-full bg-white/80 border-b border-white/90 px-3 sm:px-6 flex items-center justify-between text-brand-text z-30 sticky top-0 backdrop-blur-2xl shadow-glass transition-all">
      {/* Brand Wordmark & Royal Emblem */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        <button
          onClick={() => onSelectTab('route')}
          className="flex items-center gap-2.5 text-left group focus:outline-none min-w-0"
        >
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-br from-teal-500 via-teal-600 to-teal-800 flex items-center justify-center text-white shadow-md shadow-teal-700/20 ring-2 ring-champagne-300/80 group-hover:scale-105 transition-all shrink-0 relative overflow-hidden">
            <Compass className="w-5 h-5 animate-spin-slow text-white" />
            <div className="absolute top-0 right-0 w-3 h-3 bg-white/30 rounded-bl-lg pointer-events-none" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 leading-none">
              <span className="font-black text-base sm:text-lg tracking-wider text-brand-text">HER</span>
              <span className="font-extrabold text-base sm:text-lg tracking-wider text-teal-600">PATH</span>
              <span className="text-[9px] sm:text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-champagne-50/90 text-champagne-700 border border-champagne-300/80 shadow-xs flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5 text-champagne-500" />
                ROYAL
              </span>
            </div>
            <p className="text-[10px] sm:text-[11px] text-brand-text-secondary tracking-tight font-medium hidden md:block mt-0.5 truncate">
              Safety-Aware Navigation & Royal Companion
            </p>
          </div>
        </button>
      </div>

      {/* Desktop Navigation Tabs */}
      <nav className="hidden lg:flex items-center gap-1 bg-white/60 p-1.5 rounded-full border border-white/90 shadow-inner-glass text-xs font-semibold backdrop-blur-md">
        <button
          onClick={() => onSelectTab('route')}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full transition-all ${
            activeTab === 'route'
              ? 'bg-teal-500 text-white shadow-sm font-bold'
              : 'text-brand-text-secondary hover:text-brand-text hover:bg-white/60'
          }`}
        >
          <Navigation className="w-3.5 h-3.5" />
          <span>Plan Route</span>
        </button>

        <button
          onClick={() => onSelectTab('map')}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full transition-all ${
            activeTab === 'map'
              ? 'bg-teal-500 text-white shadow-sm font-bold'
              : 'text-brand-text-secondary hover:text-brand-text hover:bg-white/60'
          }`}
        >
          <MapPin className="w-3.5 h-3.5" />
          <span>Explore Map</span>
        </button>

        <button
          onClick={() => onSelectTab('facilities')}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full transition-all ${
            activeTab === 'facilities'
              ? 'bg-teal-500 text-white shadow-sm font-bold'
              : 'text-brand-text-secondary hover:text-brand-text hover:bg-white/60'
          }`}
        >
          <Building2 className="w-3.5 h-3.5" />
          <span>Facilities</span>
        </button>

        <button
          onClick={() => onSelectTab('reports')}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full transition-all ${
            activeTab === 'reports'
              ? 'bg-teal-500 text-white shadow-sm font-bold'
              : 'text-brand-text-secondary hover:text-brand-text hover:bg-white/60'
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>Reports</span>
        </button>

        <button
          onClick={() => onSelectTab('family')}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full transition-all relative ${
            activeTab === 'family'
              ? 'bg-teal-500 text-white shadow-sm font-bold'
              : 'text-brand-text-secondary hover:text-brand-text hover:bg-white/60'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Family Trips</span>
          {hasActiveJourney && (
            <span className="w-2 h-2 rounded-full bg-teal-500 animate-ping absolute top-1 right-1" />
          )}
        </button>

        <button
          onClick={() => onSelectTab('civic')}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full transition-all ${
            activeTab === 'civic'
              ? 'bg-teal-500 text-white shadow-sm font-bold'
              : 'text-brand-text-secondary hover:text-brand-text hover:bg-white/60'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Civic</span>
        </button>
      </nav>

      {/* Right Controls: New Report, Settings, and SOS */}
      <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
        <button
          onClick={onOpenReportModal}
          className="hidden sm:flex items-center gap-1.5 py-2 px-3.5 rounded-full glass-crystal hover:border-teal-300 text-xs font-semibold text-brand-text hover:text-teal-700 transition-all active:scale-95"
          title="Post a community report or streetlight issue"
        >
          <Plus className="w-3.5 h-3.5 text-teal-600" />
          <span>Report</span>
        </button>

        <button
          onClick={onOpenSettings}
          className="p-2 sm:p-2.5 rounded-2xl glass-crystal text-brand-text-secondary hover:text-brand-text transition-all active:scale-95"
          title="Preferences & Settings"
        >
          <SlidersHorizontal className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-brand-text-secondary" />
        </button>

        {/* SOS Emergency Button */}
        <button
          onClick={onOpenEmergency}
          className="py-1.5 sm:py-2 px-3 sm:px-4 rounded-full bg-gradient-to-r from-danger-500 to-rose-600 hover:from-danger-600 hover:to-rose-700 active:scale-95 text-white font-extrabold text-[11px] sm:text-xs uppercase tracking-wider flex items-center gap-1 sm:gap-1.5 shadow-md shadow-danger-500/25 animate-pulse-subtle transition-all shrink-0"
          title="Open Emergency SOS contacts"
        >
          <PhoneCall className="w-3.5 h-3.5" />
          <span>SOS</span>
        </button>
      </div>
    </header>
  );
};
