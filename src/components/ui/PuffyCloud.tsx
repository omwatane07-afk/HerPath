'use client';

import React from 'react';

export interface PuffyCloudProps {
  className?: string;
  size?: number;
  drift?: boolean;
}

export const PuffyCloud: React.FC<PuffyCloudProps> = ({
  className = '',
  size = 64,
  drift = false,
}) => {
  return (
    <div
      className={`inline-block select-none ${drift ? 'cloud-drift' : ''} ${className}`}
      style={{ width: size, height: size * 0.62 }}
    >
      <svg
        viewBox="0 0 100 62"
        width={size}
        height={size * 0.62}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="filter drop-shadow-sm"
      >
        <defs>
          <linearGradient id="cloudGrad" x1="50" y1="5" x2="50" y2="60" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="85%" stopColor="#F8F5FF" />
            <stop offset="100%" stopColor="#EDE5FB" />
          </linearGradient>
          <linearGradient id="cloudCheek" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#FF8FB1" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#FF8FB1" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* White Die-cut Border */}
        <path
          d="M26 50 H76 C86 50 94 42 94 32 C94 22 86 15 76 15 C74 9 66 4 56 4 C46 4 38 10 36 17 C32 15 26 16 22 20 C14 22 10 28 10 35 C10 44 17 50 26 50 Z"
          fill="#FFFFFF"
          stroke="#FFFFFF"
          strokeWidth="4"
          strokeLinejoin="round"
        />

        {/* Cloud Body with soft 3D Shading */}
        <path
          d="M26 50 H76 C86 50 94 42 94 32 C94 22 86 15 76 15 C74 9 66 4 56 4 C46 4 38 10 36 17 C32 15 26 16 22 20 C14 22 10 28 10 35 C10 44 17 50 26 50 Z"
          fill="url(#cloudGrad)"
        />

        {/* Top Highlight puffs */}
        <ellipse cx="55" cy="14" rx="16" ry="8" fill="#FFFFFF" fillOpacity="0.8" />
        <ellipse cx="74" cy="22" rx="10" ry="6" fill="#FFFFFF" fillOpacity="0.75" />
        <ellipse cx="26" cy="26" rx="9" ry="5" fill="#FFFFFF" fillOpacity="0.75" />

        {/* Cute Scrapbook Rosy Cheeks */}
        <ellipse cx="26" cy="38" rx="5" ry="3" fill="url(#cloudCheek)" />
        <ellipse cx="74" cy="38" rx="5" ry="3" fill="url(#cloudCheek)" />
      </svg>
    </div>
  );
};
