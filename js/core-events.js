// ==========================================================================
// CORE EVENTS - XU LY LOGIC HEADER BOOKING
// ==========================================================================

export function initHeaderEvents() {
  initSecretCacheClear();
  initPwaInstallButton();
}

// 1. CHUC NANG BI MAT: CHAM 5 LAN VAO LOGO DE XOA CACHE
function initSecretCacheClear() {
  const logoBtn = document.getElementById('secretLogo');
  if (!logoBtn) return;

  let tapCount = 0;
  let tapTimer = null;

  logoBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    tapCount++;

    clearTimeout(tapTimer);
    tapTimer = setTimeout(() => {
      tapCount = 0;
    }, 1500);

    if (tapCount >= 5) {
      if (navigator.vibrate) navigator.vibrate([80, 50, 80]);
      localStorage.clear();
      alert('HE THONG: Da xoa sach bo nho Cache. Ung dung se khoi dong lai!');
      window.location.replace('./index.html?reset=1');
    }
  });
}

// 2. CHUC NANG TAI APP: KIEM TRA TRANG THAI VA XU LY CAI DAT
function initPwaInstallButton() {
  const installBtn = document.getElementById('pwaInstallBtn');
  if (!installBtn) return;

  // Kiem tra xem app da duoc cai dat vao may chua
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
  
  if (isStandalone) {
    // NEU DA CAI APP: Diau nut di vinh vien
    installBtn.style.display = 'none';
    return;
  }

  // NEU CHUA CAI: Lang nghe su kien cai dat tu trinh duyet
  let deferredPrompt = null;

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
  });

  // Xu ly khi khach bam vao nut Tai App
  installBtn.addEventListener('click', async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        installBtn.style.display = 'none';
      }
      deferredPrompt = null;
    } else {
      // Huong dan du phong cho iPhone Safari (vi iOS khong ho tro prompt tu dong)
      const isIos = /iphone|ipad|ipod/.test(window.navigator.userAgent.toLowerCase());
      if (isIos) {
        alert('TREN IPHONE: Ban hay bam vao bieu tuong Chia Se o duoi trinh duyet -> Chon "Them vao MH Chinh" nhe!');
      } else {
        alert('Trinh duyet cua ban hien khong ho tro cai dat tu dong hoac ban da cai roi.');
      }
    }
  });
}
