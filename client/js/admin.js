// ─────────────────────────────────────────────
// ADMIN PANEL
// Login, then service menu editor + gallery uploader.
// All edits sync to backend (and localStorage as a cache).
// ─────────────────────────────────────────────

const editorOpen = {}; // tracks open accordions

async function adminLogin() {
  const username = document.getElementById('adminUser').value || 'admin';
  const password = document.getElementById('adminPass').value;
  if (!password) { alert('Enter password.'); return; }

  // Try backend auth
 try {
    const res = await fetch(CONFIG.API_BASE + '/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    if (res.status === 429) {
      alert('Too many login attempts. Please wait 15 minutes and try again.');
      return;
    }
    const result = await res.json();
    if (result && result.token) {
      adminToken = result.token;
      localStorage.setItem('crowned_token', adminToken);
      renderAdminPanel();
      return;
    }
  } catch (err) {
    console.warn('Login request failed:', err.message);
  }

  // Fallback for demo without backend
  if (password === 'crowned2025') {
    console.warn('Backend not reachable — using demo mode');
    renderAdminPanel();
    return;
  }

  alert('Login failed. Check your credentials.');
}

function adminLogout() {
  adminToken = null;
  localStorage.removeItem('crowned_token');
  location.reload();
}

function renderAdminPanel() {
  document.getElementById('adminContent').innerHTML = adminHTML();
  renderCatEditor();
  renderAdminGallery('ezichi');
  renderAdminGallery('alexia');
  renderAdminProfilePhoto('ezichi');   
  renderAdminProfilePhoto('alexia');
  populateLocationInputs(); 
  renderAddonsEditor();
  populateEventMapInputs();
  populateDepositInputs();
}

