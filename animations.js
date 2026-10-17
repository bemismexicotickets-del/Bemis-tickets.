/**
 * BEMIS MÉXICO - MOTOR DE ANIMACIONES ESTACIONALES
 * Archivo: animations.js (Vanilla JS + HTML5 Canvas)
 * Motor físico con aerodinámica de caída tipo pluma, sprites vectoriales de alta definición
 * con colores auténticos para cada elemento (murciélagos negros, calabazas con tallo verde,
 * cempasúchil, hojas de arce, etc.) y tamaño aumentado para máxima presencia visual a 60/120 FPS.
 * Compatible con GitHub Pages y navegadores modernos.
 */

class SeasonalThemeEngine {
  constructor(canvasId = 'seasonalCanvas') {
    this.canvasId = canvasId;
    this.canvas = null;
    this.ctx = null;
    this.particles = [];
    this.animationId = null;
    this.currentTheme = 'estandar';
    this.lastTime = performance.now();
    this.displayWidth = window.innerWidth;
    this.displayHeight = window.innerHeight;
    this.spriteCache = new Map();
    this.init();
  }

  init() {
    this.canvas = document.getElementById(this.canvasId);
    if (!this.canvas) {
      this.canvas = document.createElement('canvas');
      this.canvas.id = this.canvasId;
      this.canvas.style.position = 'fixed';
      this.canvas.style.top = '0';
      this.canvas.style.left = '0';
      this.canvas.style.width = '100%';
      this.canvas.style.height = '100%';
      this.canvas.style.pointerEvents = 'none';
      this.canvas.style.zIndex = '10';
      document.body.prepend(this.canvas);
    }
    this.ctx = this.canvas.getContext('2d', { alpha: true });
    this.resize();
    window.addEventListener('resize', () => this.resize());
  }

  resize() {
    if (!this.canvas || !this.ctx) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.displayWidth = window.innerWidth;
    this.displayHeight = window.innerHeight;
    this.canvas.width = Math.floor(this.displayWidth * dpr);
    this.canvas.height = Math.floor(this.displayHeight * dpr);
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.scale(dpr, dpr);
    this.spawnParticles();
  }

  setTheme(themeName) {
    if (this.currentTheme === themeName) return;
    this.currentTheme = themeName;
    document.body.setAttribute('data-theme', themeName);
    this.spawnParticles();
  }

  createVectorSprite(type, drawFn) {
    if (this.spriteCache.has(type)) {
      return this.spriteCache.get(type);
    }
    const sCanvas = document.createElement('canvas');
    const size = 128;
    sCanvas.width = size;
    sCanvas.height = size;
    const sctx = sCanvas.getContext('2d');
    if (sctx) {
      sctx.imageSmoothingEnabled = true;
      sctx.imageSmoothingQuality = 'high';
      sctx.save();
      sctx.translate(size / 2, size / 2);
      drawFn(sctx, size);
      sctx.restore();
    }
    this.spriteCache.set(type, sCanvas);
    return sCanvas;
  }

