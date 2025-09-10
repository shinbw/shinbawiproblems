const CACHE_NAME = "shinbawi-cache-v1";

// 설치 단계: 기본 파일 캐싱
self.addEventListener("install", e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll([
        "./",
        "./index.html",
        "./manifest.json"
      ]);
    })
  );
});

// 활성화 단계: 오래된 캐시 제거
self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(k => {
        if (k !== CACHE_NAME) {
          return caches.delete(k);
        }
      }))
    )
  );
});

// 요청 가로채기: 네트워크 우선, 실패 시 캐시
self.addEventListener("fetch", e => {
  e.respondWith(
    fetch(e.request)
      .then(response => {
        return caches.open(CACHE_NAME).then(cache => {
          cache.put(e.request, response.clone());
          return response;
        });
      })
      .catch(() => caches.match(e.request))
  );
});
