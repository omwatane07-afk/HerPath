'use client';

import React from 'react';
import { GirlyCharacter } from '../character/GirlyCharacter';
import { ShieldCheck, HeartHandshake, EyeOff, Sparkles, ArrowRight, X } from 'lucide-react';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartPlanning: () => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  onClose,
  onStartPlanning,
}) => {
  if (!isOpen) return null;

  const handleStart = () => {
    try {
      localStorage.setItem('herpath_onboarding_completed', 'true');
    } catch {
      // storage unavailable
    }
    onStartPlanning();
  };

  return (
    <div
      className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-[#191421]/60 backdrop-blur-md animate-fade-in overflow-y-auto font-sans"
      role="dialog"
      aria-modal="true"
      aria-labelledby="onboarding-title"
    >
      <div className="relative w-full max-w-xl bg-[#FCFAFF] border-2 border-white rounded-[28px] shadow-sticker-lg p-6 sm:p-8 text-ink my-auto overflow-hidden animate-modal">
        {/* Dismiss Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-9 h-9 rounded-full bg-white/90 hover:bg-white text-soft-ink hover:text-ink flex items-center justify-center shadow-sm border border-purple-100 transition-colors focus-ring-primary z-20"
          aria-label="Skip introduction"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Hero Header with Animated Mascot Character */}
        <div className="text-center pt-2 pb-3">
          <div className="inline-block mb-2">
            <GirlyCharacter size={68} isWalking={true} showTrailHeart={true} />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-lavender border border-purple-200 text-primary text-xs font-bold mb-2">
            <span>🎀</span>
            <span>Girly Map World Navigation</span>
          </div>

          <h2
            id="onboarding-title"
            className="font-heading text-2xl sm:text-3xl font-extrabold text-ink tracking-tight"
          >
            Meet Your Journey Companion!
          </h2>
          <p className="text-sm text-soft-ink max-w-md mx-auto mt-1 font-medium">
            Watch your mascot travel along your REAL walking route on the map, with transparent lighting audits and private family check-ins.
          </p>
        </div>

        {/* Three Compact Value Proposition Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-5 relative z-10">
          {/* Card 1: Real Route Animation */}
          <div className="sticker-card p-3.5 flex flex-col items-start bg-white text-left">
            <div className="w-8 h-8 rounded-full bg-lavender flex items-center justify-center text-primary mb-2 font-bold shadow-sm">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <h4 className="font-heading font-extrabold text-xs text-ink mb-1">
              Real Route Journey
            </h4>
            <p className="text-[11px] text-soft-ink leading-relaxed font-medium">
              Your mascot traces the actual geometry of your selected pedestrian corridor.
            </p>
          </div>

          {/* Card 2: Trusted Contacts */}
          <div className="sticker-card p-3.5 flex flex-col items-start bg-white text-left">
            <div className="w-8 h-8 rounded-full bg-bubblegum/20 flex items-center justify-center text-hotpink mb-2 font-bold shadow-sm">
              <HeartHandshake className="w-4 h-4 text-hotpink" />
            </div>
            <h4 className="font-heading font-extrabold text-xs text-ink mb-1">
              Family Trips Ribbon
            </h4>
            <p className="text-[11px] text-soft-ink leading-relaxed font-medium">
              Share real-time walk progress with trusted contacts using secure private tokens.
            </p>
          </div>

          {/* Card 3: Real Privacy */}
          <div className="sticker-card p-3.5 flex flex-col items-start bg-white text-left">
            <div className="w-8 h-8 rounded-full bg-butter/30 flex items-center justify-center text-amber-800 mb-2 font-bold shadow-sm">
              <EyeOff className="w-4 h-4" />
            </div>
            <h4 className="font-heading font-extrabold text-xs text-ink mb-1">
              Zero Tracking
            </h4>
            <p className="text-[11px] text-soft-ink leading-relaxed font-medium">
              Local-first data. No third-party ad brokers or silent location broadcasting.
            </p>
          </div>
        </div>

        {/* Start Button & Note */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 relative z-10 border-t border-purple-100">
          <p className="text-xs text-soft-ink font-semibold flex items-center gap-1.5">
            <span>✨</span>
            <span>Ready for your next walk?</span>
          </p>

          <button
            type="button"
            onClick={handleStart}
            className="btn-primary w-full sm:w-auto px-7 py-3 text-sm font-bold flex items-center justify-center gap-2 group"
          >
            <span>Start Exploring (Plan Route)</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </button>
        </div>
      </div>
    </div>
  );
};
