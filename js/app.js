/**
 * app.js — Main application logic
 * Navigation, page rendering, admin form, live CO₂ preview
 */

// ─── Navigation ─────────────────────────────────────────
function showPage(name) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));

  document.getElementById(`page-${name}`).classList.add('active');
  document.getElementById(`nav-${name}`).classList.add('active');

  // Re-render charts on resize after tab switch
  if (name === 'dashboard') {
    setTimeout(() => { renderBar(); renderLine(); }, 50);
  }
}

// ─── Dashboard Initialization ────────────────────────────
function initDashboard() {
  // Set today's date
  document.getElementById('current-date').textContent =
    new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

  // Animate stat cards
  animateNumber(document.getElementById('stat-total'),   TODAY_CO2.total,   1);
  animateNumber(document.getElementById('stat-elec'),    TODAY_CO2.elec,    1);
  animateNumber(document.getElementById('stat-vehicle'), TODAY_CO2.vehicle, 1);
  animateNumber(document.getElementById('stat-food'),    TODAY_CO2.food + TODAY_CO2.waste, 1);

  // Render all charts
  renderDonut();
  renderBar();
  renderLine();

  // Dashboard Suggestions (top 3)
  const dashSug = document.getElementById('dashboard-suggestions');
  dashSug.innerHTML = SUGGESTIONS.slice(0, 3).map(s => `
    <div class="suggestion-card">
      <div class="suggestion-icon ${s.type}">${s.icon}</div>
      <div class="suggestion-text">
        <h4>${s.title}</h4>
        <p>${s.desc.substring(0, 80)}...</p>
        <div class="suggestion-saving">💚 Save ${s.co2_saving} kg CO₂/day</div>
      </div>
    </div>
  `).join('');
}

// ─── Leaderboard Initialization ──────────────────────────
function initLeaderboard() {
  const medals = ['🥇', '🥈', '🥉'];
  const medalClass = ['gold', 'silver', 'bronze'];

  // Trophy cards (top 3)
  const trophy = document.getElementById('trophy-grid');
  trophy.innerHTML = DEPARTMENTS.slice(0, 3).map((d, i) => `
    <div class="trophy-card ${medalClass[i]}">
      <span class="trophy-emoji">${medals[i]}</span>
      <div class="trophy-name">${d.name}</div>
      <div class="trophy-score">
        Weekly CO₂: <span>${d.co2.total.toFixed(1)} kg</span>
      </div>
    </div>
  `).join('');

  // Full table
  const maxCO2 = Math.max(...DEPARTMENTS.map(d => d.co2.total));
  const target = 800;
  const rankClasses = ['r1', 'r2', 'r3'];

  const body = document.getElementById('lb-table-body');
  body.innerHTML = DEPARTMENTS.map((d, i) => {
    const pct  = Math.round((d.co2.total / maxCO2) * 100);
    const diff = d.co2.total - target;
    const vsTarget = diff > 0
      ? `<span style="color:var(--red)">+${diff.toFixed(0)} kg</span>`
      : `<span style="color:var(--green)">${diff.toFixed(0)} kg</span>`;
    const status = d.co2.total < target
      ? `<span class="score-pill">✅ On Track</span>`
      : `<span style="font-size:12px;color:var(--red);font-weight:700">⚠️ Over Limit</span>`;

    return `
      <div class="table-row">
        <div><div class="rank-badge ${rankClasses[i] || ''}">${d.rank}</div></div>
        <div style="font-weight:600">${d.name}</div>
        <div style="font-weight:700;color:var(--green)">${d.co2.total.toFixed(1)}</div>
        <div>${(d.co2.total / 7).toFixed(1)}</div>
        <div>${vsTarget}</div>
        <div>${status}</div>
      </div>
    `;
  }).join('');
}

// ─── Suggestions Page Initialization ─────────────────────
function initSuggestions() {
  const totalSaving = SUGGESTIONS.reduce((s, x) => s + parseFloat(x.co2_saving), 0);
  document.getElementById('suggestion-saving-badge').textContent =
    `Save up to ${totalSaving.toFixed(0)} kg CO₂/day`;

  const grid = document.getElementById('suggestions-page-grid');
  grid.innerHTML = SUGGESTIONS.map(s => `
    <div class="suggestion-full-card">
      <div class="sfc-header">
        <div class="sfc-icon ${s.type}">${s.icon}</div>
        <div>
          <div class="sfc-title">${s.title}</div>
          <div class="sfc-category">${s.category}</div>
        </div>
      </div>
      <p class="sfc-desc">${s.desc}</p>
      <div class="sfc-impact">
        <div class="impact-pill">
          <div class="val">${s.co2_saving}</div>
          <div class="lbl">kg CO₂/day</div>
        </div>
        <div class="impact-pill">
          <div class="val">${s.cost_saving}</div>
          <div class="lbl">Cost Savings</div>
        </div>
        <div class="impact-pill">
          <div class="val">${s.effort}</div>
          <div class="lbl">Effort</div>
        </div>
      </div>
    </div>
  `).join('');
}

