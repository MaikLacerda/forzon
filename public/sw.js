// STRYDE Progressive Web App — Production Service Worker
// Fully compliant with Google Play Store (TWA) & Chromium PWA criteria

const CACHE_NAME = 'stryde-cache-v1';
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/manifest.json',
  '/icon.svg',
  '/favicon.svg',
  '/pwa-192x192.png',
  '/pwa-512x512.png',
  '/pwa-maskable-512x512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS).catch((err) => {
        // Precache error non-blocking
        console.log('[STRYDE SW] Precache warning:', err);
      });
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Ignore non-GET requests and WebSocket/HMR
  if (event.request.method !== 'GET') return;
  if (url.protocol.startsWith('ws') || url.pathname.includes('/@vite/') || url.pathname.includes('/@fs/')) {
    return;
  }

  // API calls: Network-first with graceful offline fallback
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(event.request)
        .catch(() => {
          return new Response(
            JSON.stringify({ offline: true, message: 'Modo offline STRYDE ativo' }),
            { headers: { 'Content-Type': 'application/json' } }
          );
        })
    );
    return;
  }

  // App Shell & Static Assets: Stale-While-Revalidate
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      }).catch(() => {
        // If offline and request is an HTML navigation, return cached /index.html
        if (event.request.headers.get('accept')?.includes('text/html')) {
          return caches.match('/') || caches.match('/index.html');
        }
        return cachedResponse;
      });

      return cachedResponse || fetchPromise;
    })
  );
});
