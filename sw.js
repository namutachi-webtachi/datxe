// MOI LAN NANG CAP GIAO DIEN, ONG CHI CAN DOI SO O DAY (VD: v1.0.2 -> v1.0.3)
const CACHE_NAME = 'thanh-nguyen-vf5-v1.0.2';

// 1. KHI CÀI ĐẶT: Ep ban moi chiem quyen ngay lap tuc (Khong bat khach cho tat app)
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

// 2. KHI KICH HOAT: Don rac cua tat ca cac phien ban cu
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('[Service Worker] Xoa cache giao dien cu:', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// 3. CHIEN THUAT: NETWORK-FIRST (Uu tien lay tren GitHub truoc, mat mang moi dung Cache)
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        // Lay tren mang thanh cong -> Luu luon ban moi vao Cache
        if (networkResponse && networkResponse.status === 200) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        // Mat mang -> Loi hang trong Cache ra xai tam
        return caches.match(event.request);
      })
  );
});
