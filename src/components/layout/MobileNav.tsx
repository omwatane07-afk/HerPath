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
      className="lg:hidden fixed bottom-[calc(0.75rem+env(safe-area-inset-bottom,0px))] left-3 right-3 max-w-lg mx-auto h-[62px] bg-white/95 backdrop-blur-xl rounded-full flex items-center justify-between p-1.5 z-40 shadow-[0_8px_30px_rgba(15,23,42,0.12)] border border-slate-200/80"
      aria-label="Mobile Navigation"
    >
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            onClick={() => onSelectTab(tab.id)}
            className={`flex flex-col items-center justify-center min-h-[44px] min-w-[44px] h-full flex-1 rounded-full transition-all duration-150 relative focus-ring-primary ${
              isActive
                ? 'text-white font-bold bg-indigo-600 shadow-sm scale-100'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 font-semibold'
            }`}
            aria-current={isActive ? 'page' : undefined}
          >
            <Icon
              className={`w-4 h-4 shrink-0 transition-colors ${
                isActive ? 'text-white' : 'text-slate-500'
              }`}
            />
            <span className="text-[10px] mt-0.5 tracking-tight leading-none font-sans font-medium">
              {tab.label}
            </span>
            {tab.badge && !isActive && (
              <span
                className="w-2.5 h-2.5 rounded-full bg-amber-400 border-2 border-white absolute top-1.5 right-2 animate-pulse"
                title="Trip active"
              />
            )}
          </button>
        );
      })}
    </nav>
  );
};
