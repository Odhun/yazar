'use strict';

const CACHE = 'yazar-pwa-v1';

const PRECACHE = [
  '/yazar/',
  '/yazar/books/kuran-yolu-meali/',
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE)
      .then((c) => c.addAll(PRECACHE))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const { request } = e;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  // Epub dosyaları IndexedDB'de — SW geçmesin
  if (url.pathname.endsWith('.epub')) return;
  // Cross-origin atla
  if (url.origin !== self.location.origin) return;

  // Stale-while-revalidate: cache varsa hemen dön, arka planda güncelle
  e.respondWith(
    caches.open(CACHE).then(async (cache) => {
      const cached = await cache.match(request);
      const networkPromise = fetch(request)
        .then((response) => {
          if (response.ok) cache.put(request, response.clone());
          return response;
        })
        .catch(() => cached);
      return cached ?? networkPromise;
    })
  );
});
