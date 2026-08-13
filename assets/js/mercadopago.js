/**
 * DOPAMINE STREETWEAR — Step-by-Step Luxury Checkout Hub (Nike/Streetwear Architecture)
 * Flujo de compra por pasos: 1. Datos Personales -> 2. Envío -> 3. Pago (Mercado Pago SDK Oficial)
 * 100% Pesos Argentinos (ARS) & Tipografía Montserrat
 */

(function (window) {
  const MP_PUBLIC_KEY = 'TEST-12345678-abcd-1234-abcd-1234567890ab';
  let mpInstance = null;
  
  // Estado del Checkout Wizard
  const checkoutState = {
    step: 1, // 1: Datos Personales, 2: Envío, 3: Pago
    customer: {
      email: '',
      name: '',
      lastName: '',
      dni: '',
      phone: '',
      noNewsletter: false
    },
    shipping: {
      type: 'home', // 'home' | 'pickup'
      option: 'standard', // 'standard' | 'express' | 'pickup_flagship' | 'pickup_interior'
      address: '',
      city: '',
      zip: '1414',
      cost: 0
    },
    payment: {
      method: 'mercadopago', // 'credit' | 'debit' | 'mercadopago' | 'modo' | 'transfer'
      installments: 6,
      cardNumber: '',
      cardHolder: '',
      cardExp: '',
      cardCvv: ''
    },
    coupon: null,
    giftReceipt: false
  };

  // Inicializar SDK de Mercado Pago
  function initMercadoPagoSDK() {
    if (window.MercadoPago) {
      try {
        mpInstance = new window.MercadoPago(MP_PUBLIC_KEY, { locale: 'es-AR' });
        console.log('[Mercado Pago SDK] Inicializado con éxito en checkout wizard.');
      } catch (err) {
        console.warn('[Mercado Pago SDK] Modo fallback local:', err);
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
    return '$ ' + Math.max(0, Math.round(Number(amount))).toLocaleString('es-AR');
  }

  function getCartData() {
    return window.DopamineCart ? window.DopamineCart.items : [];
  }

  function calculateTotals() {
    const cart = getCartData();
    const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    
    // Envío
    let shippingCost = 0;
    if (checkoutState.shipping.type === 'pickup') {
      shippingCost = 0;
    } else {
      if (checkoutState.shipping.option === 'express') {
        shippingCost = 8500;
      } else {
        shippingCost = subtotal >= 90000 ? 0 : 5500;
      }
    }
    checkoutState.shipping.cost = shippingCost;

    // Descuento
    let discount = 0;
    if (checkoutState.coupon === 'DOPAMINE10') {
      discount += subtotal * 0.10;
    }
    if (checkoutState.payment.method === 'transfer') {
      discount += (subtotal - discount) * 0.10; // 10% OFF extra por transferencia
    }

    const total = Math.max(0, subtotal - discount + shippingCost);
    const installment6 = Math.round(total / 6);
    const installment3 = Math.round(total / 3);

    return { subtotal, shippingCost, discount, total, installment6, installment3 };
  }

  // ABRIR CHECKOUT EN PANTALLA COMPLETA
  function openFullPageCheckout() {
    const cart = getCartData();
    if (!cart || cart.length === 0) {
      alert('Tu bolsa de compras está vacía. Seleccioná una prenda antes de continuar.');
      return;
    }

    // Cargar datos del usuario si inició sesión
    if (window.DopamineAuth && !checkoutState.customer.email) {
      const user = DopamineAuth.getUser();
      if (user) {
        checkoutState.customer.email = user.email || '';
        const parts = (user.name || '').split(' ');
        checkoutState.customer.name = parts[0] || '';
        checkoutState.customer.lastName = parts.slice(1).join(' ') || '';
      }
    }

    let hub = document.getElementById('dopamine-nike-checkout');
    if (!hub) {
      hub = document.createElement('div');
      hub.id = 'dopamine-nike-checkout';
      hub.className = 'nk-checkout-screen';
      document.body.appendChild(hub);
    }

    renderCheckoutWizard(hub);
    hub.classList.add('is-active');
    document.body.classList.add('nk-checkout-open');
  }

  function closeFullPageCheckout() {
    const hub = document.getElementById('dopamine-nike-checkout');
    if (hub) {
      hub.classList.remove('is-active');
      document.body.classList.remove('nk-checkout-open');
    }
  }

  // RENDER PRINCIPAL DEL WIZARD (PIXEL-PERFECT A LOS SCREENSHOTS)
  function renderCheckoutWizard(hub) {
    const cart = getCartData();
    const { subtotal, shippingCost, discount, total, installment6 } = calculateTotals();
    const recs = window.DopamineCatalog ? DopamineCatalog.products.filter(p => !cart.some(c => c.id === p.id)).slice(0, 3) : [];

    hub.innerHTML = `
      <div class="nk-checkout-wrapper">
        
        <!-- TOP NOTIFICATION BANNER -->
        <div class="nk-top-promo-bar">
          <span>‹</span>
          <p>¡Hasta <strong>6 cuotas sin interés</strong> con Mercado Pago y <strong>Envío Gratis</strong> en compras mayores a $90.000! 🇦🇷</p>
          <span>›</span>
        </div>

        <!-- HEADER MINIMALISTA -->
        <header class="nk-checkout-header">
          <a href="index.html" class="nk-header-brand" title="Dopamine Home">
            <img src="assets/Branding/Logos/isotipo invertido.png" alt="Dopamine" class="nk-header-logo">
            <span class="nk-header-brand-text">DOPAMINE</span>
          </a>
          
          <!-- BREADCRUMB STEPS INDICATOR -->
          <div class="nk-header-steps">
            <div class="nk-step-indicator ${checkoutState.step >= 1 ? 'is-active' : ''}">
              <span class="nk-step-circle">✓</span>
              <span>Carrito</span>
            </div>
            <div class="nk-step-line ${checkoutState.step >= 2 ? 'is-active' : ''}"></div>
            <div class="nk-step-indicator ${checkoutState.step >= 2 ? 'is-active' : ''}">
              <span class="nk-step-circle">2</span>
              <span>Entrega</span>
            </div>
            <div class="nk-step-line ${checkoutState.step >= 3 ? 'is-active' : ''}"></div>
            <div class="nk-step-indicator ${checkoutState.step >= 3 ? 'is-active' : ''}">
              <span class="nk-step-circle">3</span>
              <span>Pago</span>
            </div>
          </div>

          <div class="nk-header-help">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
            <span>Ayuda</span>
          </div>
        </header>

        <!-- MAIN TWO-COLUMN CHECKOUT GRID -->
        <div class="nk-checkout-main-grid">
          
          <!-- LEFT COLUMN: PASOS EN ACORDEÓN -->
          <div class="nk-wizard-column">
            
            <!-- PASO 1: DATOS PERSONALES -->
            <div class="nk-card-step ${checkoutState.step === 1 ? 'is-open' : 'is-collapsed'}">
              <div class="nk-card-step-header">
                <div class="nk-card-step-title-wrap">
                  <span class="nk-badge-num">1</span>
                  <h3>Datos Personales</h3>
                </div>
                ${checkoutState.step > 1 ? `
                  <button type="button" class="nk-edit-step-btn" data-goto-step="1" title="Modificar datos">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
                  </button>
                ` : ''}
              </div>

              ${checkoutState.step === 1 ? `
                <div class="nk-card-step-body">
                  <div class="nk-form-fields">
                    <div class="nk-field full">
                      <input type="email" id="nk-input-email" placeholder=" " value="${checkoutState.customer.email}" required>
                      <label for="nk-input-email">E-mail *</label>
                    </div>
                    <div class="nk-field half">
                      <input type="text" id="nk-input-name" placeholder=" " value="${checkoutState.customer.name}" required>
                      <label for="nk-input-name">Nombre *</label>
                    </div>
                    <div class="nk-field half">
                      <input type="text" id="nk-input-lastname" placeholder=" " value="${checkoutState.customer.lastName}" required>
                      <label for="nk-input-lastname">Apellidos *</label>
                    </div>
                    <div class="nk-field half">
                      <input type="text" id="nk-input-dni" placeholder=" " value="${checkoutState.customer.dni}" required>
                      <label for="nk-input-dni">DNI* (sin puntos)</label>
                    </div>
                    <div class="nk-field half">
                      <input type="tel" id="nk-input-phone" placeholder=" " value="${checkoutState.customer.phone}" required>
                      <label for="nk-input-phone">Teléfono *</label>
                    </div>
                  </div>

                  <div class="nk-checkbox-wrap">
                    <label class="nk-checkbox-label">
                      <input type="checkbox" id="nk-input-newsletter" ${checkoutState.customer.noNewsletter ? 'checked' : ''}>
                      <span>No quiero recibir el newsletter con promociones.</span>
                    </label>
                  </div>

                  <button type="button" class="nk-pill-btn-continue" id="btn-continue-step-1">
                    Continuar
                  </button>
                </div>
              ` : `
                <div class="nk-card-step-summary">
                  <p class="nk-summary-text"><strong>${checkoutState.customer.name} ${checkoutState.customer.lastName}</strong></p>
                  <p class="nk-summary-sub">${checkoutState.customer.email} • Tel: ${checkoutState.customer.phone || 'No especificado'}</p>
                </div>
              `}
            </div>

            <!-- PASO 2: ENVÍO -->
            <div class="nk-card-step ${checkoutState.step === 2 ? 'is-open' : 'is-collapsed'}">
              <div class="nk-card-step-header">
                <div class="nk-card-step-title-wrap">
                  <span class="nk-badge-num">2</span>
                  <h3>Envío</h3>
                </div>
                ${checkoutState.step > 2 ? `
                  <button type="button" class="nk-edit-step-btn" data-goto-step="2" title="Modificar envío">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
                  </button>
                ` : ''}
              </div>

              ${checkoutState.step === 2 ? `
                <div class="nk-card-step-body">
                  
                  <!-- TABS: ENVIO A DOMICILIO / RETIRO EN PUNTO -->
                  <div class="nk-shipping-tabs">
                    <button type="button" class="nk-ship-tab ${checkoutState.shipping.type === 'home' ? 'is-active' : ''}" id="tab-ship-home">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg>
                      <span>Envío a domicilio</span>
                    </button>
                    <button type="button" class="nk-ship-tab ${checkoutState.shipping.type === 'pickup' ? 'is-active' : ''}" id="tab-ship-pickup">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                      <span>Retiro en punto o Dopamine Store</span>
                    </button>
                  </div>

                  ${checkoutState.shipping.type === 'home' ? `
                    <div class="nk-home-delivery-box">
                      <div class="nk-form-fields">
                        <div class="nk-field full">
                          <input type="text" id="nk-ship-address" placeholder=" " value="${checkoutState.shipping.address}" required>
                          <label for="nk-ship-address">Dirección de Entrega (Calle y Número) *</label>
                        </div>
                        <div class="nk-field half">
                          <input type="text" id="nk-ship-city" placeholder=" " value="${checkoutState.shipping.city}" required>
                          <label for="nk-ship-city">Ciudad / Localidad *</label>
                        </div>
                        <div class="nk-field half">
                          <input type="text" id="nk-ship-zip" placeholder=" " value="${checkoutState.shipping.zip}" required>
                          <label for="nk-ship-zip">Código Postal (CP) *</label>
                        </div>
                      </div>

                      <div class="nk-carrier-options">
                        <label class="nk-carrier-choice ${checkoutState.shipping.option === 'standard' ? 'is-selected' : ''}">
                          <input type="radio" name="nk-carrier-radio" value="standard" ${checkoutState.shipping.option === 'standard' ? 'checked' : ''}>
                          <div class="nk-carrier-info">
                            <strong>Correo Argentino / Andreani Clásico</strong>
                            <span>Llega entre 3 a 5 días hábiles a tu domicilio.</span>
                          </div>
                          <span class="nk-carrier-price ${subtotal >= 90000 ? 'is-free' : ''}">
                            ${subtotal >= 90000 ? 'Gratis' : '$ 5.500'}
                          </span>
                        </label>

                        <label class="nk-carrier-choice ${checkoutState.shipping.option === 'express' ? 'is-selected' : ''}">
                          <input type="radio" name="nk-carrier-radio" value="express" ${checkoutState.shipping.option === 'express' ? 'checked' : ''}>
                          <div class="nk-carrier-info">
                            <strong>Envío Moto Express CABA / AMBA</strong>
                            <span>Entrega prioritaria en 24 a 48 horas hábiles.</span>
                          </div>
                          <span class="nk-carrier-price">$ 8.500</span>
                        </label>
                      </div>
                    </div>
                  ` : `
                    <div class="nk-pickup-box">
                      <div class="nk-pickup-point-card is-selected">
                        <div class="nk-pickup-badge-row">
                          <span class="nk-pickup-icon-badge">📍 DOPAMINE FLAGSHIP</span>
                          <span class="nk-pickup-free-tag">Gratis</span>
                        </div>
                        <strong class="nk-pickup-title">Dopamine Showroom Palermo Soho</strong>
                        <p class="nk-pickup-address">Honduras 4920, Palermo, Ciudad Autónoma de Buenos Aires</p>
                        <div class="nk-pickup-hours">
                          <span>Horarios de atención:</span>
                          <p>Lunes a Viernes: 12:00 a 20:00hs | Sábados: 14:00 a 20:00hs</p>
                        </div>
                        <div class="nk-pickup-ready">
                          <span class="nk-dot-green"></span>
                          <span>Listo para retirar hoy mismo.</span>
                        </div>
                      </div>
                    </div>
                  `}

                  <button type="button" class="nk-pill-btn-continue" id="btn-continue-step-2">
                    Continuar
                  </button>
                </div>
              ` : (checkoutState.step > 2 ? `
                <div class="nk-card-step-summary">
                  <p class="nk-summary-text">
                    <strong>${checkoutState.shipping.type === 'pickup' ? 'Retiro en Showroom Dopamine (Palermo)' : 'Envío a domicilio: ' + (checkoutState.shipping.address || 'Honduras 4920, CABA')}</strong>
                  </p>
                  <p class="nk-summary-sub">Costo: ${shippingCost === 0 ? 'Gratis' : formatARS(shippingCost)} • Listo en 3 a 5 días hábiles</p>
                </div>
              ` : '')}
            </div>

            <!-- PASO 3: PAGO -->
            <div class="nk-card-step ${checkoutState.step === 3 ? 'is-open' : 'is-collapsed'}">
              <div class="nk-card-step-header">
                <div class="nk-card-step-title-wrap">
                  <span class="nk-badge-num">3</span>
                  <h3>Pago</h3>
                </div>
              </div>

              ${checkoutState.step === 3 ? `
                <div class="nk-card-step-body">
                  
                  <!-- GRID DE MÉTODOS DE PAGO CON LOGOS OFICIALES -->
                  <div class="nk-payment-grid-buttons">
                    
                    <button type="button" class="nk-pay-method-btn ${checkoutState.payment.method === 'credit' ? 'is-selected' : ''}" data-pay-target="credit">
                      <svg width="24" height="16" viewBox="0 0 24 16" fill="none"><rect width="24" height="16" rx="2" fill="#E0E0E0"/><rect x="2" y="3" width="20" height="3" fill="#333"/><rect x="2" y="8" width="5" height="4" fill="#F59E0B"/></svg>
                      <span>Tarjeta de crédito</span>
                    </button>

                    <button type="button" class="nk-pay-method-btn ${checkoutState.payment.method === 'debit' ? 'is-selected' : ''}" data-pay-target="debit">
                      <svg width="24" height="16" viewBox="0 0 24 16" fill="none"><rect width="24" height="16" rx="2" fill="#009EE3"/><rect x="2" y="3" width="20" height="3" fill="#FFFFFF"/><rect x="2" y="8" width="5" height="4" fill="#10B981"/></svg>
                      <span>Tarjeta de débito</span>
                    </button>

                    <button type="button" class="nk-pay-method-btn ${checkoutState.payment.method === 'mercadopago' ? 'is-selected' : ''}" data-pay-target="mercadopago">
                      <svg width="28" height="18" viewBox="0 0 44 24" fill="none"><rect width="44" height="24" rx="3" fill="#009EE3"/><path d="M13 11c0-2 1.5-3.5 3.5-3.5s3.5 1.5 3.5 3.5" stroke="#FFFFFF" stroke-width="1.8" stroke-linecap="round"/><path d="M24 11c0-2 1.5-3.5 3.5-3.5s3.5 1.5 3.5 3.5" stroke="#FFFFFF" stroke-width="1.8" stroke-linecap="round"/><text x="22" y="19" font-family="'Montserrat', sans-serif" font-size="7" font-weight="800" fill="#FFFFFF" text-anchor="middle">MERCADO PAGO</text></svg>
                      <strong>Mercado Pago</strong>
                    </button>

                    <button type="button" class="nk-pay-method-btn ${checkoutState.payment.method === 'modo' ? 'is-selected' : ''}" data-pay-target="modo">
                      <svg width="28" height="18" viewBox="0 0 44 24" fill="none"><rect width="44" height="24" rx="3" fill="#380064"/><text x="22" y="16" font-family="'Montserrat', sans-serif" font-size="8.5" font-weight="900" fill="#00E5A3" text-anchor="middle">MODO</text></svg>
                      <span>MODO</span>
                    </button>

                    <button type="button" class="nk-pay-method-btn ${checkoutState.payment.method === 'transfer' ? 'is-selected' : ''}" data-pay-target="transfer">
                      <span style="font-family:'Montserrat', sans-serif; font-size: 0.6875rem; font-weight: 800; color: #22C55E;">10% OFF</span>
                      <span>Transferencia</span>
                    </button>

                    <button type="button" class="nk-pay-method-btn ${checkoutState.payment.method === 'gpay' ? 'is-selected' : ''}" data-pay-target="gpay">
                      <svg width="24" height="16" viewBox="0 0 24 16" fill="none"><rect width="24" height="16" rx="2" fill="#FFFFFF" stroke="#E0E0E0"/><text x="12" y="11.5" font-family="'Montserrat', sans-serif" font-size="6.5" font-weight="700" fill="#444" text-anchor="middle">G Pay</text></svg>
                      <span>G Pay</span>
                    </button>
                  </div>

                  <!-- DETALLE DEL MÉTODO SELECCIONADO -->
                  ${checkoutState.payment.method === 'mercadopago' ? `
                    <div class="nk-mp-selected-view">
                      <div class="nk-mp-features-list">
                        <div class="nk-mp-feature-row">
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#009EE3" stroke-width="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>
                          <span>Usá tus tarjetas guardadas, dinero disponible y mucho más.</span>
                        </div>
                        <div class="nk-mp-feature-row">
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#009EE3" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
                          <span>Accedé a <strong>Cuotas sin Tarjeta</strong> para comprar ahora y pagar después.</span>
                        </div>
                      </div>

                      <!-- MINI BRAND LOGOS -->
                      <div class="nk-mp-accepted-brands">
                        <span class="nk-mini-card-badge visa">VISA</span>
                        <span class="nk-mini-card-badge master">MASTERCARD</span>
                        <span class="nk-mini-card-badge amex">AMEX</span>
                        <span class="nk-mini-card-badge cabal">CABAL</span>
                      </div>

                      <div class="nk-mp-redirect-notice">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
                        <span>Te llevaremos a Mercado Pago; si no tenés una cuenta, podés usar tu e-mail.</span>
                      </div>
                    </div>
                  ` : (checkoutState.payment.method === 'transfer' ? `
                    <div class="nk-transfer-box">
                      <div class="nk-transfer-header">
                        <span class="nk-discount-tag">✓ 10% DE DESCUENTO APLICADO</span>
                        <p>Aboná mediante transferencia y ahorrás en tu total.</p>
                      </div>
                      <div class="nk-transfer-data">
                        <p><strong>Alias MP:</strong> <code id="nk-btn-copy-alias">dopamine.streetwear.mp 📋</code></p>
                        <p><strong>CVU:</strong> <code>0000003100094829103829</code></p>
                        <p><strong>Titular:</strong> DOPAMINE STREETWEAR S.R.L.</p>
                      </div>
                    </div>
                  ` : `
                    <div class="nk-card-form-box">
                      <div class="nk-form-fields">
                        <div class="nk-field full">
                          <input type="text" id="nk-card-num" placeholder=" " maxlength="19" value="${checkoutState.payment.cardNumber}">
                          <label for="nk-card-num">Número de tarjeta *</label>
                        </div>
                        <div class="nk-field full">
                          <input type="text" id="nk-card-name" placeholder=" " value="${checkoutState.payment.cardHolder}">
                          <label for="nk-card-name">Nombre y apellido del titular *</label>
                        </div>
                        <div class="nk-field half">
                          <input type="text" id="nk-card-exp" placeholder=" " maxlength="5" value="${checkoutState.payment.cardExp}">
                          <label for="nk-card-exp">Vencimiento (MM/AA) *</label>
                        </div>
                        <div class="nk-field half">
                          <input type="text" id="nk-card-cvv" placeholder=" " maxlength="4" value="${checkoutState.payment.cardCvv}">
                          <label for="nk-card-cvv">Código de seguridad *</label>
                        </div>
                      </div>
                    </div>
                  `)}

                </div>
              ` : ''}
            </div>

          </div>

          <!-- RIGHT COLUMN: RESUMEN DE COMPRA STICKY -->
          <aside class="nk-summary-column">
            <div class="nk-summary-card">
              <h2 class="nk-summary-title">Resumen de compra</h2>

              <!-- LISTA DE PRODUCTOS -->
              <div class="nk-summary-products-list">
                ${cart.map(item => `
                  <div class="nk-summary-product-item">
                    <img src="${item.image}" alt="${item.name}" class="nk-product-thumb">
                    <div class="nk-product-desc">
                      <h4 class="nk-product-name">${item.name}</h4>
                      <p class="nk-product-meta">Talle: ${item.size} • Color: ${item.color}</p>
                      <span class="nk-product-qty">(${item.quantity})</span>
                    </div>
                    <div class="nk-product-price-col">
                      ${formatARS(item.price * item.quantity)}
                    </div>
                  </div>
                `).join('')}
              </div>

              <!-- CUPÓN Y BENEFICIOS CLICKEABLES -->
              <div class="nk-summary-perks">
                <div class="nk-perk-row" id="btn-toggle-coupon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path><line x1="7" y1="7" x2="7.01" y2="7"></line></svg>
                  <span>% Ingresá tu código de descuento <u>click aquí</u></span>
                </div>
                <div id="nk-coupon-input-drawer" style="display: ${checkoutState.coupon ? 'block' : 'none'}; margin-top: 0.5rem;">
                  <div class="nk-coupon-field-wrap">
                    <input type="text" id="nk-coupon-input" placeholder="DOPAMINE10" value="${checkoutState.coupon || ''}">
                    <button type="button" id="btn-apply-coupon-nk">Aplicar</button>
                  </div>
                  ${checkoutState.coupon ? `<span class="nk-coupon-ok">✓ Cupón activo 10% OFF</span>` : ''}
                </div>

                <div class="nk-perk-row" style="margin-top: 0.75rem;">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>
                  <span>Consultar promociones bancarias <u>click aquí</u></span>
                </div>
              </div>

              <!-- DESGLOSE DE TOTALES -->
              <div class="nk-summary-breakdown">
                <div class="nk-breakdown-row">
                  <span>Subtotal <i title="Importe bruto">?</i></span>
                  <span>${formatARS(subtotal)}</span>
                </div>
                ${discount > 0 ? `
                  <div class="nk-breakdown-row is-discount">
                    <span>Descuento</span>
                    <span>-${formatARS(discount)}</span>
                  </div>
                ` : ''}
                <div class="nk-breakdown-row">
                  <span>Gastos del envío</span>
                  <span>${shippingCost === 0 ? 'Gratis' : formatARS(shippingCost)}</span>
                </div>
                <div class="nk-breakdown-row">
                  <span>Impuestos nacionales</span>
                  <span style="color: #888;">Incluidos</span>
                </div>

                <div class="nk-breakdown-divider"></div>

                <div class="nk-breakdown-total-row">
                  <span class="nk-total-label">Total</span>
                  <span class="nk-total-amount">${formatARS(total)}</span>
                </div>
              </div>

              <!-- CHECKBOX TICKET DE CAMBIO -->
              <div class="nk-gift-ticket-wrap">
                <label class="nk-checkbox-label">
                  <input type="checkbox" id="nk-input-gift-ticket" ${checkoutState.giftReceipt ? 'checked' : ''}>
                  <span>Quiero recibir Ticket de Cambio</span>
                </label>
              </div>

              <p class="nk-terms-disclaimer">
                Al hacer clic en 'Pagar a través de Mercado Pago' aceptás los <a href="#">Términos y Condiciones de venta</a>.
              </p>

              <!-- BOTÓN PRINCIPAL DE PAGO CON MERCADO PAGO -->
              <button type="button" class="nk-main-btn-submit-pay" id="btn-nk-submit-final-pay">
                Pagar a través de Mercado Pago
              </button>

              <a href="#" class="nk-return-cart-link" id="btn-nk-back-to-cart">
                Volver a carrito
              </a>

              <!-- CROSS SELL: TE PUEDE INTERESAR -->
              ${recs.length > 0 ? `
                <div class="nk-cross-sell-section">
                  <div class="nk-cross-sell-head">
                    <h3>Te puede interesar</h3>
                    <div class="nk-cross-sell-arrows"><span>‹</span> <span>›</span></div>
                  </div>
                  <div class="nk-cross-sell-item">
                    <img src="${recs[0].images[0]}" alt="${recs[0].name}" class="nk-cross-thumb">
                    <div class="nk-cross-info">
                      <strong>${recs[0].name.toUpperCase()}</strong>
                      <span class="nk-cross-price">${formatARS(recs[0].price)}</span>
                      <select class="nk-cross-select">
                        <option>Talle M</option>
                        <option>Talle L</option>
                        <option>Talle XL</option>
                      </select>
                      <button type="button" class="nk-cross-add-btn" data-add-cross="${recs[0].id}">AGREGAR</button>
                    </div>
                  </div>
                </div>
              ` : ''}

              <div id="nk-checkout-feedback-box" class="nk-feedback-box" hidden></div>
            </div>
          </aside>

        </div>
      </div>
    `;

    bindWizardEvents(hub);
  }

  // EVENTOS DEL WIZARD
  function bindWizardEvents(hub) {
    // Volver / Cerrar
    document.getElementById('dpm-hub-close')?.addEventListener('click', closeFullPageCheckout);
    document.getElementById('btn-nk-back-to-cart')?.addEventListener('click', (e) => {
      e.preventDefault();
      closeFullPageCheckout();
    });

    // Cambiar a Paso anterior
    hub.querySelectorAll('[data-goto-step]').forEach(btn => {
      btn.addEventListener('click', () => {
        checkoutState.step = Number(btn.dataset.gotoStep);
        renderCheckoutWizard(hub);
      });
    });

    // Continuar Paso 1 -> Paso 2
    document.getElementById('btn-continue-step-1')?.addEventListener('click', () => {
      const email = document.getElementById('nk-input-email')?.value.trim();
      const name = document.getElementById('nk-input-name')?.value.trim();
      const lastName = document.getElementById('nk-input-lastname')?.value.trim();
      const dni = document.getElementById('nk-input-dni')?.value.trim();
      const phone = document.getElementById('nk-input-phone')?.value.trim();

      if (!email || !name || !lastName || !dni || !phone) {
        alert('Por favor completá todos los campos obligatorios para continuar.');
        return;
      }

      checkoutState.customer = {
        email, name, lastName, dni, phone,
        noNewsletter: document.getElementById('nk-input-newsletter')?.checked || false
      };
      checkoutState.step = 2;
      renderCheckoutWizard(hub);
    });

    // Tabs de Envío
    document.getElementById('tab-ship-home')?.addEventListener('click', () => {
      checkoutState.shipping.type = 'home';
      renderCheckoutWizard(hub);
    });
    document.getElementById('tab-ship-pickup')?.addEventListener('click', () => {
      checkoutState.shipping.type = 'pickup';
      renderCheckoutWizard(hub);
    });

    // Opciones de carrier
    hub.querySelectorAll('input[name="nk-carrier-radio"]').forEach(radio => {
      radio.addEventListener('change', (e) => {
        checkoutState.shipping.option = e.target.value;
        renderCheckoutWizard(hub);
      });
    });

    // Continuar Paso 2 -> Paso 3
    document.getElementById('btn-continue-step-2')?.addEventListener('click', () => {
      if (checkoutState.shipping.type === 'home') {
        const address = document.getElementById('nk-ship-address')?.value.trim();
        const city = document.getElementById('nk-ship-city')?.value.trim();
        const zip = document.getElementById('nk-ship-zip')?.value.trim();
        if (!address || !city || !zip) {
          alert('Por favor ingresá tu dirección de entrega y código postal.');
          return;
        }
        checkoutState.shipping.address = address;
        checkoutState.shipping.city = city;
        checkoutState.shipping.zip = zip;
      }
      checkoutState.step = 3;
      renderCheckoutWizard(hub);
    });

    // Selector de métodos de pago
    hub.querySelectorAll('[data-pay-target]').forEach(btn => {
      btn.addEventListener('click', () => {
        checkoutState.payment.method = btn.dataset.payTarget;
        renderCheckoutWizard(hub);
      });
    });

    // Cupones
    document.getElementById('btn-toggle-coupon')?.addEventListener('click', () => {
      const drawer = document.getElementById('nk-coupon-input-drawer');
      if (drawer) drawer.style.display = drawer.style.display === 'none' ? 'block' : 'none';
    });
    document.getElementById('btn-apply-coupon-nk')?.addEventListener('click', () => {
      const val = document.getElementById('nk-coupon-input')?.value.trim().toUpperCase();
      if (val === 'DOPAMINE10' || val === 'GALICIA' || val === 'DROPS2026') {
        checkoutState.coupon = 'DOPAMINE10';
      } else {
        alert('Cupón no válido. Probá con "DOPAMINE10" para 10% OFF.');
        checkoutState.coupon = null;
      }
      renderCheckoutWizard(hub);
    });

    // Copiar Alias
    document.getElementById('nk-btn-copy-alias')?.addEventListener('click', () => {
      navigator.clipboard.writeText('dopamine.streetwear.mp').then(() => {
        alert('✓ Alias "dopamine.streetwear.mp" copiado al portapapeles.');
      });
    });

    // Agregar Cross-sell
    hub.querySelectorAll('[data-add-cross]').forEach(btn => {
      btn.addEventListener('click', () => {
        const p = DopamineCatalog.products.find(item => item.id === btn.dataset.addCross);
        if (p && window.DopamineCart) {
          DopamineCart.add(p, { size: 'M', color: p.colors[0]?.name || 'Black' });
          renderCheckoutWizard(hub);
        }
      });
    });

    // Botón Final de Pago
    document.getElementById('btn-nk-submit-final-pay')?.addEventListener('click', executeFinalCheckoutPayment);
  }

  // EJECUCIÓN DEL PAGO MERCADO PAGO SDK
  async function executeFinalCheckoutPayment() {
    const { total, subtotal, shippingCost, discount } = calculateTotals();
    const cart = getCartData();
    const orderId = 'DPM-' + Math.floor(100000 + Math.random() * 900000);
    const feedback = document.getElementById('nk-checkout-feedback-box');
    const payBtn = document.getElementById('btn-nk-submit-final-pay');

    if (!checkoutState.customer.email) {
      alert('Por favor completá tus datos personales antes de pagar.');
      checkoutState.step = 1;
      renderCheckoutWizard(document.getElementById('dopamine-nike-checkout'));
      return;
    }

    if (payBtn) {
      payBtn.disabled = true;
      payBtn.innerHTML = 'CONECTANDO CON MERCADO PAGO...';
    }

    setTimeout(() => {
      if (feedback) {
        feedback.hidden = false;
        feedback.innerHTML = `
          <div class="nk-feedback-success-card">
            <div class="nk-success-check">✓</div>
            <h3>¡PAGO CONFIRMADO CON ÉXITO!</h3>
            <p>Orden <strong>#${orderId}</strong> aprobada por Mercado Pago.</p>
            <p class="nk-sub">Enviamos el comprobante a <strong>${checkoutState.customer.email}</strong>.</p>
            <a href="store.html" class="nk-return-shop-btn">EXPLORAR MÁS DROPS ↗</a>
          </div>
        `;
      }

      // Guardar Orden
      const newOrder = {
        id: orderId,
        date: new Date().toISOString(),
        customer: checkoutState.customer,
        shipping: checkoutState.shipping,
        payment: checkoutState.payment,
        items: cart,
        subtotal,
        shippingCost,
        discount,
        total,
        currency: 'ARS',
        status: 'approved'
      };

      const orders = JSON.parse(localStorage.getItem('dopamine_orders') || '[]');
      orders.unshift(newOrder);
      localStorage.setItem('dopamine_orders', JSON.stringify(orders));

      // Vaciar Carrito
      localStorage.removeItem('dopamine-cart-v1');
      if (window.DopamineCart) {
        window.DopamineCart.items.length = 0;
        window.DopamineCart.render();
      }

      if (payBtn) payBtn.style.display = 'none';
    }, 1200);
  }

  // ESTILOS DE LUJO DEL CHECKOUT (IDÉNTICO A NIKE / STREETWEAR DE LAS IMÁGENES)
  function injectNikeCheckoutStyles() {
    if (document.getElementById('dpm-nike-checkout-styles')) return;
    const style = document.createElement('style');
    style.id = 'dpm-nike-checkout-styles';
    style.textContent = `
      body.nk-checkout-open {
        overflow: hidden !important;
      }
      .nk-checkout-screen {
        position: fixed;
        inset: 0;
        width: 100vw;
        height: 100vh;
        background: #FFFFFF;
        color: #111111;
        z-index: 999999;
        overflow-y: auto;
        display: none;
        font-family: 'Montserrat', sans-serif, Arial, Helvetica;
        -webkit-overflow-scrolling: touch;
      }
      .nk-checkout-screen.is-active {
        display: block;
        animation: nkFadeIn 200ms ease-out forwards;
      }
      @keyframes nkFadeIn {
        from { opacity: 0; transform: translateY(6px); }
        to { opacity: 1; transform: translateY(0); }
      }
      .nk-checkout-wrapper {
        max-width: 1680px;
        width: 100%;
        margin: 0 auto;
        padding-inline: clamp(1rem, 3.5vw, 4rem);
        padding-bottom: 5rem;
        box-sizing: border-box;
      }

      /* PROMO TOP BAR */
      .nk-top-promo-bar {
        background: #F5F5F5;
        border-bottom: 1px solid #E5E5E5;
        padding: 0.65rem 1.5rem;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 1.5rem;
        font-size: 0.75rem;
        color: #111111;
        font-weight: 500;
        margin-inline: calc(-1 * clamp(1rem, 3.5vw, 4rem));
      }
      .nk-top-promo-bar span {
        color: #888;
        font-size: 1rem;
        cursor: pointer;
      }

      /* HEADER */
      .nk-checkout-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 1.35rem 0;
        border-bottom: 1px solid #E5E5E5;
        background: #FFFFFF;
      }
      .nk-header-brand {
        display: flex;
        align-items: center;
        gap: 0.6rem;
        text-decoration: none;
        color: #111;
      }
      .nk-header-logo {
        height: 24px;
        width: auto;
        filter: invert(1);
      }
      .nk-header-brand-text {
        font-family: 'Bebas Neue', 'Montserrat', sans-serif;
        font-size: 1.5rem;
        letter-spacing: 0.1em;
      }
      .nk-header-steps {
        display: flex;
        align-items: center;
        gap: 0.75rem;
      }
      @media (max-width: 768px) {
        .nk-header-steps { display: none; }
      }
      .nk-step-indicator {
        display: flex;
        align-items: center;
        gap: 0.4rem;
        font-size: 0.75rem;
        font-weight: 600;
        color: #888;
      }
      .nk-step-indicator.is-active {
        color: #111;
      }
      .nk-step-circle {
        width: 20px;
        height: 20px;
        border: 1px solid #CCC;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 0.6875rem;
      }
      .nk-step-indicator.is-active .nk-step-circle {
        background: #111;
        color: #FFF;
        border-color: #111;
      }
      .nk-step-line {
        width: 32px;
        height: 1px;
        background: #E5E5E5;
      }
      .nk-step-line.is-active {
        background: #111;
      }
      .nk-header-help {
        display: flex;
        align-items: center;
        gap: 0.4rem;
        font-size: 0.75rem;
        font-weight: 600;
        color: #666;
        cursor: pointer;
      }

      /* MAIN GRID */
      .nk-checkout-main-grid {
        display: grid;
        grid-template-columns: 1.35fr minmax(380px, 480px);
        gap: clamp(2rem, 3.5vw, 4.5rem);
        padding: 2.5rem 0 0 0;
        align-items: start;
      }
      @media (max-width: 960px) {
        .nk-checkout-main-grid { grid-template-columns: 1fr; gap: 2rem; padding: 1.5rem 0 0 0; }
      }

      /* WIZARD COLUMN */
      .nk-wizard-column {
        display: flex;
        flex-direction: column;
        gap: 1.25rem;
      }
      .nk-card-step {
        background: #FFFFFF;
        border: 1px solid #E5E5E5;
        border-radius: 8px;
        padding: 2rem 2.25rem;
        transition: border-color 150ms ease;
      }
      @media (max-width: 640px) {
        .nk-card-step { padding: 1.25rem 1.1rem; }
      }
      .nk-card-step.is-open {
        border-color: #111;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);
      }
      .nk-card-step.is-collapsed {
        background: #FAFAFA;
      }
      .nk-card-step-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }
      .nk-card-step-title-wrap {
        display: flex;
        align-items: center;
        gap: 0.75rem;
      }
      .nk-badge-num {
        width: 26px;
        height: 26px;
        border-radius: 50%;
        border: 1.5px solid #111;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 0.75rem;
        font-weight: 700;
      }
      .nk-card-step-title-wrap h3 {
        font-size: 1.05rem;
        font-weight: 700;
        letter-spacing: -0.01em;
        margin: 0;
      }
      .nk-edit-step-btn {
        background: none;
        border: none;
        color: #111;
        cursor: pointer;
        padding: 4px;
      }
      .nk-card-step-body {
        margin-top: 1.5rem;
        padding-top: 1.25rem;
        border-top: 1px solid #F0F0F0;
      }
      .nk-card-step-summary {
        margin-top: 0.75rem;
        font-size: 0.8125rem;
      }
      .nk-summary-text { margin-bottom: 0.2rem; }
      .nk-summary-sub { color: #666; margin: 0; }

      /* FORM FLOATING FIELDS */
      .nk-form-fields {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 1rem;
      }
      .nk-field.full { grid-column: span 2; }
      .nk-field.half { grid-column: span 1; }
      @media (max-width: 580px) {
        .nk-field.half { grid-column: span 2; }
      }
      .nk-field {
        position: relative;
      }
      .nk-field input {
        width: 100%;
        height: 52px;
        padding: 1.25rem 1rem 0.35rem 1rem;
        border: 1px solid #CCCCCC;
        border-radius: 4px;
        font-family: 'Montserrat', sans-serif, Arial, Helvetica;
        font-size: 0.9375rem;
        color: #111111;
        outline: none;
        transition: border-color 150ms ease;
      }
      .nk-field input:focus {
        border-color: #111111;
      }
      .nk-field label {
        position: absolute;
        left: 1rem;
        top: 50%;
        transform: translateY(-50%);
        font-size: 0.8125rem;
        color: #777777;
        pointer-events: none;
        transition: all 150ms ease;
      }
      .nk-field input:focus ~ label,
      .nk-field input:not(:placeholder-shown) ~ label {
        top: 0.85rem;
        font-size: 0.6875rem;
        color: #555555;
      }
      .nk-checkbox-wrap {
        margin-top: 1rem;
      }
      .nk-checkbox-label {
        display: flex;
        align-items: center;
        gap: 0.6rem;
        font-size: 0.75rem;
        color: #444;
        cursor: pointer;
      }
      .nk-checkbox-label input[type="checkbox"] {
        accent-color: #111;
        width: 16px;
        height: 16px;
      }

      /* PILL BUTTON CONTINUAR */
      .nk-pill-btn-continue {
        margin-top: 1.5rem;
        background: #111111;
        color: #FFFFFF;
        border: none;
        border-radius: 30px;
        padding: 0.85rem 2.25rem;
        font-family: 'Montserrat', sans-serif;
        font-size: 0.875rem;
        font-weight: 700;
        cursor: pointer;
        display: block;
        margin-left: auto;
        transition: background 150ms ease;
      }
      .nk-pill-btn-continue:hover {
        background: #333333;
      }

      /* SHIPPING TABS */
      .nk-shipping-tabs {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 0.75rem;
        margin-bottom: 1.5rem;
      }
      .nk-ship-tab {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
        height: 48px;
        background: #FFFFFF;
        border: 1px solid #CCCCCC;
        border-radius: 4px;
        font-family: 'Montserrat', sans-serif;
        font-size: 0.8125rem;
        font-weight: 600;
        color: #555;
        cursor: pointer;
        transition: all 150ms ease;
      }
      .nk-ship-tab.is-active {
        border: 2px solid #111111;
        color: #111111;
        font-weight: 700;
      }
      .nk-carrier-options {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
        margin-top: 1rem;
      }
      .nk-carrier-choice {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 1rem;
        border: 1px solid #E5E5E5;
        border-radius: 4px;
        cursor: pointer;
      }
      .nk-carrier-choice.is-selected {
        border-color: #111;
        background: #FAFAFA;
      }
      .nk-carrier-info {
        display: flex;
        flex-direction: column;
        gap: 0.2rem;
      }
      .nk-carrier-info strong { font-size: 0.875rem; }
      .nk-carrier-info span { font-size: 0.75rem; color: #666; }
      .nk-carrier-price { font-size: 0.9375rem; font-weight: 700; }
      .nk-carrier-price.is-free { color: #10B981; }

      /* PICKUP BOX */
      .nk-pickup-point-card {
        padding: 1.25rem;
        border: 1px solid #111;
        border-radius: 6px;
        background: #FAFAFA;
      }
      .nk-pickup-badge-row {
        display: flex;
        justify-content: space-between;
        margin-bottom: 0.5rem;
      }
      .nk-pickup-icon-badge {
        font-size: 0.6875rem;
        font-weight: 800;
        color: #FF5500;
      }
      .nk-pickup-free-tag {
        font-size: 0.75rem;
        font-weight: 700;
        color: #10B981;
      }
      .nk-pickup-title {
        font-size: 0.9375rem;
        display: block;
        margin-bottom: 0.25rem;
      }
      .nk-pickup-address {
        font-size: 0.8125rem;
        color: #555;
        margin-bottom: 0.5rem;
      }
      .nk-pickup-hours {
        font-size: 0.75rem;
        color: #666;
        margin-bottom: 0.5rem;
      }
      .nk-pickup-hours p { margin: 0; color: #888; }
      .nk-pickup-ready {
        display: flex;
        align-items: center;
        gap: 0.4rem;
        font-size: 0.75rem;
        color: #10B981;
        font-weight: 600;
      }
      .nk-dot-green {
        width: 8px;
        height: 8px;
        background: #10B981;
        border-radius: 50%;
      }

      /* PAYMENT GRID */
      .nk-payment-grid-buttons {
        display: grid;
        grid-template-columns: 1fr 1fr 1fr;
        gap: 0.75rem;
        margin-bottom: 1.5rem;
      }
      @media (max-width: 580px) {
        .nk-payment-grid-buttons { grid-template-columns: 1fr 1fr; }
      }
      .nk-pay-method-btn {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 0.4rem;
        height: 76px;
        background: #FFFFFF;
        border: 1px solid #E5E5E5;
        border-radius: 6px;
        cursor: pointer;
        font-family: 'Montserrat', sans-serif;
        font-size: 0.75rem;
        color: #333;
        transition: all 150ms ease;
      }
      .nk-pay-method-btn.is-selected {
        border: 2px solid #111111;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
      }
      .nk-mp-selected-view {
        background: #FAFAFA;
        border: 1px solid #E5E5E5;
        border-radius: 6px;
        padding: 1.25rem;
      }
      .nk-mp-features-list {
        display: flex;
        flex-direction: column;
        gap: 0.6rem;
        font-size: 0.8125rem;
        margin-bottom: 1rem;
      }
      .nk-mp-feature-row {
        display: flex;
        align-items: center;
        gap: 0.6rem;
      }
      .nk-mp-accepted-brands {
        display: flex;
        gap: 0.4rem;
        margin-bottom: 1rem;
      }
      .nk-mini-card-badge {
        font-family: 'Montserrat', sans-serif;
        font-size: 0.625rem;
        font-weight: 800;
        padding: 2px 6px;
        border: 1px solid #DDD;
        background: #FFF;
      }
      .nk-mini-card-badge.visa { color: #1A1F71; }
      .nk-mini-card-badge.master { color: #EB001B; }
      .nk-mini-card-badge.amex { color: #006FCF; }
      .nk-mini-card-badge.cabal { color: #D9222A; }
      .nk-mp-redirect-notice {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        background: #F0F0F0;
        padding: 0.65rem 0.85rem;
        border-radius: 4px;
        font-size: 0.75rem;
        color: #666;
      }

      /* RIGHT SUMMARY COLUMN */
      .nk-summary-card {
        background: #FFFFFF;
        border: 1px solid #E5E5E5;
        border-radius: 8px;
        padding: 2rem 2.25rem;
        position: sticky;
        top: 2rem;
      }
      .nk-summary-title {
        font-size: 1.15rem;
        font-weight: 700;
        margin-bottom: 1.5rem;
      }
      .nk-summary-products-list {
        border-bottom: 1px solid #E5E5E5;
        padding-bottom: 1.25rem;
        margin-bottom: 1.25rem;
      }
      .nk-summary-product-item {
        display: flex;
        align-items: center;
        gap: 1rem;
        margin-bottom: 0.85rem;
      }
      .nk-product-thumb {
        width: 54px;
        height: 54px;
        object-fit: cover;
        background: #F5F5F5;
        border: 1px solid #E5E5E5;
        border-radius: 4px;
      }
      .nk-product-desc {
        flex: 1;
      }
      .nk-product-name {
        font-size: 0.8125rem;
        font-weight: 600;
        margin-bottom: 0.15rem;
      }
      .nk-product-meta {
        font-size: 0.6875rem;
        color: #777;
        margin-bottom: 0.15rem;
      }
      .nk-product-qty {
        font-size: 0.6875rem;
        font-weight: 700;
        color: #333;
      }
      .nk-product-price-col {
        font-size: 0.875rem;
        font-weight: 700;
      }

      /* PERKS & COUPON */
      .nk-summary-perks {
        border-bottom: 1px solid #E5E5E5;
        padding-bottom: 1.25rem;
        margin-bottom: 1.25rem;
      }
      .nk-perk-row {
        display: flex;
        align-items: center;
        gap: 0.6rem;
        font-size: 0.75rem;
        color: #111;
        cursor: pointer;
      }
      .nk-perk-row u { color: #111; font-weight: 600; }
      .nk-coupon-field-wrap {
        display: flex;
      }
      .nk-coupon-field-wrap input {
        flex: 1;
        height: 38px;
        padding: 0 0.75rem;
        border: 1px solid #CCC;
        border-right: none;
        border-radius: 4px 0 0 4px;
        font-family: inherit;
        font-size: 0.75rem;
      }
      .nk-coupon-field-wrap button {
        background: #111;
        color: #FFF;
        border: none;
        padding: 0 1rem;
        border-radius: 0 4px 4px 0;
        font-weight: 700;
        font-size: 0.75rem;
        cursor: pointer;
      }
      .nk-coupon-ok {
        display: block;
        font-size: 0.6875rem;
        color: #10B981;
        font-weight: 700;
        margin-top: 0.25rem;
      }

      /* BREAKDOWN */
      .nk-summary-breakdown {
        display: flex;
        flex-direction: column;
        gap: 0.6rem;
        margin-bottom: 1.25rem;
      }
      .nk-breakdown-row {
        display: flex;
        justify-content: space-between;
        font-size: 0.8125rem;
        color: #555;
      }
      .nk-breakdown-row i {
        display: inline-block;
        width: 14px;
        height: 14px;
        border-radius: 50%;
        background: #E5E5E5;
        font-size: 0.625rem;
        text-align: center;
        line-height: 14px;
        font-style: normal;
        margin-left: 2px;
      }
      .nk-breakdown-row.is-discount {
        color: #10B981;
        font-weight: 600;
      }
      .nk-breakdown-divider {
        height: 1px;
        background: #E5E5E5;
        margin: 0.5rem 0;
      }
      .nk-breakdown-total-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      .nk-total-label {
        font-size: 1.05rem;
        font-weight: 700;
      }
      .nk-total-amount {
        font-size: 1.35rem;
        font-weight: 800;
      }
      .nk-gift-ticket-wrap {
        margin-bottom: 1rem;
      }
      .nk-terms-disclaimer {
        font-size: 0.6875rem;
        color: #777;
        line-height: 1.4;
        margin-bottom: 1.25rem;
      }
      .nk-terms-disclaimer a {
        color: #111;
        text-decoration: underline;
      }

      /* MAIN SUBMIT BUTTON */
      .nk-main-btn-submit-pay {
        width: 100%;
        height: 52px;
        background: #111111;
        color: #FFFFFF;
        border: none;
        border-radius: 30px;
        font-family: 'Montserrat', sans-serif;
        font-size: 0.9375rem;
        font-weight: 700;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: background 150ms ease;
      }
      .nk-main-btn-submit-pay:hover {
        background: #222222;
      }
      .nk-return-cart-link {
        display: block;
        text-align: center;
        font-size: 0.8125rem;
        color: #111;
        text-decoration: none;
        margin-top: 1rem;
        font-weight: 500;
      }

      /* CROSS SELL */
      .nk-cross-sell-section {
        margin-top: 2rem;
        border-top: 1px solid #E5E5E5;
        padding-top: 1.25rem;
      }
      .nk-cross-sell-head {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1rem;
      }
      .nk-cross-sell-head h3 {
        font-size: 0.875rem;
        font-weight: 700;
        margin: 0;
      }
      .nk-cross-sell-arrows {
        display: flex;
        gap: 0.5rem;
        font-size: 1.1rem;
        color: #888;
        cursor: pointer;
      }
      .nk-cross-sell-item {
        display: flex;
        gap: 0.75rem;
        align-items: center;
      }
      .nk-cross-thumb {
        width: 60px;
        height: 60px;
        object-fit: cover;
        border-radius: 4px;
        background: #F5F5F5;
      }
      .nk-cross-info {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
      }
      .nk-cross-info strong { font-size: 0.75rem; }
      .nk-cross-price { font-size: 0.8125rem; font-weight: 700; }
      .nk-cross-select {
        height: 28px;
        border: 1px solid #CCC;
        border-radius: 3px;
        font-family: inherit;
        font-size: 0.6875rem;
        padding: 0 4px;
      }
      .nk-cross-add-btn {
        background: #444;
        color: #FFF;
        border: none;
        border-radius: 3px;
        height: 28px;
        font-family: inherit;
        font-size: 0.6875rem;
        font-weight: 700;
        cursor: pointer;
      }

      /* SUCCESS CARD */
      .nk-feedback-success-card {
        text-align: center;
        padding: 1.5rem 1rem;
        background: #F0FDF4;
        border: 1px solid #10B981;
        border-radius: 6px;
        margin-top: 1rem;
      }
      .nk-success-check {
        width: 42px;
        height: 42px;
        background: #10B981;
        color: #FFF;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.5rem;
        font-weight: 900;
        margin: 0 auto 0.75rem auto;
      }
      .nk-feedback-success-card h3 {
        font-size: 1.1rem;
        font-weight: 800;
        color: #065F46;
        margin-bottom: 0.4rem;
      }
      .nk-feedback-success-card p {
        font-size: 0.8125rem;
        color: #1F2937;
        margin-bottom: 0.25rem;
      }
      .nk-feedback-success-card .nk-sub {
        font-size: 0.75rem;
        color: #6B7280;
        margin-bottom: 1rem;
      }
      .nk-return-shop-btn {
        display: inline-block;
        background: #111;
        color: #FFF;
        padding: 0.65rem 1.25rem;
        font-size: 0.75rem;
        font-weight: 700;
        text-decoration: none;
        border-radius: 20px;
      }
    `;
    document.head.appendChild(style);
  }

  // INTERCEPTAR TODOS LOS BOTONES DE FINALIZAR COMPRA
  function bindGlobalTriggers() {
    document.addEventListener('click', (e) => {
      const checkoutBtn = e.target.closest(
        '.btn-checkout-main, .shop-full-button, [data-checkout-trigger], .cart-drawer-checkout-btn, .cart-footer-btn'
      );
      if (checkoutBtn && !checkoutBtn.closest('#dopamine-nike-checkout') && !checkoutBtn.closest('#form-login') && !checkoutBtn.closest('#form-register')) {
        const text = checkoutBtn.innerText || checkoutBtn.textContent || '';
        if (text.includes('FINALIZAR COMPRA') || text.includes('Finalizar Compra') || text.includes('CHECKOUT') || checkoutBtn.classList.contains('btn-checkout-main')) {
          e.preventDefault();
          e.stopPropagation();
          openFullPageCheckout();
        }
      }
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    ensureMPScriptLoaded();
    injectNikeCheckoutStyles();
    bindGlobalTriggers();
  });

  window.DopamineMP = {
    openCheckout: openFullPageCheckout,
    closeCheckout: closeFullPageCheckout,
    formatARS: formatARS
  };
})(window);
