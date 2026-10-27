'use client';

import React, { useState } from 'react';
import { RoutePreferences, TrustedContact } from '@/types';
import {
  X,
  Shield,
  Lock,
  MapPin,
  Accessibility,
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
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-bordeaux/40 backdrop-blur-sm animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-title"
    >
      <div className="surface-card max-w-xl w-full p-6 text-bordeaux shadow-atelier border border-border-gold/60 rounded-atelier relative overflow-hidden flex flex-col max-h-[85vh] bg-white">
        {/* Modal Header */}
        <div className="flex items-start justify-between pb-4 border-b border-border">
          <div>
            <h2 id="settings-title" className="font-editorial text-xl font-bold text-bordeaux">
              Settings & Privacy
            </h2>
            <p className="text-xs text-text-secondary mt-0.5">
              Manage your trusted contacts, location sharing, privacy, and accessibility.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-text-secondary hover:text-bordeaux p-2 rounded-xl bg-canvas hover:bg-canvas-subtle transition-colors focus-ring-bordeaux"
            aria-label="Close settings"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 3 Clear Sections Tabs */}
        <div className="mt-3 flex rounded-xl bg-canvas p-1 border border-border text-xs font-semibold gap-1" role="tablist">
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
                className={`flex-1 py-1.5 px-2 rounded-lg flex items-center justify-center gap-1.5 transition-all focus-ring-bordeaux ${
                  isActive
                    ? 'bg-bordeaux text-white font-bold shadow-sm'
                    : 'text-text-secondary hover:text-bordeaux'
                }`}
                role="tab"
                aria-selected={isActive}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-champagne' : ''}`} />
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
              <div className="surface-card p-4 space-y-2.5 border border-border">
                <h4 className="font-editorial font-bold text-sm text-bordeaux flex items-center gap-2">
                  <Lock className="w-4 h-4 text-rose-gold" />
                  <span>Plain-Language Privacy Commitment</span>
                </h4>
                <ul className="space-y-2 text-text-secondary leading-relaxed">
                  <li className="flex items-start gap-2">
                    <span className="text-rose-gold font-bold">✓</span>
                    <span><strong>No Covert Tracking:</strong> We never log background movements or share personal trajectories with commercial ad brokers.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-rose-gold font-bold">✓</span>
                    <span><strong>Local Data Ownership:</strong> In this evaluation mode, all reports, preferences, and journeys reside exclusively in your local device storage.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-rose-gold font-bold">✓</span>
                    <span><strong>No Neighborhood Profiling:</strong> Unmapped infrastructure is marked neutrally as "No Data", never stigmatized as dangerous.</span>
                  </li>
                </ul>
              </div>

              {/* Data Deletion & Reset */}
              <div className="surface-card p-4 space-y-2 border-danger/30">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-xs text-bordeaux">Reset Evaluation Data</h4>
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
              <div className="surface-card p-4 space-y-3 border border-border">
                <h4 className="font-editorial font-bold text-sm text-bordeaux flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-rose-gold" />
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

              <div className="surface-card p-4 space-y-2 border border-border">
                <h4 className="font-bold text-xs text-bordeaux">GPS Location Precision</h4>
                <p className="text-[11px] text-text-secondary">
                  HERPATH requests high-accuracy browser geolocation only when you tap "Use my location" or during an active journey check-in.
                </p>
              </div>
            </div>
          )}

          {/* TAB 3: APPEARANCE & ACCESSIBILITY */}
          {activeTab === 'appearance' && (
            <div className="space-y-3 animate-fade-in">
              <div className="surface-card p-4 space-y-3 border border-border">
                <h4 className="font-editorial font-bold text-sm text-bordeaux flex items-center gap-2">
                  <Accessibility className="w-4 h-4 text-rose-gold" />
                  <span>Display & Accessibility</span>
                </h4>

                {/* Text Size Control */}
                <div className="flex items-center justify-between py-2 border-b border-border">
                  <div>
                    <span className="font-semibold text-bordeaux">Interface Text Size</span>
                    <p className="text-[11px] text-text-secondary">Adjust density for high legibility</p>
                  </div>
                  <div className="inline-flex rounded-xl bg-canvas border border-border p-0.5">
                    <button
                      type="button"
                      onClick={() => setTextSize('normal')}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                        textSize === 'normal' ? 'bg-bordeaux text-white shadow-sm font-bold' : 'text-text-secondary'
                      }`}
                    >
                      Standard
                    </button>
                    <button
                      type="button"
                      onClick={() => setTextSize('large')}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                        textSize === 'large' ? 'bg-bordeaux text-white shadow-sm font-bold' : 'text-text-secondary'
                      }`}
                    >
                      Large (115%)
                    </button>
                  </div>
                </div>

                {/* Reduced Motion Toggle */}
                <div className="flex items-center justify-between py-2">
                  <div>
                    <span className="font-semibold text-bordeaux">Reduced Motion</span>
                    <p className="text-[11px] text-text-secondary">Disables 3D camera transitions and route drawing</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={reducedMotion}
                    onChange={(e) => setReducedMotion(e.target.checked)}
                    className="rounded border-border text-rose-gold focus:ring-rose-gold h-4 w-4"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-border flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="btn-bordeaux py-2 px-5 text-xs font-semibold shadow-sm"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
