import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const registerServiceWorker = () => {
  // Registra o Service Worker para notificações push
  if ('serviceWorker' in navigator) {
    // Use an absolute URL for the service worker to avoid potential path resolution issues.
    const swUrl = `${window.location.origin}/sw.js`;
    navigator.serviceWorker.register(swUrl)
      .then(registration => {
        console.log('Service Worker registrado com sucesso:', registration.scope);
      })
      .catch(error => {
        // Silently fail if document is invalid state to avoid console noise in some environments
        console.log('Service Worker registration skipped or failed:', error);
      });
  }
};

// Registra o Service Worker de forma segura
if (document.readyState === 'complete') {
  registerServiceWorker();
} else {
  window.addEventListener('load', registerServiceWorker);
}


const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);