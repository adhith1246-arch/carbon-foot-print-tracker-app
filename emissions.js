const express = require('express');
const router = express.Router();
const Emission = require('../models/Emission');
const { calculateCO2 } = require('../utils/co2Calculator');

// POST /api/emissions/add — Submit daily data
router.post('/add', async (req, res) => {
  try {
    const co2 = calculateCO2(req.body);
    const emission = new Emission({ ...req.body, co2 });
    await emission.save();
    res.json({ success: true, data: emission });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// GET /api/emissions/today — Today's totals
router.get('/today', async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const records = await Emission.find({ date: { $gte: today } });

    const totals = records.reduce((acc, r) => {
      acc.total      += r.co2.total || 0;
      acc.electricity+= r.co2.electricity || 0;
      acc.diesel     += r.co2.diesel || 0;
      acc.vehicles   += r.co2.vehicles || 0;
      acc.food       += r.co2.food || 0;
      acc.food_waste += r.co2.food_waste || 0;
      acc.water      += r.co2.water || 0;
      return acc;
    }, { total:0, electricity:0, diesel:0, vehicles:0, food:0, food_waste:0, water:0 });

    res.json({ success: true, date: today, totals, count: records.length });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/emissions/trend?days=30 — Daily trend
router.get('/trend', async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 30;
    const since = new Date();
    since.setDate(since.getDate() - days);

    const records = await Emission.find({ date: { $gte: since } }).sort({ date: 1 });

    // Group by date
    const byDate = {};
    records.forEach(r => {
      const d = r.date.toISOString().split('T')[0];
      byDate[d] = (byDate[d] || 0) + (r.co2.total || 0);
    });

    const trend = Object.entries(byDate).map(([date, co2]) => ({ date, co2 }));
    res.json({ success: true, trend });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/emissions/recent — Last 10 entries
router.get('/recent', async (req, res) => {
  try {
    const records = await Emission.find().sort({ createdAt: -1 }).limit(10);
    res.json({ success: true, records });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
