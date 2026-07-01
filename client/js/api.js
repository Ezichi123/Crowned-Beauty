// ─────────────────────────────────────────────
// API CLIENT
// Thin wrapper around fetch() that talks to the
// Node.js backend. Falls back to localStorage if
// the backend isn't running.
// ─────────────────────────────────────────────

let adminToken = localStorage.getItem('crowned_token') || null;

async function apiGet(path) {
  try {
    const res = await fetch(CONFIG.API_BASE + path);
    if (!res.ok) throw new Error('API error: ' + res.status);
    return await res.json();
  } catch (err) {
    console.warn('API GET failed (' + path + '):', err.message);
    return null;
  }
}

async function apiPost(path, body, auth = false) {
  try {
    const headers = { 'Content-Type': 'application/json' };
    if (auth && adminToken) headers['Authorization'] = 'Bearer ' + adminToken;
    const res = await fetch(CONFIG.API_BASE + path, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error('API error: ' + res.status);
    return await res.json();
  } catch (err) {
    console.warn('API POST failed (' + path + '):', err.message);
    return null;
  }
}

async function apiPut(path, body) {
  try {
    const headers = { 'Content-Type': 'application/json' };
    if (adminToken) headers['Authorization'] = 'Bearer ' + adminToken;
    const res = await fetch(CONFIG.API_BASE + path, {
      method: 'PUT',
      headers,
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error('API error: ' + res.status);
    return await res.json();
  } catch (err) {
    console.warn('API PUT failed (' + path + '):', err.message);
    return null;
  }
}

async function apiDelete(path) {
  try {
    const headers = {};
    if (adminToken) headers['Authorization'] = 'Bearer ' + adminToken;
    const res = await fetch(CONFIG.API_BASE + path, {
      method: 'DELETE',
      headers,
    });
    if (!res.ok) throw new Error('API error: ' + res.status);
    return await res.json();
  } catch (err) {
    console.warn('API DELETE failed (' + path + '):', err.message);
    return null;
  }
}

async function apiUpload(path, formData) {
  try {
    const headers = {};
    if (adminToken) headers['Authorization'] = 'Bearer ' + adminToken;
    const res = await fetch(CONFIG.API_BASE + path, {
      method: 'POST',
      headers,
      body: formData,
    });
    if (!res.ok) throw new Error('API error: ' + res.status);
    return await res.json();
  } catch (err) {
    console.warn('API UPLOAD failed (' + path + '):', err.message);
    return null;
  }
}
