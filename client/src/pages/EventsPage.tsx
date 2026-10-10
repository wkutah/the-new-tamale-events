import React, { useState, useEffect } from 'react';
import { EventItem, City } from '../types';
import { BRANDING } from '../config/branding';
import { api } from '../api/client';
import { EventCard } from '../components/EventCard';
import { CityBadge } from '../components/CityBadge';
import {
  Search,
  Filter,
  X,
  SlidersHorizontal,
  Calendar,
  Sparkles,
  RefreshCw,
  Clock
} from 'lucide-react';

interface EventsPageProps {
  initialCity?: string;
  initialSearch?: string;
  initialCategory?: string;
  onSelectEvent: (event: EventItem) => void;
}

export const EventsPage: React.FC<EventsPageProps> = ({
  initialCity = 'All',
  initialSearch = '',
  initialCategory = 'All',
  onSelectEvent
}) => {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters state
  const [selectedCity, setSelectedCity] = useState<string>(initialCity);
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [searchQuery, setSearchQuery] = useState<string>(initialSearch);
  const [isFreeOnly, setIsFreeOnly] = useState<boolean>(false);
  const [timeframe, setTimeframe] = useState<string>('upcoming'); // 'upcoming', 'this_weekend', 'today', 'past', 'all'
  const [sortBy, setSortBy] = useState<string>('date_asc');
  const [showMobileFilters, setShowMobileFilters] = useState<boolean>(false);
  const [availableCities, setAvailableCities] = useState<string[]>(BRANDING.popularCities);

  useEffect(() => {
    api.events.getCitiesSummary().then((res) => {
      if (res.allCities && res.allCities.length > 0) {
        const combined = Array.from(new Set([...BRANDING.popularCities, ...res.allCities]));
        setAvailableCities(combined);
      }
    }).catch((err) => console.error('Cities summary error:', err));
  }, []);

  useEffect(() => {
    if (initialCity && initialCity !== selectedCity) setSelectedCity(initialCity);
    if (initialSearch !== undefined) setSearchQuery(initialSearch);
    if (initialCategory && initialCategory !== selectedCategory) setSelectedCategory(initialCategory);
  }, [initialCity, initialSearch, initialCategory]);

  const loadEvents = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.events.getAll({
        city: selectedCity !== 'All' ? selectedCity : undefined,
        category: selectedCategory !== 'All' ? selectedCategory : undefined,
        search: searchQuery.trim() || undefined,
        is_free: isFreeOnly ? true : undefined,
        timeframe,
        sort: sortBy
      });
      setEvents(res.events || []);
    } catch (err: unknown) {
      console.error('Events load error:', err);
      setError('Failed to load events from the database.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, [selectedCity, selectedCategory, isFreeOnly, timeframe, sortBy]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadEvents();
  };

  const handleResetFilters = () => {
    setSelectedCity('All');
    setSelectedCategory('All');
    setSearchQuery('');
    setIsFreeOnly(false);
    setTimeframe('upcoming');
    setSortBy('date_asc');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full min-h-screen text-slate-100">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Event Discovery
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Browse concerts, nightlife, cultural fiestas & campus vibes across Tamale, Damongo, Bolgatanga, Wa, and communities across Ghana.
            </p>
          </div>

          {/* Mobile Filter Toggle */}
          <button
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            className="md:hidden flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs font-bold text-amber-400"
          >
            <SlidersHorizontal size={14} />
            <span>Filters</span>
          </button>
        </div>

        {/* Live Search Bar */}
        <form onSubmit={handleSearchSubmit} className="mt-6 relative">
          <div className="relative flex items-center rounded-2xl bg-slate-900/90 border border-slate-800 focus-within:border-amber-400 transition-all p-1.5 shadow-lg">
            <Search size={20} className="text-slate-400 ml-3 shrink-0" />
            <input
              type="text"
              placeholder="Search by event title, performer, venue, keywords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent px-3 py-2 text-sm text-white placeholder-slate-500 outline-none"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  loadEvents();
                }}
                className="p-1.5 text-slate-400 hover:text-white mr-1"
              >
                <X size={16} />
              </button>
            )}
            <button
              type="submit"
              className="py-2.5 px-5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs tracking-wide shrink-0 transition-all"
            >
              Search
            </button>
          </div>
        </form>
      </div>

      {/* Main Grid: Filters Sidebar + Results */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Filters Sidebar (Desktop) */}
        <div className={`lg:block ${showMobileFilters ? 'block' : 'hidden'} space-y-6`}>
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <Filter size={14} />
                <span>Filter Events</span>
              </span>
              <button
                onClick={handleResetFilters}
                className="text-[11px] text-slate-400 hover:text-amber-400 transition-colors flex items-center gap-1"
              >
                <RefreshCw size={11} />
                <span>Reset</span>
              </button>
            </div>

            {/* City Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-2.5">
                City / Location
              </label>
              <div className="space-y-1.5">
                <button
                  onClick={() => setSelectedCity('All')}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition-all border ${
                    selectedCity === 'All'
                      ? 'bg-amber-400 text-slate-950 border-amber-300 font-bold'
                      : 'bg-slate-950/60 text-slate-300 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  All Locations (All Ghana)
                </button>

                <div className="pt-2 text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                  Featured Regional Hubs
                </div>
                {BRANDING.cities.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setSelectedCity(c.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all border ${
                      selectedCity === c.id
                        ? 'bg-amber-400 text-slate-950 border-amber-300 font-bold'
                        : 'bg-slate-950/60 text-slate-300 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <span>{c.name}</span>
                    <span className="text-[10px] text-slate-400">{c.region.replace(' Region', '')}</span>
                  </button>
                ))}

                {/* Other Towns & Cities Select */}
                {availableCities.filter((c) => !['Tamale', 'Damongo', 'Bolgatanga', 'Wa'].includes(c)).length > 0 && (
                  <div className="pt-3 border-t border-slate-800/80">
                    <label className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1.5">
                      Other Towns & Cities
                    </label>
                    <select
                      value={!['All', 'Tamale', 'Damongo', 'Bolgatanga', 'Wa'].includes(selectedCity) ? selectedCity : ''}
                      onChange={(e) => {
                        if (e.target.value) setSelectedCity(e.target.value);
                      }}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white outline-none focus:border-amber-400"
                    >
                      <option value="">Choose another town/city...</option>
                      {availableCities
                        .filter((c) => !['Tamale', 'Damongo', 'Bolgatanga', 'Wa'].includes(c))
                        .map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                    </select>
                  </div>
                )}
              </div>
            </div>

            {/* Timeframe Filter */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-2.5 flex items-center gap-1">
                <Calendar size={13} className="text-amber-400" />
                <span>When</span>
              </label>
              <div className="grid grid-cols-2 gap-1.5 text-xs">
                {[
                  { id: 'upcoming', label: 'Upcoming' },
                  { id: 'this_weekend', label: 'This Weekend' },
                  { id: 'today', label: 'Today' },
                  { id: 'all', label: 'All Dates' }
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setTimeframe(t.id)}
                    className={`py-2 px-2.5 rounded-lg font-semibold text-center border transition-all ${
                      timeframe === t.id
                        ? 'bg-amber-400 text-slate-950 border-amber-300 font-bold'
                        : 'bg-slate-950/60 text-slate-400 border-slate-800 hover:text-white'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Category Filter */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-2.5">
                Category
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white outline-none focus:border-amber-400"
              >
                <option value="All">All Categories</option>
                <option value="Concert">Concerts & Live Music</option>
                <option value="Nightlife">Nightlife & Lounges</option>
                <option value="Cultural">Cultural Celebrations</option>
                <option value="Festival">Festivals & Fairs</option>
                <option value="Comedy">Comedy & Theatre</option>
                <option value="Campus">Campus & Youth</option>
                <option value="Conference">Summits & Tech</option>
              </select>
            </div>

            {/* Admission Free Toggle */}
            <div className="pt-2 border-t border-slate-800">
              <label className="flex items-center gap-2.5 cursor-pointer text-xs font-semibold text-slate-200">
                <input
                  type="checkbox"
                  checked={isFreeOnly}
                  onChange={(e) => setIsFreeOnly(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-950 text-amber-500 focus:ring-0 w-4 h-4"
                />
                <span>Free Admission Events Only</span>
              </label>
            </div>

            {/* Past Events Link (separate view as requested) */}
            <div className="pt-2 border-t border-slate-800">
              <button
                onClick={() => setTimeframe(timeframe === 'past' ? 'upcoming' : 'past')}
                className={`w-full py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-between border transition-all ${
                  timeframe === 'past'
                    ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                }`}
              >
                <span className="flex items-center gap-1.5">
                  <Clock size={13} />
                  <span>Past Events Archive</span>
                </span>
                <span className="text-[10px] uppercase font-bold">
                  {timeframe === 'past' ? 'Active' : 'View'}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Results Section */}
        <div className="lg:col-span-3 space-y-6">
          {/* Result Controls & Sort Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
            <div className="text-xs text-slate-400 font-medium">
              Showing <span className="text-amber-400 font-bold">{events.length}</span>{' '}
              {timeframe === 'past' ? 'past' : 'upcoming'} events in{' '}
              <span className="text-white font-bold">{selectedCity === 'All' ? 'All Locations' : selectedCity}</span>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              <span className="text-xs text-slate-500">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300 outline-none focus:border-amber-400"
              >
                <option value="date_asc">Event Date (Soonest first)</option>
                <option value="featured">Featured First</option>
                <option value="price_low">Price (Lowest first)</option>
                <option value="price_high">Price (Highest first)</option>
                <option value="date_desc">Latest added</option>
              </select>
            </div>
          </div>

          {/* Events Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div key={n} className="h-80 rounded-2xl bg-slate-900/60 animate-pulse border border-slate-800" />
              ))}
            </div>
          ) : events.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map((evt) => (
                <EventCard
                  key={evt.id}
                  event={evt}
                  onSelect={(selected) => onSelectEvent(selected)}
                />
              ))}
            </div>
          ) : (
            <div className="py-20 px-6 text-center rounded-3xl bg-slate-900/40 border border-slate-800 space-y-4">
              <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mx-auto text-amber-400">
                <Search size={28} />
              </div>
              <h3 className="text-lg font-bold text-white">No events match your criteria</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Try widening your search, choosing "All 4 Cities", or resetting your filters.
              </p>
              <button
                onClick={handleResetFilters}
                className="py-2.5 px-6 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs tracking-wide shadow-md transition-all"
              >
                Reset All Filters
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
