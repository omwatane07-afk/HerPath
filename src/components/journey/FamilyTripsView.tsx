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
    const url = `${window.location.origin}?journey=${activeJourney.shareToken}`;
    navigator.clipboard.writeText(
      `Following my journey to ${activeJourney.destinationName}. Live link: ${url}`
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col h-full bg-brand-bg text-brand-text overflow-y-auto w-full">
      {/* Header */}
      <div className="p-3.5 sm:p-5 border-b border-brand-border/70 glass-pearl flex items-center justify-between">
        <div>
          <h2 className="text-base sm:text-lg font-black text-brand-text flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center border border-teal-200/90 shadow-xs ring-1 ring-champagne-300/60">
              <Users className="w-4 h-4 text-teal-600" />
            </div>
            <span>Family Journey Companion</span>
          </h2>
          <p className="text-[11px] sm:text-xs text-brand-text-secondary mt-1 font-medium leading-relaxed">
            Explicit, consent-based trip sharing for peace of mind
          </p>
        </div>
        {!activeJourney && (
          <button
            onClick={onOpenStartJourneyModal}
            className="flex items-center gap-1.5 py-2 px-3.5 rounded-full bg-gradient-to-r from-teal-500 to-teal-700 hover:from-teal-600 hover:to-teal-800 text-white font-bold text-xs uppercase tracking-wider shadow-xs transition-all active:scale-95"
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Start Trip</span>
          </button>
        )}
      </div>

      <div className="p-3.5 sm:p-5 space-y-4 sm:space-y-5 pb-24 lg:pb-8">
        {/* Active Journey Card or Empty State */}
        {activeJourney ? (
          <div className="p-5 rounded-royal glass-pearl border border-teal-200/90 shadow-glass-pearl space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold tracking-wider px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-700 shadow-xs flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-teal-500 ring-2 ring-teal-200 animate-pulse" />
                Live Trip Active
              </span>
              <span className="text-xs text-brand-text-secondary font-medium">
                Created {formatRelativeTime(activeJourney.createdAt)}
              </span>
            </div>

            <div>
              <div className="text-xs text-brand-text-muted font-bold uppercase tracking-wider">
                Destination
              </div>
              <h3 className="text-xl font-black text-brand-text leading-tight mt-0.5">
                {activeJourney.destinationName}
              </h3>
              <p className="text-xs text-brand-text-secondary mt-0.5 font-medium">
                From: {activeJourney.originName}
              </p>
            </div>

            {/* Checkpoints Timeline */}
            <div className="pt-3 border-t border-brand-border/70">
              <div className="text-xs font-bold uppercase tracking-wider text-brand-text-muted mb-2.5">
                Check-in Audit Log ({activeJourney.checkIns.length} recorded)
              </div>
              <div className="space-y-2">
                {activeJourney.checkIns.map((chk) => (
                  <div
                    key={chk.id}
                    className="flex items-start gap-2.5 p-3 rounded-2xl bg-white/80 border border-brand-border/80 text-xs shadow-xs"
                  >
                    <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-brand-text">
                          {chk.status === 'arrived' ? 'Arrived at Destination' : 'Checkpoint Confirmed Safe'}
                        </span>
                        <span className="text-[10px] text-brand-text-muted font-medium">
                          {formatRelativeTime(chk.timestamp)}
                        </span>
                      </div>
                      {chk.note && (
                        <p className="text-[11px] text-brand-text-secondary mt-0.5 font-medium">
                          {chk.note}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="pt-3 border-t border-brand-border/70 flex items-center justify-between gap-2">
              <button
                onClick={handleShare}
                className="py-2 px-3.5 rounded-full bg-white/80 hover:bg-white text-xs font-bold text-brand-text flex items-center gap-1.5 border border-brand-border transition-colors shadow-xs active:scale-95"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-teal-600" /> : <Share2 className="w-3.5 h-3.5" />}
                <span>{copied ? 'Link Copied' : 'Share Link'}</span>
              </button>

              <button
                onClick={onEndJourney}
                className="py-2 px-4 rounded-full bg-danger-50 hover:bg-danger-100 text-xs font-bold text-danger-700 border border-danger-200 transition-colors active:scale-95"
              >
                End & Stop Sharing
              </button>
            </div>
          </div>
        ) : (
          <div className="p-8 rounded-royal surface-pearl border border-dashed border-brand-border/80 text-center space-y-3 shadow-card">
            <div className="w-14 h-14 rounded-2xl bg-teal-50 text-teal-600 mx-auto flex items-center justify-center border border-teal-200 shadow-xs ring-1 ring-champagne-300/60">
              <Compass className="w-7 h-7 stroke-1 text-teal-600" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-brand-text">No Active Journey Sharing</h3>
              <p className="text-xs text-brand-text-secondary max-w-xs mx-auto mt-1 leading-relaxed">
                Plan a route and start a family companion trip to share automated check-ins and
                expected arrival reminders with trusted contacts.
              </p>
            </div>
            <button
              onClick={onOpenStartJourneyModal}
              className="py-2.5 px-5 rounded-full bg-gradient-to-r from-teal-500 to-teal-700 hover:from-teal-600 hover:to-teal-800 text-white font-bold text-xs uppercase tracking-wider shadow-xs transition-all active:scale-95"
            >
              Start New Journey
            </button>
          </div>
        )}

        {/* Trusted Contacts Management */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-brand-text-muted">
              Configured Trusted Contacts ({trustedContacts.length})
            </h3>
            <button
              onClick={onOpenAddContact}
              className="text-[11px] text-teal-800 hover:text-teal-900 font-bold flex items-center gap-1 bg-teal-50 px-3 py-1 rounded-full border border-teal-200/80 shadow-xs"
            >
              <Plus className="w-3 h-3 text-teal-600" />
              <span>Add Contact</span>
            </button>
          </div>

          <div className="space-y-2">
            {trustedContacts.map((contact) => (
              <div
                key={contact.id}
                className="p-3.5 rounded-royal surface-pearl border border-brand-border/80 shadow-card flex items-center justify-between text-xs"
              >
                <div>
                  <div className="font-bold text-brand-text flex items-center gap-2">
                    <span>{contact.name}</span>
                    {contact.isEmergencyAlertContact && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] bg-danger-50 text-danger-700 border border-danger-200 font-bold">
                        Primary SOS
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-brand-text-secondary mt-0.5 font-medium">
                    {contact.relation} • {contact.phone}
                  </div>
                </div>
                <a
                  href={`tel:${contact.phone.replace(/[^0-9+]/g, '')}`}
                  className="p-2.5 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-700 border border-teal-200/80 transition-colors shadow-xs"
                  title="Call contact"
                >
                  <Phone className="w-4 h-4 text-teal-600" />
                </a>
              </div>
            ))}
          </div>
        </div>

        {/* Privacy & Anti-surveillance statement */}
        <div className="p-4 rounded-royal bg-teal-50/70 border border-teal-100 text-[11px] text-teal-900 space-y-1 font-medium shadow-xs">
          <div className="flex items-center gap-1.5 text-teal-800 font-bold">
            <ShieldCheck className="w-4 h-4 text-teal-600" />
            <span>Anti-Surveillance Guarantee</span>
          </div>
          <p className="leading-relaxed">
            HERPATH only shares location data intentionally and during active trips. We never track
            movements silently in the background or sell location history to commercial brokers.
          </p>
        </div>
      </div>
    </div>
  );
};
