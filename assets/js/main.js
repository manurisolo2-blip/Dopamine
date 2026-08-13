/* ============================================================
   DOPAMINE — Main Cinematic Scroll & Antigravity Particle Engine
   ------------------------------------------------------------
   - Invocación de ScrollTrigger.normalizeScroll(true)
   - Precarga asincrónica de 250 fotogramas (ezgif-frame-001.png a 250)
   - Redimensionamiento explícito de #hero-canvas a window.innerWidth/innerHeight
   - Console logs y diagnóstico de carga/404
   - Anclaje Fijo (pin: true) con ScrollTrigger en la sección del canvas
   - Avance inmediato de fotogramas al volverse visible opacity: 1 (sin tramos muertos)
   - Recorrido de scroll continuo fijado hasta terminar la secuencia completa de 250 frames
   - Sistema de física de partículas 'Antigravity Animation' (z-index: 20)
   ============================================================ */

(() => {
  'use strict';

  // ============================================================
  // 1. REGISTRO DE GSAP & DELEGACIÓN A SNEAKER CANVAS ENGINE
  // ============================================================
  function initCinematicScrollEngine() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
      console.warn('[Dopamine] GSAP o ScrollTrigger no están disponibles en la ventana global.');
      return;
    }

    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.normalizeScroll(true);
    console.log('[Dopamine] Motor GSAP inicializado correctamente.');
  }

  initCinematicScrollEngine();

  // ============================================================
  // 1.5. HEADER SCROLL ELEVATION
  // ============================================================
  function initHeaderScroll() {
    const header = document.getElementById('site-header');
    if (!header) return;
    let ticking = false;
    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          header.classList.toggle('is-scrolled', window.scrollY > 50);
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
  }
  initHeaderScroll();


  // ============================================================
  // 2. SISTEMA DE FÍSICA DE PARTÍCULAS 'ANTIGRAVITY ANIMATION' (CAPA ATMOSFÉRICA)
  // ============================================================
  function createOffscreenParticleSprite() {
    const spriteSize = 64;
    const offscreen = (typeof OffscreenCanvas !== 'undefined')
      ? new OffscreenCanvas(spriteSize, spriteSize)
      : document.createElement('canvas');

    if (!(offscreen instanceof OffscreenCanvas)) {
      offscreen.width = spriteSize;
      offscreen.height = spriteSize;
    }

    const offCtx = offscreen.getContext('2d');
    const center = spriteSize / 2;
    const radius = spriteSize / 2;

    const gradient = offCtx.createRadialGradient(center, center, 0, center, center, radius);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
    gradient.addColorStop(0.25, 'rgba(240, 245, 255, 0.85)');
    gradient.addColorStop(0.55, 'rgba(14, 165, 233, 0.35)');
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

    offCtx.fillStyle = gradient;
    offCtx.beginPath();
    offCtx.arc(center, center, radius, 0, Math.PI * 2);
    offCtx.fill();

    return offscreen;
  }

  function initAntigravityParticles() {
    const particleCanvas = document.getElementById('particle-canvas');
    if (!particleCanvas) return;

    const ctx = particleCanvas.getContext('2d', {
      desynchronized: true,
      willReadFrequently: false
    });

    if (!ctx) return;

    const CONFIG = {
      gravity: -0.1,
      speed: 0.5,
      count: 45
    };

    const sprite = createOffscreenParticleSprite();

    let width = (particleCanvas.width = window.innerWidth);
    let height = (particleCanvas.height = window.innerHeight);

    function resizeParticleCanvas() {
      width = particleCanvas.width = window.innerWidth;
      height = particleCanvas.height = window.innerHeight;
    }

    window.addEventListener('resize', resizeParticleCanvas, { passive: true });

    class Particle {
      constructor() {
        this.reset(true);
      }

      reset(initial = false) {
        this.x = Math.random() * width;
        this.y = initial ? Math.random() * height : height + 20;
        this.size = Math.random() * 3 + 1.5;
        this.baseAlpha = Math.random() * 0.5 + 0.15;
        this.alpha = this.baseAlpha;
        this.vx = (Math.random() - 0.5) * 0.5;
        this.vy = CONFIG.gravity * (Math.random() * 0.5 + 0.7);
        this.pulse = Math.random() * Math.PI * 2;
        this.pulseSpeed = Math.random() * 0.02 + 0.005;
      }

      update() {
        this.vy += CONFIG.gravity * 0.015;

        this.x += this.vx * CONFIG.speed;
        this.y += this.vy * CONFIG.speed;

        this.pulse += this.pulseSpeed;
        this.alpha = this.baseAlpha + Math.sin(this.pulse) * 0.12;

        if (this.y < -30) {
          this.reset(false);
        }
        if (this.x < -30) this.x = width + 30;
        if (this.x > width + 30) this.x = -30;
      }

      draw() {
        ctx.globalAlpha = Math.max(0, Math.min(1, this.alpha));
        ctx.drawImage(
          sprite,
          this.x - this.size / 2,
          this.y - this.size / 2,
          this.size,
          this.size
        );
      }
    }

    const particles = Array.from({ length: CONFIG.count }, () => new Particle());

    function animateParticles() {
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < CONFIG.count; i++) {
        const p = particles[i];
        p.update();
        p.draw();
      }

      requestAnimationFrame(animateParticles);
    }

    requestAnimationFrame(animateParticles);
  }

  function initFooterAccordion() {
    document.addEventListener('click', event => {
      const btn = event.target.closest('.footer-accordion-btn, .footer-col-title');
      if (!btn) return;
      const col = btn.closest('[data-footer-accordion], .footer-col');
      if (!col) return;
      if (window.innerWidth <= 767) {
        event.preventDefault();
        const isExpanded = col.classList.toggle('is-expanded');
        btn.setAttribute('aria-expanded', String(isExpanded));
        const icon = btn.querySelector('.accordion-icon');
        if (icon) icon.textContent = isExpanded ? '−' : '+';
      }
    });
  }

  function init() {
    initCinematicScrollEngine();
    initAntigravityParticles();
    initFooterAccordion();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
