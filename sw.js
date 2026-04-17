/* Service worker — cache simple pour GH Pages (TTL court côté serveur). */
/* global self */

const CACHE_VERSION = 'dc-v8';
const CACHE_NAME = `dentalcare-${CACHE_VERSION}`;

// On reste volontairement conservateur : cache-first pour assets statiques,
// network-first pour les pages HTML.
const ASSET_EXT_RE = /\.(?:css|js|png|jpg|jpeg|webp|avif|svg|ico|woff2?)$/i;

self.addEventListener('install', (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter((k) => k.startsWith('dentalcare-') && k !== CACHE_NAME)
          .map((k) => caches.delete(k))
      );
      await self.clients.claim();
    })()
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  const isHTML =
    req.mode === 'navigate' ||
    (req.headers.get('accept') || '').includes('text/html');

  if (isHTML) {
    // HTML : network-first (toujours à jour), fallback cache/offline.
    event.respondWith(
      (async () => {
        const cache = await caches.open(CACHE_NAME);
        try {
          const fresh = await fetch(req);
          cache.put(req, fresh.clone());
          return fresh;
        } catch {
          const cached = await cache.match(req);
          return cached || cache.match('index.html') || Response.error();
        }
      })()
    );
    return;
  }

  if (ASSET_EXT_RE.test(url.pathname)) {
    // Assets : cache-first.
    event.respondWith(
      (async () => {
        const cache = await caches.open(CACHE_NAME);
        const cached = await cache.match(req);
        if (cached) return cached;
        const res = await fetch(req);
        cache.put(req, res.clone());
        return res;
      })()
    );
  }
});

