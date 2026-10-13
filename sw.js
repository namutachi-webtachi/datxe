// ==========================================================================
// SERVICE WORKER 2026 - MANG LUOI NETWORK-FIRST VA BYPASS GITHUB CACHE
// ==========================================================================

const CACHE_NAME = 'thanh-nguyen-vf5-v1791909686';

self.addEventListener('install', (event) => {
  // KHONG dung self.skipWaiting() de cho App hien nut CAP NHAT
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  if (!event.request.url.startsWith(self.location.origin)) return;

  // 1. TUYET DOI KHONG CACHE FILE version.json
  if (event.request.url.includes('version.json')) {
    event.respondWith(fetch(event.request, { cache: 'no-store' }));
    return;
  }

  // 2. Chien thuat Network First + Ép GitHub tra file moi ({ cache: 'no-cache' })
  event.respondWith(
    fetch(event.request, { cache: 'no-cache' })
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

// LANG NGHE LENH TU GIAO DIEN KHI KHACH BAM NUT CAP NHAT
self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
