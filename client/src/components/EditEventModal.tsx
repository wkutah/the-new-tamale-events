import React, { useState, useEffect } from 'react';
import { EventItem, City, EventCategory, EventStatus } from '../types';
import { api } from '../api/client';
import { BRANDING } from '../config/branding';
import { X, Upload, Save, AlertCircle } from 'lucide-react';

const CITY_REGION_MAP: Record<string, string> = {
  Tamale: 'Northern Region',
  Damongo: 'Savannah Region',
  Bolgatanga: 'Upper East Region',
  Wa: 'Upper West Region',
  Yendi: 'Northern Region',
  Bimbilla: 'Northern Region',
  Salaga: 'Savannah Region',
  Navrongo: 'Upper East Region',
  Bawku: 'Upper East Region',
  Nalerigu: 'North East Region',
  Walewale: 'North East Region',
  Jirapa: 'Upper West Region',
  Lawra: 'Upper West Region',
  Tumu: 'Upper West Region',
  Accra: 'Greater Accra',
  Kumasi: 'Ashanti Region',
  Sunyani: 'Bono Region',
  'Cape Coast': 'Central Region',
  Takoradi: 'Western Region',
  Ho: 'Volta Region',
  Koforidua: 'Eastern Region',
  Techiman: 'Bono East Region',
  Bole: 'Savannah Region',
  Nyankpala: 'Northern Region'
};

interface EditEventModalProps {
  isOpen: boolean;
  event: EventItem | null;
  onClose: () => void;
  onSaved: () => void;
}

