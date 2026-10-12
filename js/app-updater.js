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

// KICH HOAT NUT CAP NHAT ĐỒNG BỘ VỚI ICON TẢI APP
function triggerUpdateUI(waitingWorker, newVersion = null) {
  const installBtn = document.getElementById('pwaInstallBtn');
  if (!installBtn || installBtn.dataset.updating === 'true') return;
  installBtn.dataset.updating = 'true'; 

  // 1. Giu nguyen form nut, chi doi nen sang tone Do Canh Bao (Trong suot sang sang)
  installBtn.style.display = 'flex';
  installBtn.style.background = 'linear-gradient(135deg, rgba(220, 38, 38, 0.12) 0%, rgba(153, 27, 27, 0.05) 100%)';
  installBtn.style.borderColor = 'rgba(220, 38, 38, 0.5)';
  installBtn.style.boxShadow = '0 4px 15px rgba(220, 38, 38, 0.3)';

  // 2. Doi chu thanh CAP NHAT (Mau do VF5)
  const textSpan = installBtn.querySelector('.install-text');
  if (textSpan) {
    textSpan.innerText = 'CẬP NHẬT';
    textSpan.style.color = '#ef4444';
  }

  // 3. PHEP THUAT CSS: Bien Icon Vang thanh Icon Do + Hieu ung dap nhip tim
  const iconImg = installBtn.querySelector('.install-icon-img');
  if (iconImg) {
    iconImg.style.display = 'block';
    // Xoay quang pho mau tu Vang (-45 do) ve Do, tang bao hoa mau cuc dai
    iconImg.style.filter = 'hue-rotate(-45deg) saturate(300%) drop-shadow(0 2px 6px rgba(220, 38, 38, 0.8))';
    iconImg.style.animation = 'iconHeartbeat 1.2s infinite alternate';
  }

  // 4. Bom Keyframe CSS nhip tim vao HTML neu chua co
  if (!document.getElementById('iconKeyframes')) {
    const style = document.createElement('style');
    style.id = 'iconKeyframes';
    style.innerHTML = `@keyframes iconHeartbeat { from { transform: scale(0.95); filter: hue-rotate(-45deg) saturate(300%) drop-shadow(0 0 2px rgba(220, 38, 38, 0.5)); } to { transform: scale(1.1); filter: hue-rotate(-45deg) saturate(300%) drop-shadow(0 0 10px rgba(220, 38, 38, 0.9)); } }`;
    document.head.appendChild(style);
  }

  // 5. Clone node de xoa toan bo listener cu
  const newBtn = installBtn.cloneNode(true);
  installBtn.parentNode.replaceChild(newBtn, installBtn);

  // 6. Su kien khi bam CẬP NHẬT
  newBtn.addEventListener('click', async () => {
    if (navigator.vibrate) navigator.vibrate([30, 50, 30]);
    
    // Doi style sang Dang tai (Mau Vang)
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
