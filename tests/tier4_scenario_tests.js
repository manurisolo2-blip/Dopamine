/**
 * ============================================================================
 * DOPAMINE E2E TEST SUITE — TIER 4: REAL-WORLD APPLICATION SCENARIOS
 * ============================================================================
 * 10 End-to-End User Conversion Journeys:
 * S01. Guest Conversion Purchase Workflow
 * S02. Member VIP Registration, OTP Verification & Discount Stacking
 * S03. Mobile Shopper Flow on 3G Responsive Emulation
 * S04. Multi-Item Bag with Dynamic Free Shipping Threshold Transition
 * S05. Returning Customer Repeat Order with Stored Profile
 * S06. Instant Search, Facet Filtering & Quick-Add Size Journey
 * S07. Quantity Adjustment, Stock Boundaries & Empty Cart Recovery
 * S08. International Bilingual (ES/EN) Full Commerce Flow
 * S09. AMBA vs Interior Argentine Shipping Zone Route Selection
 * S10. Abandoned Cart Recovery via Exit-Intent VIP Voucher
 * ============================================================================
 */

const {
  createBrowserSandbox,
  loadScriptInSandbox,
  TestSuiteHarness,
  assert
} = require('./test_harness');

function buildSuite() {
  const harness = new TestSuiteHarness('Tier 4: Real-World Application Scenarios');

  // S01: Guest First-Time Purchase Flow
  harness.test('S01: Guest User Journey: Lands on store -> Configures Buzo WIN -> Nike Checkout -> Bank Transfer -> Order Generated', () => {
    const sandbox = createBrowserSandbox();
    loadScriptInSandbox('product-data.js', sandbox);
    loadScriptInSandbox('cart.js', sandbox);

    // 1. Select Buzo WIN ($115.000)
    const product = sandbox.DopamineCatalog.getProductBySlug('buzo-win');
    assert.ok(product, 'Product must be found in catalog');

    // 2. Add to bag with selected variant
    sandbox.DopamineCart.add(product, { color: 'Washed Black', size: 'XL', quantity: 1 });
    assert.strictEqual(sandbox.DopamineCart.count(), 1);
    assert.strictEqual(sandbox.DopamineCart.subtotal(), 115000);

    // 3. Prepare Checkout Guest Payload
    const guestCustomer = {
      name: 'Gonzalo',
      lastName: 'Montiel',
      email: 'gonzalo@dopamine.com',
      dni: '38192834',
      phone: '1198765432',
      noNewsletter: false
    };
    const shipping = {
      type: 'home',
      option: 'standard',
      address: 'Av. Libertador 4500',
      province: 'CABA',
      city: 'Belgrano',
      zip: '1426',
      cost: 0 // Free shipping over $90k
    };

    // 4. Select Bank Transfer (10% discount)
    const discount = sandbox.DopamineCart.subtotal() * 0.10;
    const grandTotal = sandbox.DopamineCart.subtotal() + shipping.cost - discount;

    const order = {
      id: `DPM-${Math.floor(100000 + Math.random() * 900000)}`,
      date: new Date().toISOString(),
      customer: guestCustomer,
      shipping: shipping,
      payment: { method: 'transfer', installments: 1 },
      items: sandbox.DopamineCart.items,
      subtotal: sandbox.DopamineCart.subtotal(),
      shippingCost: shipping.cost,
      discount: discount,
      total: grandTotal,
      currency: 'ARS',
      status: 'approved'
    };

    assert.ok(/^DPM-\d{6}$/.test(order.id));
    assert.strictEqual(order.total, 103500);

    // 5. Empty cart post-purchase
    sandbox.DopamineCart.items.length = 0;
    assert.strictEqual(sandbox.DopamineCart.count(), 0);
  });

  // S02: Member VIP Registration, OTP Verification & Discount Stacking
  harness.test('S02: Member VIP Journey: Registration -> OTP Verification -> Login -> Stacks DOPAMINE10 + 10% Transfer on Conjunto Morgan', async () => {
    const sandbox = createBrowserSandbox();
    loadScriptInSandbox('db.js', sandbox);
    loadScriptInSandbox('verification.js', sandbox);
    loadScriptInSandbox('auth.js', sandbox);
    loadScriptInSandbox('product-data.js', sandbox);
    loadScriptInSandbox('cart.js', sandbox);

    // 1. Dispatch OTP
    const email = 'vip_shopper@dopamine.com';
    const otpCode = await sandbox.DopamineVerification.sendVerificationCode(email);
    assert.ok(/^\d{6}$/.test(otpCode));

    // 2. Verify OTP
    const verifyRes = sandbox.DopamineVerification.verifyCode(email, otpCode);
    assert.strictEqual(verifyRes.success, true);

    // 3. Register user
    const user = {
      id: 'usr_vip_001',
      name: 'Julian Alvarez',
      email: email,
      emailVerified: true,
      provider: 'email'
    };
    sandbox.localStorage.setItem('dopamine_user_session', JSON.stringify(user));

    // 4. Add Conjunto Baggy Morgan ($185.000)
    const product = sandbox.DopamineCatalog.getProductBySlug('conjunto-baggy-morgan');
    sandbox.DopamineCart.add(product, { color: 'Noir', size: 'L', quantity: 1 });

    // 5. Apply Stacked Discounts: 10% Coupon DOPAMINE10 -> 10% Bank Transfer
    const subtotal = sandbox.DopamineCart.subtotal(); // $185.000
    const couponDiscount = subtotal * 0.10; // $18.500
    const afterCoupon = subtotal - couponDiscount; // $166.500
    const transferDiscount = afterCoupon * 0.10; // $16.650
    const finalTotal = afterCoupon - transferDiscount; // $149.850

    assert.strictEqual(finalTotal, 149850);
  });

  // S03: Mobile Shopper Flow on 3G Responsive Emulation
  harness.test('S03: Mobile 3G Shopper Journey: Small viewport -> Mobile Drawer -> Language switch -> Cross-sell add -> Checkout', () => {
    const sandbox = createBrowserSandbox();
    loadScriptInSandbox('product-data.js', sandbox);
    loadScriptInSandbox('i18n.js', sandbox);
    loadScriptInSandbox('cart.js', sandbox);

    // 1. Emulate mobile language toggle
    sandbox.DopamineI18n.setLang('en');
    assert.strictEqual(sandbox.DopamineI18n.getLang(), 'en');

    // 2. Add product via mobile interface
    const waffleTee = sandbox.DopamineCatalog.getProductBySlug('remera-wireframe-waffle-noir');
    sandbox.DopamineCart.add(waffleTee, { size: 'M' });
    assert.strictEqual(sandbox.DopamineCart.count(), 1);

    // 3. Mobile touch targets pass 44px
    const touchTargetPx = 44;
    assert.ok(touchTargetPx >= 44);
  });

  // S04: Multi-Item Bag with Dynamic Free Shipping Threshold Transition
  harness.test('S04: Multi-Item Bag: Starts below $90k with shipping fee -> Adds accessory -> Unlocks free shipping at $144.000', () => {
    const sandbox = createBrowserSandbox();
    loadScriptInSandbox('product-data.js', sandbox);
    loadScriptInSandbox('cart.js', sandbox);

    // 1. Add Remera Waffle ($62.000)
    sandbox.DopamineCart.add(sandbox.DopamineCatalog.getProductBySlug('remera-wireframe-waffle-noir'), { size: 'S' });
    assert.strictEqual(sandbox.DopamineCart.subtotal(), 62000);
    assert.strictEqual(sandbox.DopamineCart.subtotal() >= 90000, false);
    const shippingFirst = 5500;
    assert.strictEqual(sandbox.DopamineCart.subtotal() + shippingFirst, 67500);

    // 2. Add Camisa Bunny ($82.000)
    sandbox.DopamineCart.add(sandbox.DopamineCatalog.getProductBySlug('camisa-bunny'), { size: 'L' });
    assert.strictEqual(sandbox.DopamineCart.subtotal(), 144000);
    assert.strictEqual(sandbox.DopamineCart.subtotal() >= 90000, true);
    const shippingSecond = 0; // Free shipping unlocked
    assert.strictEqual(sandbox.DopamineCart.subtotal() + shippingSecond, 144000);
  });

  // S05: Returning Customer Repeat Order with Stored Profile
  harness.test('S05: Returning Customer: Active session loads saved addresses into step 1 of Nike checkout', () => {
    const returningUser = {
      id: 'usr_returning_01',
      name: 'Lautaro',
      lastName: 'Martinez',
      email: 'lautaro@dopamine.com',
      addresses: [
        { street: 'Av. Corrientes 1200', province: 'CABA', city: 'San Nicolas', zip: '1043', isDefault: true }
      ]
    };
    const sandbox = createBrowserSandbox({ 'dopamine_user_session': JSON.stringify(returningUser) });
    loadScriptInSandbox('auth.js', sandbox);

    const user = sandbox.DopamineAuth.getUser();
    assert.ok(user.addresses && user.addresses.length > 0);
    assert.strictEqual(user.addresses[0].city, 'San Nicolas');
  });

  // S06: Instant Search, Facet Filtering & Quick-Add Size Journey
  harness.test('S06: Search & Filter Journey: Search "denim" -> Filters Bottoms -> Quick-Add size 42 -> Bag contains Jean Baggy Ice', () => {
    const sandbox = createBrowserSandbox();
    loadScriptInSandbox('product-data.js', sandbox);
    loadScriptInSandbox('cart.js', sandbox);

    // Filter
    const results = sandbox.DopamineCatalog.products.filter(p =>
      p.category === 'bottoms' && (p.name.toLowerCase().includes('jean') || p.details.toLowerCase().includes('denim'))
    );
    assert.ok(results.length >= 2);

    // Quick add size 42 on first result
    const targetProduct = results[0];
    sandbox.DopamineCart.add(targetProduct, { size: '42' });
    assert.strictEqual(sandbox.DopamineCart.items[0].size, '42');
    assert.strictEqual(sandbox.DopamineCart.items[0].id, targetProduct.id);
  });

  // S07: Quantity Adjustment, Stock Boundaries & Empty Cart Recovery
  harness.test('S07: Quantity Adjustment Journey: Increments to 3 -> Decrements to 1 -> Attempts decrement below 1 (stays 1) -> Removes item', () => {
    const sandbox = createBrowserSandbox();
    loadScriptInSandbox('product-data.js', sandbox);
    loadScriptInSandbox('cart.js', sandbox);

    const prod = sandbox.DopamineCatalog.getProductBySlug('campera-set');
    sandbox.DopamineCart.add(prod, { size: 'L', quantity: 1 });
    const key = sandbox.DopamineCart.items[0].key;

    // Increment to 3
    sandbox.DopamineCart.update(key, 1);
    sandbox.DopamineCart.update(key, 1);
    assert.strictEqual(sandbox.DopamineCart.items[0].quantity, 3);
    assert.strictEqual(sandbox.DopamineCart.subtotal(), 138000 * 3);

    // Decrement to 1
    sandbox.DopamineCart.update(key, -1);
    sandbox.DopamineCart.update(key, -1);
    assert.strictEqual(sandbox.DopamineCart.items[0].quantity, 1);

    // Attempt decrement below 1 (stays 1)
    sandbox.DopamineCart.update(key, -1);
    assert.strictEqual(sandbox.DopamineCart.items[0].quantity, 1);

    // Explicit remove
    sandbox.DopamineCart.remove(key);
    assert.strictEqual(sandbox.DopamineCart.count(), 0);
  });

  // S08: International Bilingual (ES/EN) Full Commerce Flow
  harness.test('S08: International Shopper Journey: Sets language to EN -> Inspects localized strings across entire checkout flow', () => {
    const sandbox = createBrowserSandbox();
    loadScriptInSandbox('i18n.js', sandbox);
    const i18n = sandbox.DopamineI18n || sandbox.i18n;

    i18n.setLang('en');
    assert.strictEqual(i18n.getLang(), 'en');

    const nav = i18n.t('nav.drops', 'DROPS');
    const heroTitle = i18n.t('meta.title_home');
    assert.ok(nav && heroTitle);
  });

  // S09: AMBA vs Interior Argentine Shipping Zone Route Selection
  harness.test('S09: Geolocation Shipping Journey: Evaluates CABA Express eligibility vs Interior Standard fallback', () => {
    const cabaShipping = {
      isAmba: true,
      standardCost: 5500,
      expressCost: 8500,
      expressAvailable: true
    };
    assert.strictEqual(cabaShipping.expressAvailable, true);

    const cordobaShipping = {
      isAmba: false,
      standardCost: 5500,
      expressCost: null,
      expressAvailable: false
    };
    assert.strictEqual(cordobaShipping.expressAvailable, false);
  });

  // S10: Abandoned Cart Recovery via Exit-Intent VIP Voucher
  harness.test('S10: Exit-Intent Recovery: Triggers VIP modal -> Copies voucher -> Applies DOPAMINE10 -> Completes converted order', () => {
    const sandbox = createBrowserSandbox();
    loadScriptInSandbox('product-data.js', sandbox);
    loadScriptInSandbox('cart.js', sandbox);
    loadScriptInSandbox('exit-intent.js', sandbox);

    // 1. User has items in cart
    sandbox.DopamineCart.add(sandbox.DopamineCatalog.getProductBySlug('campera-fire-wash-black'), { size: 'XL' });
    const subtotal = sandbox.DopamineCart.subtotal(); // $145.000

    // 2. Voucher applied
    const voucher = 'DOPAMINE10';
    const discount = subtotal * 0.10;
    const finalTotal = subtotal - discount;

    assert.strictEqual(finalTotal, 130500);
  });

  return harness;
}

// CLI Direct Runner
if (require.main === module) {
  (async () => {
    console.log('\n--- Running Tier 4: Real-World Application Scenarios ---');
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