export const EditEventModal: React.FC<EditEventModalProps> = ({
  isOpen,
  event,
  onClose,
  onSaved
}) => {
  const [formData, setFormData] = useState<Partial<EventItem>>({});
  const [citySelect, setCitySelect] = useState('Tamale');
  const [customCity, setCustomCity] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (event) {
      setFormData({
        ...event,
        ticket_price: event.ticket_price || 0,
        is_free: event.is_free || 0
      });
      if (BRANDING.popularCities.includes(event.city)) {
        setCitySelect(event.city);
        setCustomCity('');
      } else {
        setCitySelect('__custom__');
        setCustomCity(event.city);
      }
    } else {
      setCitySelect('Tamale');
      setCustomCity('');
      setFormData({
        title: '',
        category: 'Concert',
        city: 'Tamale',
        region: 'Northern Region',
        venue_name: '',
        venue_address: '',
        event_date: '',
        start_time: '19:00',
        end_time: '',
        performers: '',
        organiser_name: '',
        organiser_contact: '',
        ticket_price: 0,
        is_free: 1,
        ticket_url: '',
        event_url: '',
        is_featured: 0,
        status: 'published',
        description: '',
        image_url: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1200&q=80'
      });
    }
    setError(null);
  }, [event, isOpen]);

  if (!isOpen) return null;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setError(null);
    try {
      const res = await api.admin.uploadPoster(file);
      setFormData((prev) => ({ ...prev, image_url: res.url }));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Upload failed';
      setError(msg);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.title?.trim()) {
      setError('Event title is required.');
      return;
    }
    if (!formData.venue_name?.trim()) {
      setError('Venue name is required.');
      return;
    }
    if (!formData.event_date) {
      setError('Event date is required.');
      return;
    }

    if (citySelect === '__custom__' && !customCity.trim()) {
      setError('Please type the custom city name.');
      return;
    }

    const finalCity =
      citySelect === '__custom__'
        ? customCity.trim()
        : citySelect;

    const finalRegion =
      formData.region?.trim() || CITY_REGION_MAP[finalCity] || 'Northern Ghana';

    const payload = {
      ...formData,
      city: finalCity,
      region: finalRegion
    };

    setIsSubmitting(true);
    try {
      if (event) {
        await api.admin.updateEvent(event.id, payload);
      } else {
        await api.admin.createEvent(payload);
      }
      onSaved();
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to save event.';
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-2xl rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl p-6 sm:p-8 overflow-y-auto max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <h3 className="text-xl font-bold text-white">
              {event ? 'Edit Event Details' : 'Add New Event (Detailed)'}
            </h3>
            <p className="text-xs text-slate-400">
              {event ? `Updating "${event.title}" in ${event.city}` : 'Publish new event to Northern Ghana discovery platform.'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
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

        <form onSubmit={handleSubmit} className="space-y-4 mt-6">
          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Event Title *
            </label>
            <input
              type="text"
              required
              value={formData.title || ''}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:border-amber-400 outline-none"
            />
          </div>

          {/* City, Region, Category */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Target City *
              </label>
              <select
                value={citySelect}
                onChange={(e) => {
                  const val = e.target.value;
                  setCitySelect(val);
                  if (val !== '__custom__') {
                    const reg = CITY_REGION_MAP[val] || formData.region || 'Northern Region';
                    setFormData((prev) => ({ ...prev, city: val, region: reg }));
                  }
                }}
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

              {citySelect === '__custom__' && (
                <input
                  type="text"
                  placeholder="Type custom city name..."
                  value={customCity}
                  onChange={(e) => {
                    setCustomCity(e.target.value);
                    setFormData((prev) => ({ ...prev, city: e.target.value }));
                  }}
                  className="mt-2 w-full px-3 py-2 rounded-xl bg-slate-950 border border-amber-500/50 focus:border-amber-400 text-xs text-white placeholder-slate-500 outline-none"
                  autoFocus
                />
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Region / State
              </label>
              <input
                type="text"
                value={formData.region || ''}
                onChange={(e) => setFormData((prev) => ({ ...prev, region: e.target.value }))}
                placeholder="e.g. Northern Region, Savannah, etc."
                className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:border-amber-400 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Category
              </label>
              <select
                value={formData.category || 'Concert'}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as EventCategory })}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:border-amber-400 outline-none"
              >
                <option value="Concert">Concert</option>
                <option value="Nightlife">Nightlife</option>
                <option value="Cultural">Cultural</option>
                <option value="Festival">Festival</option>
                <option value="Religious Event">Religious Event</option>
                <option value="Comedy">Comedy</option>
                <option value="Campus">Campus</option>
                <option value="Conference">Conference</option>
                <option value="Sports">Sports</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Event Description
            </label>
            <textarea
              rows={3}
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white placeholder-slate-600 focus:border-amber-400 outline-none"
              placeholder="Tell attendees what makes this event unmissable..."
            />
          </div>

          {/* Date & Time Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Event Date *
              </label>
              <input
                type="date"
                required
                value={formData.event_date || ''}
                onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:border-amber-400 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Start Time *
              </label>
              <input
                type="time"
                required
                value={formData.start_time || '18:00'}
                onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:border-amber-400 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                End Time (Optional)
              </label>
              <input
                type="time"
                value={formData.end_time || ''}
                onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:border-amber-400 outline-none"
              />
            </div>
          </div>

          {/* Venue & Address */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Venue Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Radach Memorial Centre"
                value={formData.venue_name || ''}
                onChange={(e) => setFormData({ ...formData, venue_name: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:border-amber-400 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Venue Address
              </label>
              <input
                type="text"
                placeholder="e.g. Industrial Area, Tamale"
                value={formData.venue_address || ''}
                onChange={(e) => setFormData({ ...formData, venue_address: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:border-amber-400 outline-none"
              />
            </div>
          </div>

          {/* Performers & Organiser */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Artists / Guests / Lineup
              </label>
              <input
                type="text"
                placeholder="e.g. Fancy Gadam, Maccasio"
                value={formData.performers || ''}
                onChange={(e) => setFormData({ ...formData, performers: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:border-amber-400 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Organiser Name
              </label>
              <input
                type="text"
                placeholder="e.g. Northern Waves Media"
                value={formData.organiser_name || ''}
                onChange={(e) => setFormData({ ...formData, organiser_name: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:border-amber-400 outline-none"
              />
            </div>
          </div>

          {/* Pricing & Ticket URL */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-slate-950 border border-slate-800">
            <div className="flex flex-col justify-center">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-amber-400">
                <input
                  type="checkbox"
                  checked={!!formData.is_free}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      is_free: e.target.checked ? 1 : 0,
                      ticket_price: e.target.checked ? 0 : formData.ticket_price
                    })
                  }
                  className="rounded border-slate-700 bg-slate-900 text-amber-500"
                />
                <span>Free Admission</span>
              </label>
            </div>

            {!formData.is_free && (
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Ticket Price (GH₵)
                </label>
                <input
                  type="number"
                  min="0"
                  step="5"
                  value={formData.ticket_price || 0}
                  onChange={(e) => setFormData({ ...formData, ticket_price: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-sm text-white outline-none"
                />
              </div>
            )}

            <div className="sm:col-span-1">
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                Ticket Purchase URL
              </label>
              <input
                type="url"
                placeholder="https://egotickets.com/..."
                value={formData.ticket_url || ''}
                onChange={(e) => setFormData({ ...formData, ticket_url: e.target.value })}
                className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-sm text-white outline-none"
              />
            </div>
          </div>

          {/* Poster Upload & URL */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-300">
              Poster Image
            </label>
            <div className="flex items-center gap-3">
              <label className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-950 border border-dashed border-slate-700 hover:border-amber-400 text-xs text-slate-300 cursor-pointer transition-all">
                <Upload size={14} className="text-amber-400" />
                <span>{isUploading ? 'Uploading file...' : 'Upload Image File'}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>

              {formData.image_url && (
                <div className="w-14 h-14 rounded-xl overflow-hidden border border-slate-700 shrink-0">
                  <img src={formData.image_url} alt="Poster" className="w-full h-full object-cover" />
                </div>
              )}
            </div>

            <input
              type="url"
              placeholder="Or enter direct image URL"
              value={formData.image_url || ''}
              onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
              className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300 outline-none"
            />
          </div>

          {/* Status & Featured Status */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Publication Status
              </label>
              <select
                value={formData.status || 'published'}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as EventStatus })}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:border-amber-400 outline-none"
              >
                <option value="published">Published (Public)</option>
                <option value="draft">Draft (Hidden)</option>
                <option value="cancelled">Cancelled</option>
                <option value="postponed">Postponed</option>
                <option value="archived">Archived</option>
              </select>
            </div>

            <div className="flex items-center pt-5">
              <label className="flex items-center gap-2 text-xs font-bold text-amber-400 cursor-pointer">
                <input
                  type="checkbox"
                  checked={!!formData.is_featured}
                  onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked ? 1 : 0 })}
                  className="rounded border-slate-700 bg-slate-900 text-amber-500"
                />
                <span>Feature on Homepage Banner</span>
              </label>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="py-2.5 px-5 rounded-xl text-xs font-bold text-slate-400 hover:text-white bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="py-2.5 px-6 rounded-xl text-xs font-extrabold text-slate-950 bg-amber-400 hover:bg-amber-300 shadow-[0_0_20px_rgba(245,158,11,0.3)] transition-all flex items-center gap-2 disabled:opacity-50"
            >
              <Save size={16} />
              <span>{isSubmitting ? 'Saving...' : 'Save & Persist Event'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
