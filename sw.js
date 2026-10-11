const CACHE_NAME = 'thanh-nguyen-vf5-v1.0.1'; // Nâng số này lên khi muốn ép khách xóa sạch bộ nhớ

// 1. KHI CÀI ĐẶT: Ép Service Worker mới chiếm quyền ngay lập tức (không bắt khách chờ)
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

// 2. KHI KÍCH HOẠT: Dọn sạch rác của các phiên bản cũ
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('[Service Worker] Xoa cache cu:', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// 3. CHIẾN THUẬT FETCH: "NETWORK FIRST, FALLBACK TO CACHE" (ĐỈNH CAO 2026)
self.addEventListener('fetch', (event) => {
  // Bỏ qua các API bên thứ 3 (OSRM, Telegram, Supabase...)
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        // Nếu có mạng và tải thành công -> Lưu bản mới nhất vào Cache luôn
        if (networkResponse && networkResponse.status === 200) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        // Nếu mất mạng (Offline) -> Lấy hàng dự phòng từ Cache ra xài
        return caches.match(event.request);
      })
  );
});
