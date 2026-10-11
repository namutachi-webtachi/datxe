// MOI LAN SUA CODE, ONG CHI CAN SUA SO O DONG NAY LA XONG! (VD: v1.0.6 -> v1.0.7)
const CACHE_NAME = 'thanh-nguyen-vf5-v1.0.6';

self.addEventListener('install', (event) => {
  // KHONG dung skipWaiting() tu dong nua, de app cu chay den khi khach bam nut!
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Chien thuat Network First
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  if (!event.request.url.startsWith(self.location.origin)) return;

  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      })
      .catch(() => caches.match(event.request))
  );
});

// LANG NGHE LENH TU NUT "CAP NHAT" DE TIEU DIET BAN CU
self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
