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
  RotateCcw,
  Plus,
} from 'lucide-react';

export type ActiveTab = 'route' | 'map' | 'facilities' | 'reports' | 'family' | 'civic';

interface HeaderProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  onOpenEmergency: () => void;
  onOpenReportModal: () => void;
  onResetDemoData: () => void;
  hasActiveJourney: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onSelectTab,
  onOpenEmergency,
  onOpenReportModal,
  onResetDemoData,
  hasActiveJourney,
}) => {
  return (
    <header className="h-16 bg-navy-950/95 border-b border-slate-800 px-4 flex items-center justify-between text-slate-100 z-30 sticky top-0 backdrop-blur-md">
      {/* Brand Wordmark & Tagline */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => onSelectTab('route')}
          className="flex items-center gap-2.5 text-left group focus:outline-none"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center text-white shadow-lg shadow-teal-950/60 group-hover:scale-105 transition-transform">
            <Compass className="w-5 h-5 animate-spin-slow" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 leading-none">
              <span className="font-black text-lg tracking-wider text-white">HER</span>
              <span className="font-extrabold text-lg tracking-wider text-teal-400">PATH</span>
              <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-teal-950 text-teal-300 border border-teal-800">
                PROTOTYPE
              </span>
            </div>
            <p className="text-[10px] text-slate-400 tracking-tight font-medium hidden sm:block mt-0.5">
              Safety-Aware Navigation + Family Companion
            </p>
          </div>
        </button>
      </div>

      {/* Desktop Navigation Tabs */}
      <nav className="hidden lg:flex items-center gap-1 bg-navy-900/90 p-1 rounded-2xl border border-slate-800/80 text-xs font-semibold">
        <button
          onClick={() => onSelectTab('route')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all ${
            activeTab === 'route'
              ? 'bg-teal-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Navigation className="w-3.5 h-3.5" />
          <span>Plan Route</span>
        </button>

        <button
          onClick={() => onSelectTab('map')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all ${
            activeTab === 'map'
              ? 'bg-teal-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <MapPin className="w-3.5 h-3.5" />
          <span>Explore Map</span>
        </button>

        <button
          onClick={() => onSelectTab('facilities')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all ${
            activeTab === 'facilities'
              ? 'bg-teal-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Building2 className="w-3.5 h-3.5" />
          <span>Facilities</span>
        </button>

        <button
          onClick={() => onSelectTab('reports')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all ${
            activeTab === 'reports'
              ? 'bg-teal-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>Reports</span>
        </button>

        <button
          onClick={() => onSelectTab('family')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all relative ${
            activeTab === 'family'
              ? 'bg-teal-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Family Trips</span>
          {hasActiveJourney && (
            <span className="w-2 h-2 rounded-full bg-teal-400 animate-ping absolute top-1 right-1" />
          )}
        </button>

        <button
          onClick={() => onSelectTab('civic')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all ${
            activeTab === 'civic'
              ? 'bg-teal-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Civic Insights</span>
        </button>
      </nav>

      {/* Right Controls: New Report, Reset Demo, and SOS */}
      <div className="flex items-center gap-2 sm:gap-3">
        <button
          onClick={onOpenReportModal}
          className="hidden md:flex items-center gap-1.5 py-1.5 px-3 rounded-xl bg-navy-850 hover:bg-navy-800 border border-slate-700 text-xs font-semibold text-slate-200 hover:text-white transition-colors"
          title="Post a community report or streetlight issue"
        >
          <Plus className="w-3.5 h-3.5 text-teal-400" />
          <span>Report Issue</span>
        </button>

        <button
          onClick={onResetDemoData}
          className="p-2 rounded-xl bg-navy-850 hover:bg-navy-800 border border-slate-700 text-slate-400 hover:text-white transition-colors"
          title="Reset demo data to initial factory state"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        {/* SOS Emergency Button */}
        <button
          onClick={onOpenEmergency}
          className="py-1.5 sm:py-2 px-3 sm:px-4 rounded-xl bg-rose-600 hover:bg-rose-500 active:scale-95 text-white font-black text-xs sm:text-xs uppercase tracking-wider flex items-center gap-1.5 sm:gap-2 shadow-lg shadow-rose-950/70 ring-2 ring-rose-500/30 animate-pulse transition-all"
          title="Open Emergency SOS contacts"
        >
          <PhoneCall className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          <span>SOS Help</span>
        </button>
      </div>
    </header>
  );
};
