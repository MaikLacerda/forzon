// FORZON PWA: fresh navigation documents and browser-managed video streaming.

const CACHE_NAME = 'forzon-cache-v3';
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
          .filter((name) => name !== CACHE_NAME && (name.startsWith('stryde-cache-') || name.startsWith('forzon-cache-')))
          .map((name) => caches.delete(name))
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Ignore non-GET requests and WebSocket/HMR
  if (event.request.method !== 'GET') return;
  if (url.origin !== self.location.origin) return;
  // Let the browser/server handle partial responses and seeking. A normal
  // CacheStorage response must never replace a Range response for a video.
  if (event.request.headers.has('range') || /\.(mp4|webm)$/i.test(url.pathname)) return;
  if (url.protocol.startsWith('ws') || url.pathname.startsWith('/@') ||
      url.pathname.startsWith('/src/') || url.pathname.startsWith('/node_modules/')) {
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

  const cacheResponse = async (response) => {
    if (response.status === 200) {
      try {
        const cache = await caches.open(CACHE_NAME);
        await cache.put(event.request, response.clone());
      } catch (_) { /* A full or unavailable cache must not break the page. */ }
    }
    return response;
  };

  // An old index can reference scripts deleted by a new deployment. Fetch the
  // document first; use the stored app shell only when the network is offline.
  if (event.request.mode === 'navigate' || event.request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(
      fetch(event.request, { cache: 'no-cache' }).then(cacheResponse).catch(async () =>
        (await caches.match(event.request)) || (await caches.match('/')) ||
        (await caches.match('/index.html')) || Response.error()
      )
    );
    return;
  }

  const networkResponse = fetch(event.request).then(cacheResponse).catch(async () =>
    (await caches.match(event.request)) || Response.error()
  );
  event.waitUntil(networkResponse.then(() => undefined));
  event.respondWith(caches.match(event.request).then(cached => cached || networkResponse));
});
