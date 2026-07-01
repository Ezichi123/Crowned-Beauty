// ─────────────────────────────────────────────
// APP CONFIG
// ─────────────────────────────────────────────
// In development the backend runs on http://localhost:4000
// In production this should point to your deployed backend URL.
// You can change this without touching any other code.

const CONFIG = {
  // Change this to your production backend URL when deploying
  API_BASE: (location.hostname === 'localhost' || location.hostname === '127.0.0.1')
    ? 'http://localhost:4000/api'
    : '/api',

  // If the user disables the backend or it's unreachable,
  // fall back to localStorage for demo purposes.
  USE_LOCAL_FALLBACK: true,
};

// Booking links — these get loaded from the backend in production,
// but you can override here for quick testing.
const BOOKING_LINKS = {
  ezichi: '',  // e.g. 'https://cal.com/ezichi'
  alexia: '',
};
