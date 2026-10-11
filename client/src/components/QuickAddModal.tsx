import React, { useState } from 'react';
import { City, EventCategory } from '../types';
import { api } from '../api/client';
import { BRANDING } from '../config/branding';
import { X, Upload, Zap, Image, CheckCircle, AlertCircle } from 'lucide-react';

interface QuickAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEventCreated: () => void;
}

export const QuickAddModal: React.FC<QuickAddModalProps> = ({
  isOpen,
  onClose,
  onEventCreated
}) => {
  const [title, setTitle] = useState('');
  const [selectedCityOption, setSelectedCityOption] = useState<string>('Tamale');
  const [customCity, setCustomCity] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [startTime, setStartTime] = useState('19:00');
  const [venueName, setVenueName] = useState('');
  const [category, setCategory] = useState<EventCategory>('Concert');
  const [ticketPrice, setTicketPrice] = useState('0');
  const [isFree, setIsFree] = useState(true);
  const [performers, setPerformers] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setError(null);
    try {
      const res = await api.admin.uploadPoster(file);
      setImageUrl(res.url);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Upload failed';
      setError(msg);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (targetStatus: 'published' | 'draft') => {
    setError(null);

    if (!title.trim()) {
      setError('Event title is required.');
      return;
    }
    if (!venueName.trim()) {
      setError('Venue name is required.');
      return;
    }
    if (!eventDate) {
      setError('Event date is required.');
      return;
    }

    if (selectedCityOption === '__custom__' && !customCity.trim()) {
      setError('Please type the custom city name.');
      return;
    }

    const resolvedCity =
      selectedCityOption === '__custom__'
        ? customCity.trim()
        : selectedCityOption;

    setIsSubmitting(true);
    try {
      await api.admin.createEvent({
        title: title.trim(),
        city: resolvedCity,
        venue_name: venueName.trim(),
        event_date: eventDate,
        start_time: startTime || '18:00',
        category,
        performers: performers.trim() || undefined,
        ticket_price: isFree ? 0 : parseFloat(ticketPrice) || 0,
        is_free: isFree ? 1 : 0,
        image_url:
          imageUrl.trim() ||
          'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1200&q=80',
        status: targetStatus,
        description: `Live entertainment in ${resolvedCity}, Ghana.`
      });

      onEventCreated();
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to create event.';
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl p-6 sm:p-7 overflow-y-auto max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Zap size={20} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                Quick Add Event
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-amber-400 text-slate-950">
                  Fast
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Rapidly publish events received via WhatsApp, flyers, or social media.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle size={16} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form Body */}
        <div className="space-y-4 mt-5">
          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Event Title *
            </label>
            <input
              type="text"
              placeholder="e.g. Savannah Afrofest Live Concert"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 text-sm text-white placeholder-slate-600 outline-none transition-all"
            />
          </div>

          {/* City & Category Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Target City *
              </label>
              <select
                value={selectedCityOption}
                onChange={(e) => setSelectedCityOption(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:border-amber-400 outline-none"
              >
                <optgroup label="Featured Hubs">
                  <option value="Tamale">Tamale (Northern)</option>
                  <option value="Damongo">Damongo (Savannah)</option>
                  <option value="Bolgatanga">Bolgatanga (Upper East)</option>
                  <option value="Wa">Wa (Upper West)</option>
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

              {selectedCityOption === '__custom__' && (
                <input
                  type="text"
                  placeholder="Type city name (e.g. Navrongo, Accra, Sunyani)..."
                  value={customCity}
                  onChange={(e) => setCustomCity(e.target.value)}
                  className="mt-2 w-full px-3 py-2 rounded-xl bg-slate-950 border border-amber-500/50 focus:border-amber-400 text-xs text-white placeholder-slate-500 outline-none"
                  autoFocus
                />
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as EventCategory)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:border-amber-400 outline-none"
              >
                <option value="Concert">Concert / Live</option>
                <option value="Nightlife">Nightlife / Club</option>
                <option value="Cultural">Cultural Celebration</option>
                <option value="Festival">Festival & Fair</option>
                <option value="Religious Event">Religious Event</option>
                <option value="Comedy">Comedy Show</option>
                <option value="Campus">Campus / Student</option>
                <option value="Conference">Summit / Talk</option>
              </select>
            </div>
          </div>

          {/* Date, Time & Venue */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Event Date *
              </label>
              <input
                type="date"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:border-amber-400 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Start Time
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:border-amber-400 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Venue Name *
            </label>
            <input
              type="text"
              placeholder="e.g. Aliu Mahama Sports Stadium or Modern City Hotel"
              value={venueName}
              onChange={(e) => setVenueName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white placeholder-slate-600 focus:border-amber-400 outline-none"
            />
          </div>

          {/* Performers */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Headline Artists / Guests
            </label>
            <input
              type="text"
              placeholder="e.g. Fancy Gadam, Maccasio, DJ Carlos"
              value={performers}
              onChange={(e) => setPerformers(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white placeholder-slate-600 focus:border-amber-400 outline-none"
            />
          </div>

          {/* Admission / Ticket Price */}
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-300">Admission Fee</span>
              <label className="flex items-center gap-2 cursor-pointer text-xs text-amber-400 font-bold">
                <input
                  type="checkbox"
                  checked={isFree}
                  onChange={(e) => {
                    setIsFree(e.target.checked);
                    if (e.target.checked) setTicketPrice('0');
                  }}
                  className="rounded border-slate-700 bg-slate-900 text-amber-500 focus:ring-0"
                />
                <span>Free Event</span>
              </label>
            </div>

            {!isFree && (
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-400">GH₵</span>
                <input
                  type="number"
                  min="0"
                  step="5"
                  placeholder="Ticket Price in GHS"
                  value={ticketPrice}
                  onChange={(e) => setTicketPrice(e.target.value)}
                  className="flex-1 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-sm text-white outline-none focus:border-amber-400"
                />
              </div>
            )}
          </div>

          {/* Poster Upload / URL */}
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <label className="block text-xs font-semibold text-slate-300">
              Poster Image
            </label>

            <div className="flex items-center gap-3">
              <label className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-slate-900 border border-dashed border-slate-700 hover:border-amber-400 text-xs text-slate-300 cursor-pointer transition-all">
                <Upload size={14} className="text-amber-400" />
                <span>{isUploading ? 'Uploading...' : 'Upload Poster File'}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>

              {imageUrl && (
                <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-amber-500/50 shrink-0">
                  <img src={imageUrl} alt="Uploaded" className="w-full h-full object-cover" />
                </div>
              )}
            </div>

            <div className="text-[11px] text-slate-500 flex items-center gap-1">
              <Image size={12} />
              <span>Or paste image URL if flyer is hosted online</span>
            </div>
            <input
              type="url"
              placeholder="https://..."
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300 placeholder-slate-600 outline-none"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3 mt-6 pt-4 border-t border-slate-800">
          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => handleSubmit('draft')}
            className="py-3 px-4 rounded-xl text-xs font-bold text-slate-300 bg-slate-800 hover:bg-slate-700 transition-colors disabled:opacity-50"
          >
            Save as Draft
          </button>

          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => handleSubmit('published')}
            className="py-3 px-4 rounded-xl text-xs font-extrabold text-slate-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.3)] transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
          >
            {isSubmitting ? (
              <span>Saving...</span>
            ) : (
              <>
                <CheckCircle size={16} />
                <span>Publish Immediately</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
