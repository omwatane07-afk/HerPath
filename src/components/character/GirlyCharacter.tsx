'use client';

import React from 'react';

export interface GirlyCharacterProps {
  className?: string;
  size?: number;
  isWalking?: boolean;
  facing?: 'left' | 'right';
  hasBow?: boolean;
  showTrailHeart?: boolean;
}

export const GirlyCharacter: React.FC<GirlyCharacterProps> = ({
  className = '',
  size = 48,
  isWalking = false,
  facing = 'right',
  hasBow = true,
  showTrailHeart = false,
}) => {
  const isFacingLeft = facing === 'left';

  return (
    <div
      className={`relative inline-block select-none ${className}`}
      style={{
        width: size,
        height: size * 1.25,
        transform: isFacingLeft ? 'scaleX(-1)' : 'none',
      }}
      aria-label="HERPATH journey mascot character"
    >
      {/* Optional Sparkle / Heart trailing behind character */}
      {showTrailHeart && (
        <div
          className="absolute -top-1 -left-2 text-[12px] heart-pop pointer-events-none"
          style={{ transform: isFacingLeft ? 'scaleX(-1)' : 'none' }}
        >
          💖
        </div>
      )}

      <div className={isWalking ? 'girl-walk-bounce' : ''}>
        <svg
          viewBox="0 0 80 100"
          width={size}
          height={size * 1.25}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="filter drop-shadow-md"
        >
          <defs>
            {/* Ground Contact Shadow */}
            <radialGradient id="girlShadowGrad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#191421" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#191421" stopOpacity="0" />
            </radialGradient>

            {/* Hair Color Gradient */}
            <linearGradient id="girlHairGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#4A2818" />
              <stop offset="100%" stopColor="#2E170B" />
            </linearGradient>

            {/* Jacket Lavender Gradient */}
            <linearGradient id="girlJacketGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#DCCBFF" />
              <stop offset="100%" stopColor="#B99AFF" />
            </linearGradient>

            {/* Skirt Purple Gradient */}
            <linearGradient id="girlSkirtGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#7047EB" />
              <stop offset="100%" stopColor="#4A258C" />
            </linearGradient>

            {/* Bow Hot Pink Gradient */}
            <linearGradient id="girlBowGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#FF91C8" />
              <stop offset="100%" stopColor="#F65BA8" />
            </linearGradient>
          </defs>

          {/* Soft Ground Contact Shadow */}
          <ellipse cx="40" cy="94" rx="22" ry="5" fill="url(#girlShadowGrad)" />

          {/* White Die-cut Sticker Silhouette Background */}
          <g stroke="#FFFFFF" strokeWidth="5" strokeLinejoin="round" strokeLinecap="round" opacity="0.95">
            {/* Back Hair Ponytail */}
            <path d="M22 28 C12 28 8 45 14 58 C18 64 24 60 26 52 Z" fill="#FFFFFF" />
            {/* Body Outer Contour */}
            <circle cx="42" cy="34" r="17" fill="#FFFFFF" />
            <path d="M28 50 L56 50 L58 72 L26 72 Z" fill="#FFFFFF" />
            <rect x="30" y="72" width="8" height="18" rx="4" fill="#FFFFFF" />
            <rect x="44" y="72" width="8" height="18" rx="4" fill="#FFFFFF" />
          </g>

          {/* === CHARACTER DRAWING === */}

          {/* 1. Back Hair Ponytail */}
          <path
            d="M26 30 C15 30 10 46 16 57 C20 63 26 58 28 50 Z"
            fill="url(#girlHairGrad)"
          />
          {/* Ponytail Strand Highlight */}
          <path d="M19 38 C15 44 16 52 20 55" stroke="#7A4C32" strokeWidth="1.5" strokeLinecap="round" />

          {/* 2. Legs & Sneakers */}
          {/* Left Leg */}
          <rect x="32" y="70" width="6" height="15" rx="3" fill="#FFE2D1" />
          <rect x="31" y="80" width="8" height="5" rx="2" fill="#FFFFFF" />
          <path d="M30 84 H39 C41 84 41 90 39 90 H29 C28 90 28 84 30 84 Z" fill="#F1EAFF" stroke="#7047EB" strokeWidth="1.2" />
          <rect x="31" y="86" width="3" height="2" fill="#F65BA8" />

          {/* Right Leg */}
          <rect x="44" y="70" width="6" height="15" rx="3" fill="#FFE2D1" />
          <rect x="43" y="80" width="8" height="5" rx="2" fill="#FFFFFF" />
          <path d="M42 84 H51 C53 84 53 90 51 90 H41 C40 90 40 84 42 84 Z" fill="#F1EAFF" stroke="#7047EB" strokeWidth="1.2" />
          <rect x="43" y="86" width="3" height="2" fill="#F65BA8" />

          {/* 3. Purple Pleated Skirt */}
          <path
            d="M28 62 L56 62 L59 74 L25 74 Z"
            fill="url(#girlSkirtGrad)"
          />
          {/* Skirt pleat lines & white hem */}
          <line x1="36" y1="62" x2="35" y2="74" stroke="#5C32D9" strokeWidth="1" />
          <line x1="44" y1="62" x2="44" y2="74" stroke="#5C32D9" strokeWidth="1" />
          <line x1="51" y1="62" x2="52" y2="74" stroke="#5C32D9" strokeWidth="1" />
          <path d="M25 73 Q42 75 59 73" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" />

          {/* 4. Chic Lavender Jacket & Top */}
          <path
            d="M29 48 C29 46 34 44 42 44 C50 44 55 46 55 48 L56 63 L28 63 Z"
            fill="url(#girlJacketGrad)"
          />
          {/* Jacket Collar / Zipper */}
          <path d="M37 44 L42 52 L47 44" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="42" y1="52" x2="42" y2="63" stroke="#7047EB" strokeWidth="1.2" />

          {/* Tiny Star Badge on Jacket Lapel */}
          <polygon points="34,52 35,54 37,54 35.5,55.5 36,57.5 34,56 32,57.5 32.5,55.5 31,54 33,54" fill="#FFD966" />

          {/* 5. Cute Crossbody Bag */}
          <path d="M32 46 L51 64" stroke="#F65BA8" strokeWidth="1.8" strokeLinecap="round" />
          <rect x="48" y="58" width="9" height="8" rx="2.5" fill="#FF91C8" stroke="#FFFFFF" strokeWidth="1" />
          <circle cx="52.5" cy="62" r="1.2" fill="#FFD966" />

          {/* 6. Arms */}
          {/* Left Arm swinging */}
          <path d="M29 50 C25 54 26 60 28 64" stroke="#FFE2D1" strokeWidth="3.5" strokeLinecap="round" />
          {/* Right Arm swinging forward */}
          <path d="M54 50 C58 54 57 60 55 64" stroke="#FFE2D1" strokeWidth="3.5" strokeLinecap="round" />

          {/* 7. Cute Face & Hair */}
          {/* Head Base */}
          <circle cx="42" cy="34" r="13" fill="#FFE2D1" />

          {/* Rosy Cheeks */}
          <ellipse cx="34" cy="37" rx="2.5" ry="1.5" fill="#FF91C8" fillOpacity="0.75" />
          <ellipse cx="49" cy="37" rx="2.5" ry="1.5" fill="#FF91C8" fillOpacity="0.75" />

          {/* Expressive Anime Eyes */}
          {/* Left Eye */}
          <ellipse cx="37" cy="33" rx="2.2" ry="3.2" fill="#191421" />
          <circle cx="36" cy="32" r="1" fill="#FFFFFF" />
          <circle cx="38" cy="34.5" r="0.5" fill="#FFFFFF" />

          {/* Right Eye */}
          <ellipse cx="46" cy="33" rx="2.2" ry="3.2" fill="#191421" />
          <circle cx="45" cy="32" r="1" fill="#FFFFFF" />
          <circle cx="47" cy="34.5" r="0.5" fill="#FFFFFF" />

          {/* Cute Smile */}
          <path d="M40 38 Q42 40 44 38" stroke="#D35A88" strokeWidth="1.2" strokeLinecap="round" />

          {/* Front Hair Bangs */}
          <path
            d="M30 30 C30 22 36 21 44 21 C52 21 55 24 55 30 C53 28 50 29 48 27 C44 29 40 28 38 27 C35 29 32 28 30 30 Z"
            fill="url(#girlHairGrad)"
          />

          {/* Hair Side Sweeps */}
          <path d="M30 30 C29 36 31 40 32 42" stroke="url(#girlHairGrad)" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M54 30 C55 36 54 40 53 42" stroke="url(#girlHairGrad)" strokeWidth="2.5" strokeLinecap="round" />

          {/* 8. Signature Hot Pink Hair Bow 🎀 */}
          {hasBow && (
            <g transform="translate(26, 18)">
              {/* Left Wing */}
              <path d="M6 6 C0 2 0 10 6 6 Z" fill="url(#girlBowGrad)" stroke="#FFFFFF" strokeWidth="0.8" />
              {/* Right Wing */}
              <path d="M6 6 C12 2 12 10 6 6 Z" fill="url(#girlBowGrad)" stroke="#FFFFFF" strokeWidth="0.8" />
              {/* Bow Center Knot */}
              <circle cx="6" cy="6" r="2.2" fill="#FFD966" stroke="#FFFFFF" strokeWidth="0.8" />
              {/* Ribbon tails */}
              <path d="M5 8 L3 12 M7 8 L9 12" stroke="#F65BA8" strokeWidth="1.2" strokeLinecap="round" />
            </g>
          )}

          {/* Little Floating Star Accent ✨ */}
          <polygon points="57,18 58,20 60,20 58.5,21.5 59,23.5 57,22 55,23.5 55.5,21.5 54,20 56,20" fill="#FFD966" />
        </svg>
      </div>
    </div>
  );
};

/**
 * Returns raw HTML string for Leaflet DivIcon marker rendering.
 * Ensures the character renders inside Leaflet maps with zero external image dependencies.
 */
export function getGirlyCharacterMarkerHtml(
  isWalking: boolean = true,
  facing: 'left' | 'right' = 'right',
  size: number = 46
): string {
  const transform = facing === 'left' ? 'transform: scaleX(-1);' : '';
  const animClass = isWalking ? 'girl-walk-bounce' : '';

  return `
    <div style="width: ${size}px; height: ${size * 1.25}px; ${transform}" class="custom-girly-marker select-none" role="img" aria-label="Walking Route Character">
      <div class="${animClass}" style="width: 100%; height: 100%;">
        <svg viewBox="0 0 80 100" width="${size}" height="${size * 1.25}" fill="none" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0 6px 12px rgba(112, 71, 235, 0.35));">
          <ellipse cx="40" cy="94" rx="20" ry="4" fill="#191421" fill-opacity="0.3" />
          <!-- White Die-cut Contour -->
          <circle cx="42" cy="34" r="17" fill="#FFFFFF" stroke="#FFFFFF" stroke-width="4" />
          <path d="M26 30 C15 30 10 46 16 57 C20 63 26 58 28 50 Z" fill="#2E170B" stroke="#FFFFFF" stroke-width="3" />
          <!-- Legs & Sneakers -->
          <rect x="32" y="70" width="6" height="15" rx="3" fill="#FFE2D1" />
          <rect x="30" y="84" width="9" height="6" rx="2" fill="#F1EAFF" stroke="#7047EB" stroke-width="1.2" />
          <rect x="44" y="70" width="6" height="15" rx="3" fill="#FFE2D1" />
          <rect x="42" y="84" width="9" height="6" rx="2" fill="#F1EAFF" stroke="#7047EB" stroke-width="1.2" />
          <!-- Skirt -->
          <path d="M28 62 L56 62 L59 74 L25 74 Z" fill="#7047EB" stroke="#FFFFFF" stroke-width="2" />
          <path d="M25 73 Q42 75 59 73" stroke="#FFFFFF" stroke-width="1.5" />
          <!-- Jacket -->
          <path d="M29 48 C29 46 34 44 42 44 C50 44 55 46 55 48 L56 63 L28 63 Z" fill="#DCCBFF" stroke="#FFFFFF" stroke-width="2" />
          <path d="M37 44 L42 52 L47 44" stroke="#FFFFFF" stroke-width="1.5" />
          <!-- Crossbody Bag -->
          <path d="M32 46 L51 64" stroke="#F65BA8" stroke-width="2" />
          <rect x="48" y="58" width="8" height="8" rx="2" fill="#FF91C8" stroke="#FFFFFF" stroke-width="1" />
          <!-- Head & Face -->
          <circle cx="42" cy="34" r="13" fill="#FFE2D1" />
          <ellipse cx="34" cy="37" rx="2.5" ry="1.5" fill="#FF91C8" fill-opacity="0.8" />
          <ellipse cx="49" cy="37" rx="2.5" ry="1.5" fill="#FF91C8" fill-opacity="0.8" />
          <ellipse cx="37" cy="33" rx="2.2" ry="3.2" fill="#191421" />
          <circle cx="36" cy="32" r="1" fill="#FFFFFF" />
          <ellipse cx="46" cy="33" rx="2.2" ry="3.2" fill="#191421" />
          <circle cx="45" cy="32" r="1" fill="#FFFFFF" />
          <path d="M40 38 Q42 40 44 38" stroke="#D35A88" stroke-width="1.2" stroke-linecap="round" />
          <!-- Hair & Bow -->
          <path d="M30 30 C30 22 36 21 44 21 C52 21 55 24 55 30 C53 28 50 29 48 27 C44 29 40 28 38 27 C35 29 32 28 30 30 Z" fill="#3D1D0F" />
          <g transform="translate(26, 18)">
            <path d="M6 6 C0 2 0 10 6 6 Z" fill="#F65BA8" stroke="#FFFFFF" stroke-width="0.8" />
            <path d="M6 6 C12 2 12 10 6 6 Z" fill="#F65BA8" stroke="#FFFFFF" stroke-width="0.8" />
            <circle cx="6" cy="6" r="2.2" fill="#FFD966" stroke="#FFFFFF" stroke-width="0.8" />
          </g>
          <polygon points="57,18 58,20 60,20 58.5,21.5 59,23.5 57,22 55,23.5 55.5,21.5 54,20 56,20" fill="#FFD966" />
        </svg>
      </div>
    </div>
  `;
}
