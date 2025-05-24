
// Service Worker for PWA support
const CACHE_NAME = 'menubuilder-cache-v2';
const STATIC_CACHE_NAME = 'menubuilder-static-v2';
const DYNAMIC_CACHE_NAME = 'menubuilder-dynamic-v2';

const staticAssets = [
  '/',
  '/index.html',
  '/favicon.ico',
  '/manifest.json',
  '/static/css/main.css',
  '/static/js/main.js'
];

const urlsToCache = [
  '/',
  '/index.html',
  '/favicon.ico',
  '/manifest.json',
  '/dashboard',
  '/menu-builder',
  '/qr-code'
];

// Install service worker
self.addEventListener('install', event => {
  console.log('Service Worker installing...');
  event.waitUntil(
    Promise.all([
      caches.open(STATIC_CACHE_NAME).then(cache => {
        console.log('Caching static assets');
        return cache.addAll(staticAssets.filter(url => url !== '/'));
      }),
      caches.open(CACHE_NAME).then(cache => {
        console.log('Caching app shell');
        return cache.addAll(urlsToCache);
      })
    ])
  );
  self.skipWaiting();
});

// Activate service worker
self.addEventListener('activate', event => {
  console.log('Service Worker activating...');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME && cacheName !== STATIC_CACHE_NAME && cacheName !== DYNAMIC_CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event with network-first strategy for API calls and cache-first for static assets
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Network first for API calls
  if (url.pathname.includes('/api/') || url.hostname.includes('firebase')) {
    event.respondWith(
      fetch(request)
        .then(response => {
          if (response.status === 200) {
            const responseClone = response.clone();
            caches.open(DYNAMIC_CACHE_NAME).then(cache => {
              cache.put(request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          return caches.match(request);
        })
    );
    return;
  }

  // Cache first for static assets
  event.respondWith(
    caches.match(request)
      .then(response => {
        if (response) {
          return response;
        }
        
        return fetch(request).then(response => {
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(request, responseToCache);
          });

          return response;
        });
      })
      .catch(() => {
        // Return offline page or default response
        if (request.destination === 'document') {
          return caches.match('/index.html');
        }
      })
  );
});

// Handle background sync
self.addEventListener('sync', event => {
  console.log('Background sync:', event.tag);
});

// Handle push notifications (for future use)
self.addEventListener('push', event => {
  console.log('Push notification received');
});
