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
} from 'lucide-react';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultCoords: Coordinates;
  onSubmitReport: (report: CommunityReport) => void;
  onSubmitStreetlight?: (streetlight: StreetlightSegment) => void;
}

const CATEGORIES: { id: DisturbanceCategory; label: string; icon: string; description: string }[] =
  [
    {
      id: 'streetlight_issue',
      label: 'Streetlight Outage',
      icon: '💡',
      description: 'Lamps off, flickering, or severe shadow area',
    },
    {
      id: 'harassment',
      label: 'Harassment / Loitering',
      icon: '⚠️',
      description: 'Catcalling, stalking, or intimidating behaviour observed',
    },
    {
      id: 'disruptive_group',
      label: 'Disruptive Group',
      icon: '👥',
      description: 'Aggressive crowd or corridor obstruction',
    },
    {
      id: 'broken_footpath',
      label: 'Broken Footpath',
      icon: '🚧',
      description: 'Deep pavement holes, debris, or non-navigable walkway',
    },
    {
      id: 'suspected_intoxication',
      label: 'Intoxication Concern',
      icon: '🚨',
      description: 'Disturbance from visibly intoxicated individuals',
    },
    {
      id: 'transport_disruption',
      label: 'Transit Disruption',
      icon: '🚌',
      description: 'Station entrance barricaded, bus cancelled, or unlit stop',
    },
    {
      id: 'facility_unavailable',
      label: 'Facility Closed / Broken',
      icon: '🚻',
      description: 'Restroom locked, pharmacy closed, or desk unmanned',
    },
    {
      id: 'other_concern',
      label: 'General Travel Concern',
      icon: 'ℹ️',
      description: 'Other infrastructure or environment safety issue',
    },
  ];

