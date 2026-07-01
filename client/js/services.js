// ─────────────────────────────────────────────
// SERVICES
// Renders the categories/styles/sizes/lengths
// from the CATEGORIES data structure.
// ─────────────────────────────────────────────

// Default categories — used when backend is unreachable
// or for first-time load. These match the original menu.
const DEFAULT_CATEGORIES = [
  { id: 'cat_knotless', name: 'KNOTLESS BRAIDS', styles: [
    { id: 'trad_knotless', name: 'Traditional Knotless Braids', stylists: 'both',
      notes: '✦ With hair provided: +$30 · ✦ Thigh length add-on: +$50',
      sizes: [
        { label: 'LARGE',    hasLengths: true, lengths: [{name:'Butt Length',price:170},{name:'Thigh Length',price:220}] },
        { label: 'MEDIUM',   hasLengths: true, lengths: [{name:'Butt Length',price:200},{name:'Thigh Length',price:250}] },
        { label: 'S-MEDIUM', hasLengths: true, lengths: [{name:'Butt Length',price:220},{name:'Thigh Length',price:270}] },
        { label: 'SMALL',    hasLengths: true, lengths: [{name:'Butt Length',price:250},{name:'Thigh Length',price:320}] },
      ]},
  ]},
  { id: 'cat_goddess', name: 'GODDESS BRAIDS', styles: [
    { id: 'goddess_braids', name: 'Goddess Braids', stylists: 'both',
      notes: '✦ With hair (human curls): +$45 · ✦ Boho add-on: +$20',
      sizes: [
        { label: 'LARGE',    hasLengths: true, lengths: [{name:'Butt Length',price:190},{name:'Thigh Length',price:240}] },
        { label: 'MEDIUM',   hasLengths: true, lengths: [{name:'Butt Length',price:220},{name:'Thigh Length',price:null}] },
        { label: 'S-MEDIUM', hasLengths: true, lengths: [{name:'Butt Length',price:240},{name:'Thigh Length',price:null}] },
        { label: 'SMALL',    hasLengths: true, lengths: [{name:'Butt Length',price:270},{name:'Thigh Length',price:null}] },
      ]},
  ]},
  { id: 'cat_boho', name: 'BOHO BRAIDS', styles: [
    { id: 'boho_braids', name: 'Boho Braids', stylists: 'both',
      notes: '✦ With hair (human hair curls): +$165',
      sizes: [
        { label: 'LARGE',    hasLengths: true, lengths: [{name:'Butt Length',price:210},{name:'Thigh Length',price:260}] },
        { label: 'MEDIUM',   hasLengths: true, lengths: [{name:'Butt Length',price:240},{name:'Thigh Length',price:290}] },
        { label: 'S-MEDIUM', hasLengths: true, lengths: [{name:'Butt Length',price:260},{name:'Thigh Length',price:310}] },
        { label: 'SMALL',    hasLengths: true, lengths: [{name:'Butt Length',price:290},{name:'Thigh Length',price:340}] },
      ]},
  ]},
  { id: 'cat_fulani', name: 'FULANI', styles: [
    { id: 'fulani_braids', name: 'Fulani Braids', stylists: 'both', notes: '✦ With hair provided: +$30',
      sizes: [
        { label: 'LARGE',    hasLengths: true, lengths: [{name:'Mid-back',price:null},{name:'Butt Length',price:null},{name:'Thigh Length',price:null}] },
        { label: 'MEDIUM',   hasLengths: true, lengths: [{name:'Mid-back',price:null},{name:'Butt Length',price:null},{name:'Thigh Length',price:null}] },
        { label: 'S-MEDIUM', hasLengths: true, lengths: [{name:'Mid-back',price:null},{name:'Butt Length',price:null},{name:'Thigh Length',price:null}] },
        { label: 'SMALL',    hasLengths: true, lengths: [{name:'Mid-back',price:null},{name:'Butt Length',price:null},{name:'Thigh Length',price:null}] },
      ]},
  ]},
  { id: 'cat_cornrows', name: 'CORNROWS', styles: [
    { id: 'straight_backs', name: 'Straight Backs', stylists: 'both', notes: '✦ With hair provided: +$30',
      sizes: [
        { label: 'LARGE',    hasLengths: true, lengths: [{name:'Mid-back',price:null},{name:'Butt Length',price:null},{name:'Thigh Length',price:null}] },
        { label: 'MEDIUM',   hasLengths: true, lengths: [{name:'Mid-back',price:null},{name:'Butt Length',price:null},{name:'Thigh Length',price:null}] },
        { label: 'S-MEDIUM', hasLengths: true, lengths: [{name:'Mid-back',price:null},{name:'Butt Length',price:null},{name:'Thigh Length',price:null}] },
        { label: 'SMALL',    hasLengths: true, lengths: [{name:'Mid-back',price:null},{name:'Butt Length',price:null},{name:'Thigh Length',price:null}] },
      ]},
  ]},
  { id: 'cat_locs', name: 'LOCS & TWISTS', styles: [
    { id: 'butterfly_locs', name: 'Locs / Butterfly Locs', stylists: 'both', notes: '',
      sizes: [
        { label: 'LARGE',    hasLengths: false, lengths: [], price: null },
        { label: 'MEDIUM',   hasLengths: false, lengths: [], price: null },
        { label: 'S-MEDIUM', hasLengths: false, lengths: [], price: null },
      ]},
    { id: 'micro_twists', name: 'Micro Twists', stylists: 'both',
      notes: '✦ Human hair: Short +$130 · Long +$200 · ✦ Synthetic: +$30',
      sizes: [
        { label: 'SHORT', hasLengths: false, lengths: [], price: null },
        { label: 'LONG',  hasLengths: false, lengths: [], price: null },
      ]},
    { id: 'mini_twists', name: 'Mini Twists', stylists: 'both',
      notes: '✦ Human hair: Short +$130 · Long +$200 · ✦ Synthetic: +$30',
      sizes: [
        { label: 'SHORT', hasLengths: false, lengths: [], price: null },
        { label: 'LONG',  hasLengths: false, lengths: [], price: null },
      ]},
  ]},
];