  // Sprites con colores fieles y detallados
  getPumpkinSprite() {
    return this.createVectorSprite('pumpkin', (c) => {
      c.fillStyle = '#22c55e';
      c.beginPath();
      c.moveTo(-4, -30);
      c.bezierCurveTo(-10, -48, 6, -50, 4, -32);
      c.fill();

      c.fillStyle = '#16a34a';
      c.beginPath();
      c.ellipse(12, -36, 9, 4, Math.PI / 4, 0, Math.PI * 2);
      c.fill();

      const grad = c.createRadialGradient(0, -5, 5, 0, 0, 40);
      grad.addColorStop(0, '#fb923c');
      grad.addColorStop(0.7, '#ea580c');
      grad.addColorStop(1, '#c2410c');

      c.fillStyle = grad;
      c.beginPath();
      c.ellipse(-18, 0, 18, 30, -0.15, 0, Math.PI * 2);
      c.ellipse(18, 0, 18, 30, 0.15, 0, Math.PI * 2);
      c.fill();

      c.beginPath();
      c.ellipse(0, 2, 22, 32, 0, 0, Math.PI * 2);
      c.fill();

      c.fillStyle = '#fef08a';
      c.shadowColor = '#facc15';
      c.shadowBlur = 8;
      c.beginPath();
      c.moveTo(-16, -10);
      c.lineTo(-6, -10);
      c.lineTo(-11, -19);
      c.closePath();
      c.moveTo(6, -10);
      c.lineTo(16, -10);
      c.lineTo(11, -19);
      c.closePath();
      c.fill();

      c.beginPath();
      c.moveTo(0, -6);
      c.lineTo(-4, 0);
      c.lineTo(4, 0);
      c.closePath();
      c.fill();

      c.beginPath();
      c.moveTo(-18, 8);
      c.quadraticCurveTo(-10, 22, 0, 22);
      c.quadraticCurveTo(10, 22, 18, 8);
      c.lineTo(12, 10);
      c.lineTo(9, 15);
      c.lineTo(4, 11);
      c.lineTo(-4, 11);
      c.lineTo(-9, 15);
      c.lineTo(-12, 10);
      c.closePath();
      c.fill();
    });
  }

  getBatSprite() {
    return this.createVectorSprite('bat', (c) => {
      c.save();
      c.shadowColor = 'rgba(168, 85, 247, 0.4)';
      c.shadowBlur = 6;
      c.fillStyle = '#18181b';
      c.strokeStyle = '#27272a';
      c.lineWidth = 1.5;

      c.beginPath();
      c.moveTo(0, -12);
      c.lineTo(-4, -18);
      c.lineTo(-7, -10);
      c.quadraticCurveTo(-24, -28, -50, -14);
      c.quadraticCurveTo(-42, 4, -32, 2);
      c.quadraticCurveTo(-26, 12, -16, 6);
      c.quadraticCurveTo(-10, 14, -4, 16);
      c.lineTo(0, 20);
      c.lineTo(4, 16);
      c.quadraticCurveTo(10, 14, 16, 6);
      c.quadraticCurveTo(26, 12, 32, 2);
      c.quadraticCurveTo(42, 4, 50, -14);
      c.quadraticCurveTo(24, -28, 7, -10);
      c.lineTo(4, -18);
      c.closePath();
      c.fill();
      c.stroke();

      c.fillStyle = '#ef4444';
      c.shadowColor = '#ef4444';
      c.shadowBlur = 4;
      c.beginPath();
      c.arc(-3, -9, 1.8, 0, Math.PI * 2);
      c.arc(3, -9, 1.8, 0, Math.PI * 2);
      c.fill();
      c.restore();
    });
  }

  getSnowflakeSprite() {
    return this.createVectorSprite('snowflake', (c) => {
      c.save();
      c.strokeStyle = '#ffffff';
      c.fillStyle = '#ffffff';
      c.shadowColor = 'rgba(186, 230, 253, 0.9)';
      c.shadowBlur = 8;
      c.lineWidth = 2.5;
      c.lineCap = 'round';

      for (let i = 0; i < 6; i++) {
        c.save();
        c.rotate((i * Math.PI) / 3);
        c.beginPath();
        c.moveTo(0, 0);
        c.lineTo(0, -42);
        c.stroke();
        c.beginPath();
        c.moveTo(0, -28);
        c.lineTo(-12, -38);
        c.moveTo(0, -28);
        c.lineTo(12, -38);
        c.moveTo(0, -16);
        c.lineTo(-9, -23);
        c.moveTo(0, -16);
        c.lineTo(9, -23);
        c.stroke();
        c.beginPath();
        c.arc(0, -42, 2.5, 0, Math.PI * 2);
        c.fill();
        c.restore();
      }
      c.beginPath();
      c.arc(0, 0, 4.5, 0, Math.PI * 2);
      c.fill();
      c.restore();
    });
  }

