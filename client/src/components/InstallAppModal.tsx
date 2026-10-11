import React, { useState, useEffect } from 'react';
import {
  Smartphone,
  Download,
  Share2,
  PlusSquare,
  CheckCircle2,
  Sparkles,
  X,
  WifiOff,
  Flame,
  Zap,
  ArrowRight
} from 'lucide-react';
import { BRANDING } from '../config/branding';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

interface InstallAppModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InstallAppModal: React.FC<InstallAppModalProps> = ({ isOpen, onClose }) => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState<boolean>(false);
  const [platform, setPlatform] = useState<'ios' | 'android' | 'desktop'>('android');
  const [activeTab, setActiveTab] = useState<'android' | 'ios'>('android');
  const [installSuccess, setInstallSuccess] = useState<boolean>(false);

  useEffect(() => {
    // Detect OS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIOSDevice =
      /iphone|ipad|ipod/.test(userAgent) ||
      (userAgent.includes('mac') && navigator.maxTouchPoints > 1);
    const isAndroidDevice = /android/.test(userAgent);

    if (isIOSDevice) {
      setPlatform('ios');
      setActiveTab('ios');
    } else if (isAndroidDevice) {
      setPlatform('android');
      setActiveTab('android');
    } else {
      setPlatform('desktop');
      setActiveTab('android');
    }

    // Check if already in standalone display mode
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;
    setIsInstalled(isStandalone);

    // Listen for Chrome / Android beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setInstallSuccess(true);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  if (!isOpen) return null;

  const handleInstallAndroid = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setInstallSuccess(true);
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
    } else {
      // In case browser already past the prompt or in another Android browser
      alert(
        'To install: Tap the 3 dots (⋮) in the top-right corner of Chrome/Brave and tap "Add to Home Screen" or "Install App"!'
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg overflow-hidden rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl text-slate-100">
        {/* Glow ambient background header */}
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-br from-amber-500/20 via-rose-500/10 to-transparent pointer-events-none" />

        {/* Modal Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-all"
          aria-label="Close"
        >
          <X size={18} />
        </button>

        <div className="p-6 sm:p-8 relative">
          {/* Header with App Icon */}
          <div className="flex items-center gap-4 mb-6">
            <div className="relative w-16 h-16 rounded-2xl overflow-hidden border border-amber-500/40 shadow-lg shadow-amber-500/10 bg-slate-950 flex items-center justify-center shrink-0">
              <img
                src="/icons/icon-192.png"
                alt="The New Tamale Events"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.currentTarget as HTMLElement).style.display = 'none';
                }}
              />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-400 border border-amber-500/30 mb-1">
                <Sparkles size={11} />
                <span>Download Mobile App</span>
              </div>
              <h2 className="text-xl font-black text-white tracking-tight">
                The New Tamale Events
              </h2>
              <p className="text-xs text-slate-400">
                Powered By <span className="text-amber-400 font-semibold">ALSHAREME Media</span>
              </p>
            </div>
          </div>

          {/* Installed State */}
          {isInstalled || installSuccess ? (
            <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-3">
              <div className="w-12 h-12 mx-auto rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                <CheckCircle2 size={28} />
              </div>
              <h3 className="text-base font-bold text-emerald-300">
                App Installed & Ready!
              </h3>
              <p className="text-xs text-slate-300">
                You can now launch <strong className="text-white">The New Tamale Events</strong> directly from your phone's home screen anytime, even offline!
              </p>
              <button
                onClick={onClose}
                className="mt-2 px-6 py-2 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs hover:bg-emerald-400 transition-colors"
              >
                Close & Enjoy
              </button>
            </div>
          ) : (
            <>
              {/* Feature Perks Grid */}
              <div className="grid grid-cols-3 gap-2.5 mb-6 text-center">
                <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
                  <Zap size={16} className="text-amber-400 mx-auto mb-1" />
                  <div className="text-[11px] font-bold text-white">Instant Speed</div>
                  <div className="text-[9px] text-slate-400">Loads in &lt;1 second</div>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
                  <Flame size={16} className="text-rose-400 mx-auto mb-1" />
                  <div className="text-[11px] font-bold text-white">Live Trending</div>
                  <div className="text-[9px] text-slate-400">Instant crowd buzz</div>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
                  <WifiOff size={16} className="text-emerald-400 mx-auto mb-1" />
                  <div className="text-[11px] font-bold text-white">Offline Ready</div>
                  <div className="text-[9px] text-slate-400">Works without WiFi</div>
                </div>
              </div>

              {/* Platform Switcher Tabs */}
              <div className="flex rounded-xl bg-slate-950 p-1 border border-slate-800 mb-5">
                <button
                  onClick={() => setActiveTab('android')}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all ${
                    activeTab === 'android'
                      ? 'bg-amber-500 text-slate-950 shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Smartphone size={14} />
                  <span>Android</span>
                  {platform === 'android' && (
                    <span className="text-[9px] px-1 rounded bg-slate-950/20 text-slate-900 font-extrabold">
                      You
                    </span>
                  )}
                </button>

                <button
                  onClick={() => setActiveTab('ios')}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all ${
                    activeTab === 'ios'
                      ? 'bg-amber-500 text-slate-950 shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Smartphone size={14} />
                  <span>iPhone / iPad (iOS)</span>
                  {platform === 'ios' && (
                    <span className="text-[9px] px-1 rounded bg-slate-950/20 text-slate-900 font-extrabold">
                      You
                    </span>
                  )}
                </button>
              </div>

              {/* Android Instructions / One-Tap Trigger */}
              {activeTab === 'android' && (
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20">
                    <div className="text-xs font-semibold text-amber-200 mb-1 flex items-center gap-1.5">
                      <Sparkles size={14} className="text-amber-400" />
                      <span>One-Tap Install for Android</span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Download directly without needing to sign into Google Play. Tap below to add to your phone launcher.
                    </p>
                  </div>

                  <button
                    onClick={handleInstallAndroid}
                    className="w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-slate-950 font-black text-sm flex items-center justify-center gap-2.5 hover:from-amber-400 hover:to-amber-300 transition-all shadow-lg shadow-amber-500/25 active:scale-[0.98]"
                  >
                    <Download size={18} className="stroke-[2.5]" />
                    <span>Install App on Android Now</span>
                  </button>

                  <div className="text-[11px] text-slate-400 text-center space-y-1">
                    <p>
                      Or in Chrome: Tap <strong>⋮ (Menu)</strong> &rarr; <strong>"Install app"</strong> or <strong>"Add to Home screen"</strong>.
                    </p>
                  </div>
                </div>
              )}

              {/* iOS Instructions (Safari Step-by-Step) */}
              {activeTab === 'ios' && (
                <div className="space-y-3">
                  <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800">
                    <div className="text-xs font-bold text-amber-300 mb-1">
                      How to install on iPhone & iPad:
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Apple Safari installs web apps straight to your home screen in 3 quick taps:
                    </p>
                  </div>

                  <div className="space-y-2.5">
                    {/* Step 1 */}
                    <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-slate-950 border border-slate-800/80">
                      <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-black text-xs shrink-0">
                        1
                      </div>
                      <div className="text-xs flex-1">
                        <div className="font-semibold text-white flex items-center gap-1.5">
                          <span>Tap the</span>
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-800 text-amber-300 font-bold">
                            <Share2 size={12} /> Share button
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400">
                          Located at the bottom of Safari on iPhone (or top bar on iPad).
                        </div>
                      </div>
                    </div>

                    {/* Step 2 */}
                    <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-slate-950 border border-slate-800/80">
                      <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-black text-xs shrink-0">
                        2
                      </div>
                      <div className="text-xs flex-1">
                        <div className="font-semibold text-white flex items-center gap-1.5">
                          <span>Choose</span>
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-800 text-white font-bold">
                            <PlusSquare size={12} className="text-amber-400" /> "Add to Home Screen"
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400">
                          Scroll down the share sheet and tap "Add to Home Screen".
                        </div>
                      </div>
                    </div>

                    {/* Step 3 */}
                    <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-slate-950 border border-slate-800/80">
                      <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-black text-xs shrink-0">
                        3
                      </div>
                      <div className="text-xs flex-1">
                        <div className="font-semibold text-white">
                          Tap <span className="text-amber-400 font-bold">"Add"</span> in the top-right corner
                        </div>
                        <div className="text-[11px] text-slate-400">
                          The app icon will immediately appear on your home screen!
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Footer Note */}
          <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
            <span>Package ID: <code className="text-slate-400">com.alsharememedia.tamaleevents</code></span>
            <span>Version 1.0.0</span>
          </div>
        </div>
      </div>
    </div>
  );
};
