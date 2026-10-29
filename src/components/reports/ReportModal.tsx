'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Coordinates,
  CommunityReport,
  StreetlightSegment,
  ReportEvidence,
  PlaceSuggestion,
} from '@/types';
import { generateId } from '@/lib/utils';
import { getAllCivicCategories, getCivicCategory, CivicCategoryKey } from '@/lib/civic-categories';
import { CivicReportingService, DuplicateMatch } from '@/services/civic-reporting-service';
import { searchPlaces, reverseGeocode } from '@/services/geocoding-service';
import {
  X,
  MapPin,
  Send,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  PhoneCall,
  Camera,
  AlertTriangle,
  Upload,
  Trash2,
  Copy,
  Info,
  ShieldAlert,
  Search,
  Navigation,
  RefreshCw,
} from 'lucide-react';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultCoords: Coordinates;
  existingReports?: CommunityReport[];
  onSubmitReport: (report: CommunityReport) => void;
  onSubmitStreetlight?: (streetlight: StreetlightSegment) => void;
  onOpenEmergency?: () => void;
  onSelectExistingReport?: (reportId: string) => void;
}

export const ReportModal: React.FC<ReportModalProps> = ({
  isOpen,
  onClose,
  defaultCoords,
  existingReports = [],
  onSubmitReport,
  onSubmitStreetlight,
  onOpenEmergency,
  onSelectExistingReport,
}) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [categoryKey, setCategoryKey] = useState<CivicCategoryKey>('broken_streetlight');
  const [selectedCoords, setSelectedCoords] = useState<Coordinates>(defaultCoords);
  const [locationName, setLocationName] = useState('');
  const [description, setDescription] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [submittedReport, setSubmittedReport] = useState<CommunityReport | null>(null);

  // Evidence & Photo Attachment
  const [attachedPhoto, setAttachedPhoto] = useState<{
    file: File;
    previewUrl: string;
    sanitizedName: string;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Duplicate Detection State
  const [duplicateMatches, setDuplicateMatches] = useState<DuplicateMatch[]>([]);
  const [linkedDuplicateOfId, setLinkedDuplicateOfId] = useState<string | null>(null);
  const [dismissDuplicateNotice, setDismissDuplicateNotice] = useState(false);

  // Location Search & GPS State
  const [isLocatingGPS, setIsLocatingGPS] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [placeSuggestions, setPlaceSuggestions] = useState<PlaceSuggestion[]>([]);
  const [isSearchingPlaces, setIsSearchingPlaces] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);

  const categories = getAllCivicCategories();

  // Reset state on open
  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setSelectedCoords(defaultCoords);
      setValidationError(null);
      setSubmittedReport(null);
      setAttachedPhoto(null);
      setLinkedDuplicateOfId(null);
      setDismissDuplicateNotice(false);
      setSearchQuery('');
      setShowSearchDropdown(false);
    }
  }, [isOpen, defaultCoords]);

  // Acquire device location via GPS
  const handleUseCurrentGPS = () => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      setValidationError('Geolocation is not supported on this device browser.');
      return;
    }
    setIsLocatingGPS(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const coords: Coordinates = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        };
        setSelectedCoords(coords);
        try {
          const revName = await reverseGeocode(coords);
          setLocationName(revName);
        } catch {
          setLocationName(`Current GPS (${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)})`);
        }
        setIsLocatingGPS(false);
        setValidationError(null);
      },
      (err) => {
        setIsLocatingGPS(false);
        setValidationError('Location access denied or timed out. Please enter landmark manually.');
      },
      { timeout: 5000, enableHighAccuracy: true }
    );
  };

  // Place Search Autocomplete
  const handleSearchPlacesChange = async (query: string) => {
    setSearchQuery(query);
    if (query.trim().length < 2) {
      setPlaceSuggestions([]);
      setShowSearchDropdown(false);
      return;
    }
    setIsSearchingPlaces(true);
    try {
      const results = await searchPlaces(query);
      setPlaceSuggestions(results);
      setShowSearchDropdown(results.length > 0);
    } catch {
      setPlaceSuggestions([]);
    } finally {
      setIsSearchingPlaces(false);
    }
  };

  const handleSelectPlace = (place: PlaceSuggestion) => {
    setSelectedCoords(place.coordinates);
    setLocationName(place.displayName || place.name);
    setSearchQuery('');
    setShowSearchDropdown(false);
    setValidationError(null);
  };

  // Check for duplicates when category or location changes
  useEffect(() => {
    if (!isOpen || !selectedCoords) return;

    const result = CivicReportingService.detectDuplicates(
      {
        category: categoryKey,
        coordinates: selectedCoords,
        description,
        locationName,
      },
      existingReports,
      120 // 120m radius check
    );

    setDuplicateMatches(result.matches);
  }, [categoryKey, selectedCoords, description, locationName, existingReports, isOpen]);

  if (!isOpen) return null;

  // Handle Photo File Selection
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = CivicReportingService.validatePhotoAttachment(file);
    if (!validation.valid) {
      setValidationError(validation.error || 'Invalid photo attachment');
      return;
    }

    setValidationError(null);
    const previewUrl = URL.createObjectURL(file);
    setAttachedPhoto({
      file,
      previewUrl,
      sanitizedName: validation.sanitizedName || 'evidence.jpg',
    });
  };

  const handleRemovePhoto = () => {
    if (attachedPhoto?.previewUrl) {
      URL.revokeObjectURL(attachedPhoto.previewUrl);
    }
    setAttachedPhoto(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!locationName.trim()) {
      setValidationError('Please enter a location name or landmark.');
      setStep(2);
      return;
    }

    const catConfig = getCivicCategory(categoryKey);
    const now = new Date();
    const freshnessHours = catConfig.defaultFreshnessHours;

    const evidence: ReportEvidence = {
      photoName: attachedPhoto?.sanitizedName,
      photoSizeBytes: attachedPhoto?.file.size,
      photoMimeType: attachedPhoto?.file.type,
      photoUrl: attachedPhoto?.previewUrl,
      submittedWithGps: true,
      notes: attachedPhoto ? 'Photo evidence attached by reporter' : undefined,
    };

    const newReport: CommunityReport = {
      id: generateId('rep'),
      coordinates: selectedCoords,
      locationName: locationName.trim(),
      category: categoryKey,
      description: description.trim() || `Reported ${catConfig.label.toLowerCase()} along pedestrian walkway`,
      source: 'community',
      status: 'pending', // Starts at Pending Review
      upvotes: 1,
      confirmationCount: 1,
      flagCount: 0,
      evidence,
      duplicateOfId: linkedDuplicateOfId || undefined,
      statusHistory: [
        {
          fromStatus: 'pending',
          toStatus: 'pending',
          changedAt: now.toISOString(),
          actor: 'reporter',
          note: linkedDuplicateOfId
            ? `Submitted as corroborating evidence for existing report #${linkedDuplicateOfId}`
            : 'Initial civic report submitted by commuter',
        },
      ],
      createdAt: now.toISOString(),
      expiresAt: new Date(now.getTime() + freshnessHours * 60 * 60 * 1000).toISOString(),
      observedAt: now.toISOString(),
      submittedAt: now.toISOString(),
      isDemoData: false,
    };

    onSubmitReport(newReport);

    // If it's a streetlight issue, also update streetlight layer
    if (categoryKey === 'broken_streetlight' && onSubmitStreetlight) {
      const newStreetlight: StreetlightSegment = {
        id: generateId('stl'),
        segmentName: locationName.trim(),
        coordinates: selectedCoords,
        status: 'malfunctioning',
        reportedSource: 'community',
        verificationStatus: 'unverified',
        lastReportedAt: now.toISOString(),
        notes: description.trim() || 'Community-reported streetlight outage',
      };
      onSubmitStreetlight(newStreetlight);
    }

    setSubmittedReport(newReport);
  };

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 bg-ink/40 backdrop-blur-sm animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="report-modal-title"
    >
      <div className="bg-white max-w-lg w-full max-h-[92dvh] flex flex-col p-4 sm:p-6 text-ink shadow-2xl border border-slate-200/90 rounded-[28px] relative overflow-hidden backdrop-blur-xl">
        {/* Subtle Top Accent */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-grape via-periwinkle to-butter" />

        {/* Modal Header */}
        <div className="flex items-start justify-between pb-3.5 border-b border-border/80">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-grape font-heading">
                Step {step} of 3
              </span>
              <span className="text-xs text-soft-ink font-semibold">· Verified Civic Reporting</span>
            </div>
            <h3 id="report-modal-title" className="font-heading text-xl font-extrabold text-ink">
              {step === 1 && 'What infrastructure issue did you observe?'}
              {step === 2 && 'Where is this located?'}
              {step === 3 && 'Add details & evidence photo'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-soft-ink hover:text-ink p-2 rounded-xl bg-paper hover:bg-lilac/60 transition-colors focus-ring-primary"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Public Notice & SOS Access */}
        <div className="my-3 p-3 rounded-2xl bg-[#FCFAFF] border border-purple-100 text-xs flex items-center justify-between gap-3">
          <p className="text-soft-ink leading-snug">
            <strong className="text-ink font-semibold">Civic Protocol:</strong> Reports are audited before verification and do not alert emergency dispatch.
          </p>
          {onOpenEmergency && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenEmergency();
              }}
              className="text-emergency hover:bg-danger-tint px-2.5 py-1 rounded-full border border-emergency/30 font-bold flex items-center gap-1 shrink-0 transition-colors text-xs"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>SOS</span>
            </button>
          )}
        </div>

        {/* Duplicate Detection Alert Banner (Shows when a duplicate is found) */}
        {duplicateMatches.length > 0 && !dismissDuplicateNotice && !submittedReport && (
          <div className="my-2.5 p-3.5 rounded-2xl bg-amber-50 border border-amber-300 text-xs text-amber-900 space-y-2 animate-fade-in">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 font-bold font-heading">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Similar Active Report Found Nearby</span>
              </div>
              <button
                type="button"
                onClick={() => setDismissDuplicateNotice(true)}
                className="text-[11px] text-amber-700 hover:text-amber-900 font-semibold"
              >
                Dismiss
              </button>
            </div>
            <p className="text-[11px] leading-relaxed">
              &ldquo;{duplicateMatches[0].report.locationName}&rdquo; ({duplicateMatches[0].distanceMeters}m away)
              was reported with status <strong>{duplicateMatches[0].report.status}</strong>.
            </p>
            <div className="flex items-center gap-2 pt-1 flex-wrap">
              <button
                type="button"
                onClick={() => {
                  setLinkedDuplicateOfId(duplicateMatches[0].report.id);
                  setDismissDuplicateNotice(true);
                }}
                className="px-3 py-1 rounded-full bg-amber-600 hover:bg-amber-700 text-white font-bold text-[11px] shadow-xs flex items-center gap-1"
              >
                <Copy className="w-3 h-3" />
                <span>Corroborate Existing Report</span>
              </button>
              {onSelectExistingReport && (
                <button
                  type="button"
                  onClick={() => {
                    onSelectExistingReport(duplicateMatches[0].report.id);
                    onClose();
                  }}
                  className="px-2.5 py-1 rounded-full bg-white border border-amber-300 text-amber-900 font-semibold text-[11px]"
                >
                  View Details
                </button>
              )}
            </div>
          </div>
        )}

        {submittedReport ? (
          <div className="py-8 text-center space-y-3.5 animate-fade-in">
            <CheckCircle2 className="w-14 h-14 text-emerald-600 mx-auto" />
            <h4 className="font-heading text-lg font-extrabold text-ink">
              Report Submitted for Civic Verification
            </h4>
            <div className="p-3 rounded-2xl bg-[#FCFAFF] border border-purple-200 text-xs text-soft-ink max-w-sm mx-auto text-left space-y-1">
              <div>
                <strong>Report ID:</strong> <span className="font-mono">{submittedReport.id}</span>
              </div>
              <div>
                <strong>Status:</strong> <span className="text-amber-700 font-bold">Pending Review</span>
              </div>
              <div>
                <strong>Category:</strong> {getCivicCategory(submittedReport.category).label}
              </div>
              {submittedReport.evidence?.photoName && (
                <div>
                  <strong>Evidence:</strong> Photo attached ({submittedReport.evidence.photoName})
                </div>
              )}
            </div>
            <p className="text-xs text-soft-ink max-w-sm mx-auto leading-relaxed">
              Your observation has been persisted and queued for authorized review. Verified reports will automatically inform routing recommendations for all commuters.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="btn-primary py-2.5 px-6 text-xs font-bold"
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0 overflow-hidden my-2">
            <div className="flex-1 overflow-y-auto pr-1 space-y-4">
            {/* STEP 1: Issue Category Selection */}
            {step === 1 && (
              <div className="space-y-2.5 animate-fade-in">
                <div className="text-xs font-semibold text-soft-ink mb-1">
                  Select an infrastructure category:
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setCategoryKey(cat.id)}
                      className={`p-3 rounded-2xl border text-left transition-all flex items-start gap-2.5 ${
                        categoryKey === cat.id
                          ? 'border-2 border-grape bg-lilac/40 shadow-sm'
                          : 'border-border bg-white hover:bg-paper'
                      }`}
                    >
                      <span className="text-xl shrink-0 mt-0.5">{cat.icon}</span>
                      <div className="min-w-0">
                        <div className="font-bold text-xs text-ink leading-snug">{cat.shortName}</div>
                        <div className="text-[11px] text-soft-ink mt-0.5 leading-tight">
                          {cat.description}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* STEP 2: Location Information */}
            {step === 2 && (
              <div className="space-y-3.5 animate-fade-in">
                {/* Method 1: Search Address or Landmark */}
                <div className="relative">
                  <label className="block text-xs font-bold text-ink mb-1 font-heading">
                    Search Location or Landmark
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => handleSearchPlacesChange(e.target.value)}
                      placeholder="Type landmark (e.g. Mandi House, Janpath, CP Gate 2)..."
                      className="w-full text-xs bg-paper rounded-xl pl-8 pr-3 py-2 border border-border focus:border-grape text-ink font-semibold focus:outline-none"
                    />
                    <Search className="w-3.5 h-3.5 text-soft-ink absolute left-2.5 top-3" />
                    {isSearchingPlaces && (
                      <RefreshCw className="w-3.5 h-3.5 text-grape animate-spin absolute right-3 top-3" />
                    )}
                  </div>

                  {showSearchDropdown && placeSuggestions.length > 0 && (
                    <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-border rounded-xl shadow-lg z-50 max-h-48 overflow-y-auto">
                      {placeSuggestions.map((p) => (
                        <div
                          key={p.id}
                          onClick={() => handleSelectPlace(p)}
                          className="p-2.5 hover:bg-lilac/30 cursor-pointer text-xs border-b border-border/50 last:border-0"
                        >
                          <div className="font-bold text-ink">{p.name}</div>
                          <div className="text-[11px] text-soft-ink truncate">{p.displayName}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Method 2: Current GPS Quick Action */}
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-purple-50/70 border border-purple-200">
                  <div className="flex items-center gap-2 text-xs text-ink font-semibold">
                    <Navigation className="w-4 h-4 text-grape" />
                    <span>Use Your Device's Current GPS:</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleUseCurrentGPS}
                    disabled={isLocatingGPS}
                    className="px-3 py-1 rounded-lg bg-grape hover:bg-grape/90 text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow-xs"
                  >
                    <RefreshCw className={`w-3 h-3 ${isLocatingGPS ? 'animate-spin' : ''}`} />
                    <span>{isLocatingGPS ? 'Acquiring...' : 'Use My GPS'}</span>
                  </button>
                </div>

                {/* Location Name Field (Can be edited or confirmed) */}
                <div>
                  <label className="block text-xs font-bold text-ink mb-1 font-heading">
                    Street, Intersection, or Landmark Name *
                  </label>
                  <input
                    type="text"
                    value={locationName}
                    onChange={(e) => {
                      setLocationName(e.target.value);
                      setValidationError(null);
                    }}
                    placeholder="e.g. Connaught Place Outer Circle, near Gate 4"
                    className="w-full text-xs bg-paper rounded-xl p-2.5 border border-border focus:border-grape text-ink font-semibold focus:outline-none"
                    required
                  />
                  {validationError && (
                    <p className="text-danger text-[11px] font-medium mt-1">{validationError}</p>
                  )}
                </div>

                {/* Selected Coordinates Confirmation Badge */}
                <div className="p-3 rounded-xl bg-paper border border-border text-xs flex items-center justify-between text-soft-ink">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-grape" />
                    <span className="font-semibold text-ink">Selected GPS Coordinates:</span>
                  </div>
                  <span className="font-mono text-ink font-bold">
                    {selectedCoords.lat.toFixed(5)}, {selectedCoords.lng.toFixed(5)}
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-[#FCFAFF] border border-purple-100 text-[11px] text-soft-ink flex items-start gap-2">
                  <Info className="w-4 h-4 text-grape shrink-0 mt-0.5" />
                  <span>
                    Reports are mapped to pedestrian corridors within 180m. Precise reporter identity is never displayed publicly.
                  </span>
                </div>
              </div>
            )}

            {/* STEP 3: Details & Optional Photo Attachment */}
            {step === 3 && (
              <div className="space-y-3.5 animate-fade-in">
                <div>
                  <label className="block text-xs font-bold text-ink mb-1 font-heading">
                    Detailed Observations (Optional)
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe what you observed (e.g., number of broken fixtures, depth of pothole, blocked width)..."
                    rows={3}
                    className="w-full text-xs bg-paper rounded-xl p-2.5 border border-border focus:border-grape text-ink font-medium focus:outline-none"
                  />
                </div>

                {/* Photo Evidence Upload Box */}
                <div>
                  <label className="block text-xs font-bold text-ink mb-1.5 font-heading">
                    Photo Evidence (Optional, max 5MB)
                  </label>

                  {attachedPhoto ? (
                    <div className="p-3 rounded-2xl bg-purple-50/60 border border-purple-200 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        {/* Thumbnail */}
                        <img
                          src={attachedPhoto.previewUrl}
                          alt="Evidence thumbnail"
                          className="w-12 h-12 rounded-xl object-cover border border-purple-200 shrink-0"
                        />
                        <div className="min-w-0">
                          <div className="font-bold text-xs text-ink truncate">
                            {attachedPhoto.sanitizedName}
                          </div>
                          <div className="text-[11px] text-soft-ink">
                            {(attachedPhoto.file.size / (1024 * 1024)).toFixed(2)} MB · Validated Image
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={handleRemovePhoto}
                        className="p-2 rounded-xl text-soft-ink hover:text-danger hover:bg-danger-tint transition-colors"
                        title="Remove photo"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-purple-200 hover:border-grape/70 rounded-2xl p-4 text-center cursor-pointer bg-paper hover:bg-lilac/30 transition-all"
                    >
                      <Camera className="w-6 h-6 text-grape mx-auto mb-1.5" />
                      <div className="text-xs font-bold text-ink">Click to attach photo evidence</div>
                      <div className="text-[11px] text-soft-ink mt-0.5">JPEG, PNG, or WebP up to 5MB</div>
                    </div>
                  )}

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                </div>

                {linkedDuplicateOfId && (
                  <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-900 flex items-center gap-1.5">
                    <Copy className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span>This report will be linked to existing Report #{linkedDuplicateOfId} as corroborating evidence.</span>
                  </div>
                )}

                <div className="p-3 rounded-xl bg-purple-50/50 border border-purple-100 text-[11px] text-soft-ink leading-relaxed">
                  <strong className="text-ink font-semibold">Verification Lifecycle:</strong> Submissions start in <em>Pending</em>. Reviewers verify corroborating evidence before issues are elevated into official route advisories.
                </div>
              </div>
            )}

            </div>

            {/* Modal Navigation Footer */}
            <div className="pt-3 border-t border-border flex items-center justify-between shrink-0">
              {step > 1 ? (
                <button
                  type="button"
                  onClick={() => setStep((s) => (s - 1) as any)}
                  className="btn-secondary py-2 px-3 text-xs flex items-center gap-1 font-bold"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Back</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onClose}
                  className="btn-secondary py-2 px-3 text-xs font-bold"
                >
                  Cancel
                </button>
              )}

              {step < 3 ? (
                <button
                  type="button"
                  onClick={() => {
                    if (step === 2 && !locationName.trim()) {
                      setValidationError('Please enter a location name or landmark.');
                      return;
                    }
                    setStep((s) => (s + 1) as any);
                  }}
                  className="btn-primary py-2 px-4 text-xs font-bold flex items-center gap-1 shadow-md"
                >
                  <span>Continue</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  type="submit"
                  className="btn-primary py-2 px-5 text-xs font-bold flex items-center gap-1.5 shadow-md"
                >
                  <Send className="w-3.5 h-3.5 text-white" />
                  <span>Submit for Review</span>
                </button>
              )}
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