  getStarSprite() {
    return this.createVectorSprite('gold_star', (c) => {
      c.save();
      c.fillStyle = '#fbbf24';
      c.shadowColor = 'rgba(251, 191, 36, 0.8)';
      c.shadowBlur = 10;
      c.beginPath();
      for (let i = 0; i < 5; i++) {
        c.lineTo(
          Math.cos(((18 + i * 72) * Math.PI) / 180) * 35,
          -Math.sin(((18 + i * 72) * Math.PI) / 180) * 35
        );
        c.lineTo(
          Math.cos(((54 + i * 72) * Math.PI) / 180) * 15,
          -Math.sin(((54 + i * 72) * Math.PI) / 180) * 15
        );
      }
      c.closePath();
      c.fill();
      c.fillStyle = '#fffbeb';
      c.beginPath();
      c.arc(0, 0, 6, 0, Math.PI * 2);
      c.fill();
      c.restore();
    });
  }

  getCempasuchilSprite() {
    return this.createVectorSprite('cempasuchil', (c) => {
      c.save();
      const rings = [
        { count: 14, radius: 36, color: '#ea580c' },
        { count: 12, radius: 26, color: '#f97316' },
        { count: 10, radius: 17, color: '#fbbf24' },
        { count: 6, radius: 9, color: '#f59e0b' },
      ];
      rings.forEach((ring) => {
        c.fillStyle = ring.color;
        for (let i = 0; i < ring.count; i++) {
          c.save();
          c.rotate((i * Math.PI * 2) / ring.count);
          c.beginPath();
          c.ellipse(0, -ring.radius, ring.radius * 0.35, ring.radius * 0.45, 0, 0, Math.PI * 2);
          c.fill();
          c.restore();
        }
      });
      c.fillStyle = '#7c2d12';
      c.beginPath();
      c.arc(0, 0, 4.5, 0, Math.PI * 2);
      c.fill();
      c.restore();
    });
  }

  getSugarSkullSprite() {
    return this.createVectorSprite('sugar_skull', (c) => {
      c.save();
      c.fillStyle = '#f8fafc';
      c.shadowColor = 'rgba(236, 72, 153, 0.4)';
      c.shadowBlur = 6;
      c.beginPath();
      c.arc(0, -8, 28, Math.PI, 0, false);
      c.lineTo(19, 14);
      c.lineTo(12, 26);
      c.lineTo(-12, 26);
      c.lineTo(-19, 14);
      c.closePath();
      c.fill();

      c.fillStyle = '#ec4899';
      c.beginPath();
      c.arc(-10, -5, 8, 0, Math.PI * 2);
      c.arc(10, -5, 8, 0, Math.PI * 2);
      c.fill();

      c.fillStyle = '#06b6d4';
      c.beginPath();
      c.arc(-10, -5, 4.5, 0, Math.PI * 2);
      c.arc(10, -5, 4.5, 0, Math.PI * 2);
      c.fill();

      c.fillStyle = '#1e1b4b';
      c.beginPath();
      c.moveTo(0, 5);
      c.lineTo(-3, 11);
      c.lineTo(3, 11);
      c.closePath();
      c.fill();

      c.strokeStyle = '#1e1b4b';
      c.lineWidth = 1.8;
      c.beginPath();
      c.moveTo(-11, 20);
      c.lineTo(11, 20);
      c.moveTo(-7, 16);
      c.lineTo(-7, 24);
      c.moveTo(-2, 16);
      c.lineTo(-2, 24);
      c.moveTo(3, 16);
      c.lineTo(3, 24);
      c.moveTo(8, 16);
      c.lineTo(8, 24);
      c.stroke();
      c.restore();
    });
  }

