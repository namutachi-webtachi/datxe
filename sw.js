// ==========================================================================
// SERVICE WORKER 2026: STALE-WHILE-REVALIDATE + ETAG BROADCAST
// Khong can doi ten Cache, khong can quan ly Version bang tay nua!
// ==========================================================================

const CACHE_NAME = 'thanh-nguyen-vf5-dynamic-cache';
// Kenh phat song doc lap de SW noi chuyen voi Giao dien Web
const updateChannel = new BroadcastChannel('pwa_update_channel');

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  // Chi ap dung cho file cung ten mien (HTML, CSS, JS, IMG)
  if (!event.request.url.startsWith(self.location.origin)) return;

  event.respondWith(
    caches.open(CACHE_NAME).then(async (cache) => {
      // 1. Tim xem trong may da co file nay chua
      const cachedResponse = await cache.match(event.request);
      
      // 2. Lang lang len GitHub tai file moi ve o che do nen
      const fetchPromise = fetch(event.request).then(async (networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          
          // Neu trong may DA CO file nay, ta mang ra do ETag voi file tren GitHub
          if (cachedResponse) {
            const oldEtag = cachedResponse.headers.get('ETag');
            const newEtag = networkResponse.headers.get('ETag');
            
            // Neu ETag khac nhau -> Code da bi thay doi! Phat tin hieu cho Web!
            if (oldEtag && newEtag && oldEtag !== newEtag) {
              console.log('[SW] Phat hien file thay doi:', event.request.url);
              updateChannel.postMessage({ type: 'UPDATE_AVAILABLE' });
            }
          }
          
          // Luu de ban moi nhat vao Cache
          cache.put(event.request, networkResponse.clone());
        }
        return networkResponse;
      }).catch(() => cachedResponse);

      // 3. CHIEN THUAT SWR: Tra ngay file trong Cache cho khach dung (neu co), 
      // con viec tai file tu GitHub cu am tham chay ngam, khong lam khach phai cho.
      return cachedResponse || fetchPromise;
    })
  );
});
