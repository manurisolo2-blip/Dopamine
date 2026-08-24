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
  // 0. BRAND SPLASH PRELOADER ENGINE (DOPAMINE LOADING SCREEN)
  // ============================================================
  function initDopaminePreloader() {
    const preloader = document.getElementById('dopamine-preloader');
    if (!preloader) return;

    let isDismissed = false;

    function dismissPreloader(immediate = false) {
      if (isDismissed) return;
      isDismissed = true;

      preloader.setAttribute('aria-busy', 'false');

      if (immediate) {
        preloader.classList.add('is-loaded');
        preloader.setAttribute('aria-hidden', 'true');
        preloader.style.display = 'none';
        return;
      }

      preloader.classList.add('is-loaded');
      preloader.setAttribute('aria-hidden', 'true');

      // Unrender after CSS opacity transition completes
      setTimeout(() => {
        if (preloader && preloader.parentNode) {
          preloader.style.display = 'none';
        }
      }, 500);
    }

    // Dismiss when document and assets finish loading
    if (document.readyState === 'complete') {
      setTimeout(() => dismissPreloader(false), 200);
    } else {
      window.addEventListener('load', () => {
        setTimeout(() => dismissPreloader(false), 180);
      });
    }

    // Safety fallback timeout: max 1.1s (1100ms)
    setTimeout(() => {
      dismissPreloader(false);
    }, 1100);

    // BFCACHE (Back/Forward Cache Navigation Support)
    window.addEventListener('pageshow', (event) => {
      if (event.persisted) {
        dismissPreloader(true);
      }
    });
  }

  initDopaminePreloader();

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

  // ============================================================
  // 1.8. FLOATING BACK TO TOP ENGINE
  // ============================================================
  function initBackToTop() {
    let btn = document.getElementById('back-to-top');

    // Resilient fallback: inject button if absent in DOM
    if (!btn) {
      btn = document.createElement('button');
      btn.id = 'back-to-top';
      btn.className = 'back-to-top-btn';
      btn.type = 'button';
      btn.setAttribute('aria-label', 'Volver arriba');
      btn.setAttribute('data-i18n-aria-label', 'nav.back_to_top_aria');
      btn.setAttribute('data-i18n-title', 'ui.back_to_top');
      btn.setAttribute('title', 'Volver arriba');
      btn.setAttribute('aria-hidden', 'true');
      btn.setAttribute('tabindex', '-1');
      btn.innerHTML = `
        <svg class="back-to-top-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M12 19V5M5 12l7-7 7 7"/>
        </svg>
        <span class="back-to-top-text" data-i18n="ui.back_to_top_short">TOP</span>
      `;
      document.body.appendChild(btn);

      // Trigger i18n localization if available
      if (window.DopamineI18n && typeof window.DopamineI18n.translatePage === 'function') {
        window.DopamineI18n.translatePage();
      } else if (window.i18n && typeof window.i18n.translatePage === 'function') {
        window.i18n.translatePage();
      }
    }

    const SCROLL_THRESHOLD = 350;
    let ticking = false;

    function toggleBackToTop() {
      const scrollY = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
      const isVisible = scrollY > SCROLL_THRESHOLD;

      if (isVisible) {
        btn.classList.add('is-visible');
        btn.setAttribute('aria-hidden', 'false');
        btn.setAttribute('tabindex', '0');
      } else {
        btn.classList.remove('is-visible');
        btn.setAttribute('aria-hidden', 'true');
        btn.setAttribute('tabindex', '-1');
      }

      ticking = false;
    }

    window.addEventListener('scroll', () => {
      if (!ticking) {
        window.requestAnimationFrame(toggleBackToTop);
        ticking = true;
      }
    }, { passive: true });

    // Click handler for smooth scrolling
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      
      const prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      
      // Perform smooth scroll to top
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: prefersReducedMotion ? 'auto' : 'smooth'
      });

      // Accessible focus management: focus header/top container without jarring scroll
      const topFocusTarget = document.getElementById('site-header') || document.querySelector('header, h1, [role="banner"], body');
      if (topFocusTarget) {
        if (!topFocusTarget.hasAttribute('tabindex')) {
          topFocusTarget.setAttribute('tabindex', '-1');
        }
        topFocusTarget.focus({ preventScroll: true });
      }
    });

    // Run initial check
    toggleBackToTop();
  }

  // ============================================================
  // 1.9. GLOBAL FOOTER NEWSLETTER VALIDATION & FEEDBACK ENGINE
  // ============================================================
  function initFooterNewsletterValidation() {
    const forms = document.querySelectorAll('.footer-email-form, #footer-signup-form');
    if (forms.length === 0) return;

    function getI18nText(key, fallback) {
      if (window.DopamineI18n && typeof window.DopamineI18n.t === 'function') {
        return window.DopamineI18n.t(key) || fallback;
      }
      if (window.i18n && typeof window.i18n.t === 'function') {
        return window.i18n.t(key) || fallback;
      }
      return fallback;
    }

    const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

    forms.forEach(form => {
      const input = form.querySelector('input[type="email"]');
      const inputWrap = form.querySelector('.footer-input-wrap');
      if (!input) return;

      // Create feedback container if not present
      let feedback = form.querySelector('.footer-newsletter-feedback');
      if (!feedback) {
        feedback = document.createElement('div');
        feedback.className = 'footer-newsletter-feedback';
        feedback.setAttribute('role', 'alert');
        feedback.setAttribute('aria-live', 'polite');
        form.appendChild(feedback);
      }

      function showFeedback(type, messageKey, fallbackText) {
        const text = getI18nText(messageKey, fallbackText);
        feedback.textContent = text;
        feedback.className = `footer-newsletter-feedback is-visible ${type}`;
        
        if (type === 'error') {
          if (inputWrap) {
            inputWrap.classList.add('is-invalid', 'shake-error');
            setTimeout(() => inputWrap.classList.remove('shake-error'), 500);
          }
          input.setAttribute('aria-invalid', 'true');
        } else {
          if (inputWrap) {
            inputWrap.classList.remove('is-invalid');
            inputWrap.classList.add('is-valid');
          }
          input.setAttribute('aria-invalid', 'false');
        }
      }

      function clearError() {
        if (feedback.classList.contains('error')) {
          feedback.textContent = '';
          feedback.classList.remove('is-visible', 'error');
        }
        if (inputWrap) inputWrap.classList.remove('is-invalid', 'shake-error');
        input.removeAttribute('aria-invalid');
      }

      input.addEventListener('input', () => {
        if (inputWrap && inputWrap.classList.contains('is-invalid')) {
          if (EMAIL_REGEX.test(input.value.trim())) {
            clearError();
          }
        }
      });

      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = input.value.trim();

        if (!email) {
          showFeedback('error', 'validation.footer_email_empty', 'Ingresá tu email para suscribirte');
          input.focus();
          return;
        }

        if (!EMAIL_REGEX.test(email)) {
          showFeedback('error', 'validation.footer_email_invalid', 'Formato de email incorrecto');
          input.focus();
          return;
        }

        // Store subscription locally
        const subs = JSON.parse(localStorage.getItem('dopamine_newsletter_subs') || '[]');
        if (!subs.includes(email.toLowerCase())) {
          subs.push(email.toLowerCase());
          localStorage.setItem('dopamine_newsletter_subs', JSON.stringify(subs));
        }

        // Show Success Feedback
        showFeedback('success', 'validation.footer_success', '✓ ¡TE UNISTE AL CLUB! REVISÁ TU CORREO');
        input.value = '';
        if (inputWrap) inputWrap.classList.remove('is-invalid');

        // Disappear success message gracefully after 6 seconds
        setTimeout(() => {
          if (feedback.classList.contains('success')) {
            feedback.classList.remove('is-visible');
            if (inputWrap) inputWrap.classList.remove('is-valid');
          }
        }, 6000);
      });
    });
  }

  // ============================================================
  // 1.7. MOBILE NAVIGATION & DRAWER MENU CONTROLLER (STREETWEAR UX)
  // ============================================================
  function initMobileNavigation() {
    const drawer = document.getElementById('mobile-menu-drawer') || document.querySelector('[data-mobile-menu], .mobile-menu-drawer');
    const overlay = document.getElementById('mobile-menu-overlay') || document.querySelector('[data-menu-overlay], .mobile-menu-overlay');
    const toggles = document.querySelectorAll('#menu-toggle, [data-menu-open], .mobile-menu-toggle');

    function syncDrawerAuthState() {
      if (!drawer) return;
      const accountName = drawer.querySelector('[data-mobile-account-name]');
      const accountStatus = drawer.querySelector('[data-mobile-account-status]');
      const user = window.DopamineAuth ? window.DopamineAuth.getUser() : null;

      if (user && user.loggedIn) {
        if (accountName) accountName.textContent = user.name || user.email.split('@')[0];
        if (accountStatus) {
          const isEn = (window.DopamineI18n && window.DopamineI18n.getLang() === 'en') || (window.i18n && window.i18n.getLang() === 'en');
          accountStatus.textContent = isEn ? 'ACTIVE CLUB MEMBER ✓' : 'MEMBER CLUB ACTIVO ✓';
          accountStatus.style.color = '#22C55E';
        }
      } else {
        if (accountName) {
          const isEn = (window.DopamineI18n && window.DopamineI18n.getLang() === 'en') || (window.i18n && window.i18n.getLang() === 'en');
          accountName.textContent = isEn ? 'CLUB / MY ACCOUNT' : 'CLUB / MI CUENTA';
        }
        if (accountStatus) {
          const isEn = (window.DopamineI18n && window.DopamineI18n.getLang() === 'en') || (window.i18n && window.i18n.getLang() === 'en');
          accountStatus.textContent = isEn ? 'Access drops & member perks' : 'Acceso a drops y beneficios';
          accountStatus.style.color = '';
        }
      }
    }

    function syncDrawerThemeState() {
      if (!drawer) return;
      const currentTheme = document.documentElement.dataset.theme || 'dark';
      const themeText = drawer.querySelector('[data-mobile-theme-text]');
      if (themeText) {
        const isEn = (window.DopamineI18n && window.DopamineI18n.getLang() === 'en') || (window.i18n && window.i18n.getLang() === 'en');
        if (currentTheme === 'dark') {
          themeText.textContent = isEn ? 'DARK MODE' : 'MODO OSCURO';
        } else {
          themeText.textContent = isEn ? 'LIGHT MODE' : 'MODO CLARO';
        }
      }
    }

    function syncDrawerLangState() {
      if (!drawer) return;
      const currentLang = (window.DopamineI18n && window.DopamineI18n.getLang()) || (window.i18n && window.i18n.getLang()) || localStorage.getItem('dopamine_lang') || 'es';
      drawer.querySelectorAll('.mobile-lang-btn[data-set-lang]').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.setLang === currentLang);
      });
      syncDrawerAuthState();
      syncDrawerThemeState();
    }

    function openMobileMenu() {
      if (!drawer) return;
      
      syncDrawerAuthState();
      syncDrawerThemeState();
      syncDrawerLangState();

      // Lock body scroll with multi-class standard
      document.body.classList.add('menu-open', 'drawer-open');
      document.documentElement.classList.add('menu-open', 'drawer-open');

      drawer.classList.add('is-open', 'is-active');
      drawer.setAttribute('aria-hidden', 'false');
      drawer.removeAttribute('hidden');

      if (overlay) {
        overlay.classList.add('is-open', 'is-active', 'is-visible');
        overlay.removeAttribute('hidden');
      }

      toggles.forEach(btn => {
        btn.setAttribute('aria-expanded', 'true');
      });

      // Focus close button for accessibility
      const closeBtn = drawer.querySelector('.drawer-close, [data-menu-close], .mobile-menu-close');
      if (closeBtn) {
        closeBtn.focus({ preventScroll: true });
      }
    }

    function closeMobileMenu() {
      if (!drawer) return;

      // Unlock body scroll
      document.body.classList.remove('menu-open', 'drawer-open');
      document.documentElement.classList.remove('menu-open', 'drawer-open');

      drawer.classList.remove('is-open', 'is-active');
      drawer.setAttribute('aria-hidden', 'true');

      if (overlay) {
        overlay.classList.remove('is-open', 'is-active', 'is-visible');
      }

      toggles.forEach(btn => {
        btn.setAttribute('aria-expanded', 'false');
      });
    }

    function toggleMobileMenu() {
      if (drawer && drawer.classList.contains('is-open')) {
        closeMobileMenu();
      } else {
        openMobileMenu();
      }
    }

    // Expose global API
    window.DopamineNav = {
      openMobileMenu,
      closeMobileMenu,
      toggleMobileMenu,
      syncDrawerAuthState,
      syncDrawerLangState,
      syncDrawerThemeState
    };

    // Global Click Delegation for Menus
    document.addEventListener('click', (e) => {
      const openTrigger = e.target.closest('#menu-toggle, [data-menu-open], .mobile-menu-toggle');
      const closeTrigger = e.target.closest('.drawer-close, [data-menu-close], .mobile-menu-close');
      const overlayTrigger = e.target.closest('[data-menu-overlay], .mobile-menu-overlay');
      const navLinkInsideDrawer = e.target.closest('.mobile-menu-drawer a:not([data-no-close])');
      const langBtnInsideDrawer = e.target.closest('.mobile-lang-btn[data-set-lang]');
      const themeBtnInsideDrawer = e.target.closest('.mobile-menu-drawer [data-theme-toggle]');

      if (openTrigger) {
        e.preventDefault();
        e.stopPropagation();
        toggleMobileMenu();
        return;
      }

      if (closeTrigger && e.target.closest('.mobile-menu-drawer, .mobile-menu-header')) {
        e.preventDefault();
        e.stopPropagation();
        closeMobileMenu();
        return;
      }

      if (overlayTrigger && drawer && drawer.classList.contains('is-open')) {
        e.preventDefault();
        e.stopPropagation();
        closeMobileMenu();
        return;
      }

      // If user clicks a link inside the mobile drawer, close it gracefully
      if (navLinkInsideDrawer) {
        closeMobileMenu();
        return;
      }

      // Language switch inside drawer
      if (langBtnInsideDrawer) {
        e.preventDefault();
        const targetLang = langBtnInsideDrawer.dataset.setLang;
        if (targetLang) {
          if (window.DopamineI18n && typeof window.DopamineI18n.setLang === 'function') {
            window.DopamineI18n.setLang(targetLang);
          } else if (window.i18n && typeof window.i18n.setLang === 'function') {
            window.i18n.setLang(targetLang);
          }
          syncDrawerLangState();
        }
        return;
      }

      // Theme toggle inside drawer
      if (themeBtnInsideDrawer) {
        setTimeout(syncDrawerThemeState, 60);
      }
    });

    // Keyboard ESC Listener
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && drawer && drawer.classList.contains('is-open')) {
        closeMobileMenu();
      }
    });

    // Listen to i18n & Theme events to keep drawer localized
    document.addEventListener('dopamine:langchange', syncDrawerLangState);
    document.addEventListener('dopamine:languageChange', syncDrawerLangState);
    document.addEventListener('dopamine:authchange', syncDrawerAuthState);
    window.addEventListener('storage', () => {
      syncDrawerAuthState();
      syncDrawerThemeState();
      syncDrawerLangState();
    });

    // Initial state sync
    syncDrawerAuthState();
    syncDrawerThemeState();
    syncDrawerLangState();
  }

  function init() {
    initCinematicScrollEngine();
    initFooterAccordion();
    initBackToTop();
    initFooterNewsletterValidation();
    initMobileNavigation();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
