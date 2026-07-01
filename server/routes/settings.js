// Generic settings (business info, booking links, etc.)
const express = require('express');
const Setting = require('../models/Setting');
const auth = require('../middleware/auth');

const router = express.Router();

async function getSetting(key, fallback = null) {
  const doc = await Setting.findOne({ key });
  return doc ? doc.value : fallback;
}

async function setSetting(key, value) {
  await Setting.findOneAndUpdate(
    { key },
    { key, value },
    { upsert: true, new: true }
  );
}

// Business info
router.get('/business', async (req, res) => {
  const value = await getSetting('business', {
    email: 'crownedbeauty@email.com',
    instagram: '@crownedbeauty',
    location: 'Upper Marlboro, MD',
    hours: 'By Appointment Only',
  });
  res.json(value);
});

router.put('/business', auth, async (req, res) => {
  await setSetting('business', req.body);
  res.json({ success: true });
});

// Booking links
router.get('/booking-links', async (req, res) => {
  const value = await getSetting('booking-links', { ezichi: '', alexia: '' });
  res.json(value);
});

router.put('/booking-links', auth, async (req, res) => {
  await setSetting('booking-links', req.body);
  res.json({ success: true });
});

// Stylist locations — { ezichi: {lat, lng, city}, alexia: {lat, lng, city} }
router.get('/stylist-locations', async (req, res) => {
  const value = await getSetting('stylist-locations', {
    ezichi: { lat: 38.8146, lng: -76.7497, city: 'Upper Marlboro, MD' },
    alexia: { lat: 38.8146, lng: -76.7497, city: 'Upper Marlboro, MD' },
  });
  res.json(value);
});

router.put('/stylist-locations', auth, async (req, res) => {
  await setSetting('stylist-locations', req.body);
  res.json({ success: true });
});

// Add-ons — flat list of { id, name, price, active }
router.get('/addons', async (req, res) => {
  const value = await getSetting('addons', [
    { id: 'addon_hair', name: 'Braiding Hair Provided', price: 30, active: true },
    { id: 'addon_curls', name: 'Human Hair Curls', price: 45, active: true },
  ]);
  res.json(value);
});

router.put('/addons', auth, async (req, res) => {
  await setSetting('addons', req.body);
  res.json({ success: true });
});

// Category → Cal.com event slug, per stylist
// Shape: { [categoryId]: { ezichi: 'slug', alexia: 'slug' } }
router.get('/category-event-map', async (req, res) => {
  const value = await getSetting('category-event-map', {});
  res.json(value);
});

router.put('/category-event-map', auth, async (req, res) => {
  await setSetting('category-event-map', req.body);
  res.json({ success: true });
});

// Cal.com base profile URLs (username portion) — used to build event URLs
router.get('/calcom-base', async (req, res) => {
  const value = await getSetting('calcom-base', {
    ezichi: 'https://cal.com/ezichi-chimezie-usvluc',
    alexia: '',
  });
  res.json(value);
});

router.put('/calcom-base', auth, async (req, res) => {
  await setSetting('calcom-base', req.body);
  res.json({ success: true });
});

// Deposit settings — percentage + Cash App tags per stylist
router.get('/deposit-settings', async (req, res) => {
  const value = await getSetting('deposit-settings', {
    depositPercent: 25,
    cashapp: { ezichi: '', alexia: '' },
  });
  res.json(value);
});

router.put('/deposit-settings', auth, async (req, res) => {
  await setSetting('deposit-settings', req.body);
  res.json({ success: true });
});
module.exports = router;
