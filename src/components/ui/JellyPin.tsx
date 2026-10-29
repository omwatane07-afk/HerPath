'use client';

import React from 'react';

export interface JellyPinProps {
  className?: string;
  size?: number;
  color?: 'grape' | 'strawberry' | 'butter' | 'periwinkle' | 'verified' | 'danger';
  isSelected?: boolean;
  isBouncing?: boolean;
  label?: string;
}

export const JellyPin: React.FC<JellyPinProps> = ({
  className = '',
  size = 40,
  color = 'grape',
  isSelected = false,
  isBouncing = false,
  label,
}) => {
  // Gradient definitions per theme color
  const palette = {
    grape: {
      main: '#5B47E0',
      dark: '#4030B5',
      light: '#8E7CFF',
      highlight: '#FFFFFF',
    },
    strawberry: {
      main: '#FF8FB1',
      dark: '#E0658B',
      light: '#FFB8CE',
      highlight: '#FFFFFF',
    },
    butter: {
      main: '#FFD966',
      dark: '#D9B036',
      light: '#FFEAA1',
      highlight: '#FFFFFF',
    },
    periwinkle: {
      main: '#8E9BFF',
      dark: '#697AF5',
      light: '#BCC5FF',
      highlight: '#FFFFFF',
    },
    verified: {
      main: '#1F7A5C',
      dark: '#145942',
      light: '#48B391',
      highlight: '#FFFFFF',
    },
    danger: {
      main: '#C1121F',
      dark: '#8C0812',
      light: '#F56E79',
      highlight: '#FFFFFF',
    },
  }[color];

  return (
    <div
      className={`inline-flex flex-col items-center select-none group transition-transform ${
        isBouncing ? 'jelly-bounce' : ''
      } ${className}`}
      style={{ width: size, height: size * 1.25 }}
    >
      <svg
        viewBox="0 0 100 125"
        width={size}
        height={size * 1.25}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`filter drop-shadow-md transition-all duration-200 group-hover:rotate-6 ${
          isSelected ? 'scale-110 drop-shadow-lg' : ''
        }`}
      >
        <defs>
          {/* Main 3D Gloss Gradient */}
          <radialGradient
            id={`jellyGrad_${color}`}
            cx="35%"
            cy="30%"
            r="65%"
            fx="30%"
            fy="25%"
          >
            <stop offset="0%" stopColor={palette.light} />
            <stop offset="55%" stopColor={palette.main} />
            <stop offset="100%" stopColor={palette.dark} />
          </radialGradient>

          {/* Secondary Gloss Highlight */}
          <linearGradient id={`jellySheen_${color}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.75" />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
          </linearGradient>

          {/* Soft Ground Shadow */}
          <radialGradient id="jellyShadow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#2B1B3D" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#2B1B3D" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Soft Ground Contact Shadow */}
        <ellipse cx="50" cy="116" rx="26" ry="6" fill="url(#jellyShadow)" />

        {/* Thick White Die-Cut Sticker Outline */}
        <path
          d="M50 112 C44 96 16 68 16 42 A34 34 0 1 1 84 42 C84 68 56 96 50 112 Z"
          fill="#FFFFFF"
          stroke="#FFFFFF"
          strokeWidth="6"
          strokeLinejoin="round"
        />

        {/* Glossy Inflated Body */}
        <path
          d="M50 110 C44 95 18 67 18 42 A32 32 0 1 1 82 42 C82 67 56 95 50 110 Z"
          fill={`url(#jellyGrad_${color})`}
        />

        {/* Top Arc Soft Reflection */}
        <path
          d="M26 32 C30 22 40 18 54 18 C64 18 72 22 75 28 C68 23 58 21 50 21 C38 21 30 25 26 32 Z"
          fill="url(#jellySheen_${color})"
        />

        {/* Gloss Bubble Eye / Highlight Spot */}
        <ellipse cx="36" cy="30" rx="8" ry="5" transform="rotate(-30 36 30)" fill="#FFFFFF" fillOpacity="0.65" />
        <circle cx="44" cy="22" r="2.5" fill="#FFFFFF" fillOpacity="0.8" />

        {/* Inner Gem / Core Dot */}
        <circle cx="50" cy="42" r="10" fill="#FFFFFF" fillOpacity="0.9" />
        <circle cx="50" cy="42" r="6" fill={palette.main} />
      </svg>

      {label && (
        <span className="mt-1 px-2 py-0.5 rounded-full bg-white text-ink text-[10px] font-bold shadow-sm border border-lilac leading-none whitespace-nowrap">
          {label}
        </span>
      )}
    </div>
  );
};
