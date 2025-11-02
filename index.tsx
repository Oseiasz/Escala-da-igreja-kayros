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
        console.error('Falha ao registrar o Service Worker:', error);
      });
  }
};

// Registra o Service Worker após a página carregar completamente.
// Esta é a abordagem mais simples e robusta, garantindo que o documento
// esteja em um estado válido.
window.addEventListener('load', registerServiceWorker);


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