// In-memory state
let CATEGORIES = [];
let currentTab = null;
let activeStyleId = null;
let sizeSelections = {};
let openSizes = {};
// ──── ADD-ONS STATE ────
let ADDONS = [];
let selectedAddonIds = new Set();
let CATEGORY_EVENT_MAP = {};
let CALCOM_BASE = { ezichi: '', alexia: '' };

async function loadAddons() {
  const data = await apiGet('/settings/addons');
  if (data && Array.isArray(data)) {
    ADDONS = data;
  } else if (CONFIG.USE_LOCAL_FALLBACK) {
    try {
      const saved = localStorage.getItem('crowned_addons');
      ADDONS = saved ? JSON.parse(saved) : [];
    } catch (e) { ADDONS = []; }
  }
}
function saveAddonsLocal() {
  try { localStorage.setItem('crowned_addons', JSON.stringify(ADDONS)); }
  catch (e) {}
}
let addonSaveInFlight = false;
let addonSavePending = false;
async function saveAddonsRemote() {
  if (addonSaveInFlight) { addonSavePending = true; return; }
  addonSaveInFlight = true;
  try {
    const result = await apiPut('/settings/addons', ADDONS);
    if (result) saveAddonsLocal();
  } finally {
    addonSaveInFlight = false;
    if (addonSavePending) { addonSavePending = false; saveAddonsRemote(); }
  }
}

async function loadCategoryEventMap() {
  const data = await apiGet('/settings/category-event-map');
  if (data) CATEGORY_EVENT_MAP = data;
}
async function loadCalcomBase() {
  const data = await apiGet('/settings/calcom-base');
  if (data) CALCOM_BASE = data;
}

