import React from 'react';
import { City } from '../types';
import { MapPin } from 'lucide-react';

interface CityBadgeProps {
  city: City;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  onClick?: () => void;
  active?: boolean;
}

export const CityBadge: React.FC<CityBadgeProps> = ({
  city,
  className = '',
  size = 'md',
  showIcon = true,
  onClick,
  active = false
}) => {
  const getCityStyles = (c: City) => {
    switch (c) {
      case 'Tamale':
        return active
          ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold shadow-[0_0_15px_rgba(245,158,11,0.5)]'
          : 'bg-amber-500/15 text-amber-300 border-amber-500/30 hover:bg-amber-500/25';
      case 'Damongo':
        return active
          ? 'bg-emerald-500 text-slate-950 border-emerald-400 font-bold shadow-[0_0_15px_rgba(16,185,129,0.5)]'
          : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/25';
      case 'Bolgatanga':
        return active
          ? 'bg-rose-500 text-white border-rose-400 font-bold shadow-[0_0_15px_rgba(244,63,94,0.5)]'
          : 'bg-rose-500/15 text-rose-300 border-rose-500/30 hover:bg-rose-500/25';
      case 'Wa':
        return active
          ? 'bg-violet-500 text-white border-violet-400 font-bold shadow-[0_0_15px_rgba(139,92,246,0.5)]'
          : 'bg-violet-500/15 text-violet-300 border-violet-500/30 hover:bg-violet-500/25';
      default:
        return active
          ? 'bg-sky-500 text-slate-950 border-sky-400 font-bold shadow-[0_0_15px_rgba(14,165,233,0.5)]'
          : 'bg-sky-500/15 text-sky-300 border-sky-500/30 hover:bg-sky-500/25';
    }
  };

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5',
    lg: 'text-sm px-3.5 py-1.5 gap-2'
  }[size];

  const iconSizes = {
    sm: 12,
    md: 13,
    lg: 15
  }[size];

  return (
    <span
      onClick={onClick}
      className={`inline-flex items-center rounded-full border transition-all duration-200 backdrop-blur-sm ${
        onClick ? 'cursor-pointer select-none active:scale-95' : ''
      } ${sizeClasses} ${getCityStyles(city)} ${className}`}
    >
      {showIcon && <MapPin size={iconSizes} className="shrink-0" />}
      <span>{city}</span>
    </span>
  );
};
