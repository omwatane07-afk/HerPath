'use client';

import React, { useState } from 'react';
import { RoutePreferences, TrustedContact } from '@/types';
import {
  X,
  SlidersHorizontal,
  Shield,
  RotateCcw,
  Eye,
  Lock,
  Compass,
  Users,
  MapPin,
  Sparkles,
  Accessibility,
  Check,
} from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  preferences: RoutePreferences;
  onUpdatePreferences: (prefs: RoutePreferences) => void;
  onResetDemoData: () => void;
  trustedContacts?: TrustedContact[];
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  preferences,
  onUpdatePreferences,
  onResetDemoData,
}) => {
  const [activeTab, setActiveTab] = useState<'contacts' | 'sharing' | 'privacy' | 'appearance'>('privacy');
  const [textSize, setTextSize] = useState<'normal' | 'large'>('normal');
  const [highContrast, setHighContrast] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-ink/40 backdrop-blur-sm animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-title"
    >
      <div className="surface-card max-w-xl w-full p-6 text-ink shadow-e3 relative overflow-hidden flex flex-col max-h-[85vh]">
        {/* Modal Header */}
        <div className="flex items-start justify-between pb-4 border-b border-border">
          <div>
            <h2 id="settings-title" className="font-serif text-xl font-bold text-ink">
              Settings & Privacy
            </h2>
            <p className="text-xs text-text-secondary mt-0.5">
              Manage your trusted contacts, location sharing, privacy, and accessibility.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-text-secondary hover:text-ink p-2 rounded-lg bg-paper hover:bg-raised transition-colors focus-ring-peacock"
            aria-label="Close settings"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 4 Clear Sections Tabs */}
        <div className="mt-3 flex rounded-lg bg-paper p-1 border border-border text-xs font-semibold gap-1" role="tablist">
          {[
            { id: 'privacy' as const, label: 'Data & Privacy', icon: Shield },
            { id: 'sharing' as const, label: 'Sharing & Location', icon: MapPin },
            { id: 'appearance' as const, label: 'Accessibility', icon: Accessibility },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 py-1.5 px-2 rounded-md flex items-center justify-center gap-1.5 transition-colors focus-ring-peacock ${
                  isActive
                    ? 'bg-white text-ink font-bold shadow-e1'
                    : 'text-text-secondary hover:text-ink'
                }`}
                role="tab"
                aria-selected={isActive}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-peacock' : ''}`} />
                <span className="truncate">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1 text-xs">
          {/* TAB 1: DATA & PRIVACY */}
          {activeTab === 'privacy' && (
            <div className="space-y-3.5 animate-fade-in">
              <div className="surface-card p-4 space-y-2.5">
                <h4 className="font-serif font-bold text-sm text-ink flex items-center gap-2">
                  <Lock className="w-4 h-4 text-peacock" />
                  <span>Plain-Language Privacy Commitment</span>
                </h4>
                <ul className="space-y-2 text-text-secondary leading-relaxed">
                  <li className="flex items-start gap-2">
                    <span className="text-peacock font-bold">✓</span>
                    <span><strong>No Covert Tracking:</strong> We never log background movements or share personal trajectories with commercial ad brokers.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-peacock font-bold">✓</span>
                    <span><strong>Local Data Ownership:</strong> In this evaluation mode, all reports, preferences, and journeys reside exclusively in your local device storage.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-peacock font-bold">✓</span>
                    <span><strong>No Neighborhood Profiling:</strong> Unmapped infrastructure is marked neutrally as "No Data", never stigmatized as dangerous.</span>
                  </li>
                </ul>
              </div>

              {/* Data Deletion & Reset */}
              <div className="surface-card p-4 space-y-2 border-danger/30">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-xs text-ink">Reset Evaluation Data</h4>
                    <p className="text-[11px] text-text-secondary mt-0.5">
                      Clears all locally saved community reports, custom contacts, and active journeys.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      onResetDemoData();
                      onClose();
                    }}
                    className="btn-secondary py-1.5 px-3 text-xs font-bold text-danger hover:bg-danger-tint border-danger/40"
                  >
                    Reset Data
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SHARING & LOCATION */}
          {activeTab === 'sharing' && (
            <div className="space-y-3 animate-fade-in">
              <div className="surface-card p-4 space-y-3">
                <h4 className="font-serif font-bold text-sm text-ink flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-peacock" />
                  <span>Trip Sharing Controls</span>
                </h4>
                
                <div className="space-y-2 text-text-secondary leading-relaxed">
                  <p>
                    <strong>Who receives shared data?</strong> Only people you explicitly invite or send a journey link to.
                  </p>
                  <p>
                    <strong>How long does sharing last?</strong> Sharing terminates automatically once you arrive safely at your destination, or immediately when you tap "Stop sharing".
                  </p>
                  <p>
                    <strong>How do I stop sharing?</strong> A prominent "Stop sharing" button remains permanently visible at the top of the app and in the Family Trips tab during any active trip.
                  </p>
                </div>
              </div>

              <div className="surface-card p-4 space-y-2">
                <h4 className="font-bold text-xs text-ink">GPS Location Precision</h4>
                <p className="text-[11px] text-text-secondary">
                  HERPATH requests high-accuracy browser geolocation only when you tap "Use my location" or during an active journey check-in.
                </p>
              </div>
            </div>
          )}

          {/* TAB 3: APPEARANCE & ACCESSIBILITY */}
          {activeTab === 'appearance' && (
            <div className="space-y-3 animate-fade-in">
              <div className="surface-card p-4 space-y-3">
                <h4 className="font-serif font-bold text-sm text-ink flex items-center gap-2">
                  <Accessibility className="w-4 h-4 text-peacock" />
                  <span>Display & Accessibility</span>
                </h4>

                {/* Text Size Control */}
                <div className="flex items-center justify-between py-2 border-b border-border">
                  <div>
                    <span className="font-semibold text-ink">Interface Text Size</span>
                    <p className="text-[11px] text-text-secondary">Adjust density for high legibility</p>
                  </div>
                  <div className="inline-flex rounded-md bg-paper border border-border p-0.5">
                    <button
                      type="button"
                      onClick={() => setTextSize('normal')}
                      className={`px-3 py-1 rounded text-xs font-semibold ${
                        textSize === 'normal' ? 'bg-white text-ink shadow-e1 font-bold' : 'text-text-secondary'
                      }`}
                    >
                      Default
                    </button>
                    <button
                      type="button"
                      onClick={() => setTextSize('large')}
                      className={`px-3 py-1 rounded text-xs font-semibold ${
                        textSize === 'large' ? 'bg-white text-ink shadow-e1 font-bold' : 'text-text-secondary'
                      }`}
                    >
                      Enlarged
                    </button>
                  </div>
                </div>

                {/* High Contrast Toggle */}
                <label className="flex items-center justify-between py-2 border-b border-border cursor-pointer">
                  <div>
                    <span className="font-semibold text-ink">High Contrast Boundaries</span>
                    <p className="text-[11px] text-text-secondary">Enforces 3:1+ borders on all cards and inputs</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={highContrast}
                    onChange={(e) => setHighContrast(e.target.checked)}
                    className="rounded border-border text-peacock focus:ring-peacock h-4 w-4"
                  />
                </label>

                {/* Reduced Motion Toggle */}
                <label className="flex items-center justify-between py-2 cursor-pointer">
                  <div>
                    <span className="font-semibold text-ink">Prefer Reduced Motion</span>
                    <p className="text-[11px] text-text-secondary">Disables route path animations and marker lift</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={reducedMotion}
                    onChange={(e) => setReducedMotion(e.target.checked)}
                    className="rounded border-border text-peacock focus:ring-peacock h-4 w-4"
                  />
                </label>
              </div>

              {/* Routing Preferences Quick Toggle */}
              <div className="surface-card p-4 space-y-2">
                <h4 className="font-bold text-xs text-ink">Default Mobility Accessibility</h4>
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-text font-medium">Require step-free routes (curb cuts & ramps)</span>
                  <input
                    type="checkbox"
                    checked={preferences.wheelchairAccessible}
                    onChange={(e) => onUpdatePreferences({ ...preferences, wheelchairAccessible: e.target.checked })}
                    className="rounded border-border text-peacock focus:ring-peacock h-4 w-4"
                  />
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="pt-3 border-t border-border flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="btn-ink py-2 px-5 text-xs font-bold shadow-e1"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
