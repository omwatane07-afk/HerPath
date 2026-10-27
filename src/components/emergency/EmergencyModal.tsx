import React, { useState } from 'react';
import { Phone, AlertCircle, Share2, Copy, Check, X, ShieldAlert, HeartHandshake } from 'lucide-react';
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
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-navy-950/85 backdrop-blur-md animate-fadeIn">
      <div className="bg-navy-900 border-2 border-rose-500/60 rounded-2xl max-w-lg w-full p-6 text-slate-100 shadow-2xl relative overflow-hidden">
        {/* Urgent header accent */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-rose-600 via-amber-500 to-rose-600 animate-pulse" />

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-rose-950 flex items-center justify-center border border-rose-500/50">
              <ShieldAlert className="w-6 h-6 text-rose-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-wide">Emergency Support</h2>
              <p className="text-xs text-rose-300 font-medium">Immediate Assistance & Trusted Contacts</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-lg bg-navy-800 transition-colors"
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
            className="flex items-center justify-between p-4 rounded-xl bg-rose-600 hover:bg-rose-700 active:scale-[0.99] transition-all text-white font-semibold shadow-lg shadow-rose-950/50 group"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-lg bg-rose-700 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Phone className="w-5 h-5" />
              </div>
              <div className="text-left">
                <div className="text-base font-bold">Call Emergency Police / Medical ({defaultEmergencyNumber})</div>
                <div className="text-xs text-rose-100 font-normal">Immediate direct telephone connection</div>
              </div>
            </div>
            <span className="text-xs font-bold uppercase tracking-wider bg-rose-800/80 px-2.5 py-1 rounded">
              Call
            </span>
          </a>

          {/* Women Helpline */}
          <a
            href={`tel:${womenHelplineNumber}`}
            className="flex items-center justify-between p-4 rounded-xl bg-navy-800 hover:bg-navy-750 border border-teal-500/40 text-white font-semibold transition-all group"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-lg bg-teal-950/80 border border-teal-500/40 flex items-center justify-center group-hover:scale-110 transition-transform">
                <HeartHandshake className="w-5 h-5 text-teal-400" />
              </div>
              <div className="text-left">
                <div className="text-base font-bold text-teal-300">
                  National Women's Helpline ({womenHelplineNumber})
                </div>
                <div className="text-xs text-slate-300 font-normal">
                  24/7 designated women distress support
                </div>
              </div>
            </div>
            <span className="text-xs font-bold uppercase tracking-wider bg-teal-950 text-teal-300 border border-teal-700 px-2.5 py-1 rounded">
              Call
            </span>
          </a>

          {/* Trusted Family / Contact */}
          {emergencyContact && (
            <a
              href={`tel:${emergencyContact.phone.replace(/[^0-9+]/g, '')}`}
              className="flex items-center justify-between p-4 rounded-xl bg-navy-800 hover:bg-navy-750 border border-indigo-500/30 text-white font-semibold transition-all group"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-lg bg-indigo-950/80 border border-indigo-500/40 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Phone className="w-5 h-5 text-indigo-400" />
                </div>
                <div className="text-left">
                  <div className="text-base font-bold text-indigo-200">
                    Call Trusted Contact: {emergencyContact.name}
                  </div>
                  <div className="text-xs text-slate-300 font-normal">
                    {emergencyContact.relation} • {emergencyContact.phone}
                  </div>
                </div>
              </div>
              <span className="text-xs font-bold uppercase tracking-wider bg-indigo-950 text-indigo-300 border border-indigo-700 px-2.5 py-1 rounded">
                Dial
              </span>
            </a>
          )}

          {/* Share Current GPS Coordinates */}
          <div className="p-4 rounded-xl bg-navy-850 border border-slate-700">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Instant GPS Broadcast
              </span>
              {currentLocation ? (
                <span className="text-xs text-teal-400 font-mono">
                  {currentLocation.lat.toFixed(4)}, {currentLocation.lng.toFixed(4)}
                </span>
              ) : (
                <span className="text-xs text-amber-400">Location pending permission</span>
              )}
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleCopyLocation}
                className="flex-1 py-2 px-3 rounded-lg bg-navy-700 hover:bg-navy-600 active:scale-95 text-xs font-medium text-slate-200 flex items-center justify-center gap-2 transition-all border border-slate-600"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>Copied Coordinates to Clipboard</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-slate-400" />
                    <span>Copy Distress Message</span>
                  </>
                )}
              </button>
              <button
                onClick={handleNativeShare}
                className="py-2 px-4 rounded-lg bg-teal-600 hover:bg-teal-500 active:scale-95 text-xs font-medium text-white flex items-center gap-1.5 transition-all"
              >
                <Share2 className="w-4 h-4" />
                <span>Share</span>
              </button>
            </div>
          </div>
        </div>

        {/* Accidental cancel button */}
        <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
          <p className="text-[11px] text-slate-400 leading-tight pr-4">
            *Emergency numbers trigger your native phone app. HERPATH never claims delivery without real telecommunication carrier response.
          </p>
          <button
            onClick={onClose}
            className="py-1.5 px-3 rounded-lg text-xs font-medium text-slate-300 hover:text-white bg-navy-800 hover:bg-navy-700 transition-colors shrink-0"
          >
            Cancel / False Alarm
          </button>
        </div>
      </div>
    </div>
  );
};
