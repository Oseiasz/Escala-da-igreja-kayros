
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

// Registra o Service Worker em background para não travar a renderização inicial
const registerServiceWorker = () => {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js')
        .then(reg => console.log('SW pronto:', reg.scope))
        .catch(err => console.warn('SW falhou (offline desativado):', err));
    });
  }
};

const rootElement = document.getElementById('root');
if (rootElement) {
  const root = createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
  registerServiceWorker();
}
