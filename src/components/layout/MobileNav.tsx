'use client';

import React from 'react';
import { ActiveTab } from './Header';
import { Navigation, MapPin, Building2, AlertTriangle, Users, Layers } from 'lucide-react';

interface MobileNavProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  hasActiveJourney: boolean;
}

export const MobileNav: React.FC<MobileNavProps> = ({
  activeTab,
  onSelectTab,
  hasActiveJourney,
}) => {
  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-navy-950/95 border-t border-slate-800 flex items-center justify-around px-2 z-40 backdrop-blur-md">
      <button
        onClick={() => onSelectTab('route')}
        className={`flex flex-col items-center justify-center w-14 h-12 rounded-xl transition-colors ${
          activeTab === 'route' ? 'text-teal-400 font-bold' : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        <Navigation className="w-4 h-4" />
        <span className="text-[10px] mt-1">Route</span>
      </button>

      <button
        onClick={() => onSelectTab('map')}
        className={`flex flex-col items-center justify-center w-14 h-12 rounded-xl transition-colors ${
          activeTab === 'map' ? 'text-teal-400 font-bold' : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        <MapPin className="w-4 h-4" />
        <span className="text-[10px] mt-1">Map</span>
      </button>

      <button
        onClick={() => onSelectTab('facilities')}
        className={`flex flex-col items-center justify-center w-14 h-12 rounded-xl transition-colors ${
          activeTab === 'facilities'
            ? 'text-teal-400 font-bold'
            : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        <Building2 className="w-4 h-4" />
        <span className="text-[10px] mt-1">Places</span>
      </button>

      <button
        onClick={() => onSelectTab('reports')}
        className={`flex flex-col items-center justify-center w-14 h-12 rounded-xl transition-colors ${
          activeTab === 'reports' ? 'text-teal-400 font-bold' : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        <AlertTriangle className="w-4 h-4" />
        <span className="text-[10px] mt-1">Reports</span>
      </button>

      <button
        onClick={() => onSelectTab('family')}
        className={`flex flex-col items-center justify-center w-14 h-12 rounded-xl transition-colors relative ${
          activeTab === 'family' ? 'text-teal-400 font-bold' : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        <Users className="w-4 h-4" />
        <span className="text-[10px] mt-1">Family</span>
        {hasActiveJourney && (
          <span className="w-2 h-2 rounded-full bg-teal-400 animate-ping absolute top-1 right-3" />
        )}
      </button>

      <button
        onClick={() => onSelectTab('civic')}
        className={`flex flex-col items-center justify-center w-14 h-12 rounded-xl transition-colors ${
          activeTab === 'civic' ? 'text-teal-400 font-bold' : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        <Layers className="w-4 h-4" />
        <span className="text-[10px] mt-1">Civic</span>
      </button>
    </nav>
  );
};
