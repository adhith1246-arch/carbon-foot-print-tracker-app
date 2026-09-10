const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/campus-carbon';

// ─── Middleware ───
app.use(cors());
app.use(express.json());
app.use(express.static('../frontend'));

// ─── Routes ───
app.use('/api/emissions',  require('./routes/emissions'));
app.use('/api/leaderboard',require('./routes/leaderboard'));
app.use('/api/suggestions', require('./routes/suggestions'));

// ─── Health Check ───
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// ─── MongoDB Connection ───
mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected:', MONGO_URI);
    app.listen(PORT, () => {
      console.log(`🌱 Campus Carbon Tracker running on http://localhost:${PORT}`);
    });
  })
  .catch(err => {
    console.error('❌ MongoDB error:', err.message);
    console.log('💡 Starting server without DB (demo mode)...');
    app.listen(PORT, () => {
      console.log(`🌱 Server running (no DB) on http://localhost:${PORT}`);
    });
  });
