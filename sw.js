
const CACHE_NAME_STATIC = 'travelbuddy-static-v2';
const CACHE_NAME_DYNAMIC = 'travelbuddy-dynamic-v2';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/index.tsx',
  'https://cdn.tailwindcss.com',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js',
  'https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap',
  '/images/icons/icon-192x192.png',
  '/images/icons/icon-512x512.png',
];

const DYNAMIC_CACHEABLE_HOSTS = [
    'images.pexels.com',
    'picsum.photos',
    'tile.openstreetmap.org',
    'open.er-api.com', // Added for ExchangeRate-API
];

// INSTALL: Cache static assets
self.addEventListener('install', event => {
  console.log('[Service Worker] Installing Service Worker...');
  event.waitUntil(
    caches.open(CACHE_NAME_STATIC)
      .then(cache => {
        console.log('[Service Worker] Precaching App Shell:', STATIC_ASSETS);
        return Promise.all(
          STATIC_ASSETS.map(url => {
            return cache.add(url).catch(error => {
              console.warn(`[Service Worker] Failed to cache: ${url}`, error);
            });
          })
        );
      })
      .then(() => {
        console.log('[Service Worker] Static assets cached.');
        return self.skipWaiting(); // Activate new SW immediately
      })
  );
});

// ACTIVATE: Clean up old caches
self.addEventListener('activate', event => {
  console.log('[Service Worker] Activating Service Worker...');
  event.waitUntil(
    caches.keys()
      .then(keyList => {
        return Promise.all(keyList.map(key => {
          if (key !== CACHE_NAME_STATIC && key !== CACHE_NAME_DYNAMIC) {
            console.log('[Service Worker] Removing old cache.', key);
            return caches.delete(key);
          }
        }));
      })
      .then(() => {
        console.log('[Service Worker] Old caches removed.');
        return self.clients.claim(); // Take control of open clients
      })
  );
});

// FETCH: Serve from cache or network
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then(response => {
          if (response.ok && STATIC_ASSETS.includes(url.pathname)) {
            const resClone = response.clone();
            caches.open(CACHE_NAME_STATIC).then(cache => cache.put(request, resClone));
          }
          return response;
        })
        .catch(() => {
          return caches.match(request)
            .then(cachedResponse => {
              if (cachedResponse) {
                return cachedResponse;
              }
              return caches.match('/index.html'); 
            });
        })
    );
    return;
  }

  if (STATIC_ASSETS.some(assetUrl => url.href === new URL(assetUrl, self.location.origin).href) || url.origin === 'https://fonts.gstatic.com') {
    event.respondWith(
      caches.match(request)
        .then(cachedResponse => {
          return cachedResponse || fetch(request)
            .then(networkResponse => {
              if (networkResponse.ok) {
                const resClone = networkResponse.clone();
                caches.open(CACHE_NAME_STATIC).then(cache => cache.put(request, resClone));
              }
              return networkResponse;
            })
            .catch(err => {
              console.warn('[Service Worker] Fetch failed for static asset, not in cache:', request.url, err);
            });
        })
    );
    return;
  }
  
  if (url.hostname === 'esm.sh') {
    event.respondWith(
      caches.match(request)
        .then(cachedResponse => {
          return cachedResponse || fetch(request)
            .then(networkResponse => {
              if (networkResponse.ok) {
                const resClone = networkResponse.clone();
                caches.open(CACHE_NAME_DYNAMIC).then(cache => cache.put(request, resClone));
              }
              return networkResponse;
            })
            .catch(err => {
              console.warn('[Service Worker] Fetch failed for esm.sh asset, not in cache:', request.url, err);
            });
        })
    );
    return;
  }

  if (DYNAMIC_CACHEABLE_HOSTS.includes(url.hostname)) {
    event.respondWith(
      fetch(request)
        .then(networkResponse => {
          if (networkResponse.ok) {
            const resClone = networkResponse.clone();
            caches.open(CACHE_NAME_DYNAMIC)
              .then(cache => {
                cache.put(request, resClone);
              });
          }
          return networkResponse;
        })
        .catch(() => {
          return caches.match(request)
            .then(cachedResponse => {
              if (cachedResponse) {
                return cachedResponse;
              }
              if (request.headers.get('accept')?.includes('image')) {
                // Could return a placeholder image
              }
              return new Response(JSON.stringify({ error: "Offline and not in cache" }), {
                headers: { 'Content-Type': 'application/json' },
                status: 503,
                statusText: "Service Unavailable (Offline)"
              });
            });
        })
    );
    return;
  }

  event.respondWith(fetch(request));
});