const CACHE_NAME = 'thanh-nguyen-pwa-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Cho phep moi request mang chay truc tiep, khong lam gian doan API
  event.respondWith(fetch(event.request).catch(() => caches.match(event.request)));
});
