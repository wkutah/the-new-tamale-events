import React, { useState, useEffect } from 'react';
import { EventItem, AdminStats, AdminAuditLog, UserProfile, City, EventStatus } from '../types';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import { CityBadge } from '../components/CityBadge';
import { BRANDING } from '../config/branding';
import { QuickAddModal } from '../components/QuickAddModal';
import { EditEventModal } from '../components/EditEventModal';
import {
  ShieldCheck,
  Calendar,
  Users,
  Plus,
  Zap,
  Edit,
  Trash2,
  Archive,
  CheckCircle2,
  Clock,
  AlertTriangle,
  History,
  Search,
  Filter,
  BarChart3,
  ExternalLink,
  ChevronRight,
  RefreshCw
} from 'lucide-react';

interface AdminDashboardPageProps {
  initialTab?: 'overview' | 'events' | 'users' | 'logs';
  onNavigate: (page: string) => void;
  onSelectEvent: (event: EventItem) => void;
}

export const AdminDashboardPage: React.FC<AdminDashboardPageProps> = ({
  initialTab = 'overview',
  onNavigate,
  onSelectEvent
}) => {
  const { user, isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'events' | 'users' | 'logs'>(initialTab);

  // Stats & Overview
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [recentEvents, setRecentEvents] = useState<EventItem[]>([]);
  const [recentLogs, setRecentLogs] = useState<AdminAuditLog[]>([]);

  // Event Management state
  const [eventsList, setEventsList] = useState<EventItem[]>([]);
  const [eventsTotal, setEventsTotal] = useState(0);
  const [statusFilter, setStatusFilter] = useState('all');
  const [cityFilter, setCityFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoadingEvents, setIsLoadingEvents] = useState(false);

  // Users Directory state
  const [usersList, setUsersList] = useState<UserProfile[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);

  // Audit Logs state
  const [auditLogs, setAuditLogs] = useState<AdminAuditLog[]>([]);
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);

  // Modals
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<EventItem | null>(null);

  // Deletion confirm modal
  const [deleteCandidate, setDeleteCandidate] = useState<EventItem | null>(null);

  const loadOverview = async () => {
    try {
      const res = await api.admin.getOverview();
      setStats(res.stats);
      setRecentEvents(res.recentEvents || []);
      setRecentLogs(res.recentLogs || []);
    } catch (err) {
      console.error('Failed to load admin overview:', err);
    }
  };

  const loadAdminEvents = async () => {
    setIsLoadingEvents(true);
    try {
      const res = await api.admin.getEvents({
        status: statusFilter,
        city: cityFilter,
        search: searchQuery
      });
      setEventsList(res.events || []);
      setEventsTotal(res.total || 0);
    } catch (err) {
      console.error('Failed to load admin events:', err);
    } finally {
      setIsLoadingEvents(false);
    }
  };

  const loadUsers = async () => {
    setIsLoadingUsers(true);
    try {
      const res = await api.admin.getUsers();
      setUsersList(res.users || []);
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setIsLoadingUsers(false);
    }
  };

  const loadAuditLogs = async () => {
    setIsLoadingLogs(true);
    try {
      const res = await api.admin.getAuditLogs();
      setAuditLogs(res.logs || []);
    } catch (err) {
      console.error('Failed to load logs:', err);
    } finally {
      setIsLoadingLogs(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      loadOverview();
    }
  }, [isAdmin]);

  useEffect(() => {
    if (isAdmin && activeTab === 'events') {
      loadAdminEvents();
    } else if (isAdmin && activeTab === 'users') {
      loadUsers();
    } else if (isAdmin && activeTab === 'logs') {
      loadAuditLogs();
    }
  }, [isAdmin, activeTab, statusFilter, cityFilter]);

  const handleStatusChange = async (eventId: string, newStatus: string) => {
    try {
      await api.admin.changeStatus(eventId, newStatus);
      loadAdminEvents();
      loadOverview();
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const handleDeleteConfirm = async (permanent = false) => {
    if (!deleteCandidate) return;
    try {
      await api.admin.deleteEvent(deleteCandidate.id, permanent);
      setDeleteCandidate(null);
      loadAdminEvents();
      loadOverview();
    } catch (err) {
      console.error('Failed to delete event:', err);
    }
  };

  // Security Wall: If not authenticated or not administrator
  if (!user || !isAdmin) {
    return (
      <div className="max-w-lg mx-auto px-4 py-24 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/30 flex items-center justify-center mx-auto">
          <ShieldCheck size={32} />
        </div>
        <h2 className="text-2xl font-black text-white">Administrator Access Required</h2>
        <p className="text-xs text-slate-400 leading-relaxed">
          The administrative control panel is restricted strictly to authorized platform personnel.
          Ordinary user accounts cannot access administrative operations.
        </p>
        <div className="pt-2 flex justify-center gap-3">
          <button
            onClick={() => onNavigate('login')}
            className="py-2.5 px-6 rounded-xl bg-amber-400 text-slate-950 font-bold text-xs"
          >
            Sign in as Administrator
          </button>
          <button
            onClick={() => onNavigate('home')}
            className="py-2.5 px-5 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 font-bold text-xs"
          >
            Return Home
          </button>
        </div>
      </div>
    );
  }

  const getStatusBadge = (status: EventStatus) => {
    switch (status) {
      case 'published':
        return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
      case 'draft':
        return 'bg-slate-700/50 text-slate-300 border-slate-600';
      case 'cancelled':
        return 'bg-rose-500/15 text-rose-400 border-rose-500/30';
      case 'postponed':
        return 'bg-amber-500/15 text-amber-400 border-amber-500/30';
      case 'archived':
        return 'bg-purple-500/15 text-purple-400 border-purple-500/30';
      default:
        return 'bg-slate-800 text-slate-300';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full min-h-screen text-slate-100">
      {/* Admin Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1 rounded-md bg-amber-400 text-slate-950">
              <ShieldCheck size={16} />
            </span>
            <span className="text-xs font-black uppercase tracking-wider text-amber-400">
              Security Clearance: Administrator
            </span>
          </div>
          <h1 className="text-3xl font-black text-white">Administrator Control Panel</h1>
          <p className="text-xs text-slate-400">
            Full management of events, posters, user directory, and audit logs across Tamale, Damongo, Bolga, and Wa.
          </p>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsQuickAddOpen(true)}
            className="py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-[0_0_15px_rgba(245,158,11,0.3)] transition-all"
          >
            <Zap size={14} />
            <span>Quick Add Event</span>
          </button>

          <button
            onClick={() => {
              setEditingEvent(null);
              setIsEditModalOpen(true);
            }}
            className="py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white border border-slate-700 font-bold text-xs flex items-center gap-1.5 transition-all"
          >
            <Plus size={14} />
            <span>Add Event (Full)</span>
          </button>
        </div>
      </div>

      {/* Admin Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3 mb-8 overflow-x-auto">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
            activeTab === 'overview'
              ? 'bg-amber-400 text-slate-950 font-black shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <BarChart3 size={15} />
          <span>Dashboard Overview</span>
        </button>

        <button
          onClick={() => setActiveTab('events')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
            activeTab === 'events'
              ? 'bg-amber-400 text-slate-950 font-black shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Calendar size={15} />
          <span>Manage Events ({stats ? stats.totalEvents : '...'})</span>
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
            activeTab === 'users'
              ? 'bg-amber-400 text-slate-950 font-black shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Users size={15} />
          <span>Registered Users ({stats ? stats.totalUsers : '...'})</span>
        </button>

        <button
          onClick={() => setActiveTab('logs')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
            activeTab === 'logs'
              ? 'bg-amber-400 text-slate-950 font-black shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <History size={15} />
          <span>Audit Logs</span>
        </button>
      </div>

      {/* 1. OVERVIEW TAB */}
      {activeTab === 'overview' && stats && (
        <div className="space-y-8">
          {/* Key Metrics Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
            <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 text-center">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Published</span>
              <span className="text-2xl font-black text-emerald-400 mt-1 block">{stats.published}</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 text-center">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Upcoming</span>
              <span className="text-2xl font-black text-amber-400 mt-1 block">{stats.upcoming}</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 text-center">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Past</span>
              <span className="text-2xl font-black text-slate-300 mt-1 block">{stats.past}</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 text-center">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Drafts</span>
              <span className="text-2xl font-black text-slate-400 mt-1 block">{stats.drafts}</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 text-center">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Cancelled</span>
              <span className="text-2xl font-black text-rose-400 mt-1 block">{stats.cancelled}</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 text-center">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Archived</span>
              <span className="text-2xl font-black text-purple-400 mt-1 block">{stats.archived}</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 text-center col-span-2 sm:col-span-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Total Users</span>
              <span className="text-2xl font-black text-blue-400 mt-1 block">{stats.totalUsers}</span>
            </div>
          </div>

          {/* City Distribution Chart (Real DB calculations) */}
          <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center justify-between">
              <span>Event Distribution by Location</span>
              <span className="text-xs font-normal text-slate-400">Total: {stats.totalEvents} events</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-2">
              {Array.from(
                new Set([
                  'Tamale',
                  'Damongo',
                  'Bolgatanga',
                  'Wa',
                  ...stats.cityBreakdown.map((b) => b.city)
                ])
              ).map((c) => {
                const item = stats.cityBreakdown.find((b) => b.city.toLowerCase() === c.toLowerCase());
                const count = item ? item.count : 0;
                const pct = stats.totalEvents > 0 ? Math.round((count / stats.totalEvents) * 100) : 0;

                return (
                  <div key={c} className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-2">
                    <div className="flex items-center justify-between">
                      <CityBadge city={c as City} size="sm" />
                      <span className="text-sm font-black text-white">{count} ({pct}%)</span>
                    </div>
                    {/* Visual Progress Bar */}
                    <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className="h-full bg-amber-400 rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Dual Column: Recently Updated Events & Recent Audit Logs */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Events */}
            <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-white">Recently Updated Events</h3>
                <button
                  onClick={() => setActiveTab('events')}
                  className="text-xs text-amber-400 hover:underline font-semibold"
                >
                  View all
                </button>
              </div>

              <div className="space-y-3">
                {recentEvents.map((evt) => (
                  <div
                    key={evt.id}
                    className="p-3 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <img src={evt.image_url} alt="" className="w-10 h-10 rounded-lg object-cover shrink-0" />
                      <div className="truncate">
                        <span className="font-bold text-white block truncate">{evt.title}</span>
                        <span className="text-[11px] text-slate-400">{evt.city} • {evt.event_date}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getStatusBadge(evt.status)}`}>
                        {evt.status}
                      </span>
                      <button
                        onClick={() => {
                          setEditingEvent(evt);
                          setIsEditModalOpen(true);
                        }}
                        className="p-1.5 rounded-lg bg-slate-900 text-slate-300 hover:text-white hover:bg-slate-800"
                      >
                        <Edit size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Audit Logs */}
            <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-white">Recent Administrative Audit Logs</h3>
                <button
                  onClick={() => setActiveTab('logs')}
                  className="text-xs text-amber-400 hover:underline font-semibold"
                >
                  Full audit history
                </button>
              </div>

              <div className="space-y-2.5">
                {recentLogs.map((log) => (
                  <div key={log.id} className="p-3 rounded-2xl bg-slate-950 border border-slate-800 text-xs flex items-center justify-between gap-2">
                    <div>
                      <span className="font-bold text-amber-400 block">
                        {log.action.replace(/_/g, ' ').toUpperCase()}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        Target: {log.entity_type} ({log.entity_id})
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-500">
                      {new Date(log.created_at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. EVENT MANAGEMENT TAB */}
      {activeTab === 'events' && (
        <div className="space-y-6">
          {/* Controls Bar */}
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3 flex-1">
              {/* Search */}
              <div className="relative flex items-center min-w-[220px]">
                <Search size={15} className="absolute left-3 text-slate-500" />
                <input
                  type="text"
                  placeholder="Filter events..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && loadAdminEvents()}
                  className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white outline-none focus:border-amber-400"
                />
              </div>

              {/* Status filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 outline-none"
              >
                <option value="all">All Statuses</option>
                <option value="published">Published</option>
                <option value="draft">Drafts</option>
                <option value="cancelled">Cancelled</option>
                <option value="postponed">Postponed</option>
                <option value="archived">Archived</option>
              </select>

              {/* City filter */}
              <select
                value={cityFilter}
                onChange={(e) => setCityFilter(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 outline-none"
              >
                <option value="all">All Cities</option>
                <optgroup label="Featured Hubs">
                  <option value="Tamale">Tamale</option>
                  <option value="Damongo">Damongo</option>
                  <option value="Bolgatanga">Bolgatanga</option>
                  <option value="Wa">Wa</option>
                </optgroup>
                <optgroup label="Other Active Towns & Cities">
                  {Array.from(
                    new Set([
                      ...BRANDING.popularCities,
                      ...eventsList.map((evt) => evt.city)
                    ])
                  )
                    .filter((c) => !['Tamale', 'Damongo', 'Bolgatanga', 'Wa'].includes(c))
                    .map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                </optgroup>
              </select>
            </div>

            <button
              onClick={loadAdminEvents}
              className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
              title="Refresh"
            >
              <RefreshCw size={14} />
            </button>
          </div>

          {/* Events Table */}
          <div className="rounded-3xl bg-slate-900/80 border border-slate-800 overflow-hidden shadow-xl">
            {isLoadingEvents ? (
              <div className="py-16 text-center text-xs text-slate-500">Loading events...</div>
            ) : eventsList.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950 text-slate-400 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-800">
                    <tr>
                      <th className="py-3.5 px-4">Event & Poster</th>
                      <th className="py-3.5 px-3">City</th>
                      <th className="py-3.5 px-3">Date & Venue</th>
                      <th className="py-3.5 px-3">Price</th>
                      <th className="py-3.5 px-3">Status</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {eventsList.map((evt) => (
                      <tr key={evt.id} className="hover:bg-slate-800/40 transition-colors">
                        {/* Event & Poster */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={evt.image_url}
                              alt=""
                              className="w-12 h-12 rounded-xl object-cover shrink-0 border border-slate-800"
                            />
                            <div className="max-w-xs">
                              <span className="font-bold text-white block truncate">{evt.title}</span>
                              <span className="text-[11px] text-slate-400">{evt.category}</span>
                            </div>
                          </div>
                        </td>

                        {/* City */}
                        <td className="py-3.5 px-3">
                          <CityBadge city={evt.city} size="sm" />
                        </td>

                        {/* Date & Venue */}
                        <td className="py-3.5 px-3 text-slate-300">
                          <div className="font-semibold text-white">{evt.event_date}</div>
                          <div className="text-[11px] text-slate-400 truncate max-w-[140px]">{evt.venue_name}</div>
                        </td>

                        {/* Price */}
                        <td className="py-3.5 px-3 font-bold text-slate-200">
                          {evt.is_free ? (
                            <span className="text-emerald-400">FREE</span>
                          ) : (
                            <span>GH₵ {evt.ticket_price}</span>
                          )}
                        </td>

                        {/* Status Switcher */}
                        <td className="py-3.5 px-3">
                          <select
                            value={evt.status}
                            onChange={(e) => handleStatusChange(evt.id, e.target.value)}
                            className={`px-2 py-1 rounded-lg text-[11px] font-bold border outline-none bg-slate-950 ${getStatusBadge(evt.status)}`}
                          >
                            <option value="published">published</option>
                            <option value="draft">draft</option>
                            <option value="cancelled">cancelled</option>
                            <option value="postponed">postponed</option>
                            <option value="archived">archived</option>
                          </select>
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => {
                                setEditingEvent(evt);
                                setIsEditModalOpen(true);
                              }}
                              className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700"
                              title="Edit Event"
                            >
                              <Edit size={14} />
                            </button>

                            <button
                              onClick={() => setDeleteCandidate(evt)}
                              className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-rose-400 hover:bg-slate-700"
                              title="Delete or Archive"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-16 text-center text-xs text-slate-500">
                No events found matching your filter.
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3. REGISTERED USERS DIRECTORY */}
      {activeTab === 'users' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-white">Registered Users Directory</h3>
              <p className="text-xs text-slate-400">
                All registered accounts stored in the persistent database. Passwords are encrypted with bcrypt and never exposed.
              </p>
            </div>
            <button
              onClick={loadUsers}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
            >
              <RefreshCw size={15} />
            </button>
          </div>

          <div className="rounded-3xl bg-slate-900/80 border border-slate-800 overflow-hidden shadow-xl">
            {isLoadingUsers ? (
              <div className="py-16 text-center text-xs text-slate-500">Loading users...</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950 text-slate-400 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-800">
                    <tr>
                      <th className="py-3.5 px-4">User</th>
                      <th className="py-3.5 px-3">Email Address</th>
                      <th className="py-3.5 px-3">Preferred City</th>
                      <th className="py-3.5 px-3">Role</th>
                      <th className="py-3.5 px-4">Registered On</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {usersList.map((u) => (
                      <tr key={u.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-3.5 px-4 flex items-center gap-2.5">
                          <img
                            src={u.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(u.full_name)}`}
                            alt=""
                            className="w-8 h-8 rounded-full border border-slate-700"
                          />
                          <span className="font-bold text-white">{u.full_name}</span>
                        </td>
                        <td className="py-3.5 px-3 text-slate-300">{u.email}</td>
                        <td className="py-3.5 px-3">
                          <CityBadge city={u.preferred_city} size="sm" />
                        </td>
                        <td className="py-3.5 px-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            u.role === 'admin'
                              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                              : 'bg-slate-800 text-slate-300'
                          }`}>
                            {u.role.toUpperCase()}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-500 text-[11px]">
                          {new Date(u.created_at).toLocaleDateString('en-GB', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 4. AUDIT LOGS TAB */}
      {activeTab === 'logs' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-white">Administrator Audit Logs</h3>
              <p className="text-xs text-slate-400">
                Immutable records of administrative creations, modifications, publications, cancellations, and status transitions.
              </p>
            </div>
            <button
              onClick={loadAuditLogs}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
            >
              <RefreshCw size={15} />
            </button>
          </div>

          <div className="rounded-3xl bg-slate-900/80 border border-slate-800 overflow-hidden divide-y divide-slate-800 shadow-xl">
            {isLoadingLogs ? (
              <div className="py-16 text-center text-xs text-slate-500">Loading audit records...</div>
            ) : auditLogs.length > 0 ? (
              auditLogs.map((log) => (
                <div key={log.id} className="p-4 sm:p-5 flex items-center justify-between gap-4 text-xs hover:bg-slate-800/40">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
                        {log.action.replace(/_/g, ' ').toUpperCase()}
                      </span>
                      <span className="text-slate-400">
                        by <strong className="text-white">{log.admin_name || 'Admin'}</strong> ({log.admin_email || 'System'})
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Entity: <span className="text-slate-300 font-mono">{log.entity_type} / {log.entity_id}</span>
                      {log.relevant_metadata && (
                        <span className="ml-2 text-slate-500 font-mono">
                          {log.relevant_metadata}
                        </span>
                      )}
                    </div>
                  </div>

                  <span className="text-slate-500 shrink-0 text-xs">
                    {new Date(log.created_at).toLocaleString('en-GB', {
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
              <div className="py-16 text-center text-xs text-slate-500">No audit logs recorded yet.</div>
            )}
          </div>
        </div>
      )}

      {/* Quick Add Modal */}
      <QuickAddModal
        isOpen={isQuickAddOpen}
        onClose={() => setIsQuickAddOpen(false)}
        onEventCreated={() => {
          loadOverview();
          loadAdminEvents();
        }}
      />

      {/* Full Edit Modal */}
      <EditEventModal
        isOpen={isEditModalOpen}
        event={editingEvent}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingEvent(null);
        }}
        onSaved={() => {
          loadOverview();
          loadAdminEvents();
        }}
      />

      {/* Confirmation Dialog for Archive / Delete */}
      {deleteCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-slate-900 border border-slate-800 p-6 space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <AlertTriangle size={20} className="text-rose-400" />
              <span>Archive or Delete Event?</span>
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Are you sure you want to remove <strong>"{deleteCandidate.title}"</strong> ({deleteCandidate.city})?
              We recommend <strong>Archiving</strong> to preserve historical user activity and saved events data.
            </p>

            <div className="flex flex-col sm:flex-row justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                onClick={() => setDeleteCandidate(null)}
                className="py-2.5 px-4 rounded-xl text-xs font-bold bg-slate-800 text-slate-300 hover:text-white"
              >
                Cancel
              </button>

              <button
                onClick={() => handleDeleteConfirm(false)}
                className="py-2.5 px-4 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white flex items-center justify-center gap-1.5"
              >
                <Archive size={14} />
                <span>Archive (Safe)</span>
              </button>

              <button
                onClick={() => handleDeleteConfirm(true)}
                className="py-2.5 px-4 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white flex items-center justify-center gap-1.5"
              >
                <Trash2 size={14} />
                <span>Permanent Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
