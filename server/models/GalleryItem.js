// Mongoose model for portfolio items
const mongoose = require('mongoose');

const GalleryItemSchema = new mongoose.Schema({
  stylist: { type: String, enum: ['ezichi', 'alexia'], required: true, index: true },
  type: { type: String, enum: ['image', 'video'], required: true },
  src: { type: String, required: true }, // Cloudinary URL
  publicId: String, // Cloudinary public_id, for deletion
  name: String,
  order: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('GalleryItem', GalleryItemSchema);