// ─── Admin: Live CO₂ Preview ──────────────────────────────
function updatePreview() {
  const d = {
    elec:    parseFloat(document.getElementById('elec-input').value)     || 0,
    diesel:  parseFloat(document.getElementById('diesel-input').value)   || 0,
    vehicle: parseFloat(document.getElementById('vehicles-input').value) || 0,
    veg:     parseFloat(document.getElementById('veg-input').value)      || 0,
    nonveg:  parseFloat(document.getElementById('nonveg-input').value)   || 0,
    waste:   parseFloat(document.getElementById('foodwaste-input').value)|| 0,
    water:   parseFloat(document.getElementById('water-input').value)    || 0,
  };
  const co2 = calcCO2(d);
  document.getElementById('prev-elec').textContent    = co2.elec.toFixed(1);
  document.getElementById('prev-vehicle').textContent = co2.vehicle.toFixed(1);
  document.getElementById('prev-food').textContent    = (co2.food + co2.waste).toFixed(1);
  document.getElementById('prev-total').textContent   = co2.total.toFixed(1);
}

// ─── Admin: Submit Form ────────────────────────────────────
const recentSubmissions = [
  { dept: 'H4 Hostel',    date: 'Jul 15', co2: 487.3 },
  { dept: 'Canteen',       date: 'Jul 15', co2: 892.1 },
  { dept: 'Main Building', date: 'Jul 14', co2: 654.0 },
  { dept: 'H1 Hostel',    date: 'Jul 14', co2: 421.5 },
  { dept: 'Library',       date: 'Jul 13', co2: 118.2 },
];

function renderRecent() {
  const list = document.getElementById('recent-list');
  list.innerHTML = recentSubmissions.map(r => `
    <div class="recent-item">
      <div class="recent-icon">📋</div>
      <div class="recent-info">
        <div class="recent-name">${r.dept}</div>
        <div class="recent-date">${r.date}, 2026</div>
      </div>
      <div class="recent-co2">${r.co2} kg</div>
    </div>
  `).join('');
}

function submitData() {
  const dept = document.getElementById('dept-select').value;
  const date = document.getElementById('date-input').value;

  if (!dept) { alert('Please select a department!'); return; }
  if (!date) { alert('Please select a date!'); return; }

  const payload = {
    department:       dept,
    date:             date,
    electricity_kwh:  parseFloat(document.getElementById('elec-input').value)      || 0,
    diesel_litres:    parseFloat(document.getElementById('diesel-input').value)     || 0,
    vehicles_entered: parseFloat(document.getElementById('vehicles-input').value)   || 0,
    veg_meals:        parseFloat(document.getElementById('veg-input').value)        || 0,
    nonveg_meals:     parseFloat(document.getElementById('nonveg-input').value)     || 0,
    food_waste_kg:    parseFloat(document.getElementById('foodwaste-input').value)  || 0,
    water_kl:         parseFloat(document.getElementById('water-input').value)      || 0,
  };

  const co2 = calcCO2({
    elec: payload.electricity_kwh, diesel: payload.diesel_litres,
    vehicle: payload.vehicles_entered, veg: payload.veg_meals,
    nonveg: payload.nonveg_meals, waste: payload.food_waste_kg, water: payload.water_kl,
  });

  // Send to backend API
  fetch('/api/emissions/add', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  .then(r => r.json())
  .then(res => console.log('✅ Saved to backend:', res))
  .catch(err => console.warn('⚠️ Backend unavailable, saved locally:', err));

  // Add to recent list (instant UI update)
  recentSubmissions.unshift({
    dept,
    date: new Date(date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
    co2: co2.total.toFixed(1),
  });
  if (recentSubmissions.length > 5) recentSubmissions.pop();
  renderRecent();

  // Show success toast
  const toast = document.getElementById('success-toast');
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 4000);

  // Clear form
  document.querySelectorAll('.form-input').forEach(i => i.value = '');
  document.getElementById('dept-select').value = '';
  updatePreview();
}

// ─── Wire up live preview inputs ─────────────────────────
function initAdmin() {
  document.querySelectorAll('.form-input[type="number"]').forEach(input => {
    input.addEventListener('input', updatePreview);
  });

  // Set today's date as default
  document.getElementById('date-input').value = new Date().toISOString().split('T')[0];

  renderRecent();
}

// ─── Logout ─────────────────────────────────────────────
async function handleLogout() {
  await fetch('/api/auth/logout', { method: 'POST' });
  window.location.href = '/';
}

// ─── Load User Info ─────────────────────────────────────
async function loadUser() {
  try {
    const res = await fetch('/api/auth/me');
    const data = await res.json();
    if (data.success && data.user) {
      const el = document.getElementById('user-greeting');
      if (el) el.textContent = 'Logged in as ' + data.user.name;
    }
  } catch(e) {}
}

// ─── App Boot ─────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  loadUser();
  initDashboard();
  initLeaderboard();
  initSuggestions();
  initAdmin();

  // Redraw on window resize
  window.addEventListener('resize', () => {
    const active = document.querySelector('.page.active')?.id;
    if (active === 'page-dashboard') {
      renderDonut(); renderBar(); renderLine();
    }
  });
});
