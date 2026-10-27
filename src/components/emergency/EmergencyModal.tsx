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
  const emergencyContact = trustedContacts.find((c) => c.isEmergencyAlertContact) || trustedContacts[0];

  if (!isOpen) return null;

  const defaultEmergencyNumber = process.env.NEXT_PUBLIC_DEFAULT_EMERGENCY_NUMBER || '112';
  const womenHelplineNumber = process.env.NEXT_PUBLIC_WOMEN_HELPLINE_NUMBER || '1091';

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

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-brand-text/30 backdrop-blur-md animate-fadeIn">
      <div className="surface-pearl border border-white/95 rounded-sheet max-w-lg w-full p-6 text-brand-text shadow-glass-floating relative overflow-hidden">
        {/* Urgent header accent bar */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-danger-500 via-champagne-400 to-danger-500 animate-pulse" />

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-danger-50 flex items-center justify-center border border-danger-200 shadow-sm">
              <ShieldAlert className="w-5 h-5 text-danger-500" />
            </div>
            <div>
              <h2 className="text-xl font-black text-brand-text tracking-wide">Emergency Support</h2>
              <p className="text-xs text-danger-600 font-bold">Immediate Assistance & Trusted Helplines</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-brand-text-muted hover:text-brand-text p-2 rounded-xl bg-brand-bg hover:bg-brand-bg-secondary transition-colors"
            title="Cancel / Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Grid */}
        <div className="space-y-3 my-5">
          {/* Universal Police/Emergency */}
          <a
            href={`tel:${defaultEmergencyNumber}`}
            className="flex items-center justify-between p-4 rounded-2xl bg-danger-500 hover:bg-danger-600 active:scale-[0.99] transition-all text-white font-semibold shadow-md shadow-danger-500/20 group"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-danger-600 flex items-center justify-center group-hover:scale-105 transition-transform shadow-inner">
                <Phone className="w-5 h-5" />
              </div>
              <div className="text-left">
                <div className="text-base font-black">Call Police / Medical ({defaultEmergencyNumber})</div>
                <div className="text-xs text-danger-100 font-medium">Direct universal emergency connection</div>
              </div>
            </div>
            <span className="text-xs font-black uppercase tracking-wider bg-white/20 px-3 py-1.5 rounded-full">
              Call
            </span>
          </a>

          {/* Women Helpline */}
          <a
            href={`tel:${womenHelplineNumber}`}
            className="flex items-center justify-between p-4 rounded-2xl bg-teal-50 hover:bg-teal-100/70 border border-teal-200 text-brand-text font-semibold transition-all group shadow-sm"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-white border border-teal-200 flex items-center justify-center group-hover:scale-105 transition-transform shadow-sm">
                <HeartHandshake className="w-5 h-5 text-teal-600" />
              </div>
              <div className="text-left">
                <div className="text-base font-black text-teal-800">
                  National Women's Helpline ({womenHelplineNumber})
                </div>
                <div className="text-xs text-brand-text-secondary font-medium">
                  24/7 dedicated women distress support
                </div>
              </div>
            </div>
            <span className="text-xs font-black uppercase tracking-wider bg-teal-500 text-white px-3 py-1.5 rounded-full shadow-xs">
              Call
            </span>
          </a>

          {/* Trusted Family / Contact */}
          {emergencyContact && (
            <a
              href={`tel:${emergencyContact.phone.replace(/[^0-9+]/g, '')}`}
              className="flex items-center justify-between p-4 rounded-2xl bg-softblue-50 hover:bg-softblue-100/70 border border-softblue-200 text-brand-text font-semibold transition-all group shadow-sm"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-xl bg-white border border-softblue-200 flex items-center justify-center group-hover:scale-105 transition-transform shadow-sm">
                  <Phone className="w-5 h-5 text-softblue-500" />
                </div>
                <div className="text-left">
                  <div className="text-base font-black text-blue-900">
                    Call Trusted: {emergencyContact.name}
                  </div>
                  <div className="text-xs text-brand-text-secondary font-medium">
                    {emergencyContact.relation} • {emergencyContact.phone}
                  </div>
                </div>
              </div>
              <span className="text-xs font-black uppercase tracking-wider bg-blue-600 text-white px-3 py-1.5 rounded-full shadow-xs">
                Dial
              </span>
            </a>
          )}

          {/* Share Current GPS Coordinates */}
          <div className="p-4 rounded-2xl bg-brand-bg border border-brand-border">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-brand-text-secondary uppercase tracking-wider">
                Instant GPS Broadcast
              </span>
              {currentLocation ? (
                <span className="text-xs text-teal-700 font-mono font-bold">
                  {currentLocation.lat.toFixed(4)}, {currentLocation.lng.toFixed(4)}
                </span>
              ) : (
                <span className="text-xs text-warning-700 font-medium">Location pending GPS</span>
              )}
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleCopyLocation}
                className="flex-1 py-2.5 px-3 rounded-full bg-white hover:bg-brand-bg-secondary active:scale-95 text-xs font-bold text-brand-text flex items-center justify-center gap-2 transition-all border border-brand-border shadow-xs"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-teal-600" />
                    <span className="text-teal-700">Copied Location</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-brand-text-muted" />
                    <span>Copy Distress Message</span>
                  </>
                )}
              </button>
              <button
                onClick={handleNativeShare}
                className="py-2.5 px-4 rounded-full bg-teal-500 hover:bg-teal-600 active:scale-95 text-xs font-bold text-white flex items-center gap-1.5 transition-all shadow-sm"
              >
                <Share2 className="w-4 h-4" />
                <span>Share</span>
              </button>
            </div>
          </div>
        </div>

        {/* Accidental cancel button */}
        <div className="pt-3 border-t border-brand-border flex items-center justify-between">
          <p className="text-[11px] text-brand-text-secondary leading-tight pr-4 font-medium">
            *Emergency numbers trigger your native phone app. HERPATH never claims delivery without real telecommunication carrier response.
          </p>
          <button
            onClick={onClose}
            className="py-2 px-3.5 rounded-full text-xs font-bold text-brand-text-secondary hover:text-brand-text bg-brand-bg hover:bg-brand-bg-secondary transition-colors shrink-0"
          >
            Cancel / False Alarm
          </button>
        </div>
      </div>
    </div>
  );
};
