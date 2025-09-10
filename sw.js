const CACHE_NAME = "shinbawi-cache-v2"; // v1 → v2

self.addEventListener("install", (e) => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      cache.addAll([
        "/shinbawiproblems/",
        "/shinbawiproblems/index.html",
        "/shinbawiproblems/manifest.json"
      ])
    )
  );
});

self.addEventListener("activate", (e) => {
  clients.claim();
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.map((k) => (k !== CACHE_NAME ? caches.delete(k) : null)))
    )
  );
});

self.addEventListener("fetch", (e) => {
  e.respondWith(
    fetch(e.request)
      .then((res) => {
        const copy = res.clone();
        caches.open(CACHE_NAME).then((c) => c.put(e.request, copy));
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});
