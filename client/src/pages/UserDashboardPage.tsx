import React, { useState, useEffect } from 'react';
import { EventItem, UserActivity, City } from '../types';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import { CityBadge } from '../components/CityBadge';
import { BRANDING } from '../config/branding';
import {
  User,
  Bookmark,
  Activity,
  Settings,
  Calendar,
  MapPin,
  Trash2,
  ExternalLink,
  Eye,
  Ticket,
  CalendarPlus,
  Share2,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

interface UserDashboardPageProps {
  initialTab?: 'overview' | 'saved' | 'activity' | 'settings';
  onSelectEvent: (event: EventItem) => void;
  onNavigate: (page: string) => void;
}

export const UserDashboardPage: React.FC<UserDashboardPageProps> = ({
  initialTab = 'overview',
  onSelectEvent,
  onNavigate
}) => {
  const { user, updateProfile } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'saved' | 'activity' | 'settings'>(initialTab);

  // Saved events state
  const [savedEvents, setSavedEvents] = useState<(EventItem & { saved_at: string })[]>([]);
  const [isSavedLoading, setIsSavedLoading] = useState(true);

  // Activity state
  const [activities, setActivities] = useState<UserActivity[]>([]);
  const [activityFilter, setActivityFilter] = useState('all');
  const [isActivityLoading, setIsActivityLoading] = useState(true);

  // Settings form state
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [phone, setPhone] = useState(user?.phone_number || '');
  const [citySelectOption, setCitySelectOption] = useState<string>('Tamale');
  const [customCityText, setCustomCityText] = useState<string>('');
  const [settingsSuccess, setSettingsSuccess] = useState<string | null>(null);
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  useEffect(() => {
    if (initialTab) setActiveTab(initialTab);
  }, [initialTab]);

  useEffect(() => {
    if (user) {
      setFullName(user.full_name);
      setPhone(user.phone_number || '');
      if (BRANDING.popularCities.includes(user.preferred_city)) {
        setCitySelectOption(user.preferred_city);
        setCustomCityText('');
      } else {
        setCitySelectOption('__custom__');
        setCustomCityText(user.preferred_city || '');
      }
    }
  }, [user]);

  // Load Saved Events
  const loadSaved = async () => {
    setIsSavedLoading(true);
    try {
      const res = await api.saved.getAll();
      setSavedEvents(res.savedEvents || []);
    } catch (err) {
      console.error('Failed to load saved events:', err);
    } finally {
      setIsSavedLoading(false);
    }
  };

  // Load Activities
  const loadActivities = async () => {
    setIsActivityLoading(true);
    try {
      const res = await api.activity.getAll({ type: activityFilter });
      setActivities(res.activities || []);
    } catch (err) {
      console.error('Failed to load activities:', err);
    } finally {
      setIsActivityLoading(false);
    }
  };

  useEffect(() => {
    loadSaved();
  }, []);

  useEffect(() => {
    loadActivities();
  }, [activityFilter]);

  const handleRemoveSaved = async (eventId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await api.saved.remove(eventId);
      setSavedEvents((prev) => prev.filter((item) => item.id !== eventId));
      loadActivities(); // refresh activities
    } catch (err) {
      console.error('Failed to remove saved event:', err);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingSettings(true);
    setSettingsSuccess(null);
    try {
      const finalCity =
        citySelectOption === '__custom__'
          ? customCityText.trim() || 'Tamale'
          : citySelectOption;

      await updateProfile({
        full_name: fullName.trim(),
        phone_number: phone.trim() || undefined,
        preferred_city: finalCity
      });
      setSettingsSuccess('Profile updated successfully!');
      setTimeout(() => setSettingsSuccess(null), 3000);
    } catch (err) {
      console.error('Failed to update profile:', err);
    } finally {
      setIsSavingSettings(false);
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'view_event':
        return <Eye size={15} className="text-blue-400" />;
      case 'save_event':
        return <Bookmark size={15} className="text-rose-400" />;
      case 'remove_saved_event':
        return <Trash2 size={15} className="text-slate-400" />;
      case 'ticket_click':
        return <Ticket size={15} className="text-amber-400" />;
      case 'calendar_add':
        return <CalendarPlus size={15} className="text-emerald-400" />;
      case 'share_event':
        return <Share2 size={15} className="text-violet-400" />;
      default:
        return <Activity size={15} className="text-slate-400" />;
    }
  };

  const formatActivityText = (act: UserActivity) => {
    switch (act.activity_type) {
      case 'view_event':
        return `Viewed event "${act.event_title || 'Entertainment'}"`;
      case 'save_event':
        return `Saved event "${act.event_title || 'Entertainment'}" to your account`;
      case 'remove_saved_event':
        return `Removed event from saved list`;
      case 'ticket_click':
        return `Clicked ticketing link for "${act.event_title || 'Event'}"`;
      case 'calendar_add':
        return `Added "${act.event_title || 'Event'}" to your personal calendar`;
      case 'share_event':
        return `Shared "${act.event_title || 'Event'}" with friends`;
      case 'user_registered':
        return `Registered your account on The New Tamale Events`;
      case 'user_logged_in':
        return `Signed in to your session`;
      default:
        return `Activity: ${act.activity_type}`;
    }
  };

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <p className="text-slate-400 text-sm">Please sign in to view your dashboard.</p>
        <button
          onClick={() => onNavigate('login')}
          className="py-2.5 px-6 rounded-xl bg-amber-400 text-slate-950 font-bold text-xs"
        >
          Sign In
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full min-h-screen text-slate-100">
      {/* Header Profile Hero */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl mb-8 flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left">
          <img
            src={user.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.full_name)}`}
            alt={user.full_name}
            className="w-20 h-20 rounded-2xl border-2 border-amber-400 object-cover shadow-lg"
          />
          <div className="space-y-1">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h1 className="text-2xl font-black text-white">{user.full_name}</h1>
              {user.role === 'admin' && (
                <span className="text-[10px] uppercase font-extrabold px-2 py-0.5 rounded bg-amber-500 text-slate-950">
                  Administrator
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400">{user.email}</p>
            <div className="pt-1 flex items-center justify-center sm:justify-start gap-2">
              <span className="text-xs text-slate-400">Home City:</span>
              <CityBadge city={user.preferred_city} size="sm" />
            </div>
          </div>
        </div>

        {/* Quick Stats Badges */}
        <div className="flex items-center gap-4 border-t sm:border-t-0 sm:border-l border-slate-800 pt-4 sm:pt-0 sm:pl-6 text-center">
          <div>
            <span className="text-2xl font-black text-amber-400">{savedEvents.length}</span>
            <span className="text-[11px] font-semibold text-slate-400 block">Saved Events</span>
          </div>
          <div className="w-px h-8 bg-slate-800" />
          <div>
            <span className="text-2xl font-black text-emerald-400">{activities.length}</span>
            <span className="text-[11px] font-semibold text-slate-400 block">Logged Actions</span>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3 mb-8 overflow-x-auto">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
            activeTab === 'overview'
              ? 'bg-amber-400 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <User size={15} />
          <span>Overview</span>
        </button>

        <button
          onClick={() => setActiveTab('saved')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
            activeTab === 'saved'
              ? 'bg-amber-400 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Bookmark size={15} />
          <span>Saved Events ({savedEvents.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('activity')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
            activeTab === 'activity'
              ? 'bg-amber-400 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Activity size={15} />
          <span>My Activity History</span>
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
            activeTab === 'settings'
              ? 'bg-amber-400 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Settings size={15} />
          <span>Account Settings</span>
        </button>
      </div>

      {/* Tab Content */}
      {/* 1. Overview */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          {/* Saved Events Sneak Peek */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Bookmark size={18} className="text-amber-400" />
                <span>Your Saved Events</span>
              </h3>
              <button
                onClick={() => setActiveTab('saved')}
                className="text-xs text-amber-400 hover:underline font-semibold"
              >
                View all ({savedEvents.length})
              </button>
            </div>

            {savedEvents.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {savedEvents.slice(0, 3).map((evt) => (
                  <div
                    key={evt.id}
                    onClick={() => onSelectEvent(evt)}
                    className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-amber-500/40 transition-all cursor-pointer flex gap-4 items-center group"
                  >
                    <img
                      src={evt.image_url}
                      alt={evt.title}
                      className="w-16 h-16 rounded-xl object-cover shrink-0"
                    />
                    <div className="overflow-hidden flex-1">
                      <CityBadge city={evt.city} size="sm" />
                      <h4 className="text-sm font-bold text-white group-hover:text-amber-400 truncate mt-1">
                        {evt.title}
                      </h4>
                      <span className="text-xs text-slate-400 block mt-0.5">
                        {evt.event_date} • {evt.venue_name}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 rounded-2xl bg-slate-900/40 border border-slate-800 text-center space-y-2">
                <Bookmark size={24} className="text-slate-500 mx-auto" />
                <p className="text-xs text-slate-400">You haven't saved any events yet.</p>
                <button
                  onClick={() => onNavigate('events')}
                  className="text-xs font-bold text-amber-400 hover:underline"
                >
                  Discover upcoming shows &rarr;
                </button>
              </div>
            )}
          </div>

          {/* Recent Activity Sneak Peek */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Activity size={18} className="text-emerald-400" />
                <span>Recent Platform Activity</span>
              </h3>
              <button
                onClick={() => setActiveTab('activity')}
                className="text-xs text-amber-400 hover:underline font-semibold"
              >
                Full history
              </button>
            </div>

            <div className="rounded-2xl bg-slate-900/80 border border-slate-800 divide-y divide-slate-800">
              {activities.slice(0, 5).map((act) => (
                <div key={act.id} className="p-4 flex items-center justify-between gap-4 text-xs">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-slate-800">
                      {getActivityIcon(act.activity_type)}
                    </div>
                    <div>
                      <span className="font-semibold text-slate-200">
                        {formatActivityText(act)}
                      </span>
                      {act.event_city && (
                        <span className="text-[11px] text-amber-400/90 block">
                          Location: {act.event_city}
                        </span>
                      )}
                    </div>
                  </div>
                  <span className="text-slate-500 shrink-0 text-[11px]">
                    {new Date(act.created_at).toLocaleString('en-GB', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 2. Saved Events Full List */}
      {activeTab === 'saved' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-white">
              My Saved Events ({savedEvents.length})
            </h3>
            <button
              onClick={() => onNavigate('events')}
              className="py-2 px-4 rounded-xl bg-slate-900 border border-slate-700 text-xs font-bold text-amber-400 hover:text-amber-300"
            >
              Explore More Events
            </button>
          </div>

          {isSavedLoading ? (
            <div className="py-12 text-center text-slate-500 text-xs">Loading saved events...</div>
          ) : savedEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {savedEvents.map((evt) => (
                <div
                  key={evt.id}
                  onClick={() => onSelectEvent(evt)}
                  className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-amber-500/50 transition-all cursor-pointer flex gap-4 group justify-between items-center"
                >
                  <img
                    src={evt.image_url}
                    alt={evt.title}
                    className="w-20 h-20 rounded-xl object-cover shrink-0"
                  />
                  <div className="flex-1 overflow-hidden">
                    <div className="flex items-center gap-2 mb-1">
                      <CityBadge city={evt.city} size="sm" />
                      <span className="text-[11px] text-slate-400">{evt.category}</span>
                    </div>
                    <h4 className="text-base font-bold text-white group-hover:text-amber-400 truncate">
                      {evt.title}
                    </h4>
                    <span className="text-xs text-amber-400/90 block mt-0.5">
                      {evt.event_date} • {evt.venue_name}
                    </span>
                    <span className="text-xs font-bold text-emerald-400 block mt-1">
                      {evt.is_free ? 'FREE' : `GH₵ ${evt.ticket_price}`}
                    </span>
                  </div>

                  <button
                    onClick={(e) => handleRemoveSaved(evt.id, e)}
                    className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 hover:text-rose-400 hover:border-rose-500/40 transition-colors shrink-0"
                    title="Remove from saved"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-20 text-center rounded-3xl bg-slate-900/30 border border-slate-800 space-y-4">
              <Bookmark size={36} className="text-slate-600 mx-auto" />
              <h4 className="text-base font-bold text-white">No saved events</h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Whenever you see a concert, festival, or nightlife activity you like, click the heart icon to save it here.
              </p>
              <button
                onClick={() => onNavigate('events')}
                className="py-2.5 px-6 rounded-xl bg-amber-400 text-slate-950 font-bold text-xs"
              >
                Browse All Events
              </button>
            </div>
          )}
        </div>
      )}

      {/* 3. Activity History */}
      {activeTab === 'activity' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-bold text-white">Platform Activity History</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Persistent log of events viewed, saved, ticket links clicked, and calendar additions.
              </p>
            </div>

            {/* Filter by Activity Type */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">Filter:</span>
              <select
                value={activityFilter}
                onChange={(e) => setActivityFilter(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 outline-none"
              >
                <option value="all">All Activities</option>
                <option value="view_event">Events Viewed</option>
                <option value="save_event">Events Saved</option>
                <option value="ticket_click">Tickets Clicked</option>
                <option value="calendar_add">Calendar Additions</option>
                <option value="share_event">Shares</option>
              </select>
            </div>
          </div>

          <div className="rounded-3xl bg-slate-900/80 border border-slate-800 divide-y divide-slate-800 overflow-hidden">
            {isActivityLoading ? (
              <div className="p-8 text-center text-xs text-slate-500">Loading activities...</div>
            ) : activities.length > 0 ? (
              activities.map((act) => (
                <div key={act.id} className="p-4 sm:p-5 flex items-center justify-between gap-4 text-xs hover:bg-slate-800/40 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 shrink-0">
                      {getActivityIcon(act.activity_type)}
                    </div>
                    <div>
                      <span className="font-bold text-white block text-sm">
                        {formatActivityText(act)}
                      </span>
                      {act.event_city && (
                        <span className="text-xs text-amber-400/90 font-medium">
                          {act.event_city}
                        </span>
                      )}
                    </div>
                  </div>

                  <span className="text-slate-500 shrink-0 text-xs">
                    {new Date(act.created_at).toLocaleString('en-GB', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
              ))
            ) : (
              <div className="p-12 text-center text-slate-500 text-xs">
                No activity logs found for this filter.
              </div>
            )}
          </div>
        </div>
      )}

      {/* 4. Settings */}
      {activeTab === 'settings' && (
        <div className="max-w-xl space-y-6">
          <div>
            <h3 className="text-xl font-bold text-white">Profile Settings</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Update your account details and preferred Northern Ghana city.
            </p>
          </div>

          {settingsSuccess && (
            <div className="p-3.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle size={16} />
              <span>{settingsSuccess}</span>
            </div>
          )}

          <form onSubmit={handleSaveProfile} className="space-y-4 rounded-3xl bg-slate-900/80 border border-slate-800 p-6 sm:p-7">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:border-amber-400 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                disabled
                value={user.email}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/50 border border-slate-800 text-sm text-slate-500 outline-none cursor-not-allowed"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">
                Email address is linked to your authentication identity and cannot be edited.
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Phone Number
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:border-amber-400 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Preferred City / Location
              </label>
              <select
                value={citySelectOption}
                onChange={(e) => setCitySelectOption(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:border-amber-400 outline-none"
              >
                <optgroup label="Featured Hubs">
                  <option value="Tamale">Tamale (Northern Region)</option>
                  <option value="Damongo">Damongo (Savannah Region)</option>
                  <option value="Bolgatanga">Bolgatanga (Upper East Region)</option>
                  <option value="Wa">Wa (Upper West Region)</option>
                </optgroup>
                <optgroup label="Popular Towns & Cities">
                  {BRANDING.popularCities
                    .filter((c) => !['Tamale', 'Damongo', 'Bolgatanga', 'Wa'].includes(c))
                    .map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                </optgroup>
                <option value="__custom__">+ Other / Custom City...</option>
              </select>

              {citySelectOption === '__custom__' && (
                <input
                  type="text"
                  placeholder="Type your city/town (e.g. Navrongo, Accra, Sunyani)..."
                  value={customCityText}
                  onChange={(e) => setCustomCityText(e.target.value)}
                  className="mt-2.5 w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-amber-500/50 focus:border-amber-400 text-xs text-white placeholder-slate-500 outline-none"
                  autoFocus
                />
              )}
            </div>

            <button
              type="submit"
              disabled={isSavingSettings}
              className="py-3 px-6 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs tracking-wide shadow-md transition-all disabled:opacity-50"
            >
              {isSavingSettings ? 'Saving Changes...' : 'Save Profile Changes'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
