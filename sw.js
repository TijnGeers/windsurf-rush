const CACHE_NAME = "windsurf-rush-v7";
const ASSETS = [
  "./",
  "./index.html",
  "./styles.css",
  "./game.js",
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png",
  "./music1.mp3",
  "./music2.mp3"
];

// Install: cache all assets
self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

// Activate: remove old caches
self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

// Fetch: serve from cache, fallback to network
self.addEventListener("fetch", (e) => {
  e.respondWith(
    caches.match(e.request).then((cached) => cached || fetch(e.request))
  );
});
