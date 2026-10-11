import React, { useState, useEffect } from 'react';
import { EventItem, EventComment, VibeStats } from '../types';
import { CityBadge } from '../components/CityBadge';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import {
  Calendar,
  Clock,
  MapPin,
  Heart,
  Share2,
  Ticket,
  User,
  ArrowLeft,
  AlertTriangle,
  Check,
  CalendarPlus,
  Phone,
  MessageCircle,
  ExternalLink,
  Flame,
  MessageSquare,
  Trash2,
  Send,
  Sparkles,
  Smile,
  Frown
} from 'lucide-react';

interface EventDetailPageProps {
  eventId: string;
  onBack: () => void;
  onSelectEvent: (event: EventItem) => void;
}

const VIBE_TAG_OPTIONS = [
  '📍 Currently Here',
  '🔥 Crowd is Crazy',
  '🎵 Sound is Great',
  '✨ Chill Vibe',
  '🥱 Slow / Dull',
  '🚗 On My Way'
];

export const EventDetailPage: React.FC<EventDetailPageProps> = ({
  eventId,
  onBack,
  onSelectEvent
}) => {
  const { user } = useAuth();
  const [event, setEvent] = useState<EventItem | null>(null);
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [related, setRelated] = useState<EventItem[]>([]);
  const [comments, setComments] = useState<EventComment[]>([]);
  const [vibeStats, setVibeStats] = useState<VibeStats | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Social Inputs
  const [commentText, setCommentText] = useState<string>('');
  const [selectedVibeTag, setSelectedVibeTag] = useState<string>('📍 Currently Here');
  const [isSubmittingComment, setIsSubmittingComment] = useState<boolean>(false);
  const [isVotingVibe, setIsVotingVibe] = useState<boolean>(false);

  useEffect(() => {
    async function loadDetails() {
      setIsLoading(true);
      setError(null);
      try {
        const res = await api.events.getDetails(eventId);
        setEvent(res.event);
        setIsSaved(res.isSaved);
        setRelated(res.related || []);
        setComments(res.comments || []);
        setVibeStats(res.vibeStats || null);
      } catch (err: unknown) {
        console.error('Failed to load event details:', err);
        setError('Event not found or failed to load.');
      } finally {
        setIsLoading(false);
      }
    }

    loadDetails();
  }, [eventId]);

  const handleSaveToggle = async () => {
    if (!user) {
      alert('Please sign in or register to save events to your personal account.');
      return;
    }
    if (!event || isSaving) return;

    setIsSaving(true);
    const nextSaved = !isSaved;
    try {
      if (nextSaved) {
        await api.saved.save(event.id);
      } else {
        await api.saved.remove(event.id);
      }
      setIsSaved(nextSaved);
    } catch (err) {
      console.error('Failed to update saved status:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleShareCopy = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);

    if (user && event) {
      api.activity.log({
        activity_type: 'share_event',
        event_id: event.id,
        metadata: { channel: 'copy_link' }
      });
    }
  };

  const handleShareWhatsApp = () => {
    if (!event) return;
    const text = encodeURIComponent(
      `Check out ${event.title} in ${event.city} on The New Tamale Events!\n${window.location.href}`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');

    if (user) {
      api.activity.log({
        activity_type: 'share_event',
        event_id: event.id,
        metadata: { channel: 'whatsapp' }
      });
    }
  };

  const handleTicketClick = () => {
    if (user && event) {
      api.activity.log({
        activity_type: 'ticket_click',
        event_id: event.id,
        metadata: { ticket_url: event.ticket_url, price: event.ticket_price }
      });
    }
  };

  const handleCalendarExport = () => {
    if (!event) return;
    const title = encodeURIComponent(event.title);
    const details = encodeURIComponent(`${event.description}\n\nVenue: ${event.venue_name}, ${event.city}\nOrganised by: ${event.organiser_name}`);
    const location = encodeURIComponent(`${event.venue_name}, ${event.city}, Ghana`);

    const cleanDate = event.event_date.replace(/-/g, '');
    const startTimeClean = event.start_time.replace(/:/g, '') + '00';
    const dates = `${cleanDate}T${startTimeClean}/${cleanDate}T235900`;

    const gcalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&location=${location}&dates=${dates}`;
    window.open(gcalUrl, '_blank');
  };

  // Vibe Rating Vote Handler
  const handleVoteVibe = async (rating: 'exciting' | 'dull') => {
    if (!user) {
      alert('Please sign in or register to cast your vibe rating!');
      return;
    }
    if (!event || isVotingVibe) return;

    setIsVotingVibe(true);
    try {
      if (vibeStats?.userRating === rating) {
        const res = await api.events.removeRating(event.id);
        setVibeStats(res.vibeStats);
      } else {
        const res = await api.events.rateEvent(event.id, rating);
        setVibeStats(res.vibeStats);
      }
    } catch (err: unknown) {
      console.error('Failed to vote vibe:', err);
      alert('Failed to update vibe rating.');
    } finally {
      setIsVotingVibe(false);
    }
  };

  // Post Comment Handler
  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      alert('Please sign in or register to join the crowd conversation!');
      return;
    }
    if (!commentText.trim() || !event || isSubmittingComment) return;

    setIsSubmittingComment(true);
    try {
      const res = await api.events.addComment(event.id, {
        content: commentText.trim(),
        vibe_tag: selectedVibeTag
      });
      setComments([res.comment, ...comments]);
      setCommentText('');
    } catch (err: unknown) {
      console.error('Failed to post comment:', err);
      alert('Failed to post comment. Please try again.');
    } finally {
      setIsSubmittingComment(false);
    }
  };

  // Delete Comment Handler
  const handleDeleteComment = async (commentId: string) => {
    if (!confirm('Are you sure you want to remove this comment?')) return;
    if (!event) return;

    try {
      await api.events.deleteComment(event.id, commentId);
      setComments(comments.filter(c => c.id !== commentId));
    } catch (err: unknown) {
      console.error('Failed to delete comment:', err);
      alert('Failed to delete comment.');
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-GB', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    } catch {
      return dateStr;
    }
  };

  const formatTimeAgo = (dateStr: string) => {
    try {
      const diffMs = Date.now() - new Date(dateStr).getTime();
      const diffSecs = Math.floor(diffMs / 1000);
      if (diffSecs < 60) return 'Just now';
      const diffMins = Math.floor(diffSecs / 60);
      if (diffMins < 60) return `${diffMins}m ago`;
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours}h ago`;
      const diffDays = Math.floor(diffHours / 24);
      return `${diffDays}d ago`;
    } catch {
      return dateStr;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin mb-4" />
        <p className="text-slate-400 font-medium">Loading event details...</p>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="max-w-xl mx-auto py-20 text-center">
        <AlertTriangle size={48} className="mx-auto text-amber-500 mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">Event Unavailable</h2>
        <p className="text-slate-400 mb-6">{error || 'This event could not be found.'}</p>
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-slate-800 text-white font-semibold hover:bg-slate-700 transition-colors"
        >
          <ArrowLeft size={16} />
          <span>Back to Event Discovery</span>
        </button>
      </div>
    );
  }

  const isCancelled = event.status === 'cancelled';
  const isPostponed = event.status === 'postponed';

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fadeIn">
      {/* Top Navigation Bar */}
      <div className="flex items-center justify-between mb-8">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-400 hover:text-white transition-colors py-2 px-3 rounded-xl hover:bg-slate-800/60"
        >
          <ArrowLeft size={18} />
          <span>Back to All Events</span>
        </button>

        <div className="flex items-center gap-2">
          {/* Share WhatsApp */}
          <button
            onClick={handleShareWhatsApp}
            title="Share on WhatsApp"
            className="p-2.5 rounded-full bg-emerald-950/40 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-900/60 transition-colors"
          >
            <MessageCircle size={18} />
          </button>

          {/* Copy Link */}
          <button
            onClick={handleShareCopy}
            title="Copy Event Link"
            className="p-2.5 rounded-full bg-slate-800/80 text-slate-300 border border-slate-700 hover:text-white transition-colors flex items-center gap-1.5"
          >
            {copiedLink ? <Check size={18} className="text-emerald-400" /> : <Share2 size={18} />}
          </button>

          {/* Save Heart */}
          <button
            onClick={handleSaveToggle}
            title={isSaved ? 'Remove from saved' : 'Save event'}
            className={`p-2.5 rounded-full transition-all border ${
              isSaved
                ? 'bg-rose-500 text-white border-rose-400 shadow-[0_0_15px_rgba(244,63,94,0.5)]'
                : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:text-rose-400'
            }`}
          >
            <Heart size={18} fill={isSaved ? 'currentColor' : 'none'} />
          </button>
        </div>
      </div>

      {/* Main Grid: Poster on Left, Info on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        {/* Left Column: Visual Poster & Action Panel (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="relative rounded-3xl overflow-hidden border border-slate-800 shadow-2xl bg-slate-950 aspect-[4/5] sm:aspect-square lg:aspect-[4/5]">
            <img
              src={event.image_url}
              alt={event.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=80';
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/30" />

            {/* Badges on Poster */}
            <div className="absolute top-4 left-4 flex flex-wrap gap-2 items-center">
              <CityBadge city={event.city} size="md" />
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-slate-900/90 text-slate-200 border border-slate-700/80 backdrop-blur-md">
                {event.category}
              </span>
            </div>

            {/* Status Overlays */}
            {isCancelled && (
              <div className="absolute inset-x-0 bottom-0 bg-rose-600/95 text-white py-3 px-4 font-black text-center text-sm tracking-wider flex items-center justify-center gap-2">
                <AlertTriangle size={18} />
                <span>THIS EVENT HAS BEEN CANCELLED</span>
              </div>
            )}
            {isPostponed && (
              <div className="absolute inset-x-0 bottom-0 bg-amber-500/95 text-slate-950 py-3 px-4 font-black text-center text-sm tracking-wider flex items-center justify-center gap-2">
                <AlertTriangle size={18} />
                <span>THIS EVENT HAS BEEN POSTPONED</span>
              </div>
            )}
          </div>

          {/* Quick Utility Tools */}
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
              Event Tools & Actions
            </span>
            <div className="flex flex-col gap-2">
              <button
                onClick={handleCalendarExport}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 text-xs font-bold flex items-center justify-center gap-2 transition-colors border border-slate-700/50"
              >
                <CalendarPlus size={16} className="text-amber-400" />
                <span>Add to Google Calendar</span>
              </button>
              <button
                onClick={handleShareWhatsApp}
                className="w-full py-2.5 px-4 rounded-xl bg-emerald-950/40 hover:bg-emerald-900/50 text-emerald-300 text-xs font-bold flex items-center justify-center gap-2 transition-colors border border-emerald-500/20"
              >
                <MessageCircle size={16} className="text-emerald-400" />
                <span>Share with Friends on WhatsApp</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Full Event Information (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Title & Headline */}
          <div>
            <h1 className="text-3xl sm:text-4xl font-black text-white leading-tight mb-3">
              {event.title}
            </h1>
            <div className="flex flex-wrap items-center gap-3 text-sm text-slate-400">
              <span className="text-amber-400 font-bold">{event.region}</span>
              <span>•</span>
              <span>Organised by <strong className="text-slate-200">{event.organiser_name}</strong></span>
            </div>
          </div>

          {/* Event Quick Info Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Date & Time */}
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 shrink-0">
                <Calendar size={20} />
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                  Date & Time
                </span>
                <span className="text-sm font-bold text-white block mt-0.5">
                  {formatDate(event.event_date)}
                </span>
                <span className="text-xs text-slate-400">
                  Starts at {event.start_time} {event.end_time ? `till ${event.end_time}` : ''}
                </span>
              </div>
            </div>

            {/* Venue & Location */}
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-rose-500/20 text-rose-400 shrink-0">
                <MapPin size={20} />
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                  Venue & City
                </span>
                <span className="text-sm font-bold text-white block mt-0.5">
                  {event.venue_name}
                </span>
                <span className="text-xs text-slate-400">
                  {event.venue_address || `${event.venue_name}, ${event.city}`}
                </span>
              </div>
            </div>
          </div>

          {/* Pricing & Ticket CTA Card */}
          <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950/60 to-slate-900 border border-amber-500/40 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Admission Price
              </span>
              <div className="text-3xl font-black">
                {event.is_free || event.ticket_price === 0 ? (
                  <span className="text-emerald-400">FREE ADMISSION</span>
                ) : (
                  <span className="text-amber-400">GH₵ {event.ticket_price.toFixed(2)}</span>
                )}
              </div>
              <span className="text-xs text-slate-400">
                {event.ticket_url ? 'Official online ticketing available' : 'Pay at the venue gate or contact organiser'}
              </span>
            </div>

            {event.ticket_url ? (
              <a
                href={event.ticket_url}
                target="_blank"
                rel="noreferrer"
                onClick={handleTicketClick}
                className="w-full sm:w-auto py-3.5 px-8 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-sm tracking-wide shadow-[0_0_20px_rgba(245,158,11,0.4)] transition-all flex items-center justify-center gap-2 shrink-0"
              >
                <Ticket size={18} />
                <span>Get Tickets Online</span>
                <ExternalLink size={14} />
              </a>
            ) : event.organiser_contact ? (
              <a
                href={`tel:${event.organiser_contact}`}
                className="w-full sm:w-auto py-3.5 px-6 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs tracking-wide border border-slate-700 transition-all flex items-center justify-center gap-2 shrink-0"
              >
                <Phone size={16} className="text-amber-400" />
                <span>Call {event.organiser_contact}</span>
              </a>
            ) : null}
          </div>

          {/* Performing Artists Lineup */}
          {event.performers && (
            <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400 block">
                Performing Artists & Special Guests
              </span>
              <p className="text-base font-semibold text-white">
                {event.performers}
              </p>
            </div>
          )}

          {/* Description */}
          <div className="space-y-3">
            <h3 className="text-lg font-bold text-white">About This Event</h3>
            <div className="text-sm text-slate-300 leading-relaxed space-y-3 whitespace-pre-line">
              {event.description}
            </div>
          </div>

          {/* Organiser Contact Information */}
          <div className="pt-4 border-t border-slate-800/80 text-xs text-slate-400 space-y-1">
            <span className="font-bold text-slate-300">Need info or table reservations?</span>
            <div>
              Contact {event.organiser_name}
              {event.organiser_contact && ` via ${event.organiser_contact}`}
            </div>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 🌟 SOCIAL LIVE VIBE CHECK & RATINGS SYSTEM ("Dull" vs "Exciting") */}
      {/* ======================================================== */}
      <section className="mt-14 p-6 sm:p-8 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-bold mb-2">
              <Flame size={14} className="fill-rose-400" />
              <span>LIVE EVENT VIBE METER</span>
            </div>
            <h3 className="text-2xl font-black text-white">
              Is this event Exciting or Dull?
            </h3>
            <p className="text-sm text-slate-400 mt-1">
              Cast your vote to inform people attending or deciding whether to step out tonight.
            </p>
          </div>

          {/* Interactive Rating Buttons */}
          <div className="flex items-center gap-3">
            {/* Exciting Button */}
            <button
              onClick={() => handleVoteVibe('exciting')}
              disabled={isVotingVibe}
              className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-black text-sm transition-all duration-200 border ${
                vibeStats?.userRating === 'exciting'
                  ? 'bg-rose-500 text-white border-rose-400 shadow-[0_0_20px_rgba(244,63,94,0.5)] scale-105'
                  : 'bg-slate-800/80 text-slate-200 border-slate-700 hover:border-rose-500/50 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Smile size={18} className="text-rose-400" />
              <span>🔥 Exciting ({vibeStats?.excitingCount || 0})</span>
            </button>

            {/* Dull Button */}
            <button
              onClick={() => handleVoteVibe('dull')}
              disabled={isVotingVibe}
              className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-black text-sm transition-all duration-200 border ${
                vibeStats?.userRating === 'dull'
                  ? 'bg-amber-600 text-white border-amber-500 shadow-[0_0_20px_rgba(217,119,6,0.5)] scale-105'
                  : 'bg-slate-800/80 text-slate-200 border-slate-700 hover:border-amber-500/50 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Frown size={18} className="text-amber-400" />
              <span>🥱 Dull ({vibeStats?.dullCount || 0})</span>
            </button>
          </div>
        </div>

        {/* Real-time Percentage Bar */}
        <div className="pt-6">
          <div className="flex items-center justify-between text-xs font-bold mb-2">
            <span className="text-rose-400 flex items-center gap-1.5">
              <Flame size={14} className="fill-current" />
              <span>{vibeStats?.excitingPercent || 100}% Rated Exciting</span>
            </span>
            <span className="text-slate-400">
              {vibeStats?.totalVotes || 0} Total Attendee Votes
            </span>
          </div>

          <div className="w-full h-3 rounded-full bg-slate-800 overflow-hidden flex">
            <div
              className="h-full bg-gradient-to-r from-rose-500 via-amber-500 to-orange-400 transition-all duration-500"
              style={{ width: `${vibeStats?.excitingPercent || 100}%` }}
            />
            <div
              className="h-full bg-slate-700 transition-all duration-500"
              style={{ width: `${100 - (vibeStats?.excitingPercent || 100)}%` }}
            />
          </div>

          {vibeStats?.userRating && (
            <p className="text-xs text-emerald-400 font-semibold mt-2.5 flex items-center gap-1">
              <Check size={14} />
              <span>You voted this event as {vibeStats.userRating === 'exciting' ? 'Exciting 🔥' : 'Dull 🥱'} (click button to remove or toggle).</span>
            </p>
          )}
        </div>
      </section>

      {/* ======================================================== */}
      {/* 💬 ATTENDEE LIVE BUZZ & COMMENTS SECTION */}
      {/* ======================================================== */}
      <section className="mt-10 p-6 sm:p-8 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-8">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
              <MessageSquare size={20} />
            </div>
            <div>
              <h3 className="text-2xl font-black text-white">
                Live Crowd Buzz & Comments
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                Are you at the event? Post an update to let friends know how the atmosphere, music, and venue are!
              </p>
            </div>
          </div>
        </div>

        {/* Comment Submission Form */}
        <form onSubmit={handlePostComment} className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-4">
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">
              Select Your Vibe Check
            </label>
            <div className="flex flex-wrap gap-2">
              {VIBE_TAG_OPTIONS.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => setSelectedVibeTag(tag)}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-full transition-all border ${
                    selectedVibeTag === tag
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500 shadow-sm'
                      : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          <div>
            <textarea
              rows={3}
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder={user ? "What's the energy like? Sound system good? Entrance moving fast? Drop your vibe check..." : "Please sign in to drop a comment or crowd update..."}
              disabled={!user || isSubmittingComment}
              className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-amber-500 resize-none transition-colors"
            />
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-xs text-slate-500">
              {user ? `Posting as ${user.full_name}` : 'Sign in to participate'}
            </span>

            {user ? (
              <button
                type="submit"
                disabled={!commentText.trim() || isSubmittingComment}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed text-slate-950 font-bold text-xs tracking-wide transition-all shadow-md"
              >
                <Send size={14} />
                <span>{isSubmittingComment ? 'Posting...' : 'Post Vibe Check'}</span>
              </button>
            ) : (
              <span className="text-xs text-amber-400 font-semibold">
                Sign in with the top menu to comment
              </span>
            )}
          </div>
        </form>

        {/* Comments Feed List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400 border-b border-slate-800/80 pb-3">
            <span>{comments.length} Crowd {comments.length === 1 ? 'Report' : 'Reports'}</span>
            <span>Latest Updates</span>
          </div>

          {comments.length === 0 ? (
            <div className="text-center py-10 text-slate-500 text-sm">
              <MessageSquare size={32} className="mx-auto mb-2 opacity-40" />
              <p>No comments yet. Be the first to drop a live vibe report!</p>
            </div>
          ) : (
            <div className="space-y-3.5">
              {comments.map((comment) => (
                <div
                  key={comment.id}
                  className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-colors flex items-start justify-between gap-4"
                >
                  <div className="flex items-start gap-3.5">
                    <img
                      src={comment.author_avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'}
                      alt={comment.author_name}
                      className="w-10 h-10 rounded-full object-cover border border-amber-500/30 shrink-0"
                    />
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold text-sm text-white">
                          {comment.author_name}
                        </span>
                        {comment.vibe_tag && (
                          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                            {comment.vibe_tag}
                          </span>
                        )}
                        <span className="text-xs text-slate-500">
                          {formatTimeAgo(comment.created_at)}
                        </span>
                      </div>
                      <p className="text-sm text-slate-300 mt-1 leading-relaxed">
                        {comment.content}
                      </p>
                    </div>
                  </div>

                  {(user?.id === comment.user_id || user?.role === 'admin') && (
                    <button
                      onClick={() => handleDeleteComment(comment.id)}
                      title="Delete comment"
                      className="text-slate-500 hover:text-rose-400 p-1.5 rounded-lg hover:bg-slate-800 transition-colors shrink-0"
                    >
                      <Trash2 size={15} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ======================================================== */}
      {/* 📍 RELATED EVENTS SECTION */}
      {/* ======================================================== */}
      {related.length > 0 && (
        <section className="mt-16 pt-10 border-t border-slate-900">
          <h3 className="text-2xl font-bold text-white mb-6">
            More Events in {event.city} & Nearby
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {related.map((rel) => (
              <div
                key={rel.id}
                onClick={() => onSelectEvent(rel)}
                className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-amber-500/50 transition-all cursor-pointer group flex items-center gap-4"
              >
                <img
                  src={rel.image_url}
                  alt={rel.title}
                  className="w-20 h-20 rounded-xl object-cover shrink-0"
                />
                <div className="overflow-hidden">
                  <CityBadge city={rel.city} size="sm" />
                  <h4 className="text-sm font-bold text-white group-hover:text-amber-400 truncate mt-1">
                    {rel.title}
                  </h4>
                  <span className="text-xs text-slate-400 block mt-0.5">
                    {rel.event_date} • {rel.venue_name}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
