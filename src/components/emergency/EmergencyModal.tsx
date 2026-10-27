'use client';

import React, { useState } from 'react';
import { Phone, Share2, Copy, Check, X, ShieldAlert, HeartHandshake } from 'lucide-react';
import { Coordinates, TrustedContact } from '@/types';

interface EmergencyModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLocation: Coordinates | null;
  trustedContacts: TrustedContact[];
}

export const EmergencyModal: React.FC<EmergencyModalProps> = ({
  isOpen,
  onClose,
  currentLocation,
  trustedContacts,
}) => {
  const [copied, setCopied] = useState(false);
  const [alertInitiated, setAlertInitiated] = useState(false);
  const [alertTimestamp, setAlertTimestamp] = useState<string | null>(null);

  if (!isOpen) return null;

  const defaultEmergencyNumber = process.env.NEXT_PUBLIC_DEFAULT_EMERGENCY_NUMBER || '112';
  const womenHelplineNumber = process.env.NEXT_PUBLIC_WOMEN_HELPLINE_NUMBER || '1091';

  const emergencyContact = trustedContacts.find((c) => c.isEmergencyAlertContact) || trustedContacts[0];

  const shareText = currentLocation
    ? `EMERGENCY ALERT: I am using HERPATH and sharing my urgent location: https://www.google.com/maps?q=${currentLocation.lat},${currentLocation.lng} (Lat: ${currentLocation.lat.toFixed(5)}, Lng: ${currentLocation.lng.toFixed(5)}) at ${new Date().toLocaleTimeString()}`
    : `EMERGENCY ALERT: I am using HERPATH and need urgent assistance. Please contact me immediately. (Sent at ${new Date().toLocaleTimeString()})`;

  const handleCopyLocation = () => {
    navigator.clipboard.writeText(shareText);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'HERPATH Emergency Location',
          text: shareText,
        });
      } catch (err) {
        handleCopyLocation();
      }
    } else {
      handleCopyLocation();
    }
  };

  const handleSendAlert = () => {
    setAlertInitiated(true);
    setAlertTimestamp(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    handleNativeShare();
  };

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-bordeaux/50 backdrop-blur-sm animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="emergency-modal-title"
    >
      <div className="bg-white border-2 border-emergency rounded-atelier max-w-lg w-full p-6 text-bordeaux shadow-atelier relative overflow-hidden">
        {/* Urgent solid crimson bar */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-emergency" />

        {/* Modal Header */}
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-danger-tint flex items-center justify-center border border-danger/30 shrink-0">
              <ShieldAlert className="w-5 h-5 text-emergency" />
            </div>
            <div>
              <h2 id="emergency-modal-title" className="font-editorial text-xl font-bold text-bordeaux">
                Emergency Assistance
              </h2>
              <p className="text-xs text-text-secondary">
                Direct connections to emergency helplines and trusted contacts.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-text-secondary hover:text-bordeaux p-2 rounded-xl bg-canvas hover:bg-canvas-subtle transition-colors focus-ring-bordeaux"
            aria-label="Close emergency modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Truthful Status Box if Alert was sent */}
        {alertInitiated && (
          <div className="mb-4 p-3.5 rounded-xl bg-canvas border border-border text-xs space-y-1.5 animate-fade-in">
            <div className="font-semibold text-bordeaux flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emergency" />
              <span>Alert Sharing Triggered at {alertTimestamp}</span>
            </div>
            <p className="text-text-secondary text-[11px] leading-relaxed">
              <strong>Delivery status:</strong> System share intent was opened on this device. Emergency services require placing a voice call via native dialer.
            </p>
          </div>
        )}

        {/* Main Emergency Call Actions */}
        <div className="space-y-2.5 my-4">
          {/* Universal Police/Emergency (112) */}
          <a
            href={`tel:${defaultEmergencyNumber}`}
            className="flex items-center justify-between p-4 rounded-xl bg-emergency hover:bg-emergency-hover text-white transition-colors shadow-md group focus-ring-bordeaux"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                <Phone className="w-5 h-5 text-white" />
              </div>
              <div className="text-left">
                <div className="font-editorial font-bold text-base leading-snug">
                  Call National Emergency ({defaultEmergencyNumber})
                </div>
                <div className="text-xs text-white/90">
                  Universal Police, Fire, and Ambulance connection
                </div>
              </div>
            </div>
            <span className="text-xs font-bold uppercase tracking-wider bg-white text-emergency px-3.5 py-1.5 rounded-lg shadow-sm">
              Call Now
            </span>
          </a>

          {/* Women Helpline (1091) */}
          <a
            href={`tel:${womenHelplineNumber}`}
            className="flex items-center justify-between p-3.5 rounded-xl bg-canvas hover:bg-canvas-subtle border border-border text-bordeaux transition-colors shadow-sm group focus-ring-bordeaux"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-rose-tint flex items-center justify-center shrink-0 border border-rose-gold/30">
                <HeartHandshake className="w-4 h-4 text-rose-gold" />
              </div>
              <div className="text-left">
                <div className="font-editorial font-bold text-sm text-bordeaux leading-snug">
                  National Women's Helpline ({womenHelplineNumber})
                </div>
                <div className="text-[11px] text-text-secondary">
                  24/7 dedicated distress and safety counsel
                </div>
              </div>
            </div>
            <span className="btn-secondary text-xs px-3 py-1 font-bold">
              Call
            </span>
          </a>

          {/* Primary Trusted Contact */}
          {emergencyContact && (
            <a
              href={`tel:${emergencyContact.phone.replace(/[^0-9+]/g, '')}`}
              className="flex items-center justify-between p-3.5 rounded-xl bg-canvas hover:bg-canvas-subtle border border-border text-bordeaux transition-colors shadow-sm group focus-ring-bordeaux"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-white border border-border flex items-center justify-center shrink-0">
                  <Phone className="w-4 h-4 text-bordeaux" />
                </div>
                <div className="text-left">
                  <div className="font-editorial font-bold text-sm text-bordeaux leading-snug">
                    Call Trusted Contact: {emergencyContact.name}
                  </div>
                  <div className="text-[11px] text-text-secondary">
                    {emergencyContact.relation} · {emergencyContact.phone}
                  </div>
                </div>
              </div>
              <span className="btn-secondary text-xs px-3 py-1 font-bold">
                Call
              </span>
            </a>
          )}

          {/* Location Broadcast Options */}
          <div className="p-3.5 rounded-xl bg-surface-raised border border-border space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-bordeaux">Urgent GPS Location</span>
              {currentLocation ? (
                <span className="font-mono text-rose-gold font-bold text-[11px]">
                  {currentLocation.lat.toFixed(4)}, {currentLocation.lng.toFixed(4)}
                </span>
              ) : (
                <span className="text-text-muted text-[11px]">Location pending</span>
              )}
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleCopyLocation}
                className="btn-secondary flex-1 py-2 px-3 text-xs flex items-center justify-center gap-1.5 shadow-sm"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-verified" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Location Copied' : 'Copy Coordinates'}</span>
              </button>

              <button
                type="button"
                onClick={handleSendAlert}
                className="btn-bordeaux py-2 px-4 text-xs font-bold flex items-center gap-1.5 shadow-md"
              >
                <Share2 className="w-3.5 h-3.5 text-champagne" />
                <span>Send Alert</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer & Truthful Clarification */}
        <div className="pt-3 border-t border-border flex items-center justify-between text-xs text-text-secondary">
          <p className="text-[11px] leading-tight pr-4">
            *Emergency numbers connect directly through your device's cellular dialer. HERPATH never claims help is dispatched without telecommunication carrier response.
          </p>
          <button
            type="button"
            onClick={onClose}
            className="btn-secondary py-1.5 px-3.5 text-xs shrink-0"
          >
            Close / False Alarm
          </button>
        </div>
      </div>
    </div>
  );
};
