'use client';

import React from 'react';
import { RoutePreferences } from '@/types';
import {
  X,
  SlidersHorizontal,
  Shield,
  RotateCcw,
  Bell,
  Eye,
  CheckCircle2,
  Lock,
  Compass,
} from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  preferences: RoutePreferences;
  onUpdatePreferences: (prefs: RoutePreferences) => void;
  onResetDemoData: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  preferences,
  onUpdatePreferences,
  onResetDemoData,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-brand-text/30 backdrop-blur-md animate-fadeIn">
      <div className="surface-pearl border border-white/95 rounded-sheet max-w-lg w-full p-6 text-brand-text shadow-glass-floating relative overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-brand-border/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-50 border border-teal-200/90 flex items-center justify-center text-teal-600 shadow-xs ring-1 ring-champagne-300/60">
              <SlidersHorizontal className="w-5 h-5 text-teal-600" />
            </div>
            <div>
              <h3 className="text-base font-bold text-brand-text">Preferences & Settings</h3>
              <p className="text-xs text-brand-text-secondary">
                Configure safety weights, privacy, and defaults
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-brand-text-muted hover:text-brand-text p-2 rounded-xl glass-crystal transition-colors active:scale-95"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="py-4 space-y-5 max-h-[70vh] overflow-y-auto pr-1">
          {/* Navigation Routing Preferences Group */}
          <div>
            <h4 className="text-[11px] font-bold text-brand-text-muted uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-teal-600" />
              <span>Route Evaluation Priorities</span>
            </h4>

            <div className="space-y-2 bg-brand-bg rounded-2xl p-3 border border-brand-border">
              <label className="flex items-center justify-between p-2 rounded-xl hover:bg-white cursor-pointer transition-colors">
                <div>
                  <div className="text-xs font-semibold text-brand-text">Prioritise Well-Lit Stretches</div>
                  <div className="text-[11px] text-brand-text-secondary">
                    Favours segments with verified working streetlights
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.preferWellLit}
                  onChange={(e) =>
                    onUpdatePreferences({ ...preferences, preferWellLit: e.target.checked })
                  }
                  className="rounded-lg text-teal-500 focus:ring-teal-400 h-4 w-4 border-brand-border"
                />
              </label>

              <label className="flex items-center justify-between p-2 rounded-xl hover:bg-white cursor-pointer transition-colors">
                <div>
                  <div className="text-xs font-semibold text-brand-text">Proximity to Public Transport</div>
                  <div className="text-[11px] text-brand-text-secondary">
                    Keeps routes close to metro and bus corridors
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.preferPublicTransport}
                  onChange={(e) =>
                    onUpdatePreferences({
                      ...preferences,
                      preferPublicTransport: e.target.checked,
                    })
                  }
                  className="rounded-lg text-teal-500 focus:ring-teal-400 h-4 w-4 border-brand-border"
                />
              </label>

              <label className="flex items-center justify-between p-2 rounded-xl hover:bg-white cursor-pointer transition-colors">
                <div>
                  <div className="text-xs font-semibold text-brand-text">Essential Support Points</div>
                  <div className="text-[11px] text-brand-text-secondary">
                    Includes pharmacies, police desks, and restrooms
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.preferEssentialFacilities}
                  onChange={(e) =>
                    onUpdatePreferences({
                      ...preferences,
                      preferEssentialFacilities: e.target.checked,
                    })
                  }
                  className="rounded-lg text-teal-500 focus:ring-teal-400 h-4 w-4 border-brand-border"
                />
              </label>

              <label className="flex items-center justify-between p-2 rounded-xl hover:bg-white cursor-pointer transition-colors">
                <div>
                  <div className="text-xs font-semibold text-brand-text">Reduce Isolated Stretches</div>
                  <div className="text-[11px] text-brand-text-secondary">
                    Avoids unmapped or reported low-activity corridors
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.reduceIsolatedSegments}
                  onChange={(e) =>
                    onUpdatePreferences({
                      ...preferences,
                      reduceIsolatedSegments: e.target.checked,
                    })
                  }
                  className="rounded-lg text-teal-500 focus:ring-teal-400 h-4 w-4 border-brand-border"
                />
              </label>

              <label className="flex items-center justify-between p-2 rounded-xl hover:bg-white cursor-pointer transition-colors">
                <div>
                  <div className="text-xs font-semibold text-brand-text">Step-Free Accessibility</div>
                  <div className="text-[11px] text-brand-text-secondary">
                    Prioritises wheelchair and stroller accessible ramps
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.wheelchairAccessible}
                  onChange={(e) =>
                    onUpdatePreferences({
                      ...preferences,
                      wheelchairAccessible: e.target.checked,
                    })
                  }
                  className="rounded-lg text-teal-500 focus:ring-teal-400 h-4 w-4 border-brand-border"
                />
              </label>
            </div>
          </div>

          {/* Privacy & Anti-surveillance */}
          <div className="p-3.5 rounded-2xl bg-teal-50/80 border border-teal-100 space-y-1.5 text-xs text-teal-900">
            <div className="flex items-center gap-2 font-bold text-teal-800">
              <Lock className="w-4 h-4 text-teal-600" />
              <span>Privacy & Trust Architecture</span>
            </div>
            <p className="text-[11px] leading-relaxed text-teal-800/90">
              HERPATH never tracks your location in the background or profiles commuters.
              Location coordinates are used only during active journey sharing or routing requests.
            </p>
          </div>

          {/* Factory Reset */}
          <div className="pt-2 flex items-center justify-between border-t border-brand-border text-xs">
            <div>
              <div className="font-semibold text-brand-text">Demo Data Reset</div>
              <div className="text-[11px] text-brand-text-secondary">
                Restore sample reports, streetlights, and demo journeys
              </div>
            </div>
            <button
              onClick={() => {
                onResetDemoData();
                onClose();
              }}
              className="py-1.5 px-3 rounded-xl bg-brand-bg hover:bg-brand-bg-secondary text-brand-text font-semibold text-xs border border-brand-border transition-colors flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset State</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-brand-border flex justify-end">
          <button
            onClick={onClose}
            className="py-2 px-5 rounded-xl bg-teal-500 hover:bg-teal-600 active:scale-95 text-white font-bold text-xs uppercase tracking-wider shadow-sm transition-all"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
