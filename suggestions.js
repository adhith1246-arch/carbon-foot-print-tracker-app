const express = require('express');
const router = express.Router();
const Emission = require('../models/Emission');
const { generateSuggestions } = require('../utils/co2Calculator');

// GET /api/suggestions — Smart suggestions based on today's data
router.get('/', async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const records = await Emission.find({ date: { $gte: today } });

    // Aggregate today's data
    const totals = records.reduce((acc, r) => ({
      electricity_kwh:  acc.electricity_kwh  + (r.electricity_kwh || 0),
      diesel_litres:    acc.diesel_litres    + (r.diesel_litres || 0),
      vehicles_entered: acc.vehicles_entered + (r.vehicles_entered || 0),
      veg_meals:        acc.veg_meals        + (r.veg_meals || 0),
      nonveg_meals:     acc.nonveg_meals     + (r.nonveg_meals || 0),
      food_waste_kg:    acc.food_waste_kg    + (r.food_waste_kg || 0),
    }), {
      electricity_kwh: 0, diesel_litres: 0, vehicles_entered: 0,
      veg_meals: 0, nonveg_meals: 0, food_waste_kg: 0,
    });

    const co2Totals = records.reduce((acc, r) => ({
      electricity: acc.electricity + (r.co2.electricity || 0),
      diesel:      acc.diesel      + (r.co2.diesel || 0),
      vehicles:    acc.vehicles    + (r.co2.vehicles || 0),
      food:        acc.food        + (r.co2.food || 0),
      food_waste:  acc.food_waste  + (r.co2.food_waste || 0),
    }), { electricity:0, diesel:0, vehicles:0, food:0, food_waste:0 });

    const suggestions = generateSuggestions(totals, co2Totals);
    res.json({ success: true, suggestions });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
