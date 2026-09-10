/**
 * data.js — Sample Data & CO₂ Calculator
 * Works fully offline — no backend required for demo!
 */

// ─── CO₂ Emission Factors ───
const FACTORS = {
  electricity_kwh: 0.82,
  diesel_litre:    2.68,
  vehicle_km:      0.21,
  veg_meal:        0.50,
  nonveg_meal:     3.00,
  food_waste_kg:   2.50,
  water_kl:        0.34,
};

// ─── Calculate CO₂ from input data ───
function calcCO2(d) {
  const elec    = (d.elec    || 0) * FACTORS.electricity_kwh;
  const diesel  = (d.diesel  || 0) * FACTORS.diesel_litre;
  const vehicle = (d.vehicle || 0) * 2 * FACTORS.vehicle_km;
  const food    = (d.veg || 0) * FACTORS.veg_meal + (d.nonveg || 0) * FACTORS.nonveg_meal;
  const waste   = (d.waste   || 0) * FACTORS.food_waste_kg;
  const water   = (d.water   || 0) * FACTORS.water_kl;
  const total   = elec + diesel + vehicle + food + waste + water;
  return { elec, diesel, vehicle, food, waste, water, total };
}

// ─── Today's Demo Data ───
const TODAY_DATA = {
  elec: 520, diesel: 30, vehicle: 65,
  veg: 800, nonveg: 320, waste: 28, water: 120,
};
const TODAY_CO2 = calcCO2(TODAY_DATA);

// ─── Department Weekly Data ───
const DEPARTMENTS = [
  { name: 'H5 Hostel',         elec:180, diesel:5,  vehicle:10, veg:300, nonveg:80,  waste:5,  water:40 },
  { name: 'Library',           elec:95,  diesel:2,  vehicle:5,  veg:0,   nonveg:0,   waste:1,  water:10 },
  { name: 'Sports Complex',    elec:200, diesel:10, vehicle:20, veg:50,  nonveg:30,  waste:8,  water:80 },
  { name: 'H1 Hostel',         elec:210, diesel:8,  vehicle:15, veg:350, nonveg:90,  waste:7,  water:45 },
  { name: 'H4 Hostel',         elec:230, diesel:8,  vehicle:18, veg:360, nonveg:100, waste:9,  water:50 },
  { name: 'H7 Hostel',         elec:245, diesel:10, vehicle:20, veg:380, nonveg:110, waste:10, water:55 },
  { name: 'H10 Hostel',        elec:260, diesel:12, vehicle:22, veg:390, nonveg:120, waste:11, water:60 },
  { name: 'Lecture Hall Cplx', elec:380, diesel:15, vehicle:40, veg:100, nonveg:50,  waste:12, water:30 },
  { name: 'Main Building',     elec:430, diesel:20, vehicle:50, veg:50,  nonveg:30,  waste:8,  water:25 },
  { name: 'Canteen',           elec:310, diesel:25, vehicle:30, veg:900, nonveg:400, waste:45, water:150 },
].map(d => ({ ...d, co2: calcCO2(d) }))
 .sort((a, b) => a.co2.total - b.co2.total)
 .map((d, i) => ({ ...d, rank: i + 1 }));

// ─── 30-Day Trend (simulate realistic pattern) ───
const TREND_DATA = (() => {
  const data = [];
  const base = 1200;
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    // Weekend dip, weekday spike, slight downward trend
    const dayOfWeek = d.getDay();
    const weekend = (dayOfWeek === 0 || dayOfWeek === 6) ? 0.65 : 1;
    const trend    = 1 - (i * 0.003); // slight improvement over time
    const noise    = 0.85 + Math.random() * 0.3;
    const co2      = parseFloat((base * weekend * trend * noise).toFixed(1));
    data.push({ date: dateStr, co2 });
  }
  return data;
})();

// ─── Smart Suggestions ───
const SUGGESTIONS = [
  {
    icon: '💡', type: 'warn',
    title: 'High Electricity in Main Building',
    category: 'Electricity',
    desc: 'Main Building is consuming 430 kWh today — 43% above threshold. Switch off ACs in unused offices and use motion-sensor lighting.',
    co2_saving: '105.4',
    cost_saving: '₹680',
    effort: 'Low',
  },
  {
    icon: '🍽️', type: 'warn',
    title: 'Canteen Food Waste Alert',
    category: 'Food & Waste',
    desc: 'Canteen generated 45 kg of food waste today. Introduce pre-order system and reduce non-veg preparation by 20%.',
    co2_saving: '112.5',
    cost_saving: '₹450',
    effort: 'Medium',
  },
  {
    icon: '🚌', type: 'info',
    title: 'Launch Campus E-Shuttle Service',
    category: 'Transport',
    desc: '65 vehicles entered today. Launching 4 electric shuttles at peak hours (8AM–10AM, 4PM–6PM) can cut vehicle entries by 35%.',
    co2_saving: '27.3',
    cost_saving: '₹320',
    effort: 'High',
  },
  {
    icon: '☀️', type: 'good',
    title: 'Solar Panel Opportunity',
    category: 'Renewable Energy',
    desc: 'IIT Bombay rooftops can host 500 kW solar capacity. This would offset 60% of campus electricity CO₂ — approximately 255 kg/day.',
    co2_saving: '255.0',
    cost_saving: '₹3,200',
    effort: 'High',
  },
  {
    icon: '💧', type: 'info',
    title: 'Water Heating Optimization',
    category: 'Water & Energy',
    desc: 'Solar water heaters in hostels can reduce electric water heating by 70%, saving both water treatment and electricity emissions.',
    co2_saving: '64.8',
    cost_saving: '₹890',
    effort: 'Medium',
  },
  {
    icon: '♻️', type: 'good',
    title: 'Waste Segregation Program',
    category: 'Waste Management',
    desc: 'Proper wet/dry waste segregation in all hostels enables composting — reducing landfill methane by up to 80%.',
    co2_saving: '89.6',
    cost_saving: '₹560',
    effort: 'Low',
  },
];
