import React from 'react';
import { Logo } from './Logo';
import { BRANDING } from '../config/branding';
import { MapPin, Mail, Phone, Heart, ExternalLink } from 'lucide-react';

interface FooterProps {
  onNavigate: (page: string, params?: Record<string, string>) => void;
  onSelectCity?: (city: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, onSelectCity }) => {
  return (
    <footer className="w-full bg-slate-950 border-t border-slate-900 pt-16 pb-12 text-slate-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4">
            <Logo size="md" showTagline={true} />
            <p className="text-sm text-slate-400 leading-relaxed max-w-sm">
              The premier entertainment and cultural discovery platform.
              Discover concerts, nightlife, celebrations, comedy, and campus raves across
              Tamale, Damongo, Bolgatanga, Wa, and communities across Ghana.
            </p>
            <div className="flex items-center gap-2 pt-2 text-xs text-slate-500">
              <MapPin size={14} className="text-amber-500" />
              <span>{BRANDING.contact.location}</span>
            </div>
          </div>

          {/* City Discovery Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Explore Cities
            </h4>
            <ul className="space-y-2 text-sm">
              {BRANDING.cities.map((c) => (
                <li key={c.id}>
                  <button
                    onClick={() => {
                      if (onSelectCity) onSelectCity(c.id);
                      onNavigate('events');
                    }}
                    className="hover:text-amber-400 transition-colors flex items-center justify-between w-full text-left"
                  >
                    <span>{c.name}</span>
                    <span className="text-[10px] text-slate-600 group-hover:text-amber-400">
                      {c.region.replace(' Region', '')}
                    </span>
                  </button>
                </li>
              ))}
              <li>
                <button
                  onClick={() => {
                    if (onSelectCity) onSelectCity('All');
                    onNavigate('events');
                  }}
                  className="text-amber-400/90 font-medium hover:underline text-xs"
                >
                  All Cities & Regions &rarr;
                </button>
              </li>
            </ul>
          </div>

          {/* Quick Categories */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Categories
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <button onClick={() => onNavigate('events')} className="hover:text-amber-400 transition-colors">
                  Live Concerts & Gigs
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('events')} className="hover:text-amber-400 transition-colors">
                  Nightlife & Lounges
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('events')} className="hover:text-amber-400 transition-colors">
                  Traditional Celebrations
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('events')} className="hover:text-amber-400 transition-colors">
                  Campus & Youth Events
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('events')} className="hover:text-amber-400 transition-colors">
                  Comedy & Stand-up
                </button>
              </li>
            </ul>
          </div>

          {/* Organisers & Contact */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              For Organisers
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Reach thousands of young entertainment enthusiasts across Northern Ghana.
            </p>
            <div className="pt-1 space-y-2 text-xs">
              <a
                href={`mailto:${BRANDING.contact.email}`}
                className="flex items-center gap-2 hover:text-amber-400 transition-colors"
              >
                <Mail size={13} className="text-amber-400" />
                <span>{BRANDING.contact.email}</span>
              </a>
              <a
                href={`tel:${BRANDING.contact.phone}`}
                className="flex items-center gap-2 hover:text-amber-400 transition-colors"
              >
                <Phone size={13} className="text-emerald-400" />
                <span>{BRANDING.contact.phone}</span>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>
            &copy; {new Date().getFullYear()} {BRANDING.appName}. All rights reserved.
          </p>
          <div className="flex items-center gap-1.5 text-slate-400">
            <span>Powered with</span>
            <Heart size={13} className="text-rose-500 fill-rose-500" />
            <span>for the vibrant youth & culture of Northern Ghana</span>
          </div>
          <div className="flex items-center gap-4 text-slate-500">
            <button onClick={() => onNavigate('admin')} className="hover:text-slate-300 transition-colors">
              Admin Portal
            </button>
          </div>
        </div>

        {/* Far Bottom Attribution: Powered by Alshareme Media */}
        <div className="mt-8 pt-6 border-t border-slate-900/80 flex flex-col sm:flex-row items-center justify-center gap-2 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/90 border border-slate-800 text-xs text-slate-400 shadow-sm">
            <span>Powered by</span>
            <span className="font-black text-amber-400 tracking-wide text-xs sm:text-sm bg-gradient-to-r from-amber-400 via-amber-300 to-orange-400 bg-clip-text text-transparent">
              Alshareme Media
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