function adminHTML() {
  let h = `
    <div style="text-align:right;margin-bottom:1rem"><button class="ed-btn" onclick="adminLogout()" title="Log out" style="width:auto;padding:0 .6rem;font-size:.6rem;font-family:'Cinzel',serif;letter-spacing:.1em">LOG OUT</button></div>

    <div class="admin-section">
      <p class="admin-section-title">BUSINESS INFO</p>
      <div class="admin-field"><label class="admin-label">EMAIL</label><input class="admin-input" id="aEmail" value="crownedbeauty@email.com"></div>
      <div class="admin-field"><label class="admin-label">INSTAGRAM</label><input class="admin-input" id="aIg" value="@crownedbeauty"></div>
      <div class="admin-field"><label class="admin-label">LOCATION</label><input class="admin-input" id="aLoc" value="Upper Marlboro, MD"></div>
      <div class="admin-field"><label class="admin-label">BOOKING HOURS</label><input class="admin-input" id="aHours" value="By Appointment Only"></div>
      <button class="admin-save-btn" onclick="saveBusinessInfo()">SAVE INFO</button>
    </div>
    
    <div class="admin-section">
      <p class="admin-section-title">BOOKING LINKS (Cal.com)</p>
      <div class="admin-field"><label class="admin-label">EZICHI'S URL</label><input class="admin-input" id="aEzLink" placeholder="https://cal.com/ezichi" value="${escAttr(BOOKING_LINKS.ezichi)}"></div>
      <div class="admin-field"><label class="admin-label">ALEXIA'S URL</label><input class="admin-input" id="aAlLink" placeholder="https://cal.com/alexia" value="${escAttr(BOOKING_LINKS.alexia)}"></div>
      <button class="admin-save-btn" onclick="saveBookingLinks()">SAVE BOOKING LINKS</button>
    </div>

    <div class="admin-section">
    <p class="admin-section-title">STYLIST LOCATIONS</p>
    <p style="font-size:.7rem;color:rgba(245,237,216,.45);margin-bottom:.9rem;line-height:1.6">
      Used to calculate distance for the "Use my location" feature. Tap the 📍 button while standing where you'll be working, or paste coordinates from Google Maps (right-click any spot → coordinates).
    </p>

    <p style="font-family:'Cinzel',serif;font-size:.7rem;letter-spacing:.12em;color:var(--gold);margin:.75rem 0 .5rem">EZICHI</p>
    <div class="admin-field"><label class="admin-label">CITY / AREA (shown to users)</label><input class="admin-input" id="locEzCity" placeholder="Upper Marlboro, MD"></div>
    <div class="admin-row">
      <div class="admin-field"><label class="admin-label">LATITUDE</label><input class="admin-input" id="locEzLat" placeholder="38.8146" inputmode="decimal"></div>
      <div class="admin-field"><label class="admin-label">LONGITUDE</label><input class="admin-input" id="locEzLng" placeholder="-76.7497" inputmode="decimal"></div>
    </div>
    <button class="admin-upload-btn" onclick="fillCurrentLocation('Ez')">📍 USE MY CURRENT LOCATION</button>

    <p style="font-family:'Cinzel',serif;font-size:.7rem;letter-spacing:.12em;color:var(--gold);margin:1.25rem 0 .5rem">ALEXIA</p>
    <div class="admin-field"><label class="admin-label">CITY / AREA</label><input class="admin-input" id="locAlCity" placeholder="Upper Marlboro, MD"></div>
    <div class="admin-row">
      <div class="admin-field"><label class="admin-label">LATITUDE</label><input class="admin-input" id="locAlLat" placeholder="38.8146" inputmode="decimal"></div>
      <div class="admin-field"><label class="admin-label">LONGITUDE</label><input class="admin-input" id="locAlLng" placeholder="-76.7497" inputmode="decimal"></div>
    </div>
    <button class="admin-upload-btn" onclick="fillCurrentLocation('Al')">📍 USE MY CURRENT LOCATION</button>

    <button class="admin-save-btn" onclick="saveStylistLocations()">SAVE LOCATIONS</button>
  </div>
    <div class="admin-section">
      <p class="admin-section-title">SERVICE MENU EDITOR</p>
      <p style="font-size:.7rem;color:rgba(245,237,216,.45);margin-bottom:.9rem;line-height:1.6">Add, edit, delete categories, styles, sizes &amp; lengths. Click anything below to edit. Changes save automatically.</p>
      <div id="catEditor"></div>
      <button class="admin-upload-btn" style="margin-top:1rem" onclick="addCategory()">+ ADD CATEGORY</button>
      <button class="admin-save-btn" style="margin-top:.5rem;background:transparent;color:rgba(245,237,216,.6);border:.5px solid rgba(201,169,110,.3)" onclick="resetCategories()">RESET TO DEFAULTS</button>
    </div>
  `;
  h += `
  <div class="admin-section">
    <p class="admin-section-title">ADD-ONS</p>
    <p style="font-size:.7rem;color:rgba(245,237,216,.45);margin-bottom:.9rem;line-height:1.6">Extras clients can select (braiding hair, curls, etc.) — added to the service total.</p>
    <div id="addonsEditor"></div>
    <button class="admin-upload-btn" onclick="addAddon()">+ ADD ADD-ON</button>
  </div>

  <div class="admin-section">
    <p class="admin-section-title">BOOKING EVENT MAPPING</p>
    <p style="font-size:.7rem;color:rgba(245,237,216,.45);margin-bottom:.9rem;line-height:1.6">Map each category to its Cal.com event slug, per stylist. Leave blank if not set up yet.</p>
    <div class="admin-field"><label class="admin-label">EZICHI'S CAL.COM BASE URL</label><input class="admin-input" id="calcomBaseEz" placeholder="https://cal.com/your-username"></div>
    <div class="admin-field"><label class="admin-label">ALEXIA'S CAL.COM BASE URL</label><input class="admin-input" id="calcomBaseAl" placeholder="https://cal.com/her-username"></div>
    <div id="eventMapEditor" style="margin-top:1rem"></div>
    <button class="admin-save-btn" onclick="saveEventMapping()">SAVE EVENT MAPPING</button>
  </div>
`;

h += `
  <div class="admin-section">
    <p class="admin-section-title">DEPOSIT SETTINGS</p>
    <div class="admin-field"><label class="admin-label">DEPOSIT PERCENTAGE</label><input class="admin-input" id="depPercent" type="number" placeholder="25"></div>
    <div class="admin-field"><label class="admin-label">EZICHI'S $CASHTAG</label><input class="admin-input" id="depEzTag" placeholder="$YourCashtag"></div>
    <div class="admin-field"><label class="admin-label">ALEXIA'S $CASHTAG</label><input class="admin-input" id="depAlTag" placeholder="$AlexiasCashtag"></div>
    <button class="admin-save-btn" onclick="saveDepositSettings()">SAVE DEPOSIT SETTINGS</button>
  </div>
`;

  ['ezichi', 'alexia'].forEach(stylist => {
    const name = stylist === 'ezichi' ? 'EZICHI' : 'ALEXIA';
    h += `

     <div class="admin-section">
        <p class="admin-section-title">${name}'S PROFILE PHOTO</p>
        <div id="adminProfilePhotoPrev-${stylist}" style="margin-bottom:.75rem"></div>
        <label class="admin-upload-btn" for="up-profile-${stylist}">+ UPLOAD / REPLACE PHOTO</label>
        <input type="file" id="up-profile-${stylist}" accept="image/*" style="display:none" onchange="uploadProfilePhoto('${stylist}', this)">
        <p class="admin-upload-note">Shown as the circular photo in "Our Stylists" · Square images work best</p>
      </div>

      <div class="admin-section">
        <p class="admin-section-title">${name}'S GALLERY</p>
        <label class="admin-upload-btn" for="up-${stylist}">+ UPLOAD IMAGES OR VIDEOS</label>
        <input type="file" id="up-${stylist}" multiple accept="image/*,video/*" style="display:none" onchange="uploadFiles('${stylist}', this)">
        <p class="admin-upload-note">Choose multiple files at once · Backend uploads to Cloudinary · Falls back to local for demo</p>
        <div class="admin-gallery-preview" id="adminGalPrev-${stylist}"></div>
      </div>
    `;
  });

  return h;
}

