'use client';

import React, { useState } from 'react';
import { JourneySession, TrustedContact } from '@/types';
import { formatRelativeTime } from '@/lib/utils';
import {
  Users,
  Compass,
  CheckCircle2,
  ShieldCheck,
  Plus,
  Phone,
  Share2,
  Check,
  Clock,
  Shield,
  Eye,
  Info,
} from 'lucide-react';

interface FamilyTripsViewProps {
  activeJourney: JourneySession | null;
  trustedContacts: TrustedContact[];
  onOpenStartJourneyModal: () => void;
  onEndJourney: () => void;
  onOpenAddContact: () => void;
}

export const FamilyTripsView: React.FC<FamilyTripsViewProps> = ({
  activeJourney,
  trustedContacts,
  onOpenStartJourneyModal,
  onEndJourney,
  onOpenAddContact,
}) => {
  const [copied, setCopied] = useState(false);

  const handleShare = () => {
    if (!activeJourney) return;
    const url = `${typeof window !== 'undefined' ? window.location.origin : ''}?journey=${activeJourney.shareToken}`;
    navigator.clipboard.writeText(
      `Following my journey to ${activeJourney.destinationName}. Local demo link: ${url}`
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col h-full bg-paper text-ink overflow-y-auto w-full">
      {/* Header */}
      <div className="p-4 sm:p-5 border-b border-border bg-white shadow-e1 flex items-center justify-between">
        <div>
          <h2 className="font-serif text-xl font-bold text-ink">Family Journey Companion</h2>
          <p className="text-xs text-text-secondary mt-0.5">
            Explicit, user-controlled trip sharing with trusted contacts.
          </p>
        </div>
        {!activeJourney && (
          <button
            type="button"
            onClick={onOpenStartJourneyModal}
            className="btn-ink py-2 px-3.5 text-xs font-semibold flex items-center gap-1.5 shadow-e1"
          >
            <Compass className="w-3.5 h-3.5 text-peacock-tint" />
            <span>Start a trip</span>
          </button>
        )}
      </div>

      <div className="p-4 sm:p-5 space-y-4 pb-24 lg:pb-8">
        {/* Trusted Contacts Section (Always Displayed Above the Fold) */}
        <section aria-labelledby="trusted-contacts-heading" className="space-y-2.5">
          <div className="flex items-center justify-between">
            <h3 id="trusted-contacts-heading" className="font-serif text-base font-bold text-ink">
              Trusted Contacts
            </h3>
            <button
              type="button"
              onClick={onOpenAddContact}
              className="text-peacock-dark hover:text-ink text-xs font-semibold flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add contact</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {trustedContacts.map((contact) => (
              <div
                key={contact.id}
                className="surface-card p-3 flex items-center justify-between gap-3 shadow-e1"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h4 className="font-bold text-sm text-ink truncate">{contact.name}</h4>
                    {contact.isEmergencyAlertContact && (
                      <span className="text-[10px] font-semibold text-danger bg-danger-tint px-1.5 py-0.2 rounded border border-danger/30">
                        SOS
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-text-secondary mt-0.5">
                    {contact.relation} · {contact.phone}
                  </p>
                  <div className="text-[10px] text-text-muted mt-1">
                    Delivery state: <span className="font-medium">Device local / Unknown</span>
                  </div>
                </div>

                <a
                  href={`tel:${contact.phone.replace(/[^0-9+]/g, '')}`}
                  className="btn-secondary min-h-[44px] min-w-[44px] px-3.5 flex items-center justify-center gap-1.5 text-xs font-semibold shrink-0"
                  aria-label={`Call ${contact.name}`}
                >
                  <Phone className="w-3.5 h-3.5 text-ink" />
                  <span>Call</span>
                </a>
              </div>
            ))}
          </div>
        </section>

        {/* Active Journey Card or Empty State */}
        {activeJourney ? (
          <section aria-labelledby="active-trip-heading" className="surface-card p-5 space-y-4 shadow-e1">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold bg-peacock-tint text-peacock-dark border border-peacock/30">
                <span className="w-2 h-2 rounded-full bg-peacock" />
                Trip Sharing Active
              </span>
              <span className="text-xs text-text-secondary font-medium">
                Started {formatRelativeTime(activeJourney.createdAt)}
              </span>
            </div>

            <div>
              <div className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
                Destination
              </div>
              <h3 id="active-trip-heading" className="font-serif text-xl font-bold text-ink mt-0.5">
                {activeJourney.destinationName}
              </h3>
              <p className="text-xs text-text-secondary mt-0.5">
                Starting from: {activeJourney.originName}
              </p>
            </div>

            {/* Explicit Breakdown of What's Shared & Privacy Scope */}
            <div className="p-3.5 rounded-lg bg-raised border border-border text-xs space-y-2">
              <h4 className="font-bold text-xs text-ink flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-peacock" />
                <span>What information is shared</span>
              </h4>
              <ul className="space-y-1 text-text-secondary">
                <li className="flex items-start gap-1.5">
                  <span className="text-ink font-bold">•</span>
                  <span><strong>Viewer:</strong> {activeJourney.trustedContact?.name || 'Trusted Contact'} ({activeJourney.trustedContact?.phone || 'No phone recorded'})</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-ink font-bold">•</span>
                  <span><strong>Shared data:</strong> Destination name, planned corridor, and periodic check-in status</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-ink font-bold">•</span>
                  <span><strong>Check-in frequency:</strong> Every {activeJourney.checkInIntervalMinutes} minutes</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-ink font-bold">•</span>
                  <span><strong>Sharing expires:</strong> Automatically upon marked safe arrival or when stopped below</span>
                </li>
              </ul>
            </div>

            {/* Checkpoints Audit Log */}
            <div className="pt-3 border-t border-border">
              <div className="text-xs font-bold uppercase tracking-wider text-text-secondary mb-2">
                Check-in Audit Log ({activeJourney.checkIns.length} recorded)
              </div>
              <div className="space-y-1.5">
                {activeJourney.checkIns.slice(0, 4).map((chk) => (
                  <div
                    key={chk.id}
                    className="flex items-center justify-between p-2 rounded-md bg-paper border border-border text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-verified" />
                      <span className="font-semibold text-ink">
                        {chk.status === 'arrived' ? 'Arrived Safely' : 'Periodic Confirmation'}
                      </span>
                    </div>
                    <span className="text-text-secondary text-[11px]">
                      {new Date(chk.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Sharing Link & Honest Notice */}
            <div className="p-3 rounded-lg bg-paper border border-border text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-ink">Journey Access Link</span>
                <button
                  type="button"
                  onClick={handleShare}
                  className="btn-secondary py-1 px-2.5 text-xs flex items-center gap-1"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-peacock" /> : <Share2 className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Link Copied' : 'Copy Link'}</span>
                </button>
              </div>
              <p className="text-[11px] text-text-secondary leading-relaxed">
                *Link copied. In this local evaluation environment, data is persisted in browser storage and is not transmitted over an SMS or cloud server.
              </p>
            </div>

            {/* Stop Sharing Button (Always visible and accessible) */}
            <div className="pt-2">
              <button
                type="button"
                onClick={onEndJourney}
                className="w-full py-2.5 px-4 rounded-lg bg-white border-2 border-danger text-xs font-bold text-danger hover:bg-danger-tint transition-colors focus-ring-peacock"
              >
                Stop sharing journey
              </button>
            </div>
          </section>
        ) : (
          /* Empty State: Restrained clay illustration + explanation + Start Trip */
          <div className="surface-card p-6 text-center space-y-4 shadow-e1">
            {/* Inline SVG Isometric/Hand-authored illustration in Clay + Ink style */}
            <div className="w-24 h-24 mx-auto flex items-center justify-center">
              <svg width="80" height="80" viewBox="0 0 80 80" fill="none" aria-hidden="true">
                <rect x="15" y="25" width="50" height="40" rx="8" fill="#F8F4EC" stroke="#14213D" strokeWidth="2" />
                <path d="M15 45L40 32L65 45" stroke="#D8A58E" strokeWidth="2.5" strokeLinecap="round" />
                <circle cx="40" cy="32" r="5" fill="#0E7C86" stroke="#FFFFFF" strokeWidth="1.5" />
                <circle cx="28" cy="52" r="3" fill="#D8A58E" />
                <circle cx="52" cy="52" r="3" fill="#14213D" />
                <path d="M28 52H52" stroke="#B9AF99" strokeWidth="1.5" strokeDasharray="3 3" />
              </svg>
            </div>
            <p className="text-[10px] uppercase font-bold text-text-muted tracking-wider">
              Illustration, not a map record
            </p>

            <div>
              <h3 className="font-serif text-lg font-bold text-ink">No Journey Currently Running</h3>
              <p className="text-xs text-text-secondary mt-1 max-w-sm mx-auto leading-relaxed">
                When you depart, start a journey to share your route and check-in timeline with trusted contacts. You control who sees your trip and can stop sharing anytime.
              </p>
            </div>

            <button
              type="button"
              onClick={onOpenStartJourneyModal}
              className="btn-ink py-2.5 px-6 text-xs font-bold shadow-e1 inline-flex items-center gap-2"
            >
              <Compass className="w-4 h-4 text-peacock-tint" />
              <span>Start a trip</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
