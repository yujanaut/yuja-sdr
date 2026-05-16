const CACHE = 'yuja-sdr-v3';
const STATIC = [
  '/yuja-sdr/',
  '/yuja-sdr/index.html',
  '/yuja-sdr/manifest.json',
  '/yuja-sdr/icon-192.png',
  '/yuja-sdr/icon-512.png',
  '/yuja-sdr/yuja_logo_final.png'
];

// Install: cache static assets
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(STATIC))
  );
  self.skipWaiting();
});

// Activate: clean up old caches
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch: network first, fall back to cache
// This ensures updates always show up immediately
self.addEventListener('fetch', e => {
  // Only handle same-origin requests
  if (!e.request.url.startsWith(self.location.origin)) return;

  e.respondWith(
    fetch(e.request)
      .then(res => {
        // Update cache with fresh response
        const clone = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, clone));
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});
