import React, { useState, useEffect } from 'react';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { HomePage } from './pages/HomePage';
import { EventsPage } from './pages/EventsPage';
import { EventDetailPage } from './pages/EventDetailPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { UserDashboardPage } from './pages/UserDashboardPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { InstallAppModal } from './components/InstallAppModal';
import { EventItem } from './types';
import { BRANDING } from './config/branding';
import { Smartphone, X } from 'lucide-react';

export const AppContent: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<string>('home');
  const [pageParams, setPageParams] = useState<Record<string, string>>({});
  const [selectedCity, setSelectedCity] = useState<string>('All');
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [isInstallModalOpen, setIsInstallModalOpen] = useState<boolean>(false);
  const [showInstallPill, setShowInstallPill] = useState<boolean>(false);

  // Check if mobile and show floating install pill after 3s
  useEffect(() => {
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;
    const dismissed = sessionStorage.getItem('pwa_prompt_dismissed');

    if (!isStandalone && !dismissed) {
      const timer = setTimeout(() => {
        setShowInstallPill(true);
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, []);

  // Sync hash routing on popstate & initial load
  useEffect(() => {
    const parseHash = () => {
      const hash = window.location.hash.replace('#', '') || 'home';
      const [route, queryString] = hash.split('?');
      const params: Record<string, string> = {};

      if (queryString) {
        new URLSearchParams(queryString).forEach((val, key) => {
          params[key] = val;
        });
      }

      if (route.startsWith('events/')) {
        const id = route.replace('events/', '');
        setSelectedEventId(id);
        setCurrentPage('event-detail');
      } else {
        setCurrentPage(route || 'home');
        setPageParams(params);
        if (params.city) setSelectedCity(params.city);
      }
    };

    parseHash();
    window.addEventListener('hashchange', parseHash);
    return () => window.removeEventListener('hashchange', parseHash);
  }, []);

  const navigateTo = (page: string, params: Record<string, string> = {}) => {
    setPageParams(params);
    let hash = page;

    if (page === 'event-detail' && params.id) {
      setSelectedEventId(params.id);
      hash = `events/${params.id}`;
    } else {
      setSelectedEventId(null);
      if (params.city) setSelectedCity(params.city);

      const qs = new URLSearchParams(params).toString();
      if (qs) hash += `?${qs}`;
    }

    window.location.hash = hash;
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectEvent = (event: EventItem) => {
    setSelectedEventId(event.slug || event.id);
    navigateTo('event-detail', { id: event.slug || event.id });
  };

  // Browser page title sync
  useEffect(() => {
    let title = BRANDING.appName;
    switch (currentPage) {
      case 'home':
        title = `${BRANDING.appName} | Entertainment in Tamale, Damongo, Bolga & Wa`;
        break;
      case 'events':
        title = `Discover Events | ${BRANDING.appName}`;
        break;
      case 'event-detail':
        title = `Event Details | ${BRANDING.appName}`;
        break;
      case 'login':
        title = `Sign In | ${BRANDING.appName}`;
        break;
      case 'register':
        title = `Register Account | ${BRANDING.appName}`;
        break;
      case 'dashboard':
        title = `My Dashboard | ${BRANDING.appName}`;
        break;
      case 'admin':
        title = `Administrator Portal | ${BRANDING.appName}`;
        break;
    }
    document.title = title;
  }, [currentPage]);

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col font-sans selection:bg-amber-400 selection:text-slate-950">
      {/* Top Navbar */}
      <Navbar
        currentCity={selectedCity}
        onSelectCity={(c) => {
          setSelectedCity(c);
          navigateTo('events', { city: c });
        }}
        onNavigate={navigateTo}
        activePage={currentPage}
        onOpenInstallModal={() => setIsInstallModalOpen(true)}
      />

      {/* Main Page Content */}
      <main className="flex-1">
        {currentPage === 'home' && (
          <HomePage
            onNavigate={navigateTo}
            onSelectEvent={handleSelectEvent}
            selectedCity={selectedCity}
            onSelectCity={(c) => {
              setSelectedCity(c);
              navigateTo('events', { city: c });
            }}
          />
        )}

        {currentPage === 'events' && (
          <EventsPage
            initialCity={selectedCity}
            initialSearch={pageParams.search || ''}
            initialCategory={pageParams.category || 'All'}
            initialSort={pageParams.sort || 'date_asc'}
            onSelectEvent={handleSelectEvent}
          />
        )}

        {currentPage === 'event-detail' && selectedEventId && (
          <EventDetailPage
            eventId={selectedEventId}
            onBack={() => navigateTo('events')}
            onSelectEvent={handleSelectEvent}
          />
        )}

        {currentPage === 'login' && (
          <LoginPage onNavigate={navigateTo} />
        )}

        {currentPage === 'register' && (
          <RegisterPage onNavigate={navigateTo} />
        )}

        {currentPage === 'dashboard' && (
          <UserDashboardPage
            initialTab={(pageParams.tab as any) || 'overview'}
            onSelectEvent={handleSelectEvent}
            onNavigate={navigateTo}
          />
        )}

        {currentPage === 'admin' && (
          <AdminDashboardPage
            initialTab={(pageParams.tab as any) || 'overview'}
            onNavigate={navigateTo}
            onSelectEvent={handleSelectEvent}
          />
        )}
      </main>

      {/* Mobile Floating Install Pill (Bottom-left/center on mobile) */}
      {showInstallPill && (
        <div className="fixed bottom-5 left-4 right-4 sm:left-auto sm:right-6 sm:w-96 z-40 animate-bounce-short">
          <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-900/95 border border-amber-500/40 shadow-2xl backdrop-blur-xl">
            <div
              onClick={() => setIsInstallModalOpen(true)}
              className="flex items-center gap-3 cursor-pointer flex-1 mr-2"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-rose-500 flex items-center justify-center text-slate-950 font-bold shrink-0 shadow-md">
                <Smartphone size={20} />
              </div>
              <div className="text-left">
                <div className="text-xs font-black text-white flex items-center gap-1.5">
                  <span>Get the Tamale Events App</span>
                  <span className="text-[9px] px-1 rounded bg-amber-500/20 text-amber-400 font-extrabold">NEW</span>
                </div>
                <div className="text-[10px] text-slate-300">Fast 1-tap download for iOS & Android</div>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setIsInstallModalOpen(true)}
                className="px-3 py-1.5 rounded-xl bg-amber-400 text-slate-950 font-black text-xs hover:bg-amber-300 transition-colors shadow-sm"
              >
                Install
              </button>
              <button
                onClick={() => {
                  setShowInstallPill(false);
                  sessionStorage.setItem('pwa_prompt_dismissed', 'true');
                }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white transition-colors"
                title="Dismiss"
              >
                <X size={15} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Download / Install App Modal */}
      <InstallAppModal
        isOpen={isInstallModalOpen}
        onClose={() => setIsInstallModalOpen(false)}
      />

      {/* Footer */}
      <Footer
        onNavigate={navigateTo}
        onSelectCity={(c) => {
          setSelectedCity(c);
          navigateTo('events', { city: c });
        }}
        onOpenInstallModal={() => setIsInstallModalOpen(true)}
      />
    </div>
  );
};


export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