// ─── SERVICE MENU EDITOR ───
function renderCatEditor() {
  const box = document.getElementById('catEditor');
  if (!box) return;
  if (CATEGORIES.length === 0) {
    box.innerHTML = '<p style="font-size:.75rem;color:rgba(245,237,216,.4);padding:1rem;text-align:center;font-style:italic">No categories yet — click "+ ADD CATEGORY" below.</p>';
    return;
  }
  let h = '';
  CATEGORIES.forEach(cat => {
    const catOpen = editorOpen['cat_' + cat.id];
    h += '<div class="ed-cat">';
    h += '<div class="ed-cat-head">';
    h += `<button class="ed-toggle" onclick="toggleEditor('cat_${cat.id}')">${catOpen ? '▾' : '▸'}</button>`;
    h += `<input class="ed-input ed-cat-name" value="${escAttr(cat.name)}" onchange="updateCatName('${cat.id}', this.value)">`;
    h += `<button class="ed-btn" title="Move up" onclick="moveCategory('${cat.id}', -1)">↑</button>`;
    h += `<button class="ed-btn" title="Move down" onclick="moveCategory('${cat.id}', 1)">↓</button>`;
    h += `<button class="ed-btn ed-del" title="Delete category" onclick="deleteCategory('${cat.id}')">🗑</button>`;
    h += '</div>';
    if (catOpen) {
      h += '<div class="ed-cat-body">';
      cat.styles.forEach((style, si) => {
        const styleOpen = editorOpen['style_' + style.id];
        h += '<div class="ed-style">';
        h += '<div class="ed-style-head">';
        h += `<button class="ed-toggle" onclick="toggleEditor('style_${style.id}')">${styleOpen ? '▾' : '▸'}</button>`;
        h += `<input class="ed-input" value="${escAttr(style.name)}" onchange="updateStyleName('${style.id}', this.value)">`;
        h += `<select class="ed-select" onchange="updateStyleAssign('${style.id}', this.value)">`;
        h += `<option value="both"${style.stylists === 'both' ? ' selected' : ''}>Both</option>`;
        h += `<option value="ezichi"${style.stylists === 'ezichi' ? ' selected' : ''}>Ezichi</option>`;
        h += `<option value="alexia"${style.stylists === 'alexia' ? ' selected' : ''}>Alexia</option>`;
        h += '</select>';
        h += `<button class="ed-btn ed-del" onclick="deleteStyle('${cat.id}', '${style.id}')">🗑</button>`;
        h += '</div>';
        if (styleOpen) {
          h += '<div class="ed-style-body">';
          h += '<div class="ed-notes-row">';
          h += '<label class="ed-mini-label">NOTES (shown under sizes)</label>';
          h += `<input class="ed-input" value="${escAttr(style.notes || '')}" onchange="updateStyleNotes('${style.id}', this.value)" placeholder="e.g. ✦ With hair provided: +$30">`;
          h += '</div>';
          style.sizes.forEach((size, szi) => {
            h += '<div class="ed-size">';
            h += '<div class="ed-size-head">';
            h += `<input class="ed-input ed-size-label" value="${escAttr(size.label)}" onchange="updateSizeLabel('${style.id}', ${szi}, this.value)" placeholder="e.g. LARGE">`;
            h += `<label class="ed-toggle-label"><input type="checkbox" ${size.hasLengths ? 'checked' : ''} onchange="toggleSizeLengths('${style.id}', ${szi}, this.checked)"> Has length options</label>`;
            h += `<button class="ed-btn ed-del" onclick="deleteSize('${style.id}', ${szi})">🗑</button>`;
            h += '</div>';
            if (size.hasLengths) {
              h += '<div class="ed-lengths">';
              (size.lengths || []).forEach((ln, li) => {
                h += '<div class="ed-length-row">';
                h += `<input class="ed-input ed-length-name" value="${escAttr(ln.name)}" onchange="updateLengthName('${style.id}', ${szi}, ${li}, this.value)" placeholder="e.g. Butt Length">`;
                h += `<input class="ed-input ed-length-price" value="${ln.price == null ? '' : ln.price}" onchange="updateLengthPrice('${style.id}', ${szi}, ${li}, this.value)" placeholder="—" inputmode="numeric">`;
                h += `<button class="ed-btn ed-del-small" onclick="deleteLength('${style.id}', ${szi}, ${li})">✕</button>`;
                h += '</div>';
              });
              h += `<button class="ed-add-mini" onclick="addLength('${style.id}', ${szi})">+ ADD LENGTH OPTION</button>`;
              h += '</div>';
            } else {
              h += '<div class="ed-single-price">';
              h += '<label class="ed-mini-label">PRICE</label>';
              h += `<input class="ed-input" value="${size.price == null ? '' : size.price}" onchange="updateSizePrice('${style.id}', ${szi}, this.value)" placeholder="— (leave empty for placeholder)" inputmode="numeric">`;
              h += '</div>';
            }
            h += '</div>';
          });
          h += `<button class="ed-add-mini" onclick="addSize('${style.id}')">+ ADD SIZE</button>`;
          h += '</div>';
        }
        h += '</div>';
      });
      h += `<button class="ed-add-mini" onclick="addStyle('${cat.id}')">+ ADD STYLE</button>`;
      h += '</div>';
    }
    h += '</div>';
  });
  box.innerHTML = h;
}

