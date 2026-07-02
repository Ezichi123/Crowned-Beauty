// ─────────────────────────────────────────────
// GALLERY
// Loads each stylist's gallery from the backend
// (or localStorage), displays in a modal, and
// supports a fullscreen lightbox.
// ─────────────────────────────────────────────

let galleries = { ezichi: [], alexia: [] };

async function loadGalleries() {
  const fromApi = await apiGet('/gallery');
  if (fromApi && fromApi.ezichi && fromApi.alexia) {
    galleries = fromApi;
    saveGalleriesLocal();
  } else if (CONFIG.USE_LOCAL_FALLBACK) {
    try {
      const saved = localStorage.getItem('crowned_galleries');
      if (saved) galleries = JSON.parse(saved);
    } catch (e) {}
  }
}

function saveGalleriesLocal() {
  try { localStorage.setItem('crowned_galleries', JSON.stringify(galleries)); }
  catch (e) { console.warn('localStorage save failed', e); }
}

function openGallery(stylist) {
  const name = stylist === 'ezichi' ? 'EZICHI' : 'ALEXIA';
  document.getElementById('galModalName').textContent = name;
  renderGalleryGrid(stylist);
  document.getElementById('galleryModal').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeGallery() {
  document.getElementById('galleryModal').classList.remove('open');
  document.body.style.overflow = '';
}

function renderGalleryGrid(stylist) {
  const items = galleries[stylist] || [];
  const grid = document.getElementById('galleryGrid');
  if (items.length === 0) {
    grid.innerHTML = `<div class="gallery-empty"><div class="gallery-empty-icon">✦</div>Portfolio coming soon — check back to see ${stylist === 'ezichi' ? 'Ezichi' : 'Alexia'}'s latest work.</div>`;
    return;
  }
  let h = '';
  items.forEach((item, idx) => {
    if (item.type === 'image') {
      h += `<div class="gallery-item" onclick="viewItem('${stylist}', ${idx})"><img src="${item.src}" alt="Gallery item"></div>`;
    } else {
      h += `<div class="gallery-item" onclick="viewItem('${stylist}', ${idx})"><video src="${item.src}" muted></video><span class="video-tag">VIDEO</span></div>`;
    }
  });
  grid.innerHTML = h;
}

function viewItem(stylist, idx) {
  const item = galleries[stylist][idx];
  if (!item) return;
  const box = document.getElementById('lightboxContent');
  if (item.type === 'image') {
    box.innerHTML = `<img src="${item.src}" alt="Gallery">`;
  } else {
    box.innerHTML = `<video src="${item.src}" controls autoplay></video>`;
  }
  document.getElementById('lightbox').classList.add('open');
}

function closeLightbox() {
  document.getElementById('lightbox').classList.remove('open');
  document.getElementById('lightboxContent').innerHTML = '';
}

async function uploadFiles(stylist, inputEl) {
  const files = inputEl.files;
  if (!files || files.length === 0) return;

  // Try uploading to backend (Cloudinary). If that fails, store as data URL locally.
  const formData = new FormData();
  for (const f of files) formData.append('files', f);
  formData.append('stylist', stylist);

  const uploadResult = await apiUpload('/gallery/upload', formData);

  if (uploadResult && uploadResult.success && uploadResult.items) {
    // Backend returned Cloudinary URLs
    galleries[stylist] = galleries[stylist].concat(uploadResult.items);
    saveGalleriesLocal();
    renderAdminGallery(stylist);
    inputEl.value = '';
    return;
  }

  // Fallback: read as data URLs and store locally
  let loaded = 0;
  for (const f of files) {
    const isImage = f.type.startsWith('image/');
    const isVideo = f.type.startsWith('video/');
    if (!isImage && !isVideo) continue;
    const reader = new FileReader();
    reader.onload = (e) => {
      galleries[stylist].push({
        type: isImage ? 'image' : 'video',
        src: e.target.result,
        name: f.name,
      });
      loaded++;
      if (loaded === files.length) {
        saveGalleriesLocal();
        renderAdminGallery(stylist);
      }
    };
    reader.readAsDataURL(f);
  }
  inputEl.value = '';
}

async function removeGalleryItem(stylist, idx) {
  if (!confirm('Remove this item from gallery?')) return;
  const item = galleries[stylist][idx];

  // If the item has a backend ID, delete from server
  if (item && item._id) {
    await apiDelete(`/gallery/${item._id}`);
  }

  galleries[stylist].splice(idx, 1);
  saveGalleriesLocal();
  renderAdminGallery(stylist);
}

function renderAdminGallery(stylist) {
  const prev = document.getElementById('adminGalPrev-' + stylist);
  if (!prev) return;
  const items = galleries[stylist] || [];
  if (items.length === 0) {
    prev.innerHTML = '<p style="font-size:.7rem;color:rgba(245,237,216,.35);grid-column:1/-1;text-align:center;padding:.75rem">No items yet · Upload to get started</p>';
    return;
  }
  let h = '';
  items.forEach((item, idx) => {
    h += '<div class="admin-gal-item">';
    if (item.type === 'image') h += `<img src="${item.src}" alt="">`;
    else h += `<video src="${item.src}" muted></video>`;
    h += `<button class="admin-gal-remove" onclick="removeGalleryItem('${stylist}', ${idx})" title="Remove">✕</button>`;
    h += '</div>';
  });
  prev.innerHTML = h;
}

// ──── PROFILE PHOTOS ────
let profilePhotos = { ezichi: null, alexia: null };

async function loadProfilePhotos() {
  const data = await apiGet('/gallery/profile-photos');
  if (data) profilePhotos = data;
  renderStylistAvatars();
}

function renderStylistAvatars() {
  ['ezichi', 'alexia'].forEach(stylist => {
    const el = document.getElementById('avatar-' + stylist);
    if (!el) return;
    const photo = profilePhotos[stylist];
    const letter = stylist === 'ezichi' ? 'E' : 'A';
    if (photo && photo.src) {
      el.innerHTML = `<img src="${photo.src}" alt="${stylist === 'ezichi' ? 'Ezichi' : 'Alexia'}">`;
      el.classList.add('has-photo');
    } else {
      el.innerHTML = `${letter}<span class="avatar-note">Photo coming soon</span>`;
      el.classList.remove('has-photo');
    }
  });
}

async function uploadProfilePhoto(stylist, inputEl) {
  const file = inputEl.files[0];
  if (!file) return;
  if (!file.type.startsWith('image/')) {
    alert('Please choose an image file.');
    inputEl.value = '';
    return;
  }

  const formData = new FormData();
  formData.append('photo', file);
  formData.append('stylist', stylist);

  const result = await apiUpload('/gallery/profile-photo', formData);
  if (result && result.success) {
    profilePhotos[stylist] = { src: result.src };
    renderStylistAvatars();
    renderAdminProfilePhoto(stylist);
  } else {
    alert('Upload failed. Please try again.');
  }
  inputEl.value = '';
}

async function removeProfilePhoto(stylist) {
  if (!confirm('Remove this profile photo?')) return;
  await apiDelete(`/gallery/profile-photo/${stylist}`);
  profilePhotos[stylist] = null;
  renderStylistAvatars();
  renderAdminProfilePhoto(stylist);
}

function renderAdminProfilePhoto(stylist) {
  const el = document.getElementById('adminProfilePhotoPrev-' + stylist);
  if (!el) return;
  const photo = profilePhotos[stylist];
  if (photo && photo.src) {
    el.innerHTML = `
      <div class="admin-gal-item" style="width:90px;height:90px">
        <img src="${photo.src}" alt="">
        <button class="admin-gal-remove" onclick="removeProfilePhoto('${stylist}')" title="Remove">✕</button>
      </div>
    `;
  } else {
    el.innerHTML = '<p style="font-size:.7rem;color:rgba(245,237,216,.35);padding:.25rem 0">No photo uploaded yet</p>';
  }
}
