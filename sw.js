const CACHE_NAME = "shinbawi-cache-v1";

// 설치: 기본 파일 캐싱 + 즉시 활성화
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

// 활성화: 오래된 캐시 삭제 + 즉시 컨트롤
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
