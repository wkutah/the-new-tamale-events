import React, { useState } from 'react';
import { Logo } from '../components/Logo';
import { useAuth } from '../context/AuthContext';
import { City } from '../types';
import { BRANDING } from '../config/branding';
import { Mail, Lock, User, Phone, MapPin, UserPlus, AlertCircle } from 'lucide-react';

interface RegisterPageProps {
  onNavigate: (page: string) => void;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({ onNavigate }) => {
  const { register } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [selectedCityOption, setSelectedCityOption] = useState<string>('Tamale');
  const [customCity, setCustomCity] = useState('');
  const [phone, setPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (selectedCityOption === '__custom__' && !customCity.trim()) {
      setError('Please type your preferred city or town name.');
      return;
    }

    const resolvedCity =
      selectedCityOption === '__custom__'
        ? customCity.trim()
        : selectedCityOption;

    setIsSubmitting(true);
    try {
      await register({
        full_name: fullName.trim(),
        email: email.trim(),
        password,
        preferred_city: resolvedCity,
        phone_number: phone.trim() || undefined
      });

      onNavigate('dashboard');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Registration failed. Please try again.';
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md rounded-3xl bg-slate-900/90 border border-slate-800 p-8 shadow-2xl backdrop-blur-xl">
        {/* Header */}
        <div className="text-center space-y-2 mb-8">
          <div className="inline-block cursor-pointer" onClick={() => onNavigate('home')}>
            <Logo size="md" showTagline={false} />
          </div>
          <h2 className="text-2xl font-black text-white pt-2">Join The New Tamale Events</h2>
          <p className="text-xs text-slate-400">
            Create an account to save events, track entertainment history, and get local recommendations.
          </p>
        </div>

        {error && (
          <div className="mb-5 p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle size={16} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Full Name *
            </label>
            <div className="relative flex items-center">
              <User size={16} className="absolute left-3.5 text-slate-500 pointer-events-none" />
              <input
                type="text"
                required
                placeholder="e.g. Wilhelm Kutah"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-amber-400 text-sm text-white placeholder-slate-600 outline-none transition-all"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Email Address *
            </label>
            <div className="relative flex items-center">
              <Mail size={16} className="absolute left-3.5 text-slate-500 pointer-events-none" />
              <input
                type="email"
                required
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-amber-400 text-sm text-white placeholder-slate-600 outline-none transition-all"
              />
            </div>
          </div>

          {/* Preferred City Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Preferred City / Location *
            </label>
            <div className="relative flex items-center">
              <MapPin size={16} className="absolute left-3.5 text-slate-500 pointer-events-none" />
              <select
                value={selectedCityOption}
                onChange={(e) => setSelectedCityOption(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-amber-400 text-sm text-white outline-none transition-all"
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
            </div>

            {selectedCityOption === '__custom__' && (
              <div className="relative flex items-center mt-2.5">
                <MapPin size={16} className="absolute left-3.5 text-amber-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Type your city or town name (e.g. Navrongo, Accra, Sunyani)..."
                  value={customCity}
                  onChange={(e) => setCustomCity(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-950 border border-amber-500/50 focus:border-amber-400 text-xs text-white placeholder-slate-500 outline-none"
                  autoFocus
                />
              </div>
            )}
          </div>

          {/* Phone Number */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Phone Number (Optional)
            </label>
            <div className="relative flex items-center">
              <Phone size={16} className="absolute left-3.5 text-slate-500 pointer-events-none" />
              <input
                type="tel"
                placeholder="+233 24 000 0000"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-amber-400 text-sm text-white placeholder-slate-600 outline-none transition-all"
              />
            </div>
          </div>

          {/* Passwords */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Password *
              </label>
              <div className="relative flex items-center">
                <Lock size={16} className="absolute left-3.5 text-slate-500 pointer-events-none" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-amber-400 text-sm text-white placeholder-slate-600 outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Confirm Password *
              </label>
              <div className="relative flex items-center">
                <Lock size={16} className="absolute left-3.5 text-slate-500 pointer-events-none" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-amber-400 text-sm text-white placeholder-slate-600 outline-none transition-all"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-4 py-3 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-sm tracking-wide shadow-[0_0_20px_rgba(245,158,11,0.3)] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <UserPlus size={16} />
            <span>{isSubmitting ? 'Creating Account...' : 'Register Account'}</span>
          </button>
        </form>

        <div className="mt-8 text-center text-xs text-slate-400">
          Already registered?{' '}
          <button
            onClick={() => onNavigate('login')}
            className="text-amber-400 font-bold hover:underline"
          >
            Sign in here
          </button>
        </div>
      </div>
    </div>
  );
};