  getHeartSprite(color = '#e11d48') {
    return this.createVectorSprite(`heart_${color}`, (c) => {
      c.save();
      c.fillStyle = color;
      c.shadowColor = color;
      c.shadowBlur = 8;
      c.beginPath();
      c.moveTo(0, 10);
      c.bezierCurveTo(-22, -14, -38, -32, 0, -42);
      c.bezierCurveTo(38, -32, 22, -14, 0, 10);
      c.fill();
      c.fillStyle = 'rgba(255, 255, 255, 0.45)';
      c.beginPath();
      c.ellipse(-10, -26, 8, 3, -Math.PI / 4, 0, Math.PI * 2);
      c.fill();
      c.restore();
    });
  }

  getCherryBlossomSprite() {
    return this.createVectorSprite('cherry_blossom', (c) => {
      c.save();
      for (let i = 0; i < 5; i++) {
        c.save();
        c.rotate((i * Math.PI * 2) / 5);
        const pGrad = c.createRadialGradient(0, -22, 2, 0, -20, 26);
        pGrad.addColorStop(0, '#fdf2f8');
        pGrad.addColorStop(0.6, '#f472b6');
        pGrad.addColorStop(1, '#db2777');
        c.fillStyle = pGrad;
        c.beginPath();
        c.moveTo(0, 0);
        c.bezierCurveTo(-14, -15, -16, -34, -4, -40);
        c.lineTo(0, -36);
        c.lineTo(4, -40);
        c.bezierCurveTo(16, -34, 14, -15, 0, 0);
        c.fill();
        c.restore();
      }
      c.fillStyle = '#9d174d';
      c.beginPath();
      c.arc(0, 0, 4, 0, Math.PI * 2);
      c.fill();
      c.restore();
    });
  }

  getAutumnLeafSprite(isRed = true) {
    return this.createVectorSprite(`leaf_${isRed ? 'red' : 'gold'}`, (c) => {
      c.save();
      const lGrad = c.createLinearGradient(0, -40, 0, 40);
      if (isRed) {
        lGrad.addColorStop(0, '#dc2626');
        lGrad.addColorStop(0.6, '#ea580c');
        lGrad.addColorStop(1, '#b45309');
      } else {
        lGrad.addColorStop(0, '#f59e0b');
        lGrad.addColorStop(0.6, '#d97706');
        lGrad.addColorStop(1, '#78350f');
      }
      c.fillStyle = lGrad;
      c.beginPath();
      c.moveTo(0, -42);
      c.lineTo(9, -24);
      c.lineTo(24, -28);
      c.lineTo(16, -12);
      c.lineTo(34, -4);
      c.lineTo(20, 10);
      c.lineTo(26, 22);
      c.lineTo(9, 18);
      c.lineTo(4, 38);
      c.lineTo(-4, 38);
      c.lineTo(-9, 18);
      c.lineTo(-26, 22);
      c.lineTo(-20, 10);
      c.lineTo(-34, -4);
      c.lineTo(-16, -12);
      c.lineTo(-24, -28);
      c.lineTo(-9, -24);
      c.closePath();
      c.fill();
      c.restore();
    });
  }

  getEasterEggSprite() {
    return this.createVectorSprite('easter_egg', (c) => {
      c.save();
      c.fillStyle = '#c084fc';
      c.beginPath();
      c.ellipse(0, 2, 22, 32, 0, 0, Math.PI * 2);
      c.fill();
      c.fillStyle = '#2dd4bf';
      c.beginPath();
      c.ellipse(0, -4, 21, 8, 0, 0, Math.PI * 2);
      c.fill();
      c.fillStyle = '#fef08a';
      c.beginPath();
      c.arc(-10, 14, 3.5, 0, Math.PI * 2);
      c.arc(0, 14, 3.5, 0, Math.PI * 2);
      c.arc(10, 14, 3.5, 0, Math.PI * 2);
      c.fill();
      c.restore();
    });
  }

  getSunSprite() {
    return this.createVectorSprite('summer_sun', (c) => {
      c.save();
      c.fillStyle = '#f59e0b';
      for (let i = 0; i < 8; i++) {
        c.save();
        c.rotate((i * Math.PI) / 4);
        c.beginPath();
        c.moveTo(-7, -24);
        c.lineTo(0, -40);
        c.lineTo(7, -24);
        c.closePath();
        c.fill();
        c.restore();
      }
      c.fillStyle = '#fbbf24';
      c.beginPath();
      c.arc(0, 0, 23, 0, Math.PI * 2);
      c.fill();
      c.restore();
    });
  }

