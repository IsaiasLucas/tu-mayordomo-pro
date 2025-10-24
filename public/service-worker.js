const CACHE_NAME = 'tu-mayordomo-v3';
const OFFLINE_URL = '/offline.html';
const CACHE_MAX_AGE = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

const urlsToCache = [
  '/',
  '/index.html',
  '/offline.html',
  '/icon-192.png',
  '/icon-512.png',
  '/apple-touch-icon.png',
  '/favicon.png'
];

// URLs that should always be fetched from network (bypass cache)
const NETWORK_ONLY_PATTERNS = [
  /\/auth/,
  /supabase\.co/,
  /api\//,
  /\.json$/,
];

// Install event - cache essential files
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
  self.skipWaiting();
});

// Check if URL should bypass cache
const shouldBypassCache = (url) => {
  return NETWORK_ONLY_PATTERNS.some(pattern => pattern.test(url));
};

// Check if cached response is still fresh
const isCacheFresh = (response) => {
  if (!response) return false;
  
  const dateHeader = response.headers.get('date');
  if (!dateHeader) return false;
  
  const cacheDate = new Date(dateHeader).getTime();
  const now = Date.now();
  
  return (now - cacheDate) < CACHE_MAX_AGE;
};

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = request.url;

  // Skip caching for non-GET requests
  if (request.method !== 'GET') {
    event.respondWith(fetch(request));
    return;
  }

  // Bypass cache for specific patterns
  if (shouldBypassCache(url)) {
    event.respondWith(
      fetch(request, { cache: 'no-store' }).catch(() => {
        if (request.mode === 'navigate') {
          return caches.match(OFFLINE_URL);
        }
        return new Response('Network error', { status: 408 });
      })
    );
    return;
  }

  // Navigation requests - network first, then cache
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .catch(() => caches.match(request))
        .catch(() => caches.match(OFFLINE_URL))
    );
    return;
  }

  // Static assets - stale-while-revalidate strategy
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      // Return cached response if fresh
      if (cachedResponse && isCacheFresh(cachedResponse)) {
        return cachedResponse;
      }

      // Fetch from network
      return fetch(request)
        .then((response) => {
          // Only cache valid responses
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          // Clone and cache
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseToCache);
          });

          return response;
        })
        .catch(() => {
          // Return stale cache if network fails
          return cachedResponse || new Response('Offline', { status: 503 });
        });
    })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});