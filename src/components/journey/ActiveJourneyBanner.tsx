'use client';

import React, { useState, useEffect } from 'react';
import { JourneySession, JourneyCheckIn } from '@/types';
import { generateId } from '@/lib/utils';
import {
  CheckCircle,
  Clock,
  Share2,
  Check,
  Shield,
} from 'lucide-react';

interface ActiveJourneyBannerProps {
  journey: JourneySession;
  onUpdateJourney: (journey: JourneySession) => void;
  onEndJourney: () => void;
}

export const ActiveJourneyBanner: React.FC<ActiveJourneyBannerProps> = ({
  journey,
  onUpdateJourney,
  onEndJourney,
}) => {
  const [secondsRemaining, setSecondsRemaining] = useState<number>(() => {
    if (!journey.nextCheckInDueAt) return journey.checkInIntervalMinutes * 60;
    const diff = Math.max(
      0,
      Math.floor((new Date(journey.nextCheckInDueAt).getTime() - Date.now()) / 1000)
    );
    return diff;
  });
  const [copied, setCopied] = useState(false);
  const [showCheckInSuccess, setShowCheckInSuccess] = useState(false);

  // Timer countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          if (journey.status === 'in_progress') {
            onUpdateJourney({
              ...journey,
              status: 'check_in_due',
            });
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [journey, onUpdateJourney]);

  const handleCheckIn = () => {
    const now = new Date();
    const nextCheckIn = new Date(
      now.getTime() + journey.checkInIntervalMinutes * 60 * 1000
    ).toISOString();

    const newCheckIn: JourneyCheckIn = {
      id: generateId('chk'),
      timestamp: now.toISOString(),
      coordinates: journey.currentCoords,
      status: 'ok',
      note: 'Periodic safety check-in recorded',
    };

    const updated: JourneySession = {
      ...journey,
      status: 'in_progress',
      lastCheckInAt: now.toISOString(),
      nextCheckInDueAt: nextCheckIn,
      checkIns: [newCheckIn, ...journey.checkIns],
    };

    onUpdateJourney(updated);
    setSecondsRemaining(journey.checkInIntervalMinutes * 60);
    setShowCheckInSuccess(true);
    setTimeout(() => setShowCheckInSuccess(false), 3000);
  };

  const handleArrived = () => {
    const now = new Date();
    const newCheckIn: JourneyCheckIn = {
      id: generateId('chk'),
      timestamp: now.toISOString(),
      coordinates: journey.destCoords,
      status: 'arrived',
      note: 'Arrived safely at destination',
    };

    const updated: JourneySession = {
      ...journey,
      status: 'arrived',
      endedAt: now.toISOString(),
      checkIns: [newCheckIn, ...journey.checkIns],
    };

    onUpdateJourney(updated);
  };

  const handleCopyShareLink = () => {
    const shareUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}?journey=${
      journey.shareToken
    }`;
    navigator.clipboard.writeText(
      `Following my journey to ${journey.destinationName}. Local demo link: ${shareUrl}`
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const minutesRemaining = Math.floor(secondsRemaining / 60);
  const secsRemaining = secondsRemaining % 60;

  return (
    <div className="bg-white/95 backdrop-blur-md border-b border-border-gold/40 p-3 sm:px-6 text-bordeaux shadow-sm transition-all">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        {/* Status & Destination */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-rose-tint border border-rose-gold/30 flex items-center justify-center text-rose-gold shrink-0">
            <Shield className="w-4 h-4 text-rose-gold" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span
                className={`text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full border ${
                  journey.status === 'check_in_due'
                    ? 'bg-caution-tint text-caution-dark border-caution/30'
                    : journey.status === 'arrived'
                    ? 'bg-verified-tint text-verified border-verified/30'
                    : 'bg-canvas text-bordeaux border-border'
                }`}
              >
                {journey.status === 'check_in_due'
                  ? 'Check-In Due'
                  : journey.status === 'arrived'
                  ? 'Arrived Safely'
                  : 'Journey Sharing Active'}
              </span>
              <span className="text-[11px] text-text-secondary">
                Contact: <strong className="text-bordeaux font-semibold">{journey.trustedContact?.name || 'Trusted Contact'}</strong>
              </span>
            </div>
            <h4 className="font-editorial text-base font-bold text-bordeaux mt-0.5 flex items-center gap-1.5">
              <span className="text-text-secondary font-normal font-sans text-xs">Destination:</span>
              <span className="truncate max-w-xs">{journey.destinationName}</span>
            </h4>
          </div>
        </div>

        {/* Check-in Timer */}
        {journey.status !== 'arrived' && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-canvas border border-border text-xs">
            <Clock className="w-3.5 h-3.5 text-champagne" />
            <div className="leading-tight">
              <span className="text-[10px] text-text-secondary uppercase tracking-wider block font-medium">
                Next Check-In
              </span>
              <span className="font-editorial font-bold text-bordeaux">
                {minutesRemaining}:{secsRemaining < 10 ? `0${secsRemaining}` : secsRemaining}
              </span>
            </div>
          </div>
        )}

        {/* Action Buttons: I'm OK, Arrived, Share, Stop Sharing */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
          {journey.status !== 'arrived' ? (
            <>
              <button
                type="button"
                onClick={handleCheckIn}
                className="btn-bordeaux py-1.5 px-3.5 text-xs font-semibold flex items-center gap-1.5 shadow-sm"
              >
                {showCheckInSuccess ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-champagne" />
                    <span>Checked In!</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-3.5 h-3.5 text-champagne" />
                    <span>I'm OK (Check-In)</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleArrived}
                className="btn-secondary py-1.5 px-3 text-xs font-semibold flex items-center gap-1.5"
              >
                <span>Arrived Safely</span>
              </button>
            </>
          ) : (
            <div className="text-xs font-semibold text-verified bg-verified-tint px-3 py-1 rounded-full border border-verified/30">
              Trip completed safely
            </div>
          )}

          <button
            type="button"
            onClick={handleCopyShareLink}
            className="btn-secondary py-1.5 px-3 text-xs flex items-center gap-1.5"
            title="Copy share link (stored locally on this device)"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-rose-gold" /> : <Share2 className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{copied ? 'Link Copied' : 'Share Link'}</span>
          </button>

          {/* Persistent Stop Sharing Button */}
          <button
            type="button"
            onClick={onEndJourney}
            className="py-1.5 px-3 rounded-xl bg-white border border-danger/40 hover:bg-danger-tint text-xs font-bold text-danger transition-colors focus-ring-bordeaux"
            title="Immediately stop sharing location and trip status"
          >
            <span>Stop sharing</span>
          </button>
        </div>
      </div>
    </div>
  );
};
