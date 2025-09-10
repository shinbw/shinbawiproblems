// 캐시 버전 올리면 자동으로 최신 적용 유도됨
const CACHE_NAME = "shinbawi-cache-v3";

// 즉시 교체
self.addEventListener("install", (e) => {
  self.skipWaiting();
});

// 오래된 캐시 정리 + 즉시 컨트롤
self.addEventListener("activate", (e) => {
  clients.claim();
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.map((k) => (k !== CACHE_NAME ? caches.delete(k) : null)))
    )
  );
});

// 네트워크 우선, 실패 시 캐시
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