function toggleEditor(key) {
  editorOpen[key] = !editorOpen[key];
  renderCatEditor();
}

// ─── EDITOR CRUD OPS ───
function addCategory() {
  const name = (typeof prompt !== 'undefined' ? prompt('New category name (e.g. "WIGS"):') : null) || 'NEW CATEGORY';
  CATEGORIES.push({ id: newId('cat'), name: name.toUpperCase(), styles: [] });
  saveAndRefresh();
}
function updateCatName(catId, val) {
  const c = findCategory(catId);
  if (c) { c.name = val.toUpperCase(); saveAndRefresh(false); renderTabs(); }
}
function deleteCategory(catId) {
  const c = findCategory(catId);
  if (!c) return;
  if (!confirm(`Delete the entire "${c.name}" category and all its styles?`)) return;
  CATEGORIES = CATEGORIES.filter(x => x.id !== catId);
  if (currentTab === catId) currentTab = CATEGORIES.length > 0 ? CATEGORIES[0].id : null;
  saveAndRefresh();
}
function moveCategory(catId, dir) {
  const idx = CATEGORIES.findIndex(c => c.id === catId);
  const newIdx = idx + dir;
  if (newIdx < 0 || newIdx >= CATEGORIES.length) return;
  [CATEGORIES[idx], CATEGORIES[newIdx]] = [CATEGORIES[newIdx], CATEGORIES[idx]];
  saveAndRefresh();
}

