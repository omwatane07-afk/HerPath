'use client';

import React, { useState } from 'react';
import { JourneySession, TrustedContact } from '@/types';
import { formatRelativeTime } from '@/lib/utils';
import {
  Users,
  Compass,
  CheckCircle2,
  Plus,
  Phone,
  Share2,
  Check,
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
    <div className="flex flex-col h-full bg-canvas text-bordeaux overflow-y-auto w-full">
      {/* Header */}
      <div className="p-4 sm:p-5 border-b border-border bg-white shadow-sm flex items-center justify-between">
        <div>
          <h2 className="font-editorial text-xl font-bold text-bordeaux">Family Journey Companion</h2>
          <p className="text-xs text-text-secondary mt-0.5">
            Explicit, user-controlled trip sharing with trusted contacts.
          </p>
        </div>
        {!activeJourney && (
          <button
            type="button"
            onClick={onOpenStartJourneyModal}
            className="btn-bordeaux py-2 px-3.5 text-xs font-semibold flex items-center gap-1.5 shadow-sm"
          >
            <Compass className="w-3.5 h-3.5 text-champagne" />
            <span>Start a trip</span>
          </button>
        )}
      </div>

      <div className="p-4 sm:p-5 space-y-4 pb-24 lg:pb-8">
        {/* Trusted Contacts Section (Always Displayed Above the Fold) */}
        <section aria-labelledby="trusted-contacts-heading" className="space-y-2.5">
          <div className="flex items-center justify-between">
            <h3 id="trusted-contacts-heading" className="font-editorial text-base font-bold text-bordeaux">
              Trusted Contacts
            </h3>
            <button
              type="button"
              onClick={onOpenAddContact}
              className="text-rose-gold hover:text-bordeaux text-xs font-semibold flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add contact</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {trustedContacts.map((contact) => (
              <div
                key={contact.id}
                className="surface-card p-3.5 flex items-center justify-between gap-3 shadow-e1 border border-border hover:border-champagne transition-colors"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h4 className="font-bold text-sm text-bordeaux truncate">{contact.name}</h4>
                    {contact.isEmergencyAlertContact && (
                      <span className="text-[10px] font-semibold text-danger bg-danger-tint px-1.5 py-0.2 rounded-full border border-danger/30">
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
                  <Phone className="w-3.5 h-3.5 text-bordeaux" />
                  <span>Call</span>
                </a>
              </div>
            ))}
          </div>
        </section>

        {/* Active Journey Card or Empty State */}
        {activeJourney ? (
          <section aria-labelledby="active-trip-heading" className="surface-card p-5 space-y-4 shadow-atelier border border-border-gold/60">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-tint text-rose-gold border border-rose-gold/30">
                <span className="w-2 h-2 rounded-full bg-rose-gold animate-pulse" />
                Trip Sharing Active
              </span>
              <span className="text-xs text-text-secondary font-medium">
                Started {formatRelativeTime(activeJourney.createdAt)}
              </span>
            </div>

            <div>
              <div className="text-[10px] font-bold text-rose-gold uppercase tracking-wider font-editorial">
                Destination
              </div>
              <h3 id="active-trip-heading" className="font-editorial text-2xl font-bold text-bordeaux mt-0.5">
                {activeJourney.destinationName}
              </h3>
              <p className="text-xs text-text-secondary mt-0.5">
                Starting from: {activeJourney.originName}
              </p>
            </div>

            {/* Explicit Breakdown of What's Shared & Privacy Scope */}
            <div className="p-3.5 rounded-xl bg-surface-raised border border-border text-xs space-y-2">
              <h4 className="font-bold text-xs text-bordeaux flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-rose-gold" />
                <span>What information is shared</span>
              </h4>
              <ul className="space-y-1 text-text-secondary">
                <li className="flex items-start gap-1.5">
                  <span className="text-bordeaux font-bold">•</span>
                  <span><strong>Viewer:</strong> {activeJourney.trustedContact?.name || 'Trusted Contact'} ({activeJourney.trustedContact?.phone || 'No phone recorded'})</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-bordeaux font-bold">•</span>
                  <span><strong>Shared data:</strong> Destination name, planned corridor, and periodic check-in status</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-bordeaux font-bold">•</span>
                  <span><strong>Check-in frequency:</strong> Every {activeJourney.checkInIntervalMinutes} minutes</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-bordeaux font-bold">•</span>
                  <span><strong>Sharing expires:</strong> Automatically upon marked safe arrival or when stopped below</span>
                </li>
              </ul>
            </div>

            {/* Checkpoints Audit Log */}
            <div className="pt-3 border-t border-border">
              <div className="text-xs font-bold uppercase tracking-wider text-text-secondary mb-2 font-editorial">
                Check-in Audit Log ({activeJourney.checkIns.length} recorded)
              </div>
              <div className="space-y-1.5">
                {activeJourney.checkIns.slice(0, 4).map((chk) => (
                  <div
                    key={chk.id}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-canvas border border-border text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-verified" />
                      <span className="font-semibold text-bordeaux">
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
            <div className="p-3.5 rounded-xl bg-canvas border border-border text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-bordeaux">Shareable Journey Link</span>
                <button
                  type="button"
                  onClick={handleShare}
                  className="btn-secondary py-1 px-2.5 text-xs flex items-center gap-1.5"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-verified" /> : <Share2 className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy link'}</span>
                </button>
              </div>
              <p className="text-[11px] text-text-muted leading-relaxed">
                Demo link copied to clipboard. In this evaluation mode, journey data is stored on this device only.
              </p>
            </div>

            {/* Permanent STOP SHARING Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={onEndJourney}
                className="w-full py-3 px-4 rounded-xl border-2 border-bordeaux text-bordeaux hover:bg-bordeaux hover:text-white font-bold text-xs uppercase tracking-wider transition-all shadow-sm focus-ring-bordeaux"
                aria-label="Stop sharing journey location now"
              >
                Stop Sharing Location
              </button>
            </div>
          </section>
        ) : (
          <section className="surface-card p-6 text-center space-y-3 shadow-e1 border border-border">
            {/* Hand-authored SVG Clay & Ink Illustration */}
            <div className="w-24 h-24 mx-auto" aria-hidden="true">
              <svg viewBox="0 0 96 96" fill="none" className="w-full h-full">
                <circle cx="48" cy="48" r="44" fill="#FAF6F0" stroke="#D4A359" strokeWidth="1.5" strokeDasharray="3 3" />
                <path d="M48 24C38 24 30 32 30 42C30 55 48 72 48 72C48 72 66 55 66 42C66 32 58 24 48 24Z" fill="#FCEEF2" stroke="#C8415F" strokeWidth="2" />
                <circle cx="48" cy="42" r="7" fill="#240D1E" />
                <path d="M26 68L36 62M70 68L60 62" stroke="#D4A359" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>
            <div className="text-[10px] text-text-muted uppercase tracking-wider font-mono">
              Illustration, not a map record
            </div>
            <h4 className="font-editorial text-lg font-bold text-bordeaux">No Journey Currently Shared</h4>
            <p className="text-xs text-text-secondary max-w-sm mx-auto leading-relaxed">
              When you start a trip, you choose which trusted contact receives your destination, expected arrival, and periodic check-in status. You can stop sharing at any moment.
            </p>
            <button
              type="button"
              onClick={onOpenStartJourneyModal}
              className="btn-bordeaux py-2.5 px-5 text-xs font-bold inline-flex items-center gap-2 shadow-md"
            >
              <Compass className="w-4 h-4 text-champagne" />
              <span>Start a trip</span>
            </button>
          </section>
        )}
      </div>
    </div>
  );
};
