/**
 * ============================================================
 * DOPAMINE — Internationalization Engine (i18n)
 * ============================================================
 * High Performance Streetwear Localization (ES / EN)
 * - Zero external dependencies.
 * - Reactive translation switching without page reload.
 * - Persistence in localStorage ('dopamine_lang').
 * - Synchronizes <html lang="..."> attribute.
 * - Supports data-i18n, data-i18n-placeholder, data-i18n-aria-label, data-i18n-title, data-i18n-html.
 * - Emits 'dopamine:langchange' and 'dopamine:languageChange' events.
 * - Compatible with window.DopamineI18n and window.i18n APIs.
 */

(function (window, document) {
  'use strict';

  const STORAGE_KEY = 'dopamine_lang';
  const DEFAULT_LANG = 'es';

  const translations = {
    es: {
      // Meta & Site Headers
      'meta.title_home': 'DOPAMINE — High Performance Streetwear | Official Store',
      'meta.desc_home': 'Dopamine streetwear. Siluetas limpias, actitud fuerte y moda urbana de alto rendimiento. Explorá colecciones y drops limitados desde Buenos Aires.',
      'meta.title_store': 'DOPAMINE — Colección & Drops Exclusivos | Catálogo Oficial',
      'meta.title_shop': 'DOPAMINE — Colección & Drops Exclusivos | Catálogo Oficial',
      'meta.desc_store': 'Descubrí el catálogo oficial de Dopamine Streetwear: hoodies oversized, remeras heavyweight, pantalones cargo y accesorios urbanos de edición limitada.',
      'meta.desc_shop': 'Descubrí el catálogo oficial de Dopamine Streetwear: hoodies oversized, remeras heavyweight, pantalones cargo y accesorios urbanos de edición limitada.',
      'meta.title_product': 'DOPAMINE — Detalle de Producto | Streetwear Drop',
      'meta.desc_product': 'Explorá los detalles, materiales premium, guía de talles y especificaciones técnicas de las prendas de alta costura urbana de Dopamine.',
      'meta.title_cart': 'DOPAMINE — Bolsa de Compras & Checkout',
      'meta.desc_cart': 'Revisá tus prendas seleccionadas, aplicá cupones de descuento exclusivos y completá tu pedido de forma rápida y segura en Dopamine Streetwear.',
      'meta.title_contact': 'DOPAMINE — Contacto & Soporte Oficial',
      'meta.desc_contact': 'Comunicate con el equipo oficial de Dopamine Streetwear. Atención al cliente, suscripción a drops exclusivos, consultas comerciales y soporte.',
      'meta.title_login': 'DOPAMINE — Acceso de Cuenta & Registro',
      'meta.desc_login': 'Iniciá sesión o registrate en Dopamine Streetwear para acceder a tu historial de compras, seguimiento de envíos y acceso prioritario a drops.',
      'meta.title_admin': 'DOPAMINE — Panel de Gestión de Clientes (Admin)',
      'meta.desc_admin': 'Panel interno de administración y gestión de clientes de Dopamine Streetwear.',
      'meta.title_404': 'DOPAMINE — 404 // DROP NO ENCONTRADO',
      'meta.desc_404': 'La señal se ha perdido en el sistema. La prenda o página que buscas no existe o correspondía a un drop limitado de Dopamine Streetwear.',

      // Top Micro-Marquee Ticker
      'marquee.transfer': '10% OFF EXTRA TRANSFERENCIAS',
      'marquee.edition': 'BUENOS AIRES STREETWEAR LIMITED EDITION',
      'marquee.shipping': 'ENVÍOS A TODO EL PAÍS DROP 01 / 26',

      // Preloader / Brand Loading Screen
      'loader.aria_label': 'Cargando Dopamine Streetwear',
      'loader.initializing': 'INITIALIZING SYSTEM // BUENOS AIRES',
      'loader.status': 'DROP 01/26',

      // Header Navigation
      'nav.drops': 'DROPS',
      'nav.contact': 'CONTACTO',
      'nav.search_aria': 'Buscar',
      'nav.account_aria': 'Mi Cuenta',
      'nav.theme_aria': 'Cambiar tema (Claro / Oscuro)',
      'nav.cart_aria': 'Bolsa de compras',
      'nav.menu_open_aria': 'Abrir menú',
      'nav.menu_close_aria': 'Cerrar menú',
      'nav.lang_toggle_aria': 'Cambiar idioma (ES / EN)',
      'nav.back_to_store': 'VOLVER A LA TIENDA ↗',
      'nav.home_aria': 'Dopamine Inicio',
      'nav.back_to_top_aria': 'Volver arriba',
      'ui.back_to_top': 'Volver arriba',
      'ui.back_to_top_short': 'TOP',

      // Hero Section (index.html)
      'hero.headline': 'ACTIVATE<br>YOUR<br>POTENTIAL',
      'hero.tagline': 'HIGH PERFORMANCE STREETWEAR. BUENOS AIRES',
      'hero.cta': 'VER COLECCIÓN →',
      'hero.cta_drops': 'EXPLORAR DROPS ↗',

      // Seamless Marquee Strip
      'marquee.drop': 'DROP 01 / 26',
      'marquee.brand': 'DOPAMINE STREETWEAR',
      'marquee.city': 'BUENOS AIRES',
      'marquee.limited': 'LIMITED EDITION',
      'marquee.performance': 'HIGH PERFORMANCE',
      'marquee.movement': 'BUILT FOR MOVEMENT',

      // Categories
      'categories.title': 'COLECCIONES',
      'categories.view_all': 'EXPLORAR TODO →',
      'categories.explore': 'EXPLORAR →',
      'categories.tops': 'REMERAS & CAMISAS',
      'categories.hoodies': 'BUZOS & CAMPERAS',
      'categories.bottoms': 'JEANES & PANTALONES',
      'categories.sets': 'CONJUNTOS',

      // Pre-Footer CTA Reinforcement Section
      'prefooter.eyebrow': '// DROP 01 / EDICIÓN LIMITADA',
      'prefooter.title': 'NO TE QUEDES AFUERA DE LA CULTURA',
      'prefooter.desc': 'Prendas de alta costura urbana producidas en cantidades estrictamente limitadas. Diseñado y confeccionado en Buenos Aires.',
      'prefooter.cta_shop': 'EXPLORAR CATÁLOGO COMPLETO →',
      'prefooter.cta_club': 'UNIRSE AL CLUB PRIVADO ↗',

      // Featured Products (index.html)
      'featured.title': 'PIEZAS DESTACADAS',
      'featured.view_all': 'VER TODO →',
      'featured.quick_add': 'AÑADIR:',
      'featured.transfer_note': 'con Transferencia (10% OFF)',

      // Scroll Reveal Text
      'scroll.unleashing': 'UNLEASHING THE REWARD SYSTEM',
      'scroll.activate': 'ACTIVATE YOUR POTENTIAL',

      // Collection Banner
      'banner.eyebrow': 'DROP 01 / 26',
      'banner.title': 'EL NUEVO UNIFORME URBANO',
      'banner.desc': 'Nuestra primera colección define las bases. Diseñada sin compromisos desde Buenos Aires',
      'banner.cta': 'DESCUBRIR →',

      // Brand Story Section
      'story.title': 'NUESTRA HISTORIA',
      'story.p1': 'Dopamine nació en las calles de Buenos Aires con un objetivo claro: crear ropa que te haga sentir invencible. No seguimos tendencias, diseñamos el uniforme del futuro para quienes se mueven con propósito',
      'story.p2': 'Cada pieza está meticulosamente construida con materiales premium, prestando atención a cada costura y detalle. Creemos en la calidad sobre la cantidad',
      'story.stat1_label': 'GSM COTTON',
      'story.stat1_desc': 'Algodón de peso pesado, estructurado y duradero',
      'story.stat2_label': 'LIMITED PIECES',
      'story.stat2_desc': 'Ediciones limitadas por drop. No hacemos restocks',
      'story.stat3_label': 'HEADQUARTERS',
      'story.stat3_desc': 'Diseñado y desarrollado en nuestro atelier en Buenos Aires',

            // Worldwide Shipping & 3D Logistics Globe Section
      'globe.title': 'Desde Buenos Aires hacia el mundo',
      'globe.subtitle': 'Cada drop de <strong>DOPAMINE</strong> es confeccionado y despachado desde nuestro atelier central en Buenos Aires con cobertura prioritaria y tracking en tiempo real a más de 180 destinos.',
      'globe.transit_label': 'TIEMPO DE TRÁNSITO',
      'globe.courier_label': 'COURIER ASIGNADO',
      'globe.coverage_link': 'Cobertura y tracking a 180+ países →',
      'globe.select_destination': 'SELECCIONAR DESTINO:',

      // Hubs - Short Names (Tabs)
      'globe.hub_bue_tab': 'Buenos Aires',
      'globe.hub_mia_tab': 'Miami',
      'globe.hub_mad_tab': 'Madrid',
      'globe.hub_lon_tab': 'Londres',
      'globe.hub_tok_tab': 'Tokio',

      // Hubs - Full City Names
      'globe.hub_bue_city': 'Buenos Aires, Argentina',
      'globe.hub_mia_city': 'Miami, Estados Unidos',
      'globe.hub_mad_city': 'Madrid, España',
      'globe.hub_lon_city': 'Londres, Reino Unido',
      'globe.hub_tok_city': 'Tokio, Japón',

      // Hubs - Regions
      'globe.hub_bue_region': 'Atelier Central & Global HQ',
      'globe.hub_mia_region': 'North America Gateway',
      'globe.hub_mad_region': 'Europe Central Gateway',
      'globe.hub_lon_region': 'UK & Northern Europe Hub',
      'globe.hub_tok_region': 'Asia-Pacific Gateway',

      // Hubs - Transit Times
      'globe.hub_bue_time': '24 — 48 hs hábiles',
      'globe.hub_mia_time': '3 — 5 días hábiles',
      'globe.hub_mad_time': '4 — 6 días hábiles',
      'globe.hub_lon_time': '4 — 6 días hábiles',
      'globe.hub_tok_time': '5 — 7 días hábiles',

      // Hubs - Couriers
      'globe.hub_bue_courier': 'Andreani Express / Envíos CABA',
      'globe.hub_mia_courier': 'DHL Express Worldwide',
      'globe.hub_mad_courier': 'DHL Express Priority',
      'globe.hub_lon_courier': 'FedEx International Priority',
      'globe.hub_tok_courier': 'DHL Express Worldwide',

      // Feature Cards (4 Items)
      'globe.feature_origin_title': 'Origen Buenos Aires',
      'globe.feature_origin_desc': 'Diseño, confección y control de calidad riguroso en nuestro taller central argentino.',
      'globe.feature_express_title': 'Despachos Express 48h',
      'globe.feature_express_desc': 'Alianzas con DHL Express y FedEx para entregas prioritarias en las principales capitales.',
      'globe.feature_tracking_title': 'Tracking Satelital',
      'globe.feature_tracking_desc': 'Seguimiento en tiempo real vía WhatsApp y correo desde el minuto cero del despacho.',
      'globe.feature_shipping_title': 'Free Worldwide Shipping',
      'globe.feature_shipping_desc': 'Envío 100% bonificado en órdenes superiores a $150 USD o $120.000 ARS en todo el país.',

      // Benefits Bar
      'benefits.shipping': 'ENVÍO GRATIS MUNDIAL +$100',
      'benefits.quality': 'CALIDAD PREMIUM GARANTIZADA',
      'benefits.returns': 'CAMBIOS Y DEVOLUCIONES 30 DÍAS',

      // Shop & Store Catalog (store.html / tienda.html)
      'shop.title': 'DROPS',
      'shop.drops_title': 'DROPS',
      'shop.hide_filters': 'OCULTAR FILTROS',
      'shop.show_filters': 'MOSTRAR FILTROS',
      'shop.products_count': 'PRODUCTOS',
      'shop.sort_label': 'ORDENAR POR',
      'shop.sort_by': 'ORDENAR POR',
      'shop.sort_featured': 'DESTACADOS',
      'shop.sort_price_low': 'PRECIO: MENOR A MAYOR',
      'shop.sort_price_high': 'PRECIO: MAYOR A MENOR',
      'shop.sort_newest': 'LO MÁS NUEVO',
      'shop.sort_stock': 'STOCK DISPONIBLE',
      'shop.filters': 'FILTROS',
      'shop.clear_filters': 'LIMPIAR FILTROS',
      'shop.category': 'CATEGORÍA',
      'shop.filter_category': 'CATEGORÍA',
      'shop.cat_tops': 'Remeras & Camisas',
      'shop.cat_hoodies': 'Buzos & Camperas',
      'shop.cat_bottoms': 'Jeanes & Pantalones',
      'shop.cat_sets': 'Conjuntos',
      'shop.cat_new_drop': 'New Drops',
      'shop.cat_sale': 'Sale / Ofertas',
      'shop.size': 'TALLE',
      'shop.size_label': 'TALLE',
      'shop.filter_size': 'TALLE',
      'shop.color': 'COLOR',
      'shop.color_label': 'COLOR',
      'shop.availability': 'DISPONIBILIDAD',
      'shop.filter_availability': 'DISPONIBILIDAD',
      'shop.in_stock': 'En stock',
      'shop.low_stock': 'Últimas unidades',
      'shop.sold_out': 'Agotados',
      'shop.empty_title': 'NO SE ENCONTRARON PRODUCTOS',
      'shop.empty_desc': 'Probá cambiando los filtros o buscando con otros términos',
      'shop.no_results': 'No se encontraron productos que coincidan con los filtros seleccionados',
      'shop.empty_reset': 'REINICIAR FILTROS',
      'shop.active_filters': '{count} ACTIVOS',
      'shop.stock_left': '{count} RESTANTES',
      'shop.sold_out_badge': 'SOLD OUT',
      'shop.quick_add_pill': 'AÑADIR:',
      'shop.quick_add_title': 'AÑADIR RÁPIDO',
      'shop.add_to_bag': 'AGREGAR A LA BOLSA',
      'shop.apply_filters': 'APLICAR FILTROS',
      'shop.club_eyebrow': 'DOPAMINE CLUB // MIEMBROS PRIVADOS',
      'shop.club_title': 'ACCESO ANTICIPADO A CADA DROP',
      'shop.club_desc': 'Suscribite al club para enterarte de los próximos lanzamientos antes del sold out global y recibir 10% OFF extra en tu primera compra.',
      'shop.club_cta': 'UNIRME AL CLUB →',

      // Product Detail (producto.html)
      'product.breadcrumb_prefix': 'HOME / TIENDA / ',
      'product.badge_new': 'NEW DROP',
      'product.badge_limited': 'LIMITED',
      'product.badge_drop': 'DROP 01',
      'product.badge_bestseller': 'BEST SELLER',
      'product.explore_3d': 'ARRASTRA PARA EXPLORAR / 360°',
      'product.drag_explore': 'ARRASTRA PARA EXPLORAR / 360°',
      'product.reset_view': 'REINICIAR VISTA',
      'product.in_stock': 'EN STOCK / LISTO PARA ENVIAR',
      'product.units_left': '{count} UNIDADES RESTANTES',
      'product.color': 'Color',
      'product.size': 'Talle',
      'product.size_guide': 'Guía de talles ↗',
      'product.decrease_qty': 'Disminuir cantidad',
      'product.increase_qty': 'Aumentar cantidad',
      'product.qty': 'Cantidad',
      'product.add_to_bag': 'AGREGAR A LA BOLSA',
      'product.added_toast': 'AGREGADO A LA BOLSA',
      'product.sticky_add_to_bag': 'AGREGAR A LA BOLSA →',
      'product.sticky_select_size': 'Elegir talle',
      'product.sticky_transfer': '10% OFF Transf.',
      'product.mp_installments': 'Hasta 6 cuotas sin interés con Mercado Pago',
      'product.mp_badge': 'Hasta 6 cuotas sin interés',
      'product.mp_with': 'con Mercado Pago',
      'product.mp_all_cards': 'Todas las tarjetas y dinero en cuenta',
      'product.mp_subtext': 'Todas las tarjetas y dinero en cuenta',
      'product.promise_shipping': '↗ ENVÍO GRATIS EN COMPRAS > $90.000',
      'product.promise_returns': '↺ 30 DÍAS PARA CAMBIOS Y DEVOLUCIONES',
      'product.promise_mp': 'PAGO SEGURO / MERCADO PAGO',
      'product.promise_checkout': 'PAGO SEGURO / MERCADO PAGO',
      'product.tab_details': 'DETALLES DEL PRODUCTO',
      'product.tab_details_content': 'Diseñado en Buenos Aires. Materiales seleccionados, silueta unisex y construcción pensada para el movimiento',
      'product.tab_details_desc': 'Diseñado en Buenos Aires. Materiales seleccionados, silueta unisex y construcción pensada para el movimiento',
      'product.tab_care': 'MATERIALES & CUIDADO',
      'product.tab_care_content': 'Lavado en frío, del revés. No usar blanqueador. Secar a la sombra',
      'product.tab_care_desc': 'Lavado en frío, del revés. No usar blanqueador. Secar a la sombra',
      'product.tab_shipping': 'ENVÍOS & DEVOLUCIONES',
      'product.tab_shipping_content': 'Enviamos a todo el país. Cambios dentro de los 30 días de recibido el pedido',
      'product.tab_shipping_desc': 'Enviamos a todo el país. Cambios dentro de los 30 días de recibido el pedido',
      'product.related_title': 'También te<br>puede gustar',
      'product.you_may_like': 'También te<br>puede gustar',
      'product.view_all_related': 'VER TODO →',
      'product.transfer_discount': 'con Transferencia (10% OFF)',
      'product.installments_text': '3 cuotas sin interés de {amount} o hasta 6 cuotas con Mercado Pago',

      // Cart Drawer & Page (carrito.html)
      'cart.drawer_title': 'MI COMPRA',
      'cart.drawer_close_aria': 'Cerrar bolsa',
      'cart.empty_msg': 'Tu bolsa está vacía',
      'cart.empty_link': 'Encontrá tu energía',
      'cart.find_energy': 'Encontrá tu energía',
      'cart.free_shipping_success': '¡Tenés envío gratis!',
      'cart.free_shipping_missing': '¡Te faltan {amount} para el Envío Gratis!',
      'cart.installments_free': '¡Tenés 6 cuotas sin interés!',
      'cart.calc_shipping_btn': 'CALCULAR ENVÍO >',
      'cart.zip_placeholder': 'CÓDIGO POSTAL / CP',
      'cart.total': 'TOTAL',
      'cart.subtotal': 'Subtotal',
      'cart.checkout_btn': 'FINALIZAR COMPRA →',
      'cart.continue_shopping': '< Seguir comprando',
      'cart.continue_shopping_btn': 'SEGUIR COMPRANDO →',
      'cart.view_cart': 'Ver carrito >',
      'cart.recommend_add': 'Agregar',
      'cart.home': 'HOME',
      'cart.breadcrumb': 'TU BOLSA',
      'cart.your_bag': 'TU BOLSA',
      'cart.eyebrow': 'CHECKOUT DIRECTO // DROP 01',
      'cart.title': 'TU<br>BOLSA',
      'cart.bag_heading': 'TU<br>BOLSA',
      'cart.desc': 'Revisá tus piezas antes de finalizar la compra. Tus productos quedan guardados en este dispositivo',
      'cart.bag_desc': 'Revisá tus piezas antes de finalizar la compra. Tus productos quedan guardados en este dispositivo',
      'cart.browse_drops': 'EXPLORAR DROPS DISPONIBLES →',
      'cart.summary_title': 'Resumen de Compra',
      'cart.shipping_promo': 'ENVÍO GRATIS EN COMPRAS MAYORES A $90.000',
      'cart.free_shipping_copy': 'ENVÍO GRATIS EN COMPRAS MAYORES A $90.000',
      'cart.shipping_cost': 'Costo de Envío',
      'cart.shipping_free': 'GRATIS',
      'cart.zip_label': 'CÓDIGO POSTAL / CP *',
      'cart.postal_label': 'CÓDIGO POSTAL / CP *',
      'cart.btn_calc': 'CALCULAR',
      'cart.phone_label': 'TELÉFONO MÓVIL (NOTIFICACIONES SMS) *',
      'cart.btn_checkout_mp': 'PAGAR CON MERCADO PAGO ⚡',
      'cart.mp_badge_text': '6 CUOTAS SIN INTERÉS // ACREDITACIÓN INMEDIATA',
      'cart.card_types': 'Débito, Crédito, Dinero en cuenta y Transferencias',
      'cart.mp_installments': 'Hasta 6 cuotas sin interés',
      'cart.mp_with': 'con Mercado Pago',
      'cart.page_breadcrumb': 'HOME / TU BOLSA',
      'cart.page_title': 'TU<br>BOLSA',
      'cart.page_desc': 'Revisá tus piezas antes de finalizar la compra. Tus productos quedan guardados en este dispositivo',
      'cart.label_zip': 'CÓDIGO POSTAL / CP *',
      'cart.label_phone': 'TELÉFONO MÓVIL (NOTIFICACIONES SMS) *',
      'cart.item_variant': 'Talle: {size} Color: {color}',
      'cart.remove_aria': 'Eliminar {name}',

      // Newsletter & Contact (contacto.html)
      'contact.breadcrumb': 'NEWSLETTER & CLUB',
      'contact.eyebrow': 'EARLY ACCESS // PRIVATE CLUB',
      'contact.heading': 'UNITE AL CLUB<br>NUNCA TE PIERDAS UN DROP',
      'contact.title': 'UNITE AL CLUB<br>NUNCA TE PIERDAS UN DROP',
      'contact.desc': 'Suscribite para recibir acceso anticipado exclusivo a cada lanzamiento limitado, códigos de descuento privados e información sobre ofertas y colecciones antes que nadie',
      'contact.name_label': 'NOMBRE COMPLETO',
      'contact.email_label': 'CORREO ELECTRÓNICO *',
      'contact.consent': 'Acepto recibir novedades sobre drops exclusivos, ofertas y lanzamientos de Dopamine',
      'contact.submit': 'UNIRME AL CLUB →',
      'contact.submit_btn': 'UNIRME AL CLUB →',
      'contact.back_to_shop': 'EXPLORAR LA TIENDA AHORA ↗',
      'contact.success': '¡Bienvenido al Club Dopamine! Te enviamos un correo de confirmación.',
      'contact.error': 'Por favor ingresá un correo electrónico válido.',
      'contact.channels_eyebrow': 'DIRECT CONTACT // REDES & ATENCIÓN',
      'contact.channels_title': 'CANALES OFICIALES DE ATENCIÓN & COMUNIDAD',
      'contact.wa_desc': 'Atención personalizada directa, consultas sobre pedidos, talles y envíos',
      'contact.wa_action': 'INICIAR CHAT ↗',
      'contact.ig_desc': 'Drops exclusivos, adelantos, lookbooks y comunidad streetwear',
      'contact.tt_desc': 'Fitting guides, backstage de producción, styling y detalles de prendas',
      'contact.sp_desc': 'Playlists curadas oficialmente con la energía sonora del atelier Dopamine',
      'contact.sp_action': 'ESCUCHAR SOUNDTRACK ↗',
      'contact.x_desc': 'Alertas de drops relámpago, comunicados técnicos y actualizaciones de stock',

      // Social Media & Networks
      'social.instagram': 'Instagram Oficial Dopamine',
      'social.tiktok': 'TikTok Oficial Dopamine',
      'social.twitter': 'X (Twitter) Oficial Dopamine',
      'social.spotify': 'Spotify Oficial Dopamine',
      'social.whatsapp': 'WhatsApp Soporte & Ventas Dopamine',
      'social.youtube': 'YouTube Oficial Dopamine',

      // Login, Register & Auth (login.html)
      'auth.title': 'Ingresá tu correo electrónico para unirte o iniciar sesión',
      'auth.subtitle': 'Accedé a drops exclusivos, seguimiento de pedidos y beneficios de miembro',
      'auth.title_login': 'MI CUENTA',
      'auth.title_register': 'REGISTRO',
      'auth.subtitle_login': 'Ingresá a tu cuenta para gestionar pedidos y drops exclusivos',
      'auth.subtitle_register': 'Registrate para acceder a preventas, envíos gratis y beneficios',
      'auth.profile_badge': '✓ MEMBER CLUB // CONECTADO VÍA EMAIL',
      'auth.explore_drops': 'EXPLORAR DROPS EXCLUSIVOS ↗',
      'auth.back_to_shop': 'EXPLORAR LA TIENDA SIN CUENTA ↗',
      'auth.logout_btn': 'CERRAR SESIÓN',
      'auth.tab_login': 'INICIAR SESIÓN',
      'auth.tab_register': 'CREAR CUENTA',
      'auth.email_label': 'Correo electrónico*',
      'auth.pass_label': 'Contraseña*',
      'auth.password_label': 'Contraseña*',
      'auth.show_pass': 'VER',
      'auth.remember_me': 'Recordarme',
      'auth.forgot_pass': '¿Olvidaste tu contraseña?',
      'auth.forgot_password': '¿Olvidaste tu contraseña?',
      'auth.btn_continue': 'Continuar →',
      'auth.submit_login': 'Continuar →',
      'auth.or_continue': 'O CONTINUAR CON',
      'auth.google_btn': 'Google',
      'auth.first_name': 'Nombre*',
      'auth.last_name': 'Apellidos*',
      'auth.name_label': 'Nombre completo*',
      'auth.pass_min8': 'Contraseña* (mínimo 8 caracteres)',
      'auth.dob_label': 'Fecha de nacimiento',
      'auth.birthdate_label': 'Fecha de nacimiento',
      'auth.dob_day': 'Día*',
      'auth.dob_month': 'Mes*',
      'auth.dob_year': 'Año*',
      'auth.birthdate_day': 'Día',
      'auth.birthdate_month': 'Mes',
      'auth.birthdate_year': 'Año',
      'auth.terms_accept': 'Acepto la <strong style="text-decoration: underline;">Política de privacidad</strong> y los <strong style="text-decoration: underline;">Términos de uso</strong> de Dopamine',
      'auth.btn_create_account': 'Crear una cuenta',
      'auth.submit_register': 'Crear una cuenta',
      'auth.or_create': 'O CREAR CUENTA CON',
      'auth.btn_google_reg': 'REGISTRARME CON GOOGLE',
      'auth.code_sent': 'Hemos enviado un código de 6 dígitos a',
      'auth.edit_email': 'Editar',
      'auth.code_label': 'Código de 6 dígitos*',
      'auth.resend_in': 'Volver a enviar en',
      'auth.resend_btn': 'Volver a enviar código ↻',
      'auth.terms_continue': 'Al continuar, acepto la <strong style="text-decoration: underline;">Política de privacidad</strong> y los <strong style="text-decoration: underline;">Términos de uso</strong> de Dopamine',
      'auth.btn_verify': 'Verificar código y continuar →',
      'auth.profile_title': 'PERFIL VINCULADO',
      'auth.account_status': 'ESTADO DE CUENTA:',
      'auth.verified': '✓ VERIFICADA',
      'auth.auth_method': 'MÉTODO DE INGRESO:',
      'auth.reg_date': 'FECHA DE REGISTRO:',
      'auth.birthdate': 'NACIMIENTO:',
      'auth.not_specified': 'No especificada',
      'auth.member_badge': 'DOPAMINE MEMBER CLUB',

      // Validation & Interactive Form Feedback
      'validation.email_required': 'Ingresá tu correo electrónico',
      'validation.email_invalid': 'Ingresá un correo electrónico válido (ej: usuario@email.com)',
      'validation.name_required': 'Ingresá tu nombre completo',
      'validation.firstname_required': 'Ingresá tu nombre',
      'validation.lastname_required': 'Ingresá tu apellido',
      'validation.pass_required': 'Ingresá tu contraseña',
      'validation.pass_min8': 'La contraseña debe tener al menos 8 caracteres',
      'validation.dob_required': 'Completá tu fecha de nacimiento',
      'validation.dob_invalid': 'Ingresá una fecha de nacimiento válida',
      'validation.dob_age': 'Debes tener al menos 13 años para registrarte',
      'validation.terms_required': 'Debés aceptar la Política de privacidad y los Términos',
      'validation.consent_required': 'Debés aceptar recibir novedades para continuar',
      'validation.otp_required': 'Ingresá el código de 6 dígitos',
      'validation.otp_digits': 'El código debe tener exactamente 6 números',
      'validation.otp_invalid': 'Código incorrecto. Verificá los 6 dígitos recibidos',
      'validation.zip_required': 'Ingresá tu código postal',
      'validation.zip_invalid': 'Ingresá un código postal argentino válido de 4 dígitos (ej: 1414, 5000, 2000)',
      'validation.phone_required': 'Ingresá tu teléfono móvil para el envío',
      'validation.phone_invalid': 'Ingresá un teléfono móvil válido de 10 dígitos (ej: 11 2345 6789)',
      'validation.footer_email_empty': 'Ingresá tu email para suscribirte',
      'validation.footer_email_invalid': 'Formato de email incorrecto',
      'validation.footer_success': '✓ ¡TE UNISTE AL CLUB! REVISÁ TU CORREO',

      // Admin Dashboard (admin-clientes.html)
      'admin.meta_title': 'DOPAMINE — Panel de Gestión de Clientes (Admin)',
      'admin.back_store': 'VOLVER A LA TIENDA ↗',
      'admin.title': 'BASE DE CLIENTES & REGISTROS',
      'admin.subtitle': 'Consola de monitoreo de usuarios, contraseñas ingresadas e inicie de sesión con Google',
      'admin.export_csv': '📥 EXPORTAR A EXCEL / CSV',
      'admin.stat_total': 'TOTAL CLIENTES',
      'admin.stat_google': 'CONECTADOS VÍA GOOGLE',
      'admin.stat_manual': 'CON CONTRASEÑA MANUAL',
      'admin.stat_email': 'CON CONTRASEÑA MANUAL',
      'admin.stat_active': 'ACTIVIDAD EN 24H',
      'admin.search_placeholder': 'Buscar por cliente, email o método de acceso...',
      'admin.filter_all': 'TODOS LOS PROVEEDORES',
      'admin.filter_google': 'SOLO GOOGLE',
      'admin.filter_email': 'SOLO EMAIL / CONTRASEÑA',
      'admin.show_passwords': 'MOSTRAR CONTRASEÑAS',
      'admin.add_test_user': 'AGREGAR CLIENTE DE PRUEBA',
      'admin.reset_db': 'REINICIAR BASE DE DATOS',
      'admin.clear_data': '🗑 REINICIAR BASE DE DATOS',
      'admin.th_customer': 'CLIENTE',
      'admin.th_email': 'CORREO ELECTRÓNICO',
      'admin.th_provider': 'PROVEEDOR',
      'admin.th_password': 'CONTRASEÑA INGRESADA',
      'admin.th_dob': 'FECHA NACIMIENTO',
      'admin.th_registered': 'FECHA REGISTRO',
      'admin.th_last_login': 'ÚLTIMO ACCESO',
      'admin.th_actions': 'ACCIONES',
      'admin.col_user': 'USUARIO / CLIENTE',
      'admin.col_email': 'EMAIL REGISTRADO',
      'admin.col_method': 'MÉTODO DE INGRESO',
      'admin.col_password': 'CONTRASEÑA REGISTRADA',
      'admin.col_birthdate': 'FECHA NACIMIENTO',
      'admin.col_date': 'FECHA & HORA',
      'admin.col_actions': 'ACCIONES',
      'admin.no_users': 'No hay usuarios registrados aún en la base local.',

      // Search Modal
      'search.placeholder': 'BUSCAR PRODUCTOS...',
      'search.close_aria': 'Cerrar búsqueda',
      'search.no_results': 'No se encontraron productos para "{query}"',

      // Mobile Menu
      'menu.title': 'MENU',
      'menu.drops_eyebrow': 'DROPS // BUENOS AIRES',
      'menu.categories_eyebrow': 'COLECCIONES & PRENDAS',
      'menu.info_eyebrow': 'INFO & SOPORTE',
      'menu.shop_all': 'SHOP ALL',
      'menu.tops': 'REMERAS & CAMISAS',
      'menu.hoodies': 'BUZOS & CAMPERAS',
      'menu.bottoms': 'JEANES & PANTALONES',
      'menu.sets': 'CONJUNTOS',
      'menu.new_drop': 'NEW DROP',
      'menu.sale': 'SALE',
      'menu.about': 'ABOUT US // HISTORIA',
      'menu.contact': 'CONTACTO & SOPORTE',
      'menu.account': 'CLUB / MI CUENTA',
      'menu.account_desc': 'Acceso a drops y beneficios',
      'menu.account_member': 'MEMBER CLUB ACTIVO',
      'menu.language': 'IDIOMA',
      'menu.theme': 'TEMA',
      'menu.theme_dark': 'MODO OSCURO',
      'menu.theme_light': 'MODO CLARO',
      'menu.social': 'SIGUENOS // SOCIAL',
      'menu.social_title': 'REDES & COMUNIDAD',

      // Footer
      'footer.brand_desc': 'High performance streetwear engineered in Buenos Aires. Limited releases only',
      'footer.email_placeholder': 'ENTER EMAIL FOR DROPS',
      'footer.email_submit_aria': 'Suscribirse',
      'footer.nav_title': 'NAVIGATION',
      'footer.care_title': 'CUSTOMER CARE',
      'footer.legal_title': 'LEGAL & SOCIAL',
      'footer.nav_drops': 'DROPS',
      'footer.nav_about': 'ABOUT US',
      'footer.nav_contact': 'CONTACT',
      'footer.care_shipping': 'SHIPPING & RETURNS',
      'footer.care_size_guide': 'SIZE GUIDE',
      'footer.care_tracking': 'ORDER TRACKING',
      'footer.care_faq': 'FAQ',
      'footer.legal_terms': 'TERMS OF SERVICE',
      'footer.legal_privacy': 'PRIVACY POLICY',
      'footer.legal_cookies': 'COOKIE PREFERENCES',
      'footer.copyright': '2026 © DOPAMINE APPARATUS',

      // 404 Error Page (404.html)
      'error404.badge': 'SYS.ERR // 404_NULL_POINTER',
      'error404.radar': 'RADAR STATUS: SIGNAL LOST [LAT: -34.6037, LON: -58.3816]',
      'error404.glitch_code': '404',
      'error404.title': '404 // DROP NO ENCONTRADO',
      'error404.subtitle': 'LA SEÑAL SE HA PERDIDO EN EL SISTEMA',
      'error404.desc': 'La coordenada que estás intentando rastrear no existe, fue movida o correspondía a un drop exclusivo de tirada limitada que ya expiró en el inventario.',
      'error404.btn_home': 'VOLVER AL INICIO',
      'error404.btn_shop': 'EXPLORAR DROPS',
      'error404.quick_title': 'RUTAS DIRECTAS AL INVENTARIO:',
      'error404.cat_tops': 'REMERAS & CAMISAS',
      'error404.cat_hoodies': 'BUZOS & CAMPERAS',
      'error404.cat_bottoms': 'JEANES & PANTALONES',
      'error404.cat_sets': 'CONJUNTOS',
      'error404.search_label': 'RASTREAR PIEZA DIRECTA:',
      'error404.search_placeholder': 'Buscar hoodie, remera, cargo...',
      'error404.search_btn': 'RASTREAR →',
      'error404.telemetry_host': 'NODO PRINCIPAL: DOPAMINE_APPARATUS_01',
      'error404.telemetry_status': 'ESTADO: OBJETO NO ENCONTRADO EN SERVIDOR',
      'error404.telemetry_action': 'ACCIÓN RECOMENDADA: RECONECTAR AL CATÁLOGO',

      // Exit Intent Modal / Recovery
      'exit.badge': '// BENEFICIO EXCLUSIVO',
      'exit.title': 'ESPERA. NO TE VAYAS CON LAS MANOS VACÍAS',
      'exit.subtitle': 'DESBLOQUEÁ 10% OFF EXTRA EN TU PRIMER DROP',
      'exit.desc': 'Acceso prioritario y cupón de beneficio exclusivo para miembros en todas nuestras piezas de alta costura urbana.',
      'exit.code_label': 'CÓDIGO DE BENEFICIO:',
      'exit.code': 'DOPAMINE10',
      'exit.copy_btn': 'COPIAR CÓDIGO',
      'exit.copied': '¡CÓDIGO COPIADO!',
      'exit.btn_shop': 'USAR DESCUENTO EN TIENDA →',
      'exit.dismiss': 'No gracias, prefiero continuar sin descuento'
    },

    en: {
      // Meta & Site Headers
      'meta.title_home': 'DOPAMINE — High Performance Streetwear | Official Store',
      'meta.desc_home': 'Dopamine streetwear. Clean silhouettes, bold attitude and urban wear engineered for movement. Limited drops from Buenos Aires.',
      'meta.title_store': 'DOPAMINE — Exclusive Collection & Drops | Official Store',
      'meta.title_shop': 'DOPAMINE — Exclusive Collection & Drops | Official Store',
      'meta.desc_store': 'Explore the official Dopamine Streetwear catalog: oversized hoodies, heavyweight tees, cargo pants, and limited edition urban apparel.',
      'meta.desc_shop': 'Explore the official Dopamine Streetwear catalog: oversized hoodies, heavyweight tees, cargo pants, and limited edition urban apparel.',
      'meta.title_product': 'DOPAMINE — Product Details | Streetwear Drop',
      'meta.desc_product': 'Explore craftsmanship, premium heavyweight textiles, size guidelines, and technical specifications for Dopamine garments.',
      'meta.title_cart': 'DOPAMINE — Shopping Bag & Checkout',
      'meta.desc_cart': 'Review selected pieces, apply exclusive promo codes, and complete your order swiftly and securely at Dopamine Streetwear.',
      'meta.title_contact': 'DOPAMINE — Official Contact & Support',
      'meta.desc_contact': 'Connect with the official Dopamine Streetwear team. Customer support, exclusive drop registrations, business inquiries, and help.',
      'meta.title_login': 'DOPAMINE — Account Access & Registration',
      'meta.desc_login': 'Sign in or create a Dopamine Streetwear account to track shipments, view order history, and access priority member drops.',
      'meta.title_admin': 'DOPAMINE — Customer Management Dashboard (Admin)',
      'meta.desc_admin': 'Internal administration console and customer database for Dopamine Streetwear.',
      'meta.title_404': 'DOPAMINE — 404 // DROP NOT FOUND',
      'meta.desc_404': 'The signal has been lost in the system. The garment or page you are tracking does not exist or was part of a limited Dopamine drop.',

      // Top Micro-Marquee Ticker
      'marquee.transfer': '10% EXTRA OFF VIA BANK TRANSFER',
      'marquee.edition': 'BUENOS AIRES STREETWEAR LIMITED EDITION',
      'marquee.shipping': 'NATIONWIDE SHIPPING DROP 01 / 26',

      // Preloader / Brand Loading Screen
      'loader.aria_label': 'Loading Dopamine Streetwear',
      'loader.initializing': 'INITIALIZING SYSTEM // BUENOS AIRES',
      'loader.status': 'DROP 01/26',

      // Header Navigation
      'nav.drops': 'DROPS',
      'nav.contact': 'CONTACT',
      'nav.search_aria': 'Search',
      'nav.account_aria': 'My Account',
      'nav.theme_aria': 'Switch theme (Light / Dark)',
      'nav.cart_aria': 'Shopping Bag',
      'nav.menu_open_aria': 'Open menu',
      'nav.menu_close_aria': 'Close menu',
      'nav.lang_toggle_aria': 'Switch language (ES / EN)',
      'nav.back_to_store': 'BACK TO STORE ↗',
      'nav.home_aria': 'Dopamine Home',
      'nav.back_to_top_aria': 'Back to top',
      'ui.back_to_top': 'Back to top',
      'ui.back_to_top_short': 'TOP',

      // Hero Section (index.html)
      'hero.headline': 'ACTIVATE<br>YOUR<br>POTENTIAL',
      'hero.tagline': 'HIGH PERFORMANCE STREETWEAR. BUENOS AIRES',
      'hero.cta': 'SHOP COLLECTION →',
      'hero.cta_drops': 'EXPLORE DROPS ↗',

      // Seamless Marquee Strip
      'marquee.drop': 'DROP 01 / 26',
      'marquee.brand': 'DOPAMINE STREETWEAR',
      'marquee.city': 'BUENOS AIRES',
      'marquee.limited': 'LIMITED EDITION',
      'marquee.performance': 'HIGH PERFORMANCE',
      'marquee.movement': 'BUILT FOR MOVEMENT',

      // Categories
      'categories.title': 'COLLECTIONS',
      'categories.view_all': 'EXPLORE ALL →',
      'categories.explore': 'EXPLORE →',
      'categories.tops': 'TEES & SHIRTS',
      'categories.hoodies': 'HOODIES & JACKETS',
      'categories.bottoms': 'JEANS & PANTS',
      'categories.sets': 'SETS',

      // Pre-Footer CTA Reinforcement Section
      'prefooter.eyebrow': '// DROP 01 / LIMITED EDITION',
      'prefooter.title': "DON'T MISS OUT ON THE CULTURE",
      'prefooter.desc': 'High-performance streetwear engineered in strictly limited batches. Designed and crafted in Buenos Aires.',
      'prefooter.cta_shop': 'SHOP FULL CATALOG →',
      'prefooter.cta_club': 'JOIN THE PRIVATE CLUB ↗',

      // Featured Products (index.html)
      'featured.title': 'FEATURED PIECES',
      'featured.view_all': 'VIEW ALL →',
      'featured.quick_add': 'ADD:',
      'featured.transfer_note': 'with Transfer (10% OFF)',

      // Scroll Reveal Text
      'scroll.unleashing': 'UNLEASHING THE REWARD SYSTEM',
      'scroll.activate': 'ACTIVATE YOUR POTENTIAL',

      // Collection Banner
      'banner.eyebrow': 'DROP 01 / 26',
      'banner.title': 'THE NEW URBAN UNIFORM',
      'banner.desc': 'Our debut collection establishes the foundation. Engineered without compromise in Buenos Aires',
      'banner.cta': 'DISCOVER →',

      // Brand Story Section
      'story.title': 'OUR STORY',
      'story.p1': 'Dopamine was born on the streets with a singular purpose: to create garments that make you feel invincible. We do not chase trends, we engineer the uniform of tomorrow for those who move with intent',
      'story.p2': 'Each piece is meticulously constructed with premium fabrics, paying strict attention to every stitch and seam. We value quality over quantity',
      'story.stat1_label': 'GSM COTTON',
      'story.stat1_desc': 'Heavyweight structured cotton, built to endure',
      'story.stat2_label': 'LIMITED PIECES',
      'story.stat2_desc': 'Limited release per drop. No restocks',
      'story.stat3_label': 'HEADQUARTERS',
      'story.stat3_desc': 'Designed and tailored at our atelier in Buenos Aires',

            // Worldwide Shipping & 3D Logistics Globe Section
      'globe.title': 'From Buenos Aires to the World',
      'globe.subtitle': 'Every <strong>DOPAMINE</strong> drop is crafted and dispatched from our central atelier in Buenos Aires with priority coverage and real-time tracking to over 180 destinations.',
      'globe.transit_label': 'TRANSIT TIME',
      'globe.courier_label': 'ASSIGNED COURIER',
      'globe.coverage_link': 'Worldwide coverage & tracking to 180+ countries →',
      'globe.select_destination': 'SELECT DESTINATION:',

      // Hubs - Short Names (Tabs)
      'globe.hub_bue_tab': 'Buenos Aires',
      'globe.hub_mia_tab': 'Miami',
      'globe.hub_mad_tab': 'Madrid',
      'globe.hub_lon_tab': 'London',
      'globe.hub_tok_tab': 'Tokyo',

      // Hubs - Full City Names
      'globe.hub_bue_city': 'Buenos Aires, Argentina',
      'globe.hub_mia_city': 'Miami, United States',
      'globe.hub_mad_city': 'Madrid, Spain',
      'globe.hub_lon_city': 'London, United Kingdom',
      'globe.hub_tok_city': 'Tokyo, Japan',

      // Hubs - Regions
      'globe.hub_bue_region': 'Central Atelier & Global HQ',
      'globe.hub_mia_region': 'North America Gateway',
      'globe.hub_mad_region': 'Europe Central Gateway',
      'globe.hub_lon_region': 'UK & Northern Europe Hub',
      'globe.hub_tok_region': 'Asia-Pacific Gateway',

      // Hubs - Transit Times
      'globe.hub_bue_time': '24 — 48 business hours',
      'globe.hub_mia_time': '3 — 5 business days',
      'globe.hub_mad_time': '4 — 6 business days',
      'globe.hub_lon_time': '4 — 6 business days',
      'globe.hub_tok_time': '5 — 7 business days',

      // Hubs - Couriers
      'globe.hub_bue_courier': 'Andreani Express / CABA Delivery',
      'globe.hub_mia_courier': 'DHL Express Worldwide',
      'globe.hub_mad_courier': 'DHL Express Priority',
      'globe.hub_lon_courier': 'FedEx International Priority',
      'globe.hub_tok_courier': 'DHL Express Worldwide',

      // Feature Cards (4 Items)
      'globe.feature_origin_title': 'Buenos Aires Origin',
      'globe.feature_origin_desc': 'Rigorous design, tailoring, and quality control at our central atelier in Argentina.',
      'globe.feature_express_title': '48h Express Dispatch',
      'globe.feature_express_desc': 'Strategic alliances with DHL Express and FedEx for priority deliveries to major global capitals.',
      'globe.feature_tracking_title': 'Satellite Tracking',
      'globe.feature_tracking_desc': 'Real-time tracking via WhatsApp and email from the exact moment of dispatch.',
      'globe.feature_shipping_title': 'Free Worldwide Shipping',
      'globe.feature_shipping_desc': '100% complimentary shipping on orders over $150 USD or $120,000 ARS nationwide.',

      // Benefits Bar
      'benefits.shipping': 'FREE WORLDWIDE SHIPPING OVER $100',
      'benefits.quality': 'PREMIUM QUALITY GUARANTEED',
      'benefits.returns': '30-DAY RETURNS & EXCHANGES',

      // Shop & Store Catalog (store.html / tienda.html)
      'shop.title': 'DROPS',
      'shop.drops_title': 'DROPS',
      'shop.hide_filters': 'HIDE FILTERS',
      'shop.show_filters': 'SHOW FILTERS',
      'shop.products_count': 'PRODUCTS',
      'shop.sort_label': 'SORT BY',
      'shop.sort_by': 'SORT BY',
      'shop.sort_featured': 'FEATURED',
      'shop.sort_price_low': 'PRICE: LOW TO HIGH',
      'shop.sort_price_high': 'PRICE: HIGH TO LOW',
      'shop.sort_newest': 'NEWEST',
      'shop.sort_stock': 'IN STOCK',
      'shop.filters': 'FILTERS',
      'shop.clear_filters': 'CLEAR FILTERS',
      'shop.category': 'CATEGORY',
      'shop.filter_category': 'CATEGORY',
      'shop.cat_tops': 'Tees & Shirts',
      'shop.cat_hoodies': 'Hoodies & Jackets',
      'shop.cat_bottoms': 'Jeans & Pants',
      'shop.cat_sets': 'Sets',
      'shop.cat_new_drop': 'New Drops',
      'shop.cat_sale': 'Sale / Deals',
      'shop.size': 'SIZE',
      'shop.size_label': 'SIZE',
      'shop.filter_size': 'SIZE',
      'shop.color': 'COLOR',
      'shop.color_label': 'COLOR',
      'shop.availability': 'AVAILABILITY',
      'shop.filter_availability': 'AVAILABILITY',
      'shop.in_stock': 'In Stock',
      'shop.low_stock': 'Low Stock',
      'shop.sold_out': 'Sold Out',
      'shop.empty_title': 'NO PRODUCTS FOUND',
      'shop.empty_desc': 'Try adjusting your filters or search keywords',
      'shop.no_results': 'No products found matching the selected filters',
      'shop.empty_reset': 'RESET FILTERS',
      'shop.active_filters': '{count} ACTIVE',
      'shop.stock_left': '{count} LEFT',
      'shop.sold_out_badge': 'SOLD OUT',
      'shop.quick_add_pill': 'ADD:',
      'shop.quick_add_title': 'QUICK ADD',
      'shop.add_to_bag': 'ADD TO BAG',
      'shop.apply_filters': 'APPLY FILTERS',
      'shop.club_eyebrow': 'DOPAMINE CLUB // PRIVATE MEMBERS',
      'shop.club_title': 'EARLY ACCESS TO EVERY DROP',
      'shop.club_desc': 'Join the club to get notified of upcoming drops before global sell-out and get an extra 10% OFF on your first order.',
      'shop.club_cta': 'JOIN THE CLUB →',

      // Product Detail (producto.html)
      'product.breadcrumb_prefix': 'HOME / SHOP / ',
      'product.badge_new': 'NEW DROP',
      'product.badge_limited': 'LIMITED',
      'product.badge_drop': 'DROP 01',
      'product.badge_bestseller': 'BEST SELLER',
      'product.explore_3d': 'DRAG TO EXPLORE / 360° READY',
      'product.drag_explore': 'DRAG TO EXPLORE / 360° READY',
      'product.reset_view': 'RESET VIEW',
      'product.in_stock': 'IN STOCK / READY TO SHIP',
      'product.units_left': '{count} UNITS LEFT',
      'product.color': 'Color',
      'product.size': 'Size',
      'product.size_guide': 'Size guide ↗',
      'product.decrease_qty': 'Decrease quantity',
      'product.increase_qty': 'Increase quantity',
      'product.qty': 'Quantity',
      'product.add_to_bag': 'ADD TO BAG',
      'product.added_toast': 'ADDED TO BAG',
      'product.sticky_add_to_bag': 'ADD TO BAG →',
      'product.sticky_select_size': 'Select size',
      'product.sticky_transfer': '10% OFF Transfer',
      'product.mp_installments': 'Up to 6 interest-free installments with Mercado Pago',
      'product.mp_badge': 'Up to 6 interest-free installments',
      'product.mp_with': 'with Mercado Pago',
      'product.mp_all_cards': 'All cards and digital wallet balance',
      'product.mp_subtext': 'All cards and digital wallet balance',
      'product.promise_shipping': '↗ FREE SHIPPING OVER $90,000',
      'product.promise_returns': '↺ 30 DAYS TO CHANGE YOUR MIND',
      'product.promise_mp': 'SECURE CHECKOUT / MERCADO PAGO',
      'product.promise_checkout': 'SECURE CHECKOUT / MERCADO PAGO',
      'product.tab_details': 'PRODUCT DETAILS',
      'product.tab_details_content': 'Engineered in Buenos Aires. Hand-picked fabrics, unisex fit and dynamic structure tailored for movement',
      'product.tab_details_desc': 'Engineered in Buenos Aires. Hand-picked fabrics, unisex fit and dynamic structure tailored for movement',
      'product.tab_care': 'MATERIALS & CARE',
      'product.tab_care_content': 'Cold wash inside out. Do not bleach. Hang dry in shade',
      'product.tab_care_desc': 'Cold wash inside out. Do not bleach. Hang dry in shade',
      'product.tab_shipping': 'SHIPPING & RETURNS',
      'product.tab_shipping_content': 'Worldwide shipping available. Exchanges accepted within 30 days of delivery',
      'product.tab_shipping_desc': 'Worldwide shipping available. Exchanges accepted within 30 days of delivery',
      'product.related_title': 'You may<br>also like',
      'product.you_may_like': 'You may<br>also like',
      'product.view_all_related': 'VIEW ALL →',
      'product.transfer_discount': 'with Bank Transfer (10% OFF)',
      'product.installments_text': '3 interest-free installments of {amount} or up to 6 with Mercado Pago',

      // Cart Drawer & Page (carrito.html)
      'cart.drawer_title': 'MY BAG',
      'cart.drawer_close_aria': 'Close bag',
      'cart.empty_msg': 'Your bag is empty',
      'cart.empty_link': 'Find your energy',
      'cart.find_energy': 'Find your energy',
      'cart.free_shipping_success': 'You have free shipping!',
      'cart.free_shipping_missing': 'Add {amount} more for Free Shipping!',
      'cart.installments_free': 'You have 6 interest-free installments!',
      'cart.calc_shipping_btn': 'CALCULATE SHIPPING >',
      'cart.zip_placeholder': 'ZIP CODE',
      'cart.total': 'TOTAL',
      'cart.subtotal': 'Subtotal',
      'cart.checkout_btn': 'CHECKOUT NOW →',
      'cart.continue_shopping': '< Continue shopping',
      'cart.continue_shopping_btn': 'CONTINUE SHOPPING →',
      'cart.view_cart': 'View bag >',
      'cart.recommend_add': 'Add',
      'cart.home': 'HOME',
      'cart.breadcrumb': 'YOUR BAG',
      'cart.your_bag': 'YOUR BAG',
      'cart.eyebrow': 'DIRECT CHECKOUT // DROP 01',
      'cart.title': 'YOUR<br>BAG',
      'cart.bag_heading': 'YOUR<br>BAG',
      'cart.desc': 'Review your pieces before completing checkout. Your items remain saved on this device',
      'cart.bag_desc': 'Review your pieces before completing checkout. Your items remain saved on this device',
      'cart.browse_drops': 'EXPLORE AVAILABLE DROPS →',
      'cart.summary_title': 'Order Summary',
      'cart.shipping_promo': 'FREE SHIPPING ON ORDERS OVER $90,000',
      'cart.free_shipping_copy': 'FREE SHIPPING ON ORDERS OVER $90,000',
      'cart.shipping_cost': 'Shipping Cost',
      'cart.shipping_free': 'FREE',
      'cart.zip_label': 'ZIP CODE / POSTAL CODE *',
      'cart.postal_label': 'ZIP CODE / POSTAL CODE *',
      'cart.btn_calc': 'CALCULATE',
      'cart.phone_label': 'MOBILE PHONE (SMS NOTIFICATIONS) *',
      'cart.btn_checkout_mp': 'PAY WITH MERCADO PAGO ⚡',
      'cart.mp_badge_text': '6 INTEREST-FREE INSTALLMENTS // INSTANT CONFIRMATION',
      'cart.card_types': 'Debit, Credit, Account balance and Bank transfers',
      'cart.mp_installments': 'Up to 6 interest-free installments',
      'cart.mp_with': 'with Mercado Pago',
      'cart.page_breadcrumb': 'HOME / YOUR BAG',
      'cart.page_title': 'YOUR<br>BAG',
      'cart.page_desc': 'Review your pieces before checkout. Your selections stay saved on this device',
      'cart.label_zip': 'ZIP CODE / POSTAL CODE *',
      'cart.label_phone': 'MOBILE PHONE (SMS UPDATES) *',
      'cart.item_variant': 'Size: {size} Color: {color}',
      'cart.remove_aria': 'Remove {name}',

      // Newsletter & Contact (contacto.html)
      'contact.breadcrumb': 'NEWSLETTER & CLUB',
      'contact.eyebrow': 'EARLY ACCESS // PRIVATE CLUB',
      'contact.heading': 'JOIN THE CLUB<br>NEVER MISS A DROP',
      'contact.title': 'JOIN THE CLUB<br>NEVER MISS A DROP',
      'contact.desc': 'Subscribe for exclusive early access to every limited drop, private promotional codes, and early release announcements before anyone else',
      'contact.name_label': 'FULL NAME',
      'contact.email_label': 'EMAIL ADDRESS *',
      'contact.consent': 'I agree to receive updates on exclusive drops, special promotions, and Dopamine releases',
      'contact.submit': 'JOIN THE CLUB →',
      'contact.submit_btn': 'JOIN THE CLUB →',
      'contact.back_to_shop': 'EXPLORE STORE NOW ↗',
      'contact.success': 'Welcome to Dopamine Club! A confirmation email has been dispatched.',
      'contact.error': 'Please provide a valid email address.',
      'contact.channels_eyebrow': 'DIRECT CONTACT // CHANNELS & SUPPORT',
      'contact.channels_title': 'OFFICIAL SUPPORT & COMMUNITY CHANNELS',
      'contact.wa_desc': 'Direct customer care, order tracking, sizing guidance and shipping help',
      'contact.wa_action': 'START CHAT ↗',
      'contact.ig_desc': 'Exclusive drop announcements, lookbooks and global streetwear community',
      'contact.tt_desc': 'Fitting showcases, atelier production behind-the-scenes and styling',
      'contact.sp_desc': 'Officially curated soundscapes engineered at our Buenos Aires atelier',
      'contact.sp_action': 'STREAM SOUNDTRACK ↗',
      'contact.x_desc': 'Flash drop notifications, technical dispatches and real-time inventory updates',

      // Social Media & Networks
      'social.instagram': 'Dopamine Official Instagram',
      'social.tiktok': 'Dopamine Official TikTok',
      'social.twitter': 'Dopamine Official X / Twitter',
      'social.spotify': 'Dopamine Official Spotify Playlist',
      'social.whatsapp': 'Dopamine WhatsApp Support & Sales',
      'social.youtube': 'Dopamine Official YouTube',

      // Login, Register & Auth (login.html)
      'auth.title': 'Enter your email to join or sign in',
      'auth.subtitle': 'Access exclusive drops, order tracking, and member rewards',
      'auth.title_login': 'MY ACCOUNT',
      'auth.title_register': 'REGISTER',
      'auth.subtitle_login': 'Sign in to access your orders, account settings, and exclusive drops',
      'auth.subtitle_register': 'Sign up for priority drop access, free shipping, and member rewards',
      'auth.profile_badge': '✓ MEMBER CLUB // CONNECTED VIA EMAIL',
      'auth.explore_drops': 'EXPLORE EXCLUSIVE DROPS ↗',
      'auth.back_to_shop': 'EXPLORE STORE WITHOUT ACCOUNT ↗',
      'auth.logout_btn': 'LOG OUT',
      'auth.tab_login': 'SIGN IN',
      'auth.tab_register': 'CREATE ACCOUNT',
      'auth.email_label': 'Email address*',
      'auth.pass_label': 'Password*',
      'auth.password_label': 'Password*',
      'auth.show_pass': 'SHOW',
      'auth.remember_me': 'Remember me',
      'auth.forgot_pass': 'Forgot your password?',
      'auth.forgot_password': 'Forgot your password?',
      'auth.btn_continue': 'Continue →',
      'auth.submit_login': 'Continue →',
      'auth.or_continue': 'OR CONTINUE WITH',
      'auth.google_btn': 'Google',
      'auth.first_name': 'First Name*',
      'auth.last_name': 'Last Name*',
      'auth.name_label': 'Full Name*',
      'auth.pass_min8': 'Password* (minimum 8 characters)',
      'auth.dob_label': 'Date of birth',
      'auth.birthdate_label': 'Date of birth',
      'auth.dob_day': 'Day*',
      'auth.dob_month': 'Month*',
      'auth.dob_year': 'Year*',
      'auth.birthdate_day': 'Day',
      'auth.birthdate_month': 'Month',
      'auth.birthdate_year': 'Year',
      'auth.terms_accept': 'I accept the <strong style="text-decoration: underline;">Privacy Policy</strong> and the <strong style="text-decoration: underline;">Terms of Use</strong> of Dopamine',
      'auth.btn_create_account': 'Create an account',
      'auth.submit_register': 'Create an account',
      'auth.or_create': 'OR CREATE ACCOUNT WITH',
      'auth.btn_google_reg': 'SIGN UP WITH GOOGLE',
      'auth.code_sent': 'We have sent a 6-digit verification code to',
      'auth.edit_email': 'Edit',
      'auth.code_label': '6-digit code*',
      'auth.resend_in': 'Resend in',
      'auth.resend_btn': 'Resend code ↻',
      'auth.terms_continue': 'By continuing, I accept the <strong style="text-decoration: underline;">Privacy Policy</strong> and the <strong style="text-decoration: underline;">Terms of Use</strong> of Dopamine',
      'auth.btn_verify': 'Verify code and continue →',
      'auth.profile_title': 'LINKED PROFILE',
      'auth.account_status': 'ACCOUNT STATUS:',
      'auth.verified': '✓ VERIFIED',
      'auth.auth_method': 'LOGIN METHOD:',
      'auth.reg_date': 'REGISTRATION DATE:',
      'auth.birthdate': 'BIRTHDATE:',
      'auth.not_specified': 'Not specified',
      'auth.member_badge': 'DOPAMINE MEMBER CLUB',

      // Validation & Interactive Form Feedback
      'validation.email_required': 'Please enter your email address',
      'validation.email_invalid': 'Please enter a valid email address (e.g. user@email.com)',
      'validation.name_required': 'Please enter your full name',
      'validation.firstname_required': 'Please enter your first name',
      'validation.lastname_required': 'Please enter your last name',
      'validation.pass_required': 'Please enter your password',
      'validation.pass_min8': 'Password must be at least 8 characters long',
      'validation.dob_required': 'Please complete your date of birth',
      'validation.dob_invalid': 'Please enter a valid date of birth',
      'validation.dob_age': 'You must be at least 13 years old to register',
      'validation.terms_required': 'You must accept the Privacy Policy and Terms',
      'validation.consent_required': 'You must agree to receive updates to continue',
      'validation.otp_required': 'Please enter the 6-digit verification code',
      'validation.otp_digits': 'The code must contain exactly 6 numeric digits',
      'validation.otp_invalid': 'Invalid code. Check the 6-digit number received',
      'validation.zip_required': 'Please enter your postal / ZIP code',
      'validation.zip_invalid': 'Please enter a valid 4-digit postal code (e.g. 1414, 5000)',
      'validation.phone_required': 'Please enter your mobile phone number for shipping updates',
      'validation.phone_invalid': 'Please enter a valid mobile number (e.g. 11 2345 6789)',
      'validation.footer_email_empty': 'Enter your email to subscribe',
      'validation.footer_email_invalid': 'Invalid email format',
      'validation.footer_success': '✓ YOU JOINED THE CLUB! CHECK YOUR INBOX',

      // Admin Dashboard (admin-clientes.html)
      'admin.meta_title': 'DOPAMINE — Customer Management Dashboard (Admin)',
      'admin.back_store': 'BACK TO STORE ↗',
      'admin.title': 'CUSTOMER & REGISTRY DATABASE',
      'admin.subtitle': 'Monitoring console for registered users, credentials and Google OAuth logins',
      'admin.export_csv': '📥 EXPORT TO EXCEL / CSV',
      'admin.stat_total': 'TOTAL CUSTOMERS',
      'admin.stat_google': 'CONNECTED VIA GOOGLE',
      'admin.stat_manual': 'WITH MANUAL PASSWORD',
      'admin.stat_email': 'WITH MANUAL PASSWORD',
      'admin.stat_active': 'ACTIVE IN 24H',
      'admin.search_placeholder': 'Search by customer, email or access method...',
      'admin.filter_all': 'ALL PROVIDERS',
      'admin.filter_google': 'GOOGLE ONLY',
      'admin.filter_email': 'EMAIL / PASSWORD ONLY',
      'admin.show_passwords': 'SHOW PASSWORDS',
      'admin.add_test_user': 'ADD TEST CUSTOMER',
      'admin.reset_db': 'RESET DATABASE',
      'admin.clear_data': '🗑 RESET DATABASE',
      'admin.th_customer': 'CUSTOMER',
      'admin.th_email': 'EMAIL ADDRESS',
      'admin.th_provider': 'PROVIDER',
      'admin.th_password': 'RECORDED PASSWORD',
      'admin.th_dob': 'DATE OF BIRTH',
      'admin.th_registered': 'REGISTRATION DATE',
      'admin.th_last_login': 'LAST LOGIN',
      'admin.th_actions': 'ACTIONS',
      'admin.col_user': 'USER / CUSTOMER',
      'admin.col_email': 'REGISTERED EMAIL',
      'admin.col_method': 'LOGIN METHOD',
      'admin.col_password': 'RECORDED PASSWORD',
      'admin.col_birthdate': 'DATE OF BIRTH',
      'admin.col_date': 'DATE & TIME',
      'admin.col_actions': 'ACTIONS',
      'admin.no_users': 'No registered customers found in local database.',

      // Search Modal
      'search.placeholder': 'SEARCH PRODUCTS...',
      'search.close_aria': 'Close search',
      'search.no_results': 'No products found for "{query}"',

      // Mobile Menu
      'menu.title': 'MENU',
      'menu.drops_eyebrow': 'DROPS // BUENOS AIRES',
      'menu.categories_eyebrow': 'COLLECTIONS & GEAR',
      'menu.info_eyebrow': 'INFO & SUPPORT',
      'menu.shop_all': 'SHOP ALL',
      'menu.tops': 'TEES & SHIRTS',
      'menu.hoodies': 'HOODIES & JACKETS',
      'menu.bottoms': 'JEANS & PANTS',
      'menu.sets': 'SETS',
      'menu.new_drop': 'NEW DROP',
      'menu.sale': 'SALE',
      'menu.about': 'ABOUT US // STORY',
      'menu.contact': 'CONTACT & SUPPORT',
      'menu.account': 'CLUB / MY ACCOUNT',
      'menu.account_desc': 'Access drops & member perks',
      'menu.account_member': 'ACTIVE CLUB MEMBER',
      'menu.language': 'LANGUAGE',
      'menu.theme': 'THEME',
      'menu.theme_dark': 'DARK MODE',
      'menu.theme_light': 'LIGHT MODE',
      'menu.social': 'FOLLOW US // SOCIAL',
      'menu.social_title': 'SOCIAL & COMMUNITY',

      // Footer
      'footer.brand_desc': 'High performance streetwear engineered in Buenos Aires. Limited releases only',
      'footer.email_placeholder': 'ENTER EMAIL FOR DROPS',
      'footer.email_submit_aria': 'Subscribe',
      'footer.nav_title': 'NAVIGATION',
      'footer.care_title': 'CUSTOMER CARE',
      'footer.legal_title': 'LEGAL & SOCIAL',
      'footer.nav_drops': 'DROPS',
      'footer.nav_about': 'ABOUT US',
      'footer.nav_contact': 'CONTACT',
      'footer.care_shipping': 'SHIPPING & RETURNS',
      'footer.care_size_guide': 'SIZE GUIDE',
      'footer.care_tracking': 'ORDER TRACKING',
      'footer.care_faq': 'FAQ',
      'footer.legal_terms': 'TERMS OF SERVICE',
      'footer.legal_privacy': 'PRIVACY POLICY',
      'footer.legal_cookies': 'COOKIE PREFERENCES',
      'footer.copyright': '2026 © DOPAMINE APPARATUS',

      // 404 Error Page (404.html)
      'error404.badge': 'SYS.ERR // 404_NULL_POINTER',
      'error404.radar': 'RADAR STATUS: SIGNAL LOST [LAT: -34.6037, LON: -58.3816]',
      'error404.glitch_code': '404',
      'error404.title': '404 // DROP NOT FOUND',
      'error404.subtitle': 'THE SIGNAL HAS BEEN LOST IN THE SYSTEM',
      'error404.desc': 'The coordinates you are attempting to track do not exist, were relocated, or belonged to an exclusive limited-run drop that has concluded in inventory.',
      'error404.btn_home': 'RETURN HOME',
      'error404.btn_shop': 'EXPLORE DROPS',
      'error404.quick_title': 'DIRECT INVENTORY PATHS:',
      'error404.cat_tops': 'TEES & SHIRTS',
      'error404.cat_hoodies': 'HOODIES & JACKETS',
      'error404.cat_bottoms': 'JEANS & PANTS',
      'error404.cat_sets': 'SETS',
      'error404.search_label': 'TRACK GEAR DIRECTLY:',
      'error404.search_placeholder': 'Search hoodie, tee, cargo...',
      'error404.search_btn': 'SEARCH →',
      'error404.telemetry_host': 'PRIMARY NODE: DOPAMINE_APPARATUS_01',
      'error404.telemetry_status': 'STATUS: RESOURCE NOT FOUND ON SERVER',
      'error404.telemetry_action': 'RECOMMENDED ACTION: RECONNECT TO CATALOG',

      // Exit Intent Modal / Recovery
      'exit.badge': '// BENEFICIO EXCLUSIVO',
      'exit.title': 'WAIT. DO NOT LEAVE EMPTY-HANDED',
      'exit.subtitle': 'UNLOCK 10% EXTRA OFF ON YOUR FIRST DROP',
      'exit.desc': 'Priority access and exclusive member promo discount across all high-performance urban silhouettes.',
      'exit.code_label': 'EXCLUSIVE VOUCHER:',
      'exit.code': 'DOPAMINE10',
      'exit.copy_btn': 'COPY CODE',
      'exit.copied': 'CODE COPIED!',
      'exit.btn_shop': 'USE DISCOUNT IN STORE →',
      'exit.dismiss': 'No thanks, I will continue without discount'
    }
  };

  /**
   * Helper to retrieve currently stored language or default.
   */
  function getLanguage() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === 'es' || saved === 'en') return saved;
      // Auto-detect browser language if not set
      const navLang = (navigator.language || navigator.userLanguage || '').toLowerCase();
      if (navLang.startsWith('en')) return 'en';
    } catch (e) {
      // Fallback on storage errors
    }
    return DEFAULT_LANG;
  }

  let currentLang = getLanguage();

  /**
   * Translate key with variable interpolation (e.g. {count}, {amount})
   */
  function t(key, params = {}) {
    const langDict = translations[currentLang] || translations[DEFAULT_LANG];
    let template = langDict[key];
    
    if (template === undefined) {
      // Fallback to default language dictionary
      template = translations[DEFAULT_LANG][key];
    }
    
    if (template === undefined) {
      return key;
    }

    if (typeof params === 'object' && params !== null) {
      return template.replace(/\{(\w+)\}/g, (_, match) => {
        return params[match] !== undefined ? params[match] : `{${match}}`;
      });
    }

    return template;
  }

  /**
   * Apply translations across the DOM
   */
  function applyTranslations() {
    // 1. Synchronize HTML lang attribute
    document.documentElement.lang = currentLang;

    // 2. Elements with text translation (data-i18n)
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.dataset.i18n;
      if (!key) return;
      const text = t(key);
      if (text.includes('<') && text.includes('>')) {
        el.innerHTML = text;
      } else {
        el.textContent = text;
      }
    });

    // 3. Elements with HTML translation (data-i18n-html)
    document.querySelectorAll('[data-i18n-html]').forEach(el => {
      const key = el.dataset.i18nHtml;
      if (key) el.innerHTML = t(key);
    });

    // 4. Input Placeholders (data-i18n-placeholder)
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.dataset.i18nPlaceholder;
      if (key) el.placeholder = t(key);
    });

    // 5. Aria labels (data-i18n-aria-label)
    document.querySelectorAll('[data-i18n-aria-label]').forEach(el => {
      const key = el.dataset.i18nAriaLabel;
      if (key) el.setAttribute('aria-label', t(key));
    });

    // 6. Titles (data-i18n-title)
    document.querySelectorAll('[data-i18n-title]').forEach(el => {
      const key = el.dataset.i18nTitle;
      if (key) el.setAttribute('title', t(key));
    });

    // 7. Synchronize language toggle switches in Header & Footer
    updateLanguageButtons();

    // 8. Dispatch custom events so dynamic scripts (Catalog, Cart, Auth, Admin) re-render
    document.dispatchEvent(new CustomEvent('dopamine:langchange', { detail: { lang: currentLang } }));
    document.dispatchEvent(new CustomEvent('dopamine:languageChange', { detail: { lang: currentLang } }));
    window.dispatchEvent(new CustomEvent('dopamine:langchange', { detail: { lang: currentLang } }));
    window.dispatchEvent(new CustomEvent('dopamine:languageChange', { detail: { lang: currentLang } }));
  }

  /**
   * Update visual states of all language buttons across DOM
   */
  function updateLanguageButtons() {
    // Header toggle buttons (.lang-toggle-btn)
    document.querySelectorAll('.lang-toggle-btn, [data-lang-toggle]').forEach(btn => {
      const esSpan = btn.querySelector('.lang-es, .lang-opt-es');
      const enSpan = btn.querySelector('.lang-en, .lang-opt-en');
      if (esSpan && enSpan) {
        if (currentLang === 'es') {
          esSpan.classList.add('active', 'is-active');
          enSpan.classList.remove('active', 'is-active');
        } else {
          enSpan.classList.add('active', 'is-active');
          esSpan.classList.remove('active', 'is-active');
        }
      }
      btn.setAttribute('aria-label', t('nav.lang_toggle_aria'));
      btn.setAttribute('title', currentLang === 'es' ? 'Cambiar a Inglés (EN)' : 'Switch to Spanish (ES)');
    });

    // Explicit language setter buttons ([data-set-lang])
    document.querySelectorAll('[data-set-lang]').forEach(btn => {
      const targetLang = btn.dataset.setLang;
      btn.classList.toggle('active', targetLang === currentLang);
    });
  }

  /**
   * Switch language and persist
   */
  function setLanguage(lang) {
    if (lang !== 'es' && lang !== 'en') return;
    currentLang = lang;
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch (e) {
      console.warn('[Dopamine i18n] Error saving language preference:', e);
    }
    applyTranslations();
  }

  /**
   * Toggle between 'es' and 'en'
   */
  function toggleLanguage() {
    const nextLang = currentLang === 'es' ? 'en' : 'es';
    setLanguage(nextLang);
  }

  /**
   * Bind event listeners for all language controls
   */
  function bindEvents() {
    // Global delegation for language toggle and setters
    document.addEventListener('click', event => {
      const toggleBtn = event.target.closest('.lang-toggle-btn, [data-lang-toggle]');
      if (toggleBtn) {
        event.preventDefault();
        event.stopPropagation();
        toggleLanguage();
        return;
      }

      const setBtn = event.target.closest('[data-set-lang]');
      if (setBtn) {
        event.preventDefault();
        event.stopPropagation();
        const targetLang = setBtn.dataset.setLang;
        if (targetLang) setLanguage(targetLang);
      }
    });
  }

  // Pre-initialize lang attribute immediately
  document.documentElement.lang = currentLang;

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      applyTranslations();
      bindEvents();
    });
  } else {
    applyTranslations();
    bindEvents();
  }

  // Export public API globally (with aliases for full backwards compatibility)
  const api = {
    getLanguage,
    getLang: getLanguage,
    setLanguage,
    setLang: setLanguage,
    toggleLanguage,
    toggleLang: toggleLanguage,
    t,
    applyTranslations,
    translations
  };

  window.DopamineI18n = api;
  window.i18n = api;

})(window, document);
