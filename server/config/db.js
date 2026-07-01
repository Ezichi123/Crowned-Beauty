// MongoDB connection
const mongoose = require('mongoose');

async function connectDB() {
  try {
    if (!process.env.MONGODB_URI) {
      console.warn('⚠  MONGODB_URI not set — running without database (data won\'t persist server-side)');
      return;
    }
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✓  MongoDB connected');
  } catch (err) {
    console.error('✗  MongoDB connection error:', err.message);
    console.warn('   Server will start but database operations will fail.');
    console.warn('   Check your MONGODB_URI in .env');
  }
}

module.exports = connectDB;
