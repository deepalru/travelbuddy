import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from '@/App';
import { ToastProvider } from '@/contexts/ToastContext';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { waitForGoogleMaps } from '@/services/maps';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

// Wait for Google Maps API to load (loaded via HTML script tag)
waitForGoogleMaps().then(() => {
  console.log("Google Maps API is ready.");
}).catch(error => {
  console.warn("Google Maps API not available, maps will be disabled:", error);
}).finally(() => {
  // Render the app regardless of Maps API status
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <ToastProvider>
        <LanguageProvider> 
          <App />
        </LanguageProvider>
      </ToastProvider>
    </React.StrictMode>
  );
});


// Register Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(registration => {
        console.log('ServiceWorker registration successful with scope: ', registration.scope);
      })
      .catch(error => {
        console.log('ServiceWorker registration failed: ', error);
      });
  });
}