const express = require('express');
const router = express.Router();
const Emission = require('../models/Emission');

// GET /api/leaderboard — Ranked departments by lowest CO₂ this week
router.get('/', async (req, res) => {
  try {
    const since = new Date();
    since.setDate(since.getDate() - 7);

    const records = await Emission.find({ date: { $gte: since } });

    // Aggregate per department
    const deptMap = {};
    records.forEach(r => {
      if (!deptMap[r.department]) {
        deptMap[r.department] = { total: 0, days: 0, entries: 0 };
      }
      deptMap[r.department].total += r.co2.total || 0;
      deptMap[r.department].entries++;
    });

    const leaderboard = Object.entries(deptMap)
      .map(([name, data]) => ({
        department: name,
        total_co2: parseFloat(data.total.toFixed(1)),
        avg_daily: parseFloat((data.total / (data.entries || 1)).toFixed(1)),
        entries: data.entries,
      }))
      .sort((a, b) => a.total_co2 - b.total_co2);

    res.json({ success: true, leaderboard, period: '7 days' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
