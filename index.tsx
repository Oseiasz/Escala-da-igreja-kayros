import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Registra o Service Worker para notificações push
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js')
    .then(registration => {
      console.log('Service Worker registrado com sucesso:', registration.scope);
    })
    .catch(error => {
      console.error('Falha ao registrar o Service Worker:', error);
    });
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
