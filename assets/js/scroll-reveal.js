/* ============================================================
   DOPAMINE — Scroll Reveal Engine
   ------------------------------------------------------------
   Anima secciones y tarjetas a medida que aparecen en pantalla.

   La clave está en `ROOT_MARGIN`: en vez de esperar a que el
   usuario llegue a cada sección, extendemos el área de detección
   hacia abajo, así el contenido empieza a revelarse un poco ANTES
   de entrar en pantalla. El resultado: mientras vas bajando, ya
   estás viendo asomar lo próximo, en vez de encontrarte todo
   estático hasta pasar por encima.

   Progressive enhancement: los elementos sólo quedan ocultos
   (opacity: 0) una vez que este script les agrega la clase
   "js-reveal". Si el script no llegara a cargar, todo el
   contenido queda visible igual — nunca depende de JS para
   mostrarse, sólo para animarse.
   ============================================================ */

(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  // Secciones "premium" definidas en styles.css (cada una ya tiene
  // su propio movimiento: sube, entra desde un lado, escala, etc.)
  const MOTION_TARGETS = [
    '.categories-section .category-card',
    '.featured-section .product-card',
    '.banner-content',
    '.banner-visual',
    '.story-text-column',
    '.story-stats-grid',
    '.benefits-grid .benefit-item',
    '.newsletter-container',
    '.site-footer'
  ].join(', ');

  // Margen positivo hacia abajo = el navegador considera "visible"
  // un elemento que todavía está por debajo del borde de la pantalla.
  // Así el reveal arranca antes de que el usuario llegue a la sección.
  const ROOT_MARGIN = '0px 0px 220px 0px';

  // Grillas donde el delay entre tarjetas se calcula automáticamente
  // (evita tener que numerar manualmente cada tarjeta en el HTML).
  const STAGGER_GROUPS = [
    { selector: '.categories-grid', step: 130, max: 3 },
    { selector: '.featured-section .products-grid', step: 130, max: 3 },
    { selector: '.benefits-grid', step: 90, max: 3 }
  ];

  let observer = null;

  function getObserver() {
    if (!observer) {
      observer = new IntersectionObserver(onIntersect, {
        root: null,
        rootMargin: ROOT_MARGIN,
        threshold: 0
      });
    }
    return observer;
  }

  function onIntersect(entries, obs) {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      el.classList.add('in-view');
      obs.unobserve(el);
      // Una vez completada la transición, soltamos will-change y el
      // gate de la animación: el elemento queda en su estado final,
      // simple y liviano, sin animación colgando del DOM.
      el.addEventListener('transitionend', () => {
        el.classList.remove('js-reveal');
      }, { once: true });
    });
  }

  function applyStagger(root) {
    STAGGER_GROUPS.forEach(group => {
      root.querySelectorAll(group.selector).forEach(grid => {
        Array.from(grid.children).forEach((child, index) => {
          if (child.style.getPropertyValue('--reveal-delay')) return;
          const step = Math.min(index, group.max) * group.step;
          child.style.setProperty('--reveal-delay', `${step}ms`);
        });
      });
    });
  }

  function observe(root = document) {
    if (reduceMotion.matches || !('IntersectionObserver' in window)) return;

    const nodes = root.querySelectorAll(MOTION_TARGETS);
    if (!nodes.length) return;

    const obs = getObserver();
    nodes.forEach(el => {
      if (el.dataset.revealBound) return;
      el.dataset.revealBound = 'true';
      el.classList.add('js-reveal');
      obs.observe(el);
    });
  }

  function initScrollTextReveal() {
    const textSection = document.querySelector('.scroll-text-section');
    if (!textSection) return;

    const charSpans = Array.from(textSection.querySelectorAll('.char-span'));
    if (!charSpans.length) return;

    const totalChars = charSpans.length;

    // Small overlap for crisp letter-by-letter reveal
    const charOverlap = 0.08;
    const step = (1 - charOverlap) / totalChars;
    const charWindow = step + charOverlap;

    function handleScroll() {
      const isLight = document.documentElement.dataset.theme === 'light';
      const baseRgb = isLight ? '14, 14, 14' : '255, 255, 255';
      const rect = textSection.getBoundingClientRect();
      const windowHeight = window.innerHeight;

      // Starts appearing when section is 80% into viewport, completes when top reaches 25% of viewport
      const startPoint = windowHeight * 0.80;
      const endPoint = windowHeight * 0.25;
      const scrollRange = Math.max(1, startPoint - endPoint);

      const overallProgress = Math.max(0, Math.min(1, (startPoint - rect.top) / scrollRange));

      charSpans.forEach((span, idx) => {
        const charStart = idx * step;
        const localProgress = Math.max(0, Math.min(1, (overallProgress - charStart) / charWindow));
        
        // Eased progress (0.0 to 1.0)
        const eased = localProgress * localProgress * (3 - 2 * localProgress);

        const isLine2 = span.closest('.reveal-interactive') !== null;

        if (isLine2) {
          // Line 2: Red accent (faint translucent red -> bold solid red #EF4444)
          const alpha = (0.18 + eased * 0.82).toFixed(3);
          span.style.color = `rgba(239, 68, 68, ${alpha})`;
        } else {
          // Line 1: Theme-aware color (Black/Charcoal in light mode, Crisp White in dark mode)
          const alpha = (0.15 + eased * 0.85).toFixed(3);
          span.style.color = `rgba(${baseRgb}, ${alpha})`;
        }

        const translateY = ((1 - eased) * 4).toFixed(2);
        span.style.transform = `translateY(${translateY}px)`;
        span.style.filter = 'none';
        span.style.textShadow = 'none';
      });
    }

    window.addEventListener('scroll', handleScroll, { passive: true });

    // Watch for theme toggles on <html> and update instantly
    const themeObserver = new MutationObserver(() => {
      handleScroll();
    });
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

    handleScroll();
  }

  function init() {
    applyStagger(document);
    observe(document);
    initScrollTextReveal();
  }

  document.addEventListener('DOMContentLoaded', init);

  // Expuesto por si en el futuro se necesita re-escanear el DOM
  // (por ejemplo, si se agrega contenido dinámico a la landing).
  window.DopamineReveal = { observe, applyStagger };
})();
