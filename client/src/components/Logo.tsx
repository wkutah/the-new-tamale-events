import React from 'react';
import { BRANDING } from '../config/branding';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showTagline?: boolean;
  inverted?: boolean;
}

export const Logo: React.FC<LogoProps> = ({
  className = '',
  size = 'md',
  showTagline = false
}) => {
  const iconSize = size === 'sm' ? 28 : size === 'lg' ? 44 : 34;

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {/* Dynamic SVG Brand Emblem */}
      <div className="relative flex items-center justify-center shrink-0">
        <svg
          width={iconSize}
          height={iconSize}
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="drop-shadow-[0_0_12px_rgba(245,158,11,0.5)] transition-transform duration-300 hover:scale-105"
        >
          {/* Background Rounded Shield */}
          <rect width="100" height="100" rx="26" fill="url(#brandGradientBg)" />

          {/* Northern Soundwaves / Radiant Sunrise Arcs */}
          <circle cx="50" cy="50" r="38" stroke="url(#accentGold)" strokeWidth="2.5" strokeDasharray="6 4" opacity="0.6" />
          <circle cx="50" cy="50" r="28" stroke="url(#accentRose)" strokeWidth="2" strokeDasharray="3 3" opacity="0.8" />

          {/* Stylized Modern Sound/Pulse Bars */}
          <rect x="24" y="44" width="5.5" height="18" rx="2.75" fill="#f59e0b" />
          <rect x="33" y="32" width="5.5" height="36" rx="2.75" fill="#fbbf24" />
          <rect x="42" y="24" width="6.5" height="52" rx="3.25" fill="#ffffff" />
          <rect x="52" y="28" width="6.5" height="44" rx="3.25" fill="#ff4f5a" />
          <rect x="62" y="36" width="5.5" height="28" rx="2.75" fill="#10b981" />
          <rect x="71" y="46" width="5.5" height="14" rx="2.75" fill="#8b5cf6" />

          {/* Glow center star */}
          <circle cx="45" cy="50" r="3.5" fill="#fff" filter="url(#glowFilter)" />

          {/* Gradient Definitions */}
          <defs>
            <linearGradient id="brandGradientBg" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
              <stop stopColor="#0f172a" />
              <stop offset="0.6" stopColor="#1e1b4b" />
              <stop offset="1" stopColor="#090d16" />
            </linearGradient>
            <linearGradient id="accentGold" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
              <stop stopColor="#f59e0b" />
              <stop offset="1" stopColor="#fbbf24" />
            </linearGradient>
            <linearGradient id="accentRose" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
              <stop stopColor="#ff4f5a" />
              <stop offset="1" stopColor="#f43f5e" />
            </linearGradient>
            <filter id="glowFilter" x="35" y="40" width="20" height="20" filterUnits="userSpaceOnUse">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>
        </svg>
      </div>

      {/* Typography with Northern Energy */}
      <div className="flex flex-col text-left">
        <span
          className={`font-black tracking-tight leading-none text-white ${
            size === 'sm' ? 'text-base' : size === 'lg' ? 'text-2xl' : 'text-xl'
          }`}
        >
          <span className="text-white">The New </span>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-rose-400 to-amber-200">
            Tamale Events
          </span>
        </span>
        {showTagline && (
          <span className="text-[10px] font-medium tracking-wide uppercase text-amber-400/90 mt-0.5">
            Tamale • Damongo • Bolga • Wa
          </span>
        )}
      </div>
    </div>
  );
};