function addStyle(catId) {
  const name = (typeof prompt !== 'undefined' ? prompt('New style name:') : null) || 'New Style';
  const c = findCategory(catId);
  if (!c) return;
  c.styles.push({ id: newId('style'), name, stylists: 'both', notes: '', sizes: [] });
  saveAndRefresh();
}
function updateStyleName(id, val) { const s = findStyle(id); if (s) { s.name = val; saveAndRefresh(false); } }
function updateStyleAssign(id, val) { const s = findStyle(id); if (s) { s.stylists = val; saveAndRefresh(false); } }
function updateStyleNotes(id, val) { const s = findStyle(id); if (s) { s.notes = val; saveAndRefresh(false); } }
function deleteStyle(catId, styleId) {
  const c = findCategory(catId);
  if (!c) return;
  const s = c.styles.find(x => x.id === styleId);
  if (!s) return;
  if (!confirm(`Delete "${s.name}"?`)) return;
  c.styles = c.styles.filter(x => x.id !== styleId);
  if (activeStyleId === styleId) activeStyleId = null;
  saveAndRefresh();
}

function addSize(styleId) {
  const label = (typeof prompt !== 'undefined' ? prompt('Size label (e.g. LARGE, MEDIUM):') : null) || 'NEW SIZE';
  const s = findStyle(styleId);
  if (!s) return;
  s.sizes.push({ label: label.toUpperCase(), hasLengths: true, lengths: [], price: null });
  saveAndRefresh();
}
function updateSizeLabel(styleId, szi, val) {
  const s = findStyle(styleId); if (s && s.sizes[szi]) { s.sizes[szi].label = val.toUpperCase(); saveAndRefresh(false); }
}
function toggleSizeLengths(styleId, szi, hasLengths) {
  const s = findStyle(styleId); if (!s || !s.sizes[szi]) return;
  s.sizes[szi].hasLengths = hasLengths;
  if (hasLengths && (!s.sizes[szi].lengths || s.sizes[szi].lengths.length === 0)) {
    s.sizes[szi].lengths = [];
  }
  saveAndRefresh();
}
function updateSizePrice(styleId, szi, val) {
  const s = findStyle(styleId); if (!s || !s.sizes[szi]) return;
  s.sizes[szi].price = (val === '' || val === null) ? null : Number(val);
  saveAndRefresh(false);
}
function deleteSize(styleId, szi) {
  const s = findStyle(styleId); if (!s) return;
  if (!confirm('Delete this size?')) return;
  s.sizes.splice(szi, 1);
  saveAndRefresh();
}

function addLength(styleId, szi) {
  const name = (typeof prompt !== 'undefined' ? prompt('Length name (e.g. Mid-back, Butt Length):') : null) || 'New Length';
  const s = findStyle(styleId); if (!s || !s.sizes[szi]) return;
  if (!s.sizes[szi].lengths) s.sizes[szi].lengths = [];
  s.sizes[szi].lengths.push({ name, price: null });
  saveAndRefresh();
}
function updateLengthName(styleId, szi, li, val) {
  const s = findStyle(styleId); if (!s || !s.sizes[szi] || !s.sizes[szi].lengths[li]) return;
  s.sizes[szi].lengths[li].name = val;
  saveAndRefresh(false);
}
function updateLengthPrice(styleId, szi, li, val) {
  const s = findStyle(styleId); if (!s || !s.sizes[szi] || !s.sizes[szi].lengths[li]) return;
  s.sizes[szi].lengths[li].price = (val === '' || val === null) ? null : Number(val);
  saveAndRefresh(false);
}
function deleteLength(styleId, szi, li) {
  const s = findStyle(styleId); if (!s || !s.sizes[szi]) return;
  s.sizes[szi].lengths.splice(li, 1);
  saveAndRefresh();
}

async function saveAndRefresh(reRenderEditor = true) {
  saveCategoriesLocal();
  saveCategoriesRemote(); // fire and forget
  renderTab(currentTab);
  renderTabs();
  if (activeStyleId) {
    if (!findStyle(activeStyleId)) activeStyleId = null;
    updateStylistCards();
    updateBanner();
  }
  if (reRenderEditor) renderCatEditor();
  if (typeof renderEventMapEditor === 'function') renderEventMapEditor();
}

function resetCategories() {
  if (!confirm('Reset ALL categories, styles, sizes and prices to original defaults? This cannot be undone.')) return;
  CATEGORIES = JSON.parse(JSON.stringify(DEFAULT_CATEGORIES));
  currentTab = CATEGORIES[0].id;
  activeStyleId = null;
  sizeSelections = {};
  saveAndRefresh();
}