  getRoseSprite() {
    return this.createVectorSprite('rose', (c) => {
      c.save();
      c.fillStyle = '#16a34a';
      c.beginPath();
      c.ellipse(-18, 16, 12, 6, -Math.PI / 4, 0, Math.PI * 2);
      c.ellipse(18, 16, 12, 6, Math.PI / 4, 0, Math.PI * 2);
      c.fill();
      c.fillStyle = '#e11d48';
      c.beginPath();
      c.arc(0, -4, 24, 0, Math.PI * 2);
      c.fill();
      c.strokeStyle = '#fecdd3';
      c.lineWidth = 2.2;
      c.beginPath();
      c.arc(0, -4, 15, 0.4, Math.PI * 1.5, false);
      c.arc(0, -4, 8, Math.PI * 1.5, 0.6, false);
      c.stroke();
      c.restore();
    });
  }

  getTieSprite() {
    return this.createVectorSprite('father_tie', (c) => {
      c.save();
      c.fillStyle = '#1e3a8a';
      c.beginPath();
      c.moveTo(-9, -36);
      c.lineTo(9, -36);
      c.lineTo(6, -24);
      c.lineTo(-6, -24);
      c.closePath();
      c.fill();
      c.beginPath();
      c.moveTo(-6, -24);
      c.lineTo(6, -24);
      c.lineTo(13, 20);
      c.lineTo(0, 36);
      c.lineTo(-13, 20);
      c.closePath();
      c.fill();
      c.strokeStyle = '#fbbf24';
      c.lineWidth = 2.5;
      c.beginPath();
      c.moveTo(-7, -14);
      c.lineTo(7, -4);
      c.moveTo(-10, 2);
      c.lineTo(10, 12);
      c.stroke();
      c.restore();
    });
  }

