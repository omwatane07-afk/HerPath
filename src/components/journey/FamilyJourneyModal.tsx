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
  UserPlus,
  Shield,
  CheckCircle,
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
          note: 'Journey started from origin point',
        },
      ],
      isDemoMode: true,
    };

    onStartJourney(journey);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-ink/40 backdrop-blur-sm animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="journey-modal-title"
    >
      <div className="surface-card max-w-lg w-full p-6 text-ink shadow-e3 relative overflow-hidden">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-border">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-peacock-dark">
                Consent-Based Companion
              </span>
            </div>
            <h3 id="journey-modal-title" className="font-serif text-xl font-bold text-ink">
              Start Family Journey
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

        <div className="space-y-4 my-4 max-h-[70vh] overflow-y-auto pr-1">
          {/* Trip Summary Card */}
          <div className="p-3.5 rounded-lg bg-raised border border-border text-xs space-y-1">
            <div className="font-semibold text-ink">Selected Trip</div>
            <div className="text-text-secondary">
              <span className="font-medium text-ink">Destination:</span> {destinationName || 'Destination Point'}
            </div>
            <div className="text-text-secondary">
              <span className="font-medium text-ink">Origin:</span> {originName || 'Starting Point'}
            </div>
            {selectedRoute && (
              <div className="text-text-secondary">
                <span className="font-medium text-ink">Route perspective:</span> {selectedRoute.name} ({Math.round(selectedRoute.durationSeconds / 60)} min)
              </div>
            )}
          </div>

          {/* Trusted Contact Picker */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-ink">
                Share With Trusted Contact
              </label>
              <button
                type="button"
                onClick={() => setShowAddContact(!showAddContact)}
                className="text-peacock-dark hover:text-ink text-xs font-semibold flex items-center gap-1"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>{showAddContact ? 'Cancel' : 'Add New Contact'}</span>
              </button>
            </div>

            {showAddContact ? (
              <form onSubmit={handleAddNewContact} className="p-3.5 rounded-lg bg-paper border border-border space-y-2.5">
                <div className="font-serif font-bold text-xs text-ink">New Trusted Contact</div>
                <div>
                  <input
                    type="text"
                    value={newContactName}
                    onChange={(e) => setNewContactName(e.target.value)}
                    placeholder="Full name (e.g. Maya Sharma)"
                    className="w-full text-xs bg-white rounded-md p-2 border border-border text-ink"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="tel"
                    value={newContactPhone}
                    onChange={(e) => setNewContactPhone(e.target.value)}
                    placeholder="Phone number (+91...)"
                    className="w-full text-xs bg-white rounded-md p-2 border border-border text-ink"
                    required
                  />
                  <select
                    value={newContactRelation}
                    onChange={(e) => setNewContactRelation(e.target.value)}
                    className="w-full text-xs bg-white rounded-md p-2 border border-border text-ink"
                  >
                    <option value="Mother">Mother</option>
                    <option value="Father">Father</option>
                    <option value="Sister">Sister</option>
                    <option value="Brother">Brother</option>
                    <option value="Partner">Partner</option>
                    <option value="Friend">Friend</option>
                    <option value="Colleague">Colleague</option>
                  </select>
                </div>
                <button type="submit" className="btn-ink py-1.5 px-3 text-xs w-full">
                  Save Contact
                </button>
              </form>
            ) : (
              <div className="space-y-1.5">
                {trustedContacts.map((contact) => (
                  <label
                    key={contact.id}
                    className={`flex items-center justify-between p-2.5 rounded-lg border cursor-pointer transition-colors ${
                      selectedContactId === contact.id
                        ? 'bg-peacock-tint border-peacock'
                        : 'bg-white border-border hover:bg-paper'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <input
                        type="radio"
                        name="trustedContact"
                        checked={selectedContactId === contact.id}
                        onChange={() => setSelectedContactId(contact.id)}
                        className="text-peacock focus:ring-peacock h-4 w-4"
                      />
                      <div>
                        <div className="text-xs font-bold text-ink">{contact.name}</div>
                        <div className="text-[11px] text-text-secondary">
                          {contact.relation} · {contact.phone}
                        </div>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Check-In Frequency & Estimated Duration */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-ink mb-1">
                Check-in Frequency
              </label>
              <select
                value={checkInInterval}
                onChange={(e) => setCheckInInterval(Number(e.target.value))}
                className="w-full text-xs bg-paper rounded-lg p-2.5 border border-border text-ink font-medium"
              >
                <option value={5}>Every 5 minutes</option>
                <option value={10}>Every 10 minutes</option>
                <option value={15}>Every 15 minutes</option>
                <option value={20}>Every 20 minutes</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-ink mb-1">
                Trip Duration (ETA)
              </label>
              <select
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(Number(e.target.value))}
                className="w-full text-xs bg-paper rounded-lg p-2.5 border border-border text-ink font-medium"
              >
                <option value={15}>15 minutes</option>
                <option value={25}>25 minutes</option>
                <option value={35}>35 minutes</option>
                <option value={45}>45 minutes</option>
                <option value={60}>1 hour</option>
              </select>
            </div>
          </div>

          {/* Honest Demo Mode Disclaimer */}
          <div className="p-3 rounded-lg bg-paper border border-border text-[11px] text-text-secondary leading-relaxed">
            <strong className="text-ink font-semibold">Evaluation Environment Notice:</strong> Journey tracking is held in your local browser state. In a production release, periodic check-ins trigger automated SMS/push broadcasts to your selected contact.
          </div>
        </div>

        {/* Modal Footer */}
        <div className="pt-3 border-t border-border flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="btn-secondary py-2 px-3 text-xs"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleStart}
            disabled={!origin || !destination || !selectedContactId}
            className="btn-ink py-2 px-5 text-xs font-bold flex items-center gap-1.5 shadow-e1 disabled:opacity-50"
          >
            <Compass className="w-3.5 h-3.5 text-peacock-tint" />
            <span>Begin Journey</span>
          </button>
        </div>
      </div>
    </div>
  );
};
