// HERPATH Service Worker (v1.0.0)
// Safe PWA caching for app shell only - NEVER caches live locations, routing queries, or provider tiles

const CACHE_NAME = 'herpath-shell-v1';
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
  '/apple-touch-icon.png',
  '/favicon.ico',
];

// Domains strictly excluded from caching (Map tiles, Geocoding, Routing APIs, Weather)
const EXCLUDED_HOSTS = [
  'tile.openstreetmap.org',
  'api.geoapify.com',
  'api.openweathermap.org',
  'basemaps.cartocdn.com',
  'router.project-osrm.org',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // 1. Never cache non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  // 2. Never cache third-party map tiles, geocoding, or routing APIs (violates terms and caches live data)
  if (EXCLUDED_HOSTS.some((host) => url.hostname.includes(host))) {
    return;
  }

  // 3. Never cache internal dynamic API routes (/api/weather, etc.)
  if (url.pathname.startsWith('/api/')) {
    return;
  }

  // 4. Stale-while-revalidate for static assets, Network-first for pages
  if (url.origin === self.location.origin) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        const fetchPromise = fetch(event.request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
              const responseToCache = networkResponse.clone();
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(event.request, responseToCache);
              });
            }
            return networkResponse;
          })
          .catch(() => {
            // Return cached response if offline
            return cachedResponse;
          });

        return cachedResponse || fetchPromise;
      })
    );
  }
});
