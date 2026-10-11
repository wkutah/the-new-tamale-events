import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

// Register Service Worker for offline support and instant PWA loading
if ('serviceWorker' in navigator && typeof window !== 'undefined') {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((registration) => {
        console.log('Tamale Events PWA Service Worker registered:', registration.scope);
      })
      .catch((error) => {
        console.warn('Tamale Events Service Worker registration failed:', error);
      });
  });
}

