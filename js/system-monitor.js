// ==========================================================================
// SYSTEM-MONITOR.JS - THEO DOI MANG VA PHIEN BAN
// ==========================================================================
import { APP_CONFIG } from './config.js';

export function initSystemMonitor() {
  // 1. Tao khung UI Giam Sat o day man hinh
  const monitorBar = document.createElement('div');
  monitorBar.style.cssText = `
    position: fixed;
    bottom: 12px;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    align-items: center;
    gap: 6px;
    background: rgba(6, 14, 24, 0.6);
    backdrop-filter: blur(4px);
    padding: 4px 12px;
    border-radius: 99px;
    border: 1px solid rgba(223, 183, 108, 0.15);
    z-index: 1000;
    pointer-events: none;
    transition: all 0.3s ease;
  `;

  const statusDot = document.createElement('div');
  statusDot.style.cssText = `
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background-color: #10b981;
    box-shadow: 0 0 8px #10b981;
    transition: background-color 0.3s ease, box-shadow 0.3s ease;
  `;

  const statusText = document.createElement('span');
  statusText.style.cssText = `
    font-size: 10px;
    font-weight: 600;
    color: rgba(223, 183, 108, 0.7);
    letter-spacing: 0.5px;
    font-family: monospace;
  `;

  monitorBar.appendChild(statusDot);
  monitorBar.appendChild(statusText);
  document.body.appendChild(monitorBar);

  // 2. Ham cap nhat trang thai UI
  function updateNetworkStatus() {
    if (navigator.onLine) {
      statusDot.style.backgroundColor = '#10b981';
      statusDot.style.boxShadow = '0 0 8px #10b981';
      statusText.innerText = `v${APP_CONFIG.VERSION}`;
      statusText.style.color = 'rgba(223, 183, 108, 0.7)';
    } else {
      statusDot.style.backgroundColor = '#ef4444';
      statusDot.style.boxShadow = '0 0 8px #ef4444';
      statusText.innerText = 'MAT KET NOI';
      statusText.style.color = '#ef4444';
    }
  }

  // 3. Lang nghe su kien mang the gioi thuc
  window.addEventListener('online', updateNetworkStatus);
  window.addEventListener('offline', updateNetworkStatus);

  // Khoi tao lan dau
  updateNetworkStatus();
}
