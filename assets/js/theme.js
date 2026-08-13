(() => {
  const storageKey = 'dopamine-theme';
  const savedTheme = localStorage.getItem(storageKey) || 'dark';
  document.documentElement.dataset.theme = savedTheme;

  function updateFavicon(theme) {
    let favicon = document.getElementById('dynamic-favicon');
    if (!favicon) {
      favicon = document.querySelector('link[rel="icon"]');
    }
    if (favicon) {
      favicon.href = theme === 'dark'
        ? 'assets/Branding/Logos/isotipo invertido.png'
        : 'assets/Branding/Logos/Isotipo.png';
    }
  }

  function changeTheme(nextTheme) {
    const updateTheme = () => {
      document.documentElement.dataset.theme = nextTheme;
      localStorage.setItem(storageKey, nextTheme);
      updateFavicon(nextTheme);
    };

    if (document.startViewTransition) {
      document.startViewTransition(updateTheme);
    } else {
      updateTheme();
    }
  }

  function bindThemeToggles() {
    document.querySelectorAll('#theme-toggle, [data-theme-toggle]').forEach(button => {
      if (!button.dataset.themeBound) {
        button.dataset.themeBound = 'true';
        button.addEventListener('click', () => {
          const nextTheme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
          changeTheme(nextTheme);
        });
      }
    });
  }

  // Initial update & bind
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      updateFavicon(savedTheme);
      bindThemeToggles();
    });
  } else {
    updateFavicon(savedTheme);
    bindThemeToggles();
  }

  // Global click delegation safety fallback
  document.addEventListener('click', (e) => {
    const toggleBtn = e.target.closest('#theme-toggle, [data-theme-toggle]');
    if (toggleBtn && !toggleBtn.dataset.themeBound) {
      const nextTheme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
      changeTheme(nextTheme);
    }
  });
})();
