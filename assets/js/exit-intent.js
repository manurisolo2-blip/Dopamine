/**
 * ============================================================
 * DOPAMINE STREETWEAR — Exit Intent & Recovery Engine
 * ============================================================
 * Clean Space Grotesk / SF Pro exit intent modal with voucher recovery.
 * - Multi-language (i18n) reactivity on language toggle.
 * - Icon-safe button copying (preserves SVG glyphs).
 * - Cooldown persistence in localStorage (12h cooldown).
 * - Accessibility: ESC key, aria-modal, focus trapping.
 */

(function (window, document) {
  'use strict';

  const STORAGE_KEY = 'dopamine_exit_dismissed';
  const COOLDOWN_HOURS = 12;
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
      copyText: document.querySelector('[data-exit-copy-text]'),
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

    // Focus management for accessibility
    const focusable = modal.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    if (focusable) focusable.focus();

    // Trigger i18n synchronization in case language was toggled before opening
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
    const { copyBtn, copyText, codeElement } = getModalElements();
    const code = (codeElement ? codeElement.textContent.trim() : VOUCHER_CODE) || VOUCHER_CODE;

    navigator.clipboard.writeText(code).then(() => {
      if (copyBtn) {
        const targetLabel = copyText || copyBtn;
        const copiedText = window.DopamineI18n ? window.DopamineI18n.t('exit.copied') : '¡CÓDIGO COPIADO!';
        targetLabel.textContent = copiedText;
        copyBtn.classList.add('copied');

        setTimeout(() => {
          if (copyBtn) {
            const defaultText = window.DopamineI18n ? window.DopamineI18n.t('exit.copy_btn') : 'COPIAR CÓDIGO';
            targetLabel.textContent = defaultText;
            copyBtn.classList.remove('copied');
          }
        }, 3000);
      }

      // Feedback toast
      const toastMsg = window.DopamineI18n
        ? window.DopamineI18n.t('exit.toast_copied')
        : `✓ ${code} copiado al portapapeles (10% OFF)`;
      showToastNotification(toastMsg);
    }).catch(() => {
      showToastNotification(`Código: ${code}`);
    });
  }

  function showToastNotification(msg) {
    const toast = document.querySelector('[data-toast]');
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add('show', 'is-visible');
    clearTimeout(toast._timeout);
    toast._timeout = setTimeout(() => toast.classList.remove('show', 'is-visible'), 3500);
  }

  function initListeners() {
    // 1. Mouseleave detection (desktop exit intent from top viewport)
    document.addEventListener('mouseleave', (e) => {
      if (e.clientY <= 15 && !hasTriggeredThisSession && !isCoolingDown()) {
        openExitModal();
      }
    });

    // 2. Event delegation for clicks
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

    // 3. Escape key handler
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && isModalOpen) {
        closeExitModal();
      }
    });

    // 4. Reactive i18n event listeners
    const handleLangChange = () => {
      const { copyText, copyBtn } = getModalElements();
      if (copyBtn && !copyBtn.classList.contains('copied')) {
        const targetLabel = copyText || copyBtn;
        if (window.DopamineI18n) {
          targetLabel.textContent = window.DopamineI18n.t('exit.copy_btn');
        }
      }
    };
    document.addEventListener('dopamine:langchange', handleLangChange);
    document.addEventListener('dopamine:languageChange', handleLangChange);
  }

  // Initialize on DOM Ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initListeners);
  } else {
    initListeners();
  }

  // Global API
  window.DopamineExitIntent = {
    open: (force = true) => openExitModal(force),
    close: closeExitModal,
    copy: copyVoucherCode,
    copyCode: copyVoucherCode,
    reset: () => {
      try {
        localStorage.removeItem(STORAGE_KEY);
        hasTriggeredThisSession = false;
      } catch (e) {}
    }
  };

})(window, document);