export const ReportModal: React.FC<ReportModalProps> = ({
  isOpen,
  onClose,
  defaultCoords,
  onSubmitReport,
  onSubmitStreetlight,
}) => {
  const [category, setCategory] = useState<DisturbanceCategory>('streetlight_issue');
  const [locationName, setLocationName] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [validationError, setValidationError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!locationName.trim()) {
      setValidationError('Please specify a location or street name.');
      return;
    }
    if (!description.trim() || description.trim().length < 5) {
      setValidationError('Please enter a brief description (at least 5 characters).');
      return;
    }

    setIsSubmitting(true);
    setValidationError('');

    const newReport: CommunityReport = {
      id: generateId('rep'),
      category,
      coordinates: defaultCoords,
      locationName: locationName.trim(),
      description: description.trim(),
      status: 'pending',
      source: 'community',
      upvotes: 1,
      flagCount: 0,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 48).toISOString(),
    };

    // If it's a streetlight issue, also record in streetlight infrastructure layer
    if (category === 'streetlight_issue' && onSubmitStreetlight) {
      const newStreetlight: StreetlightSegment = {
        id: generateId('sl'),
        segmentName: locationName.trim(),
        coordinates: defaultCoords,
        status: 'malfunctioning',
        reportedSource: 'community',
        verificationStatus: 'unverified',
        lastReportedAt: new Date().toISOString(),
        notes: description.trim(),
      };
      onSubmitStreetlight(newStreetlight);
    }

    onSubmitReport(newReport);

    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        onClose();
      }, 1500);
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-brand-text/30 backdrop-blur-md animate-fadeIn">
      <div className="surface-pearl border border-white/95 rounded-sheet max-w-lg w-full p-6 text-brand-text shadow-glass-floating relative overflow-hidden">
        {submitted ? (
          <div className="py-8 text-center space-y-3">
            <div className="w-16 h-16 rounded-full bg-teal-50 border border-teal-200 text-teal-600 mx-auto flex items-center justify-center shadow-sm">
              <CheckCircle2 className="w-9 h-9" />
            </div>
            <h3 className="text-xl font-black text-brand-text">Report Submitted</h3>
            <p className="text-xs text-brand-text-secondary max-w-sm mx-auto leading-relaxed">
              Thank you for contributing to collective safety awareness. Your report is now pinned to
              the map and visible to fellow commuters.
            </p>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-brand-border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-danger-50 border border-danger-200 flex items-center justify-center text-danger-500 shadow-sm">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-brand-text">Submit Community Observation</h3>
                  <p className="text-xs text-brand-text-secondary">
                    Transparent reporting for infrastructure and road conditions
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-brand-text-secondary hover:text-brand-text p-2 rounded-xl bg-brand-bg hover:bg-brand-bg-secondary transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Category Selection Grid */}
              <div>
                <label className="block text-[11px] font-bold text-brand-text-muted uppercase tracking-wider mb-2">
                  Select Category
                </label>
                <div className="grid grid-cols-2 gap-2 max-h-44 overflow-y-auto pr-1">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setCategory(cat.id)}
                      className={`p-2.5 rounded-2xl border text-left transition-all flex items-start gap-2.5 ${
                        category === cat.id
                          ? 'bg-teal-50 border-teal-500 text-teal-900 ring-2 ring-teal-500/20 shadow-xs'
                          : 'bg-brand-bg border-brand-border text-brand-text hover:border-brand-border-light hover:bg-brand-bg-secondary'
                      }`}
                    >
                      <span className="text-lg">{cat.icon}</span>
                      <div className="leading-tight">
                        <div className="text-xs font-bold text-brand-text">{cat.label}</div>
                        <div className="text-[10px] text-brand-text-secondary mt-0.5 line-clamp-1 font-medium">
                          {cat.description}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Location Name */}
              <div>
                <label className="block text-[11px] font-bold text-brand-text-muted uppercase tracking-wider mb-1">
                  Street / Landmark Name
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={locationName}
                    onChange={(e) => setLocationName(e.target.value)}
                    placeholder="e.g. Near Janpath Gate 2, Outer Circle alleyway"
                    className="w-full py-2.5 pl-9 pr-3 text-xs rounded-2xl bg-brand-bg border border-brand-border focus:border-teal-500 focus:bg-white focus:ring-2 focus:ring-teal-100 outline-none text-brand-text placeholder-brand-text-muted font-medium transition-all"
                  />
                  <MapPin className="w-4 h-4 text-danger-500 absolute left-3 top-3" />
                </div>
                <div className="text-[10px] text-brand-text-muted mt-1 font-mono">
                  Coordinates: {defaultCoords.lat.toFixed(4)}, {defaultCoords.lng.toFixed(4)}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-[11px] font-bold text-brand-text-muted uppercase tracking-wider mb-1">
                  Specific Observation Details
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe what you observed (e.g. lights completely unlit, dark sidewalk stretch, group blocking entrance)..."
                  className="w-full p-3 text-xs rounded-2xl bg-brand-bg border border-brand-border focus:border-teal-500 focus:bg-white focus:ring-2 focus:ring-teal-100 outline-none text-brand-text placeholder-brand-text-muted resize-none font-medium transition-all"
                />
              </div>

              {/* Validation error if present */}
              {validationError && (
                <div className="p-2.5 rounded-xl bg-danger-50 border border-danger-100 text-danger-700 text-xs font-semibold">
                  {validationError}
                </div>
              )}

              {/* Abuse prevention / emergency notice */}
              <div className="p-3 rounded-2xl bg-brand-bg border border-brand-border text-[11px] text-brand-text-secondary space-y-1 font-medium">
                <div className="flex items-center gap-1.5 text-teal-700 font-bold">
                  <ShieldCheck className="w-4 h-4 text-teal-600" />
                  <span>Privacy & Verification Policy</span>
                </div>
                <p>
                  Your identity is kept private. Reports expire after 48 hours unless corroborated. If
                  you are in immediate distress, dial emergency services directly.
                </p>
              </div>

              {/* Submit Button */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="py-2.5 px-4 rounded-full text-xs font-bold text-brand-text-secondary hover:text-brand-text transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="py-2.5 px-6 rounded-full bg-teal-500 hover:bg-teal-600 active:scale-95 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-md shadow-teal-500/20 transition-all disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <span>Submitting...</span>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Post Report</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
};
