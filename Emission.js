const mongoose = require('mongoose');

const EmissionSchema = new mongoose.Schema({
  department: {
    type: String,
    required: true,
    enum: ['H1 Hostel', 'H4 Hostel', 'H5 Hostel', 'H7 Hostel', 'H10 Hostel',
           'Main Building', 'Lecture Hall Complex', 'Library', 'Sports Complex', 'Canteen'],
  },
  date: {
    type: Date,
    required: true,
    default: Date.now,
  },
  electricity_kwh: { type: Number, default: 0 },
  diesel_litres:   { type: Number, default: 0 },
  vehicles_entered:{ type: Number, default: 0 },
  veg_meals:       { type: Number, default: 0 },
  nonveg_meals:    { type: Number, default: 0 },
  food_waste_kg:   { type: Number, default: 0 },
  water_kl:        { type: Number, default: 0 },

  // Computed CO₂ breakdown (stored for fast retrieval)
  co2: {
    electricity: Number,
    diesel:      Number,
    vehicles:    Number,
    food:        Number,
    food_waste:  Number,
    water:       Number,
    total:       Number,
  },

  submitted_by: { type: String, default: 'Admin' },
}, { timestamps: true });

// Index for fast date + department queries
EmissionSchema.index({ date: -1, department: 1 });

module.exports = mongoose.model('Emission', EmissionSchema);