// ─── Business info / booking links ───
function saveBusinessInfo() {
  document.getElementById('cEmail').textContent = document.getElementById('aEmail').value;
  document.getElementById('cIg').textContent = document.getElementById('aIg').value;
  document.getElementById('cLoc').innerHTML = document.getElementById('aLoc').value + '<br><em style="font-size:.7rem;color:rgba(245,237,216,.35)">Address sent on booking</em>';
  document.getElementById('cHours').textContent = document.getElementById('aHours').value;

  apiPut('/settings/business', {
    email: document.getElementById('aEmail').value,
    instagram: document.getElementById('aIg').value,
    location: document.getElementById('aLoc').value,
    hours: document.getElementById('aHours').value,
  });

  alert('Business info updated!');
}

function saveBookingLinks() {
  BOOKING_LINKS.ezichi = document.getElementById('aEzLink').value;
  BOOKING_LINKS.alexia = document.getElementById('aAlLink').value;
  apiPut('/settings/booking-links', BOOKING_LINKS);
  alert('Booking links saved!');
}

async function populateLocationInputs() {
  const data = await apiGet('/settings/stylist-locations');
  if (!data) return;
  const setVal = (id, v) => { const el = document.getElementById(id); if (el) el.value = v ?? ''; };
  setVal('locEzCity', data.ezichi?.city);
  setVal('locEzLat',  data.ezichi?.lat);
  setVal('locEzLng',  data.ezichi?.lng);
  setVal('locAlCity', data.alexia?.city);
  setVal('locAlLat',  data.alexia?.lat);
  setVal('locAlLng',  data.alexia?.lng);
}

function fillCurrentLocation(prefix) {
  if (!navigator.geolocation) { alert('Geolocation not supported.'); return; }
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      document.getElementById('loc' + prefix + 'Lat').value = pos.coords.latitude.toFixed(6);
      document.getElementById('loc' + prefix + 'Lng').value = pos.coords.longitude.toFixed(6);
    },
    () => alert('Could not get location. Please allow access.'),
    { enableHighAccuracy: true }
  );
}

async function saveStylistLocations() {
  const payload = {
    ezichi: {
      city: document.getElementById('locEzCity').value,
      lat:  parseFloat(document.getElementById('locEzLat').value),
      lng:  parseFloat(document.getElementById('locEzLng').value),
    },
    alexia: {
      city: document.getElementById('locAlCity').value,
      lat:  parseFloat(document.getElementById('locAlLat').value),
      lng:  parseFloat(document.getElementById('locAlLng').value),
    },
  };
  if (isNaN(payload.ezichi.lat) || isNaN(payload.alexia.lat)) {
    alert('Please enter valid coordinates for both stylists.');
    return;
  }
  await apiPut('/settings/stylist-locations', payload);
  stylistLocations = payload; // refresh the cached copy
  alert('Locations saved!');
}

// ─── ADD-ONS EDITOR ───
function renderAddonsEditor() {
  const box = document.getElementById('addonsEditor');
  if (!box) return;
  if (ADDONS.length === 0) {
    box.innerHTML = '<p style="font-size:.75rem;color:rgba(245,237,216,.4);padding:.5rem 0;font-style:italic">No add-ons yet.</p>';
    return;
  }
  let h = '';
  ADDONS.forEach((a, i) => {
    h += `
      <div class="admin-row" style="grid-template-columns:2fr 1fr auto;align-items:center;margin-bottom:.5rem;gap:.4rem">
        <input class="ed-input" value="${escAttr(a.name)}" onchange="updateAddonName(${i}, this.value)">
        <input class="ed-input" type="number" value="${a.price}" onchange="updateAddonPrice(${i}, this.value)" style="text-align:right">
        <button class="ed-btn ed-del" onclick="deleteAddon(${i})">🗑</button>
      </div>
      <label style="display:flex;align-items:center;gap:.4rem;font-size:.68rem;color:rgba(245,237,216,.6);margin:-.3rem 0 .8rem">
        <input type="checkbox" ${a.active ? 'checked' : ''} onchange="toggleAddonActive(${i}, this.checked)"> Active (visible on site)
      </label>
    `;
  });
  box.innerHTML = h;
}

