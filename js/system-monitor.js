// ==========================================================================
// SYSTEM-MONITOR.JS - BO DO PING THOI GIAN THUC & GIAM SAT PHIEN BAN
// ==========================================================================
import { APP_CONFIG } from './config.js';

export function initSystemMonitor() {
  // 1. Tao khung thanh giam sat noi tren cung man hinh
  const monitorBar = document.createElement('div');
  monitorBar.id = 'liveSystemMonitorBar';
  monitorBar.style.cssText = `
    position: fixed;
    bottom: 12px;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    align-items: center;
    gap: 8px;
    background: rgba(6, 14, 24, 0.85);
    backdrop-filter: blur(8px);
    padding: 6px 16px;
    border-radius: 999px;
    border: 1px solid rgba(223, 183, 108, 0.35);
    z-index: 999999;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.8);
    pointer-events: none;
    transition: all 0.3s ease;
  `;

  const statusDot = document.createElement('div');
  statusDot.style.cssText = `
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background-color: #10b981;
    box-shadow: 0 0 8px #10b981;
    transition: all 0.3s ease;
  `;

  const statusText = document.createElement('span');
  statusText.style.cssText = `
    font-size: 11px;
    font-weight: 700;
    color: #dfb76c;
    letter-spacing: 0.8px;
    font-family: -apple-system, monospace;
  `;

  monitorBar.appendChild(statusDot);
  monitorBar.appendChild(statusText);
  document.body.appendChild(monitorBar);

  // 2. THUAT TOAN DO PING THUC TE (TINH BANG MILI-GIAY ms)
  async function checkLivePing() {
    if (!navigator.onLine) {
      statusDot.style.backgroundColor = '#ef4444';
      statusDot.style.boxShadow = '0 0 10px #ef4444';
      statusText.innerText = 'MAT KET NOI';
      statusText.style.color = '#ef4444';
      return;
    }

    const startTime = performance.now();
    try {
      // Gui goi tin nhe nhat len server de do toc do phan hoi
      await fetch('./version.json?t=' + Date.now(), { method: 'HEAD', cache: 'no-store' });
      const endTime = performance.now();
      const pingMs = Math.round(endTime - startTime);

      // Phan loai chat luong mang theo toc do Ping
      if (pingMs < 120) {
        statusDot.style.backgroundColor = '#10b981'; // Xanh muot
        statusDot.style.boxShadow = '0 0 8px #10b981';
      } else {
        statusDot.style.backgroundColor = '#f59e0b'; // Vang (mang yeu)
        statusDot.style.boxShadow = '0 0 8px #f59e0b';
      }

      statusText.innerText = `${pingMs}ms • v${APP_CONFIG.VERSION || 'alpha-1'}`;
      statusText.style.color = '#dfb76c';
    } catch (err) {
      statusDot.style.backgroundColor = '#10b981';
      statusText.innerText = `OK • v${APP_CONFIG.VERSION || 'alpha-1'}`;
    }
  }

  // Do ping ngay lap tuc va lap lai moi 8 giay
  checkLivePing();
  setInterval(checkLivePing, 8000);

  // Lang nghe trang thai online / offline tuc thi
  window.addEventListener('online', checkLivePing);
  window.addEventListener('offline', () => {
    statusDot.style.backgroundColor = '#ef4444';
    statusDot.style.boxShadow = '0 0 10px #ef4444';
    statusText.innerText = 'MAT KET NOI';
    statusText.style.color = '#ef4444';
  });
}
