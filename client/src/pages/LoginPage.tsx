import React, { useState } from 'react';
import { Logo } from '../components/Logo';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, Eye, EyeOff, LogIn, AlertCircle, Shield, User } from 'lucide-react';

interface LoginPageProps {
  onNavigate: (page: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onNavigate }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const user = await login(email, password);
      if (user.role === 'admin') {
        onNavigate('admin');
      } else {
        onNavigate('dashboard');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Login failed. Please check your credentials.';
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const autofillAdmin = () => {
    setEmail('admin@newtamaleevents.com');
    setPassword('TamaleAdmin2025!');
    setError(null);
  };

  const autofillUser = () => {
    setEmail('wilhelm@newtamaleevents.com');
    setPassword('UserPassword2025!');
    setError(null);
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md rounded-3xl bg-slate-900/90 border border-slate-800 p-8 shadow-2xl backdrop-blur-xl">
        {/* Header */}
        <div className="text-center space-y-2 mb-8">
          <div className="inline-block cursor-pointer" onClick={() => onNavigate('home')}>
            <Logo size="md" showTagline={false} />
          </div>
          <h2 className="text-2xl font-black text-white pt-2">Welcome Back</h2>
          <p className="text-xs text-slate-400">
            Sign in to access your saved events, personalized city picks, and activity.
          </p>
        </div>

        {/* Demo Fast Login Helpers */}
        <div className="mb-6 p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400/90 block">
            Quick Fill Demo Accounts:
          </span>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={autofillAdmin}
              className="py-1.5 px-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500/20 text-[11px] font-bold text-amber-300 flex items-center justify-center gap-1.5 transition-colors"
            >
              <Shield size={12} />
              <span>Admin Account</span>
            </button>
            <button
              type="button"
              onClick={autofillUser}
              className="py-1.5 px-2.5 rounded-xl bg-slate-800 border border-slate-700 hover:bg-slate-700 text-[11px] font-bold text-slate-200 flex items-center justify-center gap-1.5 transition-colors"
            >
              <User size={12} />
              <span>Standard User</span>
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-5 p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle size={16} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Email Address
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

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-300">
                Password
              </label>
              <span className="text-[11px] text-amber-400 hover:underline cursor-pointer">
                Forgot password?
              </span>
            </div>
            <div className="relative flex items-center">
              <Lock size={16} className="absolute left-3.5 text-slate-500 pointer-events-none" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-amber-400 text-sm text-white placeholder-slate-600 outline-none transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 text-slate-500 hover:text-slate-300"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-2 py-3 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-sm tracking-wide shadow-[0_0_20px_rgba(245,158,11,0.3)] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <LogIn size={16} />
            <span>{isSubmitting ? 'Signing In...' : 'Sign In'}</span>
          </button>
        </form>

        <div className="mt-8 text-center text-xs text-slate-400">
          Don't have an account yet?{' '}
          <button
            onClick={() => onNavigate('register')}
            className="text-amber-400 font-bold hover:underline"
          >
            Create account
          </button>
        </div>
      </div>
    </div>
  );
};
