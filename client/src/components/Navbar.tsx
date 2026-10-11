import React, { useState } from 'react';
import { Logo } from './Logo';
import { City } from '../types';
import { CityBadge } from './CityBadge';
import { BRANDING } from '../config/branding';
import { useAuth } from '../context/AuthContext';
import {
  Compass,
  Bookmark,
  Activity,
  ShieldCheck,
  User,
  LogOut,
  Menu,
  X,
  ChevronDown,
  Sparkles,
  PlusCircle,
  Flame
} from 'lucide-react';

interface NavbarProps {
  currentCity?: string;
  onSelectCity?: (city: string) => void;
  onNavigate: (page: string, params?: Record<string, string>) => void;
  activePage: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentCity = 'All',
  onSelectCity,
  onNavigate,
  activePage
}) => {
  const { user, isAdmin, logout } = useAuth();
  const [isCityMenuOpen, setIsCityMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const featuredCities: City[] = ['Tamale', 'Damongo', 'Bolgatanga', 'Wa'];
  const popularCities = BRANDING.popularCities.filter((c) => !featuredCities.includes(c));

  const handleCityPick = (c: string) => {
    if (onSelectCity) onSelectCity(c);
    setIsCityMenuOpen(false);
    setIsMobileMenuOpen(false);
    onNavigate('events');
  };

  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-xl bg-slate-950/85 border-b border-slate-800/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <div
          onClick={() => onNavigate('home')}
          className="cursor-pointer select-none shrink-0"
        >
          <Logo size="md" showTagline={true} />
        </div>

        {/* Desktop Navigation Links & City Switcher */}
        <nav className="hidden md:flex items-center gap-6">
          <button
            onClick={() => onNavigate('home')}
            className={`text-sm font-semibold transition-colors ${
              activePage === 'home' ? 'text-amber-400 font-bold' : 'text-slate-300 hover:text-white'
            }`}
          >
            Home
          </button>

          <button
            onClick={() => onNavigate('events')}
            className={`flex items-center gap-1.5 text-sm font-semibold transition-colors ${
              activePage === 'events' ? 'text-amber-400 font-bold' : 'text-slate-300 hover:text-white'
            }`}
          >
            <Compass size={16} />
            <span>Discover Events</span>
          </button>

          <button
            onClick={() => onNavigate('events', { sort: 'trending' })}
            className="flex items-center gap-1.5 text-sm font-semibold transition-colors text-slate-300 hover:text-white group"
          >
            <Flame size={16} className="text-orange-500 fill-orange-500 group-hover:scale-110 transition-transform" />
            <span>Trending</span>
          </button>

          {/* Quick City Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsCityMenuOpen(!isCityMenuOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-slate-900 border border-slate-700 hover:border-amber-500/50 text-slate-200 transition-all shadow-sm"
            >
              <span className="text-slate-400">City:</span>
              <span className="text-amber-400 font-bold">{currentCity}</span>
              <ChevronDown size={14} className="text-slate-400" />
            </button>

            {isCityMenuOpen && (
              <div
                className="absolute top-full mt-2 w-56 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-2 z-50 max-h-80 overflow-y-auto"
                onMouseLeave={() => setIsCityMenuOpen(false)}
              >
                <div className="text-[10px] uppercase font-bold text-slate-400 px-2 py-1 tracking-wider">
                  Select Location
                </div>
                <button
                  onClick={() => handleCityPick('All')}
                  className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    currentCity === 'All' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  All Locations (Ghana)
                </button>

                <div className="text-[9px] uppercase font-extrabold text-slate-500 px-2 pt-2 pb-0.5 tracking-wider">
                  Featured Regional Hubs
                </div>
                {featuredCities.map((c) => (
                  <button
                    key={c}
                    onClick={() => handleCityPick(c)}
                    className="w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:bg-slate-800 transition-colors mt-0.5"
                  >
                    <span>{c}</span>
                    <CityBadge city={c} size="sm" showIcon={false} />
                  </button>
                ))}

                <div className="text-[9px] uppercase font-extrabold text-slate-500 px-2 pt-2.5 pb-0.5 tracking-wider border-t border-slate-800/80 mt-1.5">
                  Popular Towns & Cities
                </div>
                {popularCities.map((c) => (
                  <button
                    key={c}
                    onClick={() => handleCityPick(c)}
                    className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-medium transition-colors mt-0.5 ${
                      currentCity === c ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <span>{c}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </nav>

        {/* Right Section: Auth & User Profile or Admin Shortcut */}
        <div className="hidden md:flex items-center gap-3">
          {/* Quick Submit CTA for organisers */}
          <button
            onClick={() => {
              if (isAdmin) {
                onNavigate('admin', { tab: 'events' });
              } else {
                onNavigate('events');
                alert('Organiser Portal: Contact info@newtamaleevents.com or WhatsApp +233 24 000 0001 to feature your event.');
              }
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-slate-300 hover:text-white bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition-all"
          >
            <Sparkles size={14} className="text-amber-400" />
            <span>Submit Event</span>
          </button>

          {user ? (
            <div className="relative">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2.5 p-1.5 pl-3 rounded-full bg-slate-900/90 border border-slate-700/80 hover:border-amber-500/50 transition-all"
              >
                <div className="text-left text-xs">
                  <div className="font-semibold text-white leading-tight flex items-center gap-1.5">
                    <span>{user.full_name.split(' ')[0]}</span>
                    {isAdmin && (
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30 font-bold">
                        ADMIN
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-slate-400 leading-none">{user.preferred_city}</div>
                </div>
                <img
                  src={user.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.full_name)}`}
                  alt={user.full_name}
                  className="w-8 h-8 rounded-full border border-amber-500/40 object-cover"
                />
                <ChevronDown size={14} className="text-slate-400 mr-1" />
              </button>

              {isUserMenuOpen && (
                <div
                  className="absolute right-0 top-full mt-2 w-56 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-2 z-50 backdrop-blur-xl"
                  onMouseLeave={() => setIsUserMenuOpen(false)}
                >
                  <div className="p-2 border-b border-slate-800 text-xs">
                    <div className="font-bold text-white">{user.full_name}</div>
                    <div className="text-slate-400 text-[11px] truncate">{user.email}</div>
                  </div>

                  <div className="py-1">
                    {isAdmin && (
                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          onNavigate('admin');
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-amber-400 hover:bg-amber-500/10 transition-colors"
                      >
                        <ShieldCheck size={16} />
                        <span>Administrator Dashboard</span>
                      </button>
                    )}

                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        onNavigate('dashboard', { tab: 'overview' });
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-200 hover:bg-slate-800 transition-colors"
                    >
                      <User size={16} />
                      <span>My Dashboard</span>
                    </button>

                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        onNavigate('dashboard', { tab: 'saved' });
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-200 hover:bg-slate-800 transition-colors"
                    >
                      <Bookmark size={16} />
                      <span>Saved Events</span>
                    </button>

                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        onNavigate('dashboard', { tab: 'activity' });
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-200 hover:bg-slate-800 transition-colors"
                    >
                      <Activity size={16} />
                      <span>Activity History</span>
                    </button>
                  </div>

                  <div className="pt-1 border-t border-slate-800">
                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        logout();
                        onNavigate('home');
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-rose-400 hover:bg-rose-500/10 transition-colors"
                    >
                      <LogOut size={16} />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onNavigate('login')}
                className="px-4 py-2 rounded-full text-xs font-semibold text-slate-200 hover:text-white hover:bg-slate-800 transition-all"
              >
                Sign In
              </button>
              <button
                onClick={() => onNavigate('register')}
                className="px-4 py-2 rounded-full text-xs font-bold text-slate-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.3)] transition-all"
              >
                Register
              </button>
            </div>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="md:hidden p-2 rounded-xl bg-slate-900 text-slate-300 border border-slate-800"
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile Menu Drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-b border-slate-800 bg-slate-950/95 backdrop-blur-2xl p-5 space-y-4">
          <div className="flex flex-col gap-2">
            <button
              onClick={() => {
                onNavigate('home');
                setIsMobileMenuOpen(false);
              }}
              className="text-left py-2 text-sm font-semibold text-white"
            >
              Home
            </button>
            <button
              onClick={() => {
                onNavigate('events');
                setIsMobileMenuOpen(false);
              }}
              className="text-left py-2 text-sm font-semibold text-white"
            >
              Discover All Events
            </button>
            <button
              onClick={() => {
                onNavigate('events', { sort: 'trending' });
                setIsMobileMenuOpen(false);
              }}
              className="flex items-center gap-2 py-2 text-sm font-semibold text-orange-400"
            >
              <Flame size={16} className="fill-orange-500" />
              <span>Trending (Most Talked About)</span>
            </button>
          </div>

          <div className="pt-3 border-t border-slate-800">
            <div className="text-xs font-bold text-slate-400 mb-2">FILTER BY LOCATION</div>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleCityPick('All')}
                className={`py-2 px-3 rounded-lg text-xs font-semibold text-left border ${
                  currentCity === 'All' ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold' : 'bg-slate-900 border-slate-800 text-slate-300'
                }`}
              >
                All Locations
              </button>
              {featuredCities.map((c) => (
                <button
                  key={c}
                  onClick={() => handleCityPick(c)}
                  className={`py-2 px-3 rounded-lg text-xs font-semibold text-left border ${
                    currentCity === c ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold' : 'bg-slate-900 border-slate-800 text-slate-300'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
            <div className="flex flex-wrap gap-1.5 pt-2.5">
              {popularCities.slice(0, 6).map((c) => (
                <button
                  key={c}
                  onClick={() => handleCityPick(c)}
                  className={`text-[11px] px-2.5 py-1 rounded-full border transition-all ${
                    currentCity === c ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold' : 'bg-slate-900/60 border-slate-800 text-slate-400'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800">
            {user ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2 mb-3">
                  <img
                    src={user.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.full_name)}`}
                    alt={user.full_name}
                    className="w-10 h-10 rounded-full border border-amber-400"
                  />
                  <div>
                    <div className="text-sm font-bold text-white">{user.full_name}</div>
                    <div className="text-xs text-slate-400">{user.email}</div>
                  </div>
                </div>

                {isAdmin && (
                  <button
                    onClick={() => {
                      onNavigate('admin');
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold text-xs"
                  >
                    <ShieldCheck size={16} />
                    <span>Admin Dashboard</span>
                  </button>
                )}

                <button
                  onClick={() => {
                    onNavigate('dashboard');
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full py-2.5 text-center rounded-xl bg-slate-900 text-white border border-slate-800 text-xs font-medium"
                >
                  My Dashboard & Activity
                </button>

                <button
                  onClick={() => {
                    logout();
                    setIsMobileMenuOpen(false);
                    onNavigate('home');
                  }}
                  className="w-full py-2 text-center text-xs text-rose-400"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    onNavigate('login');
                    setIsMobileMenuOpen(false);
                  }}
                  className="py-2.5 rounded-xl text-xs font-semibold text-white bg-slate-900 border border-slate-800"
                >
                  Sign In
                </button>
                <button
                  onClick={() => {
                    onNavigate('register');
                    setIsMobileMenuOpen(false);
                  }}
                  className="py-2.5 rounded-xl text-xs font-bold text-slate-950 bg-amber-400"
                >
                  Register
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
