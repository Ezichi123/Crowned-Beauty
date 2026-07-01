// ─────────────────────────────────────────────
// CROWNED BEAUTY — SERVER ENTRY POINT
// ─────────────────────────────────────────────

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');

const app = express();
const PORT = process.env.PORT || 4000;

// ─── Connect to MongoDB ───
connectDB();

// ─── Middleware ───
app.use(cors({
  origin: process.env.CLIENT_URL || '*',
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));

// ─── Serve frontend ───
// In production, the Express server hosts the client files directly.
app.use(express.static(path.join(__dirname, '..', 'client')));

// ─── API routes ───
app.use('/api/auth', require('./routes/auth'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/gallery', require('./routes/gallery'));
app.use('/api/settings', require('./routes/settings'));

// ─── Fallback to index.html for SPA-like routing ───
app.get('*', (req, res) => {
  if (req.path.startsWith('/api')) return res.status(404).json({ error: 'API route not found' });
  res.sendFile(path.join(__dirname, '..', 'client', 'index.html'));
});

// ─── Error handler ───
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Server error', message: err.message });
});

app.listen(PORT, () => {
  console.log(`\n♛  Crowned Beauty server running on http://localhost:${PORT}`);
  console.log(`   Frontend: http://localhost:${PORT}`);
  console.log(`   API:      http://localhost:${PORT}/api\n`);
});
