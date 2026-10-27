'use client';

import React, { useState } from 'react';
import {
  DisturbanceCategory,
  Coordinates,
  CommunityReport,
  StreetlightSegment,
} from '@/types';
import { generateId } from '@/lib/utils';
import {
  X,
  MapPin,
  Send,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  PhoneCall,
} from 'lucide-react';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultCoords: Coordinates;
  onSubmitReport: (report: CommunityReport) => void;
  onSubmitStreetlight?: (streetlight: StreetlightSegment) => void;
  onOpenEmergency?: () => void;
}

const CATEGORIES: { id: DisturbanceCategory; label: string; icon: string; description: string }[] = [
  {
    id: 'streetlight_issue',
    label: 'Streetlight Outage',
    icon: '💡',
    description: 'Lamps off, dark stretch, or flickering luminaires',
  },
  {
    id: 'harassment',
    label: 'Harassment Concern',
    icon: '⚠️',
    description: 'Intimidation, following, or aggressive behavior',
  },
  {
    id: 'disruptive_group',
    label: 'Disruptive Group',
    icon: '👥',
    description: 'Corridor obstruction or confrontational group',
  },
  {
    id: 'broken_footpath',
    label: 'Footpath / Access Hazard',
    icon: '🚧',
    description: 'Broken pavement, open construction, or blocked ramp',
  },
  {
    id: 'transport_disruption',
    label: 'Transit Disruption',
    icon: '🚌',
    description: 'Bus stop dark, gate closed, or route cancelled',
  },
  {
    id: 'other_concern',
    label: 'Other Safety Hazard',
    icon: 'ℹ️',
    description: 'General environmental or urban maintenance issue',
  },
];

