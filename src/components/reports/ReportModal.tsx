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
  AlertTriangle,
  Lightbulb,
  MapPin,
  Send,
  ShieldCheck,
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
    label: 'Broken Footpath',
    icon: '🚧',
    description: 'Uneven surface, construction debris, or missing walkway',
  },
  {
    id: 'transport_disruption',
    label: 'Transit Disruption',
    icon: '🚌',
    description: 'Barricaded stop, unlit shelter, or cancelled service',
  },
  {
    id: 'facility_unavailable',
    label: 'Facility Closed / Defect',
    icon: '🚻',
    description: 'Locked restroom, closed pharmacy, or unattended desk',
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
  const [submitted, setSubmitted] = useState(false);
  const [validationError, setValidationError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!locationName.trim()) {
      setValidationError('Please specify a street or landmark name.');
      setStep(2);
      return;
    }

    const now = new Date();
    const newReport: CommunityReport = {
      id: generateId('rep'),
      category,
      coordinates: defaultCoords,
      locationName: locationName.trim(),
      description: description.trim() || 'Observed condition reported by community commuter.',
      status: 'pending',
      source: 'community',
      upvotes: 1,
      flagCount: 0,
      createdAt: now.toISOString(),
      expiresAt: new Date(now.getTime() + 48 * 3600 * 1000).toISOString(),
    };

    onSubmitReport(newReport);

    if (category === 'streetlight_issue' && onSubmitStreetlight) {
      const newStreetlight: StreetlightSegment = {
        id: generateId('sl'),
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
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-ink/40 backdrop-blur-sm animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="report-modal-title"
    >
      <div className="surface-card max-w-lg w-full p-6 text-ink shadow-e3 relative overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-start justify-between pb-4 border-b border-border">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-peacock-dark">
                Step {step} of 3
              </span>
              <span className="text-xs text-text-secondary">· Community Contribution</span>
            </div>
            <h3 id="report-modal-title" className="font-serif text-xl font-bold text-ink">
              {step === 1 && 'What did you observe?'}
              {step === 2 && 'Where did it happen?'}
              {step === 3 && 'Details & confirmation'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-text-secondary hover:text-ink p-2 rounded-lg bg-paper hover:bg-raised transition-colors focus-ring-peacock"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Emergency disclaimer banner with SOS entry point */}
        <div className="my-3 p-3 rounded-lg bg-raised border border-border text-xs flex items-center justify-between gap-3">
          <p className="text-text-secondary leading-snug">
            <strong className="text-ink font-semibold">Public Notice:</strong> Community reports do not notify emergency dispatch.
          </p>
          {onOpenEmergency && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenEmergency();
              }}
              className="btn-emergency-sos py-1 px-2.5 text-[11px] font-bold shrink-0 shadow-e1"
            >
              SOS Dispatch
            </button>
          )}
        </div>

        {submitted ? (
          <div className="py-12 flex flex-col items-center justify-center text-center space-y-3 animate-fade-in">
            <div className="w-12 h-12 rounded-full bg-verified-tint text-verified flex items-center justify-center border border-verified/30">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h4 className="font-serif text-lg font-bold text-ink">Report Submitted</h4>
            <p className="text-xs text-text-secondary max-w-xs">
              Thank you for keeping commuters informed. Your report has been saved to the community map feed.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 my-2">
            {/* Step 1: What happened? (Category selection) */}
            {step === 1 && (
              <div className="space-y-2">
                <p className="text-xs text-text-secondary">
                  Select the category that best describes the road or infrastructure condition:
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setCategory(cat.id)}
                      className={`p-3 rounded-lg border text-left transition-colors focus-ring-peacock ${
                        category === cat.id
                          ? 'bg-peacock-tint border-2 border-peacock shadow-e1'
                          : 'bg-white border-border hover:border-border-strong hover:bg-paper'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-base">{cat.icon}</span>
                        <span className="font-bold text-xs text-ink">{cat.label}</span>
                      </div>
                      <p className="text-[11px] text-text-secondary leading-snug">
                        {cat.description}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 2: Where did it happen? (Location) */}
            {step === 2 && (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-ink mb-1">
                    Street, Intersection, or Landmark Name *
                  </label>
                  <input
                    type="text"
                    value={locationName}
                    onChange={(e) => {
                      setLocationName(e.target.value);
                      setValidationError('');
                    }}
                    placeholder="e.g. Tolstoy Road near Janpath junction"
                    className="w-full text-xs font-medium bg-paper rounded-lg px-3 py-2.5 border border-border focus:border-peacock focus-ring-peacock text-ink placeholder:text-text-muted"
                    required
                  />
                  {validationError && (
                    <p className="text-[11px] text-danger mt-1 font-medium">{validationError}</p>
                  )}
                </div>

                <div className="p-3 rounded-lg bg-paper border border-border text-xs text-text-secondary">
                  <div className="flex items-center gap-1.5 font-semibold text-ink mb-1">
                    <MapPin className="w-3.5 h-3.5 text-peacock" />
                    <span>Selected Map Position</span>
                  </div>
                  <div className="font-mono text-[11px]">
                    Lat: {defaultCoords.lat.toFixed(5)}, Lng: {defaultCoords.lng.toFixed(5)}
                  </div>
                  <p className="text-[11px] text-text-muted mt-1">
                    Point was placed at the current center of your map view.
                  </p>
                </div>
              </div>
            )}

            {/* Step 3: Details & Confirmation */}
            {step === 3 && (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-ink mb-1">
                    Description & Helpful Commuter Details (Optional)
                  </label>
                  <textarea
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Provide context (e.g. 2 streetlights out between bus stop and market gate)..."
                    className="w-full text-xs font-medium bg-paper rounded-lg p-3 border border-border focus:border-peacock focus-ring-peacock text-ink placeholder:text-text-muted"
                  />
                </div>

                <div className="p-3 rounded-lg bg-paper border border-border text-xs space-y-1.5">
                  <div className="font-semibold text-ink">Summary of Report</div>
                  <div className="text-text-secondary">
                    <strong>Category:</strong> {CATEGORIES.find((c) => c.id === category)?.label}
                  </div>
                  <div className="text-text-secondary">
                    <strong>Location:</strong> {locationName || 'Location not specified yet'}
                  </div>
                  <div className="text-[11px] text-text-muted pt-1 border-t border-border">
                    Report will remain active for 48 hours for community corroboration.
                  </div>
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
                  className="btn-ink py-2 px-4 text-xs font-bold flex items-center gap-1 shadow-e1"
                >
                  <span>Continue</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  type="submit"
                  className="btn-ink py-2 px-5 text-xs font-bold flex items-center gap-1.5 shadow-e1"
                >
                  <Send className="w-3.5 h-3.5 text-peacock-tint" />
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
