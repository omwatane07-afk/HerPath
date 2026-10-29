'use client';

import React from 'react';

export interface PocketPlanetProps {
  className?: string;
  size?: number;
}

export const PocketPlanet: React.FC<PocketPlanetProps> = ({
  className = '',
  size = 180,
}) => {
  return (
    <div
      className={`relative inline-block select-none ${className}`}
      style={{ width: size, height: size * 0.8 }}
      aria-label="Illustrated miniature city block (Decorative scrapbook illustration)"
    >
      <svg
        viewBox="0 0 240 190"
        width={size}
        height={size * 0.8}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="filter drop-shadow-md"
      >
        <defs>
          {/* Isometric Ground Base Gradient */}
          <linearGradient id="groundTop" x1="120" y1="90" x2="120" y2="155">
            <stop offset="0%" stopColor="#F6EFE6" />
            <stop offset="100%" stopColor="#EDE3D8" />
          </linearGradient>
          <linearGradient id="groundLeft" x1="30" y1="120" x2="120" y2="175">
            <stop offset="0%" stopColor="#DDD0C2" />
            <stop offset="100%" stopColor="#CBBBAA" />
          </linearGradient>
          <linearGradient id="groundRight" x1="120" y1="175" x2="210" y2="120">
            <stop offset="0%" stopColor="#C5B4A2" />
            <stop offset="100%" stopColor="#B2A08D" />
          </linearGradient>

          {/* Building Grape / Lilac / Strawberry Gradients */}
          <linearGradient id="bldgGrape" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#7564EE" />
            <stop offset="100%" stopColor="#5B47E0" />
          </linearGradient>
          <linearGradient id="bldgLilac" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#A8B4FF" />
            <stop offset="100%" stopColor="#8E9BFF" />
          </linearGradient>
          <linearGradient id="bldgPink" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FFB3C7" />
            <stop offset="100%" stopColor="#FF8FB1" />
          </linearGradient>
          <linearGradient id="roofButter" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#FFE899" />
            <stop offset="100%" stopColor="#FFD966" />
          </linearGradient>
        </defs>

        {/* Ambient Ground Island Shadow */}
        <ellipse cx="120" cy="168" rx="85" ry="18" fill="#2B1B3D" fillOpacity="0.08" />

        {/* Isometric Paper Island Base */}
        {/* Top Face */}
        <polygon points="120,95 210,135 120,175 30,135" fill="url(#groundTop)" stroke="#FFFFFF" strokeWidth="2" />
        {/* Left Depth Face */}
        <polygon points="30,135 120,175 120,185 30,145" fill="url(#groundLeft)" />
        {/* Right Depth Face */}
        <polygon points="120,175 210,135 210,145 120,185" fill="url(#groundRight)" />

        {/* Mini Street Lines */}
        <path d="M75 115 L165 155" stroke="#FFFFFF" strokeWidth="6" strokeLinecap="round" />
        <path d="M75 115 L165 155" stroke="#FFD966" strokeWidth="1.5" strokeDasharray="4 4" strokeLinecap="round" />

        {/* Center Main Grape Building (Tower) */}
        {/* Top Roof */}
        <polygon points="120,40 142,50 120,60 98,50" fill="url(#roofButter)" stroke="#FFFFFF" strokeWidth="1.5" />
        {/* Left Facade */}
        <polygon points="98,50 120,60 120,122 98,112" fill="url(#bldgGrape)" stroke="#FFFFFF" strokeWidth="1.5" />
        {/* Right Facade */}
        <polygon points="120,60 142,50 142,112 120,122" fill="#4B39C6" stroke="#FFFFFF" strokeWidth="1.5" />
        {/* Tiny Windows */}
        <rect x="104" y="65" width="4" height="6" rx="1" fill="#FFFFFF" fillOpacity="0.85" />
        <rect x="112" y="68" width="4" height="6" rx="1" fill="#FFFFFF" fillOpacity="0.85" />
        <rect x="104" y="78" width="4" height="6" rx="1" fill="#FFFFFF" fillOpacity="0.85" />
        <rect x="112" y="81" width="4" height="6" rx="1" fill="#FFFFFF" fillOpacity="0.85" />
        <rect x="104" y="91" width="4" height="6" rx="1" fill="#FFFFFF" fillOpacity="0.85" />
        <rect x="112" y="94" width="4" height="6" rx="1" fill="#FFFFFF" fillOpacity="0.85" />

        {/* Left Periwinkle Building */}
        <polygon points="68,68 86,76 68,84 50,76" fill="#FFFFFF" stroke="#FFFFFF" strokeWidth="1.5" />
        <polygon points="50,76 68,84 68,126 50,118" fill="url(#bldgLilac)" stroke="#FFFFFF" strokeWidth="1.5" />
        <polygon points="68,84 86,76 86,118 68,126" fill="#7582EA" stroke="#FFFFFF" strokeWidth="1.5" />
        <circle cx="58" cy="94" r="2.5" fill="#FFFFFF" fillOpacity="0.9" />
        <circle cx="58" cy="106" r="2.5" fill="#FFFFFF" fillOpacity="0.9" />

        {/* Right Strawberry Cafe with Striped Awning */}
        <polygon points="168,78 190,88 168,98 146,88" fill="#FFFFFF" stroke="#FFFFFF" strokeWidth="1.5" />
        <polygon points="146,88 168,98 168,138 146,128" fill="url(#bldgPink)" stroke="#FFFFFF" strokeWidth="1.5" />
        <polygon points="168,98 190,88 190,128 168,138" fill="#E67597" stroke="#FFFFFF" strokeWidth="1.5" />
        {/* Heart sticker on cafe */}
        <path
          d="M157 106 C155 103 152 104 152 106 C152 109 157 113 157 113 C157 113 162 109 162 106 C162 104 159 103 157 106 Z"
          fill="#FFFFFF"
        />

        {/* Tiny Streetlight Lamp with Soft Yellow Halo */}
        <circle cx="86" cy="138" r="8" fill="#FFD966" fillOpacity="0.35" />
        <path d="M86 142 L86 130 C86 128 89 127 91 127" stroke="#2B1B3D" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="91" cy="127" r="2" fill="#FFD966" />

        {/* Little Scrapbook Tree / Bush */}
        <circle cx="134" cy="144" r="6" fill="#1F7A5C" />
        <circle cx="132" cy="142" r="2" fill="#48B391" />

        {/* Floating Scrapbook Stars */}
        <polygon points="40,46 42,52 48,52 43,56 45,62 40,58 35,62 37,56 32,52 38,52" fill="#FFD966" />
        <polygon points="196,44 198,50 204,50 199,54 201,60 196,56 191,60 193,54 188,50 194,50" fill="#FF8FB1" />
      </svg>
    </div>
  );
};
