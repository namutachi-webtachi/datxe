// ==========================================================================
// APP-UPDATER.JS - HE THONG THONG BAO CAP NHAT CHUAN GOOGLE PWA
// ==========================================================================

export function initAppUpdater() {
  if (!('serviceWorker' in navigator)) return;

  let newWorker;

  // 1. Dang ky va lang nghe su thay doi cua file sw.js
  navigator.serviceWorker.register('./sw.js').then((reg) => {
    reg.addEventListener('updatefound', () => {
      newWorker = reg.installing;
      
      newWorker.addEventListener('statechange', () => {
        // Khi ban moi da tai ve xong va dang nam o trang thai cho (waiting)
        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
          console.log('[System] Phat hien ban cap nhat moi tren GitHub!');
          showUpdateButton(newWorker);
        }
      });
    });
  }).catch((err) => {
    console.error('[System] Loi dang ky Service Worker:', err);
  });

  // 2. Lang nghe khi ban code moi chiem quyen thanh cong -> F5 lai man hinh
  let refreshing = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!refreshing) {
      refreshing = true;
      window.location.reload();
    }
  });
}

// 3. Ham bien hinh nut Tai App thanh nut Cap Nhat mau do
function showUpdateButton(newWorker) {
  const installBtn = document.getElementById('pwaInstallBtn');
  if (!installBtn) return;

  // Ep hien nut len, doi mau thanh Do VF5 canh bao
  installBtn.style.display = 'flex';
  installBtn.style.background = 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)';
  installBtn.style.borderColor = '#ef4444';
  installBtn.style.boxShadow = '0 4px 15px rgba(220, 38, 38, 0.4)';
  
  const textSpan = installBtn.querySelector('.install-text');
  if (textSpan) {
    textSpan.innerText = 'CẬP NHẬT';
    textSpan.style.color = '#ffffff';
  }

  const iconImg = installBtn.querySelector('.install-icon-img');
  if (iconImg) {
    iconImg.style.display = 'none'; // An icon tai app di de tap trung vao chu
  }

  // Clone node de xoa toan bo cac su kien click cu cua nut Tai App
  const newBtn = installBtn.cloneNode(true);
  installBtn.parentNode.replaceChild(newBtn, installBtn);

  // Gan su kien click moi: Ra lenh cho Service Worker tiep quan
  newBtn.addEventListener('click', () => {
    if (navigator.vibrate) navigator.vibrate([30, 50, 30]);
    newBtn.querySelector('.install-text').innerText = 'ĐANG TẢI...';
    
    // Ban tin hieu cho SW moi biet la khach da bam nut, tien hanh giet ban cu!
    if (newWorker) {
      newWorker.postMessage('SKIP_WAITING');
    }
  });
}
