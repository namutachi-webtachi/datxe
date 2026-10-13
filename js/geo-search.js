// ==========================================================================
// GEO-SEARCH.JS - THUẬT TOÁN TÌM KIẾM ĐỊA CHỈ VIỆT NAM LINH HOẠT & CHUẨN XÁC
// ==========================================================================

// Khoanh vung dia ly pham vi Viet Nam (MinLon, MinLat, MaxLon, MaxLat)
const VIETNAM_BBOX = '102.0,8.0,109.9,23.5';

export function initAddressAutocomplete(inputId, onSelectCallback, getCurrentCoordsFn) {
  const inputEl = document.getElementById(inputId);
  if (!inputEl) return;

  // Tao danh sach goi y noi ben duoi o nhap
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

    // Debounce 300ms giam tai request khi nguoi dung dang go
    debounceTimer = setTimeout(async () => {
      try {
        // Mac dinh toa do trung tam Mien Bac neu khong truyen ham lay GPS
        let lat = 20.4288;
        let lon = 106.1685;

        if (typeof getCurrentCoordsFn === 'function') {
          try {
            const coords = getCurrentCoordsFn();
            if (coords && coords.lat && coords.lon) {
              lat = coords.lat;
              lon = coords.lon;
            }
          } catch (e) {}
        }

        // Goi API Photon voi BBOX Viet Nam de khoanh dung pham vi dia ly Viet Nam
        const url = `https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&lat=${lat}&lon=${lon}&bbox=${VIETNAM_BBOX}&limit=8&lang=vi`;
        const res = await fetch(url);
        const data = await res.json();

        dropdown.innerHTML = '';

        if (data && data.features && data.features.length > 0) {
          // Chi kiem tra don gian toa do nam trong khung Viet Nam, khong loc chu gat gao
          const validFeatures = data.features.filter((feature) => {
            const coords = feature.geometry ? feature.geometry.coordinates : null;
            if (!coords || coords.length < 2) return false;

            const fLon = coords[0];
            const fLat = coords[1];

            // Kiem tra toa do GPS thuoc pham vi Viet Nam
            return fLat >= 8.0 && fLat <= 24.0 && fLon >= 102.0 && fLon <= 110.0;
          }).slice(0, 5);

          if (validFeatures.length > 0) {
            dropdown.style.display = 'block';

            validFeatures.forEach((feature) => {
              const props = feature.properties || {};
              const coords = feature.geometry.coordinates; // [lon, lat]

              // Ten dia diem / con duong / so nha
              const mainTitle = props.name || props.street || props.housenumber || query;

              // Cac cap hanh chinh
              const rawParts = [
                props.housenumber ? `Số ${props.housenumber}` : null,
                props.street && props.street !== props.name ? props.street : null,
                props.district || props.suburb || props.locality,
                props.city || props.county || props.state
              ].filter(Boolean);

              // Loai bo phan trung lap voi ten chinh
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
        } else {
          dropdown.style.display = 'none';
        }
      } catch (err) {
        dropdown.style.display = 'none';
      }
    }, 300);
  });

  // Dong dropdown khi bam ra ngoai
  document.addEventListener('click', (e) => {
    if (!inputEl.contains(e.target) && !dropdown.contains(e.target)) {
      dropdown.style.display = 'none';
    }
  });
}
