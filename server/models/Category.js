// Mongoose model for service categories
const mongoose = require('mongoose');

const LengthSchema = new mongoose.Schema({
  name: String,
  price: { type: Number, default: null },
}, { _id: false });

const SizeSchema = new mongoose.Schema({
  label: String,
  hasLengths: { type: Boolean, default: true },
  lengths: [LengthSchema],
  price: { type: Number, default: null }, // used when hasLengths is false
}, { _id: false });

const StyleSchema = new mongoose.Schema({
  id: String,
  name: String,
  stylists: { type: String, enum: ['both', 'ezichi', 'alexia'], default: 'both' },
  notes: { type: String, default: '' },
  sizes: [SizeSchema],
}, { _id: false });

const CategorySchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  order: { type: Number, default: 0 },
  styles: [StyleSchema],
}, { timestamps: true });

module.exports = mongoose.model('Category', CategorySchema);