// ──── DATA LOADING ────
async function loadCategories() {
  const data = await apiGet('/categories');
  if (data && Array.isArray(data)) {
    CATEGORIES = data;
    saveCategoriesLocal();
  } else if (CONFIG.USE_LOCAL_FALLBACK) {
    try {
      const saved = localStorage.getItem('crowned_categories');
      CATEGORIES = saved ? JSON.parse(saved) : JSON.parse(JSON.stringify(DEFAULT_CATEGORIES));
    } catch (e) {
      CATEGORIES = JSON.parse(JSON.stringify(DEFAULT_CATEGORIES));
    }
  } else {
    CATEGORIES = JSON.parse(JSON.stringify(DEFAULT_CATEGORIES));
  }
  if (CATEGORIES.length > 0 && !currentTab) currentTab = CATEGORIES[0].id;
}

function saveCategoriesLocal() {
  try { localStorage.setItem('crowned_categories', JSON.stringify(CATEGORIES)); }
  catch (e) { console.warn('localStorage save failed', e); }
}

let categorySaveInFlight = false;
let categorySavePending = false;

async function saveCategoriesRemote() {
  if (categorySaveInFlight) {
    categorySavePending = true;
    return;
  }
  categorySaveInFlight = true;
  try {
    const result = await apiPut('/categories', CATEGORIES);
    if (result) saveCategoriesLocal();
  } finally {
    categorySaveInFlight = false;
    if (categorySavePending) {
      categorySavePending = false;
      saveCategoriesRemote();
    }
  }
}

// ──── HELPERS ────
function newId(prefix) { return prefix + '_' + Math.random().toString(36).slice(2, 9); }

function findCategory(catId) {
  return CATEGORIES.find(c => c.id === catId) || null;
}
function findStyle(styleId) {
  for (const c of CATEGORIES) {
    const s = c.styles.find(x => x.id === styleId);
    if (s) { s._catId = c.id; return s; }
  }
  return null;
}

