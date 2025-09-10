// sw.js?v=5 로 등록하세요 (index.html에서 ?v=5)
const SW_VERSION = "v5";
const CACHE_NAME = `shinbawi-cache-${SW_VERSION}`;

// 즉시 새 SW 활성화
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

// 네트워크 우선 + 안전 가드 (동일 출처 GET만 캐시)
self.addEventListener("fetch", (event) => {
  const req = event.request;

  // 1) GET이 아닌 요청은 건드리지 않음
  if (req.method !== "GET") return;

  // 2) only-if-cached 버그 회피
  if (req.cache === "only-if-cached" && req.mode !== "same-origin") {
    return;
  }

  const url = new URL(req.url);
  const sameOrigin = url.origin === self.location.origin;

  // 3) 동일 출처 요청만 캐시 대상으로
  if (!sameOrigin) {
    // 크로스 오리진은 그냥 네트워크 통과
    return; // respondWith 설정 안 하면 기본 fetch로 처리됨
  }

  event.respondWith(
    (async () => {
      try {
        const netRes = await fetch(req);

        // opaque / 에러 응답은 캐시에 넣지 않음
        if (netRes && netRes.status === 200 && netRes.type === "basic") {
          const cache = await caches.open(CACHE_NAME);
          cache.put(req, netRes.clone()).catch(() => {});
        }
        return netRes;
      } catch (err) {
        // 네트워크 실패 시 캐시 폴백
        const cached = await caches.match(req);
        if (cached) return cached;

        // 네비게이션 요청이면 기본 문서 폴백 (원하면 제거 가능)
        if (req.mode === "navigate") {
          const fallback = await caches.match("/shinbawiproblems/index.html");
          if (fallback) return fallback;
        }
        throw err;
      }
    })()
  );
});
