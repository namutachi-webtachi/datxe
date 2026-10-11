// ==========================================================================
// MODULE PWA INSTALL - GIAO DIEN TAI APP "CHUYEN CO MAT DAT"
// ==========================================================================

let deferredPrompt;
const PWA_DISMISSED_KEY = 'thanh_nguyen_pwa_dismissed';

function createInstallBanner() {
  // Khong hien thi neu khach da bam "Bo qua" truoc do
  if (sessionStorage.getItem(PWA_DISMISSED_KEY) === 'true') return;

  const banner = document.createElement('div');
  banner.id = 'luxuryPwaBanner';
  
  // Style cho Banner (Truot tu duoi len, mau den tuyen vien vang)
  banner.style.cssText = `
    position: fixed;
    bottom: 30px;
    left: 50%;
    transform: translate(-50%, 150%);
    width: 90%;
    max-width: 400px;
    background: linear-gradient(145deg, #0d1b2a 0%, #07111b 100%);
    border: 1px solid rgba(223, 183, 108, 0.4);
    border-radius: 16px;
    padding: 16px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.9), 0 0 20px rgba(223, 183, 108, 0.15);
    z-index: 10000;
    transition: transform 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  `;

  banner.innerHTML = `
    <div style="display: flex; align-items: center; gap: 12px;">
      <div style="width: 42px; height: 42px; border-radius: 10px; background: #060e18; border: 1px solid rgba(223, 183, 108, 0.3); display: flex; justify-content: center; align-items: center; overflow: hidden;">
        <img src="./assets/logo.png" style="width: 80%; height: auto; object-fit: contain;">
      </div>
      <div style="display: flex; flex-direction: column; gap: 4px;">
        <div style="color: #dfb76c; font-size: 14px; font-weight: 800; letter-spacing: 0.5px; text-transform: uppercase;">CAI DAT UNG DUNG</div>
        <div style="color: #94a3b8; font-size: 11px;">Them vao man hinh chinh de dat xe</div>
      </div>
    </div>
    <div style="display: flex; align-items: center; gap: 8px;">
      <button id="btnPwaClose" style="background: transparent; border: none; color: #64748b; font-size: 20px; cursor: pointer; padding: 0 5px;">&times;</button>
      <button id="btnPwaInstall" style="background: linear-gradient(135deg, #fbe8b5 0%, #dfb76c 100%); color: #060e18; border: none; font-size: 12px; font-weight: 800; padding: 8px 16px; border-radius: 8px; cursor: pointer; text-transform: uppercase; box-shadow: 0 4px 10px rgba(223, 183, 108, 0.3);">TAI APP</button>
    </div>
  `;

  document.body.appendChild(banner);

  // Xu ly tat banner
  document.getElementById('btnPwaClose').addEventListener('click', () => {
    banner.style.transform = 'translate(-50%, 150%)';
    sessionStorage.setItem(PWA_DISMISSED_KEY, 'true');
  });

  // Xu ly bam Tai App
  document.getElementById('btnPwaInstall').addEventListener('click', async () => {
    if (deferredPrompt) {
      // Hien thi bang cai dat cua Android/Chrome
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        banner.style.transform = 'translate(-50%, 150%)';
      }
      deferredPrompt = null;
    } else {
      // Huong dan danh rieng cho iPhone Safari
      alert('TREN IPHONE: Ban hay bam vao bieu tuong Chia se o day man hinh, sau do chon "Them vao MH Chinh" (Add to Home Screen) nhe!');
    }
  });

  // Hieu ung truot len sau 1 giay tao su bat ngo
  setTimeout(() => {
    banner.style.transform = 'translate(-50%, 0)';
  }, 1000);
}

// 1. LANG NGHE SU KIEN SAN SANG CAI DAT (ANDROID / CHROME)
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  // Chi hien banner khi trinh duyet da cho phep cai
  if (!document.getElementById('luxuryPwaBanner')) {
    createInstallBanner();
  }
});

// 2. KICH HOAT THU CONG CHO IPHONE (Vi Safari khong ho tro beforeinstallprompt)
const isIos = /iphone|ipad|ipod/.test(window.navigator.userAgent.toLowerCase());
const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;

if (isIos && !isStandalone) {
  window.addEventListener('DOMContentLoaded', () => {
    if (!document.getElementById('luxuryPwaBanner')) {
      createInstallBanner();
    }
  });
}
