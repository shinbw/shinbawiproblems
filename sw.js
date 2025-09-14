// sw.js?v=7 로 등록
const CACHE_NAME = "shinbawi-cache-v7";

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  clients.claim();
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.map((k) => (k !== CACHE_NAME ? caches.delete(k) : null)))
    )
  );
});

// 네트워크 우선 + 동일 출처 GET만 캐시
self.addEventListener("fetch", (event) => {
  const req = event.request;

  if (req.method !== "GET") return;
  if (req.cache === "only-if-cached" && req.mode !== "same-origin") return;

  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    (async () => {
      try {
        const netRes = await fetch(req);
        if (netRes && netRes.status === 200 && netRes.type === "basic") {
          const cache = await caches.open(CACHE_NAME);
          cache.put(req, netRes.clone()).catch(() => {});
        }
        return netRes;
      } catch (err) {
        const cached = await caches.match(req);
        if (cached) return cached;

        if (req.mode === "navigate") {
          const fallback = await caches.match("/shinbawiproblems/index.html");
          if (fallback) return fallback;
        }
        throw err;
      }
    })()
  );
});