  spawnParticles() {
    this.particles = [];
    const count = this.currentTheme === 'estandar' ? 36 : 28;

    for (let i = 0; i < count; i++) {
      const depth = Math.random() * 0.55 + 0.45;
      let sprite = null;
      let isTechNode = false;
      let color = 'rgba(255, 255, 255, 0.85)';
      let glowColor = null;

      // Tamaño aumentado: 42px a 56px de base
      let renderSize = Math.floor((Math.random() * 14 + 42) * depth);
      let fallSpeed = (Math.random() * 20 + 22) * depth;
      let swayWidth = (Math.random() * 50 + 40) * depth;
      let swaySpeed = Math.random() * 0.6 + 1.0;
      let maxTilt = Math.random() * 0.2 + 0.35;
      let driftSpeedX = (Math.random() - 0.5) * 8 * depth;

      switch (this.currentTheme) {
        case 'estandar':
          isTechNode = true;
          renderSize = Math.floor((Math.random() * 4 + 4.5) * depth);
          fallSpeed = (Math.random() - 0.5) * 12 * depth;
          swayWidth = 18 * depth;
          swaySpeed = 0.8;
          color = Math.random() > 0.4 ? 'rgba(0, 215, 255, 0.85)' : 'rgba(56, 189, 248, 0.7)';
          glowColor = 'rgba(0, 215, 255, 0.25)';
          break;

        case 'navidad':
          sprite = Math.random() > 0.35 ? this.getSnowflakeSprite() : this.getStarSprite();
          fallSpeed = (Math.random() * 18 + 22) * depth;
          swayWidth = (Math.random() * 45 + 35) * depth;
          break;

        case 'halloween':
          sprite = Math.random() > 0.45 ? this.getPumpkinSprite() : this.getBatSprite();
          fallSpeed = (Math.random() * 18 + 22) * depth;
          swayWidth = (Math.random() * 55 + 40) * depth;
          break;

        case 'dia_muertos':
          sprite = Math.random() > 0.4 ? this.getCempasuchilSprite() : this.getSugarSkullSprite();
          fallSpeed = (Math.random() * 18 + 22) * depth;
          swayWidth = (Math.random() * 55 + 40) * depth;
          break;

        case 'san_valentin':
          sprite = this.getHeartSprite(Math.random() > 0.5 ? '#e11d48' : '#f43f5e');
          fallSpeed = -(Math.random() * 18 + 20) * depth;
          swayWidth = (Math.random() * 45 + 35) * depth;
          break;

        case 'pascua':
          sprite = Math.random() > 0.45 ? this.getEasterEggSprite() : this.getStarSprite();
          fallSpeed = (Math.random() * 18 + 22) * depth;
          swayWidth = (Math.random() * 45 + 35) * depth;
          break;

        case 'primavera':
          sprite = this.getCherryBlossomSprite();
          fallSpeed = (Math.random() * 18 + 22) * depth;
          driftSpeedX = (Math.random() * 12 + 8) * depth;
          swayWidth = (Math.random() * 60 + 45) * depth;
          break;

        case 'otono':
          sprite = this.getAutumnLeafSprite(Math.random() > 0.5);
          fallSpeed = (Math.random() * 18 + 24) * depth;
          swayWidth = (Math.random() * 65 + 45) * depth;
          maxTilt = Math.random() * 0.25 + 0.45;
          break;

        case 'invierno':
          sprite = this.getSnowflakeSprite();
          fallSpeed = (Math.random() * 20 + 24) * depth;
          swayWidth = (Math.random() * 45 + 35) * depth;
          break;

        case 'verano':
          sprite = Math.random() > 0.45 ? this.getSunSprite() : this.getStarSprite();
          fallSpeed = (Math.random() * 16 + 18) * depth;
          swayWidth = (Math.random() * 40 + 30) * depth;
          break;

        case 'dia_madres':
          sprite = this.getRoseSprite();
          fallSpeed = (Math.random() * 18 + 22) * depth;
          swayWidth = (Math.random() * 50 + 35) * depth;
          break;

        case 'dia_padre':
          sprite = Math.random() > 0.45 ? this.getTieSprite() : this.getStarSprite();
          fallSpeed = (Math.random() * 18 + 22) * depth;
          swayWidth = (Math.random() * 45 + 35) * depth;
          break;
      }

      this.particles.push({
        baseX: Math.random() * this.displayWidth,
        y: Math.random() * this.displayHeight,
        depth,
        size: renderSize,
        swayPhase: Math.random() * Math.PI * 2,
        swaySpeed,
        swayWidth,
        phaseOffset: Math.random() * Math.PI,
        fallSpeed,
        driftSpeedX,
        maxTilt,
        flutterPhase: Math.random() * Math.PI * 2,
        flutterSpeed: Math.random() * 1.5 + 0.8,
        opacity: Math.random() * 0.25 + 0.7,
        sprite,
        isTechNode,
        color,
        glowColor,
      });
    }

    if (!this.animationId) {
      this.lastTime = performance.now();
      this.animate(this.lastTime);
    }
  }

  animate(time) {
    const dt = Math.min((time - this.lastTime) / 1000, 0.05);
    this.lastTime = time;

    this.ctx.clearRect(0, 0, this.displayWidth, this.displayHeight);

    const ambientBreeze = Math.sin(time * 0.00035) * 6;

    if (this.currentTheme === 'estandar') {
      const maxDist = 135;
      for (let i = 0; i < this.particles.length; i++) {
        const p1 = this.particles[i];
        const x1 = p1.baseX + Math.sin(p1.swayPhase) * p1.swayWidth;
        const y1 = p1.y;

        for (let j = i + 1; j < this.particles.length; j++) {
          const p2 = this.particles[j];
          const x2 = p2.baseX + Math.sin(p2.swayPhase) * p2.swayWidth;
          const y2 = p2.y;

          const dx = x1 - x2;
          const dy = y1 - y2;
          const distSq = dx * dx + dy * dy;

          if (distSq < maxDist * maxDist) {
            const dist = Math.sqrt(distSq);
            const linkAlpha = (1 - dist / maxDist) * 0.25 * Math.min(p1.depth, p2.depth);
            this.ctx.strokeStyle = `rgba(0, 215, 255, ${linkAlpha})`;
            this.ctx.lineWidth = 1;
            this.ctx.beginPath();
            this.ctx.moveTo(x1, y1);
            this.ctx.lineTo(x2, y2);
            this.ctx.stroke();
          }
        }
      }
    }

    // FÍSICA INTACTA DE CAÍDA TIPO PLUMA
    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];

