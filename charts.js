/**
 * charts.js — All D3.js chart rendering
 */

const COLORS = {
  electricity: '#0F5132',
  diesel:      '#d97706',
  vehicle:     '#2EC4B6',
  food:        '#15803d',
  waste:       '#b45309',
  water:       '#22c55e',
};

const COLOR_LIST = Object.values(COLORS);

// ─── DONUT CHART ───────────────────────────────────────
function renderDonut() {
  const data = [
    { label: 'Electricity', value: TODAY_CO2.elec,    color: COLORS.electricity },
    { label: 'Diesel/Gen',  value: TODAY_CO2.diesel,  color: COLORS.diesel },
    { label: 'Transport',   value: TODAY_CO2.vehicle, color: COLORS.vehicle },
    { label: 'Food',        value: TODAY_CO2.food,    color: COLORS.food },
    { label: 'Food Waste',  value: TODAY_CO2.waste,   color: COLORS.waste },
    { label: 'Water',       value: TODAY_CO2.water,   color: COLORS.water },
  ].filter(d => d.value > 0);

  const W = 180, H = 180;
  const R = Math.min(W, H) / 2 - 10;

  const svg = d3.select('#donut-chart')
    .attr('viewBox', `0 0 ${W} ${H}`)
    .attr('preserveAspectRatio', 'xMidYMid meet');

  svg.selectAll('*').remove();
  const g = svg.append('g').attr('transform', `translate(${W/2},${H/2})`);

  const pie = d3.pie().value(d => d.value).sort(null).padAngle(0.04);
  const arc = d3.arc().innerRadius(R * 0.58).outerRadius(R);
  const arcHover = d3.arc().innerRadius(R * 0.55).outerRadius(R + 6);

  const tooltip = document.getElementById('tooltip');

  const arcs = g.selectAll('.arc')
    .data(pie(data))
    .enter().append('g').attr('class', 'arc');

  arcs.append('path')
    .attr('d', arc)
    .attr('fill', d => d.data.color)
    .attr('stroke', '#060d1a')
    .attr('stroke-width', 2)
    .style('filter', d => `drop-shadow(0 0 6px ${d.data.color}55)`)
    .on('mousemove', function(event, d) {
      d3.select(this).attr('d', arcHover);
      const pct = ((d.data.value / TODAY_CO2.total) * 100).toFixed(1);
      tooltip.innerHTML = `<b>${d.data.label}</b><br>${d.data.value.toFixed(1)} kg CO₂<br>${pct}%`;
      tooltip.style.left = event.clientX + 14 + 'px';
      tooltip.style.top  = event.clientY - 10 + 'px';
      tooltip.classList.add('show');
    })
    .on('mouseleave', function(event, d) {
      d3.select(this).attr('d', arc);
      tooltip.classList.remove('show');
    })
    .transition().duration(900).ease(d3.easeCubicOut)
    .attrTween('d', function(d) {
      const i = d3.interpolate({ startAngle: 0, endAngle: 0 }, d);
      return t => arc(i(t));
    });

  // Center text
  g.append('text').attr('text-anchor', 'middle').attr('dy', '-0.2em')
    .style('font-size', '22px').style('font-weight', '800').style('fill', '#0F5132')
    .text(Math.round(TODAY_CO2.total));
  g.append('text').attr('text-anchor', 'middle').attr('dy', '1.2em')
    .style('font-size', '10px').style('fill', 'rgba(240,244,255,0.5)')
    .text('kg CO₂');

  // Legend
  const legend = document.getElementById('donut-legend');
  legend.innerHTML = data.map(d => `
    <div class="legend-item">
      <div class="legend-dot" style="background:${d.color};box-shadow:0 0 6px ${d.color}88;"></div>
      <span class="legend-label">${d.label}</span>
      <span class="legend-value">${d.value.toFixed(0)}</span>
    </div>
  `).join('');
}

