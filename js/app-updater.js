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

// KICH HOAT NUT CAP NHAT TINH TE - SANG CHANG - NHO GON
function triggerUpdateUI(waitingWorker, newVersion = null) {
  const installBtn = document.getElementById('pwaInstallBtn');
  if (!installBtn || installBtn.dataset.updating === 'true') return;
  installBtn.dataset.updating = 'true'; 

  // 1. Dinh dang lai thanh mot chiec the "Pill" nho gon, kinh mo the thao
  installBtn.style.cssText = `
    display: flex;
    align-items: center;
    gap: 6px;
    background: rgba(220, 38, 38, 0.12); /* Nen do trong suot 12% */
    border: 1px solid rgba(220, 38, 38, 0.4);
    padding: 6px 12px;
    border-radius: 99px;
    cursor: pointer;
    backdrop-filter: blur(8px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
    transition: all 0.2s ease;
  `;

  // 2. Tao hieu ung dau cham do nhap nhay + Chu nho gon
  installBtn.innerHTML = `
    <div style="width: 6px; height: 6px; border-radius: 50%; background-color: #ef4444; box-shadow: 0 0 8px #ef4444; animation: updateBlink 1s infinite alternate;"></div>
    <span style="font-size: 11px; font-weight: 700; color: #f8fafc; letter-spacing: 0.5px; margin-top: 1px;">CẬP NHẬT</span>
  `;

  // 3. Bom Keyframe CSS nhap nhay vao thang HTML (Neu chua co)
  if (!document.getElementById('updateKeyframes')) {
    const style = document.createElement('style');
    style.id = 'updateKeyframes';
    style.innerHTML = `@keyframes updateBlink { from { opacity: 0.4; transform: scale(0.8); } to { opacity: 1; transform: scale(1.3); } }`;
    document.head.appendChild(style);
  }

  // 4. Clone de xoa sach su kien cu
  const newBtn = installBtn.cloneNode(true);
  installBtn.parentNode.replaceChild(newBtn, installBtn);

  // 5. Hieu ung khi khach bam vao: Doi sang mau Vang Kim bao hieu dang xu ly
  newBtn.addEventListener('click', async () => {
    if (navigator.vibrate) navigator.vibrate([20, 30, 20]);
    
    // Doi style sang Dang tai (Mau Vang)
    newBtn.style.background = 'rgba(223, 183, 108, 0.15)';
    newBtn.style.borderColor = 'rgba(223, 183, 108, 0.4)';
    newBtn.innerHTML = `
      <div style="width: 6px; height: 6px; border-radius: 50%; background-color: #dfb76c; box-shadow: 0 0 8px #dfb76c;"></div>
      <span style="font-size: 11px; font-weight: 700; color: #dfb76c; letter-spacing: 0.5px; margin-top: 1px;">ĐANG TẢI...</span>
    `;

    // A. Quet sach toan bo CacheStorage cu trong may
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

    // D. Chuyen trang sau 0.3 giay
    setTimeout(() => {
      window.location.href = window.location.pathname + '?_up=' + Date.now();
    }, 300);
  });
}