      p.swayPhase += p.swaySpeed * dt;
      p.flutterPhase += p.flutterSpeed * dt;

      p.baseX += (p.driftSpeedX + ambientBreeze * p.depth) * dt;

      const hBuffer = 120;
      if (p.baseX > this.displayWidth + hBuffer) p.baseX = -hBuffer;
      else if (p.baseX < -hBuffer) p.baseX = this.displayWidth + hBuffer;

      const lateralOffset =
        Math.sin(p.swayPhase) * p.swayWidth +
        Math.sin(p.swayPhase * 2.1 + p.phaseOffset) * (p.swayWidth * 0.16);

      const currentX = p.baseX + lateralOffset;

      const lateralVelocityFactor = Math.cos(p.swayPhase);
      const tiltAngle =
        lateralVelocityFactor * p.maxTilt + Math.sin(p.flutterPhase) * 0.08;

      const liftFactor = 0.75 + 0.25 * (1.0 - Math.abs(lateralVelocityFactor));
      p.y += p.fallSpeed * liftFactor * dt;

      const perspectiveScaleX = 0.8 + 0.2 * Math.cos(p.flutterPhase);

      const vMargin = 70;
      let edgeAlpha = 1.0;
      if (p.y < vMargin) {
        edgeAlpha = Math.max(0, p.y / vMargin);
      } else if (p.y > this.displayHeight - vMargin) {
        edgeAlpha = Math.max(0, (this.displayHeight - p.y) / vMargin);
      }

      const currentOpacity = p.opacity * edgeAlpha;

      if (currentOpacity > 0.01) {
        this.ctx.save();
        this.ctx.translate(currentX, p.y);
        this.ctx.rotate(tiltAngle);
        this.ctx.scale(perspectiveScaleX, 1);
        this.ctx.globalAlpha = currentOpacity;

        if (p.isTechNode) {
          if (p.glowColor) {
            this.ctx.fillStyle = p.glowColor;
            this.ctx.beginPath();
            this.ctx.arc(0, 0, p.size * 2.8, 0, Math.PI * 2);
            this.ctx.fill();
          }
          this.ctx.fillStyle = p.color || 'rgba(0, 215, 255, 0.85)';
          this.ctx.beginPath();
          this.ctx.arc(0, 0, p.size, 0, Math.PI * 2);
          this.ctx.fill();
        } else if (p.sprite) {
          const halfSize = p.size / 2;
          this.ctx.drawImage(p.sprite, -halfSize, -halfSize, p.size, p.size);
        }

        this.ctx.restore();
      }

      const vBuffer = 60;
      if (p.fallSpeed > 0 && p.y > this.displayHeight + vBuffer) {
        p.y = -vBuffer;
        p.baseX = Math.random() * this.displayWidth;
      } else if (p.fallSpeed < 0 && p.y < -vBuffer) {
        p.y = this.displayHeight + vBuffer;
        p.baseX = Math.random() * this.displayWidth;
      }
    }

    this.animationId = requestAnimationFrame((t) => this.animate(t));
  }
}

// Inicialización automática
window.seasonalEngine = null;
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.seasonalEngine = new SeasonalThemeEngine('seasonalCanvas');
  });
} else {
  window.seasonalEngine = new SeasonalThemeEngine('seasonalCanvas');
}
