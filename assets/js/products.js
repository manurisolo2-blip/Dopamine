(function (window) {
  const catalog = window.DopamineCatalog;
  const products = catalog.products;
  const state = { category: '', size: '', color: '', availability: '', tag: '', sort: 'featured', query: '' };
  const grid = () => document.querySelector('[data-products-grid]');

  function esc(value) { return String(value).replace(/[&<>'"]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char])); }
  function money(value) { return '$' + Number(value).toLocaleString('es-AR'); }
  function swatches(product) { return product.colors.map((color, index) => `<i class="shop-swatch ${index === 0 ? 'is-active' : ''}" style="--swatch:${color.hex}" title="${esc(color.name)}"></i>`).join(''); }
  function productCard(product, index) {
    const favorite = window.DopamineCart?.isFavorite(product.id);
    const stock = product.stock <= 5 ? `<span class="stock-warning">${product.stock} LEFT</span>` : '';
    const priceHTML = product.compareAtPrice
      ? `<div class="shop-product-prices">
           <del class="price-old">${money(product.compareAtPrice)}</del>
           <span class="price-current">${money(product.price)}</span>
         </div>`
      : `<div class="shop-product-prices">
           <span class="price-current">${money(product.price)}</span>
         </div>`;

    return `<article class="shop-product-card tilt-card reveal" data-product-card data-product-id="${product.id}" style="--reveal-delay:${index * 60}ms">
      <div class="shop-product-media">
        <a class="shop-product-link" href="producto.html?slug=${product.slug}" aria-label="Ver ${esc(product.name)}">
          <img class="shop-product-image image-primary" src="${product.images[0]}" alt="${esc(product.name)}" loading="lazy">
          <img class="shop-product-image image-secondary" src="${product.images[1] || product.images[0]}" alt="${esc(product.name)} detalle" loading="lazy">
        </a>
        <span class="shop-product-badge">${esc(product.badge)}</span>
        <button class="shop-favorite ${favorite ? 'is-active' : ''}" type="button" data-favorite="${product.id}" aria-label="${favorite ? 'Quitar de favoritos' : 'Agregar a favoritos'}" aria-pressed="${favorite}">♡</button>
        <button class="shop-quick-add" type="button" data-quick-add="${product.id}"><span>QUICK ADD</span><b>+</b></button>
        ${product.stock === 0 ? '<span class="sold-out-label">SOLD OUT</span>' : ''}
      </div>
      <div class="shop-product-copy">
        <div class="shop-product-head">
          <h3>${esc(product.name)}</h3>
          ${priceHTML}
        </div>
        <p>${esc(product.subtitle)}</p>
        <div class="shop-product-meta"><div class="shop-swatches">${swatches(product)}</div>${stock}</div>
      </div>
    </article>`;
  }

  function getStateFromURL() {
    const params = new URLSearchParams(window.location.search);
    state.category = params.get('category') || '';
    state.size = params.get('size') || '';
    state.color = params.get('color') || '';
    state.availability = params.get('availability') || '';
    state.tag = params.get('tag') || '';
    state.sort = params.get('sort') || 'featured';
    state.query = params.get('q') || '';
  }

  function writeURL() {
    const params = new URLSearchParams();
    Object.entries(state).forEach(([key, value]) => { if (value) params.set(key === 'query' ? 'q' : key, value); });
    const next = params.toString();
    window.history.replaceState({}, '', next ? `${window.location.pathname}?${next}` : window.location.pathname);
  }

  function visibleProducts() {
    let result = products.filter(product => {
      if (state.category && product.category !== state.category) return false;
      if (state.size && !product.sizes.includes(state.size)) return false;
      if (state.color && !product.colors.some(color => color.id === state.color)) return false;
      if (state.tag && product.badge.toLowerCase().replaceAll(' ', '-') !== state.tag) return false;
      if (state.availability === 'in-stock' && product.stock === 0) return false;
      if (state.availability === 'low-stock' && (product.stock === 0 || product.stock > 5)) return false;
      if (state.availability === 'sold-out' && product.stock !== 0) return false;
      if (state.query) {
        const haystack = `${product.name} ${product.category} ${product.badge} ${product.subtitle}`.toLowerCase();
        if (!haystack.includes(state.query.toLowerCase())) return false;
      }
      return true;
    });
    if (state.sort === 'price-low') result.sort((a, b) => a.price - b.price);
    if (state.sort === 'price-high') result.sort((a, b) => b.price - a.price);
    if (state.sort === 'newest') result.sort((a, b) => (b.badge === 'NEW') - (a.badge === 'NEW'));
    if (state.sort === 'stock') result.sort((a, b) => a.stock - b.stock);
    return result;
  }

  function render() {
    const result = visibleProducts();
    const target = grid();
    if (!target) return;
    target.innerHTML = result.map(productCard).join('');
    document.querySelectorAll('[data-result-count]').forEach(node => { node.textContent = result.length; });
    document.querySelector('[data-empty-state]')?.toggleAttribute('hidden', result.length !== 0);
    bindCardInteractions();
    updateFilterUI();
    requestAnimationFrame(() => document.querySelectorAll('.reveal').forEach(node => node.classList.add('is-visible')));
  }

  function updateFilterUI() {
    document.querySelectorAll('[data-filter-value]').forEach(input => { input.checked = input.value === state[input.dataset.filterValue]; });
    const sort = document.querySelector('[data-sort]'); if (sort) sort.value = state.sort;
    const active = Object.values(state).filter(Boolean).length;
    document.querySelectorAll('[data-active-filters]').forEach(node => node.textContent = active ? `${active} ACTIVE` : 'FILTERS');
  }

  function bindCardInteractions() {
    document.querySelectorAll('[data-favorite]').forEach(button => button.addEventListener('click', event => {
      event.preventDefault(); event.stopPropagation(); window.DopamineCart.toggleFavorite(button.dataset.favorite); button.classList.toggle('is-active'); button.setAttribute('aria-pressed', button.classList.contains('is-active')); button.textContent = button.classList.contains('is-active') ? '♥' : '♡';
    }));
    document.querySelectorAll('[data-quick-add]').forEach(button => button.addEventListener('click', event => {
      event.preventDefault(); event.stopPropagation(); openQuickAdd(catalog.getProductBySlug(button.dataset.quickAdd));
    }));
    document.querySelectorAll('.shop-product-image').forEach(image => image.addEventListener('error', () => image.classList.add('image-fallback')));
    document.querySelectorAll('.tilt-card').forEach(card => {
      card.addEventListener('pointermove', event => {
        if (window.matchMedia('(pointer: coarse)').matches || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
        const bounds = card.getBoundingClientRect(); const x = (event.clientX - bounds.left) / bounds.width - 0.5; const y = (event.clientY - bounds.top) / bounds.height - 0.5;
        card.style.setProperty('--tilt-x', `${(y * -3).toFixed(2)}deg`); card.style.setProperty('--tilt-y', `${(x * 3).toFixed(2)}deg`);
      });
      card.addEventListener('pointerleave', () => { card.style.setProperty('--tilt-x', '0deg'); card.style.setProperty('--tilt-y', '0deg'); });
    });
  }

  function openQuickAdd(product) {
    const modal = document.querySelector('[data-quick-modal]'); if (!modal) return;
    modal.querySelector('[data-quick-name]').textContent = product.name;
    modal.querySelector('[data-quick-price]').textContent = money(product.price);
    modal.querySelector('[data-quick-image]').src = product.images[0];
    modal.querySelector('[data-quick-product]').value = product.id;
    modal.querySelector('[data-quick-colors]').innerHTML = product.colors.map((color, i) => `<button type="button" class="quick-swatch ${i === 0 ? 'is-selected' : ''}" data-quick-color="${color.id}" style="--swatch:${color.hex}" aria-label="${esc(color.name)}"></button>`).join('');
    modal.querySelector('[data-quick-sizes]').innerHTML = product.sizes.map((size, i) => `<button type="button" class="quick-size ${i === 0 ? 'is-selected' : ''}" data-quick-size="${size}">${size}</button>`).join('');
    modal.classList.add('is-open'); modal.removeAttribute('hidden'); document.body.classList.add('modal-open');
    modal.querySelectorAll('[data-quick-color]').forEach(button => button.addEventListener('click', () => { modal.querySelectorAll('[data-quick-color]').forEach(item => item.classList.remove('is-selected')); button.classList.add('is-selected'); }));
    modal.querySelectorAll('[data-quick-size]').forEach(button => button.addEventListener('click', () => { modal.querySelectorAll('[data-quick-size]').forEach(item => item.classList.remove('is-selected')); button.classList.add('is-selected'); }));
  }

  function closeQuickAdd() { const modal = document.querySelector('[data-quick-modal]'); if (!modal) return; modal.classList.remove('is-open'); modal.setAttribute('hidden', ''); document.body.classList.remove('modal-open'); }

  function initFilters() {
    document.querySelectorAll('[data-filter-value]').forEach(input => input.addEventListener('change', () => { state[input.dataset.filterValue] = input.checked ? input.value : ''; writeURL(); render(); }));
    document.querySelector('[data-sort]')?.addEventListener('change', event => { state.sort = event.target.value; writeURL(); render(); });
    document.querySelector('[data-clear-filters]')?.addEventListener('click', () => { Object.keys(state).forEach(key => { state[key] = key === 'sort' ? 'featured' : ''; }); writeURL(); render(); });
    document.querySelector('[data-filters-open]')?.addEventListener('click', () => document.querySelector('[data-filter-drawer]')?.classList.add('is-open'));
    document.querySelectorAll('[data-filters-close], [data-filter-overlay]').forEach(node => node.addEventListener('click', () => document.querySelector('[data-filter-drawer]')?.classList.remove('is-open')));
  }

  function initSearch() {
    document.addEventListener('click', event => {
      const openBtn = event.target.closest('[data-search-open]');
      const closeBtn = event.target.closest('[data-search-close]');
      const panel = document.querySelector('[data-search-panel]');
      const input = document.querySelector('[data-search-input]');
      if (openBtn) {
        event.preventDefault();
        panel?.removeAttribute('hidden');
        panel?.classList.add('is-open');
        input?.focus();
      } else if (closeBtn) {
        event.preventDefault();
        panel?.classList.remove('is-open');
        panel?.setAttribute('hidden', '');
      }
    });

    const input = document.querySelector('[data-search-input]');
    input?.addEventListener('input', event => {
      state.query = event.target.value.trim();
      writeURL();
      renderSearchSuggestions(state.query);
      if (grid()) render();
    });
  }

  function renderSearchSuggestions(query) {
    const target = document.querySelector('[data-search-results]'); if (!target) return;
    const results = query ? products.filter(product => `${product.name} ${product.category}`.toLowerCase().includes(query.toLowerCase())).slice(0, 4) : [];
    target.innerHTML = results.map(product => `<a href="producto.html?slug=${product.slug}"><img src="${product.images[0]}" alt=""><span>${esc(product.name)}</span><b>${money(product.price)}</b></a>`).join('');
    target.hidden = !query;
  }

  function initQuickModal() {
    document.querySelectorAll('[data-quick-close], [data-quick-overlay]').forEach(node => node.addEventListener('click', closeQuickAdd));
    document.querySelector('[data-quick-confirm]')?.addEventListener('click', () => {
      const modal = document.querySelector('[data-quick-modal]'); const product = products.find(item => item.id === modal.querySelector('[data-quick-product]').value); const color = modal.querySelector('[data-quick-color].is-selected')?.dataset.quickColor; const size = modal.querySelector('[data-quick-size].is-selected')?.dataset.quickSize;
      window.DopamineCart.add(product, { color, size }); closeQuickAdd(); showToast(`${product.name.toUpperCase()} ADDED TO BAG`);
    });
  }
  function showToast(message) { const toast = document.querySelector('[data-toast]'); if (!toast) return; toast.textContent = message; toast.classList.add('is-visible'); window.clearTimeout(showToast.timer); showToast.timer = window.setTimeout(() => toast.classList.remove('is-visible'), 2600); }

  function openMobileMenu() {
    document.body.classList.add('menu-open');
    const menu = document.querySelector('[data-mobile-menu]');
    const overlay = document.querySelector('[data-menu-overlay]');
    if (menu) {
      menu.classList.add('is-open', 'is-active');
      menu.removeAttribute('hidden');
    }
    if (overlay) {
      overlay.classList.add('is-open', 'is-active', 'is-visible');
      overlay.removeAttribute('hidden');
    }
  }

  function closeMobileMenu() {
    document.body.classList.remove('menu-open');
    const menu = document.querySelector('[data-mobile-menu]');
    const overlay = document.querySelector('[data-menu-overlay]');
    if (menu) {
      menu.classList.remove('is-open', 'is-active');
    }
    if (overlay) {
      overlay.classList.remove('is-open', 'is-active', 'is-visible');
    }
  }

  function initMobileMenu() {
    document.addEventListener('click', event => {
      const openBtn = event.target.closest('[data-menu-open]');
      const closeBtn = event.target.closest('[data-menu-close], .mobile-menu-header .drawer-close, [data-menu-overlay]');
      if (openBtn) {
        event.preventDefault();
        openMobileMenu();
      } else if (closeBtn) {
        event.preventDefault();
        closeMobileMenu();
      }
    });

    document.addEventListener('keydown', event => {
      if (event.key === 'Escape') closeMobileMenu();
    });
  }

  function initSidebarToggle() {
    const toggleBtn = document.querySelector('[data-toggle-sidebar]');
    const layout = document.getElementById('shop-layout');
    const toggleText = document.querySelector('[data-toggle-text]');
    if (!toggleBtn || !layout) return;

    toggleBtn.addEventListener('click', () => {
      const isCollapsed = layout.classList.toggle('sidebar-collapsed');
      toggleBtn.setAttribute('aria-expanded', String(!isCollapsed));
      if (toggleText) {
        toggleText.textContent = isCollapsed ? 'MOSTRAR FILTROS' : 'OCULTAR FILTROS';
      }
    });
  }

  document.addEventListener('DOMContentLoaded', () => { getStateFromURL(); if (grid()) render(); initFilters(); initSearch(); initQuickModal(); initMobileMenu(); initSidebarToggle(); });
})(window);
