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
  const [intervalMinutes, setIntervalMinutes] = useState<number>(10);
  const [showAddContact, setShowAddContact] = useState(false);
  const [newContactName, setNewContactName] = useState('');
  const [newContactPhone, setNewContactPhone] = useState('');
  const [newContactRelation, setNewContactRelation] = useState('Family');

  if (!isOpen) return null;

  const handleCreateContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContactName.trim() || !newContactPhone.trim()) return;

    const newContact: TrustedContact = {
      id: generateId('contact'),
      name: newContactName.trim(),
      phone: newContactPhone.trim(),
      relation: newContactRelation,
      isEmergencyAlertContact: false,
    };

    onAddContact(newContact);
    setSelectedContactId(newContact.id);
    setShowAddContact(false);
    setNewContactName('');
    setNewContactPhone('');
  };

  const handleStart = () => {
    if (!origin || !destination || !selectedContactId) return;

    const contact = trustedContacts.find((c) => c.id === selectedContactId);
    const now = new Date();
    const nextCheckIn = new Date(now.getTime() + intervalMinutes * 60 * 1000).toISOString();

    const journey: JourneySession = {
      id: generateId('journey'),
      originCoords: origin,
      destCoords: destination,
      originName: originName || 'Starting Point',
      destinationName: destinationName || 'Destination Point',
      routeGeometry: selectedRoute?.coordinates || [[origin.lat, origin.lng], [destination.lat, destination.lng]],
      estimatedArrival: new Date(now.getTime() + durationMinutes * 60 * 1000).toISOString(),
      checkInIntervalMinutes: intervalMinutes,
      status: 'in_progress',
      trustedContact: contact,
      shareToken: Math.random().toString(36).substring(2, 9),
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
          note: 'Journey commenced',
        },
      ],
      isDemoMode: true,
    };

    onStartJourney(journey);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-bordeaux/40 backdrop-blur-sm animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="journey-modal-title"
    >
      <div className="surface-card max-w-lg w-full p-6 text-bordeaux shadow-atelier border border-border-gold/60 rounded-atelier relative overflow-hidden bg-white">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-border">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-rose-gold font-editorial">
                Consent-Based Companion
              </span>
            </div>
            <h3 id="journey-modal-title" className="font-editorial text-xl font-bold text-bordeaux">
              Start Family Journey
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-text-secondary hover:text-bordeaux p-2 rounded-xl bg-canvas hover:bg-canvas-subtle transition-colors focus-ring-bordeaux"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4 my-4 max-h-[70vh] overflow-y-auto pr-1">
          {/* Trip Summary Card */}
          <div className="p-3.5 rounded-xl bg-surface-raised border border-border text-xs space-y-1">
            <div className="font-semibold text-bordeaux font-editorial">Selected Trip</div>
            <div className="text-text-secondary">
              <span className="font-medium text-bordeaux">Destination:</span> {destinationName || 'Destination Point'}
            </div>
            <div className="text-text-secondary">
              <span className="font-medium text-bordeaux">Origin:</span> {originName || 'Starting Point'}
            </div>
            {selectedRoute && (
              <div className="text-text-secondary">
                <span className="font-medium text-bordeaux">Route perspective:</span> {selectedRoute.name} ({Math.round(selectedRoute.durationSeconds / 60)} min)
              </div>
            )}
          </div>

          {/* Trusted Contact Picker */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-bordeaux font-editorial">
                Share With Trusted Contact
              </label>
              <button
                type="button"
                onClick={() => setShowAddContact(!showAddContact)}
                className="text-rose-gold hover:text-bordeaux text-xs font-semibold flex items-center gap-1"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>{showAddContact ? 'Cancel' : 'Add New Contact'}</span>
              </button>
            </div>

            {showAddContact ? (
              <form onSubmit={handleCreateContact} className="p-3.5 rounded-xl bg-canvas border border-border space-y-3">
                <div className="font-semibold text-xs text-bordeaux font-editorial">New Trusted Contact</div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={newContactName}
                    onChange={(e) => setNewContactName(e.target.value)}
                    placeholder="Contact Name"
                    className="text-xs bg-white rounded-lg p-2 border border-border text-bordeaux"
                    required
                  />
                  <input
                    type="tel"
                    value={newContactPhone}
                    onChange={(e) => setNewContactPhone(e.target.value)}
                    placeholder="Phone (e.g. +91 98765...)"
                    className="text-xs bg-white rounded-lg p-2 border border-border text-bordeaux"
                    required
                  />
                </div>
                <div className="flex items-center justify-between">
                  <select
                    value={newContactRelation}
                    onChange={(e) => setNewContactRelation(e.target.value)}
                    className="text-xs bg-white rounded-lg p-1.5 border border-border text-bordeaux"
                  >
                    <option value="Family">Family Member</option>
                    <option value="Friend">Trusted Friend</option>
                    <option value="Colleague">Colleague</option>
                    <option value="Partner">Partner</option>
                  </select>
                  <button type="submit" className="btn-bordeaux text-xs py-1.5 px-3">
                    Save Contact
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-2">
                {trustedContacts.map((contact) => (
                  <label
                    key={contact.id}
                    className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                      selectedContactId === contact.id
                        ? 'border-2 border-rose-gold bg-rose-tint shadow-sm'
                        : 'border-border bg-white hover:bg-canvas'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <input
                        type="radio"
                        name="selectedContact"
                        value={contact.id}
                        checked={selectedContactId === contact.id}
                        onChange={() => setSelectedContactId(contact.id)}
                        className="text-rose-gold focus:ring-rose-gold h-4 w-4"
                      />
                      <div>
                        <div className="font-bold text-xs text-bordeaux">{contact.name}</div>
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

          {/* Check-in Interval */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div>
              <label className="block text-xs font-semibold text-bordeaux mb-1">
                Check-in Frequency
              </label>
              <select
                value={intervalMinutes}
                onChange={(e) => setIntervalMinutes(Number(e.target.value))}
                className="w-full text-xs bg-canvas rounded-xl p-2.5 border border-border text-bordeaux font-medium"
              >
                <option value={5}>Every 5 minutes</option>
                <option value={10}>Every 10 minutes</option>
                <option value={15}>Every 15 minutes</option>
                <option value={20}>Every 20 minutes</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-bordeaux mb-1">
                Trip Duration (ETA)
              </label>
              <select
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(Number(e.target.value))}
                className="w-full text-xs bg-canvas rounded-xl p-2.5 border border-border text-bordeaux font-medium"
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
          <div className="p-3 rounded-xl bg-canvas border border-border text-[11px] text-text-secondary leading-relaxed">
            <strong className="text-bordeaux font-semibold">Evaluation Environment Notice:</strong> Journey tracking is held in your local browser state. In a production release, periodic check-ins trigger automated SMS/push broadcasts to your selected contact.
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
            className="btn-bordeaux py-2 px-5 text-xs font-bold flex items-center gap-1.5 shadow-md disabled:opacity-50"
          >
            <Compass className="w-3.5 h-3.5 text-champagne" />
            <span>Begin Journey</span>
          </button>
        </div>
      </div>
    </div>
  );
};
