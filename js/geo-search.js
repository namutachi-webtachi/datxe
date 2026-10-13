// ==========================================================================
// GEO-SEARCH.JS - DUNG CLOUDFLARE WORKER & CONSOLE LOG VIP
// ==========================================================================

const WORKER_URL = 'https://taxi-search-api.nnam14884.workers.dev';

// CSS Style cho Console
const styleOk = 'color: #10b981; font-weight: bold; background: #060e18; padding: 2px 6px; border: 1px solid #10b981; border-radius: 4px;';
const styleErr = 'color: #ef4444; font-weight: bold; background: #060e18; padding: 2px 6px; border: 1px solid #ef4444; border-radius: 4px;';
const styleWarn = 'color: #f59e0b; font-weight: bold; background: #060e18; padding: 2px 6px; border: 1px solid #f59e0b; border-radius: 4px;';

export function initAddressAutocomplete(inputId, onSelectCallback, getCurrentCoordsFn) {
  const inputEl = document.getElementById(inputId);
  if (!inputEl) return;

  let dropdown = inputEl.parentNode.querySelector('.geo-autocomplete-dropdown');
  if (!dropdown) {
    dropdown = document.createElement('div');
    dropdown.className = 'geo-autocomplete-dropdown';
    inputEl.parentNode.appendChild(dropdown);
  }

  let debounceTimer = null;

  inputEl.addEventListener('input', () => {
    const query = inputEl.value.trim();
    clearTimeout(debounceTimer);

    if (query.length < 2) {
      dropdown.style.display = 'none';
      dropdown.innerHTML = '';
      return;
    }

    debounceTimer = setTimeout(async () => {
      try {
        let lat = 20.4288;
        let lon = 106.1685;

        if (typeof getCurrentCoordsFn === 'function') {
          try {
            const coords = getCurrentCoordsFn();
            if (coords && coords.lat && coords.lon) {
              lat = parseFloat(coords.lat).toFixed(4);
              lon = parseFloat(coords.lon).toFixed(4);
            }
          } catch (e) {}
        }

        const url = `${WORKER_URL}/?q=${encodeURIComponent(query)}&lat=${lat}&lon=${lon}&limit=5`;
        console.log(`%c[SEARCH API] Dang gui yeu cau tim: "${query}"...`, styleWarn);

        const res = await fetch(url);
        
        // BAT LOI VA VA THANG VAO CONSOLE
        if (!res.ok) {
          const errText = await res.text();
          console.error(`%c[SEARCH API ERROR] HTTP ${res.status}: ${errText}`, styleErr);
          dropdown.style.display = 'none';
          return;
        }

        const data = await res.json();
        dropdown.innerHTML = '';

        if (data && data.features && data.features.length > 0) {
          console.log(`%c[SEARCH API SUCCESS] Da bat duoc ${data.features.length} ket qua tra ve!`, styleOk);
          dropdown.style.display = 'block';

          data.features.forEach((feature) => {
            const mainTitle = feature.text || feature.place_name.split(',')[0];
            const fullAddress = feature.place_name;
            const coords = feature.center; // [lon, lat]

            const addressParts = fullAddress.split(',');
            const subLabel = addressParts.slice(1).join(',').trim();

            const itemEl = document.createElement('div');
            itemEl.className = 'geo-autocomplete-item';
            itemEl.innerHTML = `
              <div style="font-weight: 700; color: #dfb76c; font-size: 13px;">${mainTitle}</div>
              <div style="font-size: 11px; color: #94a3b8; margin-top: 2px; line-height: 1.3;">${subLabel || fullAddress}</div>
            `;

            itemEl.addEventListener('click', () => {
              inputEl.value = fullAddress;
              dropdown.style.display = 'none';
              dropdown.innerHTML = '';

              onSelectCallback({
                lat: coords[1],
                lon: coords[0],
                name: fullAddress
              });
            });

            dropdown.appendChild(itemEl);
          });
        } else {
          console.log(`%c[SEARCH API EMPTY] Ban do khong tim thay ket qua nao cho: "${query}"`, styleWarn);
          dropdown.style.display = 'none';
        }
      } catch (err) {
        console.error(`%c[SEARCH API CRASH] Loi mang hoac Worker bi sap: ${err.message}`, styleErr);
        dropdown.style.display = 'none';
      }
    }, 300);
  });

  document.addEventListener('click', (e) => {
    if (!inputEl.contains(e.target) && !dropdown.contains(e.target)) {
      dropdown.style.display = 'none';
    }
  });
}
