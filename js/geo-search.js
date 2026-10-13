// ==========================================================================
// GEO-SEARCH.JS - DICH DIA CHI TIENG VIET RA TOA DO GPS (PHOTON / OSM 0 DONG)
// ==========================================================================

export function initAddressAutocomplete(inputId, onSelectCallback) {
  const inputEl = document.getElementById(inputId);
  if (!inputEl) return;

  // Tao danh sach goi y noi ben duoi o nhap
  const dropdown = document.createElement('div');
  dropdown.className = 'geo-autocomplete-dropdown';
  inputEl.parentNode.appendChild(dropdown);

  let debounceTimer = null;

  inputEl.addEventListener('input', () => {
    const query = inputEl.value.trim();
    clearTimeout(debounceTimer);

    if (query.length < 2) {
      dropdown.style.display = 'none';
      dropdown.innerHTML = '';
      return;
    }

    // Cho 350ms sau khi khach dung go moi gui request tim kiem
    debounceTimer = setTimeout(async () => {
      try {
        // Goi API tim kiem dia chi Photon OpenStreetMap uu tien khu vuc Mien Bac Viet Nam
        const url = `https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&lat=20.4288&lon=106.1685&limit=5`;
        const res = await fetch(url);
        const data = await res.json();

        dropdown.innerHTML = '';
        if (data.features && data.features.length > 0) {
          dropdown.style.display = 'block';

          data.features.forEach((feature) => {
            const props = feature.properties;
            const coords = feature.geometry.coordinates; // [lon, lat]

            // Ghep chuoi dia chi day du
            const nameParts = [props.name, props.street, props.district, props.city || props.state]
              .filter(Boolean);
            const fullLabel = nameParts.join(', ');

            const itemEl = document.createElement('div');
            itemEl.className = 'geo-autocomplete-item';
            itemEl.innerText = fullLabel;

            itemEl.addEventListener('click', () => {
              inputEl.value = fullLabel;
              dropdown.style.display = 'none';
              dropdown.innerHTML = '';

              // Tra ve toa do that cua dia diem duoc chon
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
      } catch (err) {
        dropdown.style.display = 'none';
      }
    }, 350);
  });

  // Dong goi y khi bam ra ngoai
  document.addEventListener('click', (e) => {
    if (!inputEl.contains(e.target) && !dropdown.contains(e.target)) {
      dropdown.style.display = 'none';
    }
  });
}
