// ─────────────────────────────────────────────
// MAIN
// Boots the app: loads data, renders the UI.
// ─────────────────────────────────────────────

async function init() {
  // Load data from backend (with localStorage fallback)
  await Promise.all([
    loadCategories(),
    loadGalleries(),
    loadBookingLinks(),
    loadStylistLocations(),
    loadAddons(),
    loadCategoryEventMap(),
    loadCalcomBase(),
    loadDepositPercent(),
  ]);

  // Render services
  renderTabs();
  renderTab(currentTab);
  renderAddons();
}

document.addEventListener('DOMContentLoaded', init);