export const ReportModal: React.FC<ReportModalProps> = ({
  isOpen,
  onClose,
  defaultCoords,
  onSubmitReport,
  onSubmitStreetlight,
  onOpenEmergency,
}) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [category, setCategory] = useState<DisturbanceCategory>('streetlight_issue');
  const [locationName, setLocationName] = useState('');
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState<'low' | 'medium' | 'high'>('medium');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!locationName.trim()) {
      setValidationError('Please enter a location name or landmark.');
      return;
    }

    const now = new Date();
    const newReport: CommunityReport = {
      id: generateId('rep'),
      coordinates: defaultCoords,
      locationName: locationName.trim(),
      category,
      description: description.trim() || 'Observed by community member',
      source: 'community',
      status: 'pending',
      upvotes: 1,
      flagCount: 0,
      createdAt: now.toISOString(),
      expiresAt: new Date(now.getTime() + 48 * 60 * 60 * 1000).toISOString(),
    };

    onSubmitReport(newReport);

    if (category === 'streetlight_issue' && onSubmitStreetlight) {
      const newStreetlight: StreetlightSegment = {
        id: generateId('stl'),
        segmentName: locationName.trim(),
        coordinates: defaultCoords,
        status: 'malfunctioning',
        reportedSource: 'community',
        verificationStatus: 'unverified',
        lastReportedAt: now.toISOString(),
        notes: description.trim() || 'Community-reported streetlight outage',
      };
      onSubmitStreetlight(newStreetlight);
    }

    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setStep(1);
      setLocationName('');
      setDescription('');
      onClose();
    }, 1500);
  };

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-bordeaux/40 backdrop-blur-sm animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="report-modal-title"
    >
      <div className="surface-card max-w-lg w-full p-6 text-bordeaux shadow-atelier border border-border-gold/60 rounded-atelier relative overflow-hidden bg-white">
        {/* Modal Header */}
        <div className="flex items-start justify-between pb-4 border-b border-border">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-rose-gold font-editorial">
                Step {step} of 3
              </span>
              <span className="text-xs text-text-secondary">· Community Contribution</span>
            </div>
            <h3 id="report-modal-title" className="font-editorial text-xl font-bold text-bordeaux">
              {step === 1 && 'What did you observe?'}
              {step === 2 && 'Where did it happen?'}
              {step === 3 && 'Details & confirmation'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-text-secondary hover:text-bordeaux p-2 rounded-xl bg-canvas hover:bg-canvas-subtle transition-colors focus-ring-bordeaux"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Emergency disclaimer banner with SOS entry point */}
        <div className="my-3 p-3 rounded-xl bg-surface-raised border border-border text-xs flex items-center justify-between gap-3">
          <p className="text-text-secondary leading-snug">
            <strong className="text-bordeaux font-semibold">Public Notice:</strong> Community reports do not notify emergency dispatch.
          </p>
          {onOpenEmergency && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenEmergency();
              }}
              className="text-emergency hover:bg-danger-tint px-2.5 py-1 rounded-lg border border-emergency/30 font-bold flex items-center gap-1 shrink-0 transition-colors"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>SOS</span>
            </button>
          )}
        </div>

        {submitted ? (
          <div className="py-12 text-center space-y-3 animate-fade-in">
            <CheckCircle2 className="w-12 h-12 text-verified mx-auto" />
            <h4 className="font-editorial text-lg font-bold text-bordeaux">Report Submitted</h4>
            <p className="text-xs text-text-secondary">
              Thank you. Your observation has been saved to device records and will help other commuters.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 my-2">
            {/* STEP 1: What happened? */}
            {step === 1 && (
              <div className="space-y-2 animate-fade-in max-h-[60vh] overflow-y-auto pr-1">
                <div className="text-xs font-semibold text-text-secondary mb-1">
                  Select the issue type:
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setCategory(cat.id)}
                      className={`p-3 rounded-xl border text-left transition-all flex items-start gap-2.5 ${
                        category === cat.id
                          ? 'border-2 border-rose-gold bg-rose-tint shadow-sm'
                          : 'border-border bg-white hover:bg-canvas'
                      }`}
                    >
                      <span className="text-xl shrink-0 mt-0.5">{cat.icon}</span>
                      <div className="min-w-0">
                        <div className="font-bold text-xs text-bordeaux leading-snug">{cat.label}</div>
                        <div className="text-[11px] text-text-secondary mt-0.5 leading-tight">
                          {cat.description}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* STEP 2: Where did it happen? */}
            {step === 2 && (
              <div className="space-y-3.5 animate-fade-in">
                <div>
                  <label className="block text-xs font-semibold text-bordeaux mb-1 font-editorial">
                    Location Name or Nearest Landmark *
                  </label>
                  <input
                    type="text"
                    value={locationName}
                    onChange={(e) => {
                      setLocationName(e.target.value);
                      setValidationError(null);
                    }}
                    placeholder="e.g. Connaught Place Inner Circle, near Gate 2"
                    className="w-full text-xs bg-canvas rounded-xl p-2.5 border border-border focus:border-rose-gold text-bordeaux font-medium"
                    required
                    autoFocus
                  />
                  {validationError && (
                    <p className="text-danger text-[11px] font-medium mt-1">{validationError}</p>
                  )}
                </div>

                <div className="p-3 rounded-xl bg-canvas border border-border text-xs flex items-center justify-between text-text-secondary">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-rose-gold" />
                    <span>GPS Coordinates:</span>
                  </div>
                  <span className="font-mono text-bordeaux font-bold">
                    {defaultCoords.lat.toFixed(4)}, {defaultCoords.lng.toFixed(4)}
                  </span>
                </div>
              </div>
            )}

            {/* STEP 3: Details & Confirmation */}
            {step === 3 && (
              <div className="space-y-3.5 animate-fade-in">
                <div>
                  <label className="block text-xs font-semibold text-bordeaux mb-1 font-editorial">
                    Optional Details or Context
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Provide additional details to help verify or locate..."
                    rows={3}
                    className="w-full text-xs bg-canvas rounded-xl p-2.5 border border-border focus:border-rose-gold text-bordeaux font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-bordeaux mb-1.5 font-editorial">
                    Urgency / Impact Level
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['low', 'medium', 'high'] as const).map((sev) => (
                      <button
                        key={sev}
                        type="button"
                        onClick={() => setSeverity(sev)}
                        className={`py-2 text-xs font-semibold rounded-xl border uppercase tracking-wider transition-all ${
                          severity === sev
                            ? sev === 'high'
                              ? 'bg-danger-tint text-danger border-danger font-bold'
                              : 'bg-rose-tint text-rose-gold border-rose-gold font-bold'
                            : 'bg-canvas text-text-secondary border-border hover:bg-canvas-subtle'
                        }`}
                      >
                        {sev}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-canvas border border-border text-[11px] text-text-secondary leading-relaxed">
                  <strong className="text-bordeaux font-semibold">Community Integrity:</strong> Submitted reports are marked as <em>Unverified</em> until corroborated by other commuters.
                </div>
              </div>
            )}

            {/* Modal Step Navigation Footer */}
            <div className="pt-3 border-t border-border flex items-center justify-between">
              {step > 1 ? (
                <button
                  type="button"
                  onClick={() => setStep((s) => (s - 1) as any)}
                  className="btn-secondary py-2 px-3 text-xs flex items-center gap-1"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Back</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onClose}
                  className="btn-secondary py-2 px-3 text-xs"
                >
                  Cancel
                </button>
              )}

              {step < 3 ? (
                <button
                  type="button"
                  onClick={() => {
                    if (step === 2 && !locationName.trim()) {
                      setValidationError('Please enter a location name.');
                      return;
                    }
                    setStep((s) => (s + 1) as any);
                  }}
                  className="btn-bordeaux py-2 px-4 text-xs font-bold flex items-center gap-1 shadow-md"
                >
                  <span>Continue</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  type="submit"
                  className="btn-bordeaux py-2 px-5 text-xs font-bold flex items-center gap-1.5 shadow-md"
                >
                  <Send className="w-3.5 h-3.5 text-champagne" />
                  <span>Publish Report</span>
                </button>
              )}
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
