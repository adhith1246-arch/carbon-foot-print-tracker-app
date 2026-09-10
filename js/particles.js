/**
 * particles.js — Floating Greenery Particle System
 * Organic leaf silhouettes and botanical specks with mouse interaction
 */
(function () {
  const canvas = document.getElementById('particle-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  // Respect prefers-reduced-motion
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) return;

  let W, H, particles = [], mouse = { x: -999, y: -999 };
  const PARTICLE_COUNT = window.innerWidth < 768 ? 25 : 50;

  function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  window.addEventListener('resize', resize);
  resize();

  // Mouse tracking
  document.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });
  document.addEventListener('mouseleave', () => {
    mouse.x = -999;
    mouse.y = -999;
  });

  // Particle types
  const GREENS = [
    'rgba(15, 81, 50,',    // forest
    'rgba(34, 197, 94,',   // green-500
    'rgba(46, 196, 182,',  // mint
    'rgba(22, 163, 74,',   // green-600
    'rgba(187, 247, 208,', // green-200
  ];

  class Particle {
    constructor() {
      this.reset();
    }

    reset() {
      this.x = Math.random() * W;
      this.y = Math.random() * H;
      this.size = Math.random() * 6 + 2;
      this.speedX = (Math.random() - 0.5) * 0.3;
      this.speedY = -(Math.random() * 0.4 + 0.1); // drift upward
      this.opacity = Math.random() * 0.5 + 0.2;    // 20-70%
      this.color = GREENS[Math.floor(Math.random() * GREENS.length)];
      this.rotation = Math.random() * Math.PI * 2;
      this.rotSpeed = (Math.random() - 0.5) * 0.02;
      this.type = Math.random() > 0.6 ? 'leaf' : 'speck';
      this.depth = Math.random() * 0.6 + 0.4; // parallax depth
      this.blur = this.depth < 0.6 ? 1 : 0;
    }

    update() {
      this.x += this.speedX * this.depth;
      this.y += this.speedY * this.depth;
      this.rotation += this.rotSpeed;

      // Mouse repulsion
      const dx = this.x - mouse.x;
      const dy = this.y - mouse.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 120) {
        const force = (120 - dist) / 120;
        this.x += (dx / dist) * force * 2;
        this.y += (dy / dist) * force * 2;
      }

      // Wrap around
      if (this.y < -20) { this.y = H + 20; this.x = Math.random() * W; }
      if (this.x < -20) this.x = W + 20;
      if (this.x > W + 20) this.x = -20;
    }

    draw() {
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(this.rotation);
      ctx.globalAlpha = this.opacity;

      if (this.blur) {
        ctx.filter = 'blur(1px)';
      }

      if (this.type === 'leaf') {
        // Draw a leaf shape
        ctx.fillStyle = this.color + this.opacity + ')';
        ctx.beginPath();
        const s = this.size * 1.5;
        ctx.moveTo(0, -s);
        ctx.bezierCurveTo(s * 0.8, -s * 0.5, s * 0.6, s * 0.5, 0, s);
        ctx.bezierCurveTo(-s * 0.6, s * 0.5, -s * 0.8, -s * 0.5, 0, -s);
        ctx.fill();

        // Leaf vein
        ctx.strokeStyle = this.color + (this.opacity * 0.5) + ')';
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(0, -s * 0.8);
        ctx.lineTo(0, s * 0.8);
        ctx.stroke();
      } else {
        // Glowing speck
        ctx.fillStyle = this.color + this.opacity + ')';
        ctx.beginPath();
        ctx.arc(0, 0, this.size * 0.5, 0, Math.PI * 2);
        ctx.fill();

        // Soft glow
        ctx.fillStyle = this.color + (this.opacity * 0.3) + ')';
        ctx.beginPath();
        ctx.arc(0, 0, this.size, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    }
  }

  // Initialize particles
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    particles.push(new Particle());
  }

  // Animation loop with frame throttling on mobile
  let lastFrame = 0;
  const targetFPS = window.innerWidth < 768 ? 30 : 60;
  const frameInterval = 1000 / targetFPS;

  function animate(timestamp) {
    requestAnimationFrame(animate);

    const delta = timestamp - lastFrame;
    if (delta < frameInterval) return;
    lastFrame = timestamp - (delta % frameInterval);

    ctx.clearRect(0, 0, W, H);

    for (const p of particles) {
      p.update();
      p.draw();
    }
  }

  requestAnimationFrame(animate);
})();
