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
  const tabs = [
    { id: 'route' as const, label: 'Route', icon: Navigation },
    { id: 'map' as const, label: 'Map', icon: MapPin },
    { id: 'facilities' as const, label: 'Places', icon: Building2 },
    { id: 'reports' as const, label: 'Reports', icon: AlertTriangle },
    { id: 'family' as const, label: 'Family', icon: Users, badge: hasActiveJourney },
    { id: 'civic' as const, label: 'Civic', icon: Layers },
  ];

  return (
    <nav className="lg:hidden fixed bottom-4 left-2.5 right-2.5 sm:left-6 sm:right-6 max-w-md mx-auto h-16 rounded-full glass-dock flex items-center justify-between px-1.5 z-40 transition-all">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            onClick={() => onSelectTab(tab.id)}
            className={`flex flex-col items-center justify-center h-12 flex-1 min-w-0 px-1 rounded-full transition-all duration-200 relative ${
              isActive
                ? 'bg-teal-50/95 text-teal-700 font-bold shadow-xs border border-teal-200/70'
                : 'text-brand-text-secondary hover:text-brand-text active:scale-95'
            }`}
          >
            <Icon className={`w-4 h-4 shrink-0 transition-transform ${isActive ? 'scale-110 text-teal-600' : ''}`} />
            <span className="text-[10px] mt-0.5 truncate w-full text-center leading-none">
              {tab.label}
            </span>
            {tab.badge && (
              <span className="w-2 h-2 rounded-full bg-teal-500 ring-2 ring-white animate-ping absolute top-1.5 right-2" />
            )}
          </button>
        );
      })}
    </nav>
  );
};
