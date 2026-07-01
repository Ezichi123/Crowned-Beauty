// ─────────────────────────────────────────────
// BOOKING
// Manages the stylist cards (active/inactive)
// based on selected service, and the Cal.com
// "View Availability" buttons.
// ─────────────────────────────────────────────

function updateStylistCards() {
  const ez = document.getElementById('bc-ezichi');
  const al = document.getElementById('bc-alexia');
  const ezNote = document.getElementById('bc-ez-note');
  const alNote = document.getElementById('bc-al-note');
  const hint = document.getElementById('bookingHint');

  if (!activeStyleId) {
    ez.className = 'booking-card bc-active';
    al.className = 'booking-card bc-active';
    ezNote.style.display = 'none';
    alNote.style.display = 'none';
    hint.textContent = 'Select your stylist to book — or pick a service above to filter';
    hint.className = 'booking-hint';
    return;
  }

  const style = findStyle(activeStyleId);
  if (!style) return;
  const st = style.stylists;

  if (st === 'both') {
    ez.className = 'booking-card bc-active';
    al.className = 'booking-card bc-active';
    ezNote.style.display = 'none';
    alNote.style.display = 'none';
    hint.textContent = `Both stylists offer ${style.name} — choose your artist below`;
  } else if (st === 'ezichi') {
    ez.className = 'booking-card bc-active';
    al.className = 'booking-card bc-inactive';
    ezNote.style.display = 'none';
    alNote.textContent = `Does not offer ${style.name}`;
    alNote.style.display = 'block';
    hint.textContent = `Ezichi specializes in ${style.name}`;
  } else if (st === 'alexia') {
    ez.className = 'booking-card bc-inactive';
    al.className = 'booking-card bc-active';
    alNote.style.display = 'none';
    ezNote.textContent = `Does not offer ${style.name}`;
    ezNote.style.display = 'block';
    hint.textContent = `Alexia specializes in ${style.name}`;
  }
  hint.className = 'booking-hint has-selection';
}

function bookWith(name) {
  const link = BOOKING_LINKS[name];
  if (link && link.startsWith('http')) {
    window.open(link, '_blank');
    return;
  }
  const n = name === 'ezichi' ? 'Ezichi' : 'Alexia';
  let svc = '';
  if (activeStyleId) {
    const s = findStyle(activeStyleId);
    if (s) svc = ' for ' + s.name;
  }
  alert(`Booking with ${n}${svc} — set the Cal.com link in client/js/config.js (BOOKING_LINKS) or via the admin panel.`);
}

let stylistLocations = null;

async function loadStylistLocations() {
  const data = await apiGet('/settings/stylist-locations');
  if (data) stylistLocations = data;
  return stylistLocations;
}

