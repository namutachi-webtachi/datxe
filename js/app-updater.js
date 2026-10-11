// ==========================================================================
// APP-UPDATER.JS - HE THONG CAP NHAT REALTIME QUA VERSION.JSON
// ==========================================================================

export function initAppUpdater() {
  // 1. Kiem tra phien ban ngay khi vua mo app
  checkLatestVersion();

  // 2. Kiem tra lai moi khi khach mo lai tu che do nen hoac mo khoa man hinh
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      checkLatestVersion();
    }
  });

  // 3. TU DONG QUET NGAM MOI 15 GIAY (Khach ngoi yen van tu bat nut Cap Nhat!)
  setInterval(() => {
    checkLatestVersion();
  }, 15000); // 15000 mili-giay = 15 giay
}

async function checkLatestVersion() {
  try {
    const res = await fetch('./version.json?t=' + Date.now(), { cache: 'no-store' });
    const data = await res.json();
    const serverVersion = data.version;
    const localVersion = localStorage.getItem('thanh_nguyen_app_version');

    // Neu version tren GitHub khac voi version trong may khach
    if (localVersion && localVersion !== serverVersion) {
      console.log('[System] Phat hien phien ban moi:', serverVersion);
      showUpdateButton(serverVersion);
    }
  } catch (err) {}
}

function showUpdateButton(newVersion) {
  const installBtn = document.getElementById('pwaInstallBtn');
  if (!installBtn) return;

  // Ep nut hien thi tro lai va doi sang mau Do Canh Bao
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

  const newBtn = installBtn.cloneNode(true);
  installBtn.parentNode.replaceChild(newBtn, installBtn);

  newBtn.addEventListener('click', async () => {
    if (navigator.vibrate) navigator.vibrate([30, 50, 30]);
    newBtn.querySelector('.install-text').innerText = 'ĐANG TẢI...';
    
    // Xoa sach Cache cu
    if ('caches' in window) {
      const keys = await caches.keys();
      await Promise.all(keys.map(k => caches.delete(k)));
    }

    localStorage.setItem('thanh_nguyen_app_version', newVersion);

    // F5 trang lay ngay file moi nhat
    setTimeout(() => {
      window.location.reload(true);
    }, 200);
  });
}
