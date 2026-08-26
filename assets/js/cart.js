(function (window) {
  'use strict';

  const STORAGE_KEY = 'dopamine-cart-v1';
  const FAVORITES_KEY = 'dopamine-favorites-v1';
  const FREE_SHIPPING_THRESHOLD = 90000; // $90.000 ARS para envío gratis a todo el país

  let cart = [];
  try {
    const raw = (typeof localStorage !== 'undefined' && localStorage.getItem) ? localStorage.getItem(STORAGE_KEY) : null;
    cart = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(cart)) cart = [];
  } catch (err) {
    cart = [];
  }

  let favorites = new Set();
  try {
    const rawFav = (typeof localStorage !== 'undefined' && localStorage.getItem) ? localStorage.getItem(FAVORITES_KEY) : null;
    favorites = new Set(rawFav ? JSON.parse(rawFav) : []);
  } catch (err) {
    favorites = new Set();
  }

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

  function t(key, params) { return (window && window.DopamineI18n) ? window.DopamineI18n.t(key, params) : (typeof params === 'string' ? params : key); }
  function formatARS(value) { return '$' + Number(value).toLocaleString('es-AR'); }
  
  function save() {
    try {
      if (typeof localStorage !== 'undefined' && localStorage.setItem) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
      }
    } catch (err) {
      // Storage quota or serialization safe fallback
    }
  }

  function saveFavorites() {
    try {
      if (typeof localStorage !== 'undefined' && localStorage.setItem) {
        localStorage.setItem(FAVORITES_KEY, JSON.stringify([...favorites]));
      }
    } catch (err) {
      // Storage quota safe fallback
    }
  }

  function key(productId, options = {}) { return `${productId}::${options.color || ''}::${options.size || ''}`; }
  function totalQuantity() { return cart.reduce((sum, item) => sum + item.quantity, 0); }
  function subtotal() { return cart.reduce((sum, item) => sum + item.price * item.quantity, 0); }

  let recommendInterval = null;

  function startRecommendAutoPlay() {
    if (recommendInterval) clearInterval(recommendInterval);
    recommendInterval = setInterval(() => {
      if (cart.length === 0) return;
      activeRecommendIndex = (activeRecommendIndex + 1) % RECOMMENDATIONS.length;
      if (window && window.DopamineCart) window.DopamineCart.renderRecommendation();
    }, 3500);
  }

  const CartStore = {
    get items() { return cart; },
    add(product, options = {}) {
      if (!product) return;
      const itemKey = key(product.id || product.slug, options);
      const existing = cart.find(item => item.key === itemKey);
      const itemImage = product.image || (product.images && product.images[0]) || 'assets/Branding/Logos/Isotipo.png';
      const itemColor = options.color || (product.colors && product.colors[0]?.name) || 'Black';
      const itemSize = options.size || (product.sizes && product.sizes[0]) || 'M';

      if (existing) {
        existing.quantity += options.quantity || 1;
      } else {
        cart.push({
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
      }
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
      if (typeof document !== 'undefined' && document.dispatchEvent) {
        document.dispatchEvent(new CustomEvent('dopamine:favorites'));
      }
    },
    count: totalQuantity,
    subtotal,
    open() {
      if (typeof document !== 'undefined') {
        if (document.documentElement && document.documentElement.classList && typeof document.documentElement.classList.add === 'function') {
          document.documentElement.classList.add('cart-open');
        }
        if (document.body && document.body.classList && typeof document.body.classList.add === 'function') {
          document.body.classList.add('cart-open');
        }
        const drawer = document.querySelector('[data-cart-drawer]');
        const overlay = document.querySelector('[data-cart-overlay]');
        if (drawer && drawer.classList && typeof drawer.classList.add === 'function') {
          drawer.classList.add('is-open', 'is-active');
          if (drawer.removeAttribute) drawer.removeAttribute('hidden');
        }
        if (overlay && overlay.classList && typeof overlay.classList.add === 'function') {
          overlay.classList.add('is-visible', 'is-active');
          if (overlay.removeAttribute) overlay.removeAttribute('hidden');
        }
      }
      startRecommendAutoPlay();
    },
    close() {
      if (typeof document !== 'undefined') {
        if (document.documentElement && document.documentElement.classList && typeof document.documentElement.classList.remove === 'function') {
          document.documentElement.classList.remove('cart-open');
        }
        if (document.body && document.body.classList && typeof document.body.classList.remove === 'function') {
          document.body.classList.remove('cart-open');
        }
        const drawer = document.querySelector('[data-cart-drawer]');
        const overlay = document.querySelector('[data-cart-overlay]');
        if (drawer && drawer.classList && typeof drawer.classList.remove === 'function') {
          drawer.classList.remove('is-open', 'is-active');
        }
        if (overlay && overlay.classList && typeof overlay.classList.remove === 'function') {
          overlay.classList.remove('is-visible', 'is-active');
        }
      }
      if (recommendInterval) clearInterval(recommendInterval);
    },
    render() {
      if (typeof document === 'undefined') return;
      const qty = totalQuantity();
      const currentSubtotal = subtotal();

      // Cart Badge Count
      document.querySelectorAll('[data-cart-count]').forEach(node => { node.textContent = qty; });

      // Empty State & Footer Toggles
      document.querySelectorAll('[data-cart-empty], .cart-empty-msg').forEach(node => { node.hidden = cart.length !== 0; });
      document.querySelectorAll('[data-cart-footer]').forEach(node => { node.hidden = cart.length === 0; });
      document.querySelectorAll('[data-cart-progress-container]').forEach(node => { node.hidden = cart.length === 0; });
      document.querySelectorAll('[data-cart-shipping-calc]').forEach(node => { node.hidden = cart.length === 0; });

      // Subtotals & Installments
      document.querySelectorAll('[data-cart-subtotal]').forEach(node => { node.textContent = formatARS(currentSubtotal); });
      document.querySelectorAll('[data-cart-transfer-total]').forEach(node => {
        node.textContent = formatARS(Math.round(currentSubtotal * 0.9));
      });
      document.querySelectorAll('[data-cart-installments]').forEach(node => {
        node.textContent = formatARS(Math.round(currentSubtotal / 6));
      });

      // Free Shipping Progress Bar ($90.000 ARS threshold)
      const progressBar = document.querySelector('[data-cart-progress-bar]');
      const progressText = document.querySelector('[data-cart-progress-text]');
      if (progressBar && progressText) {
        const percent = Math.min(100, Math.max(5, (currentSubtotal / FREE_SHIPPING_THRESHOLD) * 100));
        progressBar.style.width = `${percent}%`;
        if (currentSubtotal >= FREE_SHIPPING_THRESHOLD) {
          progressBar.classList.add('is-unlocked');
          progressText.innerHTML = `<strong>¡FELICITACIONES! TENÉS ENVÍO GRATIS A TODO EL PAÍS</strong>`;
        } else {
          progressBar.classList.remove('is-unlocked');
          const remaining = FREE_SHIPPING_THRESHOLD - currentSubtotal;
          progressText.innerHTML = `Agregá <strong>${formatARS(remaining)}</strong> más para desbloquear <strong>ENVÍO GRATIS</strong>`;
        }
      }

      // Render Items List
      const container = document.querySelector('[data-cart-items]');
      if (container) {
        container.innerHTML = cart.map(item => `
          <div class="cart-line" data-cart-item="${item.key}">
            <img src="${item.image}" alt="${item.name}" class="cart-item-image">
            <div class="cart-line-info">
              <div class="cart-item-title-row">
                <strong class="cart-item-name">${item.name}</strong>
                <button type="button" class="cart-item-remove-btn" data-cart-remove="${item.key}" aria-label="Eliminar ${item.name}">&times;</button>
              </div>
              <span class="cart-line-meta">${item.color} / ${item.size}</span>
              <div class="cart-line-bottom-row">
                <div class="cart-qty-pill">
                  <button type="button" class="cart-qty-btn" data-cart-qty="${item.key}" data-delta="-1" aria-label="Restar una unidad">&minus;</button>
                  <span class="cart-qty-value">${item.quantity}</span>
                  <button type="button" class="cart-qty-btn" data-cart-qty="${item.key}" data-delta="1" aria-label="Sumar una unidad">&plus;</button>
                </div>
                <div class="cart-item-pricing">
                  <span class="cart-line-price">${formatARS(item.price * item.quantity)}</span>
                  <span class="cart-line-transfer">${formatARS(Math.round(item.price * item.quantity * 0.9))} c/ transf.</span>
                </div>
              </div>
            </div>
          </div>
        `).join('');

        // Attach dynamic line listeners
        container.querySelectorAll('[data-cart-qty]').forEach(btn => {
          btn.addEventListener('click', () => {
            const itemKey = btn.dataset.cartQty;
            const delta = Number(btn.dataset.delta);
            this.update(itemKey, delta);
          });
        });

        container.querySelectorAll('[data-cart-remove]').forEach(btn => {
          btn.addEventListener('click', () => {
            const itemKey = btn.dataset.cartRemove;
            this.remove(itemKey);
          });
        });
      }

      this.renderRecommendation();
    },
    renderRecommendation() {
      if (typeof document === 'undefined') return;
      const recommendSection = document.querySelector('[data-cart-recommend]');
      const recommendCard = document.querySelector('[data-recommend-card]');
      if (!recommendSection || !recommendCard) return;

      if (cart.length === 0) {
        recommendSection.hidden = true;
        return;
      }

      recommendSection.hidden = false;
      const rec = RECOMMENDATIONS[activeRecommendIndex];
      if (!rec) return;

      recommendCard.innerHTML = `
        <img src="${rec.image}" alt="${rec.name}" class="rec-thumb">
        <div class="rec-info">
          <span class="rec-badge">// RECOMENDADO DROP 01</span>
          <span class="rec-name">${rec.name}</span>
          <span class="rec-price">${formatARS(rec.price)}</span>
        </div>
        <button type="button" class="rec-add-btn" data-recommend-add="${rec.id}">+ AGREGAR</button>
      `;

      recommendCard.querySelector('[data-recommend-add]')?.addEventListener('click', () => {
        this.add(rec, { color: rec.color, size: rec.size, quantity: 1 });
      });
    }
  };

  // Bind Global Event Delegation Once
  if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
      CartStore.render();

      document.querySelectorAll('[data-cart-open], #cart-toggle, .cart-trigger').forEach(el => {
        el.addEventListener('click', (e) => { e.preventDefault(); CartStore.open(); });
      });

      document.querySelectorAll('[data-cart-close], [data-cart-overlay]').forEach(el => {
        el.addEventListener('click', (e) => { e.preventDefault(); CartStore.close(); });
      });

      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') CartStore.close();
      });

      // Quick-add Size Pills Global Click Handler
      document.addEventListener('click', (e) => {
        const sizeBtn = e.target.closest('[data-direct-add-size], .quick-add-size-btn');
        if (sizeBtn && window.DopamineCatalog) {
          e.preventDefault();
          e.stopPropagation();
          const slug = sizeBtn.dataset.quickAdd || sizeBtn.dataset.productId || sizeBtn.closest('[data-product-card]')?.dataset.slug;
          const size = sizeBtn.dataset.size || sizeBtn.dataset.directAddSize || 'M';
          const product = window.DopamineCatalog.getProductBySlug(slug) || (window.DopamineCatalog.products && window.DopamineCatalog.products[0]);
          if (product) {
            CartStore.add(product, { size, quantity: 1 });
          }
        }
      });

      // Shipping Calculator Handler
      const zipBtn = document.querySelector('[data-calc-shipping-btn]');
      const zipInput = document.querySelector('[data-shipping-zip-input]');
      const result = document.querySelector('[data-shipping-calc-result]');
      if (zipBtn && zipInput && result) {
        zipBtn.addEventListener('click', () => {
          const zip = zipInput.value.trim();
          if (!zip) {
            result.textContent = t('cart.shipping_prompt', 'Por favor ingresá un código postal.');
            result.hidden = false;
            return;
          }
          const isFree = subtotal() >= FREE_SHIPPING_THRESHOLD;
          result.textContent = isFree
            ? `CP ${zip}: ${t('cart.shipping_free_msg', '¡Envío Estándar GRATIS a tu domicilio!')}`
            : `CP ${zip}: ${t('cart.shipping_standard_msg', 'Envío Estándar $5.500 (¡Llega en 3 a 5 días hábiles a todo el país!)')}`;
          result.hidden = false;
        });
      }
    });

    document.addEventListener('dopamine:langchange', () => CartStore.render());
  }

  // Export APIs
  if (typeof window !== 'undefined') {
    window.CartStore = CartStore;
    window.DopamineCart = CartStore;
    window.DopamineMP = window.DopamineMP || {
      createPreference: async () => ({ id: 'pref_' + Date.now(), init_point: '#' }),
      openCheckout: () => { if (typeof openFullPageCheckout === 'function') openFullPageCheckout(); }
    };
  }

})(typeof window !== 'undefined' ? window : globalThis);
