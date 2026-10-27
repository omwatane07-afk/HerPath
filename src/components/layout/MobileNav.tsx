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
    { id: 'route' as const, label: 'Plan', icon: Navigation },
    { id: 'map' as const, label: 'Explore', icon: MapPin },
    { id: 'facilities' as const, label: 'Places', icon: Building2 },
    { id: 'reports' as const, label: 'Reports', icon: AlertTriangle },
    { id: 'family' as const, label: 'Family', icon: Users, badge: hasActiveJourney },
    { id: 'civic' as const, label: 'Civic', icon: Layers },
  ];

  return (
    <nav
      className="lg:hidden fixed bottom-3 left-3 right-3 max-w-lg mx-auto h-[62px] bg-white/95 backdrop-blur-md rounded-2xl flex items-center justify-between p-1 z-40 shadow-atelier border border-border transition-all"
      aria-label="Mobile Navigation"
    >
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            onClick={() => onSelectTab(tab.id)}
            className={`flex flex-col items-center justify-center min-h-[44px] min-w-[44px] h-full flex-1 rounded-xl transition-all duration-200 relative focus-ring-bordeaux ${
              isActive
                ? 'text-white font-bold bg-bordeaux shadow-sm'
                : 'text-text-secondary hover:text-bordeaux hover:bg-canvas font-medium'
            }`}
            aria-current={isActive ? 'page' : undefined}
          >
            <Icon
              className={`w-4 h-4 shrink-0 transition-colors ${
                isActive ? 'text-champagne' : 'text-text-secondary'
              }`}
            />
            <span className="text-[10px] mt-0.5 tracking-tight leading-none font-sans">
              {tab.label}
            </span>
            {tab.badge && !isActive && (
              <span
                className="w-2 h-2 rounded-full bg-rose-gold absolute top-1.5 right-2 animate-pulse"
                title="Trip active"
              />
            )}
          </button>
        );
      })}
    </nav>
  );
};
