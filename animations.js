/**
 * BEMIS MÉXICO - ANIMACIONES DE FONDO ESTACIONALES Y DINÁMICAS (Nodos más grandes)
 */
(function () {
  const canvas = document.getElementById("seasonalCanvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");

  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  window.addEventListener("resize", () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });

  let currentTheme = "estandar";
  let particles = [];

  class SeasonalEngine {
    constructor() {
      this.initParticles();
    }

    setTheme(themeName) {
      currentTheme = themeName || "estandar";
      this.initParticles();
    }

    initParticles() {
      particles = [];
      const count = currentTheme === "estandar" ? 35 : 45; // Cantidad equilibrada para nodos más grandes
      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 1.2,
          vy: (Math.random() - 0.5) * 1.2,
          size: currentTheme === "estandar" ? Math.random() * 5 + 3 : Math.random() * 6 + 4, // Nodos significativamente más grandes
          symbol: this.getSymbolForTheme(),
          alpha: Math.random() * 0.5 + 0.3
        });
      }
    }

    getSymbolForTheme() {
      switch (currentTheme) {
        case "navidad": return Math.random() > 0.5 ? "❄️" : "✨";
        case "halloween": return Math.random() > 0.5 ? "🎃" : "👻";
        case "dia_muertos": return Math.random() > 0.5 ? "🏵️" : "💀";
        case "san_valentin": return Math.random() > 0.5 ? "💖" : "✨";
        case "primavera": return Math.random() > 0.5 ? "🌸" : "🍃";
        default: return "";
      }
    }

    update() {
      ctx.clearRect(0, 0, width, height);

      // Si es el tema estándar, dibujamos red de conexiones estilo IoT / Red de Sistemas más gruesa y visible
      if (currentTheme === "estandar") {
        for (let i = 0; i < particles.length; i++) {
          for (let j = i + 1; j < particles.length; j++) {
            const dx = particles[i].x - particles[j].x;
            const dy = particles[i].y - particles[j].y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 160) { // Mayor radio de conexión por nodos más grandes
              ctx.strokeStyle = `rgba(0, 71, 186, ${0.25 * (1 - dist / 160)})`;
              ctx.lineWidth = 1.8; // Líneas más gruesas
              ctx.beginPath();
              ctx.moveTo(particles[i].x, particles[i].y);
              ctx.lineTo(particles[j].x, particles[j].y);
              ctx.stroke();
            }
          }
        }
      }

      // Actualizar y renderizar partículas
      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        ctx.save();
        ctx.globalAlpha = p.alpha;

        if (currentTheme === "estandar") {
          ctx.fillStyle = "#0047BA";
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();

          // Anillo exterior brillante para dar relieve e impacto visual
          ctx.strokeStyle = "rgba(0, 71, 186, 0.35)";
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size + 3, 0, Math.PI * 2);
          ctx.stroke();
        } else {
          ctx.font = `${p.size * 3}px sans-serif`; // Emojis estacionales más grandes
          ctx.fillText(p.symbol, p.x, p.y);
        }
        ctx.restore();
      });
    }
  }

  window.seasonalEngine = new SeasonalEngine();

  function animate() {
    window.seasonalEngine.update();
    requestAnimationFrame(animate);
  }
  animate();
})();
