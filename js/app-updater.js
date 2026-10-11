// ==========================================================================
// APP-UPDATER.JS - HE THONG CAP NHAT PWA CHUAN QUOC TE
// ==========================================================================

export function initAppUpdater() {
  if (!('serviceWorker' in navigator)) return;

  // 1. DANG KY SERVICE WORKER VA THEO DOI TRANG THAI CHO (WAITING)
  navigator.serviceWorker.register('./sw.js').then((reg) => {
    
    // TRUONG HOP A: Ban cap nhat da tai ve san va dang nam cho (reg.waiting)
    if (reg.waiting) {
      triggerUpdateUI(reg.waiting);
      return;
    }

    // TRUONG HOP B: Ban cap nhat dang trong tien trinh tai ve (reg.installing)
    if (reg.installing) {
      trackWorkerState(reg.installing);
      return;
    }

    // TRUONG HOP C: Phat hien ban cap nhat moi trong tuong lai
    reg.addEventListener('updatefound', () => {
      trackWorkerState(reg.installing);
    });

    // 2. CAC CO CHE DANH THUC TREN MOBILE (PAGESHOW + FOCUS + TOUCHSTART)
    const forceCheckUpdate = () => {
      try {
        reg.update();
      } catch (e) {}
    };

    // Khi app tro lai tu che do nen hoac mo khoa man hinh
    window.addEventListener('pageshow', forceCheckUpdate);
    window.addEventListener('focus', forceCheckUpdate);
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        forceCheckUpdate();
      }
    });

    // Khi khach cham tay vao man hinh (gioi han 15 giay check 1 lan)
    let lastTouchCheck = 0;
    window.addEventListener('touchstart', () => {
      const now = Date.now();
      if (now - lastTouchCheck > 15000) {
        lastTouchCheck = now;
        forceCheckUpdate();
      }
    }, { passive: true });

  }).catch((err) => {
    console.error('[System] Loi dang ky SW:', err);
  });

  // 3. LANG NGHE KHI WORKER MOI CHIEM QUYEN DE F5 TRANG
  let isRefreshing = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!isRefreshing) {
      isRefreshing = true;
      window.location.reload();
    }
  });
}

// Theo doi tien trinh tai cua Worker moi
function trackWorkerState(worker) {
  if (!worker) return;
  worker.addEventListener('statechange', () => {
    if (worker.state === 'installed' && navigator.serviceWorker.controller) {
      triggerUpdateUI(worker);
    }
  });
}

// Kich hoat bien hinh nut Tai App thanh nut Cap Nhat Do VF5
function triggerUpdateUI(waitingWorker) {
  const installBtn = document.getElementById('pwaInstallBtn');
  if (!installBtn) return;

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
  if (iconImg) {
    iconImg.style.display = 'none';
  }

  // Clone node de xoa toan bo listener cu
  const newBtn = installBtn.cloneNode(true);
  installBtn.parentNode.replaceChild(newBtn, installBtn);

  // Bam vao la ra lenh cho Worker chiem quyen tuc thi
  newBtn.addEventListener('click', () => {
    if (navigator.vibrate) navigator.vibrate([30, 50, 30]);
    newBtn.querySelector('.install-text').innerText = 'ĐANG TẢI...';
    
    if (waitingWorker) {
      waitingWorker.postMessage('SKIP_WAITING');
    }
  });
}
