'use client';

import React, { useState, useEffect, useRef } from 'react';
import { PhoneCall, ShieldAlert, Sparkles } from 'lucide-react';
import { SOSService } from '@/services/sos-service';

interface SosTripleTapButtonProps {
  onTriggerSOS: (triggerMethod: 'triple_tap' | 'quick_action') => void;
  variant?: 'header' | 'floating' | 'card';
  className?: string;
  isTestMode?: boolean;
}

export const SosTripleTapButton: React.FC<SosTripleTapButtonProps> = ({
  onTriggerSOS,
  variant = 'header',
  className = '',
  isTestMode = false,
}) => {
  const [tapCount, setTapCount] = useState<number>(0);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const resetTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Clear timeout on unmount
  useEffect(() => {
    return () => {
      if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
    };
  }, []);

  const handleTap = (e: React.MouseEvent) => {
    e.stopPropagation();

    if (resetTimerRef.current) {
      clearTimeout(resetTimerRef.current);
    }

    const { tapCount: newCount, isTriggered, remainingTaps } = SOSService.registerTap();
    setTapCount(newCount);

    if (isTriggered) {
      setFeedbackMessage('🚨 SOS TRIGGERED!');
      setTapCount(0);
      onTriggerSOS('triple_tap');
      setTimeout(() => setFeedbackMessage(null), 2500);
      return;
    }

    if (newCount === 1) {
      setFeedbackMessage('Tap 2 more times (1/3)');
    } else if (newCount === 2) {
      setFeedbackMessage('Tap once more! (2/3)');
    }

    // Reset tap progress after 2 seconds
    resetTimerRef.current = setTimeout(() => {
      setTapCount(0);
      setFeedbackMessage(null);
      SOSService.resetTaps();
    }, SOSService.TAP_WINDOW_MS);
  };

  if (variant === 'floating') {
    return (
      <div className={`fixed bottom-[calc(5rem+env(safe-area-inset-bottom,0px))] right-3 sm:right-6 lg:bottom-6 lg:right-6 z-[50] flex flex-col items-end gap-1.5 ${className}`}>
        {/* Tap Progress Feedback Tooltip */}
        {feedbackMessage && (
          <div className="bg-slate-900 text-white border border-rose-500 px-3 py-1.5 rounded-full text-xs font-bold shadow-2xl animate-bounce flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
            <span>{feedbackMessage}</span>
          </div>
        )}

        <button
          type="button"
          onClick={handleTap}
          className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl text-white shadow-xl flex flex-col items-center justify-center gap-0.5 transition-all duration-150 active:scale-90 select-none ${
            tapCount > 0
              ? 'bg-rose-700 ring-4 ring-rose-500/50 scale-105'
              : 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/30'
          } ${isTestMode ? 'ring-2 ring-emerald-400' : ''}`}
          aria-label={`Emergency SOS - Triple tap to activate. Current progress: ${tapCount} of 3 taps.`}
          title="Triple-tap rapidly (3 times within 2 seconds) to activate Emergency SOS"
        >
          <PhoneCall className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" />
          <span className="text-[9px] sm:text-[10px] font-black tracking-wider leading-none">
            {tapCount > 0 ? `${tapCount}/3` : 'SOS'}
          </span>
          {isTestMode && (
            <span className="text-[7px] bg-emerald-950 text-emerald-300 px-1 rounded font-bold uppercase">
              TEST
            </span>
          )}
        </button>
      </div>
    );
  }

  // Header or Card variant
  return (
    <div className={`relative inline-flex items-center ${className}`}>
      {/* Floating tap progress badge for header */}
      {feedbackMessage && (
        <div className="absolute -bottom-9 right-0 bg-[#1E1233] text-white border border-[#C1121F] px-2.5 py-1 rounded-full text-[11px] font-bold shadow-xl whitespace-nowrap z-50 flex items-center gap-1 animate-fade-in">
          <span className="w-2 h-2 rounded-full bg-emergency animate-pulse" />
          <span>{feedbackMessage}</span>
        </div>
      )}

      <button
        type="button"
        onClick={handleTap}
        className={`px-3 sm:px-3.5 py-1.5 rounded-full text-xs font-black flex items-center gap-1.5 transition-all active:scale-95 text-white shadow-sm select-none ${
          tapCount > 0
            ? 'bg-[#A30E1A] ring-2 ring-white scale-105'
            : 'bg-[#C1121F] hover:bg-[#A30E1A]'
        } ${isTestMode ? 'border border-emerald-400' : ''}`}
        aria-label={`Emergency SOS: Triple tap within 2 seconds to activate. Progress: ${tapCount} of 3.`}
        title="Triple-tap (3 times within 2s) to activate Emergency SOS"
      >
        <PhoneCall className="w-3.5 h-3.5 stroke-[2.5]" />
        <span>{tapCount > 0 ? `TAP ${tapCount}/3` : 'SOS'}</span>
        {isTestMode && (
          <span className="text-[9px] bg-black/40 text-emerald-300 px-1 py-0.2 rounded font-mono font-bold">
            TEST
          </span>
        )}
      </button>
    </div>
  );
};
