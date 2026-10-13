// ==========================================================================
// GEO-SEARCH.JS - DỊCH ĐỊA CHỈ TIẾNG VIỆT RA TỌA ĐỘ GPS (PHOTON / OSM)
// ==========================================================================

export function initAddressAutocomplete(inputId, onSelectCallback, getCurrentCoordsFn) {
  const inputEl = document.getElementById(inputId);
  if (!inputEl) return;

  // Khởi tạo khung dropdown gợi ý
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

    // Chờ 300ms sau khi ngừng gõ mới gửi request
    debounceTimer = setTimeout(async () => {
      try {
        let lat = '20.4288';
        let lon = '106.1685';

        if (typeof getCurrentCoordsFn === 'function') {
          try {
            const coords = getCurrentCoordsFn();
            if (coords && coords.lat && coords.lon) {
              lat = parseFloat(coords.lat).toFixed(5);
              lon = parseFloat(coords.lon).toFixed(5);
            }
          } catch (e) {}
        }

        // DÙNG countrycode=vn THAY VI bbox ĐỂ TRÁNH LỖI HTTP 400 BAD REQUEST
        const url = `https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&lat=${lat}&lon=${lon}&countrycode=vn&limit=5&lang=vi`;
        
        const res = await fetch(url);
        if (!res.ok) {
          dropdown.style.display = 'none';
          return;
        }

        const data = await res.json();
        dropdown.innerHTML = '';

        if (data && data.features && data.features.length > 0) {
          dropdown.style.display = 'block';

          data.features.forEach((feature) => {
            const props = feature.properties || {};
            const coords = feature.geometry.coordinates; // [lon, lat]

            const mainTitle = props.name || props.street || props.housenumber || query;

            const rawParts = [
              props.housenumber ? `Số ${props.housenumber}` : null,
              props.street && props.street !== props.name ? props.street : null,
              props.district || props.suburb || props.locality,
              props.city || props.county || props.state
            ].filter(Boolean);

            const cleanParts = rawParts.filter((part, index, self) => {
              return part !== mainTitle && self.indexOf(part) === index;
            });

            const subLabel = cleanParts.join(', ');
            const displayFull = cleanParts.length > 0 ? `${mainTitle}, ${subLabel}` : mainTitle;

            const itemEl = document.createElement('div');
            itemEl.className = 'geo-autocomplete-item';
            itemEl.innerHTML = `
              <div style="font-weight: 700; color: #dfb76c; font-size: 13px;">${mainTitle}</div>
              <div style="font-size: 11px; color: #94a3b8; margin-top: 2px; line-height: 1.3;">${subLabel || displayFull}</div>
            `;

            itemEl.addEventListener('click', () => {
              inputEl.value = displayFull;
              dropdown.style.display = 'none';
              dropdown.innerHTML = '';

              onSelectCallback({
                lat: coords[1],
                lon: coords[0],
                name: displayFull
              });
            });

            dropdown.appendChild(itemEl);
          });
        } else {
          dropdown.style.display = 'none';
        }
      } catch (err) {
        dropdown.style.display = 'none';
      }
    }, 300);
  });

  // Đóng dropdown khi click ra ngoài
  document.addEventListener('click', (e) => {
    if (!inputEl.contains(e.target) && !dropdown.contains(e.target)) {
      dropdown.style.display = 'none';
    }
  });
}
