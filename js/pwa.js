let deferredPrompt = null;

// Tao khung giao dien Banner Cai App bang ma nguon sach
function createInstallBanner() {
  const banner = document.createElement('div');
  banner.id = 'pwaInstallBanner';
  banner.style.cssText = `
    position: fixed;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%) translateY(150%);
    width: calc(100% - 32px);
    max-width: 420px;
    background: linear-gradient(145deg, #0d1b2a 0%, #07111b 100%);
    border: 1px solid rgba(223, 183, 108, 0.5);
    border-radius: 12px;
    padding: 14px 16px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    box-shadow: 0 15px 35px rgba(0, 0, 0, 0.9), 0 0 20px rgba(223, 183, 108, 0.15);
    z-index: 10000;
    transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  `;

  banner.innerHTML = `
    <div style="display: flex; align-items: center; gap: 10px;">
      <img src="./assets/logo.png" style="width: 38px; height: 38px; object-fit: contain; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.8));">
      <div>
        <div style="color: #dfb76c; font-size: 13px; font-weight: 800; letter-spacing: 0.5px;">CÀI ĐẶT ỨNG DỤNG</div>
        <div style="color: #94a3b8; font-size: 11px;">Thêm vào màn hình để đặt xe nhanh 1 chạm</div>
      </div>
    </div>
    <div style="display: flex; align-items: center; gap: 6px;">
      <button id="btnPwaDismiss" style="background: transparent; border: none; color: #64748b; font-size: 11px; padding: 6px; cursor: pointer;">ĐỂ SAU</button>
      <button id="btnPwaInstall" style="background: linear-gradient(135deg, #f7e0a3 0%, #dfb76c 100%); color: #060e18; border: none; font-size: 11px; font-weight: 800; padding: 8px 12px; border-radius: 6px; cursor: pointer;">CÀI ĐẶT</button>
    </div>
  `;

  document.body.appendChild(banner);

  // Xu ly nut Bam Cai Dat
  document.getElementById('btnPwaInstall').addEventListener('click', async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        banner.style.transform = 'translateX(-50%) translateY(150%)';
      }
      deferredPrompt = null;
    } else {
      // Huong dan danh rieng cho iPhone Safari
      alert('Tren iPhone: Bam vao bieu tuong Chia se (Share o duoi trinh duyet) -> Chon "Them vao Man hinh chinh" (Add to Home Screen)');
    }
  });

  // Xu ly nut De Sau
  document.getElementById('btnPwaDismiss').addEventListener('click', () => {
    banner.style.transform = 'translateX(-50%) translateY(150%)';
    sessionStorage.setItem('pwa_banner_dismissed', 'true');
  });

  return banner;
}

// 1. DANG KY SERVICE WORKER
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('./sw.js').catch(() => {});
}

// 2. BAT SU KIEN CO THE CAI APP TREN ANDROID / CHROME
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;

  if (sessionStorage.getItem('pwa_banner_dismissed') === 'true') {
    return;
  }

  // Tao va hien thi Banner sau 1 giay de tao bat ngo
  setTimeout(() => {
    const banner = document.getElementById('pwaInstallBanner') || createInstallBanner();
    banner.style.transform = 'translateX(-50%) translateY(0)';
  }, 1000);
});

// 3. HO TRO IPHONE SAFARI (Hien thi sau 2 giay neu la iOS va chua cai app)
const isIos = /iphone|ipad|ipod/.test(window.navigator.userAgent.toLowerCase());
const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;

if (isIos && !isStandalone && sessionStorage.getItem('pwa_banner_dismissed') !== 'true') {
  setTimeout(() => {
    const banner = document.getElementById('pwaInstallBanner') || createInstallBanner();
    banner.style.transform = 'translateX(-50%) translateY(0)';
  }, 2000);
}
