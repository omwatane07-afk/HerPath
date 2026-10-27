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
    <nav className="lg:hidden fixed bottom-3.5 left-3 right-3 sm:left-6 sm:right-6 max-w-md mx-auto h-[62px] rounded-full glass-dock flex items-center justify-between p-1.5 z-40 shadow-glass-floating border border-white/95 backdrop-blur-2xl transition-all">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            onClick={() => onSelectTab(tab.id)}
            className={`flex flex-col items-center justify-center h-12 flex-1 min-w-0 px-0.5 rounded-full transition-all duration-200 relative ${
              isActive
                ? 'bg-gradient-to-b from-teal-50 to-teal-100/90 text-teal-900 font-extrabold shadow-sm border border-teal-300/70 ring-1 ring-white/90 scale-[1.02]'
                : 'text-brand-text-secondary hover:text-brand-text hover:bg-white/40 active:scale-95 font-medium'
            }`}
          >
            <Icon
              className={`w-4 h-4 shrink-0 transition-transform ${
                isActive ? 'scale-110 text-teal-700' : 'text-brand-text-secondary'
              }`}
            />
            <span className="text-[10px] mt-0.5 truncate w-full text-center leading-none">
              {tab.label}
            </span>
            {isActive && (
              <span className="w-1 h-1 rounded-full bg-teal-600 mt-0.5 animate-pulse" />
            )}
            {tab.badge && !isActive && (
              <span className="w-2 h-2 rounded-full bg-teal-500 ring-2 ring-white animate-ping absolute top-1.5 right-2" />
            )}
          </button>
        );
      })}
    </nav>
  );
};
