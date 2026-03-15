const CACHE_NAME = 'datemap-v1.5.9';
const ASSETS = [
  '/date-map/',
  '/date-map/index.html',
  '/date-map/manifest.json',
  '/date-map/icon-192.png',
  '/date-map/icon-512.png'
];

// 설치 시 기본 파일 캐시
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting(); // 새 SW 즉시 활성화
});

// 활성화 시 이전 캐시 삭제
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim(); // 모든 탭에 즉시 적용
});

// 메시지로 skipWaiting 요청 받으면 즉시 활성화
self.addEventListener('message', e => {
  if (e.data && e.data.type === 'SKIP_WAITING') self.skipWaiting();
});

// 네트워크 우선, 실패 시 캐시 (항상 최신 버전 시도)
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request)
      .then(res => {
        // 성공하면 캐시 업데이트
        const clone = res.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(e.request, clone));
        return res;
      })
      .catch(() => caches.match(e.request)) // 오프라인이면 캐시
  );
});
