// ─────────────────────────────────────────────
// SEED SCRIPT
// Populates MongoDB with the default service menu.
// Run: npm run seed
// ─────────────────────────────────────────────

require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const Category = require('./models/Category');

const DEFAULTS = [
  { id: 'cat_knotless', name: 'KNOTLESS BRAIDS', styles: [
    { id: 'trad_knotless', name: 'Traditional Knotless Braids', stylists: 'both',
      notes: '✦ With hair provided: +$30 · ✦ Thigh length add-on: +$50',
      sizes: [
        { label: 'LARGE',    hasLengths: true, lengths: [{name:'Butt Length',price:170},{name:'Thigh Length',price:220}] },
        { label: 'MEDIUM',   hasLengths: true, lengths: [{name:'Butt Length',price:200},{name:'Thigh Length',price:250}] },
        { label: 'S-MEDIUM', hasLengths: true, lengths: [{name:'Butt Length',price:220},{name:'Thigh Length',price:270}] },
        { label: 'SMALL',    hasLengths: true, lengths: [{name:'Butt Length',price:250},{name:'Thigh Length',price:320}] },
      ]},
  ]},
  { id: 'cat_goddess', name: 'GODDESS BRAIDS', styles: [
    { id: 'goddess_braids', name: 'Goddess Braids', stylists: 'both',
      notes: '✦ With hair (human curls): +$45 · ✦ Boho add-on: +$20',
      sizes: [
        { label: 'LARGE',    hasLengths: true, lengths: [{name:'Butt Length',price:190},{name:'Thigh Length',price:240}] },
        { label: 'MEDIUM',   hasLengths: true, lengths: [{name:'Butt Length',price:220},{name:'Thigh Length',price:null}] },
        { label: 'S-MEDIUM', hasLengths: true, lengths: [{name:'Butt Length',price:240},{name:'Thigh Length',price:null}] },
        { label: 'SMALL',    hasLengths: true, lengths: [{name:'Butt Length',price:270},{name:'Thigh Length',price:null}] },
      ]},
  ]},
  { id: 'cat_boho', name: 'BOHO BRAIDS', styles: [
    { id: 'boho_braids', name: 'Boho Braids', stylists: 'both',
      notes: '✦ With hair (human hair curls): +$165',
      sizes: [
        { label: 'LARGE',    hasLengths: true, lengths: [{name:'Butt Length',price:210},{name:'Thigh Length',price:260}] },
        { label: 'MEDIUM',   hasLengths: true, lengths: [{name:'Butt Length',price:240},{name:'Thigh Length',price:290}] },
        { label: 'S-MEDIUM', hasLengths: true, lengths: [{name:'Butt Length',price:260},{name:'Thigh Length',price:310}] },
        { label: 'SMALL',    hasLengths: true, lengths: [{name:'Butt Length',price:290},{name:'Thigh Length',price:340}] },
      ]},
  ]},
  { id: 'cat_fulani', name: 'FULANI', styles: [
    { id: 'fulani_braids', name: 'Fulani Braids', stylists: 'both', notes: '✦ With hair provided: +$30',
      sizes: [
        { label: 'LARGE',    hasLengths: true, lengths: [{name:'Mid-back',price:null},{name:'Butt Length',price:null},{name:'Thigh Length',price:null}] },
        { label: 'MEDIUM',   hasLengths: true, lengths: [{name:'Mid-back',price:null},{name:'Butt Length',price:null},{name:'Thigh Length',price:null}] },
        { label: 'S-MEDIUM', hasLengths: true, lengths: [{name:'Mid-back',price:null},{name:'Butt Length',price:null},{name:'Thigh Length',price:null}] },
        { label: 'SMALL',    hasLengths: true, lengths: [{name:'Mid-back',price:null},{name:'Butt Length',price:null},{name:'Thigh Length',price:null}] },
      ]},
  ]},
  { id: 'cat_cornrows', name: 'CORNROWS', styles: [
    { id: 'straight_backs', name: 'Straight Backs', stylists: 'both', notes: '✦ With hair provided: +$30',
      sizes: [
        { label: 'LARGE',    hasLengths: true, lengths: [{name:'Mid-back',price:null},{name:'Butt Length',price:null},{name:'Thigh Length',price:null}] },
        { label: 'MEDIUM',   hasLengths: true, lengths: [{name:'Mid-back',price:null},{name:'Butt Length',price:null},{name:'Thigh Length',price:null}] },
        { label: 'S-MEDIUM', hasLengths: true, lengths: [{name:'Mid-back',price:null},{name:'Butt Length',price:null},{name:'Thigh Length',price:null}] },
        { label: 'SMALL',    hasLengths: true, lengths: [{name:'Mid-back',price:null},{name:'Butt Length',price:null},{name:'Thigh Length',price:null}] },
      ]},
  ]},
  { id: 'cat_locs', name: 'LOCS & TWISTS', styles: [
    { id: 'butterfly_locs', name: 'Locs / Butterfly Locs', stylists: 'both', notes: '',
      sizes: [
        { label: 'LARGE',    hasLengths: false, lengths: [], price: null },
        { label: 'MEDIUM',   hasLengths: false, lengths: [], price: null },
        { label: 'S-MEDIUM', hasLengths: false, lengths: [], price: null },
      ]},
    { id: 'micro_twists', name: 'Micro Twists', stylists: 'both', notes: '✦ Human hair: Short +$130 · Long +$200 · ✦ Synthetic: +$30',
      sizes: [
        { label: 'SHORT', hasLengths: false, lengths: [], price: null },
        { label: 'LONG',  hasLengths: false, lengths: [], price: null },
      ]},
    { id: 'mini_twists', name: 'Mini Twists', stylists: 'both', notes: '✦ Human hair: Short +$130 · Long +$200 · ✦ Synthetic: +$30',
      sizes: [
        { label: 'SHORT', hasLengths: false, lengths: [], price: null },
        { label: 'LONG',  hasLengths: false, lengths: [], price: null },
      ]},
  ]},
];

async function seed() {
  await connectDB();
  await new Promise(r => setTimeout(r, 1000)); // wait for connection

  try {
    console.log('Wiping existing categories...');
    await Category.deleteMany({});

    console.log('Inserting defaults...');
    const docs = DEFAULTS.map((cat, i) => ({ ...cat, order: i }));
    await Category.insertMany(docs);

    console.log(`✓ Seeded ${docs.length} categories.`);
    process.exit(0);
  } catch (err) {
    console.error('Seed failed:', err);
    process.exit(1);
  }
}

seed();