// ─── BAR CHART ───────────────────────────────────────
function renderBar() {
  const container = document.getElementById('bar-chart');
  const W = container.getBoundingClientRect().width || 500;
  const H = 220;
  const margin = { top: 10, right: 20, bottom: 60, left: 55 };
  const w = W - margin.left - margin.right;
  const h = H - margin.top - margin.bottom;

  const data = DEPARTMENTS.slice(0, 8);
  const tooltip = document.getElementById('tooltip');

  const svg = d3.select('#bar-chart')
    .attr('viewBox', `0 0 ${W} ${H}`)
    .attr('preserveAspectRatio', 'xMidYMid meet');

  svg.selectAll('*').remove();
  const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

  const x = d3.scaleBand().domain(data.map(d => d.name)).range([0, w]).padding(0.3);
  const y = d3.scaleLinear().domain([0, d3.max(data, d => d.co2.total) * 1.15]).range([h, 0]);

  // Grid lines
  g.selectAll('.grid')
    .data(y.ticks(4))
    .enter().append('line')
    .attr('x1', 0).attr('x2', w)
    .attr('y1', d => y(d)).attr('y2', d => y(d))
    .attr('stroke', 'rgba(255,255,255,0.06)')
    .attr('stroke-dasharray', '4,4');

  // Bars
  g.selectAll('.bar')
    .data(data)
    .enter().append('rect')
    .attr('class', 'bar')
    .attr('x', d => x(d.name))
    .attr('width', x.bandwidth())
    .attr('y', h)
    .attr('height', 0)
    .attr('fill', (d, i) => COLOR_LIST[i % COLOR_LIST.length])
    .attr('rx', 5)
    .style('filter', (d, i) => `drop-shadow(0 0 6px ${COLOR_LIST[i % COLOR_LIST.length]}55)`)
    .on('mousemove', function(event, d) {
      tooltip.innerHTML = `<b>${d.name}</b><br>Total: ${d.co2.total.toFixed(1)} kg CO₂<br>Rank: #${d.rank}`;
      tooltip.style.left = event.clientX + 14 + 'px';
      tooltip.style.top  = event.clientY - 10 + 'px';
      tooltip.classList.add('show');
    })
    .on('mouseleave', () => tooltip.classList.remove('show'))
    .transition().duration(1000).delay((d, i) => i * 80).ease(d3.easeBounceOut)
    .attr('y', d => y(d.co2.total))
    .attr('height', d => h - y(d.co2.total));

  // X Axis
  g.append('g').attr('transform', `translate(0,${h})`).call(d3.axisBottom(x))
    .selectAll('text')
    .attr('transform', 'rotate(-35)')
    .style('text-anchor', 'end')
    .style('font-size', '9px')
    .style('fill', 'rgba(240,244,255,0.5)');

  g.select('.domain').remove();
  g.selectAll('.tick line').remove();

  // Y Axis
  g.append('g').call(d3.axisLeft(y).ticks(4).tickFormat(d => d + 'kg'))
    .selectAll('text').style('fill', 'rgba(240,244,255,0.5)').style('font-size', '10px');

  g.select('.domain').remove();
}

