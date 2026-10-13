// ==========================================================================
// GEO-SEARCH.JS - DỊCH ĐỊA CHỈ TIẾNG VIỆT CHUẨN DUAL-ENGINE (PHOTON + NOMINATIM)
// ==========================================================================

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

        let results = [];

        // ENGIN 1: PHOTON CLEAN REQUEST (KHONG CHUA LANG=VI DE TRANH BAD REQUEST 400)
        const photonUrl = `https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&lat=${lat}&lon=${lon}&limit=5`;
        
        try {
          const res = await fetch(photonUrl);
          if (res.ok) {
            const data = await res.json();
            if (data && data.features && data.features.length > 0) {
              results = data.features.map(f => {
                const p = f.properties || {};
                const name = p.name || p.street || p.housenumber || query;
                const parts = [
                  p.housenumber ? `Số ${p.housenumber}` : null,
                  p.street && p.street !== p.name ? p.street : null,
                  p.district || p.suburb || p.locality,
                  p.city || p.county || p.state
                ].filter(Boolean);
                const cleanParts = parts.filter((part, idx, self) => part !== name && self.indexOf(part) === idx);
                const sub = cleanParts.join(', ');
                return {
                  lat: f.geometry.coordinates[1],
                  lon: f.geometry.coordinates[0],
                  mainName: name,
                  fullName: sub ? `${name}, ${sub}` : name,
                  subText: sub
                };
              });
            }
          }
        } catch (e) {}

        // ENGIN 2: NOMINATIM OSM FALLBACK (NEU PHOTON KHONG CO KET QUA HOAC LOI)
        if (results.length === 0) {
          const nomUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=vn&limit=5&addressdetails=1`;
          try {
            const resNom = await fetch(nomUrl, { headers: { 'Accept-Language': 'vi' } });
            if (resNom.ok) {
              const dataNom = await resNom.json();
              if (dataNom && dataNom.length > 0) {
                results = dataNom.map(item => {
                  const addr = item.address || {};
                  const name = addr.amenity || addr.road || addr.suburb || item.display_name.split(',')[0];
                  return {
                    lat: parseFloat(item.lat),
                    lon: parseFloat(item.lon),
                    mainName: name,
                    fullName: item.display_name,
                    subText: item.display_name
                  };
                });
              }
            }
          } catch (e) {}
        }

        dropdown.innerHTML = '';

        if (results.length > 0) {
          dropdown.style.display = 'block';

          results.forEach(item => {
            const itemEl = document.createElement('div');
            itemEl.className = 'geo-autocomplete-item';
            itemEl.innerHTML = `
              <div style="font-weight: 700; color: #dfb76c; font-size: 13px;">${item.mainName}</div>
              <div style="font-size: 11px; color: #94a3b8; margin-top: 2px; line-height: 1.3;">${item.subText || item.fullName}</div>
            `;

            itemEl.addEventListener('click', () => {
              inputEl.value = item.fullName;
              dropdown.style.display = 'none';
              dropdown.innerHTML = '';

              onSelectCallback({
                lat: item.lat,
                lon: item.lon,
                name: item.fullName
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

  document.addEventListener('click', (e) => {
    if (!inputEl.contains(e.target) && !dropdown.contains(e.target)) {
      dropdown.style.display = 'none';
    }
  });
}
