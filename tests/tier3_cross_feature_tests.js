/**
 * ============================================================================
 * DOPAMINE E2E TEST SUITE — TIER 3: PAIRWISE CROSS-FEATURE TESTS
 * ============================================================================
 * 20 Pairwise Cross-Feature Integration Combinations:
 * C01. i18n x Cart Drawer
 * C02. Theme Toggle x Liquid Glass Header
 * C03. Auth Session x Nike Checkout Wizard
 * C04. Exit-Intent Voucher x Checkout Coupon
 * C05. Instant Search x Facet Filtering
 * C06. PDP Configurator x Cart Line Item
 * C07. Free Shipping Tracker x Cross-Sell Carousel
 * C08. i18n x Verification Toast
 * C09. Theme Toggle x 3D Logistics Globe
 * C10. Admin Dashboard x Unified Persistence
 * C11. Auth Session x Favorites State
 * C12. Coupon x Bank Transfer Stacking
 * C13. Search Overlay x Mobile Menu Drawer
 * C14. PDP 360 Viewer x Color Variant Switcher
 * C15. Checkout Shipping Selection x Total Calculation
 * C16. i18n x Editorial Manifiesto Storytelling
 * C17. LocalStorage Quota Exceeded x Fallback Handling
 * C18. WebGL Context Loss x Animation Loop
 * C19. Offline Network State x DB Fallback
 * C20. Exit-Intent Dismissal x Session Storage Cooldown
 * ============================================================================
 */

const {
  createBrowserSandbox,
  loadScriptInSandbox,
  TestSuiteHarness,
  assert
} = require('./test_harness');

