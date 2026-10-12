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

// KICH HOAT NUT CAP NHAT ĐỒNG BỘ 1:1 VỚI NÚT TẢI APP
function triggerUpdateUI(waitingWorker, newVersion = null) {
  const installBtn = document.getElementById('pwaInstallBtn');
  if (!installBtn || installBtn.dataset.updating === 'true') return;
  installBtn.dataset.updating = 'true'; 

  // 1. Giu nguyen form nut, chi doi nen sang tone Do Canh Bao
  installBtn.style.display = 'flex';
  installBtn.style.background = 'linear-gradient(135deg, rgba(220, 38, 38, 0.12) 0%, rgba(153, 27, 27, 0.05) 100%)';
  installBtn.style.borderColor = 'rgba(220, 38, 38, 0.5)';

  // 2. Doi chu thanh CAP NHAT (Mau do VF5)
  const textSpan = installBtn.querySelector('.install-text');
  if (textSpan) {
    textSpan.innerText = 'CẬP NHẬT';
    textSpan.style.color = '#ef4444';
  }

  // 3. PHEP THUAT CSS: Bieu tuong Do ruc nhung GIU NGUYEN KICH THUOC 100%
  const iconImg = installBtn.querySelector('.install-icon-img');
  if (iconImg) {
    iconImg.style.display = 'block';
    // Ep cung kich thuoc 32px giong het nut Tai App de khong bi teo top
    iconImg.style.width = '32px';
    iconImg.style.height = '32px';
    // Chuyen mau thanh do va tao hieu ung phat sang
    iconImg.style.animation = 'iconGlow 1.2s infinite alternate';
  }

  // 4. Bom Keyframe CSS chi phat sang (Khong dung transform de tranh loi teo top)
  if (!document.getElementById('iconKeyframes')) {
    const style = document.createElement('style');
    style.id = 'iconKeyframes';
    style.innerHTML = `@keyframes iconGlow { 
      from { filter: hue-rotate(-45deg) saturate(300%) brightness(1.2) drop-shadow(0 0 2px rgba(220, 38, 38, 0.4)); } 
      to { filter: hue-rotate(-45deg) saturate(300%) brightness(1.2) drop-shadow(0 0 14px rgba(220, 38, 38, 1)); } 
    }`;
    document.head.appendChild(style);
  }

  // 5. Clone node de xoa toan bo listener cu
  const newBtn = installBtn.cloneNode(true);
  installBtn.parentNode.replaceChild(newBtn, installBtn);

  // 6. Su kien khi bam CẬP NHẬT
  newBtn.addEventListener('click', async () => {
    if (navigator.vibrate) navigator.vibrate([30, 50, 30]);
    
    // Doi ve trang thai mau Vang Dang Tai
    newBtn.style.background = 'rgba(223, 183, 108, 0.15)';
    newBtn.style.borderColor = 'rgba(223, 183, 108, 0.4)';
    const newText = newBtn.querySelector('.install-text');
    if (newText) {
      newText.innerText = 'ĐANG TẢI...';
      newText.style.color = '#dfb76c';
    }
    const newIcon = newBtn.querySelector('.install-icon-img');
    if (newIcon) {
      newIcon.style.filter = 'drop-shadow(0 2px 4px rgba(0,0,0,0.8))';
      newIcon.style.animation = 'none';
    }

    if ('caches' in window) {
      try {
        const keys = await caches.keys();
        await Promise.all(keys.map(k => caches.delete(k)));
      } catch (e) {}
    }

    if (newVersion) {
      localStorage.setItem('thanh_nguyen_app_version', newVersion);
    }

    if (waitingWorker) {
      waitingWorker.postMessage('SKIP_WAITING');
    }

    setTimeout(() => {
      window.location.href = window.location.pathname + '?_up=' + Date.now();
    }, 300);
  });
}