function addAddon() {
  ADDONS.push({ id: newId('addon'), name: 'New Add-On', price: 0, active: true });
  saveAddonsRemote();
  renderAddonsEditor();
  renderAddons();
}
function updateAddonName(i, val) { ADDONS[i].name = val; saveAddonsRemote(); renderAddons(); }
function updateAddonPrice(i, val) { ADDONS[i].price = Number(val) || 0; saveAddonsRemote(); renderAddons(); renderBookingSummary(); }
function toggleAddonActive(i, checked) { ADDONS[i].active = checked; saveAddonsRemote(); renderAddons(); }
function deleteAddon(i) {
  if (!confirm('Delete this add-on?')) return;
  ADDONS.splice(i, 1);
  saveAddonsRemote();
  renderAddonsEditor();
  renderAddons();
}

// ─── EVENT MAPPING EDITOR ───
function renderEventMapEditor() {
  const box = document.getElementById('eventMapEditor');
  if (!box) return;
  let h = '';
  CATEGORIES.forEach(cat => {
    const map = CATEGORY_EVENT_MAP[cat.id] || { ezichi: '', alexia: '' };
    h += `
      <div style="border:.5px solid rgba(201,169,110,.18);padding:.6rem;margin-bottom:.5rem">
        <p style="font-family:'Cinzel',serif;font-size:.68rem;letter-spacing:.08em;color:var(--gold-light);margin-bottom:.4rem">${cat.name}</p>
        <div class="admin-row">
          <div class="admin-field" style="margin-bottom:.3rem">
            <label class="admin-label">EZICHI'S EVENT SLUG</label>
            <input class="admin-input" data-cat="${cat.id}" data-stylist="ezichi" value="${escAttr(map.ezichi || '')}" placeholder="e.g. full-braiding-service">
          </div>
          <div class="admin-field" style="margin-bottom:.3rem">
            <label class="admin-label">ALEXIA'S EVENT SLUG</label>
            <input class="admin-input" data-cat="${cat.id}" data-stylist="alexia" value="${escAttr(map.alexia || '')}" placeholder="leave blank for now">
          </div>
        </div>
      </div>
    `;
  });
  box.innerHTML = h;
}

async function populateEventMapInputs() {
  await loadCategoryEventMap();
  await loadCalcomBase();
  document.getElementById('calcomBaseEz').value = CALCOM_BASE.ezichi || '';
  document.getElementById('calcomBaseAl').value = CALCOM_BASE.alexia || '';
  renderEventMapEditor();
}

async function saveEventMapping() {
  CALCOM_BASE.ezichi = document.getElementById('calcomBaseEz').value.trim();
  CALCOM_BASE.alexia = document.getElementById('calcomBaseAl').value.trim();
  await apiPut('/settings/calcom-base', CALCOM_BASE);

  const newMap = {};
  document.querySelectorAll('#eventMapEditor input[data-cat]').forEach(input => {
    const catId = input.dataset.cat;
    const stylist = input.dataset.stylist;
    if (!newMap[catId]) newMap[catId] = { ezichi: '', alexia: '' };
    newMap[catId][stylist] = input.value.trim();
  });
  CATEGORY_EVENT_MAP = newMap;
  await apiPut('/settings/category-event-map', CATEGORY_EVENT_MAP);
  alert('Event mapping saved!');
}

async function populateDepositInputs() {
  const data = await apiGet('/settings/deposit-settings');
  if (!data) return;
  document.getElementById('depPercent').value = data.depositPercent ?? 25;
  document.getElementById('depEzTag').value = data.cashapp?.ezichi || '';
  document.getElementById('depAlTag').value = data.cashapp?.alexia || '';
  window._depositPercent = data.depositPercent ?? 25;
}

async function saveDepositSettings() {
  const payload = {
    depositPercent: parseFloat(document.getElementById('depPercent').value) || 25,
    cashapp: {
      ezichi: document.getElementById('depEzTag').value.trim(),
      alexia: document.getElementById('depAlTag').value.trim(),
    },
  };
  await apiPut('/settings/deposit-settings', payload);
  window._depositPercent = payload.depositPercent;
  alert('Deposit settings saved!');
}