/**
 * CO₂ Emission Factors (kg CO₂ per unit)
 * Sources: IPCC, Central Electricity Authority India, DEFRA
 */
const FACTORS = {
  electricity_kwh: 0.82,    // India grid avg emission factor (CEA 2023)
  diesel_litre:    2.68,    // Diesel combustion
  petrol_litre:    2.31,    // Petrol combustion
  vehicle_km:      0.21,    // Average car per km
  veg_meal:        0.50,    // Vegetarian meal
  nonveg_meal:     3.00,    // Non-vegetarian meal (chicken)
  food_waste_kg:   2.50,    // Landfill food waste (methane emission)
  water_kl:        0.34,    // Water treatment per kilolitre
};

/**
 * Calculate CO₂ emissions for a single data entry
 * @param {Object} data - Daily emission data
 * @returns {Object} Breakdown of CO₂ by source + total
 */
function calculateCO2(data) {
  const breakdown = {
    electricity: parseFloat(((data.electricity_kwh || 0) * FACTORS.electricity_kwh).toFixed(2)),
    diesel:      parseFloat(((data.diesel_litres || 0)  * FACTORS.diesel_litre).toFixed(2)),
    vehicles:    parseFloat(((data.vehicles_entered || 0) * 2 * FACTORS.vehicle_km).toFixed(2)), // avg 2km trip
    food:        parseFloat((
                   (data.veg_meals || 0)    * FACTORS.veg_meal +
                   (data.nonveg_meals || 0) * FACTORS.nonveg_meal
                 ).toFixed(2)),
    food_waste:  parseFloat(((data.food_waste_kg || 0) * FACTORS.food_waste_kg).toFixed(2)),
    water:       parseFloat(((data.water_kl || 0) * FACTORS.water_kl).toFixed(2)),
  };

  breakdown.total = parseFloat(
    Object.values(breakdown).reduce((sum, v) => sum + v, 0).toFixed(2)
  );

  return breakdown;
}

/**
 * Generate smart suggestions based on emission data
 * @param {Object} data - Daily emission data
 * @param {Object} co2 - Computed CO₂ breakdown
 * @returns {Array} List of suggestion objects
 */
function generateSuggestions(data, co2) {
  const suggestions = [];

  if (co2.electricity > 350) {
    suggestions.push({
      icon: '💡',
      type: 'warn',
      title: 'High Electricity Consumption',
      message: `Labs and classrooms are consuming above threshold. Switch off ACs and lights in unoccupied rooms.`,
      saving: `~${((co2.electricity - 350) * 0.3).toFixed(1)} kg CO₂/day`,
    });
  }

  if (co2.food_waste > 25) {
    suggestions.push({
      icon: '🍽️',
      type: 'warn',
      title: 'Excess Food Waste in Canteen',
      message: `Prepare 15-20% less non-veg items or introduce a pre-order system to reduce waste.`,
      saving: `~${(co2.food_waste * 0.4).toFixed(1)} kg CO₂/day`,
    });
  }

  if (co2.vehicles > 50) {
    suggestions.push({
      icon: '🚌',
      type: 'info',
      title: 'High Vehicle Entry Count',
      message: `Encourage carpooling and use of campus e-shuttles. Restrict single-occupancy vehicles on peak days.`,
      saving: `~${(co2.vehicles * 0.3).toFixed(1)} kg CO₂/day`,
    });
  }

  if (co2.electricity < 300) {
    suggestions.push({
      icon: '✅',
      type: 'good',
      title: 'Great Electricity Usage Today!',
      message: `Electricity consumption is below target. Keep up the energy-saving habits.`,
      saving: `Already saving ~${(300 - co2.electricity).toFixed(1)} kg CO₂`,
    });
  }

  suggestions.push({
    icon: '☀️',
    type: 'info',
    title: 'Switch to Renewable Energy',
    message: `Installing 500 kW solar panels on rooftops could offset up to 60% of campus electricity emissions.`,
    saving: `~${(co2.electricity * 0.6).toFixed(1)} kg CO₂/day`,
  });

  return suggestions;
}

module.exports = { calculateCO2, generateSuggestions, FACTORS };
