import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { SpeedInsights } from '@vercel/speed-insights/react';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <>
    <App />
    <SpeedInsights />
  </>
);

// ServiceWorker disabled to prevent caching issues during development
// Uncomment when ready for production PWA features
/*
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .catch((err) => console.error('Service worker registration failed:', err));
  });
}
*/
