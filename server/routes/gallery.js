// Gallery upload + retrieval via Cloudinary
const express = require('express');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const GalleryItem = require('../models/GalleryItem');
const auth = require('../middleware/auth');

const router = express.Router();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Multer holds files in memory until we stream them to Cloudinary
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 100 * 1024 * 1024 }, // 100 MB per file
});

// Helper: upload a single buffer to Cloudinary
function uploadToCloudinary(buffer, resourceType, folder) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { resource_type: resourceType, folder },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    stream.end(buffer);
  });
}

// GET — all gallery items grouped by stylist (public)
router.get('/', async (req, res) => {
  try {
    const items = await GalleryItem.find().sort({ createdAt: -1 }).lean();
    const grouped = { ezichi: [], alexia: [] };
    items.forEach(it => {
      const target = grouped[it.stylist];
      if (target) {
        target.push({
          _id: it._id,
          type: it.type,
          src: it.src,
          name: it.name,
        });
      }
    });
    res.json(grouped);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const Setting = require('../models/Setting');

// GET — profile photos for both stylists (public)
router.get('/profile-photos', async (req, res) => {
  try {
    const doc = await Setting.findOne({ key: 'profile-photos' });
    res.json(doc ? doc.value : {});
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /profile-photo — upload or replace a stylist's profile photo (admin only)
router.post('/profile-photo', auth, upload.single('photo'), async (req, res) => {
  try {
    const stylist = req.body.stylist;
    if (!['ezichi', 'alexia'].includes(stylist)) {
      return res.status(400).json({ error: 'Invalid stylist' });
    }
    if (!req.file) {
      return res.status(400).json({ error: 'No file received' });
    }
    if (!req.file.mimetype.startsWith('image/')) {
      return res.status(400).json({ error: 'Profile photo must be an image' });
    }

    const existing = await Setting.findOne({ key: 'profile-photos' });
    const current = existing ? existing.value : {};

    // Delete the old photo from Cloudinary first, if one exists
    if (current[stylist] && current[stylist].publicId) {
      try {
        await cloudinary.uploader.destroy(current[stylist].publicId, { resource_type: 'image' });
      } catch (e) { console.warn('Cloudinary delete failed:', e.message); }
    }

    const uploaded = await uploadToCloudinary(req.file.buffer, 'image', `crowned-beauty/${stylist}/profile`);
    const updated = { ...current, [stylist]: { src: uploaded.secure_url, publicId: uploaded.public_id } };

    await Setting.findOneAndUpdate(
      { key: 'profile-photos' },
      { key: 'profile-photos', value: updated },
      { upsert: true }
    );

    res.json({ success: true, src: uploaded.secure_url });
  } catch (err) {
    console.error('Profile photo upload error:', err);
    res.status(500).json({ error: err.message });
  }
});

// DELETE /profile-photo/:stylist — remove a stylist's profile photo (admin only)
router.delete('/profile-photo/:stylist', auth, async (req, res) => {
  try {
    const stylist = req.params.stylist;
    if (!['ezichi', 'alexia'].includes(stylist)) {
      return res.status(400).json({ error: 'Invalid stylist' });
    }
    const existing = await Setting.findOne({ key: 'profile-photos' });
    const current = existing ? existing.value : {};

    if (current[stylist] && current[stylist].publicId) {
      try {
        await cloudinary.uploader.destroy(current[stylist].publicId, { resource_type: 'image' });
      } catch (e) { console.warn('Cloudinary delete failed:', e.message); }
    }
    delete current[stylist];

    await Setting.findOneAndUpdate(
      { key: 'profile-photos' },
      { key: 'profile-photos', value: current },
      { upsert: true }
    );

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /upload — multipart form upload (admin only)
router.post('/upload', auth, upload.array('files', 20), async (req, res) => {
  try {
    const stylist = req.body.stylist;
    if (!['ezichi', 'alexia'].includes(stylist)) {
      return res.status(400).json({ error: 'Invalid stylist' });
    }
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files received' });
    }

    const items = [];
    for (const f of req.files) {
      const isImage = f.mimetype.startsWith('image/');
      const isVideo = f.mimetype.startsWith('video/');
      if (!isImage && !isVideo) continue;
      const resourceType = isImage ? 'image' : 'video';
      const folder = `crowned-beauty/${stylist}`;

      const uploaded = await uploadToCloudinary(f.buffer, resourceType, folder);
      const doc = await GalleryItem.create({
        stylist,
        type: isImage ? 'image' : 'video',
        src: uploaded.secure_url,
        publicId: uploaded.public_id,
        name: f.originalname,
      });

      items.push({
        _id: doc._id,
        type: doc.type,
        src: doc.src,
        name: doc.name,
      });
    }

    res.json({ success: true, items });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ error: err.message });
  }
});

// DELETE — remove a gallery item (admin only)
router.delete('/:id', auth, async (req, res) => {
  try {
    const item = await GalleryItem.findById(req.params.id);
    if (!item) return res.status(404).json({ error: 'Not found' });
    // Delete from Cloudinary
    if (item.publicId) {
      try {
        await cloudinary.uploader.destroy(item.publicId, {
          resource_type: item.type === 'video' ? 'video' : 'image',
        });
      } catch (e) { console.warn('Cloudinary delete failed:', e.message); }
    }
    await item.deleteOne();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