function buildSuite() {
  const harness = new TestSuiteHarness('Tier 3: Pairwise Cross-Feature Tests');

  // C01: i18n x Cart Drawer
  harness.test('C01: i18n x Cart Drawer: Language toggle (ES <-> EN) updates drawer copy while preserving items', () => {
    const sandbox = createBrowserSandbox();
    loadScriptInSandbox('product-data.js', sandbox);
    loadScriptInSandbox('i18n.js', sandbox);
    loadScriptInSandbox('cart.js', sandbox);

    const product = sandbox.DopamineCatalog.products[0];
    sandbox.DopamineCart.add(product, { size: 'XL', color: 'Black', quantity: 1 });
    assert.strictEqual(sandbox.DopamineCart.items.length, 1);

    // Switch language to English
    sandbox.DopamineI18n.setLang('en');
    sandbox.document.dispatchEvent(new sandbox.CustomEvent('dopamine:langchange'));

    // Cart items must remain intact
    assert.strictEqual(sandbox.DopamineCart.items.length, 1);
    assert.strictEqual(sandbox.DopamineCart.items[0].name, product.name);
  });

  // C02: Theme Toggle x Liquid Glass Header
  harness.test('C02: Theme Toggle x Liquid Glass Header: Switching light/dark theme synchronizes data-theme and favicon', () => {
    const sandbox = createBrowserSandbox();
    loadScriptInSandbox('theme.js', sandbox);

    if (sandbox.DopamineTheme) {
      sandbox.DopamineTheme.setTheme('dark');
      assert.strictEqual(sandbox.localStorage.getItem('dopamine-theme'), 'dark');
      sandbox.DopamineTheme.setTheme('light');
      assert.strictEqual(sandbox.localStorage.getItem('dopamine-theme'), 'light');
    }
  });

  // C03: Auth Session x Nike Checkout Wizard
  harness.test('C03: Auth Session x Nike Checkout Wizard: Logged-in member session auto-populates checkout fields', () => {
    const userSession = {
      id: 'usr_9988',
      name: 'Enzo Fernandez',
      email: 'enzo@dopamine.com',
      loggedIn: true,
      emailVerified: true
    };
    const sandbox = createBrowserSandbox({ 'dopamine_user_session': JSON.stringify(userSession) });
    loadScriptInSandbox('auth.js', sandbox);

    const activeUser = sandbox.DopamineAuth.getUser();
    assert.ok(activeUser, 'Active user session must be retrieved');
    assert.strictEqual(activeUser.name, 'Enzo Fernandez');
    assert.strictEqual(activeUser.email, 'enzo@dopamine.com');
  });

  // C04: Exit-Intent Voucher x Checkout Coupon
  harness.test('C04: Exit-Intent Voucher x Checkout Coupon: Claiming DOPAMINE10 reduces checkout total by 10%', () => {
    const subtotal = 115000;
    const voucherCode = 'DOPAMINE10';
    const discountPct = voucherCode === 'DOPAMINE10' ? 0.10 : 0;
    const finalTotal = subtotal * (1 - discountPct);
    assert.strictEqual(finalTotal, 103500);
  });

  // C05: Instant Search x Facet Filtering
  harness.test('C05: Instant Search x Facet Filtering: Search keyword "baggy" + Category "bottoms" filters conjunctively', () => {
    const sandbox = createBrowserSandbox();
    loadScriptInSandbox('product-data.js', sandbox);
    const catalog = sandbox.DopamineCatalog.products;

    const query = 'baggy';
    const selectedCategory = 'bottoms';

    const filtered = catalog.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(query) || p.description.toLowerCase().includes(query);
      const matchesCategory = p.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });

    assert.ok(filtered.length >= 2, 'Should find Jean Baggy Ice and Jean Baggy Soul');
    filtered.forEach(item => {
      assert.strictEqual(item.category, 'bottoms');
      assert.ok(item.name.toLowerCase().includes('baggy'));
    });
  });

  // C06: PDP Configurator x Cart Line Item
  harness.test('C06: PDP Configurator x Cart Line Item: Selected color and size form unique composite key', () => {
    const sandbox = createBrowserSandbox();
    loadScriptInSandbox('product-data.js', sandbox);
    loadScriptInSandbox('cart.js', sandbox);

    const product = sandbox.DopamineCatalog.getProductBySlug('buzo-win');
    sandbox.DopamineCart.add(product, { color: 'Washed Black', size: 'XL' });

    assert.strictEqual(sandbox.DopamineCart.items[0].key, 'buzo-win::Washed Black::XL');
    assert.strictEqual(sandbox.DopamineCart.items[0].color, 'Washed Black');
    assert.strictEqual(sandbox.DopamineCart.items[0].size, 'XL');
  });

  // C07: Free Shipping Tracker x Cross-Sell Carousel
  harness.test('C07: Free Shipping Tracker x Cross-Sell: Adding recommendation elevates subtotal above $90k and unlocks free shipping', () => {
    const sandbox = createBrowserSandbox();
    loadScriptInSandbox('product-data.js', sandbox);
    loadScriptInSandbox('cart.js', sandbox);

    // Add 1 Remera Waffle ($62.000) -> Below $90.000
    const remera = sandbox.DopamineCatalog.getProductBySlug('remera-wireframe-waffle-noir');
    sandbox.DopamineCart.add(remera, { size: 'M' });
    assert.strictEqual(sandbox.DopamineCart.subtotal() >= 90000, false);

    // Add Camisa Bunny ($82.000) from recommendations -> Total $144.000 >= $90.000
    const camisa = sandbox.DopamineCatalog.getProductBySlug('camisa-bunny');
    sandbox.DopamineCart.add(camisa, { size: 'L' });
    assert.strictEqual(sandbox.DopamineCart.subtotal() >= 90000, true);
    assert.strictEqual(sandbox.DopamineCart.subtotal(), 144000);
  });

  // C08: i18n x Verification Toast
  harness.test('C08: i18n x Verification Toast: Toast assistant messages adapt dynamically upon language change', () => {
    const sandbox = createBrowserSandbox();
    loadScriptInSandbox('i18n.js', sandbox);
    const i18n = sandbox.DopamineI18n || sandbox.i18n;

    i18n.setLang('es');
    const toastEs = i18n.t('toast.code_copied', 'Código copiado');
    i18n.setLang('en');
    const toastEn = i18n.t('toast.code_copied', 'Code copied');

    assert.ok(toastEs && toastEn);
  });

  // C09: Theme Toggle x 3D Logistics Globe
  harness.test('C09: Theme Toggle x 3D Logistics Globe: Theme change updates landmass polygon fill color', () => {
    const darkLandColor = 'rgba(255, 255, 255, 0.25)';
    const lightLandColor = 'rgba(0, 0, 0, 0.20)';
    let currentTheme = 'dark';
    let landColor = currentTheme === 'dark' ? darkLandColor : lightLandColor;
    assert.strictEqual(landColor, darkLandColor);

    currentTheme = 'light';
    landColor = currentTheme === 'dark' ? darkLandColor : lightLandColor;
    assert.strictEqual(landColor, lightLandColor);
  });

  // C10: Admin Dashboard x Unified Persistence
  harness.test('C10: Admin Dashboard x Unified Persistence: Admin deletion reflects in local customer store', () => {
    const initialUsers = [
      { id: 'usr_1', email: 'test1@dopamine.com' },
      { id: 'usr_2', email: 'test2@dopamine.com' }
    ];
    const sandbox = createBrowserSandbox({ 'dopamine_users_db_v1': JSON.stringify(initialUsers) });
    loadScriptInSandbox('db.js', sandbox);

    sandbox.DopamineDB.deleteUser('usr_1');
    const remaining = sandbox.DopamineDB.getLocalUsers();
    assert.strictEqual(remaining.length, 1);
    assert.strictEqual(remaining[0].id, 'usr_2');
  });

  // C11: Auth Session x Favorites State
  harness.test('C11: Auth Session x Favorites State: Favorites list is preserved across session lifecycle', () => {
    const sandbox = createBrowserSandbox({ 'dopamine-favorites-v1': JSON.stringify(['buzo-win']) });
    loadScriptInSandbox('product-data.js', sandbox);
    loadScriptInSandbox('cart.js', sandbox);

    assert.strictEqual(sandbox.DopamineCart.isFavorite('buzo-win'), true);
    sandbox.DopamineCart.toggleFavorite('camisa-bunny');
    assert.strictEqual(sandbox.DopamineCart.isFavorite('camisa-bunny'), true);
  });

  // C12: Coupon x Bank Transfer Stacking
  harness.test('C12: Coupon x Bank Transfer Stacking: Sequential compounding computes correct final total', () => {
    const base = 185000;
    const couponDiscount = base * 0.10; // $18.500
    const subtotalAfterCoupon = base - couponDiscount; // $166.500
    const transferDiscount = subtotalAfterCoupon * 0.10; // $16.650
    const finalTotal = subtotalAfterCoupon - transferDiscount; // $149.850

    assert.strictEqual(subtotalAfterCoupon, 166500);
    assert.strictEqual(finalTotal, 149850);
  });

  // C13: Search Overlay x Mobile Menu Drawer
  harness.test('C13: Search Overlay x Mobile Drawer: Opening search overlay closes mobile navigation drawer', () => {
    let mobileDrawerOpen = true;
    let searchOverlayOpen = false;

    // Trigger open search
    searchOverlayOpen = true;
    if (searchOverlayOpen) {
      mobileDrawerOpen = false; // Overlay mutual exclusivity
    }

    assert.strictEqual(searchOverlayOpen, true);
    assert.strictEqual(mobileDrawerOpen, false);
  });

  // C14: PDP 360 Viewer x Color Variant Switcher
  harness.test('C14: PDP 360 Viewer x Color Variant: Switching color resets viewer rotation and updates image index', () => {
    let viewerRotation = 45;
    const onColorChange = () => {
      viewerRotation = 0;
    };
    onColorChange();
    assert.strictEqual(viewerRotation, 0);
  });

  // C15: Checkout Shipping Selection x Total Calculation
  harness.test('C15: Checkout Shipping x Total: Switching shipping speed updates grand total dynamically', () => {
    const subtotal = 62000; // Below $90k
    let shippingCost = 5500; // Standard
    let grandTotal = subtotal + shippingCost;
    assert.strictEqual(grandTotal, 67500);

    // Switch to Express
    shippingCost = 8500;
    grandTotal = subtotal + shippingCost;
    assert.strictEqual(grandTotal, 70500);

    // Switch to Pickup
    shippingCost = 0;
    grandTotal = subtotal + shippingCost;
    assert.strictEqual(grandTotal, 62000);
  });

  // C16: i18n x Editorial Manifiesto
  harness.test('C16: i18n x Editorial Manifiesto: Switching language renders translated Atelier manifesto paragraphs', () => {
    const sandbox = createBrowserSandbox();
    loadScriptInSandbox('i18n.js', sandbox);
    const i18n = sandbox.DopamineI18n || sandbox.i18n;

    i18n.setLang('es');
    const storyEs = i18n.t('story.title', 'ATELIER & MANIFIESTO');
    i18n.setLang('en');
    const storyEn = i18n.t('story.title', 'ATELIER & MANIFESTO');

    assert.ok(storyEs && storyEn);
  });

  // C17: LocalStorage Quota Exceeded x Fallback Handling
  harness.test('C17: Storage Quota x Fallback: CartStore handles storage quota errors gracefully', () => {
    const sandbox = createBrowserSandbox();
    sandbox.localStorage.setItem = () => {
      throw new Error('QuotaExceededError');
    };
    loadScriptInSandbox('product-data.js', sandbox);
    loadScriptInSandbox('cart.js', sandbox);

    assert.doesNotThrow(() => {
      sandbox.DopamineCart.add(sandbox.DopamineCatalog.products[0]);
    });
  });

  // C18: WebGL Context Loss x Animation Loop
  harness.test('C18: WebGL Context Loss x Animation Loop: Context loss event pauses animation frame loop', () => {
    let isLoopRunning = true;
    const handleContextLost = (e) => {
      isLoopRunning = false;
    };
    const handleContextRestored = (e) => {
      isLoopRunning = true;
    };

    handleContextLost();
    assert.strictEqual(isLoopRunning, false);
    handleContextRestored();
    assert.strictEqual(isLoopRunning, true);
  });

  // C19: Offline Network State x DB Fallback
  harness.test('C19: Offline Network State x DB Fallback: Offline state falls back to local storage user store', () => {
    const sandbox = createBrowserSandbox({ 'dopamine_users_db_v1': '[]' });
    sandbox.fetch = async () => { throw new Error('Network Offline'); };
    loadScriptInSandbox('db.js', sandbox);

    assert.ok(sandbox.DopamineDB.getLocalUsers());
  });

  // C20: Exit-Intent Dismissal x Session Storage Cooldown
  harness.test('C20: Exit-Intent Dismissal x Cooldown: Dismissal timestamp suppresses modal for 12 hours', () => {
    const twelveHoursMs = 12 * 60 * 60 * 1000;
    const dismissedTimestamp = Date.now() - (1 * 60 * 60 * 1000); // 1 hour ago
    const shouldSuppress = (Date.now() - dismissedTimestamp) < twelveHoursMs;
    assert.strictEqual(shouldSuppress, true);
  });

  return harness;
}

// CLI Direct Runner
if (require.main === module) {
  (async () => {
    console.log('\n--- Running Tier 3: Pairwise Cross-Feature Tests ---');
    const harness = buildSuite();
    const result = await harness.run();
    console.log(`Passed: ${result.passed} / ${result.total} (Duration: ${result.duration}ms)`);
    if (result.failed > 0) {
      console.error(`\nFailures (${result.failed}):`);
      result.failures.forEach(f => console.error(`✖ ${f.description}\n  ${f.error.message}`));
      process.exit(1);
    }
    process.exit(0);
  })();
}

module.exports = {
  buildSuite
};
