import React, { useState, useEffect } from 'react';
import { EventItem } from '../types';
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
  ExternalLink
} from 'lucide-react';

interface EventDetailPageProps {
  eventId: string;
  onBack: () => void;
  onSelectEvent: (event: EventItem) => void;
}

export const EventDetailPage: React.FC<EventDetailPageProps> = ({
  eventId,
  onBack,
  onSelectEvent
}) => {
  const { user } = useAuth();
  const [event, setEvent] = useState<EventItem | null>(null);
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [related, setRelated] = useState<EventItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  useEffect(() => {
    async function loadDetails() {
      setIsLoading(true);
      setError(null);
      try {
        const res = await api.events.getDetails(eventId);
        setEvent(res.event);
        setIsSaved(res.isSaved);
        setRelated(res.related || []);
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

  const handleAddToCalendar = () => {
    if (!event) return;
    // Generate .ics calendar file
    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//The New Tamale Events//NONSGML v1.0//EN',
      'BEGIN:VEVENT',
      `SUMMARY:${event.title}`,
      `DESCRIPTION:${event.description.replace(/\n/g, ' ')}`,
      `LOCATION:${event.venue_name}, ${event.city}, Ghana`,
      `DTSTART:${event.event_date.replace(/-/g, '')}T${event.start_time.replace(':', '')}00Z`,
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', `${event.slug || 'event'}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    if (user) {
      api.activity.log({
        activity_type: 'calendar_add',
        event_id: event.id
      });
    }
  };

  const handleTicketClick = () => {
    if (user && event) {
      api.activity.log({
        activity_type: 'ticket_click',
        event_id: event.id,
        metadata: { ticket_price: event.ticket_price }
      });
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

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-20 text-center">
        <div className="w-12 h-12 border-4 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-slate-400 text-sm">Loading event details from database...</p>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm">
          {error || 'Event could not be found.'}
        </div>
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 py-2 px-5 rounded-xl bg-slate-900 border border-slate-700 text-xs font-bold text-slate-200 hover:text-white"
        >
          <ArrowLeft size={16} />
          <span>Return to All Events</span>
        </button>
      </div>
    );
  }

  const isCancelled = event.status === 'cancelled';
  const isPostponed = event.status === 'postponed';

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full min-h-screen text-slate-100">
      {/* Return Navigation */}
      <button
        onClick={onBack}
        className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-amber-400 transition-colors mb-6 group"
      >
        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
        <span>Back to Events Directory</span>
      </button>

      {/* Prominent Status Notice if Cancelled or Postponed */}
      {isCancelled && (
        <div className="mb-6 p-4 rounded-2xl bg-rose-600/20 border-2 border-rose-500 text-rose-200 flex items-center gap-3 shadow-lg">
          <AlertTriangle size={24} className="text-rose-400 shrink-0" />
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wide">Event Status: Cancelled</h4>
            <p className="text-xs text-rose-300">
              This event has been officially cancelled by the organizers. Please do not proceed to the venue.
            </p>
          </div>
        </div>
      )}

      {isPostponed && (
        <div className="mb-6 p-4 rounded-2xl bg-amber-500/20 border-2 border-amber-500 text-amber-200 flex items-center gap-3 shadow-lg">
          <AlertTriangle size={24} className="text-amber-400 shrink-0" />
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wide">Event Status: Postponed</h4>
            <p className="text-xs text-amber-300">
              The organizers have postponed this event to a later date. Keep checking back for rescheduled announcements.
            </p>
          </div>
        </div>
      )}

      {/* Main Grid: Poster & Key Information */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Event Poster & Action Badges (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="relative rounded-3xl overflow-hidden border border-slate-800 bg-slate-950 shadow-2xl">
            <img
              src={event.image_url}
              alt={event.title}
              className="w-full h-auto object-cover max-h-[500px]"
            />
            <div className="absolute top-4 left-4 flex gap-2">
              <CityBadge city={event.city} size="md" />
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-slate-900/90 text-slate-200 border border-slate-700 backdrop-blur-md">
                {event.category}
              </span>
            </div>
          </div>

          {/* Action Row: Save & Add to Calendar */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleSaveToggle}
              disabled={isSaving}
              className={`py-3 px-4 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 transition-all border ${
                isSaved
                  ? 'bg-rose-500 text-white border-rose-400 shadow-[0_0_15px_rgba(244,63,94,0.4)]'
                  : 'bg-slate-900 text-slate-200 border-slate-800 hover:border-slate-700 hover:text-white'
              }`}
            >
              <Heart size={16} fill={isSaved ? 'currentColor' : 'none'} />
              <span>{isSaved ? 'Saved in Account' : 'Save Event'}</span>
            </button>

            <button
              onClick={handleAddToCalendar}
              className="py-3 px-4 rounded-2xl font-bold text-xs bg-slate-900 text-slate-200 border border-slate-800 hover:border-slate-700 hover:text-white flex items-center justify-center gap-2 transition-all"
            >
              <CalendarPlus size={16} className="text-amber-400" />
              <span>Add to Calendar</span>
            </button>
          </div>

          {/* Social Share Box */}
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
              Share With Friends
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={handleShareWhatsApp}
                className="flex-1 py-2 px-3 rounded-xl bg-emerald-600/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-emerald-600/30 transition-all"
              >
                <MessageCircle size={15} />
                <span>WhatsApp</span>
              </button>

              <button
                onClick={handleShareCopy}
                className="flex-1 py-2 px-3 rounded-xl bg-slate-800 text-slate-300 border border-slate-700 text-xs font-bold flex items-center justify-center gap-1.5 hover:text-white transition-all"
              >
                {copiedLink ? <Check size={15} className="text-emerald-400" /> : <Share2 size={15} />}
                <span>{copiedLink ? 'Copied Link!' : 'Copy Link'}</span>
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

          {/* Artists / Performers Lineup */}
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
          <div className="pt-6 border-t border-slate-800 text-xs text-slate-400 space-y-1">
            <span className="font-bold text-slate-300">Need info or table reservations?</span>
            <div>
              Contact {event.organiser_name}
              {event.organiser_contact && ` via ${event.organiser_contact}`}
            </div>
          </div>
        </div>
      </div>

      {/* Related Events Section */}
      {related.length > 0 && (
        <section className="mt-20 pt-10 border-t border-slate-900">
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