// Haversine formula — distance between two lat/lng points in miles
function haversineMiles(lat1, lng1, lat2, lng2) {
  const R = 3958.8; // Earth radius in miles
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a = Math.sin(dLat / 2) ** 2 +
            Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
            Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

async function detectLocation() {
  const r = document.getElementById('locationResult');
  r.textContent = 'Detecting your location...';

  if (!navigator.geolocation) {
    r.textContent = 'Geolocation not supported by your browser.';
    return;
  }

  if (!stylistLocations) await loadStylistLocations();
  if (!stylistLocations) {
    r.textContent = 'Could not load stylist locations.';
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (pos) => {
      const userLat = pos.coords.latitude;
      const userLng = pos.coords.longitude;
      const ez = stylistLocations.ezichi;
      const al = stylistLocations.alexia;
      const ezDist = haversineMiles(userLat, userLng, ez.lat, ez.lng);
      const alDist = haversineMiles(userLat, userLng, al.lat, al.lng);
      const closer = ezDist <= alDist ? 'Ezichi' : 'Alexia';
      const sameSpot = Math.abs(ezDist - alDist) < 0.5; // within half a mile

      let html;
      if (sameSpot) {
        html = `✦ Both stylists are at the <strong style="color:var(--gold)">same location</strong> — about ${ezDist.toFixed(1)} miles away.<br>
                <span style="font-size:.75rem;opacity:.6">Book with either stylist below ↓</span>`;
      } else {
        html = `<div style="line-height:1.9">
                  <strong style="color:var(--gold-light)">Ezichi</strong> · ${ezDist.toFixed(1)} miles away${closer === 'Ezichi' ? ' &nbsp;<span style="color:var(--gold)">✦ closest</span>' : ''}<br>
                  <strong style="color:var(--gold-light)">Alexia</strong> · ${alDist.toFixed(1)} miles away${closer === 'Alexia' ? ' &nbsp;<span style="color:var(--gold)">✦ closest</span>' : ''}
                </div>`;
      }
      r.innerHTML = html;
    },
    (err) => {
      r.textContent = err.code === 1
        ? 'Location access denied — please enable it in your browser.'
        : 'Could not detect location.';
    },
    { timeout: 10000 }
  );
}

// Helper for backend-loaded booking links to apply at runtime
async function loadBookingLinks() {
  const data = await apiGet('/settings/booking-links');
  if (data) {
    if (data.ezichi) BOOKING_LINKS.ezichi = data.ezichi;
    if (data.alexia) BOOKING_LINKS.alexia = data.alexia;
  }
}

function openStylistPicker() {
  if (!activeStyleId) return;
  const style = findStyle(activeStyleId);
  if (!style) return;

  const offersEzichi = style.stylists === 'both' || style.stylists === 'ezichi';
  const offersAlexia = style.stylists === 'both' || style.stylists === 'alexia';

  const eventMap = CATEGORY_EVENT_MAP[style._catId] || {};
  // _catId is set when we find the style — see helper below
  const ezSlug = eventMap.ezichi || '';
  const alSlug = eventMap.alexia || '';

  let html = '';

  html += `<button class="stylist-picker-btn${offersEzichi ? '' : ' disabled'}"
              ${offersEzichi ? `onclick="confirmStylistBooking('ezichi')"` : 'disabled'}>
              BOOK WITH EZICHI
            </button>`;
  if (offersEzichi && !ezSlug) {
    html += `<p class="stylist-picker-note">Booking link not yet set for this service — please contact us directly.</p>`;
  }

  html += `<button class="stylist-picker-btn${offersAlexia ? '' : ' disabled'}"
              ${offersAlexia && alSlug ? `onclick="confirmStylistBooking('alexia')"` : 'disabled'}>
              BOOK WITH ALEXIA
            </button>`;
  if (offersAlexia && !alSlug) {
    html += `<p class="stylist-picker-note">Alexia's online booking is coming soon — please contact us to book with her.</p>`;
  }

  document.getElementById('stylistPickerOptions').innerHTML = html;
  document.getElementById('stylistPickerOverlay').classList.add('open');
}

function closeStylistPicker() {
  document.getElementById('stylistPickerOverlay').classList.remove('open');
}

function confirmStylistBooking(stylist) {
  const style = findStyle(activeStyleId);
  if (!style) return;

  const eventMap = CATEGORY_EVENT_MAP[style._catId] || {};
  const slug = eventMap[stylist];
  const base = CALCOM_BASE[stylist];

  if (!slug || !base) {
    alert('Booking link not available yet for this stylist/service. Please contact us directly.');
    return;
  }

  // Rebuild summary text for notes
  let serviceLabel = style.name;
  let servicePrice = null;
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

  const chosenAddons = ADDONS.filter(a => selectedAddonIds.has(a.id));
  const addonsTotal = getAddonsTotal();
  const total = (Number(servicePrice) || 0) + addonsTotal;

  let notes = `Service: ${serviceLabel}`;
  if (chosenAddons.length) {
    notes += `\nAdd-ons: ${chosenAddons.map(a => a.name + ' ($' + a.price + ')').join(', ')}`;
  }
  notes += `\nTotal: $${total}`;

 const depositPercent = window._depositPercent ?? 25;
  const deposit = Math.round(total * (depositPercent / 100));

const url = `${base}/${slug}?notes=${encodeURIComponent(notes)}`;

  localStorage.setItem('pendingBooking', JSON.stringify({
    stylist,
    style: serviceLabel,
    addons: chosenAddons.map(a => `${a.name} ($${a.price})`),
    total,
    deposit,
    depositPercent,
    calcomUrl: url, // ← the actual booking link, now stored for deposit.html to use
  }));

  closeStylistPicker();
  window.location.href = 'deposit.html'; // single navigation, no competing tab 
}