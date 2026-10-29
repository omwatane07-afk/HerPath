'use client';

import React, { useState, useEffect } from 'react';
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
  Sparkles,
  MapPin,
  Clock,
  ShieldCheck,
} from 'lucide-react';
import { PuffyCloud } from '../ui/PuffyCloud';
import { JellyPin } from '../ui/JellyPin';

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
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleShare = () => {
    if (!activeJourney) return;
    const url = `${typeof window !== 'undefined' ? window.location.origin : ''}?journey=${activeJourney.shareToken}`;
    try {
      navigator.clipboard.writeText(
        `Following my journey to ${activeJourney.destinationName}. Local demo link: ${url}`
      );
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard fallback
    }
  };

  const isSharingActive = Boolean(activeJourney && activeJourney.status !== 'arrived');

  return (
    <div className="flex flex-col h-full bg-[#FCFAFF] text-ink overflow-y-auto w-full font-sans">
      {/* Header with Scrapbook Title */}
      <div className="p-4 sm:p-5 border-b border-border bg-white flex items-center justify-between">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-lilac text-grape text-[10px] font-bold mb-1">
            <Sparkles className="w-3 h-3 text-grape" />
            <span>Trusted Companions</span>
          </div>
          <h2 className="font-heading text-xl sm:text-2xl font-extrabold text-ink">Family Trips</h2>
          <p className="text-xs text-soft-ink mt-0.5 font-medium">
            Explicit, user-controlled trip sharing with trusted contacts.
          </p>
        </div>
        {!activeJourney && (
          <button
            type="button"
            onClick={onOpenStartJourneyModal}
            className="btn-primary py-2 px-4 text-xs font-bold flex items-center gap-1.5 shadow-sm"
          >
            <Compass className="w-3.5 h-3.5 text-white" />
            <span>Start Trip</span>
          </button>
        )}
      </div>

      <div className="p-4 sm:p-5 space-y-4 pb-24 lg:pb-8">
        {/* Prominent Sharing ON / OFF State Stamp */}
        <div className="sticker-card p-4 flex items-center justify-between gap-3 bg-white">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs ${
                isSharingActive
                  ? 'bg-emerald-100 text-emerald-800 border-2 border-emerald-300'
                  : 'bg-[#F1EAFF] text-soft-ink border-2 border-lilac'
              }`}
            >
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-heading font-extrabold text-xs uppercase tracking-wider text-ink">
                  Location Sharing Status:
                </span>
                <span
                  className={`text-[11px] font-extrabold px-2 py-0.5 rounded-full ${
                    isSharingActive
                      ? 'bg-emerald-500 text-white animate-pulse'
                      : 'bg-[#F1EAFF] text-soft-ink border border-lilac'
                  }`}
                >
                  {isSharingActive ? 'SHARING: ON' : 'SHARING: OFF'}
                </span>
              </div>
              <p className="text-[11px] text-soft-ink mt-0.5 font-medium">
                {isSharingActive
                  ? `Shared with ${activeJourney?.trustedContact?.name || 'designated contact'} only.`
                  : 'Your device location is strictly private and stored on-device.'}
              </p>
            </div>
          </div>

          {isSharingActive && (
            <button
              type="button"
              onClick={onEndJourney}
              className="px-3.5 py-1.5 rounded-full border-2 border-grape text-grape hover:bg-grape hover:text-white font-bold text-xs uppercase tracking-wide transition-colors"
            >
              Stop Sharing
            </button>
          )}
        </div>

        {/* Active Journey Ribbon or Empty State */}
        {activeJourney ? (
          <section aria-labelledby="active-trip-heading" className="sticker-card p-5 space-y-4 bg-white relative">
            <div className="washi-tape washi-pink w-20 -top-2 left-8" />

            <div className="flex items-center justify-between border-b border-purple-100 pb-3">
              <div>
                <span className="text-[10px] font-extrabold text-grape uppercase tracking-wider font-heading">
                  Active Walk Ribbon
                </span>
                <h3 id="active-trip-heading" className="font-heading text-xl font-extrabold text-ink mt-0.5">
                  {activeJourney.destinationName}
                </h3>
                <p className="text-xs text-soft-ink">
                  Starting from: {activeJourney.originName}
                </p>
              </div>

              <div className="text-right">
                <span className="text-[11px] font-bold text-soft-ink">
                  Started {formatRelativeTime(activeJourney.createdAt)}
                </span>
              </div>
            </div>

            {/* Distinctive Journey Ribbon Visualization */}
            <div className="p-4 rounded-[20px] bg-lilac/40 border border-purple-100 space-y-2">
              <div className="text-xs font-extrabold text-grape uppercase tracking-wider flex items-center justify-between">
                <span>Journey Ribbon Progress</span>
                <span className="font-bold text-soft-ink">Every {activeJourney.checkInIntervalMinutes} min</span>
              </div>

              {/* Horizontal Ribbon Path with Stop Stickers */}
              <div className="relative py-4 px-2">
                {/* Connecting Track Line */}
                <div className="absolute top-1/2 left-6 right-6 -translate-y-1/2 h-1.5 bg-purple-200 rounded-full" />
                <div className="absolute top-1/2 left-6 w-2/3 -translate-y-1/2 h-1.5 bg-grape rounded-full" />

                <div className="relative flex items-center justify-between">
                  {/* Stop 1: Origin */}
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full bg-white border-2 border-grape shadow-sm flex items-center justify-center text-grape font-extrabold text-xs">
                      A
                    </div>
                    <span className="text-[10px] font-bold text-ink mt-1 max-w-[80px] truncate text-center">
                      {activeJourney.originName.split(' ')[0]}
                    </span>
                  </div>

                  {/* Stop 2: En Route Check-in */}
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full bg-emerald-500 border-2 border-white shadow-sm flex items-center justify-center text-white font-extrabold text-xs animate-bounce">
                      ✓
                    </div>
                    <span className="text-[10px] font-bold text-emerald-800 mt-1">En Route</span>
                  </div>

                  {/* Stop 3: Destination */}
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full bg-hotpink border-2 border-white shadow-sm flex items-center justify-center text-white font-extrabold text-xs">
                      B
                    </div>
                    <span className="text-[10px] font-bold text-ink mt-1 max-w-[80px] truncate text-center">
                      {activeJourney.destinationName.split(' ')[0]}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Checkpoints Audit Log */}
            <div className="pt-2 border-t border-purple-100">
              <div className="text-xs font-extrabold uppercase tracking-wider text-soft-ink mb-2 font-heading">
                Check-in Audit Log ({activeJourney.checkIns.length} recorded)
              </div>
              <div className="space-y-1.5">
                {activeJourney.checkIns.slice(0, 4).map((chk) => (
                  <div
                    key={chk.id}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-paper border border-border text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-verified" />
                      <span className="font-bold text-ink">
                        {chk.status === 'arrived' ? 'Arrived Safely' : 'Periodic Confirmation'}
                      </span>
                    </div>
                    <span className="text-soft-ink text-[11px] tabular-nums font-semibold">
                      {isClient
                        ? new Date(chk.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                        : ''}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Shareable Journey Link */}
            <div className="p-3.5 rounded-[18px] bg-paper border border-border text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-ink">Private Journey Link</span>
                <button
                  type="button"
                  onClick={handleShare}
                  className="btn-secondary min-h-[36px] py-1 px-3 text-xs flex items-center gap-1.5"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-verified" /> : <Share2 className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy link'}</span>
                </button>
              </div>
              <p className="text-[11px] text-soft-ink leading-relaxed">
                Local-first sharing: only users with this token can view status.
              </p>
            </div>

            {/* Permanent Stop Sharing Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={onEndJourney}
                className="btn-primary w-full py-3 px-4 font-bold text-xs uppercase tracking-wider shadow-md"
                aria-label="Stop sharing journey location now"
              >
                Stop Sharing Location
              </button>
            </div>
          </section>
        ) : (
          <section className="sticker-card p-6 text-center space-y-3 bg-white">
            <div className="w-20 h-20 mx-auto flex items-center justify-center">
              <PuffyCloud size={75} drift />
            </div>
            <h4 className="font-heading text-lg font-extrabold text-ink">No Journey Currently Active</h4>
            <p className="text-xs text-soft-ink max-w-sm mx-auto leading-relaxed font-medium">
              When you start a journey, choose which designated contact receives your destination and check-in timeline. You can stop sharing at any moment.
            </p>
            <button
              type="button"
              onClick={onOpenStartJourneyModal}
              className="btn-primary py-2.5 px-6 text-xs font-bold inline-flex items-center gap-2 shadow-md"
            >
              <Compass className="w-4 h-4 text-white" />
              <span>Start a Trip Ribbon</span>
            </button>
          </section>
        )}

        {/* Trusted Contacts Section */}
        <section aria-labelledby="trusted-contacts-heading" className="space-y-2.5">
          <div className="flex items-center justify-between">
            <h3 id="trusted-contacts-heading" className="font-heading text-base font-extrabold text-ink">
              Designated Contacts
            </h3>
            <button
              type="button"
              onClick={onOpenAddContact}
              className="text-grape hover:text-grape-hover text-xs font-bold flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add contact</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {trustedContacts.map((contact) => (
              <div
                key={contact.id}
                className="sticker-card p-3.5 flex items-center justify-between gap-3 bg-white"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h4 className="font-heading font-extrabold text-sm text-ink truncate">{contact.name}</h4>
                    {contact.isEmergencyAlertContact && (
                      <span className="text-[10px] font-extrabold text-white bg-emergency px-1.5 py-0.2 rounded-full">
                        SOS
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-soft-ink mt-0.5 font-medium">
                    {contact.relation} · {contact.phone}
                  </p>
                  <div className="text-[10px] text-soft-ink mt-1">
                    State: <span className="font-semibold text-grape">Authorized</span>
                  </div>
                </div>

                <a
                  href={`tel:${contact.phone.replace(/[^0-9+]/g, '')}`}
                  className="btn-secondary min-h-[40px] px-3.5 flex items-center justify-center gap-1.5 text-xs font-bold shrink-0"
                  aria-label={`Call ${contact.name}`}
                >
                  <Phone className="w-3.5 h-3.5 text-ink" />
                  <span>Call</span>
                </a>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};
