'use client';

import React, { useState } from 'react';
import { Phone, Share2, Copy, Check, X, ShieldAlert, HeartHandshake } from 'lucide-react';
import { Coordinates, TrustedContact } from '@/types';

interface EmergencyModalProps {
  isOpen?: boolean;
  onClose: () => void;
  currentLocation: Coordinates | null;
  trustedContacts: TrustedContact[];
}

export const EmergencyModal: React.FC<EmergencyModalProps> = ({
  isOpen = true,
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

  const emergencyContact =
    trustedContacts.find((c) => c.isEmergencyAlertContact) || trustedContacts[0];

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
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-ink/60 backdrop-blur-sm animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="emergency-modal-title"
    >
      <div className="bg-card border-2 border-emergency rounded-modal max-w-lg w-full p-6 text-ink shadow-e3 relative overflow-hidden">
        {/* Solid crimson header indicator (Zero decorative motion) */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-emergency" />

        {/* Modal Header */}
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emergency-tint flex items-center justify-center border border-emergency/30 shrink-0">
              <ShieldAlert className="w-5 h-5 text-emergency" />
            </div>
            <div>
              <h2 id="emergency-modal-title" className="font-editorial text-xl font-bold text-ink">
                Emergency Assistance
              </h2>
              <p className="text-xs text-text-secondary">
                Direct connections to emergency services and trusted contacts.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-text-secondary hover:text-ink p-2 rounded-xl bg-canvas hover:bg-canvas-2 transition-colors focus-ring-primary"
            aria-label="Close emergency modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Truthful Status Box if Alert was sent */}
        {alertInitiated && (
          <div className="mb-4 p-3.5 rounded-xl bg-canvas border border-border text-xs space-y-1.5 animate-fade-in">
            <div className="font-semibold text-ink flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-verified" />
              <span>Location shared via device intents at {alertTimestamp}</span>
            </div>
            <p className="text-[11px] text-text-secondary leading-relaxed">
              HERPATH triggered your device's native messaging intent. Verification depends on your mobile carrier connection. Emergency dispatchers (112) should be called directly below.
            </p>
          </div>
        )}

        {/* 1. Official Emergency Helpline Hotlines */}
        <div className="space-y-3 mb-5">
          <div className="text-[11px] font-bold uppercase tracking-wider text-text-secondary font-editorial">
            Direct Helpline Services
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* 112 Universal Emergency Button */}
            <a
              href={`tel:${defaultEmergencyNumber}`}
              className="btn-emergency-sos py-3.5 px-4 flex items-center justify-center gap-2.5 shadow-md active:scale-95"
            >
              <Phone className="w-4 h-4 text-white stroke-[2.5]" />
              <div className="text-left">
                <div className="text-xs uppercase font-extrabold tracking-wider">Universal (112)</div>
                <div className="text-[10px] text-white/90 font-medium">Police, Fire, Ambulance</div>
              </div>
            </a>

            {/* 1091 Women Helpline Button */}
            <a
              href={`tel:${womenHelplineNumber}`}
              className="py-3.5 px-4 rounded-xl bg-ink hover:bg-ink-hover text-white flex items-center justify-center gap-2.5 shadow-md active:scale-95 transition-colors focus-ring-on-dark"
            >
              <Phone className="w-4 h-4 text-champagne stroke-[2.5]" />
              <div className="text-left">
                <div className="text-xs uppercase font-bold tracking-wider text-white">Women (1091)</div>
                <div className="text-[10px] text-white/80 font-medium">National Helpline Desk</div>
              </div>
            </a>
          </div>
        </div>

        {/* 2. Trusted Emergency Contact */}
        <div className="space-y-2 mb-5">
          <div className="text-[11px] font-bold uppercase tracking-wider text-text-secondary font-editorial">
            Trusted Emergency Contact
          </div>

          {emergencyContact ? (
            <div className="surface-card p-3.5 flex items-center justify-between gap-3 border border-border">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs text-ink">{emergencyContact.name}</span>
                  <span className="text-[10px] bg-primary-tint text-primary font-bold px-1.5 py-0.5 rounded border border-primary/20">
                    {emergencyContact.relation}
                  </span>
                </div>
                <p className="text-xs text-text-secondary font-mono mt-0.5">
                  {emergencyContact.phone}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <a
                  href={`tel:${emergencyContact.phone.replace(/[^0-9+]/g, '')}`}
                  className="btn-primary py-2 px-3 text-xs font-semibold flex items-center gap-1.5"
                >
                  <Phone className="w-3.5 h-3.5 text-white" />
                  <span>Call</span>
                </a>
              </div>
            </div>
          ) : (
            <div className="p-3.5 rounded-xl bg-canvas border border-border text-xs text-text-secondary text-center">
              No emergency contact designated. You can add one in the Family module.
            </div>
          )}
        </div>

        {/* 3. Live GPS Coordinates & Location Copy */}
        <div className="p-3.5 rounded-xl bg-canvas border border-border space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-ink">Current Coordinates:</span>
            <span className="text-xs font-mono font-semibold text-primary">
              {currentLocation
                ? `${currentLocation.lat.toFixed(5)}, ${currentLocation.lng.toFixed(5)}`
                : 'Acquiring GPS fix...'}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={handleCopyLocation}
              className="btn-secondary py-2 px-3 text-xs font-semibold flex items-center justify-center gap-1.5"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-verified" />
                  <span className="text-verified">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Coordinates</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleSendAlert}
              className="btn-primary py-2 px-3 text-xs font-bold flex items-center justify-center gap-1.5"
            >
              <Share2 className="w-3.5 h-3.5 text-white" />
              <span>Share Location</span>
            </button>
          </div>
        </div>

        {/* Dispatch Disclaimer */}
        <p className="text-[10px] text-text-muted mt-4 text-center leading-relaxed">
          HERPATH coordinates are stored on-device. Dialling 112 connects directly to municipal telecom emergency dispatch.
        </p>
      </div>
    </div>
  );
};
