// ==========================================================================
// APP-UPDATER.JS - HE THONG EP CAP NHAT TICH HOP VAO NUT HEADER
// ==========================================================================

export function initAppUpdater() {
  if (!('serviceWorker' in navigator)) return;

  let newWorker;

  // Dang ky va lang nghe khi co file code moi tren GitHub
  navigator.serviceWorker.register('./sw.js').then((reg) => {
    reg.addEventListener('updatefound', () => {
      newWorker = reg.installing;
      
      newWorker.addEventListener('statechange', () => {
        // Neu co ban moi tai ve xong va dang nam cho (waiting)
        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
          
          console.log('Phat hien ban moi! Dang bien hinh nut Tai App thanh nut Cap Nhat...');
          
          const installBtn = document.getElementById('pwaInstallBtn');
          if (installBtn) {
            // 1. Ep nut hien thi tro lai (ke ca khi khach da cai app va nut bi an)
            installBtn.style.display = 'flex';
            
            // 2. Doi mau nut sang Do VF5 de gay chu y
            installBtn.style.background = 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)';
            installBtn.style.borderColor = '#ef4444';
            
            // 3. Doi chu thanh CAP NHAT
            const textSpan = installBtn.querySelector('.install-text');
            if (textSpan) {
              textSpan.innerText = 'CẬP NHẬT';
              textSpan.style.color = '#ffffff';
            }

            // 4. Reset toan bo su kien click cu (bang cach clone node) de ep chay lenh Update
            const newBtn = installBtn.cloneNode(true);
            installBtn.parentNode.replaceChild(newBtn, installBtn);

            // 5. Gan lenh moi: Bam vao la F5 update app
            newBtn.addEventListener('click', () => {
              if (navigator.vibrate) navigator.vibrate([30, 50, 30]);
              newBtn.querySelector('.install-text').innerText = 'ĐANG TẢI...';
              
              if (newWorker) {
                newWorker.postMessage('SKIP_WAITING');
              }
            });
          }
        }
      });
    });
  });

  // Lang nghe khi Service Worker moi da len nam quyen -> Tu dong F5 muot ma
  let refreshing = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!refreshing) {
      refreshing = true;
      window.location.reload();
    }
  });
}
