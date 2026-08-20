(function (window) {
  const STORAGE_KEY = 'dopamine-cart-v1';
  const FAVORITES_KEY = 'dopamine-favorites-v1';
  const FREE_SHIPPING_THRESHOLD = 90000; // $90.000 ARS para envío gratis a todo el país

  const cart = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  const favorites = new Set(JSON.parse(localStorage.getItem(FAVORITES_KEY) || '[]'));

  // Recommended products list for cross-sell carousel in cart drawer (Prices in ARS)
  const RECOMMENDATIONS = [
    {
      id: 'remera-wireframe-waffle-noir',
      slug: 'remera-wireframe-waffle-noir',
      name: 'Remera Wireframe Waffle Noir',
      price: 62000,
      image: 'Ropa/Remeras/Longsleeve/WIREFRAME WAFFLE NOIR.webp',
      color: 'Noir',
      size: 'M'
    },
    {
      id: 'camisa-bunny',
      slug: 'camisa-bunny',
      name: 'Camisa Bunny',
      price: 82000,
      image: 'Ropa/Camisas/Camisa Bunny.webp',
      color: 'Black',
      size: 'L'
    },
    {
      id: 'jean-baggy-ice',
      slug: 'jean-baggy-ice',
      name: 'Jean Baggy Ice',
      price: 98000,
      image: 'Ropa/Jeanes/JEAN BAGGY ICE.webp',
      color: 'Ice Blue',
      size: '40'
    }
  ];
  let activeRecommendIndex = 0;

  function formatARS(value) { return '$' + Number(value).toLocaleString('es-AR'); }
  function save() { localStorage.setItem(STORAGE_KEY, JSON.stringify(cart)); }
  function saveFavorites() { localStorage.setItem(FAVORITES_KEY, JSON.stringify([...favorites])); }
  function key(productId, options = {}) { return `${productId}::${options.color || ''}::${options.size || ''}`; }
  function totalQuantity() { return cart.reduce((sum, item) => sum + item.quantity, 0); }
  function subtotal() { return cart.reduce((sum, item) => sum + item.price * item.quantity, 0); }

  let recommendInterval = null;

  function startRecommendAutoPlay() {
    if (recommendInterval) clearInterval(recommendInterval);
    recommendInterval = setInterval(() => {
      if (cart.length === 0) return;
      activeRecommendIndex = (activeRecommendIndex + 1) % RECOMMENDATIONS.length;
      if (window.DopamineCart) window.DopamineCart.renderRecommendation();
    }, 3500);
  }

  const CartStore = {
    get items() { return cart; },
    add(product, options = {}) {
      const itemKey = key(product.id || product.slug, options);
      const existing = cart.find(item => item.key === itemKey);
      const itemImage = product.image || (product.images && product.images[0]) || 'assets/Branding/Logos/Isotipo.png';
      const itemColor = options.color || (product.colors && product.colors[0]?.name) || 'Black';
      const itemSize = options.size || (product.sizes && product.sizes[0]) || 'M';

      if (existing) existing.quantity += options.quantity || 1;
      else cart.push({
        key: itemKey,
        id: product.id || product.slug,
        slug: product.slug || '',
        name: product.name,
        price: Number(product.price),
        image: itemImage,
        color: itemColor,
        size: itemSize,
        quantity: options.quantity || 1
      });
      save();
      this.render();
      this.open();
    },
    remove(itemKey) {
      const index = cart.findIndex(item => item.key === itemKey);
      if (index >= 0) cart.splice(index, 1);
      save();
      this.render();
    },
    update(itemKey, delta) {
      const item = cart.find(entry => entry.key === itemKey);
      if (!item) return;
      item.quantity = Math.max(1, item.quantity + delta);
      save();
      this.render();
    },
    isFavorite(id) { return favorites.has(id); },
    toggleFavorite(id) {
      favorites.has(id) ? favorites.delete(id) : favorites.add(id);
      saveFavorites();
      document.dispatchEvent(new CustomEvent('dopamine:favorites'));
    },
    count: totalQuantity,
    subtotal,
    open() {
      document.body.classList.add('cart-open');
      const drawer = document.querySelector('[data-cart-drawer]');
      const overlay = document.querySelector('[data-cart-overlay]');
      if (drawer) { drawer.classList.add('is-open', 'is-active'); drawer.removeAttribute('hidden'); }
      if (overlay) { overlay.classList.add('is-visible', 'is-active'); overlay.removeAttribute('hidden'); }
      startRecommendAutoPlay();
    },
    close() {
      document.body.classList.remove('cart-open');
      const drawer = document.querySelector('[data-cart-drawer]');
      const overlay = document.querySelector('[data-cart-overlay]');
      if (drawer) drawer.classList.remove('is-open', 'is-active');
      if (overlay) overlay.classList.remove('is-visible', 'is-active');
      if (recommendInterval) clearInterval(recommendInterval);
    },
    render() {
      const qty = totalQuantity();
      const currentSubtotal = subtotal();

      // Cart Badge Count
      document.querySelectorAll('[data-cart-count]').forEach(node => { node.textContent = qty; });

      // Empty State & Footer Toggles
      document.querySelectorAll('[data-cart-empty], .cart-empty-msg').forEach(node => { node.hidden = cart.length !== 0; });
      document.querySelectorAll('[data-cart-footer]').forEach(node => { node.hidden = cart.length === 0; });
      document.querySelectorAll('[data-cart-progress-container]').forEach(node => { node.hidden = cart.length === 0; });
      document.querySelectorAll('[data-cart-shipping-calc]').forEach(node => { node.hidden = cart.length === 0; });
      document.querySelectorAll('[data-cart-recommend]').forEach(node => { node.hidden = cart.length === 0; });

      // Shipping & Installments Progress Bars
      document.querySelectorAll('[data-shipping-bar]').forEach(bar => {
        const pct = currentSubtotal === 0 ? 0 : Math.min(100, Math.max(5, (currentSubtotal / FREE_SHIPPING_THRESHOLD) * 100));
        bar.style.width = `${pct}%`;
      });
      document.querySelectorAll('[data-shipping-text]').forEach(text => {
        if (currentSubtotal >= FREE_SHIPPING_THRESHOLD) {
          text.textContent = '¡Tenés envío gratis!';
        } else {
          const missing = FREE_SHIPPING_THRESHOLD - currentSubtotal;
          text.textContent = `¡Te faltan ${formatARS(missing)} para el Envío Gratis!`;
        }
      });
      document.querySelectorAll('[data-installments-bar]').forEach(bar => {
        bar.style.width = cart.length > 0 ? '100%' : '0%';
      });

      // Cart Items HTML rendering (Prices in ARS)
      const itemsHTML = cart.map(item => {
        const itemTotal = item.price * item.quantity;
        const origPrice = Math.round(item.price * 1.3); // Strikethrough original price in ARS
        return `
          <article class="cart-line">
            <img class="cart-line-img" src="${item.image}" alt="${item.name}" loading="lazy">
            <div class="cart-line-copy">
              <div class="cart-line-head">
                <h3 class="cart-line-title">${item.name}</h3>
                <button type="button" class="cart-line-remove" data-cart-remove="${item.key}" aria-label="Eliminar ${item.name}">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                  </svg>
                </button>
              </div>
              <span class="cart-line-variant">Talle: ${item.size} Color: ${item.color}</span>
              <div class="cart-line-foot">
                <div class="qty-control">
                  <button type="button" data-cart-delta="${item.key}" data-delta="-1" aria-label="Disminuir">−</button>
                  <b>${item.quantity}</b>
                  <button type="button" data-cart-delta="${item.key}" data-delta="1" aria-label="Aumentar">+</button>
                </div>
                <div class="cart-line-prices">
                  <span class="cart-line-price-main">${formatARS(itemTotal)}</span>
                  <span class="cart-line-price-old">${formatARS(origPrice * item.quantity)}</span>
                </div>
              </div>
            </div>
          </article>
        `;
      }).join('');

      document.querySelectorAll('[data-cart-items]').forEach(list => { list.innerHTML = itemsHTML; });

      // Subtotal and Total formatting (Prices in ARS)
      document.querySelectorAll('[data-cart-subtotal], [data-cart-total]').forEach(node => {
        node.textContent = `${formatARS(currentSubtotal)}`;
      });

      // Progress bar in cart page (carrito.html)
      document.querySelectorAll('[data-shipping-progress]').forEach(progress => {
        progress.style.width = `${Math.min(100, (currentSubtotal / FREE_SHIPPING_THRESHOLD) * 100)}%`;
      });

      // Cross-Sell Recommendation Card rendering
      this.renderRecommendation();

      // Attach Line Item Listeners
      document.querySelectorAll('[data-cart-remove]').forEach(btn => btn.addEventListener('click', () => this.remove(btn.dataset.cartRemove)));
      document.querySelectorAll('[data-cart-delta]').forEach(btn => btn.addEventListener('click', () => this.update(btn.dataset.cartDelta, Number(btn.dataset.delta))));
    },
    renderRecommendation() {
      const cardContainers = document.querySelectorAll('[data-recommend-card]');
      if (cardContainers.length === 0 || cart.length === 0) return;

      const rec = RECOMMENDATIONS[activeRecommendIndex];
      const dotsHTML = RECOMMENDATIONS.map((_, idx) => `
        <span class="recommend-dot ${idx === activeRecommendIndex ? 'is-active' : ''}" data-recommend-dot="${idx}"></span>
      `).join('');

      const html = `
        <div class="recommend-item-row">
          <div class="recommend-item-left">
            <img class="recommend-item-img" src="${rec.image}" alt="${rec.name}">
            <div class="recommend-item-info">
              <span class="recommend-item-title">${rec.name}</span>
              <span class="recommend-item-price">${formatARS(rec.price)}</span>
            </div>
          </div>
          <button type="button" class="btn-recommend-add" data-recommend-add>Agregar</button>
        </div>
        <div class="recommend-dots">${dotsHTML}</div>
      `;

      cardContainers.forEach(container => {
        container.innerHTML = html;
        container.querySelector('[data-recommend-add]')?.addEventListener('click', () => {
          this.add({
            id: rec.id,
            name: rec.name,
            price: rec.price,
            image: rec.image
          }, { color: rec.color, size: rec.size });
        });
        container.querySelectorAll('[data-recommend-dot]').forEach(dot => {
          dot.addEventListener('click', (e) => {
            activeRecommendIndex = Number(e.target.dataset.recommendDot);
            this.renderRecommendation();
          });
        });
      });
    }
  };

  function initCartUI() {
    document.addEventListener('click', event => {
      const openBtn = event.target.closest('[data-cart-open]');
      if (openBtn) {
        event.preventDefault();
        CartStore.open();
        return;
      }
      const closeBtn = event.target.closest('[data-cart-close], [data-cart-overlay]');
      if (closeBtn) {
        event.preventDefault();
        CartStore.close();
        return;
      }

      // Global Quick-Add Size button handler
      const quickSizeBtn = event.target.closest('.quick-add-size-btn');
      if (quickSizeBtn) {
        event.preventDefault();
        event.stopPropagation();
        const slug = quickSizeBtn.dataset.quickAdd || quickSizeBtn.dataset.productId;
        const size = quickSizeBtn.dataset.size || quickSizeBtn.dataset.directAddSize || 'M';
        const catalog = window.DopamineCatalog;
        if (catalog && slug) {
          const product = catalog.getProductBySlug(slug) || catalog.getProductById(slug);
          if (product) {
            CartStore.add(product, { size: size, color: (product.colors && product.colors[0]?.name) || 'Black' });
          }
        }
        return;
      }

      // Shipping calculator click handler (ARS rates)
      const shippingBtn = event.target.closest('[data-shipping-calc-trigger]');
      if (shippingBtn) {
        const input = document.querySelector('[data-shipping-zip]');
        const result = document.querySelector('[data-shipping-result]');
        if (input && result) {
          const zip = input.value.trim();
          if (!zip) {
            result.textContent = 'Por favor ingresá un código postal.';
            result.hidden = false;
            return;
          }
          const isFree = subtotal() >= FREE_SHIPPING_THRESHOLD;
          result.textContent = isFree
            ? `CP ${zip}: ¡Envío Estándar GRATIS a tu domicilio!`
            : `CP ${zip}: Envío Estándar $5.500 (¡Llega en 3 a 5 días hábiles a todo el país!)`;
          result.hidden = false;
        }
      }
    });

    document.addEventListener('keydown', event => { if (event.key === 'Escape') CartStore.close(); });
    CartStore.render();
  }

  window.DopamineCart = CartStore;
  document.addEventListener('DOMContentLoaded', initCartUI);
})(window);
