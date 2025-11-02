// sw.js

const CACHE_NAME = 'church-schedule-cache-v1';
const URLS_TO_CACHE = [
  '/',
  '/index.html',
  '/vite.svg',
  // External assets that need to be available offline
  'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js',
  'https://cdn.tailwindcss.com'
];

// --- INSTALL: Cache critical assets ---
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Caching files');
        const cachePromises = URLS_TO_CACHE.map(urlToCache => {
            return cache.add(urlToCache).catch(err => {
                console.warn(`SW: Failed to cache ${urlToCache}`, err);
            });
        });
        return Promise.all(cachePromises);
      })
      .then(() => self.skipWaiting()) // Force activation
  );
});

// --- ACTIVATE: Clean up old caches ---
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.filter(cacheName => cacheName !== CACHE_NAME)
                 .map(cacheName => caches.delete(cacheName))
      );
    }).then(() => clients.claim()) // Take control of clients
  );
});

// --- FETCH: Serve from cache, fall back to network ---
self.addEventListener('fetch', (event) => {
  // Only apply cache strategy to GET requests
  if (event.request.method !== 'GET') {
    return;
  }
  
  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        // If we have a response in the cache, return it.
        if (cachedResponse) {
          return cachedResponse;
        }

        // If not in cache, fetch from the network.
        return fetch(event.request).then((networkResponse) => {
          // Check for valid response
          if (!networkResponse || networkResponse.status !== 200 || (networkResponse.type !== 'basic' && networkResponse.type !== 'cors')) {
            return networkResponse;
          }

          // Clone the response and cache it for future use.
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME)
            .then((cache) => {
              cache.put(event.request, responseToCache);
            });
          
          return networkResponse;
        });
      })
  );
});


// --- MESSAGE: Handle push notifications from the app ---
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SHOW_NOTIFICATION') {
    const { title, body } = event.data.payload;
    event.waitUntil(
      self.registration.showNotification(title, {
        body: body,
        icon: '/vite.svg',
        badge: '/vite.svg',
      })
    );
  }
});
