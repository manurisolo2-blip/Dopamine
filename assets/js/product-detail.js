(function (window) {
  'use strict';

  const catalog = window.DopamineCatalog;
  let isInteractionsBound = false;
  let isPseudo3DBound = false;

  function t(key, params) { return window.DopamineI18n ? window.DopamineI18n.t(key, params) : key; }
  function esc(value) { return String(value).replace(/[&<>'"]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char])); }
  function money(value) { return '$' + Number(value).toLocaleString('es-AR'); }
  function getProduct() { return catalog.getProductBySlug(new URLSearchParams(window.location.search).get('slug') || 'buzo-win'); }

  function render(product) {
    if (!product) return;
    document.title = `${product.name} — Dopamine Streetwear`;

    const breadcrumb = document.querySelector('[data-detail-breadcrumb]');
    if (breadcrumb) breadcrumb.textContent = `${t('product.breadcrumb_prefix')}${product.category.toUpperCase()}`;

    const badge = document.querySelector('[data-detail-badge]');
    if (badge) badge.textContent = product.badge;

    const name = document.querySelector('[data-detail-name]');
    if (name) name.textContent = product.name;

    const subtitle = document.querySelector('[data-detail-subtitle]');
    if (subtitle) subtitle.textContent = product.subtitle;

    const description = document.querySelector('[data-detail-description]');
    if (description) description.textContent = product.description;

    const price = document.querySelector('[data-detail-price]');
    if (price) price.textContent = money(product.price);

    const old = document.querySelector('[data-detail-old-price]');
    if (old) { 
      old.textContent = product.compareAtPrice ? money(product.compareAtPrice) : ''; 
      old.hidden = !product.compareAtPrice; 
    }
    
    const transferPrice = money(Math.round(product.price * 0.9));
    const installmentPrice = money(Math.round(product.price / 3));

    const transferEl = document.querySelector('[data-detail-transfer]');
    if (transferEl) transferEl.textContent = `${transferPrice} ${t('product.transfer_discount')}`;

    const installmentsEl = document.querySelector('[data-detail-installments]');
    if (installmentsEl) installmentsEl.textContent = t('product.installments_text', { amount: installmentPrice });

    const stock = document.querySelector('[data-detail-stock]');
    if (stock) stock.textContent = product.stock <= 5 ? t('product.units_left', { count: product.stock }) : t('product.in_stock');

    const productInput = document.querySelector('[data-detail-product]');
    if (productInput) productInput.value = product.id;

    // Colors Swatches Rendering
    const colorsContainer = document.querySelector('[data-detail-colors]');
    if (colorsContainer) {
      colorsContainer.innerHTML = product.colors.map((color, i) => 
        `<button type="button" class="detail-color ${i === 0 ? 'is-selected' : ''}" data-detail-color="${color.id}" data-color-name="${esc(color.name)}" style="--swatch:${color.hex}" aria-label="${esc(color.name)}" title="${esc(color.name)}"></button>`
      ).join('');
    }

    // Sizes Rendering
    const sizesContainer = document.querySelector('[data-detail-sizes]');
    if (sizesContainer) {
      sizesContainer.innerHTML = product.sizes.map((size, i) => 
        `<button type="button" class="detail-size ${i === 0 ? 'is-selected' : ''}" data-detail-size="${size}">${size}</button>`
      ).join('');
    }

    // Selected Color Label
    const selectedColorLabel = document.querySelector('[data-detail-selected-color]');
    if (selectedColorLabel && product.colors[0]) {
      selectedColorLabel.textContent = product.colors[0].name;
    }

    // Gallery Thumbs Rendering
    const gallery = document.querySelector('[data-detail-gallery]');
    if (gallery) {
      gallery.innerHTML = product.images.map((image, index) => 
        `<button type="button" class="detail-thumb ${index === 0 ? 'is-selected' : ''}" data-gallery-image="${index}"><img src="${image}" alt="${esc(product.name)} vista ${index + 1}"></button>`
      ).join('');
    }

    const mainImage = document.querySelector('[data-detail-main-image]');
    if (mainImage) { 
      mainImage.src = product.images[0]; 
      mainImage.alt = product.name; 
    }

    // Related Products Rendering
    const related = document.querySelector('[data-detail-related]');
    if (related) {
      related.innerHTML = catalog.getRelated(product).map(item => 
        `<a class="related-product" href="producto.html?slug=${item.slug}"><img src="${item.images[0]}" alt="${esc(item.name)}"><span>${esc(item.name)}</span><b>${money(item.price)}</b></a>`
      ).join('');
      if (window.DopamineReveal) {
        window.DopamineReveal.applyStagger(related);
        window.DopamineReveal.observe(related);
      }
    }

    setupInteractionsOnce();
    setupPseudo3DOnce();
  }

  function setupInteractionsOnce() {
    if (isInteractionsBound) return;
    isInteractionsBound = true;

    // Delegated Swatch Selection
    document.addEventListener('click', event => {
      const colorBtn = event.target.closest('[data-detail-color]');
      if (colorBtn) {
        const container = colorBtn.closest('[data-detail-colors]') || document;
        container.querySelectorAll('[data-detail-color]').forEach(btn => btn.classList.remove('is-selected'));
        colorBtn.classList.add('is-selected');
        const colorName = colorBtn.dataset.colorName || colorBtn.getAttribute('title');
        const label = document.querySelector('[data-detail-selected-color]');
        if (label && colorName) label.textContent = colorName;
        return;
      }

      const sizeBtn = event.target.closest('[data-detail-size]');
      if (sizeBtn) {
        const container = sizeBtn.closest('[data-detail-sizes]') || document;
        container.querySelectorAll('[data-detail-size]').forEach(btn => btn.classList.remove('is-selected'));
        sizeBtn.classList.add('is-selected');
        return;
      }

      const galleryThumb = event.target.closest('[data-gallery-image]');
      if (galleryThumb) {
        const product = getProduct();
        const mainImage = document.querySelector('[data-detail-main-image]');
        const index = Number(galleryThumb.dataset.galleryImage);
        if (mainImage && product && product.images[index]) {
          mainImage.src = product.images[index];
        }
        document.querySelectorAll('[data-gallery-image]').forEach(item => item.classList.remove('is-selected'));
        galleryThumb.classList.add('is-selected');
        return;
      }

      const plusBtn = event.target.closest('[data-quantity-plus]');
      if (plusBtn) {
        const product = getProduct();
        const quantity = document.querySelector('[data-detail-quantity]');
        if (quantity) {
          quantity.value = Math.min((product && product.stock) || 99, Number(quantity.value) + 1);
        }
        return;
      }

      const minusBtn = event.target.closest('[data-quantity-minus]');
      if (minusBtn) {
        const quantity = document.querySelector('[data-detail-quantity]');
        if (quantity) {
          quantity.value = Math.max(1, Number(quantity.value) - 1);
        }
        return;
      }

      const favBtn = event.target.closest('[data-detail-favorite]');
      if (favBtn) {
        const product = getProduct();
        if (product && window.DopamineCart) {
          window.DopamineCart.toggleFavorite(product.id);
          favBtn.classList.toggle('is-active');
          favBtn.textContent = favBtn.classList.contains('is-active') ? '♥' : '♡';
        }
        return;
      }

      const addBtn = event.target.closest('[data-detail-add]');
      if (addBtn) {
        const product = getProduct();
        if (!product || !window.DopamineCart) return;
        const selectedColorBtn = document.querySelector('[data-detail-color].is-selected');
        const color = selectedColorBtn ? (selectedColorBtn.dataset.colorName || selectedColorBtn.dataset.detailColor) : (product.colors[0]?.name || 'Black');
        const selectedSizeBtn = document.querySelector('[data-detail-size].is-selected');
        const size = selectedSizeBtn ? selectedSizeBtn.dataset.detailSize : (product.sizes[0] || 'M');
        const quantityEl = document.querySelector('[data-detail-quantity]');
        const qty = quantityEl ? Math.max(1, Number(quantityEl.value)) : 1;

        window.DopamineCart.add(product, { color, size, quantity: qty });
        showDetailToast(`${product.name.toUpperCase()} ${t('product.added_toast')}`);
        return;
      }

      const accordionBtn = event.target.closest('[data-accordion]');
      if (accordionBtn) {
        const panelId = accordionBtn.getAttribute('aria-controls');
        const panel = panelId ? document.getElementById(panelId) : null;
        const isOpen = accordionBtn.getAttribute('aria-expanded') === 'true';
        accordionBtn.setAttribute('aria-expanded', String(!isOpen));
        if (panel) panel.hidden = isOpen;
      }
    });
  }

  function setupPseudo3DOnce() {
    if (isPseudo3DBound) return;
    isPseudo3DBound = true;

    const stage = document.querySelector('[data-product-3d]');
    const image = document.querySelector('[data-detail-main-image]');
    if (!stage || !image) return;

    let startX = 0;
    let rotation = 0;
    let dragging = false;

    const apply = () => {
      image.style.transform = `perspective(1100px) rotateY(${rotation}deg) rotateX(${Math.sin(rotation * Math.PI / 180) * -1.5}deg)`;
      stage.style.setProperty('--viewer-shift', `${rotation / 12}px`);
    };

    stage.addEventListener('pointerdown', event => {
      dragging = true;
      startX = event.clientX;
      stage.setPointerCapture(event.pointerId);
      stage.classList.add('is-dragging');
    });

    stage.addEventListener('pointermove', event => {
      if (!dragging) return;
      rotation += (event.clientX - startX) * 0.32;
      startX = event.clientX;
      apply();
    });

    stage.addEventListener('pointerup', () => {
      dragging = false;
      stage.classList.remove('is-dragging');
    });

    stage.addEventListener('pointercancel', () => {
      dragging = false;
      stage.classList.remove('is-dragging');
    });

    document.querySelector('[data-reset-view]')?.addEventListener('click', () => {
      rotation = 0;
      apply();
    });
  }

  function showDetailToast(message) {
    const toast = document.querySelector('[data-toast]');
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('is-visible', 'show');
    window.clearTimeout(showDetailToast.timer);
    showDetailToast.timer = window.setTimeout(() => toast.classList.remove('is-visible', 'show'), 2600);
  }

  document.addEventListener('dopamine:langchange', () => render(getProduct()));
  document.addEventListener('DOMContentLoaded', () => render(getProduct()));
})(window);
