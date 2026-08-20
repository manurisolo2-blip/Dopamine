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
  // 1.5. HEADER SCROLL & ADAPTIVE LIQUID GLASS ENGINE
  // ============================================================
  function initHeaderScroll() {
    const header = document.getElementById('site-header');
    if (!header) return;

    const heroSection = document.querySelector('.hero-video-section, .hero-section');
    const sheetCover = document.querySelector('.hero-sheet-cover');

    if (!heroSection) {
      // On sub-pages without a hero video (e.g. catalog, cart, login), enable liquid glass by default
      header.classList.add('has-glass');
    }

    let ticking = false;
    function updateHeader() {
      if (sheetCover && heroSection) {
        // Calculate exact point where the rising sheet cover touches/overlaps the header
        const headerRect = header.getBoundingClientRect();
        const sheetRect = sheetCover.getBoundingClientRect();
        
        // Active ONLY when the rising background curtain reaches and covers the header
        const isCoveringHeader = sheetRect.top <= (headerRect.bottom || 80);
        header.classList.toggle('is-scrolled', isCoveringHeader);
      } else if (!heroSection) {
        header.classList.add('has-glass');
      } else {
        const threshold = window.innerHeight - 80;
        header.classList.toggle('is-scrolled', window.scrollY >= threshold);
      }
      ticking = false;
    }

    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(updateHeader);
        ticking = true;
      }
    }, { passive: true });

    window.addEventListener('resize', () => {
      if (!ticking) {
        requestAnimationFrame(updateHeader);
        ticking = true;
      }
    }, { passive: true });

    updateHeader();
  }
  initHeaderScroll();


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
    initFooterAccordion();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
