import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App.tsx';
import { ToastProvider } from './contexts/ToastContext.tsx';
import { LanguageProvider } from './contexts/LanguageContext.tsx';
import { ThemeProvider } from './contexts/ThemeContext.tsx';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

console.log("Using Leaflet for maps. No API key needed for map tiles.");
const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ToastProvider>
      <LanguageProvider>
        <ThemeProvider>
          <App />
        </ThemeProvider>
      </LanguageProvider>
    </ToastProvider>
  </React.StrictMode>
);


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