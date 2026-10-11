import { APP_CONFIG } from './config.js';

export function initSystemMonitor() {
  const monitorBar = document.createElement('div');
  monitorBar.style.cssText = `
    position: fixed;
    bottom: 12px;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    align-items: center;
    gap: 8px;
    background: rgba(6, 14, 24, 0.8);
    backdrop-filter: blur(8px);
    padding: 6px 16px;
    border-radius: 99px;
    border: 1px solid rgba(223, 183, 108, 0.3);
    z-index: 99999; /* Day len tren cung */
    pointer-events: none;
    box-shadow: 0 4px 10px rgba(0,0,0,0.8);
  `;

  const statusDot = document.createElement('div');
  statusDot.style.cssText = `
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background-color: #10b981;
    box-shadow: 0 0 10px #10b981;
  `;

  const statusText = document.createElement('span');
  statusText.style.cssText = `
    font-size: 11px;
    font-weight: 700;
    color: #dfb76c;
    letter-spacing: 1px;
    font-family: -apple-system, sans-serif;
  `;

  monitorBar.appendChild(statusDot);
  monitorBar.appendChild(statusText);
  document.body.appendChild(monitorBar);

  function updateNetworkStatus() {
    if (navigator.onLine) {
      statusDot.style.backgroundColor = '#10b981';
      statusDot.style.boxShadow = '0 0 10px #10b981';
      statusText.innerText = `PHB: v${APP_CONFIG.VERSION}`;
      statusText.style.color = '#dfb76c';
    } else {
      statusDot.style.backgroundColor = '#ef4444';
      statusDot.style.boxShadow = '0 0 10px #ef4444';
      statusText.innerText = 'MẤT KẾT NỐI';
      statusText.style.color = '#ef4444';
    }
  }

  window.addEventListener('online', updateNetworkStatus);
  window.addEventListener('offline', updateNetworkStatus);
  
  updateNetworkStatus();
}
