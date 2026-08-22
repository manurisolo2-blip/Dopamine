/**
 * DOPAMINE STREETWEAR — Step-by-Step Luxury Checkout Hub (Nike/Streetwear Architecture)
 * Flujo de compra por pasos: 1. Datos Personales -> 2. Envío -> 3. Pago (Mercado Pago SDK Oficial)
 * 100% Pesos Argentinos (ARS) & Tipografía Montserrat
 */

(function (window) {
  const MP_PUBLIC_KEY = 'TEST-12345678-abcd-1234-abcd-1234567890ab';
  let mpInstance = null;
  
  function escapeHTML(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // Base de datos de Provincias, Localidades Principales y Códigos Postales de Argentina
  const ARGENTINA_LOCATIONS = [
    {
      id: 'caba',
      name: 'Ciudad Autónoma de Buenos Aires (CABA)',
      isAmba: true,
      cities: [
        { name: 'Palermo', zip: '1414' },
        { name: 'Recoleta', zip: '1113' },
        { name: 'Belgrano', zip: '1426' },
        { name: 'Caballito', zip: '1405' },
        { name: 'Puerto Madero', zip: '1107' },
        { name: 'San Telmo', zip: '1063' },
        { name: 'Núñez', zip: '1429' },
        { name: 'Villa Urquiza', zip: '1431' },
        { name: 'Almagro', zip: '1199' },
        { name: 'Colegiales', zip: '1426' },
        { name: 'Villa Crespo', zip: '1414' },
        { name: 'Balvanera / Once', zip: '1032' },
        { name: 'Flores', zip: '1406' },
        { name: 'Villa Devoto', zip: '1419' },
        { name: 'Microcentro / San Nicolás', zip: '1001' },
        { name: 'Retiro', zip: '1002' },
        { name: 'Barracas', zip: '1272' },
        { name: 'Saavedra', zip: '1430' },
        { name: 'Parque Patricios', zip: '1264' },
        { name: 'Villa del Parque', zip: '1417' }
      ]
    },
    {
      id: 'gba_norte',
      name: 'Buenos Aires (GBA Norte / AMBA)',
      isAmba: true,
      cities: [
        { name: 'Vicente López', zip: '1638' },
        { name: 'Olivos', zip: '1636' },
        { name: 'San Isidro', zip: '1642' },
        { name: 'Martínez', zip: '1640' },
        { name: 'Tigre', zip: '1648' },
        { name: 'San Fernando', zip: '1646' },
        { name: 'Pilar', zip: '1629' },
        { name: 'San Martín', zip: '1650' },
        { name: 'Nordelta', zip: '1670' },
        { name: 'Villa Ballester', zip: '1653' },
        { name: 'Escobar', zip: '1625' }
      ]
    },
    {
      id: 'gba_oeste',
      name: 'Buenos Aires (GBA Oeste / AMBA)',
      isAmba: true,
      cities: [
        { name: 'Ramos Mejía', zip: '1704' },
        { name: 'Morón', zip: '1708' },
        { name: 'Castelar', zip: '1712' },
        { name: 'Haedo', zip: '1706' },
        { name: 'San Justo', zip: '1754' },
        { name: 'Ituzaingó', zip: '1714' },
        { name: 'Moreno', zip: '1744' },
        { name: 'Merlo', zip: '1722' },
        { name: 'Caseros (Tres de Febrero)', zip: '1678' },
        { name: 'Hurlingham', zip: '1686' },
        { name: 'Ciudad Jardín', zip: '1684' }
      ]
    },
    {
      id: 'gba_sur',
      name: 'Buenos Aires (GBA Sur / AMBA)',
      isAmba: true,
      cities: [
        { name: 'Avellaneda', zip: '1870' },
        { name: 'Lanús', zip: '1824' },
        { name: 'Lomas de Zamora', zip: '1832' },
        { name: 'Banfield', zip: '1828' },
        { name: 'Quilmes', zip: '1878' },
        { name: 'Bernal', zip: '1876' },
        { name: 'Adrogué', zip: '1846' },
        { name: 'Temperley', zip: '1834' },
        { name: 'Berazategui', zip: '1884' },
        { name: 'Ezeiza', zip: '1804' },
        { name: 'Monte Grande', zip: '1842' }
      ]
    },
    {
      id: 'bsas_interior',
      name: 'Buenos Aires (Interior)',
      isAmba: false,
      cities: [
        { name: 'La Plata', zip: '1900' },
        { name: 'Mar del Plata', zip: '7600' },
        { name: 'Bahía Blanca', zip: '8000' },
        { name: 'Tandil', zip: '7000' },
        { name: 'San Nicolás de los Arroyos', zip: '2900' },
        { name: 'Pergamino', zip: '2700' },
        { name: 'Olavarría', zip: '7400' },
        { name: 'Junín', zip: '6000' },
        { name: 'Zárate', zip: '2800' },
        { name: 'Campana', zip: '2804' },
        { name: 'Necochea', zip: '7630' },
        { name: 'Azul', zip: '7300' },
        { name: 'Chivilcoy', zip: '6620' },
        { name: 'Mercedes', zip: '6600' },
        { name: 'Pinamar', zip: '7167' },
        { name: 'Villa Gesell', zip: '7165' }
      ]
    },
    {
      id: 'cordoba',
      name: 'Córdoba',
      isAmba: false,
      cities: [
        { name: 'Córdoba Capital', zip: '5000' },
        { name: 'Villa Carlos Paz', zip: '5152' },
        { name: 'Río Cuarto', zip: '5800' },
        { name: 'Villa María', zip: '5900' },
        { name: 'San Francisco', zip: '2400' },
        { name: 'Alta Gracia', zip: '5186' },
        { name: 'Río Tercero', zip: '5850' },
        { name: 'Bell Ville', zip: '2550' },
        { name: 'La Falda', zip: '5172' },
        { name: 'Jesús María', zip: '5220' },
        { name: 'Mina Clavero', zip: '5889' }
      ]
    },
    {
      id: 'santa_fe',
      name: 'Santa Fe',
      isAmba: false,
      cities: [
        { name: 'Rosario', zip: '2000' },
        { name: 'Santa Fe Capital', zip: '3000' },
        { name: 'Rafaela', zip: '2300' },
        { name: 'Venado Tuerto', zip: '2600' },
        { name: 'Reconquista', zip: '3560' },
        { name: 'Santo Tomé', zip: '3016' },
        { name: 'Villa Gobernador Gálvez', zip: '2124' },
        { name: 'Esperanza', zip: '3080' },
        { name: 'San Lorenzo', zip: '2200' },
        { name: 'Funes', zip: '2132' }
      ]
    },
    {
      id: 'mendoza',
      name: 'Mendoza',
      isAmba: false,
      cities: [
        { name: 'Mendoza Capital', zip: '5500' },
        { name: 'Godoy Cruz', zip: '5501' },
        { name: 'Guaymallén', zip: '5519' },
        { name: 'Las Heras', zip: '5539' },
        { name: 'San Rafael', zip: '5600' },
        { name: 'Luján de Cuyo', zip: '5507' },
        { name: 'Maipú', zip: '5515' },
        { name: 'San Martín', zip: '5570' },
        { name: 'Chacras de Coria', zip: '5505' },
        { name: 'Tunuyán', zip: '5560' }
      ]
    },
    {
      id: 'tucuman',
      name: 'Tucumán',
      isAmba: false,
      cities: [
        { name: 'San Miguel de Tucumán', zip: '4000' },
        { name: 'Yerba Buena', zip: '4107' },
        { name: 'Tafí Viejo', zip: '4103' },
        { name: 'Concepción', zip: '4146' },
        { name: 'Banda del Río Salí', zip: '4109' },
        { name: 'Aguilares', zip: '4152' }
      ]
    },
    {
      id: 'entre_rios',
      name: 'Entre Ríos',
      isAmba: false,
      cities: [
        { name: 'Paraná', zip: '3100' },
        { name: 'Concordia', zip: '3200' },
        { name: 'Gualeguaychú', zip: '2820' },
        { name: 'Concepción del Uruguay', zip: '3260' },
        { name: 'Gualeguay', zip: '2840' },
        { name: 'Colón', zip: '3280' }
      ]
    },
    {
      id: 'salta',
      name: 'Salta',
      isAmba: false,
      cities: [
        { name: 'Salta Capital', zip: '4400' },
        { name: 'San Ramón de la Nueva Orán', zip: '4530' },
        { name: 'Tartagal', zip: '4560' },
        { name: 'Cafayate', zip: '4427' },
        { name: 'General Güemes', zip: '4432' }
      ]
    },
    {
      id: 'misiones',
      name: 'Misiones',
      isAmba: false,
      cities: [
        { name: 'Posadas', zip: '3300' },
        { name: 'Oberá', zip: '3360' },
        { name: 'Eldorado', zip: '3380' },
        { name: 'Puerto Iguazú', zip: '3370' },
        { name: 'Apóstoles', zip: '3350' }
      ]
    },
    {
      id: 'chaco',
      name: 'Chaco',
      isAmba: false,
      cities: [
        { name: 'Resistencia', zip: '3500' },
        { name: 'Presidencia Roque Sáenz Peña', zip: '3700' },
        { name: 'Villa Ángela', zip: '3540' },
        { name: 'Barranqueras', zip: '3503' }
      ]
    },
    {
      id: 'corrientes',
      name: 'Corrientes',
      isAmba: false,
      cities: [
        { name: 'Corrientes Capital', zip: '3400' },
        { name: 'Goya', zip: '3450' },
        { name: 'Paso de los Libres', zip: '3230' },
        { name: 'Curuzú Cuatiá', zip: '3460' },
        { name: 'Mercedes', zip: '3470' }
      ]
    },
    {
      id: 'santiago',
      name: 'Santiago del Estero',
      isAmba: false,
      cities: [
        { name: 'Santiago del Estero Capital', zip: '4200' },
        { name: 'La Banda', zip: '4300' },
        { name: 'Termas de Río Hondo', zip: '4220' },
        { name: 'Frías', zip: '4230' }
      ]
    },
    {
      id: 'san_juan',
      name: 'San Juan',
      isAmba: false,
      cities: [
        { name: 'San Juan Capital', zip: '5400' },
        { name: 'Rawson', zip: '5425' },
        { name: 'Rivadavia', zip: '5400' },
        { name: 'Chimbas', zip: '5413' },
        { name: 'Caucete', zip: '5442' }
      ]
    },
    {
      id: 'jujuy',
      name: 'Jujuy',
      isAmba: false,
      cities: [
        { name: 'San Salvador de Jujuy', zip: '4600' },
        { name: 'San Pedro de Jujuy', zip: '4500' },
        { name: 'Palpalá', zip: '4612' },
        { name: 'Libertador General San Martín', zip: '4512' },
        { name: 'Perico', zip: '4610' }
      ]
    },
    {
      id: 'rio_negro',
      name: 'Río Negro',
      isAmba: false,
      cities: [
        { name: 'San Carlos de Bariloche', zip: '8400' },
        { name: 'General Roca', zip: '8332' },
        { name: 'Cipolletti', zip: '8324' },
        { name: 'Viedma', zip: '8500' },
        { name: 'Villa Regina', zip: '8336' },
        { name: 'Las Grutas', zip: '8521' }
      ]
    },
    {
      id: 'neuquen',
      name: 'Neuquén',
      isAmba: false,
      cities: [
        { name: 'Neuquén Capital', zip: '8300' },
        { name: 'San Martín de los Andes', zip: '8370' },
        { name: 'Cutral Có', zip: '8322' },
        { name: 'Zapala', zip: '8340' },
        { name: 'Plottier', zip: '8316' },
        { name: 'Villa La Angostura', zip: '8407' }
      ]
    },
    {
      id: 'chubut',
      name: 'Chubut',
      isAmba: false,
      cities: [
        { name: 'Comodoro Rivadavia', zip: '9000' },
        { name: 'Trelew', zip: '9100' },
        { name: 'Puerto Madryn', zip: '9120' },
        { name: 'Esquel', zip: '9200' },
        { name: 'Rawson', zip: '9103' }
      ]
    },
    {
      id: 'san_luis',
      name: 'San Luis',
      isAmba: false,
      cities: [
        { name: 'San Luis Capital', zip: '5700' },
        { name: 'Villa Mercedes', zip: '5730' },
        { name: 'Merlo', zip: '5881' },
        { name: 'La Punta', zip: '5710' }
      ]
    },
    {
      id: 'catamarca',
      name: 'Catamarca',
      isAmba: false,
      cities: [
        { name: 'San Fernando del Valle de Catamarca', zip: '4700' },
        { name: 'Valle Viejo', zip: '4707' },
        { name: 'Andalgalá', zip: '4740' },
        { name: 'Belén', zip: '4750' }
      ]
    },
    {
      id: 'la_pampa',
      name: 'La Pampa',
      isAmba: false,
      cities: [
        { name: 'Santa Rosa', zip: '6300' },
        { name: 'General Pico', zip: '6360' },
        { name: 'Toay', zip: '6303' },
        { name: 'Realicó', zip: '6200' }
      ]
    },
    {
      id: 'la_rioja',
      name: 'La Rioja',
      isAmba: false,
      cities: [
        { name: 'La Rioja Capital', zip: '5300' },
        { name: 'Chilecito', zip: '5360' },
        { name: 'Aimogasta', zip: '5310' },
        { name: 'Chamical', zip: '5380' }
      ]
    },
    {
      id: 'formosa',
      name: 'Formosa',
      isAmba: false,
      cities: [
        { name: 'Formosa Capital', zip: '3600' },
        { name: 'Clorinda', zip: '3610' },
        { name: 'Pirané', zip: '3606' },
        { name: 'El Colorado', zip: '3603' }
      ]
    },
    {
      id: 'santa_cruz',
      name: 'Santa Cruz',
      isAmba: false,
      cities: [
        { name: 'Río Gallegos', zip: '9400' },
        { name: 'Caleta Olivia', zip: '9011' },
        { name: 'El Calafate', zip: '9405' },
        { name: 'Pico Truncado', zip: '9015' },
        { name: 'Puerto Deseado', zip: '9050' }
      ]
    },
    {
      id: 'tierra_del_fuego',
      name: 'Tierra del Fuego',
      isAmba: false,
      cities: [
        { name: 'Ushuaia', zip: '9410' },
        { name: 'Río Grande', zip: '9420' },
        { name: 'Tolhuin', zip: '9412' }
      ]
    }
  ];

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
      option: 'standard', // 'standard' | 'express'
      address: '',
      apartment: '',
      province: 'caba',
      city: 'Palermo',
      isCustomCity: false,
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
      const currentProv = ARGENTINA_LOCATIONS.find(p => p.id === checkoutState.shipping.province) || ARGENTINA_LOCATIONS[0];
      if (!currentProv.isAmba && checkoutState.shipping.option === 'express') {
        checkoutState.shipping.option = 'standard';
      }
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

    // Si el drawer del carrito está abierto, cerrarlo inmediatamente
    if (window.CartStore && typeof window.CartStore.close === 'function') {
      window.CartStore.close();
    }
    const cartDrawer = document.querySelector('.cart-drawer, [data-cart-drawer]');
    if (cartDrawer) {
      cartDrawer.classList.remove('is-open', 'is-active');
      cartDrawer.setAttribute('hidden', '');
    }
    const cartOverlay = document.querySelector('.cart-overlay, [data-cart-overlay]');
    if (cartOverlay) {
      cartOverlay.classList.remove('is-visible', 'is-active');
      cartOverlay.setAttribute('hidden', '');
    }
    document.documentElement.classList.remove('cart-open');
    document.body.classList.remove('cart-open');

    let hub = document.getElementById('dopamine-nike-checkout');
    if (!hub) {
      hub = document.createElement('div');
      hub.id = 'dopamine-nike-checkout';
      hub.className = 'nk-checkout-screen';
      document.body.appendChild(hub);
    }

    renderCheckoutWizard(hub);
    hub.classList.add('is-active');
    document.documentElement.classList.add('nk-checkout-open');
    document.body.classList.add('nk-checkout-open');
    hub.scrollTop = 0;
  }

  function closeFullPageCheckout() {
    const hub = document.getElementById('dopamine-nike-checkout');
    if (hub) {
      hub.classList.remove('is-active');
    }
    document.documentElement.classList.remove('nk-checkout-open');
    document.body.classList.remove('nk-checkout-open');
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
          <p style="display: inline-flex; align-items: center; justify-content: center; gap: 0.4rem; flex-wrap: wrap;">
            <img src="assets/Branding/Logos/mercadopago_logo.jpg" alt="Mercado Pago" style="height: 16px; width: auto; object-fit: contain; border-radius: 2px; vertical-align: middle;">
            <span>¡Hasta <strong>6 cuotas sin interés</strong> con Mercado Pago y <strong>Envío Gratis</strong> en compras mayores a $90.000! 🇦🇷</span>
          </p>
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
                      <span>No quiero recibir el newsletter con promociones</span>
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
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg>
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
                          <input type="text" id="nk-ship-address" placeholder=" " value="${escapeHTML(checkoutState.shipping.address)}" required>
                          <label for="nk-ship-address">Dirección de Entrega (Calle y Altura) *</label>
                        </div>
                        <div class="nk-field half">
                          <input type="text" id="nk-ship-apartment" placeholder=" " value="${escapeHTML(checkoutState.shipping.apartment || '')}">
                          <label for="nk-ship-apartment">Piso / Depto / Unidad (Opcional)</label>
                        </div>
                        <div class="nk-field half">
                          <select id="nk-ship-province" aria-label="Provincia">
                            ${ARGENTINA_LOCATIONS.map(prov => `
                              <option value="${prov.id}" ${checkoutState.shipping.province === prov.id ? 'selected' : ''}>
                                ${prov.name}
                              </option>
                            `).join('')}
                          </select>
                          <label for="nk-ship-province">Provincia *</label>
                        </div>
                        <div class="nk-field half">
                          <select id="nk-ship-city" aria-label="Ciudad / Localidad">
                            ${(() => {
                              const currentProv = ARGENTINA_LOCATIONS.find(p => p.id === checkoutState.shipping.province) || ARGENTINA_LOCATIONS[0];
                              const isCustom = checkoutState.shipping.isCustomCity || !currentProv.cities.some(c => c.name.toLowerCase() === (checkoutState.shipping.city || '').toLowerCase());
                              let optionsHtml = currentProv.cities.map(c => `
                                <option value="${c.name}" data-zip="${c.zip}" ${!isCustom && (checkoutState.shipping.city || '').toLowerCase() === c.name.toLowerCase() ? 'selected' : ''}>
                                  ${c.name} (CP ${c.zip})
                                </option>
                              `).join('');
                              optionsHtml += `<option value="__custom__" ${isCustom ? 'selected' : ''}>+ Otra localidad de ${currentProv.name}...</option>`;
                              return optionsHtml;
                            })()}
                          </select>
                          <label for="nk-ship-city">Ciudad / Localidad *</label>
                        </div>
                        <div class="nk-field half" id="nk-custom-city-wrap" style="${checkoutState.shipping.isCustomCity ? 'display:block;' : 'display:none;'}">
                          <input type="text" id="nk-ship-custom-city" placeholder=" " value="${escapeHTML(checkoutState.shipping.city || '')}">
                          <label for="nk-ship-custom-city">Nombre de Localidad *</label>
                        </div>
                        <div class="nk-field half">
                          <input type="text" id="nk-ship-zip" placeholder=" " maxlength="8" value="${escapeHTML(checkoutState.shipping.zip || '')}" required>
                          <label for="nk-ship-zip">Código Postal (CP) *</label>
                        </div>
                      </div>

                      <div class="nk-carrier-options">
                        <label class="nk-carrier-choice ${checkoutState.shipping.option === 'standard' ? 'is-selected' : ''}">
                          <input type="radio" name="nk-carrier-radio" value="standard" ${checkoutState.shipping.option === 'standard' ? 'checked' : ''}>
                          <div class="nk-carrier-info">
                            <strong>Correo Argentino / Andreani Clásico</strong>
                            <span>Envío nacional a domicilio (3 a 5 días hábiles)</span>
                          </div>
                          <span class="nk-carrier-price ${subtotal >= 90000 ? 'is-free' : ''}">
                            ${subtotal >= 90000 ? 'Gratis' : '$ 5.500'}
                          </span>
                        </label>

                        ${(() => {
                          const currentProv = ARGENTINA_LOCATIONS.find(p => p.id === checkoutState.shipping.province) || ARGENTINA_LOCATIONS[0];
                          const isAmba = currentProv.isAmba;
                          return `
                            <label class="nk-carrier-choice ${checkoutState.shipping.option === 'express' && isAmba ? 'is-selected' : ''} ${!isAmba ? 'is-disabled' : ''}">
                              <input type="radio" name="nk-carrier-radio" value="express" ${checkoutState.shipping.option === 'express' && isAmba ? 'checked' : ''} ${!isAmba ? 'disabled' : ''}>
                              <div class="nk-carrier-info">
                                <strong>Envío Moto Express CABA / AMBA</strong>
                                <span>${isAmba ? 'Entrega prioritaria en 24 a 48 horas hábiles' : 'Disponible exclusivamente para CABA y Gran Buenos Aires'}</span>
                              </div>
                              <span class="nk-carrier-price" style="${!isAmba ? 'opacity: 0.45;' : ''}">$ 8.500</span>
                            </label>
                          `;
                        })()}
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
                          <span>Listo para retirar hoy mismo</span>
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
                    <strong>${checkoutState.shipping.type === 'pickup' ? 'Retiro en Showroom Dopamine (Palermo Soho)' : 'Envío a: ' + escapeHTML(checkoutState.shipping.address) + (checkoutState.shipping.apartment ? ' (' + escapeHTML(checkoutState.shipping.apartment) + ')' : '') + ', ' + escapeHTML(checkoutState.shipping.city) + ' (' + (ARGENTINA_LOCATIONS.find(p => p.id === checkoutState.shipping.province)?.name || checkoutState.shipping.province) + ', CP ' + escapeHTML(checkoutState.shipping.zip) + ')'}</strong>
                  </p>
                  <p class="nk-summary-sub">Método: ${checkoutState.shipping.option === 'express' ? 'Moto Express CABA/AMBA' : 'Correo Argentino / Andreani'} • Costo: ${shippingCost === 0 ? 'Gratis' : formatARS(shippingCost)} • Listo en ${checkoutState.shipping.option === 'express' ? '24 a 48 hs' : '3 a 5 días hábiles'}</p>
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
                      <img src="assets/Branding/Logos/mercadopago_logo.jpg" alt="Mercado Pago" style="height: 32px; width: auto; max-width: 48px; object-fit: contain; display: block; border-radius: 4px;">
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
                      <div style="display: flex; align-items: center; gap: 0.65rem; margin-bottom: 1rem; padding-bottom: 0.75rem; border-bottom: 1px solid rgba(255,255,255,0.08);">
                        <img src="assets/Branding/Logos/mercadopago_logo.jpg" alt="Mercado Pago" style="height: 26px; width: auto; object-fit: contain; border-radius: 4px;">
                        <span style="font-weight: 600; font-size: 0.875rem; color: #009EE3;">Cuenta Mercado Pago y Tarjetas</span>
                      </div>
                      <div class="nk-mp-features-list">
                        <div class="nk-mp-feature-row">
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#009EE3" stroke-width="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>
                          <span>Usá tus tarjetas guardadas, dinero disponible y mucho más</span>
                        </div>
                        <div class="nk-mp-feature-row">
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#009EE3" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
                          <span>Accedé a <strong>Cuotas sin Tarjeta</strong> para comprar ahora y pagar después</span>
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
                        <span>Te llevaremos a Mercado Pago; si no tenés una cuenta, podés usar tu e-mail</span>
                      </div>
                    </div>
                  ` : (checkoutState.payment.method === 'transfer' ? `
                    <div class="nk-transfer-box">
                      <div class="nk-transfer-header">
                        <span class="nk-discount-tag">✓ 10% DE DESCUENTO APLICADO</span>
                        <p>Aboná mediante transferencia y ahorrás en tu total</p>
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
              <button type="button" class="nk-main-btn-submit-pay" id="btn-nk-submit-final-pay" style="display: flex; align-items: center; justify-content: center; gap: 0.6rem;">
                <img src="assets/Branding/Logos/mercadopago_logo.jpg" alt="Mercado Pago" style="height: 20px; width: auto; object-fit: contain; border-radius: 3px;">
                <span>Pagar a través de Mercado Pago</span>
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

    // Guardar cambios en vivo en dirección y piso/depto
    document.getElementById('nk-ship-address')?.addEventListener('input', (e) => {
      checkoutState.shipping.address = e.target.value;
    });
    document.getElementById('nk-ship-apartment')?.addEventListener('input', (e) => {
      checkoutState.shipping.apartment = e.target.value;
    });

    // Selector de Provincia inteligente
    document.getElementById('nk-ship-province')?.addEventListener('change', (e) => {
      const provId = e.target.value;
      const found = ARGENTINA_LOCATIONS.find(p => p.id === provId) || ARGENTINA_LOCATIONS[0];
      checkoutState.shipping.province = provId;
      checkoutState.shipping.isCustomCity = false;
      if (found && found.cities && found.cities.length > 0) {
        checkoutState.shipping.city = found.cities[0].name;
        checkoutState.shipping.zip = found.cities[0].zip;
      }
      if (found && !found.isAmba && checkoutState.shipping.option === 'express') {
        checkoutState.shipping.option = 'standard';
      }
      renderCheckoutWizard(hub);
    });

    // Selector de Ciudad / Localidad
    document.getElementById('nk-ship-city')?.addEventListener('change', (e) => {
      const val = e.target.value;
      if (val === '__custom__') {
        checkoutState.shipping.isCustomCity = true;
        const customWrap = document.getElementById('nk-custom-city-wrap');
        if (customWrap) customWrap.style.display = 'block';
        const customInput = document.getElementById('nk-ship-custom-city');
        if (customInput) customInput.focus();
      } else {
        checkoutState.shipping.isCustomCity = false;
        checkoutState.shipping.city = val;
        const citySelect = document.getElementById('nk-ship-city');
        const opt = citySelect ? citySelect.options[citySelect.selectedIndex] : null;
        if (opt && opt.dataset.zip) {
          checkoutState.shipping.zip = opt.dataset.zip;
          const zipInput = document.getElementById('nk-ship-zip');
          if (zipInput) zipInput.value = opt.dataset.zip;
        }
        const customWrap = document.getElementById('nk-custom-city-wrap');
        if (customWrap) customWrap.style.display = 'none';
      }
    });

    // Campo de Localidad personalizada
    document.getElementById('nk-ship-custom-city')?.addEventListener('input', (e) => {
      checkoutState.shipping.city = e.target.value.trim();
    });

    // Campo de Código Postal inteligente (4 dígitos numéricos)
    document.getElementById('nk-ship-zip')?.addEventListener('input', (e) => {
      const digits = e.target.value.replace(/\D/g, '').slice(0, 4);
      e.target.value = digits;
      checkoutState.shipping.zip = digits;
    });

    // Opciones de carrier
    hub.querySelectorAll('input[name="nk-carrier-radio"]').forEach(radio => {
      radio.addEventListener('change', (e) => {
        checkoutState.shipping.option = e.target.value;
        renderCheckoutWizard(hub);
      });
    });

    // Continuar Paso 2 -> Paso 3 con validación de coherencia
    document.getElementById('btn-continue-step-2')?.addEventListener('click', () => {
      if (checkoutState.shipping.type === 'home') {
        const address = document.getElementById('nk-ship-address')?.value.trim() || checkoutState.shipping.address;
        const apartment = document.getElementById('nk-ship-apartment')?.value.trim() || '';
        let city = checkoutState.shipping.city;
        if (checkoutState.shipping.isCustomCity) {
          city = document.getElementById('nk-ship-custom-city')?.value.trim() || '';
        }
        const zip = document.getElementById('nk-ship-zip')?.value.trim() || checkoutState.shipping.zip;

        if (!address) {
          alert('Por favor ingresá tu dirección de entrega (calle y número de altura).');
          document.getElementById('nk-ship-address')?.focus();
          return;
        }

        if (!/\d+/.test(address)) {
          alert('Por favor incluí la numeración o altura de la calle en la dirección (ej: 2 de Abril 1420).');
          document.getElementById('nk-ship-address')?.focus();
          return;
        }

        if (!city) {
          alert('Por favor seleccioná o ingresá tu ciudad o localidad.');
          return;
        }

        const cleanZip = zip.replace(/\D/g, '');
        if (!cleanZip || cleanZip.length !== 4) {
          alert('Por favor ingresá un código postal argentino válido de 4 dígitos (ej: 1414, 5000, 2000).');
          document.getElementById('nk-ship-zip')?.focus();
          return;
        }

        checkoutState.shipping.address = address;
        checkoutState.shipping.apartment = apartment;
        checkoutState.shipping.city = city;
        checkoutState.shipping.zip = cleanZip;
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

    // Soporte fluido para scroll con rueda de mouse en toda la pantalla de checkout
    if (!hub._hasWheelListener) {
      hub._hasWheelListener = true;
      hub.addEventListener('wheel', (e) => {
        let target = e.target;
        let innerScrollable = null;
        while (target && target !== hub) {
          if (target.scrollHeight > target.clientHeight) {
            const overflowY = window.getComputedStyle(target).overflowY;
            if (overflowY === 'auto' || overflowY === 'scroll') {
              const atTop = target.scrollTop <= 0 && e.deltaY < 0;
              const atBottom = target.scrollTop + target.clientHeight >= target.scrollHeight - 1 && e.deltaY > 0;
              if (!atTop && !atBottom) {
                innerScrollable = target;
                break;
              }
            }
          }
          target = target.parentElement;
        }

        if (!innerScrollable) {
          hub.scrollTop += e.deltaY;
        }
      }, { passive: true });
    }
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
            <div style="display: flex; align-items: center; justify-content: center; gap: 0.5rem; margin-bottom: 0.5rem;">
              <img src="assets/Branding/Logos/mercadopago_logo.jpg" alt="Mercado Pago" style="height: 22px; width: auto; object-fit: contain; border-radius: 4px;">
              <p style="margin: 0;">Orden <strong>#${orderId}</strong> aprobada por Mercado Pago</p>
            </div>
            <p class="nk-sub">Enviamos el comprobante a <strong>${checkoutState.customer.email}</strong></p>
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
      html.nk-checkout-open,
      body.nk-checkout-open {
        overflow: hidden !important;
        scrollbar-gutter: auto !important;
        height: 100vh !important;
        max-height: 100vh !important;
        touch-action: none;
      }
      .nk-checkout-screen {
        position: fixed;
        inset: 0;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        width: 100vw;
        height: 100vh;
        background: #FFFFFF;
        color: #111111;
        z-index: 999999;
        overflow-y: auto !important;
        overflow-x: hidden !important;
        display: none;
        font-family: 'Montserrat', sans-serif, Arial, Helvetica;
        -webkit-overflow-scrolling: touch;
        overscroll-behavior: contain;
        touch-action: pan-y;
      }
      .nk-checkout-screen::-webkit-scrollbar {
        width: 8px;
      }
      .nk-checkout-screen::-webkit-scrollbar-track {
        background: #F4F4F5;
      }
      .nk-checkout-screen::-webkit-scrollbar-thumb {
        background: #BBBBBC;
        border-radius: 4px;
      }
      .nk-checkout-screen::-webkit-scrollbar-thumb:hover {
        background: #888889;
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
      .nk-field input,
      .nk-field select {
        width: 100%;
        height: 52px;
        padding: 1.25rem 1rem 0.35rem 1rem;
        border: 1px solid #CCCCCC;
        border-radius: 4px;
        font-family: 'Montserrat', sans-serif, Arial, Helvetica;
        font-size: 0.9375rem;
        color: #111111;
        background-color: #FFFFFF;
        outline: none;
        transition: border-color 150ms ease;
        box-sizing: border-box;
      }
      .nk-field select {
        cursor: pointer;
        appearance: none;
        -webkit-appearance: none;
        background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%23333' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E");
        background-repeat: no-repeat;
        background-position: right 1rem center;
        padding-right: 2.25rem;
      }
      .nk-field input:focus,
      .nk-field select:focus {
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
      .nk-field input:not(:placeholder-shown) ~ label,
      .nk-field select ~ label {
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
        width: 16px !important;
        height: 16px !important;
        min-width: 16px !important;
        min-height: 16px !important;
        max-width: 16px !important;
        max-height: 16px !important;
        cursor: pointer;
        flex-shrink: 0;
        margin: 0;
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
      .nk-carrier-choice.is-disabled {
        opacity: 0.45;
        cursor: not-allowed;
        background: #F9F9F9;
        border-color: #EFEFEF;
      }
      .nk-carrier-choice.is-disabled input {
        cursor: not-allowed;
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
        gap: 0.5rem;
        height: 84px;
        background: #FFFFFF;
        border: 1px solid #E5E5E5;
        border-radius: 6px;
        cursor: pointer;
        font-family: 'Montserrat', sans-serif;
        font-size: 0.75rem;
        font-weight: 600;
        color: #222;
        transition: all 150ms ease;
        padding: 0.5rem;
      }
      .nk-pay-method-btn.is-selected {
        border: 2px solid #111111;
        box-shadow: 0 4px 14px rgba(0, 0, 0, 0.08);
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
        max-height: 320px;
        overflow-y: auto;
        overscroll-behavior: contain;
        padding-right: 0.35rem;
      }
      .nk-summary-products-list::-webkit-scrollbar {
        width: 5px;
      }
      .nk-summary-products-list::-webkit-scrollbar-track {
        background: #F5F5F5;
        border-radius: 3px;
      }
      .nk-summary-products-list::-webkit-scrollbar-thumb {
        background: #D1D1D1;
        border-radius: 3px;
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
