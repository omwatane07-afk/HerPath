'use client';

import React, { useState } from 'react';
import { JourneySession, TrustedContact } from '@/types';
import { formatRelativeTime } from '@/lib/utils';
import {
  Users,
  Compass,
  Clock,
  MapPin,
  CheckCircle2,
  ShieldCheck,
  Plus,
  Phone,
  Share2,
  AlertCircle,
  Copy,
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
    <div className="flex flex-col h-full bg-navy-900 border-r border-slate-800 text-slate-100 overflow-y-auto">
      {/* Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Users className="w-4 h-4 text-teal-400" />
            <span>Family Journey Companion</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Explicit, consent-based trip sharing for peace of mind
          </p>
        </div>
        {!activeJourney && (
          <button
            onClick={onOpenStartJourneyModal}
            className="flex items-center gap-1.5 py-1.5 px-3 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs uppercase tracking-wider shadow-md transition-all active:scale-95"
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Start Trip</span>
          </button>
        )}
      </div>

      <div className="p-4 space-y-5">
        {/* Active Journey Card or Empty State */}
        {activeJourney ? (
          <div className="p-4 rounded-2xl bg-navy-950 border border-teal-500/50 shadow-xl space-y-3.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-teal-950 border border-teal-500 text-teal-300">
                ● Live Trip Active
              </span>
              <span className="text-xs text-slate-400">
                Created {formatRelativeTime(activeJourney.createdAt)}
              </span>
            </div>

            <div>
              <div className="text-xs text-slate-400 font-medium">Destination</div>
              <h3 className="text-lg font-bold text-white leading-tight">
                {activeJourney.destinationName}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">From: {activeJourney.originName}</p>
            </div>

            {/* Checkpoints Timeline */}
            <div className="pt-2 border-t border-slate-800">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Check-in Audit Log ({activeJourney.checkIns.length} recorded)
              </div>
              <div className="space-y-2">
                {activeJourney.checkIns.map((chk) => (
                  <div
                    key={chk.id}
                    className="flex items-start gap-2.5 p-2 rounded-lg bg-navy-900 border border-slate-800 text-xs"
                  >
                    <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-200">
                          {chk.status === 'arrived' ? 'Arrived at Destination' : 'Checkpoint Safe'}
                        </span>
                        <span className="text-[10px] text-slate-500">
                          {formatRelativeTime(chk.timestamp)}
                        </span>
                      </div>
                      {chk.note && <p className="text-[11px] text-slate-400 mt-0.5">{chk.note}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-2">
              <button
                onClick={handleShare}
                className="py-1.5 px-3 rounded-lg bg-navy-850 hover:bg-navy-800 text-xs font-semibold text-slate-200 flex items-center gap-1.5 border border-slate-700 transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
                <span>{copied ? 'Link Copied' : 'Share Link'}</span>
              </button>

              <button
                onClick={onEndJourney}
                className="py-1.5 px-3 rounded-lg bg-rose-950/80 hover:bg-rose-900 text-xs font-semibold text-rose-300 border border-rose-800 transition-colors"
              >
                End & Stop Sharing
              </button>
            </div>
          </div>
        ) : (
          <div className="p-6 rounded-2xl bg-navy-950 border border-dashed border-slate-800 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-navy-900 text-teal-400 mx-auto flex items-center justify-center">
              <Compass className="w-6 h-6 stroke-1" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">No Active Journey Sharing</h3>
              <p className="text-xs text-slate-400 max-w-xs mx-auto mt-1">
                Plan a route and start a family companion trip to share automated check-ins and
                expected arrival reminders with trusted contacts.
              </p>
            </div>
            <button
              onClick={onOpenStartJourneyModal}
              className="py-2 px-4 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs uppercase tracking-wider shadow-md transition-all"
            >
              Start New Journey
            </button>
          </div>
        )}

        {/* Trusted Contacts Management */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Configured Trusted Contacts ({trustedContacts.length})
            </h3>
            <button
              onClick={onOpenAddContact}
              className="text-[11px] text-teal-400 hover:text-teal-300 font-semibold flex items-center gap-1"
            >
              <Plus className="w-3 h-3" />
              <span>Add Contact</span>
            </button>
          </div>

          <div className="space-y-2">
            {trustedContacts.map((contact) => (
              <div
                key={contact.id}
                className="p-3 rounded-xl bg-navy-950 border border-slate-800 flex items-center justify-between text-xs"
              >
                <div>
                  <div className="font-bold text-slate-200 flex items-center gap-2">
                    <span>{contact.name}</span>
                    {contact.isEmergencyAlertContact && (
                      <span className="px-1.5 py-0.2 rounded text-[10px] bg-rose-950 text-rose-300 border border-rose-800">
                        Primary SOS
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    {contact.relation} • {contact.phone}
                  </div>
                </div>
                <a
                  href={`tel:${contact.phone.replace(/[^0-9+]/g, '')}`}
                  className="p-2 rounded-lg bg-navy-850 hover:bg-navy-800 text-teal-400 hover:text-teal-300 border border-slate-700 transition-colors"
                  title="Call contact"
                >
                  <Phone className="w-3.5 h-3.5" />
                </a>
              </div>
            ))}
          </div>
        </div>

        {/* Privacy & Anti-surveillance statement */}
        <div className="p-3.5 rounded-xl bg-navy-950/80 border border-slate-800 text-[11px] text-slate-400 space-y-1.5">
          <div className="flex items-center gap-1.5 text-teal-400 font-semibold">
            <ShieldCheck className="w-4 h-4" />
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
