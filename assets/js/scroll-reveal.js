/* ============================================================
   DOPAMINE STREETWEAR — High-Performance Scroll Reveal & Smooth Scroll Engine
   Version: 3.5 (GPU-Accelerated, Brutalist Minimalist, WCAG 2.2 Accessible)
   ------------------------------------------------------------
   - Smooth entrance reveals with GPU-accelerated translate3d & opacity.
   - Dynamic staggering for grids across all pages (catalog, featured, categories, stats, benefits).
   - IntersectionObserver with lookahead rootMargin for natural anticipatory reveal.
   - Smooth anchor navigation with floating header offset compensation.
   - Cinematic Letter-by-letter interactive scroll text reveal for the Dopamine Brand Statement.
   - Automatic MutationObserver to observe dynamically injected elements (catalog filters, recommendations).
   - Full 'prefers-reduced-motion' compliance.
   ============================================================ */

(() => {
  'use strict';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  // Comprehensive targets across all pages (index, tienda, store, producto, carrito, contacto, login, admin-clientes)
  const MOTION_TARGETS = [
    // Index / Home
    '.categories-section .category-card',
    '.categories-grid > *',
    '.featured-products-section .product-card',
    '.featured-section .product-card',
    '.products-grid .product-card',
    '.featured-grid .product-card',
    '.banner-content',
    '.collection-banner .container',
    '.banner-visual',
    '.brand-story-text',
    '.brand-story-stats .stat-card',
    '.story-text-column',
    '.story-stats-grid',
    '.benefits-container .benefit-item',
    '.benefits-grid .benefit-item',
    '.site-footer .footer-brand-col',
    '.site-footer .footer-col',
    '.site-footer .footer-eme-middle-bar',
    '.site-footer .footer-eme-monumental-wrap',

    // Shop Catalog (tienda.html / store.html)
    '.shop-hero-copy',
    '.shop-display',
    '.shop-header-row',
    '.shop-sidebar',
    '.shop-products-grid .shop-product-card',
    '.shop-product-card',
    '[data-product-card]',

    // Product Detail (producto.html)
    '.detail-breadcrumb',
    '.detail-media',
    '.detail-viewer',
    '.detail-info',
    '.detail-accordion',
    '.detail-related',
    '.related-product',

    // Cart (carrito.html)
    '.shop-page-heading',
    '.shop-cart-page-items',
    '.shop-cart-page-summary',
    '.cart-page-item',

    // Contact & Newsletter (contacto.html)
    '.shop-pure-newsletter-box',
    '.contact-info-col',
    '.contact-form-col',
    '.newsletter-container',

    // Authentication (login.html)
    '.auth-header-brand',
    '.auth-tabs',
    '.auth-form-card',
    '#profile-card',

    // Admin Customers (admin-clientes.html)
    '.admin-stats-grid .admin-stat-card',
    '.admin-toolbar',
    '.admin-table-container',

    // Generic / Data attributes
    '[data-reveal]',
    '.scroll-reveal'
  ].join(', ');

  // Lookahead rootMargin so elements start animating smoothly just before reaching viewport
  const isMobile = window.innerWidth <= 768;
  const ROOT_MARGIN = isMobile ? '0px 0px 140px 0px' : '0px 0px 180px 0px';

  // Automated Stagger Groups
  const STAGGER_GROUPS = [
    { selector: '.categories-grid', step: 100, max: 4 },
    { selector: '.products-grid', step: 85, max: 4 },
    { selector: '.featured-grid', step: 85, max: 4 },
    { selector: '.shop-products-grid', step: 85, max: 4 },
    { selector: '.brand-story-stats', step: 90, max: 3 },
    { selector: '.benefits-container', step: 75, max: 4 },
    { selector: '.benefits-grid', step: 75, max: 4 },
    { selector: '.admin-stats-grid', step: 80, max: 4 },
    { selector: '.related-products', step: 85, max: 4 },
    { selector: '[data-detail-related]', step: 85, max: 4 },
    { selector: '.footer-main-grid', step: 90, max: 4 }
  ];

  let observer = null;

  function getObserver() {
    if (!observer) {
      observer = new IntersectionObserver(onIntersect, {
        root: null,
        rootMargin: ROOT_MARGIN,
        threshold: [0, 0.08]
      });
    }
    return observer;
  }

  function onIntersect(entries, obs) {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      el.classList.add('in-view');
      if (el.hasAttribute('data-reveal')) {
        el.classList.add('is-visible');
      }
      obs.unobserve(el);

      // Clean up GPU layers once transition finishes to free memory
      el.addEventListener('transitionend', () => {
        el.style.willChange = 'auto';
      }, { once: true });
    });
  }

  function applyStagger(root = document) {
    STAGGER_GROUPS.forEach(group => {
      root.querySelectorAll(group.selector).forEach(grid => {
        const children = Array.from(grid.children).filter(child => child.nodeType === 1);
        children.forEach((child, index) => {
          if (child.style.getPropertyValue('--reveal-delay')) return;
          const step = Math.min(index, group.max) * group.step;
          child.style.setProperty('--reveal-delay', `${step}ms`);
        });
      });
    });
  }

  function observe(root = document) {
    if (reduceMotion.matches || !('IntersectionObserver' in window)) {
      // In reduced-motion mode, immediately reveal everything without transition
      root.querySelectorAll(MOTION_TARGETS).forEach(el => {
        el.classList.add('in-view');
        if (el.hasAttribute('data-reveal')) el.classList.add('is-visible');
      });
      return;
    }

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

  /* ============================================================
     SMOOTH INTERNAL ANCHOR NAVIGATION (COMPENSATING HEADER HEIGHT)
     ============================================================ */
  function initSmoothAnchorScroll() {
    document.addEventListener('click', event => {
      const anchor = event.target.closest('a[href*="#"]');
      if (!anchor) return;

      const href = anchor.getAttribute('href');
      if (!href || href === '#' || href.startsWith('#!')) return;

      // Check if the link targets an anchor on current page
      const url = new URL(anchor.href, window.location.href);
      const isSamePage = url.pathname === window.location.pathname && url.origin === window.location.origin;

      if (isSamePage && url.hash) {
        const targetId = decodeURIComponent(url.hash.substring(1));
        const targetEl = document.getElementById(targetId) || document.querySelector(`[name="${targetId}"]`);
        
        if (targetEl) {
          event.preventDefault();

          // Calculate header offset
          const header = document.querySelector('.site-header');
          const headerHeight = header ? header.getBoundingClientRect().height : 80;
          const targetOffset = targetEl.getBoundingClientRect().top + window.scrollY - (headerHeight + 20);

          if (reduceMotion.matches) {
            window.scrollTo(0, targetOffset);
          } else {
            window.scrollTo({
              top: Math.max(0, targetOffset),
              behavior: 'smooth'
            });
          }

          // Update URL hash smoothly without jump
          if (history.pushState) {
            history.pushState(null, '', url.hash);
          }
        }
      }
    });
  }

  /* ============================================================
     CINEMATIC SCROLL TEXT REVEAL BANNER (LETTER-BY-LETTER)
     ============================================================ */
  function initScrollTextReveal() {
    const textSection = document.querySelector('.scroll-text-section');
    if (!textSection) return;

    const charSpans = Array.from(textSection.querySelectorAll('.char-span'));
    if (!charSpans.length) return;

    if (reduceMotion.matches) {
      charSpans.forEach(span => {
        span.style.opacity = '1';
        span.style.transform = 'none';
        span.style.color = span.closest('.reveal-interactive') ? '#EF4444' : 'var(--text-primary)';
      });
      return;
    }

    const totalChars = charSpans.length;
    const charOverlap = 0.08;
    const step = (1 - charOverlap) / totalChars;
    const charWindow = step + charOverlap;

    let ticking = false;

    function handleScroll() {
      const isLight = document.documentElement.dataset.theme === 'light';
      const baseRgb = isLight ? '14, 14, 14' : '255, 255, 255';
      const rect = textSection.getBoundingClientRect();
      const windowHeight = window.innerHeight;

      const startPoint = windowHeight * 0.82;
      const endPoint = windowHeight * 0.22;
      const scrollRange = Math.max(1, startPoint - endPoint);

      const overallProgress = Math.max(0, Math.min(1, (startPoint - rect.top) / scrollRange));

      charSpans.forEach((span, idx) => {
        const charStart = idx * step;
        const localProgress = Math.max(0, Math.min(1, (overallProgress - charStart) / charWindow));
        
        // Eased progress (cubic smoothstep)
        const eased = localProgress * localProgress * (3 - 2 * localProgress);
        const isLine2 = span.closest('.reveal-interactive') !== null;

        if (isLine2) {
          // Line 2: Red accent (#EF4444)
          const alpha = (0.18 + eased * 0.82).toFixed(3);
          span.style.color = `rgba(239, 68, 68, ${alpha})`;
        } else {
          // Line 1: Theme-aware color
          const alpha = (0.15 + eased * 0.85).toFixed(3);
          span.style.color = `rgba(${baseRgb}, ${alpha})`;
        }

        const translateY = ((1 - eased) * 4).toFixed(2);
        span.style.transform = `translateY(${translateY}px)`;
        span.style.filter = 'none';
      });

      ticking = false;
    }

    function onScroll() {
      if (!ticking) {
        requestAnimationFrame(handleScroll);
        ticking = true;
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });

    // Watch for theme toggles on <html> and update instantly
    const themeObserver = new MutationObserver(() => {
      handleScroll();
    });
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

    handleScroll();
  }

  /* ============================================================
     MUTATION OBSERVER FOR DYNAMIC CONTENT (SPA Filters & Updates)
     ============================================================ */
  function initDynamicObserver() {
    if (typeof MutationObserver === 'undefined') return;

    let debounceTimer = null;
    const dynamicObserver = new MutationObserver(() => {
      if (debounceTimer) clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        applyStagger(document);
        observe(document);
      }, 60);
    });

    dynamicObserver.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  /* ============================================================
     INITIALIZATION & EXPORT
     ============================================================ */
  function refresh() {
    applyStagger(document);
    observe(document);
    initScrollTextReveal();
  }

  function init() {
    refresh();
    initSmoothAnchorScroll();
    initDynamicObserver();

    // Listen for reduced motion preference toggle in OS
    if (reduceMotion.addEventListener) {
      reduceMotion.addEventListener('change', () => {
        refresh();
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Public API for other modules
  window.DopamineReveal = {
    observe,
    applyStagger,
    refresh,
    initScrollTextReveal
  };
})();
