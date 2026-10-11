// ==========================================================================
// APP-UPDATER.JS - LANG NGHE TONG DAI BROADCAST CHANNEL
// ==========================================================================

export function initAppUpdater() {
  if (!('BroadcastChannel' in window)) return;

  // Mo kenh lang nghe cung ten voi Service Worker
  const updateChannel = new BroadcastChannel('pwa_update_channel');
  let isUpdateShowing = false;

  updateChannel.onmessage = (event) => {
    if (event.data.type === 'UPDATE_AVAILABLE' && !isUpdateShowing) {
      isUpdateShowing = true;
      console.log('Nhan tin hieu tu SW: Co code moi!');
      showUpdateButton();
    }
  };
}

function showUpdateButton() {
  const installBtn = document.getElementById('pwaInstallBtn');
  if (!installBtn) return;

  // 1. Ep hien nut len, doi mau Do VF5 canh bao
  installBtn.style.display = 'flex';
  installBtn.style.background = 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)';
  installBtn.style.borderColor = '#ef4444';
  installBtn.style.boxShadow = '0 4px 15px rgba(220, 38, 38, 0.4)';
  
  // 2. Doi chu thanh CAP NHAT
  const textSpan = installBtn.querySelector('.install-text');
  if (textSpan) {
    textSpan.innerText = 'CẬP NHẬT';
    textSpan.style.color = '#ffffff';
  }

  // 3. Reset su kien bang cach nhan ban nut
  const newBtn = installBtn.cloneNode(true);
  installBtn.parentNode.replaceChild(newBtn, installBtn);

  // 4. Khi khach bam vao: F5 ngay lap tuc de an ban moi nhat tu Cache
  newBtn.addEventListener('click', () => {
    if (navigator.vibrate) navigator.vibrate([30, 50, 30]);
    newBtn.querySelector('.install-text').innerText = 'ĐANG TẢI...';
    
    // Khong can cho doi, vi file moi da nam san trong Cache roi, F5 phat la len luon!
    setTimeout(() => {
      window.location.reload(true);
    }, 150);
  });
}
