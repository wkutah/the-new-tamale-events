import React, { useState } from 'react';
import { EventItem } from '../types';
import { CityBadge } from './CityBadge';
import { Calendar, Clock, MapPin, Heart, ArrowUpRight, AlertTriangle, Flame, MessageSquare } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';

interface EventCardProps {
  event: EventItem;
  initialSaved?: boolean;
  onSaveToggle?: (eventId: string, isSaved: boolean) => void;
  onSelect?: (event: EventItem) => void;
  featured?: boolean;
}

export const EventCard: React.FC<EventCardProps> = ({
  event,
  initialSaved = false,
  onSaveToggle,
  onSelect,
  featured = false
}) => {
  const { user } = useAuth();
  const [isSaved, setIsSaved] = useState(initialSaved);
  const [isSaving, setIsSaving] = useState(false);

  // Format date nicely (e.g. Sat, Nov 14, 2026)
  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-GB', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    } catch {
      return dateStr;
    }
  };

  const handleSaveClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      alert('Please sign in or create an account to save events to your profile.');
      return;
    }

    if (isSaving) return;
    setIsSaving(true);
    const nextSaved = !isSaved;

    try {
      if (nextSaved) {
        await api.saved.save(event.id);
      } else {
        await api.saved.remove(event.id);
      }
      setIsSaved(nextSaved);
      if (onSaveToggle) {
        onSaveToggle(event.id, nextSaved);
      }
    } catch (err) {
      console.error('Failed to toggle save state:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const isCancelled = event.status === 'cancelled';
  const isPostponed = event.status === 'postponed';

  return (
    <div
      onClick={() => onSelect && onSelect(event)}
      className={`group relative flex flex-col rounded-2xl overflow-hidden bg-slate-900/80 border border-slate-800 transition-all duration-300 hover:border-amber-500/40 hover:shadow-[0_10px_30px_-10px_rgba(245,158,11,0.2)] hover:-translate-y-1 cursor-pointer ${
        featured ? 'md:flex-row' : ''
      }`}
    >
      {/* Poster Image Container */}
      <div className={`relative overflow-hidden ${featured ? 'md:w-5/12 h-64 md:h-auto' : 'h-52 w-full'} bg-slate-950`}>
        <img
          src={event.image_url}
          alt={event.title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=80';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />

        {/* City Badge & Category over image */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 items-center">
          <CityBadge city={event.city} size="sm" />
          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-900/80 backdrop-blur-md text-slate-300 border border-slate-700/60">
            {event.category}
          </span>
          {event.vibe_votes && event.vibe_votes > 0 ? (
            <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full backdrop-blur-md border flex items-center gap-1 ${
              (event.vibe_score || 0) >= 80 
                ? 'bg-rose-950/85 text-rose-300 border-rose-500/40 shadow-[0_0_10px_rgba(244,63,94,0.3)]' 
                : 'bg-amber-950/85 text-amber-300 border-amber-500/40'
            }`}>
              <Flame size={12} className="fill-current" />
              <span>{event.vibe_score}% Exciting</span>
            </span>
          ) : null}
        </div>

        {/* Save Heart Button */}
        <button
          onClick={handleSaveClick}
          aria-label={isSaved ? 'Remove from saved' : 'Save event'}
          className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition-all duration-200 border ${
            isSaved
              ? 'bg-rose-500 text-white border-rose-400 shadow-[0_0_12px_rgba(244,63,94,0.6)] scale-105'
              : 'bg-slate-900/70 text-slate-300 border-white/10 hover:text-rose-400 hover:bg-slate-900'
          }`}
        >
          <Heart size={16} fill={isSaved ? 'currentColor' : 'none'} />
        </button>

        {/* Status Alerts over image if cancelled or postponed */}
        {isCancelled && (
          <div className="absolute inset-x-0 bottom-0 bg-rose-600/95 text-white py-1.5 px-3 text-xs font-bold flex items-center justify-center gap-1.5 backdrop-blur-sm">
            <AlertTriangle size={14} />
            <span>EVENT CANCELLED</span>
          </div>
        )}
        {isPostponed && (
          <div className="absolute inset-x-0 bottom-0 bg-amber-500/95 text-slate-950 py-1.5 px-3 text-xs font-bold flex items-center justify-center gap-1.5 backdrop-blur-sm">
            <AlertTriangle size={14} />
            <span>POSTPONED</span>
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className={`flex flex-col flex-1 p-5 ${featured ? 'md:w-7/12 md:p-6 justify-between' : ''}`}>
        <div>
          {/* Date & Time */}
          <div className="flex items-center gap-3 text-xs text-amber-400/90 font-medium mb-2">
            <span className="flex items-center gap-1">
              <Calendar size={13} />
              {formatDate(event.event_date)}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1 text-slate-400">
              <Clock size={13} />
              {event.start_time}
            </span>
          </div>

          {/* Title */}
          <h3 className="text-lg font-bold text-white group-hover:text-amber-400 transition-colors line-clamp-2 leading-snug mb-2">
            {event.title}
          </h3>

          {/* Venue */}
          <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-3 line-clamp-1">
            <MapPin size={13} className="shrink-0 text-slate-500" />
            <span>{event.venue_name}, {event.city}</span>
          </div>

          {/* Performers / Snippet */}
          {event.performers && (
            <p className="text-xs text-slate-400 line-clamp-1 mb-3 italic">
              Feat. {event.performers}
            </p>
          )}

          {/* Social Buzz Stats */}
          <div className="flex items-center gap-3 text-xs text-slate-400 mb-3 pt-1">
            <span className="inline-flex items-center gap-1 font-medium text-amber-400/90">
              <Flame size={13} className="text-rose-500 fill-rose-500" />
              <span>{event.vibe_votes ? `${event.vibe_score}% Exciting` : 'Vote Vibe'}</span>
            </span>
            <span className="text-slate-600">•</span>
            <span className="inline-flex items-center gap-1 text-slate-400">
              <MessageSquare size={13} className="text-sky-400" />
              <span>{event.comment_count || 0} {event.comment_count === 1 ? 'comment' : 'comments'}</span>
            </span>
          </div>
        </div>

        {/* Footer: Price & Action */}
        <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between mt-auto">
          <div>
            <span className="text-[10px] uppercase font-semibold text-slate-500 block">Admission</span>
            <span className={`text-base font-extrabold ${event.is_free || event.ticket_price === 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
              {event.is_free || event.ticket_price === 0 ? 'FREE' : `GH₵ ${event.ticket_price.toFixed(2)}`}
            </span>
          </div>

          <div className="inline-flex items-center gap-1 text-xs font-semibold text-slate-200 group-hover:text-amber-400 group-hover:translate-x-0.5 transition-all">
            <span>Details</span>
            <ArrowUpRight size={15} />
          </div>
        </div>
      </div>
    </div>
  );
};
