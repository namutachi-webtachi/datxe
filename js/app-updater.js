// ==========================================================================
// APP-UPDATER.JS - HE THONG THONG BAO CAP NHAT & BE GAY CACHE GITHUB
// ==========================================================================

export function initAppUpdater() {
  if (!('serviceWorker' in navigator)) return;

  // 1. DANG KY S.W VA THEO DOI TRANG THAI CUA NO
  navigator.serviceWorker.register('./sw.js').then((reg) => {
    if (reg.waiting) { triggerUpdateUI(reg.waiting); return; }
    if (reg.installing) { trackWorkerState(reg.installing); return; }

    reg.addEventListener('updatefound', () => {
      trackWorkerState(reg.installing);
    });

    // 2. CAC CO CHE DANH THUC TREN MOBILE (PAGESHOW + FOCUS + TOUCHSTART)
    const forceCheckUpdate = () => {
      try { reg.update(); } catch (e) {}
    };

    window.addEventListener('pageshow', forceCheckUpdate);
    window.addEventListener('focus', forceCheckUpdate);
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') forceCheckUpdate();
    });

    let lastTouchCheck = 0;
    window.addEventListener('touchstart', () => {
      const now = Date.now();
      if (now - lastTouchCheck > 15000) {
        lastTouchCheck = now;
        forceCheckUpdate();
      }
    }, { passive: true });

    // 3. THUAT TOAN HAI DANG: CHECK VERSION.JSON KET HOP
    checkVersionJson();
    setInterval(checkVersionJson, 15000); // Tu dong quet ngam moi 15 giay

  }).catch(err => console.error(err));

  // 4. CHUYEN TRANG BE GAY CACHE KHI WORKER MOI LEN NAM QUYEN
  let isRefreshing = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!isRefreshing) {
      isRefreshing = true;
      window.location.href = window.location.pathname + '?_up=' + Date.now();
    }
  });
}

// --------------------------------------------------------------------------
// CAC HAM HO TRO XU LY
// --------------------------------------------------------------------------

// Ham kiem tra file version.json doc lap tren GitHub
async function checkVersionJson() {
  try {
    const res = await fetch('./version.json?t=' + Date.now(), { cache: 'no-store' });
    const data = await res.json();
    const serverVersion = data.version;
    const localVersion = localStorage.getItem('thanh_nguyen_app_version');

    if (localVersion && localVersion !== serverVersion) {
      triggerUpdateUI(null, serverVersion);
    }
  } catch(e) {}
}

function trackWorkerState(worker) {
  if (!worker) return;
  worker.addEventListener('statechange', () => {
    if (worker.state === 'installed' && navigator.serviceWorker.controller) {
      triggerUpdateUI(worker);
    }
  });
}

// KICH HOAT NUT CAP NHAT DO VF5 VA XU LY CLICK BE GAY CACHE
function triggerUpdateUI(waitingWorker, newVersion = null) {
  const installBtn = document.getElementById('pwaInstallBtn');
  // Chong hien thi 2 lan neu ca SW lan Version.json cung goi
  if (!installBtn || installBtn.dataset.updating === 'true') return;
  installBtn.dataset.updating = 'true'; 

  installBtn.style.display = 'flex';
  installBtn.style.background = 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)';
  installBtn.style.borderColor = '#ef4444';
  installBtn.style.boxShadow = '0 4px 15px rgba(220, 38, 38, 0.5)';

  const textSpan = installBtn.querySelector('.install-text');
  if (textSpan) {
    textSpan.innerText = 'CẬP NHẬT';
    textSpan.style.color = '#ffffff';
  }

  const iconImg = installBtn.querySelector('.install-icon-img');
  if (iconImg) iconImg.style.display = 'none';

  const newBtn = installBtn.cloneNode(true);
  installBtn.parentNode.replaceChild(newBtn, installBtn);

  // KHI KHACH BAM NUT: DIET CACHE & CHUYEN TRANG TIMESTAMP
  newBtn.addEventListener('click', async () => {
    if (navigator.vibrate) navigator.vibrate([30, 50, 30]);
    newBtn.querySelector('.install-text').innerText = 'ĐANG TẢI...';

    // A. Quet sach toan bo CacheStorage cu
    if ('caches' in window) {
      try {
        const keys = await caches.keys();
        await Promise.all(keys.map(k => caches.delete(k)));
      } catch (e) {}
    }

    // B. Luu version moi nhat (neu do version.json goi)
    if (newVersion) {
      localStorage.setItem('thanh_nguyen_app_version', newVersion);
    }

    // C. Giet Service Worker cu de ban moi len thay
    if (waitingWorker) {
      waitingWorker.postMessage('SKIP_WAITING');
    }

    // D. CHUYEN TRANG EP BUOC VOI TIMESTAMP DE TRINH DUYET KHONG DUNG URL CU
    setTimeout(() => {
      window.location.href = window.location.pathname + '?_up=' + Date.now();
    }, 400);
  });
}