// ─── LINE CHART ───────────────────────────────────────
function renderLine() {
  const container = document.getElementById('line-chart');
  const W = container.getBoundingClientRect().width || 600;
  const H = 180;
  const margin = { top: 10, right: 20, bottom: 30, left: 55 };
  const w = W - margin.left - margin.right;
  const h = H - margin.top - margin.bottom;

  const parseDate = d3.timeParse('%Y-%m-%d');
  const data = TREND_DATA.map(d => ({ date: parseDate(d.date), co2: d.co2 }));
  const tooltip = document.getElementById('tooltip');

  const svg = d3.select('#line-chart')
    .attr('viewBox', `0 0 ${W} ${H}`)
    .attr('preserveAspectRatio', 'xMidYMid meet');

  svg.selectAll('*').remove();
  const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

  const x = d3.scaleTime().domain(d3.extent(data, d => d.date)).range([0, w]);
  const y = d3.scaleLinear().domain([
    d3.min(data, d => d.co2) * 0.85,
    d3.max(data, d => d.co2) * 1.1
  ]).range([h, 0]);

  // Gradient fill
  const grad = svg.append('defs').append('linearGradient')
    .attr('id', 'line-grad').attr('x1', '0').attr('y1', '0').attr('x2', '0').attr('y2', '1');
  grad.append('stop').attr('offset', '0%').attr('stop-color', '#0F5132').attr('stop-opacity', 0.3);
  grad.append('stop').attr('offset', '100%').attr('stop-color', '#0F5132').attr('stop-opacity', 0);

  // Area
  const area = d3.area()
    .x(d => x(d.date)).y0(h).y1(d => y(d.co2))
    .curve(d3.curveCatmullRom);

  g.append('path').datum(data).attr('fill', 'url(#line-grad)').attr('d', area);

  // Grid
  g.selectAll('.grid').data(y.ticks(4))
    .enter().append('line')
    .attr('x1', 0).attr('x2', w)
    .attr('y1', d => y(d)).attr('y2', d => y(d))
    .attr('stroke', 'rgba(255,255,255,0.05)')
    .attr('stroke-dasharray', '4,4');

  // Line
  const line = d3.line()
    .x(d => x(d.date)).y(d => y(d.co2))
    .curve(d3.curveCatmullRom);

  const path = g.append('path').datum(data)
    .attr('fill', 'none')
    .attr('stroke', '#0F5132')
    .attr('stroke-width', 2.5)
    .style('filter', 'drop-shadow(0 0 8px #0F513288)')
    .attr('d', line);

  // Animate line draw
  const length = path.node().getTotalLength();
  path.attr('stroke-dasharray', length).attr('stroke-dashoffset', length)
    .transition().duration(1500).ease(d3.easeLinear).attr('stroke-dashoffset', 0);

  // Hover dots
  const bisectDate = d3.bisector(d => d.date).left;
  const dot = g.append('circle').attr('r', 5).attr('fill', '#0F5132')
    .style('opacity', 0).style('filter', 'drop-shadow(0 0 6px #0F5132)');

  g.append('rect')
    .attr('width', w).attr('height', h)
    .attr('fill', 'transparent')
    .on('mousemove', function(event) {
      const [mx] = d3.pointer(event);
      const x0 = x.invert(mx);
      const i = bisectDate(data, x0, 1);
      const d = data[Math.min(i, data.length - 1)];
      dot.style('opacity', 1).attr('cx', x(d.date)).attr('cy', y(d.co2));
      const fmt = d3.timeFormat('%b %d');
      tooltip.innerHTML = `<b>${fmt(d.date)}</b><br>${d.co2.toFixed(1)} kg CO₂`;
      tooltip.style.left = event.clientX + 14 + 'px';
      tooltip.style.top  = event.clientY - 10 + 'px';
      tooltip.classList.add('show');
    })
    .on('mouseleave', () => {
      dot.style('opacity', 0);
      tooltip.classList.remove('show');
    });

  // X Axis
  g.append('g').attr('transform', `translate(0,${h})`)
    .call(d3.axisBottom(x).ticks(6).tickFormat(d3.timeFormat('%b %d')))
    .selectAll('text').style('fill', 'rgba(240,244,255,0.4)').style('font-size', '9px');

  // Y Axis
  g.append('g').call(d3.axisLeft(y).ticks(4).tickFormat(d => d + 'kg'))
    .selectAll('text').style('fill', 'rgba(240,244,255,0.4)').style('font-size', '10px');

  g.selectAll('.domain, .tick line').remove();
}

// ─── Animate number counters ───────────────────────────
function animateNumber(el, target, decimals = 0, suffix = '') {
  const start = 0;
  const duration = 1200;
  const startTime = performance.now();

  function update(now) {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const val = start + (target - start) * eased;
    el.textContent = val.toFixed(decimals) + suffix;
    if (progress < 1) requestAnimationFrame(update);
  }

  requestAnimationFrame(update);
}
