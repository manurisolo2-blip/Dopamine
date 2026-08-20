(function (window) {
  const catalog = window.DopamineCatalog;
  function esc(value) { return String(value).replace(/[&<>'"]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char])); }
  function money(value) { return '$' + Number(value).toLocaleString('es-AR'); }
  function getProduct() { return catalog.getProductBySlug(new URLSearchParams(window.location.search).get('slug') || 'signal-tee'); }
  function render(product) {
    if (!product) return;
    document.title = `${product.name} — Dopamine Streetwear`;
    const breadcrumb = document.querySelector('[data-detail-breadcrumb]');
    if (breadcrumb) breadcrumb.textContent = `HOME / SHOP / ${product.category.toUpperCase()}`;
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
    if (old) { old.textContent = product.compareAtPrice ? money(product.compareAtPrice) : ''; old.hidden = !product.compareAtPrice; }
    
    const transferPrice = money(Math.round(product.price * 0.9));
    const installmentPrice = money(Math.round(product.price / 3));
    const transferEl = document.querySelector('[data-detail-transfer]');
    if (transferEl) transferEl.textContent = `${transferPrice} con Transferencia (10% OFF)`;
    const installmentsEl = document.querySelector('[data-detail-installments]');
    if (installmentsEl) installmentsEl.textContent = `3 cuotas sin interés de ${installmentPrice} o hasta 6 cuotas con Mercado Pago`;
    const stock = document.querySelector('[data-detail-stock]');
    if (stock) stock.textContent = product.stock <= 5 ? `${product.stock} UNITS LEFT` : 'IN STOCK / READY TO SHIP';
    const productInput = document.querySelector('[data-detail-product]');
    if (productInput) productInput.value = product.id;
    const colors = document.querySelector('[data-detail-colors]');
    if (colors) colors.innerHTML = product.colors.map((color, i) => `<button type="button" class="detail-color ${i === 0 ? 'is-selected' : ''}" data-detail-color="${color.id}" style="--swatch:${color.hex}" aria-label="${esc(color.name)}" title="${esc(color.name)}"></button>`).join('');
    const sizes = document.querySelector('[data-detail-sizes]');
    if (sizes) sizes.innerHTML = product.sizes.map((size, i) => `<button type="button" class="detail-size ${i === 0 ? 'is-selected' : ''}" data-detail-size="${size}">${size}</button>`).join('');
    const gallery = document.querySelector('[data-detail-gallery]');
    if (gallery) gallery.innerHTML = product.images.map((image, index) => `<button type="button" class="detail-thumb ${index === 0 ? 'is-selected' : ''}" data-gallery-image="${index}"><img src="${image}" alt="${esc(product.name)} vista ${index + 1}"></button>`).join('');
    const mainImage = document.querySelector('[data-detail-main-image]');
    if (mainImage) { mainImage.src = product.images[0]; mainImage.alt = product.name; }
    if (gallery) {
      gallery.addEventListener('click', event => {
        const thumb = event.target.closest('[data-gallery-image]');
        if (!thumb) return;
        const index = Number(thumb.dataset.galleryImage);
        if (mainImage) mainImage.src = product.images[index];
        document.querySelectorAll('[data-gallery-image]').forEach(item => item.classList.remove('is-selected'));
        thumb.classList.add('is-selected');
      });
    }
    const related = document.querySelector('[data-detail-related]');
    if (related) related.innerHTML = catalog.getRelated(product).map(item => `<a class="related-product" href="producto.html?slug=${item.slug}"><img src="${item.images[0]}" alt="${esc(item.name)}"><span>${esc(item.name)}</span><b>${money(item.price)}</b></a>`).join('');
    setupInteractions(product);
    setupPseudo3D(product);
  }
  function setupInteractions(product) {
    document.querySelectorAll('[data-detail-color]').forEach(button => button.addEventListener('click', () => { document.querySelectorAll('[data-detail-color]').forEach(item => item.classList.remove('is-selected')); button.classList.add('is-selected'); }));
    document.querySelectorAll('[data-detail-size]').forEach(button => button.addEventListener('click', () => { document.querySelectorAll('[data-detail-size]').forEach(item => item.classList.remove('is-selected')); button.classList.add('is-selected'); }));
    const quantity = document.querySelector('[data-detail-quantity]');
    document.querySelector('[data-quantity-plus]')?.addEventListener('click', () => { if (quantity) quantity.value = Math.min(product.stock || 99, Number(quantity.value) + 1); });
    document.querySelector('[data-quantity-minus]')?.addEventListener('click', () => { if (quantity) quantity.value = Math.max(1, Number(quantity.value) - 1); });
    document.querySelector('[data-detail-favorite]')?.addEventListener('click', event => { window.DopamineCart.toggleFavorite(product.id); event.currentTarget.classList.toggle('is-active'); event.currentTarget.textContent = event.currentTarget.classList.contains('is-active') ? '♥' : '♡'; });
    document.querySelector('[data-detail-add]')?.addEventListener('click', () => { const color = document.querySelector('[data-detail-color].is-selected')?.dataset.detailColor; const size = document.querySelector('[data-detail-size].is-selected')?.dataset.detailSize; window.DopamineCart.add(product, { color, size, quantity: quantity ? Math.max(1, Number(quantity.value)) : 1 }); showDetailToast(`${product.name.toUpperCase()} ADDED TO BAG`); });
    document.querySelectorAll('[data-accordion]').forEach(button => button.addEventListener('click', () => { const panelId = button.getAttribute('aria-controls'); const panel = panelId ? document.getElementById(panelId) : null; const open = button.getAttribute('aria-expanded') === 'true'; button.setAttribute('aria-expanded', String(!open)); if (panel) panel.hidden = open; }));
  }
  function setupPseudo3D(product) {
    const stage = document.querySelector('[data-product-3d]'); const image = document.querySelector('[data-detail-main-image]'); if (!stage || !image) return;
    let startX = 0; let rotation = 0; let dragging = false;
    const apply = () => { image.style.transform = `perspective(1100px) rotateY(${rotation}deg) rotateX(${Math.sin(rotation * Math.PI / 180) * -1.5}deg)`; stage.style.setProperty('--viewer-shift', `${rotation / 12}px`); };
    stage.addEventListener('pointerdown', event => { dragging = true; startX = event.clientX; stage.setPointerCapture(event.pointerId); stage.classList.add('is-dragging'); });
    stage.addEventListener('pointermove', event => { if (!dragging) return; rotation += (event.clientX - startX) * 0.32; startX = event.clientX; apply(); });
    stage.addEventListener('pointerup', () => { dragging = false; stage.classList.remove('is-dragging'); }); stage.addEventListener('pointercancel', () => { dragging = false; stage.classList.remove('is-dragging'); });
    document.querySelector('[data-reset-view]')?.addEventListener('click', () => { rotation = 0; apply(); });
  }
  function showDetailToast(message) { const toast = document.querySelector('[data-toast]'); if (!toast) return; toast.textContent = message; toast.classList.add('is-visible'); window.clearTimeout(showDetailToast.timer); showDetailToast.timer = window.setTimeout(() => toast.classList.remove('is-visible'), 2600); }
  document.addEventListener('DOMContentLoaded', () => render(getProduct()));
})(window);