function tagHTML(stylists) {
  if (stylists === 'both')   return '<span class="style-tag">BOTH STYLISTS</span>';
  if (stylists === 'ezichi') return '<span class="style-tag ezichi">EZICHI ONLY</span>';
  return '<span class="style-tag alexia">ALEXIA ONLY</span>';
}
function priceTxt(p) {
  if (p === null || p === '' || p === undefined) return '<span class="length-option-price tbd">—</span>';
  return '<span class="length-option-price">$' + p + '</span>';
}
function priceLabel(p) {
  if (p === null || p === '' || p === undefined) return '—';
  return '$' + p;
}
function escAttr(s) { return String(s == null ? '' : s).replace(/"/g, '&quot;'); }

// ──── RENDERING ────
function renderTabs() {
  const bar = document.querySelector('.service-tabs');
  if (!bar) return;
  let html = '';
  CATEGORIES.forEach((cat, i) => {
    const isActive = (currentTab === cat.id) || (currentTab === null && i === 0);
    if (currentTab === null && i === 0) currentTab = cat.id;
    html += `<button class="service-tab${isActive ? ' active' : ''}" data-tab="${cat.id}" onclick="showSvc('${cat.id}', this)">${cat.name}</button>`;
  });
  bar.innerHTML = html;
}

function renderTab(catId) {
  const cat = findCategory(catId);
  if (!cat) {
    document.getElementById('servicesRendered').innerHTML =
      '<p style="text-align:center;color:rgba(245,237,216,.4);padding:3rem;font-style:italic">No services yet — add categories from the admin panel.</p>';
    return;
  }
  let html = '<div class="service-panel active">';
  if (cat.styles.length === 0) {
    html += '<p style="text-align:center;color:rgba(245,237,216,.4);padding:3rem;font-style:italic">No styles in this category yet.</p>';
  }
  cat.styles.forEach(style => {
    const activeCls = (activeStyleId === style.id) ? ' active-style' : '';
    html += `<div class="style-card${activeCls}" id="sc-${style.id}">`;
    html += `<div class="style-card-top"><span class="style-name">${style.name}</span>${tagHTML(style.stylists)}</div>`;
    html += '<div class="size-grid">';
    style.sizes.forEach((size, si) => {
      const key = `${style.id}-${si}`;
      const hasOpts = !!size.hasLengths && size.lengths && size.lengths.length > 0;
      const noOptsCls = hasOpts ? '' : ' no-options';
      const selIdx = sizeSelections[key];
      const hasSelCls = (selIdx !== undefined && selIdx !== null) ? ' has-selection' : '';
      let selInfo = '';
      if (selIdx !== undefined && selIdx !== null && hasOpts) {
        const ln = size.lengths[selIdx];
        selInfo = `${ln.name} · ${priceLabel(ln.price)}`;
      }
      html += `<div class="size-card${noOptsCls}${hasSelCls}" id="szc-${key}" onclick="toggleSize('${style.id}', ${si}, event)">`;
      html += '<div class="size-card-header"><div class="size-header-left">';
      html += `<span class="size-label">${size.label}</span>`;
      html += `<span class="size-selected-info">${selInfo}</span>`;
      html += '</div><span class="size-chevron">▼</span></div>';
      if (hasOpts) {
        html += '<div class="size-dropdown">';
        size.lengths.forEach((ln, li) => {
          const checked = (selIdx === li) ? ' checked' : '';
          html += '<label class="length-option" onclick="event.stopPropagation()">';
          html += `<input type="radio" name="r-${key}" value="${li}"${checked} onchange="selectLength('${style.id}', ${si}, ${li})">`;
          html += `<span class="length-option-name">${ln.name}</span>`;
          html += priceTxt(ln.price);
          html += '</label>';
        });
        html += '</div>';
      } else {
        html += `<div class="size-no-dropdown-price">${priceLabel(size.price)}</div>`;
      }
      html += '</div>';
    });
    html += '</div>';
    if (style.notes) html += `<p class="style-notes">${style.notes}</p>`;
    html += '</div>';
  });
  html += '</div>';
  document.getElementById('servicesRendered').innerHTML = html;

  // Restore previously-open size cards
  Object.keys(openSizes).forEach(k => {
    if (openSizes[k]) {
      const el = document.getElementById('szc-' + k);
      if (el) el.classList.add('open');
    }
  });
}

function showSvc(catId, btn) {
  document.querySelectorAll('.service-tab').forEach(t => t.classList.remove('active'));
  if (btn) btn.classList.add('active');
  currentTab = catId;
  renderTab(catId);
}

function toggleSize(styleId, sizeIdx, e) {
  if (e) e.stopPropagation();
  const key = `${styleId}-${sizeIdx}`;
  const el = document.getElementById('szc-' + key);
  if (!el) return;
  if (el.classList.contains('open')) {
    el.classList.remove('open');
    openSizes[key] = false;
  } else {
    el.classList.add('open');
    openSizes[key] = true;
  }
  setActiveStyle(styleId);
}

function selectLength(styleId, sizeIdx, lengthIdx) {
  const key = `${styleId}-${sizeIdx}`;
  sizeSelections[key] = lengthIdx;
  setActiveStyle(styleId);
  const style = findStyle(styleId);
  if (!style) return;
  const ln = style.sizes[sizeIdx].lengths[lengthIdx];
  const card = document.getElementById('szc-' + key);
  if (card) {
    card.classList.add('has-selection');
    const info = card.querySelector('.size-selected-info');
    if (info) info.textContent = `${ln.name} · ${priceLabel(ln.price)}`;
  }
  renderBookingSummary();
}

function setActiveStyle(styleId) {
  if (activeStyleId === styleId) return;
  if (activeStyleId) {
    const prev = document.getElementById('sc-' + activeStyleId);
    if (prev) prev.classList.remove('active-style');
  }
  activeStyleId = styleId;
  const cur = document.getElementById('sc-' + styleId);
  if (cur) cur.classList.add('active-style');
  updateStylistCards();
  updateBanner();
  renderBookingSummary();
}

function clearSelection() {
  if (activeStyleId) {
    const prev = document.getElementById('sc-' + activeStyleId);
    if (prev) prev.classList.remove('active-style');
  }
  activeStyleId = null;
  updateStylistCards();
  updateBanner();
  renderBookingSummary();
}

function updateBanner() {
  const b = document.getElementById('selectionBanner');
  const t = document.getElementById('selectionBannerText');
  if (!activeStyleId) { b.classList.remove('visible'); return; }
  const style = findStyle(activeStyleId);
  if (!style) { b.classList.remove('visible'); return; }
  const who = style.stylists === 'both' ? 'Both stylists offer this'
            : style.stylists === 'ezichi' ? 'Ezichi only' : 'Alexia only';
  t.innerHTML = `<strong>SELECTED:</strong> ${style.name} &nbsp;·&nbsp; <span style="opacity:.7">${who}</span>`;
  b.classList.add('visible');
}

// ──── ADD-ONS RENDERING ────
function renderAddons() {
  const el = document.getElementById('addonsRendered');
  if (!el) return;
  if (ADDONS.length === 0) {
    el.innerHTML = '<p style="text-align:center;color:rgba(245,237,216,.4);padding:1.5rem;font-style:italic">No add-ons available right now.</p>';
    return;
  }
  let html = '';
  ADDONS.filter(a => a.active).forEach(addon => {
    const checked = selectedAddonIds.has(addon.id) ? ' checked' : '';
    html += `
      <label class="addon-item">
        <input type="checkbox" value="${addon.id}"${checked} onchange="toggleAddon('${addon.id}')">
        <span class="addon-name">${addon.name}</span>
        <span class="addon-price">+$${addon.price}</span>
      </label>
    `;
  });
  el.innerHTML = html;
}

function toggleAddon(id) {
  if (selectedAddonIds.has(id)) selectedAddonIds.delete(id);
  else selectedAddonIds.add(id);
  renderBookingSummary();
}

function getAddonsTotal() {
  let total = 0;
  ADDONS.forEach(a => { if (selectedAddonIds.has(a.id)) total += Number(a.price) || 0; });
  return total;
}

// ──── BOOKING SUMMARY (service + add-ons) ────
function renderBookingSummary() {
  const el = document.getElementById('bookingSummary');
  const bookBtnWrap = document.getElementById('bookNowWrap');
  if (!el) return;

  if (!activeStyleId) {
    el.style.display = 'none';
    if (bookBtnWrap) bookBtnWrap.style.display = 'none';
    return;
  }

  // Find the active size/length selection for the active style
  const style = findStyle(activeStyleId);
  if (!style) { el.style.display = 'none'; return; }

  let servicePrice = null;
  let serviceLabel = style.name;
  // Look through sizeSelections for any key belonging to this style
  for (const key in sizeSelections) {
    if (key.startsWith(style.id + '-')) {
      const [, szi] = key.split('-');
      const size = style.sizes[Number(szi)];
      const li = sizeSelections[key];
      if (size && size.hasLengths && size.lengths[li]) {
        servicePrice = size.lengths[li].price;
        serviceLabel = `${style.name} — ${size.label} (${size.lengths[li].name})`;
      } else if (size && !size.hasLengths) {
        servicePrice = size.price;
        serviceLabel = `${style.name} — ${size.label}`;
      }
    }
  }

  if (servicePrice === null || servicePrice === undefined) {
    el.innerHTML = `<div class="summary-card"><p class="summary-style">${serviceLabel}</p><p class="summary-note">Select a size & length above to see pricing</p></div>`;
    el.style.display = 'block';
    if (bookBtnWrap) bookBtnWrap.style.display = 'none';
    return;
  }

  const addonsTotal = getAddonsTotal();
  const total = Number(servicePrice) + addonsTotal;

  el.innerHTML = `
    <div class="summary-card">
      <p class="summary-style">${serviceLabel}</p>
      ${addonsTotal > 0 ? `<p class="summary-line">Add-ons: $${addonsTotal}</p>` : ''}
      <p class="summary-price">Total: $${total}</p>
    </div>
  `;
  el.style.display = 'block';
  if (bookBtnWrap) bookBtnWrap.style.display = 'block';
}

async function loadDepositPercent() {
  const data = await apiGet('/settings/deposit-settings');
  window._depositPercent = data?.depositPercent ?? 25;
}