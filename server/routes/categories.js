// CRUD for service categories
const express = require('express');
const Category = require('../models/Category');
const auth = require('../middleware/auth');

const router = express.Router();

// GET all categories (public — for frontend display)
router.get('/', async (req, res) => {
  try {
    const cats = await Category.find().sort({ order: 1, createdAt: 1 }).lean();
    // Strip mongoose-specific fields for cleaner response
    res.json(cats.map(c => ({
      id: c.id,
      name: c.name,
      styles: c.styles,
    })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT — replace the entire categories tree (admin only)
// This matches our frontend's "save everything" pattern.
// For more granular ops, you'd add POST/PUT/DELETE per category.
router.put('/', auth, async (req, res) => {
  try {
    const incoming = req.body;
    if (!Array.isArray(incoming)) {
      return res.status(400).json({ error: 'Body must be an array of categories' });
    }
    // Wipe and reinsert (simplest reliable strategy for nested data)
    await Category.deleteMany({});
    const docs = incoming.map((cat, i) => ({
      id: cat.id,
      name: cat.name,
      order: i,
      styles: cat.styles || [],
    }));
    await Category.insertMany(docs);
    res.json({ success: true, count: docs.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
