'use client';

import React, { useState, useEffect } from 'react';
import { JourneySession, JourneyCheckIn } from '@/types';
import { generateId } from '@/lib/utils';
import {
  Compass,
  CheckCircle,
  AlertCircle,
  Clock,
  Share2,
  Copy,
  Check,
  X,
  Phone,
  Sparkles,
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
    <div className="bg-navy-950/95 border-b border-teal-500/40 p-3 sm:p-4 text-slate-100 backdrop-blur-md shadow-xl transition-all">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        {/* Left Side: Status & Destination */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-teal-950 border border-teal-500/50 flex items-center justify-center text-teal-400 shrink-0">
            <Compass className="w-5 h-5 animate-spin-slow" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-teal-950 border border-teal-600 text-teal-300">
                {journey.status === 'check_in_due'
                  ? 'Check-In Due'
                  : journey.status === 'arrived'
                  ? 'Arrived Safely'
                  : 'Journey In Progress'}
              </span>
              <span className="text-[11px] text-slate-400">
                Sharing with: <strong className="text-slate-200">{journey.trustedContact?.name || 'Contact'}</strong>
              </span>
            </div>
            <h4 className="text-sm font-bold text-white flex items-center gap-1.5 mt-0.5">
              <span>Heading to:</span>
              <span className="text-teal-300 truncate max-w-xs">{journey.destinationName}</span>
            </h4>
          </div>
        </div>

        {/* Center: Check-in Timer */}
        {journey.status !== 'arrived' && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-navy-900 border border-slate-800 text-xs">
            <Clock className="w-4 h-4 text-teal-400" />
            <div className="leading-tight">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                Next Check-In In
              </span>
              <span className="font-mono font-bold text-white">
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
                className="py-2 px-3.5 rounded-xl bg-teal-600 hover:bg-teal-500 active:scale-95 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-teal-950/60 transition-all"
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
                className="py-2 px-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-md"
              >
                <span>Arrived Safely 🎉</span>
              </button>
            </>
          ) : (
            <div className="text-xs font-semibold text-emerald-400 bg-emerald-950/60 px-3 py-1.5 rounded-xl border border-emerald-800">
              Trip completed safely!
            </div>
          )}

          <button
            onClick={handleCopyShareLink}
            className="py-2 px-3 rounded-xl bg-navy-850 hover:bg-navy-800 border border-slate-700 text-xs text-slate-300 hover:text-white transition-colors flex items-center gap-1"
            title="Copy shareable journey link"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{copied ? 'Link Copied' : 'Share'}</span>
          </button>

          <button
            onClick={onEndJourney}
            className="py-2 px-3 rounded-xl bg-navy-850 hover:bg-rose-950 border border-slate-700 hover:border-rose-800 text-xs text-slate-400 hover:text-rose-300 transition-colors"
            title="End or cancel journey"
          >
            <span>End Trip</span>
          </button>
        </div>
      </div>
    </div>
  );
};
