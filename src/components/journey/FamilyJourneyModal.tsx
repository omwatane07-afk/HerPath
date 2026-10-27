'use client';

import React, { useState } from 'react';
import {
  JourneySession,
  TrustedContact,
  Coordinates,
  RouteOption,
} from '@/types';
import { generateId } from '@/lib/utils';
import {
  Compass,
  X,
  Users,
  Clock,
  Sparkles,
  UserPlus,
} from 'lucide-react';

interface FamilyJourneyModalProps {
  isOpen: boolean;
  onClose: () => void;
  origin: Coordinates | null;
  destination: Coordinates | null;
  originName: string;
  destinationName: string;
  selectedRoute: RouteOption | null;
  trustedContacts: TrustedContact[];
  onAddContact: (contact: TrustedContact) => void;
  onStartJourney: (journey: JourneySession) => void;
}

export const FamilyJourneyModal: React.FC<FamilyJourneyModalProps> = ({
  isOpen,
  onClose,
  origin,
  destination,
  originName,
  destinationName,
  selectedRoute,
  trustedContacts,
  onAddContact,
  onStartJourney,
}) => {
  const [selectedContactId, setSelectedContactId] = useState<string>(
    trustedContacts[0]?.id || ''
  );
  const [durationMinutes, setDurationMinutes] = useState<number>(
    selectedRoute ? Math.ceil(selectedRoute.durationSeconds / 60) + 5 : 25
  );
  const [checkInInterval, setCheckInInterval] = useState<number>(10);
  const [showAddContact, setShowAddContact] = useState(false);
  const [newContactName, setNewContactName] = useState('');
  const [newContactPhone, setNewContactPhone] = useState('');
  const [newContactRelation, setNewContactRelation] = useState('Family');

  if (!isOpen) return null;

  const handleAddNewContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContactName.trim() || !newContactPhone.trim()) return;

    const contact: TrustedContact = {
      id: generateId('tc'),
      name: newContactName.trim(),
      phone: newContactPhone.trim(),
      relation: newContactRelation,
      isEmergencyAlertContact: true,
    };
    onAddContact(contact);
    setSelectedContactId(contact.id);
    setShowAddContact(false);
    setNewContactName('');
    setNewContactPhone('');
  };

  const handleStart = () => {
    if (!origin || !destination) return;

    const selectedContact = trustedContacts.find((c) => c.id === selectedContactId);
    const now = new Date();
    const eta = new Date(now.getTime() + durationMinutes * 60 * 1000).toISOString();
    const nextCheckIn = new Date(now.getTime() + checkInInterval * 60 * 1000).toISOString();

    const journey: JourneySession = {
      id: generateId('jrn'),
      originName: originName || 'Current Location',
      originCoords: origin,
      destinationName: destinationName || 'Selected Destination',
      destCoords: destination,
      routeGeometry: selectedRoute ? selectedRoute.coordinates : [[origin.lat, origin.lng], [destination.lat, destination.lng]],
      estimatedArrival: eta,
      checkInIntervalMinutes: checkInInterval,
      status: 'in_progress',
      trustedContact: selectedContact,
      shareToken: `herpath_share_${Math.random().toString(36).substring(2, 10)}`,
      currentCoords: origin,
      lastCheckInAt: now.toISOString(),
      nextCheckInDueAt: nextCheckIn,
      createdAt: now.toISOString(),
      checkIns: [
        {
          id: generateId('chk'),
          timestamp: now.toISOString(),
          coordinates: origin,
          status: 'ok',
          note: 'Journey started from origin',
        },
      ],
      isDemoMode: true, // Transparent disclaimer for prototype
    };

    onStartJourney(journey);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-brand-text/30 backdrop-blur-md animate-fadeIn">
      <div className="surface-pearl border border-white/95 rounded-sheet max-w-lg w-full p-6 text-brand-text shadow-glass-floating relative overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-brand-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-600 shadow-sm">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-brand-text">Family Journey Companion</h3>
              <p className="text-xs text-brand-text-secondary">
                Share live checkpoints and arrival confirmations with loved ones
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

        {/* Route Summary */}
        <div className="p-3.5 rounded-2xl bg-brand-bg border border-brand-border space-y-2 mb-4">
          <div className="flex items-center gap-2 text-xs font-medium">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span className="text-brand-text-secondary">From:</span>
            <span className="text-brand-text font-bold truncate">{originName || 'Current Location'}</span>
          </div>
          <div className="flex items-center gap-2 text-xs font-medium">
            <span className="w-2.5 h-2.5 rounded-full bg-danger-500" />
            <span className="text-brand-text-secondary">To:</span>
            <span className="text-brand-text font-bold truncate">{destinationName || 'Destination'}</span>
          </div>
          {selectedRoute && (
            <div className="text-[11px] text-teal-700 font-semibold pt-1 border-t border-brand-border">
              Using route: {selectedRoute.name} ({Math.round(selectedRoute.durationSeconds / 60)} min walking)
            </div>
          )}
        </div>

        {/* Journey Configuration Form */}
        <div className="space-y-4">
          {/* Estimated Travel Time */}
          <div>
            <label className="block text-[11px] font-bold text-brand-text-muted uppercase tracking-wider mb-1.5 flex items-center justify-between">
              <span>Expected Journey Duration</span>
              <span className="text-teal-600 font-mono font-bold">{durationMinutes} minutes</span>
            </label>
            <div className="flex gap-2">
              {[15, 25, 40, 60].map((mins) => (
                <button
                  key={mins}
                  type="button"
                  onClick={() => setDurationMinutes(mins)}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${
                    durationMinutes === mins
                      ? 'bg-teal-500 text-white border-teal-500 shadow-sm'
                      : 'bg-brand-bg border-brand-border text-brand-text hover:bg-white'
                  }`}
                >
                  {mins} min
                </button>
              ))}
            </div>
          </div>

          {/* Check-in Interval */}
          <div>
            <label className="block text-[11px] font-bold text-brand-text-muted uppercase tracking-wider mb-1.5 flex items-center justify-between">
              <span>Safety Check-In Frequency</span>
              <span className="text-teal-600 font-mono font-bold">Every {checkInInterval} mins</span>
            </label>
            <div className="flex gap-2">
              {[5, 10, 15, 20].map((mins) => (
                <button
                  key={mins}
                  type="button"
                  onClick={() => setCheckInInterval(mins)}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${
                    checkInInterval === mins
                      ? 'bg-teal-500 text-white border-teal-500 shadow-sm'
                      : 'bg-brand-bg border-brand-border text-brand-text hover:bg-white'
                  }`}
                >
                  {mins} min
                </button>
              ))}
            </div>
            <p className="text-[10px] text-brand-text-secondary mt-1 font-medium">
              HERPATH will prompt you to tap "I'm OK" at each interval. If check-in passes, your contact is notified.
            </p>
          </div>

          {/* Trusted Contact Picker */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[11px] font-bold text-brand-text-muted uppercase tracking-wider">
                Select Trusted Contact
              </label>
              <button
                type="button"
                onClick={() => setShowAddContact(!showAddContact)}
                className="text-[11px] text-teal-700 hover:text-teal-800 flex items-center gap-1 font-bold"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>{showAddContact ? 'Cancel' : 'Add New'}</span>
              </button>
            </div>

            {showAddContact ? (
              <form
                onSubmit={handleAddNewContact}
                className="p-3.5 rounded-2xl bg-brand-bg border border-brand-border space-y-2 mb-2 animate-fadeIn"
              >
                <input
                  type="text"
                  placeholder="Full name or relation"
                  value={newContactName}
                  onChange={(e) => setNewContactName(e.target.value)}
                  className="w-full p-2.5 text-xs rounded-xl bg-white border border-brand-border text-brand-text outline-none font-medium"
                  required
                />
                <input
                  type="tel"
                  placeholder="Mobile telephone number"
                  value={newContactPhone}
                  onChange={(e) => setNewContactPhone(e.target.value)}
                  className="w-full p-2.5 text-xs rounded-xl bg-white border border-brand-border text-brand-text outline-none font-medium"
                  required
                />
                <button
                  type="submit"
                  className="w-full py-2 px-3 rounded-full bg-teal-500 hover:bg-teal-600 text-xs font-bold text-white shadow-xs"
                >
                  Save & Select Contact
                </button>
              </form>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {trustedContacts.map((contact) => (
                  <button
                    key={contact.id}
                    type="button"
                    onClick={() => setSelectedContactId(contact.id)}
                    className={`p-3 rounded-2xl border text-left transition-all ${
                      selectedContactId === contact.id
                        ? 'bg-teal-50 border-teal-500 text-teal-950 ring-2 ring-teal-500/20 shadow-xs'
                        : 'bg-brand-bg border-brand-border text-brand-text hover:bg-white'
                    }`}
                  >
                    <div className="text-xs font-bold truncate">{contact.name}</div>
                    <div className="text-[10px] text-brand-text-secondary mt-0.5 truncate font-medium">
                      {contact.relation} • {contact.phone}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Transparent Demo Notice */}
          <div className="p-3.5 rounded-2xl bg-brand-bg border border-brand-border text-[11px] text-brand-text-secondary flex items-start gap-2.5 font-medium">
            <Sparkles className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong className="text-brand-text font-bold">Demo Prototype Mode:</strong> Journey updates are
              tracked locally in this session. When deployed with connected Supabase and SMS/push credentials,
              checkpoints are broadcast live to your selected contact.
            </p>
          </div>

          {/* Action buttons */}
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
              onClick={handleStart}
              disabled={!origin || !destination}
              className="py-3 px-6 rounded-full bg-teal-500 hover:bg-teal-600 active:scale-95 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-md shadow-teal-500/20 transition-all disabled:opacity-50"
            >
              <Compass className="w-4 h-4" />
              <span>Start Journey Sharing</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
