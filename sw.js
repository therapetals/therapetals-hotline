const CACHE_NAME = "therapetals-v1";

// Everything the app needs to work offline
const ASSETS = [
  "./index.html",
  "./manifest.json"
];

// Google Fonts — cache these too so text looks right offline
const FONT_URLS = [
  "https://fonts.googleapis.com/css2?family=Fredoka+One&family=Della+Respira&family=Nunito:wght@400;600;700&display=swap",
  "https://fonts.gstatic.com"
];

// ── Install: cache all local assets immediately ──
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting();
});

// ── Activate: clean up old caches ──
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// ── Fetch: serve from cache, fall back to network ──
self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;

      // Not in cache — try network and cache the response
      return fetch(event.request).then(response => {
        // Only cache valid responses (not errors, not opaque cross-origin junk)
        if (
          !response ||
          response.status !== 200 ||
          (response.type !== "basic" && response.type !== "cors")
        ) {
          return response;
        }

        const toCache = response.clone();
        caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, toCache);
        });

        return response;
      }).catch(() => {
        // Network failed and nothing in cache — return offline fallback if it's a page request
        if (event.request.destination === "document") {
          return caches.match("./index.html");
        }
      });
    })
  );
});
