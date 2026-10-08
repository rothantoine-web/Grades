/* Grades Dashboard — service worker.
   - App shell (HTML, manifest, icons, Chart.js) is cached so the app opens
     offline / instantly after first visit.
   - The remote data (the published grades JSON) uses network-first: always try
     the network for the freshest grades, fall back to the last cached copy when
     offline. The app ALSO keeps data in localStorage, so this is belt-and-braces.

   Bump CACHE_VERSION whenever the shell files change to force an update. */
const CACHE_VERSION = 'grades-v1';
const SHELL = [
  './',
  './grades_dashboard.html',
  './manifest.webmanifest',
  './icon-192.png',
  './icon-512.png',
  './icon-maskable-512.png',
  './apple-touch-icon.png',
  'https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_VERSION)
      .then(c => c.addAll(SHELL))
      .then(() => self.skipWaiting())
      // don't fail install if the CDN is unreachable at install time
      .catch(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE_VERSION).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Identify the published-data request so we can prefer the network for it.
// Matches the gist raw host and anything the app tags with ?role=data.
function isDataRequest(url) {
  return /gist\.githubusercontent\.com/i.test(url) ||
         /[?&]role=data\b/.test(url) ||
         /\/input\/.*\.json/i.test(url);
}

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;                 // never cache POST (/api/refresh etc.)
  const url = req.url;

  // local helper API — always go to network, never cache
  if (/\/api\//.test(url)) return;

  if (isDataRequest(url)) {
    // network-first: freshest grades online, cached copy offline
    e.respondWith(
      fetch(req).then(resp => {
        const copy = resp.clone();
        caches.open(CACHE_VERSION).then(c => c.put(req, copy));
        return resp;
      }).catch(() => caches.match(req))
    );
    return;
  }

  // app shell — cache-first, revalidate in background
  e.respondWith(
    caches.match(req).then(hit => {
      const net = fetch(req).then(resp => {
        if (resp && resp.status === 200) {
          const copy = resp.clone();
          caches.open(CACHE_VERSION).then(c => c.put(req, copy));
        }
        return resp;
      }).catch(() => hit);
      return hit || net;
    })
  );
});
