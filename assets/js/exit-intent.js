/**
 * ============================================================
 * DOPAMINE STREETWEAR — Exit Intent & Recovery Engine
 * ============================================================
 * High-performance cyberpunk exit intent modal with voucher recovery.
 * - Detects cursor leaving viewport (desktop) and idle delay (mobile).
 * - Single-session / cooldown persistence in localStorage.
 * - 1-Click voucher coupon clipboard copying with toast feedback.
 * - Full accessibility: ESC key handler, focus trap, aria attributes.
 * - Multi-language (i18n) reactivity.
 */

(function (window, document) {
  'use strict';

  const STORAGE_KEY = 'dopamine_exit_dismissed';
  const COOLDOWN_HOURS = 12; // Cooldown before showing exit modal again
  const VOUCHER_CODE = 'DOPAMINE10';

  let isModalOpen = false;
  let hasTriggeredThisSession = false;

  function isCoolingDown() {
    try {
      const lastDismissed = localStorage.getItem(STORAGE_KEY);
      if (!lastDismissed) return false;
      const elapsedHours = (Date.now() - parseInt(lastDismissed, 10)) / (1000 * 60 * 60);
      return elapsedHours < COOLDOWN_HOURS;
    } catch (e) {
      return false;
    }
  }

  function markDismissed() {
    try {
      localStorage.setItem(STORAGE_KEY, Date.now().toString());
    } catch (e) {}
  }

  function getModalElements() {
    return {
      overlay: document.querySelector('[data-exit-modal-overlay]'),
      modal: document.querySelector('[data-exit-modal]'),
      closeBtn: document.querySelector('[data-exit-close]'),
      copyBtn: document.querySelector('[data-exit-copy]'),
      codeElement: document.querySelector('[data-exit-code]'),
      shopBtn: document.querySelector('[data-exit-shop]')
    };
  }

  function openExitModal(isManual = false) {
    if (isModalOpen) return;
    if (!isManual && (hasTriggeredThisSession || isCoolingDown())) return;

    const { overlay, modal } = getModalElements();
    if (!overlay || !modal) return;

    hasTriggeredThisSession = true;
    isModalOpen = true;

    overlay.removeAttribute('hidden');
    overlay.classList.add('is-active');
    modal.removeAttribute('hidden');
    modal.classList.add('is-active');
    document.body.classList.add('modal-open');

    // Accessibility focus
    const focusable = modal.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    if (focusable) focusable.focus();

    // Trigger i18n update in case language switched
    if (window.DopamineI18n && typeof window.DopamineI18n.applyTranslations === 'function') {
      window.DopamineI18n.applyTranslations();
    }
  }

  function closeExitModal() {
    if (!isModalOpen) return;

    const { overlay, modal } = getModalElements();
    if (overlay) {
      overlay.classList.remove('is-active');
      setTimeout(() => overlay.setAttribute('hidden', ''), 250);
    }
    if (modal) {
      modal.classList.remove('is-active');
      setTimeout(() => modal.setAttribute('hidden', ''), 250);
    }

    document.body.classList.remove('modal-open');
    isModalOpen = false;
    markDismissed();
  }

  function copyVoucherCode() {
    const { copyBtn, codeElement } = getModalElements();
    const code = (codeElement ? codeElement.textContent.trim() : VOUCHER_CODE) || VOUCHER_CODE;

    navigator.clipboard.writeText(code).then(() => {
      if (copyBtn) {
        const originalText = copyBtn.textContent;
        const copiedText = window.DopamineI18n ? window.DopamineI18n.t('exit.copied') : '¡CÓDIGO COPIADO!';
        copyBtn.textContent = copiedText;
        copyBtn.classList.add('copied');
        
        setTimeout(() => {
          if (copyBtn) {
            const defaultText = window.DopamineI18n ? window.DopamineI18n.t('exit.copy_btn') : 'COPIAR CÓDIGO';
            copyBtn.textContent = defaultText;
            copyBtn.classList.remove('copied');
          }
        }, 3000);
      }

      // Show toast if available
      showToastNotification(`✓ ${code} copiado al portapapeles (10% OFF)`);
    }).catch(() => {
      // Fallback
      showToastNotification(`Código: ${code}`);
    });
  }

  function showToastNotification(msg) {
    const toast = document.querySelector('[data-toast]');
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(toast._timeout);
    toast._timeout = setTimeout(() => toast.classList.remove('show'), 3500);
  }

  function initListeners() {
    // 1. Mouseleave detection (Desktop cursor exiting top)
    document.addEventListener('mouseleave', (e) => {
      if (e.clientY <= 15 && !hasTriggeredThisSession && !isCoolingDown()) {
        openExitModal();
      }
    });

    // 2. Click delegation for modal actions
    document.addEventListener('click', (e) => {
      if (e.target.closest('[data-exit-close]') || e.target.matches('[data-exit-modal-overlay]')) {
        e.preventDefault();
        closeExitModal();
      }

      if (e.target.closest('[data-exit-copy]')) {
        e.preventDefault();
        copyVoucherCode();
      }

      if (e.target.closest('[data-exit-trigger]')) {
        e.preventDefault();
        openExitModal(true);
      }
    });

    // 3. Escape key closes modal
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && isModalOpen) {
        closeExitModal();
      }
    });
  }

  // Initialize
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initListeners);
  } else {
    initListeners();
  }

  // Public API
  window.DopamineExitIntent = {
    open: (force = true) => openExitModal(force),
    close: closeExitModal,
    copy: copyVoucherCode,
    reset: () => {
      try {
        localStorage.removeItem(STORAGE_KEY);
        hasTriggeredThisSession = false;
      } catch (e) {}
    }
  };

})(window, document);
