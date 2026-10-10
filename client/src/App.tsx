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
import { EventItem } from './types';
import { BRANDING } from './config/branding';

export const AppContent: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<string>('home');
  const [pageParams, setPageParams] = useState<Record<string, string>>({});
  const [selectedCity, setSelectedCity] = useState<string>('All');
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

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

      {/* Footer */}
      <Footer
        onNavigate={navigateTo}
        onSelectCity={(c) => {
          setSelectedCity(c);
          navigateTo('events', { city: c });
        }}
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
