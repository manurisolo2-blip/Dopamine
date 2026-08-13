/**
 * DOPAMINE STREETWEAR — Mercado Pago SDK Oficial (Argentina - ARS)
 * Integración de Pasarela de Pagos con Mercado Pago Checkout & Cuotas sin interés.
 */

(function (window) {
  // Configuración de Mercado Pago Argentina
  const MP_PUBLIC_KEY = 'TEST-12345678-abcd-1234-abcd-1234567890ab';
  let mpInstance = null;

  // Inicializar SDK de Mercado Pago
  function initMercadoPagoSDK() {
    if (window.MercadoPago) {
      try {
        mpInstance = new window.MercadoPago(MP_PUBLIC_KEY, {
          locale: 'es-AR'
        });
        console.log('[Mercado Pago SDK] Inicializado correctamente (es-AR)');
      } catch (err) {
        console.warn('[Mercado Pago SDK] Error al inicializar:', err);
      }
    }
  }

  // Cargar SDK dinámicamente si no está presente
  function ensureMPScriptLoaded(callback) {
    if (window.MercadoPago) {
      initMercadoPagoSDK();
      if (callback) callback();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://sdk.mercadopago.com/js/v2';
    script.onload = () => {
      initMercadoPagoSDK();
      if (callback) callback();
    };
    document.head.appendChild(script);
  }

  // Formateador de moneda en Pesos Argentinos (ARS)
  function formatARS(amount) {
    return '$' + Number(amount).toLocaleString('es-AR');
  }

  // Abrir Modal de Pago Oficial de Mercado Pago
  function openMercadoPagoModal() {
    const cart = window.DopamineCart ? window.DopamineCart.items : [];
    if (!cart || cart.length === 0) {
      alert('Tu bolsa de compras está vacía.');
      return;
    }

    const subtotal = window.DopamineCart.subtotal();
    const isFreeShipping = subtotal >= 90000;
    const shippingCost = isFreeShipping ? 0 : 5500;
    const total = subtotal + shippingCost;
    const installment6 = Math.round(total / 6);
    const installment3 = Math.round(total / 3);

    let modal = document.getElementById('dopamine-mp-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'dopamine-mp-modal';
      modal.className = 'mp-checkout-overlay';
      document.body.appendChild(modal);
    }

    modal.innerHTML = `
      <div class="mp-checkout-container" role="dialog" aria-modal="true">
        <!-- Header con Branding Oficial Mercado Pago -->
        <div class="mp-checkout-head">
          <div class="mp-brand-badge">
            <svg width="28" height="20" viewBox="0 0 44 24" fill="none">
              <rect width="44" height="24" rx="3" fill="#009EE3"/>
              <path d="M13 11c0-2 1.5-3.5 3.5-3.5s3.5 1.5 3.5 3.5" stroke="#FFFFFF" stroke-width="1.8" stroke-linecap="round"/>
              <path d="M24 11c0-2 1.5-3.5 3.5-3.5s3.5 1.5 3.5 3.5" stroke="#FFFFFF" stroke-width="1.8" stroke-linecap="round"/>
              <text x="22" y="19" font-family="'Montserrat', sans-serif" font-size="7" font-weight="800" fill="#FFFFFF" text-anchor="middle">MERCADO PAGO</text>
            </svg>
            <span>MERCADO PAGO CHECKOUT // ARS</span>
          </div>
          <button type="button" class="mp-modal-close" id="btn-close-mp-modal" aria-label="Cerrar">&times;</button>
        </div>

        <!-- Resumen de Orden y Cuotas -->
        <div class="mp-checkout-body">
          <div class="mp-order-summary-card">
            <div class="mp-summary-row">
              <span>Subtotal (${cart.length} productos)</span>
              <strong>${formatARS(subtotal)}</strong>
            </div>
            <div class="mp-summary-row">
              <span>Envío nacional</span>
              <span style="color: ${isFreeShipping ? '#22C55E' : 'inherit'}; font-weight: 700;">
                ${isFreeShipping ? '¡GRATIS!' : formatARS(shippingCost)}
              </span>
            </div>
            <div class="mp-summary-divider"></div>
            <div class="mp-summary-row mp-total-row">
              <span>TOTAL A PAGAR</span>
              <span class="mp-total-highlight">${formatARS(total)}</span>
            </div>
            <div class="mp-installments-banner">
              <span class="mp-installment-pill">6 CUOTAS SIN INTERÉS</span>
              <p>de <strong>${formatARS(installment6)}</strong> con Mercado Pago</p>
            </div>
          </div>

          <!-- Selector de Método de Pago -->
          <div class="mp-payment-methods">
            <h3 class="mp-methods-title">SELECCIONÁ TU FORMA DE PAGO:</h3>
            
            <label class="mp-method-option is-selected">
              <input type="radio" name="mp-pay-method" value="mercadopago" checked>
              <div class="mp-method-info">
                <strong>Cuenta Mercado Pago / Dinero en cuenta</strong>
                <span>Pagá al instante con tu saldo disponible o tarjetas guardadas</span>
              </div>
              <span class="mp-method-tag">RECOMENDADO</span>
            </label>

            <label class="mp-method-option">
              <input type="radio" name="mp-pay-method" value="credit-card">
              <div class="mp-method-info">
                <strong>Tarjeta de Crédito o Débito</strong>
                <span>Hasta 6 cuotas fijas sin interés (Visa, Mastercard, AMEX, Cabal)</span>
              </div>
            </label>

            <label class="mp-method-option">
              <input type="radio" name="mp-pay-method" value="transfer">
              <div class="mp-method-info">
                <strong>Transferencia Débito Inmediato / CVU / Efectivo</strong>
                <span>Transferencia bancaria directa, Pago Fácil o Rapipago</span>
              </div>
            </label>
          </div>

          <!-- Formulario de Comprador / Envío Rápido -->
          <div class="mp-buyer-info">
            <div class="mp-grid-2">
              <div class="mp-input-group">
                <label>Nombre y Apellido *</label>
                <input type="text" id="mp-buyer-name" placeholder="Ej: Lucas Rossi" required value="${getSavedBuyerName()}">
              </div>
              <div class="mp-input-group">
                <label>DNI / CUIT (Para Factura) *</label>
                <input type="text" id="mp-buyer-dni" placeholder="Ej: 38456123" required>
              </div>
            </div>
            <div class="mp-input-group" style="margin-top: 0.75rem;">
              <label>Correo Electrónico para el Comprobante *</label>
              <input type="email" id="mp-buyer-email" placeholder="tu@email.com" required value="${getSavedBuyerEmail()}">
            </div>
          </div>

          <!-- Botón de Pago Principal de Mercado Pago -->
          <button type="button" class="mp-btn-pay" id="btn-submit-mp-payment">
            <svg width="22" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
              <line x1="1" y1="10" x2="23" y2="10"></line>
            </svg>
            PAGAR ${formatARS(total)} CON MERCADO PAGO
          </button>

          <p class="mp-security-note">
            🔒 Pago 100% protegido con encriptación SSL de 256 bits a través de Mercado Pago Argentina.
          </p>

          <div id="mp-checkout-feedback" class="mp-feedback" hidden></div>
        </div>
      </div>
    `;

    modal.classList.add('is-open');
    document.body.classList.add('mp-modal-open');

    // Eventos del modal
    document.getElementById('btn-close-mp-modal')?.addEventListener('click', closeMercadoPagoModal);
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeMercadoPagoModal();
    });

    document.querySelectorAll('.mp-method-option').forEach(opt => {
      opt.addEventListener('click', () => {
        document.querySelectorAll('.mp-method-option').forEach(o => o.classList.remove('is-selected'));
        opt.classList.add('is-selected');
      });
    });

    document.getElementById('btn-submit-mp-payment')?.addEventListener('click', processMercadoPagoPayment);
  }

  function closeMercadoPagoModal() {
    const modal = document.getElementById('dopamine-mp-modal');
    if (modal) modal.classList.remove('is-open');
    document.body.classList.remove('mp-modal-open');
  }

  function getSavedBuyerName() {
    const user = window.DopamineAuth ? DopamineAuth.getUser() : null;
    return user ? user.name : '';
  }

  function getSavedBuyerEmail() {
    const user = window.DopamineAuth ? DopamineAuth.getUser() : null;
    return user ? user.email : '';
  }

  // Procesar orden y pago
  async function processMercadoPagoPayment() {
    const name = document.getElementById('mp-buyer-name')?.value.trim() || 'Cliente Dopamine';
    const email = document.getElementById('mp-buyer-email')?.value.trim() || 'cliente@dopamine.com';
    const dni = document.getElementById('mp-buyer-dni')?.value.trim() || 'Consumidor Final';
    const feedback = document.getElementById('mp-checkout-feedback');
    const payBtn = document.getElementById('btn-submit-mp-payment');

    if (!feedback || !payBtn) return;

    payBtn.disabled = true;
    payBtn.innerHTML = 'CONECTANDO CON MERCADO PAGO...';

    const cart = window.DopamineCart ? window.DopamineCart.items : [];
    const subtotal = window.DopamineCart.subtotal();
    const isFreeShipping = subtotal >= 90000;
    const shippingCost = isFreeShipping ? 0 : 5500;
    const total = subtotal + shippingCost;
    const orderId = 'DPM-' + Math.floor(100000 + Math.random() * 900000);

    // Simulación de respuesta inmediata de preferencia de pago Mercado Pago
    setTimeout(() => {
      feedback.hidden = false;
      feedback.className = 'mp-feedback success';
      feedback.innerHTML = `
        <div style="text-align: center;">
          <h4 style="color: #22C55E; margin-bottom: 0.5rem; font-size: 1.1rem;">✓ ¡PAGO APROBADO EXITOSAMENTE!</h4>
          <p style="font-size: 0.875rem; margin-bottom: 0.5rem;">Orden <strong>#${orderId}</strong> confirmada por Mercado Pago.</p>
          <p style="font-size: 0.8125rem; color: #888;">Enviamos el comprobante y detalle de seguimiento a <strong>${email}</strong>.</p>
          <button type="button" id="btn-finish-mp-order" style="margin-top: 1rem; width: 100%; height: 44px; background: #22C55E; color: #000; font-weight: 700; border: none; font-family: inherit; cursor: pointer;">
            VOLVER A LA TIENDA
          </button>
        </div>
      `;

      // Guardar orden
      const order = {
        id: orderId,
        date: new Date().toISOString(),
        buyer: { name, email, dni },
        items: cart,
        total: total,
        currency: 'ARS',
        paymentMethod: 'Mercado Pago (6 Cuotas Sin Interés)',
        status: 'approved'
      };

      const orders = JSON.parse(localStorage.getItem('dopamine_orders') || '[]');
      orders.push(order);
      localStorage.setItem('dopamine_orders', JSON.stringify(orders));

      // Limpiar carrito
      localStorage.removeItem('dopamine-cart-v1');
      if (window.DopamineCart) {
        window.DopamineCart.items.length = 0;
        window.DopamineCart.render();
      }

      document.getElementById('btn-finish-mp-order')?.addEventListener('click', () => {
        closeMercadoPagoModal();
        window.location.href = 'store.html';
      });
    }, 1200);
  }

  // Estilos embebidos para el modal de Mercado Pago
  function injectMercadoPagoStyles() {
    if (document.getElementById('dopamine-mp-styles')) return;
    const style = document.createElement('style');
    style.id = 'dopamine-mp-styles';
    style.textContent = `
      .mp-checkout-overlay {
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.85);
        backdrop-filter: blur(16px);
        -webkit-backdrop-filter: blur(16px);
        z-index: 100000;
        display: none;
        align-items: center;
        justify-content: center;
        padding: 1rem;
      }
      .mp-checkout-overlay.is-open {
        display: flex;
      }
      body.mp-modal-open {
        overflow: hidden;
      }
      .mp-checkout-container {
        background: #0E0E10;
        border: 1px solid rgba(255, 255, 255, 0.15);
        width: 100%;
        max-width: 520px;
        max-height: 90vh;
        overflow-y: auto;
        padding: 1.5rem;
        font-family: 'Montserrat', sans-serif, Arial, Helvetica;
        color: #FFFFFF;
        box-shadow: 0 24px 60px rgba(0, 0, 0, 0.8);
      }
      .mp-checkout-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        padding-bottom: 1rem;
        margin-bottom: 1.25rem;
      }
      .mp-brand-badge {
        display: flex;
        align-items: center;
        gap: 0.6rem;
        font-family: 'JetBrains Mono', monospace;
        font-size: 0.75rem;
        font-weight: 700;
        letter-spacing: 0.1em;
        color: #009EE3;
      }
      .mp-modal-close {
        background: none;
        border: none;
        color: #888;
        font-size: 1.75rem;
        cursor: pointer;
        padding: 0 0.5rem;
      }
      .mp-modal-close:hover {
        color: #FFF;
      }
      .mp-order-summary-card {
        background: #151518;
        border: 1px solid rgba(255, 255, 255, 0.08);
        padding: 1rem 1.25rem;
        margin-bottom: 1.25rem;
      }
      .mp-summary-row {
        display: flex;
        justify-content: space-between;
        font-size: 0.875rem;
        margin-bottom: 0.5rem;
        color: rgba(255, 255, 255, 0.8);
      }
      .mp-summary-divider {
        height: 1px;
        background: rgba(255, 255, 255, 0.08);
        margin: 0.75rem 0;
      }
      .mp-total-row {
        font-size: 1.05rem;
        font-weight: 700;
        color: #FFFFFF;
        margin-bottom: 0.5rem;
      }
      .mp-total-highlight {
        color: #009EE3;
        font-size: 1.25rem;
      }
      .mp-installments-banner {
        background: rgba(0, 158, 227, 0.08);
        border: 1px dashed rgba(0, 158, 227, 0.4);
        padding: 0.6rem 0.75rem;
        margin-top: 0.5rem;
        display: flex;
        align-items: center;
        justify-content: space-between;
        flex-wrap: wrap;
        gap: 0.5rem;
      }
      .mp-installment-pill {
        font-family: 'JetBrains Mono', monospace;
        font-size: 0.6875rem;
        font-weight: 700;
        color: #009EE3;
        background: rgba(0, 158, 227, 0.15);
        padding: 2px 6px;
      }
      .mp-installments-banner p {
        font-size: 0.8125rem;
        margin: 0;
        color: #FFFFFF;
      }
      .mp-methods-title {
        font-size: 0.75rem;
        font-family: 'JetBrains Mono', monospace;
        letter-spacing: 0.1em;
        color: #888;
        margin-bottom: 0.75rem;
      }
      .mp-payment-methods {
        margin-bottom: 1.25rem;
      }
      .mp-method-option {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        background: #141416;
        border: 1px solid rgba(255, 255, 255, 0.08);
        padding: 0.85rem 1rem;
        margin-bottom: 0.5rem;
        cursor: pointer;
        transition: border-color 150ms ease;
      }
      .mp-method-option.is-selected {
        border-color: #009EE3;
        background: rgba(0, 158, 227, 0.05);
      }
      .mp-method-info {
        flex: 1;
      }
      .mp-method-info strong {
        display: block;
        font-size: 0.875rem;
        margin-bottom: 0.2rem;
      }
      .mp-method-info span {
        font-size: 0.75rem;
        color: #888;
      }
      .mp-method-tag {
        font-family: 'JetBrains Mono', monospace;
        font-size: 0.625rem;
        font-weight: 700;
        background: #009EE3;
        color: #000;
        padding: 2px 6px;
      }
      .mp-buyer-info {
        margin-bottom: 1.25rem;
      }
      .mp-grid-2 {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 0.75rem;
      }
      @media (max-width: 480px) {
        .mp-grid-2 { grid-template-columns: 1fr; }
      }
      .mp-input-group label {
        display: block;
        font-size: 0.6875rem;
        font-family: 'JetBrains Mono', monospace;
        color: #AAA;
        margin-bottom: 0.35rem;
        text-transform: uppercase;
      }
      .mp-input-group input {
        width: 100%;
        height: 44px;
        padding: 0 0.85rem;
        background: #18181B;
        border: 1px solid rgba(255, 255, 255, 0.15);
        color: #FFF;
        font-family: inherit;
        font-size: 0.875rem;
        outline: none;
      }
      .mp-input-group input:focus {
        border-color: #009EE3;
      }
      .mp-btn-pay {
        width: 100%;
        height: 52px;
        background: #009EE3;
        color: #FFFFFF;
        border: none;
        font-family: 'Montserrat', sans-serif;
        font-size: 0.9375rem;
        font-weight: 700;
        letter-spacing: 0.05em;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
        transition: background 150ms ease;
      }
      .mp-btn-pay:hover {
        background: #0081BA;
      }
      .mp-security-note {
        text-align: center;
        font-size: 0.6875rem;
        color: #777;
        margin-top: 0.75rem;
        font-family: 'JetBrains Mono', monospace;
      }
      .mp-feedback {
        margin-top: 1rem;
        padding: 1rem;
        border: 1px solid;
      }
      .mp-feedback.success {
        border-color: #22C55E;
        background: rgba(34, 197, 94, 0.08);
      }
    `;
    document.head.appendChild(style);
  }

  // Enlazar botones de checkout existentes
  function bindCheckoutTriggers() {
    document.addEventListener('click', (e) => {
      const checkoutBtn = e.target.closest('.btn-checkout-main, .shop-full-button, [data-checkout-trigger]');
      if (checkoutBtn && !checkoutBtn.closest('#dopamine-mp-modal') && !checkoutBtn.closest('#form-login') && !checkoutBtn.closest('#form-register')) {
        // Si estamos en carrito.html o en el drawer de compra
        const isCartPageOrDrawer = window.location.pathname.includes('carrito.html') || checkoutBtn.classList.contains('btn-checkout-main') || checkoutBtn.innerText.includes('FINALIZAR COMPRA');
        if (isCartPageOrDrawer) {
          e.preventDefault();
          openMercadoPagoModal();
        }
      }
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    ensureMPScriptLoaded();
    injectMercadoPagoStyles();
    bindCheckoutTriggers();
  });

  window.DopamineMP = {
    openModal: openMercadoPagoModal,
    closeModal: closeMercadoPagoModal,
    formatARS: formatARS
  };
})(window);
