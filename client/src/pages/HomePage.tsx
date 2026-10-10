import React, { useState, useEffect } from 'react';
import { EventItem, City, CitySummary } from '../types';
import { BRANDING } from '../config/branding';
import { api } from '../api/client';
import { EventCard } from '../components/EventCard';
import { CityBadge } from '../components/CityBadge';
import {
  Search,
  Sparkles,
  Calendar,
  Flame,
  ArrowRight,
  MapPin,
  Music,
  PartyPopper,
  Smile,
  GraduationCap,
  Layers,
  ChevronRight
} from 'lucide-react';

interface HomePageProps {
  onNavigate: (page: string, params?: Record<string, string>) => void;
  onSelectEvent: (event: EventItem) => void;
  selectedCity: string;
  onSelectCity: (city: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  onNavigate,
  onSelectEvent,
  selectedCity,
  onSelectCity
}) => {
  const [featuredEvents, setFeaturedEvents] = useState<EventItem[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<EventItem[]>([]);
  const [weekendEvents, setWeekendEvents] = useState<EventItem[]>([]);
  const [citySummaries, setCitySummaries] = useState<CitySummary[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadHomeData() {
      setIsLoading(true);
      setError(null);
      try {
        const [featuredRes, upcomingRes, weekendRes, citiesRes] = await Promise.all([
          api.events.getFeatured(),
          api.events.getAll({ limit: '8', sort: 'date_asc' } as any),
          api.events.getAll({ timeframe: 'this_weekend' }),
          api.events.getCitiesSummary()
        ]);

        setFeaturedEvents(featuredRes.events || []);
        setUpcomingEvents(upcomingRes.events || []);
        setWeekendEvents(weekendRes.events || []);
        setCitySummaries(citiesRes.summaries || []);
      } catch (err: unknown) {
        console.error('Home data load error:', err);
        setError('Unable to load latest events from the database. Please ensure server is running.');
      } finally {
        setIsLoading(false);
      }
    }

    loadHomeData();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onNavigate('events', { search: searchQuery.trim() });
    } else {
      onNavigate('events');
    }
  };

  const categories = [
    { name: 'Concert', label: 'Live Concerts', icon: Music, color: 'from-amber-500 to-orange-600' },
    { name: 'Nightlife', label: 'Nightlife & Clubs', icon: PartyPopper, color: 'from-rose-500 to-pink-600' },
    { name: 'Cultural', label: 'Cultural & Damba', icon: Sparkles, color: 'from-emerald-500 to-teal-600' },
    { name: 'Festival', label: 'Festivals & Fairs', icon: Flame, color: 'from-amber-400 to-rose-500' },
    { name: 'Comedy', label: 'Comedy Nights', icon: Smile, color: 'from-blue-500 to-indigo-600' },
    { name: 'Campus', label: 'Campus Raves', icon: GraduationCap, color: 'from-violet-500 to-purple-600' }
  ];

  return (
    <div className="w-full min-h-screen text-slate-100 pb-20">
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-28 border-b border-slate-900">
        {/* Glow Spheres */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-amber-500/15 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute top-1/3 left-1/4 w-[400px] h-[250px] bg-rose-500/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          {/* Top Pill Announcement */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/90 border border-amber-500/30 text-xs font-semibold text-amber-300 mb-6 shadow-[0_0_20px_rgba(245,158,11,0.15)] animate-pulse">
            <Sparkles size={14} className="text-amber-400" />
            <span>Discover Northern Ghana's Live Entertainment Pulse</span>
          </div>

          {/* Master Heading */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.08] max-w-4xl mx-auto text-white mb-6">
            The New{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-rose-400 to-amber-200">
              Tamale Events
            </span>
          </h1>

          <p className="text-base sm:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed mb-10 font-normal">
            Discover upcoming concerts, nightlife, cultural celebrations, comedy, and campus events across{' '}
            <span className="text-amber-400 font-semibold">Tamale</span>,{' '}
            <span className="text-emerald-400 font-semibold">Damongo</span>,{' '}
            <span className="text-rose-400 font-semibold">Bolgatanga</span>,{' '}
            <span className="text-violet-400 font-semibold">Wa</span>, and communities across Ghana.
          </p>

          {/* Hero Search Bar */}
          <form
            onSubmit={handleSearchSubmit}
            className="max-w-2xl mx-auto relative flex items-center p-2 rounded-2xl bg-slate-900/90 border border-slate-700/80 shadow-[0_15px_35px_-5px_rgba(0,0,0,0.6)] backdrop-blur-xl focus-within:border-amber-400 transition-all mb-8"
          >
            <Search size={22} className="text-slate-400 ml-3 mr-2 shrink-0" />
            <input
              type="text"
              placeholder="Search by event, artist, venue (e.g. Aliu Mahama Stadium)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent text-sm sm:text-base text-white placeholder-slate-500 outline-none pr-3"
            />
            <button
              type="submit"
              className="py-3 px-6 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-xs sm:text-sm tracking-wide shrink-0 transition-all shadow-md"
            >
              Search
            </button>
          </form>

          {/* Equal Consideration City Selector Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-2 max-w-3xl mx-auto">
            <span className="text-xs font-semibold text-slate-400 mr-1">Quick Filter:</span>
            <button
              onClick={() => {
                onSelectCity('All');
                onNavigate('events');
              }}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all border ${
                selectedCity === 'All'
                  ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.5)]'
                  : 'bg-slate-900/80 text-slate-300 border-slate-800 hover:border-slate-700'
              }`}
            >
              All Locations
            </button>
            {BRANDING.cities.map((c) => (
              <CityBadge
                key={c.id}
                city={c.id}
                size="md"
                active={selectedCity === c.id}
                onClick={() => {
                  onSelectCity(c.id);
                  onNavigate('events');
                }}
              />
            ))}
            <button
              onClick={() => {
                onSelectCity('All');
                onNavigate('events');
              }}
              className="px-3 py-1.5 rounded-full text-xs font-medium text-slate-400 hover:text-white border border-slate-800 hover:border-slate-700 bg-slate-900/60"
            >
              + More Locations
            </button>
          </div>
        </div>
      </section>

      {/* 2. Featured Events Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400 mb-1">
              <Flame size={15} />
              <span>Don't Miss Out</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              Featured Events in Northern Ghana
            </h2>
          </div>
          <button
            onClick={() => onNavigate('events')}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-400 hover:text-amber-300 transition-colors"
          >
            <span>View All Events</span>
            <ChevronRight size={16} />
          </button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-80 rounded-2xl bg-slate-900/60 animate-pulse border border-slate-800" />
            ))}
          </div>
        ) : featuredEvents.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredEvents.map((evt) => (
              <EventCard
                key={evt.id}
                event={evt}
                onSelect={(selected) => onSelectEvent(selected)}
              />
            ))}
          </div>
        ) : (
          <div className="p-8 text-center rounded-2xl bg-slate-900/40 border border-slate-800 text-slate-400">
            No featured events currently scheduled. Check the full discovery page!
          </div>
        )}
      </section>

      {/* 3. Explore Northern Ghana Cities & Open Locations */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-slate-900">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400 mb-2">
            <MapPin size={15} />
            <span>Regional Entertainment Map</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
            Four Vibrant Northern Hubs & Beyond
          </h2>
          <p className="text-slate-400 text-sm leading-relaxed">
            Every city carries its own distinct heartbeat. Discover live experiences whether you are in
            the bustling metropolis of Tamale, the safari trails of Damongo, the artisanal sunset hills of Bolgatanga,
            the historic royal palaces of Wa, or anywhere across Ghana.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {BRANDING.cities.map((cityObj) => {
            const summary = citySummaries.find((s) => s.city === cityObj.id);
            const count = summary ? summary.upcomingCount : 0;

            return (
              <div
                key={cityObj.id}
                onClick={() => {
                  onSelectCity(cityObj.id);
                  onNavigate('events');
                }}
                className="group relative rounded-3xl overflow-hidden border border-slate-800 bg-slate-900/60 hover:border-amber-500/50 transition-all duration-300 hover:-translate-y-1 cursor-pointer flex flex-col justify-between"
              >
                {/* City Cover Image */}
                <div className="h-44 w-full relative overflow-hidden bg-slate-950">
                  <img
                    src={cityObj.image}
                    alt={cityObj.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
                  <div className="absolute top-3 left-3">
                    <CityBadge city={cityObj.id} size="sm" />
                  </div>
                  <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-slate-950/80 backdrop-blur-md text-[11px] font-bold text-amber-400 border border-slate-800">
                    {count} {count === 1 ? 'Event' : 'Events'}
                  </div>
                </div>

                {/* City Body */}
                <div className="p-5 flex flex-col flex-1 justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-white group-hover:text-amber-400 transition-colors mb-1">
                      {cityObj.name}
                    </h3>
                    <p className="text-xs font-semibold text-amber-400/90 mb-2">
                      {cityObj.tagline}
                    </p>
                    <p className="text-xs text-slate-400 leading-relaxed line-clamp-3">
                      {cityObj.description}
                    </p>
                  </div>

                  <div className="pt-4 mt-4 border-t border-slate-800/80 flex items-center justify-between text-xs font-bold text-slate-300 group-hover:text-amber-400">
                    <span>Explore {cityObj.name}</span>
                    <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Additional Towns & Cities Across Ghana */}
        <div className="mt-10 p-6 sm:p-7 rounded-3xl bg-slate-900/60 border border-slate-800">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                <span>Discover Entertainment Across Other Towns & Cities</span>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-400 text-slate-950">
                  Open Everywhere
                </span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                From Yendi, Navrongo, Nalerigu, and Walewale to Accra, Kumasi, and Sunyani—find or promote events across Ghana.
              </p>
            </div>
            <button
              onClick={() => {
                onSelectCity('All');
                onNavigate('events');
              }}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-400 hover:text-amber-300 transition-colors shrink-0"
            >
              <span>Explore All Locations</span>
              <ArrowRight size={14} />
            </button>
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            {BRANDING.popularCities
              .filter((c) => !['Tamale', 'Damongo', 'Bolgatanga', 'Wa'].includes(c))
              .map((c) => (
                <button
                  key={c}
                  onClick={() => {
                    onSelectCity(c);
                    onNavigate('events');
                  }}
                  className="px-3 py-1.5 rounded-full text-xs font-medium bg-slate-950 border border-slate-800 text-slate-300 hover:border-amber-400 hover:text-white hover:bg-slate-900 transition-all shadow-sm"
                >
                  {c}
                </button>
              ))}
          </div>
        </div>
      </section>

      {/* 4. Browse by Category */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-slate-900">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400 mb-1">
              <Layers size={15} />
              <span>Find Your Vibe</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              Events by Category
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <button
                key={cat.name}
                onClick={() => onNavigate('events', { category: cat.name })}
                className="group flex flex-col items-center justify-center p-5 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-amber-500/50 hover:bg-slate-900 transition-all duration-300 text-center"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${cat.color} flex items-center justify-center text-white mb-3 shadow-lg group-hover:scale-110 transition-transform`}>
                  <Icon size={22} />
                </div>
                <span className="text-xs font-bold text-slate-200 group-hover:text-amber-400 transition-colors">
                  {cat.label}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* 5. Happening This Weekend / Upcoming Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-slate-900">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400 mb-1">
              <Calendar size={15} />
              <span>Upcoming Highlights</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              Upcoming Shows & Gatherings
            </h2>
          </div>
          <button
            onClick={() => onNavigate('events')}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-400 hover:text-amber-300 transition-colors"
          >
            <span>See All Upcoming</span>
            <ChevronRight size={16} />
          </button>
        </div>

        {upcomingEvents.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {upcomingEvents.slice(0, 8).map((evt) => (
              <EventCard
                key={evt.id}
                event={evt}
                onSelect={(selected) => onSelectEvent(selected)}
              />
            ))}
          </div>
        ) : (
          <div className="p-8 text-center rounded-2xl bg-slate-900/40 border border-slate-800 text-slate-400">
            No events found.
          </div>
        )}
      </section>

      {/* 6. Organiser Submission Callout */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="relative rounded-3xl overflow-hidden p-8 sm:p-12 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-amber-500/30 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-8 shadow-2xl">
          <div className="max-w-xl space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
              For Event Promoters & Organisers
            </span>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
              Hosting an event in Tamale, Damongo, Bolga, or Wa?
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              Reach music lovers, youth audiences, tourists, and culture seekers across all four Northern regions.
              List your concert, club night, festival, or campus bash on The New Tamale Events.
            </p>
          </div>

          <div className="shrink-0 flex flex-col sm:flex-row gap-3">
            <a
              href={`mailto:${BRANDING.contact.email}?subject=Submit Event to The New Tamale Events`}
              className="py-3 px-6 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs tracking-wide shadow-lg transition-all text-center"
            >
              Submit Your Event
            </a>
            <a
              href={`https://wa.me/233240000001`}
              target="_blank"
              rel="noreferrer"
              className="py-3 px-6 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30 font-bold text-xs tracking-wide transition-all text-center"
            >
              WhatsApp Us
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};
