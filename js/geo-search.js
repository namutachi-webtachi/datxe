// ==========================================================================
// GEO-SEARCH.JS - TỐI ƯU UX SIÊU NẢY & TIẾT KIỆM API GOONG (HYBRID 1+3)
// ==========================================================================

const WORKER_URL = 'https://taxi-search-api.nnam14884.workers.dev';

// CSS Style cho Console
const styleOk = 'color: #10b981; font-weight: bold; background: #060e18; padding: 2px 6px; border: 1px solid #10b981; border-radius: 4px;';
const styleErr = 'color: #ef4444; font-weight: bold; background: #060e18; padding: 2px 6px; border: 1px solid #ef4444; border-radius: 4px;';
const styleWarn = 'color: #f59e0b; font-weight: bold; background: #060e18; padding: 2px 6px; border: 1px solid #f59e0b; border-radius: 4px;';
const styleCache = 'color: #3b82f6; font-weight: bold; background: #060e18; padding: 2px 6px; border: 1px solid #3b82f6; border-radius: 4px;';

// 1. BỘ NHỚ ĐỆM CACHE TẠM THỜI (TỐI ƯU 0Đ API)
const searchCache = new Map();

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
  let activeController = null;
  let lastExecutedQuery = '';

  inputEl.addEventListener('input', () => {
    const rawValue = inputEl.value;
    const query = rawValue.trim();

    clearTimeout(debounceTimer);

    // Bỏ qua nếu ngắn hơn 3 ký tự (Cho phép từ ngắn như "Chợ", "Phố", "Ngõ")
    if (query.length < 3) {
      dropdown.style.display = 'none';
      dropdown.innerHTML = '';
      return;
    }

    // Nếu câu gõ trùng khớp với câu vừa search xong -> Không gọi lại
    if (query === lastExecutedQuery) return;

    // =========================================================================
    // MẸO UX: NẾU VỪA BẤM PHÍM CÁCH ' ' (HOÀN THÀNH 1 TỪ) -> SEARCH NGAY 50ms!
    // NẾU ĐANG GÕ DỞ CHỮ -> CHỜ NGẮT TAY 700ms MỚI SEARCH.
    // =========================================================================
    const isWordEnded = rawValue.endsWith(' ');
    const delayTime = isWordEnded ? 50 : 700;

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

        const cacheKey = `${query.toLowerCase()}_${lat}_${lon}`;

        // A. NẾU ĐÃ CÓ TRONG CACHE -> XUẤT HIỆN TỨC THÌ (0ms, 0đ API)
        if (searchCache.has(cacheKey)) {
          console.log(`%c[SEARCH CACHE HIT] Lay ket qua tu Cache cho: "${query}" (0đ API)`, styleCache);
          lastExecutedQuery = query;
          renderDropdown(searchCache.get(cacheKey));
          return;
        }

        // B. HỦY REQUEST CŨ DỞ DANG NẾU KHÁCH TIẾP TỤC GÕ
        if (activeController) {
          activeController.abort();
        }
        activeController = new AbortController();

        const url = `${WORKER_URL}/?q=${encodeURIComponent(query)}&lat=${lat}&lon=${lon}&limit=5`;
        console.log(`%c[SEARCH API] Dang gui yeu cau tim: "${query}"...`, styleWarn);

        const res = await fetch(url, { signal: activeController.signal });

        if (!res.ok) {
          const errText = await res.text();
          console.error(`%c[SEARCH API ERROR] HTTP ${res.status}: ${errText}`, styleErr);
          dropdown.style.display = 'none';
          return;
        }

        const data = await res.json();
        lastExecutedQuery = query;

        // C. LƯU VÀO CACHE CHO LẦN NÀO GÕ LẠI
        if (data && data.features) {
          searchCache.set(cacheKey, data);
        }

        renderDropdown(data);

      } catch (err) {
        if (err.name === 'AbortError') {
          console.log(`%c[SEARCH ABORT] Da huy request cu do khach go tiep`, styleWarn);
        } else {
          console.error(`%c[SEARCH API CRASH] Loi mang hoac Worker bi sap: ${err.message}`, styleErr);
          dropdown.style.display = 'none';
        }
      }
    }, delayTime);
  });

  // HÀM RENDER DROPDOWN KẾT QUẢ GỢI Ý
  function renderDropdown(data) {
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
          lastExecutedQuery = fullAddress.trim();
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
      console.log(`%c[SEARCH API EMPTY] Khong tim thay ket qua`, styleWarn);
      dropdown.style.display = 'none';
    }
  }

  // BẤM RA NGOÀI THÌ ẨN DROPDOWN
  document.addEventListener('click', (e) => {
    if (!inputEl.contains(e.target) && !dropdown.contains(e.target)) {
      dropdown.style.display = 'none';
    }
  });
}
