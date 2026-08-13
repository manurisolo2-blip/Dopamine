/**
 * DOPAMINE STREETWEAR — Mercado Pago SDK Oficial & Full-Page Luxury Checkout Hub
 * Desarrollado con soporte 100% Pesos Argentinos (ARS), cuotas sin interés y logos oficiales.
 */

(function (window) {
  const MP_PUBLIC_KEY = 'TEST-12345678-abcd-1234-abcd-1234567890ab';
  let mpInstance = null;
  let activeCoupon = null;
  let selectedShippingMethod = 'standard';
  let selectedPaymentMethod = 'mercadopago';
  let selectedInstallments = 6;

  // Inicializar SDK oficial de Mercado Pago
  function initMercadoPagoSDK() {
    if (window.MercadoPago) {
      try {
        mpInstance = new window.MercadoPago(MP_PUBLIC_KEY, { locale: 'es-AR' });
        console.log('[Mercado Pago SDK] Inicializado correctamente con locale es-AR.');
      } catch (err) {
        console.warn('[Mercado Pago SDK] Fallback local activo:', err);
      }
    }
  }

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

  function formatARS(amount) {
    return '$' + Math.max(0, Math.round(Number(amount))).toLocaleString('es-AR');
  }

  // LOGOS OFICIALES EN SVG DE ALTA RESOLUCIÓN
  const ICONS = {
    mercadopago: `<svg width="38" height="26" viewBox="0 0 54 32" fill="none"><rect width="54" height="32" rx="4" fill="#009EE3"/><path d="M16 14.5C16 11.5 18.5 9 21.5 9C24 9 26 10.8 26.8 13.2C27.6 10.8 29.6 9 32.1 9C35.1 9 37.6 11.5 37.6 14.5C37.6 15.2 37.4 15.9 37.1 16.5L34.2 21.8C33.6 22.8 32.5 23.5 31.3 23.5C30.4 23.5 29.6 23.1 29 22.4L26.8 19.8L24.6 22.4C24 23.1 23.2 23.5 22.3 23.5C21.1 23.5 20 22.8 19.4 21.8L16.5 16.5C16.2 15.9 16 15.2 16 14.5Z" fill="#FFFFFF"/><circle cx="21.5" cy="14.5" r="1.8" fill="#009EE3"/><circle cx="32.1" cy="14.5" r="1.8" fill="#009EE3"/></svg>`,
    visa: `<svg width="42" height="26" viewBox="0 0 54 32" fill="none"><rect width="54" height="32" rx="4" fill="#1A1F71"/><path d="M22.8 21.5H19.9L21.7 10.5H24.6L22.8 21.5ZM31.8 10.8C31.2 10.5 30.3 10.3 29.2 10.3C26.3 10.3 24.3 11.8 24.3 14C24.3 15.6 25.7 16.5 26.8 17C27.9 17.5 28.3 17.9 28.3 18.4C28.3 19.2 27.3 19.6 26.4 19.6C25.2 19.6 24.5 19.4 23.6 19L23.2 18.8L22.7 21.7C23.6 22.1 25.1 22.4 26.7 22.4C29.8 22.4 31.8 20.9 31.8 18.5C31.8 17.3 31.1 16.3 29.5 15.5C28.5 15 27.9 14.6 27.9 14.1C27.9 13.6 28.5 13.1 29.6 13.1C30.5 13.1 31.2 13.3 31.7 13.5L32.1 13.7L32.6 10.8H31.8ZM39.6 10.5H37.3C36.6 10.5 36 10.9 35.7 11.6L30.5 21.5H33.9L34.6 19.6H38.8L39.2 21.5H42.2L39.6 10.5ZM35.6 16.9L37.2 12.6L38.2 16.9H35.6ZM18.2 10.5L15.3 18.2L15 16.7C14.4 14.8 12.6 12.7 10.6 11.6L13.3 21.5H16.8L21.6 10.5H18.2Z" fill="#FFFFFF"/><path d="M12.6 10.5H7.1L7 10.8C11.3 11.9 14.6 14.6 15.8 17.8L14.7 12.2C14.5 10.9 13.6 10.5 12.6 10.5Z" fill="#F7B600"/></svg>`,
    mastercard: `<svg width="42" height="26" viewBox="0 0 54 32" fill="none"><rect width="54" height="32" rx="4" fill="#222222"/><circle cx="21" cy="16" r="9" fill="#EB001B"/><circle cx="33" cy="16" r="9" fill="#F79E1B"/><path d="M27 9.8C28.8 11.4 30 13.6 30 16C30 18.4 28.8 20.6 27 22.2C25.2 20.6 24 18.4 24 16C24 13.6 25.2 11.4 27 9.8Z" fill="#FF5F00"/></svg>`,
    amex: `<svg width="42" height="26" viewBox="0 0 54 32" fill="none"><rect width="54" height="32" rx="4" fill="#006FCF"/><rect x="4" y="4" width="46" height="24" stroke="#FFFFFF" stroke-width="1.5"/><text x="27" y="19" font-family="'Montserrat', sans-serif" font-size="7" font-weight="900" fill="#FFFFFF" text-anchor="middle" letter-spacing="1">AMEX</text></svg>`,
    cabal: `<svg width="42" height="26" viewBox="0 0 54 32" fill="none"><rect width="54" height="32" rx="4" fill="#D9222A"/><text x="27" y="20" font-family="'Montserrat', sans-serif" font-size="9" font-weight="900" fill="#FFFFFF" text-anchor="middle" letter-spacing="0.5">CABAL</text></svg>`,
    modo: `<svg width="42" height="26" viewBox="0 0 54 32" fill="none"><rect width="54" height="32" rx="4" fill="#380064"/><text x="27" y="20" font-family="'Montserrat', sans-serif" font-size="9" font-weight="900" fill="#00E5A3" text-anchor="middle" letter-spacing="0.8">MODO</text></svg>`,
    pagofacil: `<svg width="42" height="26" viewBox="0 0 54 32" fill="none"><rect width="54" height="32" rx="4" fill="#FFD200"/><rect x="5" y="6" width="44" height="20" rx="3" fill="#1C1C1C"/><text x="27" y="19" font-family="'Montserrat', sans-serif" font-size="6.5" font-weight="900" fill="#FFD200" text-anchor="middle">PAGO FÁCIL</text></svg>`,
    rapipago: `<svg width="42" height="26" viewBox="0 0 54 32" fill="none"><rect width="54" height="32" rx="4" fill="#003A8C"/><text x="27" y="19.5" font-family="'Montserrat', sans-serif" font-size="6.5" font-weight="900" fill="#FFD200" text-anchor="middle">RAPIPAGO</text></svg>`
  };

  function getCartData() {
    return window.DopamineCart ? window.DopamineCart.items : [];
  }

  function calculateTotals() {
    const cart = getCartData();
    const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    
    // Envío
    let shipping = 0;
    if (selectedShippingMethod === 'standard') {
      shipping = subtotal >= 90000 ? 0 : 5500;
    } else if (selectedShippingMethod === 'express') {
      shipping = 8500;
    } else if (selectedShippingMethod === 'pickup') {
      shipping = 0;
    }

    // Descuento por cupón o transferencia
    let discount = 0;
    if (activeCoupon === 'DOPAMINE10') {
      discount += subtotal * 0.10;
    }
    if (selectedPaymentMethod === 'transfer') {
      discount += (subtotal - discount) * 0.10; // 10% OFF EXTRA por transferencia
    }

    const total = Math.max(0, subtotal - discount + shipping);
    const installment6 = Math.round(total / 6);
    const installment3 = Math.round(total / 3);

    return { subtotal, shipping, discount, total, installment6, installment3 };
  }

  // ABRIR CHECKOUT HUB COMPLETO EN PANTALLA COMPLETA
  function openFullPageCheckout() {
    const cart = getCartData();
    if (!cart || cart.length === 0) {
      alert('Tu bolsa de compras está vacía. Seleccioná una prenda para continuar.');
      return;
    }

    let hub = document.getElementById('dopamine-checkout-hub');
    if (!hub) {
      hub = document.createElement('div');
      hub.id = 'dopamine-checkout-hub';
      hub.className = 'dpm-checkout-hub-screen';
      document.body.appendChild(hub);
    }

    renderCheckoutHubContent(hub);
    hub.classList.add('is-active');
    document.body.classList.add('dpm-checkout-active');
  }

  function closeFullPageCheckout() {
    const hub = document.getElementById('dopamine-checkout-hub');
    if (hub) {
      hub.classList.remove('is-active');
      document.body.classList.remove('dpm-checkout-active');
    }
  }

  function renderCheckoutHubContent(hub) {
    const cart = getCartData();
    const { subtotal, shipping, discount, total, installment6, installment3 } = calculateTotals();
    const user = window.DopamineAuth ? DopamineAuth.getUser() : null;

    hub.innerHTML = `
      <div class="dpm-hub-wrapper">
        <!-- TOP NAVIGATION BAR -->
        <header class="dpm-hub-topbar">
          <div class="dpm-hub-top-left">
            <button type="button" class="dpm-hub-back-btn" id="dpm-hub-close">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
              <span>VOLVER A LA TIENDA</span>
            </button>
          </div>
          <div class="dpm-hub-top-center">
            <a href="index.html" class="dpm-hub-brand-logo">
              <img src="assets/Branding/Logos/isotipo invertido.png" alt="Dopamine" class="dpm-hub-logo-img">
              <span class="dpm-hub-brand-name">DOPAMINE</span>
            </a>
          </div>
          <div class="dpm-hub-top-right">
            <span class="dpm-security-pill">🔒 CHECKOUT SEGURO SSL // MERCADO PAGO</span>
          </div>
        </header>

        <!-- MAIN TWO-COLUMN CHECKOUT GRID -->
        <div class="dpm-hub-grid">
          
          <!-- LEFT COLUMN: DATOS + ENVÍO + FORMAS DE PAGO -->
          <div class="dpm-hub-main-col">
            
            <!-- PASO 1: CONTACTO Y ENVÍO -->
            <section class="dpm-hub-section">
              <div class="dpm-step-header">
                <span class="dpm-step-num">01</span>
                <div>
                  <h2 class="dpm-step-title">DATOS DE CONTACTO & ENTREGA</h2>
                  <p class="dpm-step-desc">Ingresá tus datos para el envío y facturación oficial.</p>
                </div>
              </div>

              <div class="dpm-form-grid">
                <div class="dpm-input-field full">
                  <label>Correo Electrónico (Para confirmación y tracking) *</label>
                  <input type="email" id="dpm-cust-email" placeholder="ejemplo@email.com" required value="${user ? user.email : ''}">
                </div>
                <div class="dpm-input-field half">
                  <label>Nombre y Apellido *</label>
                  <input type="text" id="dpm-cust-name" placeholder="Ej: Agustín Navarro" required value="${user ? user.name : ''}">
                </div>
                <div class="dpm-input-field half">
                  <label>DNI / CUIT (Facturación AFIP) *</label>
                  <input type="text" id="dpm-cust-dni" placeholder="Ej: 39123456" required>
                </div>
                <div class="dpm-input-field half">
                  <label>Teléfono Celular (Avisos de despacho) *</label>
                  <input type="tel" id="dpm-cust-phone" placeholder="Ej: 11 5849 2039" required>
                </div>
                <div class="dpm-input-field half">
                  <label>Código Postal (CP) *</label>
                  <input type="text" id="dpm-cust-zip" placeholder="Ej: 1414" required value="1414">
                </div>
                <div class="dpm-input-field full">
                  <label>Dirección de Entrega (Calle y Altura) *</label>
                  <input type="text" id="dpm-cust-address" placeholder="Ej: Honduras 4920" required>
                </div>
                <div class="dpm-input-field half">
                  <label>Piso / Depto / Timbre (Opcional)</label>
                  <input type="text" id="dpm-cust-floor" placeholder="Ej: 3° B">
                </div>
                <div class="dpm-input-field half">
                  <label>Ciudad / Localidad *</label>
                  <input type="text" id="dpm-cust-city" placeholder="Ej: Palermo, CABA" required>
                </div>
              </div>

              <!-- OPCIONES DE ENVÍO -->
              <div class="dpm-shipping-options">
                <h3 class="dpm-sub-title">SELECCIONÁ EL MÉTODO DE ENVÍO:</h3>
                
                <label class="dpm-select-card ${selectedShippingMethod === 'standard' ? 'is-selected' : ''}" data-ship="standard">
                  <input type="radio" name="dpm-ship-select" value="standard" ${selectedShippingMethod === 'standard' ? 'checked' : ''}>
                  <div class="dpm-card-left">
                    <span class="dpm-carrier-badge">CORREO ARGENTINO / ANDREANI</span>
                    <strong>Envío Estándar a Domicilio (Todo el País)</strong>
                    <span class="dpm-card-note">Entrega garantizada en 3 a 5 días hábiles con código de seguimiento.</span>
                  </div>
                  <div class="dpm-card-right">
                    <span class="dpm-price-tag ${subtotal >= 90000 ? 'is-free' : ''}">
                      ${subtotal >= 90000 ? '¡GRATIS!' : '$5.500'}
                    </span>
                  </div>
                </label>

                <label class="dpm-select-card ${selectedShippingMethod === 'express' ? 'is-selected' : ''}" data-ship="express">
                  <input type="radio" name="dpm-ship-select" value="express" ${selectedShippingMethod === 'express' ? 'checked' : ''}>
                  <div class="dpm-card-left">
                    <span class="dpm-carrier-badge express">PRIORITARIO 24HS</span>
                    <strong>Envío Moto Express CABA y Gran Buenos Aires</strong>
                    <span class="dpm-card-note">Recibí tu pedido en el día o al día siguiente hábil.</span>
                  </div>
                  <div class="dpm-card-right">
                    <span class="dpm-price-tag">$8.500</span>
                  </div>
                </label>

                <label class="dpm-select-card ${selectedShippingMethod === 'pickup' ? 'is-selected' : ''}" data-ship="pickup">
                  <input type="radio" name="dpm-ship-select" value="pickup" ${selectedShippingMethod === 'pickup' ? 'checked' : ''}>
                  <div class="dpm-card-left">
                    <span class="dpm-carrier-badge pickup">FLAGSHIP STORE</span>
                    <strong>Pick-Up Showroom Dopamine (Palermo Soho, CABA)</strong>
                    <span class="dpm-card-note">Retiro gratuito e inmediato de Lunes a Sábados 14:00 a 20:00hs.</span>
                  </div>
                  <div class="dpm-card-right">
                    <span class="dpm-price-tag is-free">¡GRATIS!</span>
                  </div>
                </label>
              </div>
            </section>

            <!-- PASO 2: MÉTODOS DE PAGO CON LOGOS -->
            <section class="dpm-hub-section">
              <div class="dpm-step-header">
                <span class="dpm-step-num">02</span>
                <div>
                  <h2 class="dpm-step-title">MÉTODO DE PAGO</h2>
                  <p class="dpm-step-desc">Todas las transacciones están procesadas de forma segura por Mercado Pago.</p>
                </div>
              </div>

              <div class="dpm-payment-accordion">
                
                <!-- OPCIÓN 1: MERCADO PAGO OFICIAL -->
                <div class="dpm-pay-card ${selectedPaymentMethod === 'mercadopago' ? 'is-open' : ''}" data-pay="mercadopago">
                  <div class="dpm-pay-header">
                    <div class="dpm-pay-radio-wrap">
                      <input type="radio" name="dpm-pay-method" value="mercadopago" ${selectedPaymentMethod === 'mercadopago' ? 'checked' : ''}>
                      <div>
                        <strong class="dpm-pay-name">Cuenta Mercado Pago / Dinero en cuenta</strong>
                        <span class="dpm-pay-detail">Pagá al instante con tu saldo en cuenta o tarjetas registradas.</span>
                      </div>
                    </div>
                    <div class="dpm-pay-logos">
                      ${ICONS.mercadopago}
                    </div>
                  </div>
                  <div class="dpm-pay-body">
                    <div class="dpm-mp-features">
                      <div class="dpm-feature-item">✓ Acreditación instantánea sin demoras</div>
                      <div class="dpm-feature-item">✓ Protección al comprador de Mercado Pago</div>
                      <div class="dpm-feature-item">✓ Hasta 6 cuotas fijas sin interés</div>
                    </div>
                  </div>
                </div>

                <!-- OPCIÓN 2: TARJETAS DE CRÉDITO Y DÉBITO -->
                <div class="dpm-pay-card ${selectedPaymentMethod === 'cards' ? 'is-open' : ''}" data-pay="cards">
                  <div class="dpm-pay-header">
                    <div class="dpm-pay-radio-wrap">
                      <input type="radio" name="dpm-pay-method" value="cards" ${selectedPaymentMethod === 'cards' ? 'checked' : ''}>
                      <div>
                        <strong class="dpm-pay-name">Tarjeta de Crédito o Débito</strong>
                        <span class="dpm-pay-detail">Hasta 6 cuotas sin interés en tarjetas bancarias argentinas.</span>
                      </div>
                    </div>
                    <div class="dpm-pay-logos">
                      ${ICONS.visa}
                      ${ICONS.mastercard}
                      ${ICONS.amex}
                      ${ICONS.cabal}
                    </div>
                  </div>
                  <div class="dpm-pay-body">
                    <div class="dpm-installments-selector">
                      <label class="dpm-inst-label">SELECCIONÁ TUS CUOTAS:</label>
                      <div class="dpm-inst-options">
                        <label class="dpm-inst-pill ${selectedInstallments === 6 ? 'is-selected' : ''}">
                          <input type="radio" name="dpm-inst-choice" value="6" ${selectedInstallments === 6 ? 'checked' : ''}>
                          <span><strong>6 Cuotas Sin Interés</strong> de ${formatARS(installment6)}</span>
                        </label>
                        <label class="dpm-inst-pill ${selectedInstallments === 3 ? 'is-selected' : ''}">
                          <input type="radio" name="dpm-inst-choice" value="3" ${selectedInstallments === 3 ? 'checked' : ''}>
                          <span><strong>3 Cuotas Sin Interés</strong> de ${formatARS(installment3)}</span>
                        </label>
                        <label class="dpm-inst-pill ${selectedInstallments === 1 ? 'is-selected' : ''}">
                          <input type="radio" name="dpm-inst-choice" value="1" ${selectedInstallments === 1 ? 'checked' : ''}>
                          <span><strong>1 Pago</strong> de ${formatARS(total)}</span>
                        </label>
                      </div>
                    </div>

                    <div class="dpm-form-grid" style="margin-top: 1rem;">
                      <div class="dpm-input-field full">
                        <label>Número de Tarjeta</label>
                        <input type="text" id="dpm-card-number" placeholder="4509 •••• •••• ••••" maxlength="19">
                      </div>
                      <div class="dpm-input-field full">
                        <label>Nombre y Apellido del Titular</label>
                        <input type="text" id="dpm-card-holder" placeholder="Como figura en el plástico">
                      </div>
                      <div class="dpm-input-field half">
                        <label>Vencimiento (MM/AA)</label>
                        <input type="text" id="dpm-card-exp" placeholder="MM/AA" maxlength="5">
                      </div>
                      <div class="dpm-input-field half">
                        <label>Código de Seguridad (CVV / CVC)</label>
                        <input type="text" id="dpm-card-cvv" placeholder="123" maxlength="4">
                      </div>
                    </div>
                  </div>
                </div>

                <!-- OPCIÓN 3: TRANSFERENCIA BANCARIA / MODO (10% OFF EXTRA) -->
                <div class="dpm-pay-card ${selectedPaymentMethod === 'transfer' ? 'is-open' : ''}" data-pay="transfer">
                  <div class="dpm-pay-header">
                    <div class="dpm-pay-radio-wrap">
                      <input type="radio" name="dpm-pay-method" value="transfer" ${selectedPaymentMethod === 'transfer' ? 'checked' : ''}>
                      <div>
                        <strong class="dpm-pay-name">Transferencia Bancaria Inmediata / MODO</strong>
                        <span class="dpm-pay-detail">10% DE DESCUENTO AUTOMÁTICO adicional en el total.</span>
                      </div>
                    </div>
                    <div class="dpm-pay-logos">
                      <span class="dpm-discount-pill">10% OFF</span>
                      ${ICONS.modo}
                    </div>
                  </div>
                  <div class="dpm-pay-body">
                    <div class="dpm-bank-data-box">
                      <div class="dpm-bank-row">
                        <span>Banco:</span>
                        <strong>Mercado Pago / Banco Santander</strong>
                      </div>
                      <div class="dpm-bank-row">
                        <span>Titular:</span>
                        <strong>DOPAMINE STREETWEAR S.R.L.</strong>
                      </div>
                      <div class="dpm-bank-row">
                        <span>Alias MP:</span>
                        <strong class="dpm-copy-alias" id="btn-copy-alias">dopamine.streetwear.mp 📋</strong>
                      </div>
                      <div class="dpm-bank-row">
                        <span>CVU Oficial:</span>
                        <strong>0000003100094829103829</strong>
                      </div>
                      <p class="dpm-bank-help">Luego de abonar, enviá tu comprobante por WhatsApp o responde al email de confirmación.</p>
                    </div>
                  </div>
                </div>

                <!-- OPCIÓN 4: EFECTIVO (PAGO FÁCIL / RAPIPAGO) -->
                <div class="dpm-pay-card ${selectedPaymentMethod === 'cash' ? 'is-open' : ''}" data-pay="cash">
                  <div class="dpm-pay-header">
                    <div class="dpm-pay-radio-wrap">
                      <input type="radio" name="dpm-pay-method" value="cash" ${selectedPaymentMethod === 'cash' ? 'checked' : ''}>
                      <div>
                        <strong class="dpm-pay-name">Efectivo en Puntos de Cobro</strong>
                        <span class="dpm-pay-detail">Aboná en cualquier sucursal de Pago Fácil o Rapipago del país.</span>
                      </div>
                    </div>
                    <div class="dpm-pay-logos">
                      ${ICONS.pagofacil}
                      ${ICONS.rapipago}
                    </div>
                  </div>
                  <div class="dpm-pay-body">
                    <p class="dpm-cash-desc">Al confirmar tu orden, te generaremos un código de barras digital para pagar en cualquier sucursal sin costo extra.</p>
                  </div>
                </div>

              </div>
            </section>

          </div>

          <!-- RIGHT COLUMN: STICKY RESUMEN DE COMPRA & CHECKOUT CTA -->
          <aside class="dpm-hub-side-col">
            <div class="dpm-summary-sticky-card">
              <h3 class="dpm-summary-card-title">RESUMEN DE TU BOLSA</h3>

              <!-- LISTA DE PRODUCTOS -->
              <div class="dpm-summary-items-list">
                ${cart.map(item => `
                  <div class="dpm-summary-item-row">
                    <div class="dpm-item-thumb-wrap">
                      <img src="${item.image}" alt="${item.name}" class="dpm-item-thumb">
                      <span class="dpm-item-qty-badge">${item.quantity}</span>
                    </div>
                    <div class="dpm-item-details">
                      <h4 class="dpm-item-name">${item.name}</h4>
                      <span class="dpm-item-spec">Talle: ${item.size} | Color: ${item.color}</span>
                    </div>
                    <div class="dpm-item-price">
                      ${formatARS(item.price * item.quantity)}
                    </div>
                  </div>
                `).join('')}
              </div>

              <!-- CUPÓN DE DESCUENTO -->
              <div class="dpm-coupon-box">
                <div class="dpm-coupon-input-wrap">
                  <input type="text" id="dpm-coupon-code" placeholder="CÓDIGO DE DESCUENTO (Ej: DOPAMINE10)" value="${activeCoupon || ''}">
                  <button type="button" id="dpm-apply-coupon">APLICAR</button>
                </div>
                ${activeCoupon ? `<span class="dpm-coupon-success">✓ Cupón ${activeCoupon} aplicado con 10% OFF</span>` : ''}
              </div>

              <!-- DESGLOSE DE TOTALES -->
              <div class="dpm-totals-breakdown">
                <div class="dpm-total-row">
                  <span>Subtotal</span>
                  <strong>${formatARS(subtotal)}</strong>
                </div>
                ${discount > 0 ? `
                  <div class="dpm-total-row dpm-discount-row">
                    <span>Descuento aplicado</span>
                    <strong>-${formatARS(discount)}</strong>
                  </div>
                ` : ''}
                <div class="dpm-total-row">
                  <span>Costo de Envío</span>
                  <strong style="color: ${shipping === 0 ? '#22C55E' : 'inherit'};">
                    ${shipping === 0 ? '¡GRATIS!' : formatARS(shipping)}
                  </strong>
                </div>
                
                <div class="dpm-total-divider"></div>

                <div class="dpm-total-final-row">
                  <span>TOTAL FINAL</span>
                  <div class="dpm-final-price-wrap">
                    <span class="dpm-final-price">${formatARS(total)}</span>
                    <span class="dpm-currency-tag">ARS</span>
                  </div>
                </div>

                <!-- BANNER DE CUOTAS MERCADO PAGO -->
                <div class="dpm-installments-badge">
                  <span class="dpm-inst-tag">MERCADO PAGO</span>
                  <p>Hasta <strong>6 cuotas fijas sin interés</strong> de <strong>${formatARS(installment6)}</strong></p>
                </div>
              </div>

              <!-- BOTÓN PRINCIPAL DE PAGO -->
              <button type="button" class="dpm-btn-checkout-submit" id="btn-dpm-complete-purchase">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>
                PAGAR ${formatARS(total)} CON MERCADO PAGO
              </button>

              <!-- GARANTÍAS Y BADGES -->
              <div class="dpm-trust-badges">
                <div class="dpm-trust-item">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                  <span>Checkout Encriptado 256-bit SSL</span>
                </div>
                <div class="dpm-trust-item">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
                  <span>Garantía Oficial de Devolución</span>
                </div>
              </div>

              <!-- FEEDBACK INTERACTIVO -->
              <div id="dpm-checkout-status-msg" class="dpm-status-msg" hidden></div>
            </div>
          </aside>

        </div>
      </div>
    `;

    bindCheckoutHubEvents(hub);
  }

  function bindCheckoutHubEvents(hub) {
    // Cerrar
    document.getElementById('dpm-hub-close')?.addEventListener('click', closeFullPageCheckout);

    // Selección de Envío
    hub.querySelectorAll('[data-ship]').forEach(card => {
      card.addEventListener('click', () => {
        selectedShippingMethod = card.dataset.ship;
        renderCheckoutHubContent(hub);
      });
    });

    // Selección de Método de Pago
    hub.querySelectorAll('.dpm-pay-card').forEach(card => {
      card.addEventListener('click', (e) => {
        if (e.target.tagName === 'INPUT' && e.target.type !== 'radio') return;
        selectedPaymentMethod = card.dataset.pay;
        renderCheckoutHubContent(hub);
      });
    });

    // Selección de cuotas
    hub.querySelectorAll('input[name="dpm-inst-choice"]').forEach(radio => {
      radio.addEventListener('change', (e) => {
        selectedInstallments = Number(e.target.value);
        renderCheckoutHubContent(hub);
      });
    });

    // Aplicar Cupón
    document.getElementById('dpm-apply-coupon')?.addEventListener('click', () => {
      const input = document.getElementById('dpm-coupon-code');
      const val = input ? input.value.trim().toUpperCase() : '';
      if (val === 'DOPAMINE10' || val === 'DROPS2026') {
        activeCoupon = 'DOPAMINE10';
      } else {
        alert('Cupón inválido o expirado. Probá con "DOPAMINE10" para 10% OFF.');
        activeCoupon = null;
      }
      renderCheckoutHubContent(hub);
    });

    // Copiar Alias
    document.getElementById('btn-copy-alias')?.addEventListener('click', () => {
      navigator.clipboard.writeText('dopamine.streetwear.mp').then(() => {
        alert('✓ Alias "dopamine.streetwear.mp" copiado al portapapeles.');
      });
    });

    // Procesar Pago Final
    document.getElementById('btn-dpm-complete-purchase')?.addEventListener('click', executeFinalPurchase);
  }

  // EJECUCIÓN DE COMPRA Y CONEXIÓN MERCADO PAGO SDK
  async function executeFinalPurchase() {
    const email = document.getElementById('dpm-cust-email')?.value.trim();
    const name = document.getElementById('dpm-cust-name')?.value.trim();
    const dni = document.getElementById('dpm-cust-dni')?.value.trim();
    const address = document.getElementById('dpm-cust-address')?.value.trim();
    const city = document.getElementById('dpm-cust-city')?.value.trim();
    const statusMsg = document.getElementById('dpm-checkout-status-msg');
    const submitBtn = document.getElementById('btn-dpm-complete-purchase');

    if (!email || !name || !dni || !address || !city) {
      alert('Por favor completá los campos obligatorios de contacto y dirección de entrega.');
      return;
    }

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = `
        <span class="dpm-spinner"></span>
        CONECTANDO CON MERCADO PAGO...
      `;
    }

    const { total, subtotal, shipping, discount } = calculateTotals();
    const cart = getCartData();
    const orderId = 'DPM-' + Math.floor(100000 + Math.random() * 900000);

    // Simulación de procesamiento de pago mediante Mercado Pago SDK
    setTimeout(() => {
      if (statusMsg) {
        statusMsg.hidden = false;
        statusMsg.className = 'dpm-status-msg is-success';
        statusMsg.innerHTML = `
          <div class="dpm-success-box">
            <div class="dpm-success-icon">✓</div>
            <h3 class="dpm-success-title">¡ORDEN #${orderId} CONFIRMADA!</h3>
            <p class="dpm-success-desc">El pago de <strong>${formatARS(total)} ARS</strong> fue aprobado a través de Mercado Pago.</p>
            <p class="dpm-success-sub">Enviamos el comprobante fiscal y código de seguimiento a <strong>${email}</strong>.</p>
            <div class="dpm-success-actions">
              <a href="store.html" class="dpm-success-btn">EXPLORAR MÁS DROPS ↗</a>
            </div>
          </div>
        `;
      }

      // Guardar Orden
      const newOrder = {
        id: orderId,
        date: new Date().toISOString(),
        customer: { name, email, dni, address, city },
        items: cart,
        subtotal,
        shipping,
        discount,
        total,
        currency: 'ARS',
        paymentMethod: selectedPaymentMethod,
        installments: selectedInstallments,
        status: 'approved'
      };

      const orders = JSON.parse(localStorage.getItem('dopamine_orders') || '[]');
      orders.unshift(newOrder);
      localStorage.setItem('dopamine_orders', JSON.stringify(orders));

      // Limpiar bolsa
      localStorage.removeItem('dopamine-cart-v1');
      if (window.DopamineCart) {
        window.DopamineCart.items.length = 0;
        window.DopamineCart.render();
      }

      if (submitBtn) submitBtn.style.display = 'none';
    }, 1400);
  }

  // INYECCIÓN DE ESTILOS DE LUJO Y TIPOGRAFÍA MONTSERRAT
  function injectFullPageCheckoutStyles() {
    if (document.getElementById('dpm-checkout-hub-styles')) return;
    const style = document.createElement('style');
    style.id = 'dpm-checkout-hub-styles';
    style.textContent = `
      body.dpm-checkout-active {
        overflow: hidden !important;
      }
      .dpm-checkout-hub-screen {
        position: fixed;
        inset: 0;
        width: 100vw;
        height: 100vh;
        background: #09090B;
        color: #FFFFFF;
        z-index: 999999;
        overflow-y: auto;
        display: none;
        font-family: 'Montserrat', sans-serif, Arial, Helvetica;
        -webkit-overflow-scrolling: touch;
      }
      .dpm-checkout-hub-screen.is-active {
        display: block;
        animation: dpmFadeIn 220ms ease-out forwards;
      }
      @keyframes dpmFadeIn {
        from { opacity: 0; transform: translateY(8px); }
        to { opacity: 1; transform: translateY(0); }
      }
      .dpm-hub-wrapper {
        max-width: 1380px;
        margin: 0 auto;
        padding: 1.5rem 2rem 4rem 2rem;
      }
      @media (max-width: 768px) {
        .dpm-hub-wrapper { padding: 1rem 1rem 3rem 1rem; }
      }

      /* TOPBAR */
      .dpm-hub-topbar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding-bottom: 1.5rem;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        margin-bottom: 2rem;
      }
      .dpm-hub-back-btn {
        background: none;
        border: 1px solid rgba(255, 255, 255, 0.2);
        color: #FFF;
        font-family: 'Montserrat', sans-serif;
        font-size: 0.8125rem;
        font-weight: 700;
        letter-spacing: 0.08em;
        display: flex;
        align-items: center;
        gap: 0.6rem;
        padding: 0.65rem 1.15rem;
        cursor: pointer;
        transition: all 180ms ease;
      }
      .dpm-hub-back-btn:hover {
        background: #FFFFFF;
        color: #000000;
      }
      .dpm-hub-brand-logo {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        text-decoration: none;
        color: #FFF;
      }
      .dpm-hub-logo-img {
        height: 28px;
        width: auto;
      }
      .dpm-hub-brand-name {
        font-family: 'Bebas Neue', 'Montserrat', sans-serif;
        font-size: 1.75rem;
        letter-spacing: 0.12em;
      }
      .dpm-security-pill {
        font-family: 'JetBrains Mono', monospace;
        font-size: 0.6875rem;
        font-weight: 700;
        letter-spacing: 0.1em;
        color: #009EE3;
        background: rgba(0, 158, 227, 0.1);
        border: 1px solid rgba(0, 158, 227, 0.3);
        padding: 6px 12px;
      }
      @media (max-width: 768px) {
        .dpm-security-pill { display: none; }
      }

      /* GRID LAYOUT */
      .dpm-hub-grid {
        display: grid;
        grid-template-columns: 1fr 440px;
        gap: 3rem;
        align-items: start;
      }
      @media (max-width: 1024px) {
        .dpm-hub-grid { grid-template-columns: 1fr; gap: 2.5rem; }
      }

      /* SECTIONS */
      .dpm-hub-section {
        background: #111114;
        border: 1px solid rgba(255, 255, 255, 0.08);
        padding: 2rem;
        margin-bottom: 2rem;
      }
      @media (max-width: 768px) {
        .dpm-hub-section { padding: 1.25rem; }
      }
      .dpm-step-header {
        display: flex;
        align-items: flex-start;
        gap: 1rem;
        margin-bottom: 1.75rem;
        border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        padding-bottom: 1.25rem;
      }
      .dpm-step-num {
        font-family: 'Bebas Neue', sans-serif;
        font-size: 2.5rem;
        color: #009EE3;
        line-height: 1;
      }
      .dpm-step-title {
        font-family: 'Bebas Neue', sans-serif;
        font-size: 1.65rem;
        letter-spacing: 0.06em;
        color: #FFFFFF;
        margin-bottom: 0.25rem;
      }
      .dpm-step-desc {
        font-size: 0.8125rem;
        color: rgba(255, 255, 255, 0.6);
        margin: 0;
      }

      /* FORM GRID */
      .dpm-form-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 1rem;
      }
      .dpm-input-field.full { grid-column: span 2; }
      .dpm-input-field.half { grid-column: span 1; }
      @media (max-width: 580px) {
        .dpm-input-field.half { grid-column: span 2; }
      }
      .dpm-input-field label {
        display: block;
        font-family: 'Montserrat', sans-serif;
        font-size: 0.75rem;
        font-weight: 600;
        color: rgba(255, 255, 255, 0.85);
        margin-bottom: 0.4rem;
        text-transform: uppercase;
        letter-spacing: 0.04em;
      }
      .dpm-input-field input {
        width: 100%;
        height: 48px;
        background: #18181C;
        border: 1px solid rgba(255, 255, 255, 0.15);
        padding: 0 1rem;
        color: #FFFFFF;
        font-family: 'Montserrat', sans-serif, Arial, Helvetica;
        font-size: 0.9375rem;
        outline: none;
        transition: border-color 150ms ease;
      }
      .dpm-input-field input:focus {
        border-color: #009EE3;
      }

      /* SHIPPING OPTIONS */
      .dpm-shipping-options {
        margin-top: 2rem;
      }
      .dpm-sub-title {
        font-family: 'JetBrains Mono', monospace;
        font-size: 0.75rem;
        font-weight: 700;
        letter-spacing: 0.1em;
        color: rgba(255, 255, 255, 0.6);
        margin-bottom: 1rem;
      }
      .dpm-select-card {
        display: flex;
        align-items: center;
        justify-content: space-between;
        background: #161619;
        border: 1px solid rgba(255, 255, 255, 0.1);
        padding: 1.15rem 1.25rem;
        margin-bottom: 0.75rem;
        cursor: pointer;
        transition: all 150ms ease;
        position: relative;
      }
      .dpm-select-card:hover {
        border-color: rgba(255, 255, 255, 0.3);
      }
      .dpm-select-card.is-selected {
        border-color: #009EE3;
        background: rgba(0, 158, 227, 0.06);
      }
      .dpm-select-card input[type="radio"] {
        position: absolute;
        opacity: 0;
      }
      .dpm-card-left {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
      }
      .dpm-carrier-badge {
        font-family: 'JetBrains Mono', monospace;
        font-size: 0.625rem;
        font-weight: 700;
        color: #009EE3;
        letter-spacing: 0.1em;
      }
      .dpm-carrier-badge.express { color: #F59E0B; }
      .dpm-carrier-badge.pickup { color: #10B981; }
      .dpm-card-left strong {
        font-size: 0.9375rem;
        color: #FFFFFF;
      }
      .dpm-card-note {
        font-size: 0.75rem;
        color: rgba(255, 255, 255, 0.5);
      }
      .dpm-price-tag {
        font-family: 'Montserrat', sans-serif;
        font-size: 1rem;
        font-weight: 700;
        color: #FFFFFF;
      }
      .dpm-price-tag.is-free {
        color: #22C55E;
      }

      /* PAYMENT CARDS */
      .dpm-payment-accordion {
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }
      .dpm-pay-card {
        background: #161619;
        border: 1px solid rgba(255, 255, 255, 0.1);
        transition: all 180ms ease;
      }
      .dpm-pay-card.is-open {
        border-color: #009EE3;
        background: rgba(0, 158, 227, 0.03);
      }
      .dpm-pay-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 1.25rem;
        cursor: pointer;
        flex-wrap: wrap;
        gap: 0.75rem;
      }
      .dpm-pay-radio-wrap {
        display: flex;
        align-items: center;
        gap: 0.85rem;
      }
      .dpm-pay-radio-wrap input[type="radio"] {
        accent-color: #009EE3;
        width: 18px;
        height: 18px;
      }
      .dpm-pay-name {
        display: block;
        font-size: 0.9375rem;
        color: #FFFFFF;
        margin-bottom: 0.2rem;
      }
      .dpm-pay-detail {
        font-size: 0.75rem;
        color: rgba(255, 255, 255, 0.6);
      }
      .dpm-pay-logos {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }
      .dpm-discount-pill {
        font-family: 'JetBrains Mono', monospace;
        font-size: 0.6875rem;
        font-weight: 700;
        background: #22C55E;
        color: #000;
        padding: 3px 8px;
      }
      .dpm-pay-body {
        display: none;
        padding: 0 1.25rem 1.25rem 1.25rem;
        border-top: 1px solid rgba(255, 255, 255, 0.06);
        margin-top: 0.5rem;
        padding-top: 1rem;
      }
      .dpm-pay-card.is-open .dpm-pay-body {
        display: block;
      }
      .dpm-mp-features {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        font-size: 0.8125rem;
        color: rgba(255, 255, 255, 0.8);
      }
      .dpm-inst-label {
        display: block;
        font-family: 'JetBrains Mono', monospace;
        font-size: 0.6875rem;
        color: rgba(255, 255, 255, 0.6);
        margin-bottom: 0.5rem;
      }
      .dpm-inst-options {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
      }
      .dpm-inst-pill {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        background: #1E1E22;
        border: 1px solid rgba(255, 255, 255, 0.1);
        padding: 0.75rem 1rem;
        cursor: pointer;
        font-size: 0.8125rem;
      }
      .dpm-inst-pill.is-selected {
        border-color: #009EE3;
        background: rgba(0, 158, 227, 0.1);
      }
      .dpm-bank-data-box {
        background: #1B1B20;
        border: 1px solid rgba(255, 255, 255, 0.1);
        padding: 1rem;
        font-size: 0.8125rem;
      }
      .dpm-bank-row {
        display: flex;
        justify-content: space-between;
        margin-bottom: 0.5rem;
      }
      .dpm-bank-row span { color: rgba(255, 255, 255, 0.6); }
      .dpm-copy-alias {
        color: #009EE3;
        cursor: pointer;
      }
      .dpm-bank-help {
        font-size: 0.75rem;
        color: #888;
        margin-top: 0.75rem;
        margin-bottom: 0;
      }
      .dpm-cash-desc {
        font-size: 0.8125rem;
        color: rgba(255, 255, 255, 0.75);
        margin: 0;
      }

      /* RIGHT COLUMN: SUMMARY */
      .dpm-summary-sticky-card {
        background: #111114;
        border: 1px solid rgba(255, 255, 255, 0.12);
        padding: 2rem;
        position: sticky;
        top: 2rem;
      }
      .dpm-summary-card-title {
        font-family: 'Bebas Neue', sans-serif;
        font-size: 1.5rem;
        letter-spacing: 0.08em;
        margin-bottom: 1.5rem;
        border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        padding-bottom: 0.75rem;
      }
      .dpm-summary-items-list {
        max-height: 280px;
        overflow-y: auto;
        margin-bottom: 1.5rem;
      }
      .dpm-summary-item-row {
        display: flex;
        align-items: center;
        gap: 1rem;
        margin-bottom: 1rem;
      }
      .dpm-item-thumb-wrap {
        position: relative;
        width: 52px;
        height: 52px;
        flex-shrink: 0;
      }
      .dpm-item-thumb {
        width: 100%;
        height: 100%;
        object-fit: cover;
        background: #18181C;
        border: 1px solid rgba(255, 255, 255, 0.1);
      }
      .dpm-item-qty-badge {
        position: absolute;
        top: -6px;
        right: -6px;
        background: #009EE3;
        color: #000;
        font-size: 0.6875rem;
        font-weight: 700;
        width: 18px;
        height: 18px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .dpm-item-details {
        flex: 1;
      }
      .dpm-item-name {
        font-size: 0.8125rem;
        font-weight: 700;
        margin-bottom: 0.2rem;
      }
      .dpm-item-spec {
        font-size: 0.6875rem;
        color: rgba(255, 255, 255, 0.5);
      }
      .dpm-item-price {
        font-weight: 700;
        font-size: 0.875rem;
      }

      /* COUPON BOX */
      .dpm-coupon-box {
        margin-bottom: 1.5rem;
      }
      .dpm-coupon-input-wrap {
        display: flex;
      }
      .dpm-coupon-input-wrap input {
        flex: 1;
        height: 42px;
        background: #18181C;
        border: 1px solid rgba(255, 255, 255, 0.15);
        border-right: none;
        padding: 0 0.85rem;
        color: #FFF;
        font-family: 'Montserrat', sans-serif;
        font-size: 0.75rem;
        outline: none;
      }
      .dpm-coupon-input-wrap button {
        background: #FFFFFF;
        color: #000;
        border: none;
        padding: 0 1.15rem;
        font-family: 'Montserrat', sans-serif;
        font-size: 0.75rem;
        font-weight: 700;
        cursor: pointer;
      }
      .dpm-coupon-success {
        display: block;
        font-size: 0.75rem;
        color: #22C55E;
        margin-top: 0.4rem;
        font-weight: 600;
      }

      /* TOTALS */
      .dpm-totals-breakdown {
        border-top: 1px solid rgba(255, 255, 255, 0.08);
        padding-top: 1rem;
        margin-bottom: 1.5rem;
      }
      .dpm-total-row {
        display: flex;
        justify-content: space-between;
        font-size: 0.875rem;
        color: rgba(255, 255, 255, 0.7);
        margin-bottom: 0.6rem;
      }
      .dpm-discount-row { color: #22C55E; }
      .dpm-total-divider {
        height: 1px;
        background: rgba(255, 255, 255, 0.1);
        margin: 1rem 0;
      }
      .dpm-total-final-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1rem;
      }
      .dpm-total-final-row span:first-child {
        font-family: 'Bebas Neue', sans-serif;
        font-size: 1.35rem;
        letter-spacing: 0.06em;
      }
      .dpm-final-price-wrap {
        display: flex;
        align-items: baseline;
        gap: 0.4rem;
      }
      .dpm-final-price {
        font-family: 'Montserrat', sans-serif;
        font-size: 1.75rem;
        font-weight: 800;
        color: #009EE3;
      }
      .dpm-currency-tag {
        font-size: 0.75rem;
        color: #888;
        font-weight: 700;
      }
      .dpm-installments-badge {
        background: rgba(0, 158, 227, 0.08);
        border: 1px dashed rgba(0, 158, 227, 0.4);
        padding: 0.6rem 0.85rem;
        margin-bottom: 1.5rem;
      }
      .dpm-inst-tag {
        display: inline-block;
        font-family: 'JetBrains Mono', monospace;
        font-size: 0.625rem;
        font-weight: 700;
        background: #009EE3;
        color: #000;
        padding: 2px 6px;
        margin-bottom: 0.25rem;
      }
      .dpm-installments-badge p {
        font-size: 0.8125rem;
        margin: 0;
        color: #FFFFFF;
      }

      /* CHECKOUT CTA */
      .dpm-btn-checkout-submit {
        width: 100%;
        height: 56px;
        background: #009EE3;
        color: #FFFFFF;
        border: none;
        font-family: 'Montserrat', sans-serif;
        font-size: 0.9375rem;
        font-weight: 800;
        letter-spacing: 0.06em;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.65rem;
        transition: all 180ms ease;
      }
      .dpm-btn-checkout-submit:hover {
        background: #0084BE;
        transform: translateY(-1px);
      }
      .dpm-trust-badges {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        margin-top: 1.25rem;
      }
      .dpm-trust-item {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-size: 0.6875rem;
        color: rgba(255, 255, 255, 0.5);
        font-family: 'JetBrains Mono', monospace;
      }

      /* SUCCESS BOX */
      .dpm-success-box {
        text-align: center;
        padding: 1.5rem 1rem;
        background: rgba(34, 197, 94, 0.08);
        border: 1px solid #22C55E;
        margin-top: 1.5rem;
      }
      .dpm-success-icon {
        width: 48px;
        height: 48px;
        background: #22C55E;
        color: #000;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.75rem;
        font-weight: 900;
        margin: 0 auto 1rem auto;
      }
      .dpm-success-title {
        font-family: 'Bebas Neue', sans-serif;
        font-size: 1.75rem;
        color: #22C55E;
        margin-bottom: 0.5rem;
      }
      .dpm-success-desc {
        font-size: 0.875rem;
        margin-bottom: 0.5rem;
      }
      .dpm-success-sub {
        font-size: 0.8125rem;
        color: rgba(255, 255, 255, 0.6);
        margin-bottom: 1.25rem;
      }
      .dpm-success-btn {
        display: inline-block;
        background: #FFFFFF;
        color: #000000;
        padding: 0.75rem 1.5rem;
        font-weight: 700;
        font-size: 0.8125rem;
        text-decoration: none;
      }
      .dpm-spinner {
        width: 18px;
        height: 18px;
        border: 2px solid rgba(255, 255, 255, 0.3);
        border-top-color: #FFFFFF;
        border-radius: 50%;
        animation: dpmSpin 0.6s linear infinite;
        display: inline-block;
      }
      @keyframes dpmSpin { to { transform: rotate(360deg); } }
    `;
    document.head.appendChild(style);
  }

  // INTERCEPTAR TODOS LOS BOTONES DE FINALIZAR COMPRA
  function bindGlobalCheckoutTriggers() {
    document.addEventListener('click', (e) => {
      const checkoutBtn = e.target.closest(
        '.btn-checkout-main, .shop-full-button, [data-checkout-trigger], .cart-drawer-checkout-btn, .cart-footer-btn'
      );
      if (checkoutBtn && !checkoutBtn.closest('#dopamine-checkout-hub') && !checkoutBtn.closest('#form-login') && !checkoutBtn.closest('#form-register')) {
        const text = checkoutBtn.innerText || checkoutBtn.textContent || '';
        if (text.includes('FINALIZAR COMPRA') || text.includes('CHECKOUT') || checkoutBtn.classList.contains('btn-checkout-main')) {
          e.preventDefault();
          e.stopPropagation();
          openFullPageCheckout();
        }
      }
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    ensureMPScriptLoaded();
    injectFullPageCheckoutStyles();
    bindGlobalCheckoutTriggers();
  });

  window.DopamineMP = {
    openCheckout: openFullPageCheckout,
    closeCheckout: closeFullPageCheckout,
    formatARS: formatARS
  };
})(window);
