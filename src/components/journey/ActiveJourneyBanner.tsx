'use client';

import React, { useState, useEffect } from 'react';
import { JourneySession, JourneyCheckIn } from '@/types';
import { generateId } from '@/lib/utils';
import {
  Compass,
  CheckCircle,
  Clock,
  Share2,
  Check,
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
          // Check-in interval reached
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
      note: 'Periodic safety confirmation sent',
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
      `Tracking my journey on HERPATH to ${journey.destinationName}. Live link: ${shareUrl}`
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const minutesRemaining = Math.floor(secondsRemaining / 60);
  const secsRemaining = secondsRemaining % 60;

  return (
    <div className="bg-white/85 border-b border-champagne-200/80 p-3 sm:p-4 text-brand-text backdrop-blur-2xl shadow-glass-pearl transition-all">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        {/* Left Side: Status & Destination */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-teal-50 border border-teal-200/90 flex items-center justify-center text-teal-600 shrink-0 shadow-sm ring-1 ring-champagne-300/70">
            <Compass className="w-5 h-5 animate-spin-slow text-teal-600" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span
                className={`text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full border shadow-xs ${
                  journey.status === 'check_in_due'
                    ? 'bg-warning-50 text-warning-700 border-warning-200 animate-pulse'
                    : journey.status === 'arrived'
                    ? 'bg-teal-50 text-teal-700 border-teal-200'
                    : 'bg-softblue-50 text-blue-700 border-softblue-200'
                }`}
              >
                {journey.status === 'check_in_due'
                  ? 'Check-In Due'
                  : journey.status === 'arrived'
                  ? 'Arrived Safely'
                  : 'Journey In Progress'}
              </span>
              <span className="text-[11px] text-brand-text-secondary font-medium">
                Sharing with: <strong className="text-brand-text font-bold">{journey.trustedContact?.name || 'Contact'}</strong>
              </span>
            </div>
            <h4 className="text-sm font-black text-brand-text flex items-center gap-1.5 mt-0.5">
              <span className="text-brand-text-secondary font-medium">Heading to:</span>
              <span className="text-teal-700 truncate max-w-xs">{journey.destinationName}</span>
            </h4>
          </div>
        </div>

        {/* Center: Check-in Timer */}
        {journey.status !== 'arrived' && (
          <div className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-brand-bg border border-brand-border text-xs shadow-xs">
            <Clock className="w-4 h-4 text-teal-600" />
            <div className="leading-tight">
              <span className="text-[10px] text-brand-text-muted uppercase tracking-wider block font-bold">
                Next Check-In In
              </span>
              <span className="font-mono font-black text-brand-text">
                {minutesRemaining}:{secsRemaining < 10 ? `0${secsRemaining}` : secsRemaining}
              </span>
            </div>
          </div>
        )}

        {/* Right Side: Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
          {journey.status !== 'arrived' ? (
            <>
              <button
                onClick={handleCheckIn}
                className="py-2 px-4 rounded-full bg-teal-500 hover:bg-teal-600 active:scale-95 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all"
              >
                {showCheckInSuccess ? (
                  <>
                    <Check className="w-4 h-4 text-white" />
                    <span>Checked In!</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    <span>I'm OK (Check In)</span>
                  </>
                )}
              </button>

              <button
                onClick={handleArrived}
                className="py-2 px-4 rounded-full bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm"
              >
                <span>Arrived Safely 🎉</span>
              </button>
            </>
          ) : (
            <div className="text-xs font-bold text-teal-800 bg-teal-50 px-3.5 py-1.5 rounded-full border border-teal-200">
              Trip completed safely!
            </div>
          )}

          <button
            onClick={handleCopyShareLink}
            className="py-2 px-3.5 rounded-full bg-brand-bg hover:bg-white border border-brand-border text-xs font-semibold text-brand-text transition-colors flex items-center gap-1.5 shadow-xs"
            title="Copy shareable journey link"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-teal-600" /> : <Share2 className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{copied ? 'Link Copied' : 'Share'}</span>
          </button>

          <button
            onClick={onEndJourney}
            className="py-2 px-3.5 rounded-full bg-danger-50 hover:bg-danger-100 border border-danger-200 text-xs font-bold text-danger-700 transition-colors"
            title="End or cancel journey"
          >
            <span>End Trip</span>
          </button>
        </div>
      </div>
    </div>
  );
};
