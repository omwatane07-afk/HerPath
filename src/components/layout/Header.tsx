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
  Info,
  X,
  ShieldCheck,
  Sparkles,
  BookOpen,
} from 'lucide-react';
import { JellyPin } from '../ui/JellyPin';
import { GirlyCharacter } from '../character/GirlyCharacter';
import { SosTripleTapButton } from '../emergency/SosTripleTapButton';

export type ActiveTab = 'route' | 'map' | 'facilities' | 'reports' | 'family' | 'civic';

interface HeaderProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  onOpenEmergency: (triggerMethod?: 'triple_tap' | 'quick_action') => void;
  onOpenReportModal: () => void;
  onOpenSettings: () => void;
  onOpenOnboarding?: () => void;
  hasActiveJourney: boolean;
  isTestMode?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onSelectTab,
  onOpenEmergency,
  onOpenReportModal,
  onOpenSettings,
  onOpenOnboarding,
  hasActiveJourney,
  isTestMode = false,
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
    { id: 'family', label: 'Family Trips', icon: <Users className="w-3.5 h-3.5" /> },
    { id: 'civic', label: 'Civic Insights', icon: <Layers className="w-3.5 h-3.5" /> },
  ];

  return (
    <header className="h-14 w-full max-w-full bg-white/90 backdrop-blur-xl border-b border-slate-200/80 px-3 sm:px-6 flex items-center justify-between z-30 sticky top-0 shadow-[0_2px_12px_rgba(15,23,42,0.03)] shrink-0">
      {/* Brand Wordmark & Girly Mascot Emblem */}
      <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
        <button
          onClick={() => onSelectTab('route')}
          className="flex items-center gap-2.5 text-left rounded-xl py-1 transition-transform active:scale-95 group focus-ring-primary"
          aria-label="HERPATH Navigation Home"
        >
          <div className="w-8 h-8 rounded-full bg-purple-50 flex items-center justify-center p-0.5 border border-purple-200/80 shadow-xs group-hover:scale-105 transition-transform overflow-hidden">
            <GirlyCharacter size={26} isWalking={false} />
          </div>
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="font-heading text-lg sm:text-xl font-extrabold tracking-tight text-slate-900 leading-none">
                HERPATH
              </span>
              <span className="text-[9px] uppercase font-extrabold tracking-wider text-purple-700 px-2 py-0.5 rounded-full bg-purple-50 border border-purple-200 shadow-xs hidden sm:inline flex items-center gap-1">
                <span>🎀</span>
                <span>Navigation</span>
              </span>
            </div>
            <p className="text-[9px] font-sans font-semibold text-slate-500 tracking-normal hidden md:block">
              Safety-Aware Pedestrian Navigation
            </p>
          </div>
        </button>
      </div>

      {/* Six Module Navigation Tabs (Center) */}
      <nav className="hidden lg:flex items-center gap-1 bg-slate-100/70 p-1 rounded-full border border-slate-200/60 backdrop-blur-md" aria-label="Main Navigation">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`relative flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all duration-150 focus-ring-primary ${
                isActive
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
              {item.id === 'family' && hasActiveJourney && (
                <span
                  className="w-2 h-2 rounded-full bg-amber-400 ml-0.5 animate-pulse"
                  title="Journey active"
                  aria-label="Journey active"
                />
              )}
            </button>
          );
        })}
      </nav>

      {/* Right Action Suite: Guide, Info Popover, Settings, Dedicated Emergency SOS */}
      <div className="flex items-center gap-2 sm:gap-2.5">
        {/* Onboarding Guide Replay Trigger */}
        {onOpenOnboarding && (
          <button
            type="button"
            onClick={onOpenOnboarding}
            className="w-9 h-9 rounded-full flex items-center justify-center text-slate-600 hover:text-purple-700 hover:bg-purple-50 transition-colors focus-ring-primary"
            title="Open HERPATH Navigation Guide"
            aria-label="HERPATH Guide"
          >
            <Sparkles className="w-4 h-4 text-purple-600" />
          </button>
        )}

        {/* Info Popover Trigger */}
        <div className="relative" ref={infoRef}>
          <button
            type="button"
            onClick={() => setIsInfoOpen(!isInfoOpen)}
            className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors focus-ring-primary ${
              isInfoOpen ? 'bg-purple-100 text-purple-800' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
            title="How HERPATH route information works"
            aria-label="How route information works"
            aria-expanded={isInfoOpen}
          >
            <Info className="w-4 h-4" />
          </button>

          {isInfoOpen && (
            <div className="absolute right-0 top-11 w-80 sm:w-96 glass-dropdown p-5 z-50 animate-modal text-slate-800">
              <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <h4 className="font-heading font-bold text-sm text-slate-900">How HERPATH Works</h4>
                </div>
                <button
                  type="button"
                  onClick={() => setIsInfoOpen(false)}
                  className="text-slate-400 hover:text-slate-700 p-1 rounded-md"
                  aria-label="Close information"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="text-xs text-slate-600 space-y-2.5 mt-3 leading-relaxed">
                <p>
                  <strong className="text-slate-900 font-bold">Transparent Data:</strong> Walking corridors are evaluated using verified streetlight databases, open municipal services, and recent community observations.
                </p>
                <p>
                  <strong className="text-slate-900 font-bold">Zero Fabrication:</strong> We never label any public road &ldquo;100% safe&rdquo;. Unmapped stretches are highlighted honestly as data gaps.
                </p>
                <div className="p-2.5 rounded-xl bg-purple-50 border border-purple-200 text-purple-900 text-[11px] font-semibold flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                  <span>Evidence-backed recommendations, transparent trade-offs, honest uncertainty.</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Preferences / Settings Trigger */}
        <button
          type="button"
          onClick={onOpenSettings}
          className="w-9 h-9 rounded-full flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors focus-ring-primary"
          title="Routing priorities & local settings"
          aria-label="Open settings"
        >
          <SlidersHorizontal className="w-4 h-4" />
        </button>

        {/* Dedicated Emergency SOS (Triple-Tap Safety Trigger) */}
        <SosTripleTapButton
          variant="header"
          onTriggerSOS={(method) => onOpenEmergency(method)}
          isTestMode={isTestMode}
        />
      </div>
    </header>
  );
};
