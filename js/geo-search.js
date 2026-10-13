// ==========================================================================
// GEO-SEARCH.JS - CHUẨN HÓA TÌM KIẾM ĐỊA CHỈ DÀNH RIÊNG CHO VIỆT NAM
// ==========================================================================

// Pham vi toa do lanh tho Viet Nam (MinLon, MinLat, MaxLon, MaxLat)
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
        // Mac dinh toa do trung tam Mien Bac neu chua lay duoc GPS
        let lat = 20.4288;
        let lon = 106.1685;

        if (typeof getCurrentCoordsFn === 'function') {
          const coords = getCurrentCoordsFn();
          if (coords && coords.lat && coords.lon) {
            lat = coords.lat;
            lon = coords.lon;
          }
        }

        // Request API Photon voi Bounding Box Viet Nam va Location Bias quanh khach hang
        const url = `https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&lat=${lat}&lon=${lon}&bbox=${VIETNAM_BBOX}&limit=10&lang=vi`;
        const res = await fetch(url);
        const data = await res.json();

        dropdown.innerHTML = '';

        if (data && data.features && data.features.length > 0) {
          // Bo loc nghiem ngat: Got sach tat ca cac dia diem nam ngoai lanh tho Viet Nam
          const vietnamFeatures = data.features.filter((feature) => {
            const props = feature.properties || {};
            const coords = feature.geometry ? feature.geometry.coordinates : null;

            if (!coords || coords.length < 2) return false;

            const featureLon = coords[0];
            const featureLat = coords[1];

            // Kiem tra toa do thuc te co nam trong ranh gioi Viet Nam hay khong
            const isInsideVN = featureLat >= 8.0 && featureLat <= 23.5 && featureLon >= 102.0 && featureLon <= 109.9;

            // Kiem tra ma quoc gia
            const countryCode = (props.countrycode || '').toUpperCase();
            const countryName = (props.country || '').toLowerCase();
            const isVN = countryCode === 'VN' || countryName === 'vietnam' || countryName === 'việt nam';

            return isInsideVN && (isVN || !props.countrycode);
          }).slice(0, 5); // Chi giu lai 5 ket qua phu hop nhat

          if (vietnamFeatures.length > 0) {
            dropdown.style.display = 'block';

            vietnamFeatures.forEach((feature) => {
              const props = feature.properties || {};
              const coords = feature.geometry.coordinates; // [lon, lat]

              // Lay ten dia diem chinh
              const mainTitle = props.name || props.street || props.housenumber || 'Địa điểm';

              // Ghep cac cap hanh chinh
              const addressParts = [
                props.housenumber ? `Số ${props.housenumber}` : null,
                props.street && props.street !== props.name ? props.street : null,
                props.district || props.suburb || props.locality,
                props.city || props.county || props.state
              ].filter(Boolean);

              // Loai bo phan trung lap voi ten chinh
              const cleanParts = addressParts.filter((part, index, self) => {
                return part !== mainTitle && self.indexOf(part) === index;
              });

              const subLabel = cleanParts.join(', ');
              const fullLabel = cleanParts.length > 0 ? `${mainTitle}, ${subLabel}` : mainTitle;

              const itemEl = document.createElement('div');
              itemEl.className = 'geo-autocomplete-item';
              itemEl.innerHTML = `
                <div style="font-weight: 700; color: #dfb76c; font-size: 13px;">${mainTitle}</div>
                <div style="font-size: 11px; color: #94a3b8; margin-top: 2px; line-height: 1.3;">${subLabel || fullLabel}</div>
              `;

              itemEl.addEventListener('click', () => {
                inputEl.value = fullLabel;
                dropdown.style.display = 'none';
                dropdown.innerHTML = '';

                // Tra ve toa do GPS va ten day du
                onSelectCallback({
                  lat: coords[1],
                  lon: coords[0],
                  name: fullLabel
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

  // Dong danh sach goi y khi click ra ngoai o nhap
  document.addEventListener('click', (e) => {
    if (!inputEl.contains(e.target) && !dropdown.contains(e.target)) {
      dropdown.style.display = 'none';
    }
  });
}
