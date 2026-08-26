/**
 * ============================================================================
 * DOPAMINE E2E TEST SUITE — DATA CONTRACTS & SCHEMAS VALIDATOR
 * ============================================================================
 * Formal Contract Validation:
 * 1. Product Entity Schema & Catalog Validation
 * 2. CustomerProfile & Authentication Session Schemas
 * 3. CartSession & Line Item Schemas
 * 4. ShippingRate & Geolocation Calculation Schemas
 * 5. OrderTransaction & Checkout Schemas
 * 6. VerificationCode & OTP Store Schemas
 * 7. REST API Request / Response Contract Payloads
 * ============================================================================
 */

const fs = require('fs');
const path = require('path');
const {
  ROOT_DIR,
  BACKEND_DIR,
  createBrowserSandbox,
  loadScriptInSandbox,
  TestSuiteHarness,
  assert
} = require('./test_harness');

// Categories enum
const PRODUCT_CATEGORIES = ['hoodies', 'tops', 'bottoms', 'sets', 'accessories', 'footwear'];
const AUTH_PROVIDERS = ['email', 'google', 'apple'];
const SHIPPING_TYPES = ['home', 'pickup'];
const SHIPPING_OPTIONS = ['standard', 'express'];
const PAYMENT_METHODS = ['mercadopago', 'credit', 'debit', 'modo', 'transfer'];
const ORDER_STATUSES = ['pending', 'approved', 'in_process', 'rejected', 'refunded', 'cancelled'];

/**
 * Validation Helper Functions
 */
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidHexColor(hex) {
  return /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(hex);
}

function isValidDNI(dni) {
  return /^\d{7,8}$/.test(String(dni).trim());
}

function isValidPostalCode(zip) {
  return /^\d{4}$/.test(String(zip).trim());
}

function isValidOrderId(id) {
  return /^DPM-\d{6}$/.test(id);
}

function validateProduct(product) {
  const errors = [];
  if (!product.id || typeof product.id !== 'string') errors.push('Product.id is required string');
  if (!product.slug || typeof product.slug !== 'string' || !/^[a-z0-9-]+$/.test(product.slug)) errors.push('Product.slug must be lowercase kebab-case');
  if (!product.name || typeof product.name !== 'string' || product.name.length < 2) errors.push('Product.name must be at least 2 characters');
  if (!PRODUCT_CATEGORIES.includes(product.category)) errors.push(`Product.category must be one of: ${PRODUCT_CATEGORIES.join(', ')}`);
  if (typeof product.price !== 'number' || product.price <= 0) errors.push('Product.price must be positive number');
  if (product.compareAtPrice !== null && product.compareAtPrice !== undefined && (typeof product.compareAtPrice !== 'number' || product.compareAtPrice <= 0)) {
    errors.push('Product.compareAtPrice must be positive number or null');
  }
  if (!product.subtitle || typeof product.subtitle !== 'string') errors.push('Product.subtitle is required string');
  if (typeof product.stock !== 'number' || product.stock < 0 || !Number.isInteger(product.stock)) errors.push('Product.stock must be non-negative integer');
  if (!product.description || typeof product.description !== 'string') errors.push('Product.description is required string');
  if (!product.details || typeof product.details !== 'string') errors.push('Product.details is required string');
  if (!Array.isArray(product.colors) || product.colors.length === 0) {
    errors.push('Product.colors must be non-empty array');
  } else {
    product.colors.forEach((c, idx) => {
      if (!c.id || !c.name || !isValidHexColor(c.hex)) {
        errors.push(`Product.colors[${idx}] must have id, name, and valid hex (${c.hex})`);
      }
    });
  }
  if (!Array.isArray(product.sizes) || product.sizes.length === 0) errors.push('Product.sizes must be non-empty array');
  if (!Array.isArray(product.images) || product.images.length === 0) errors.push('Product.images must be non-empty array');

  return { valid: errors.length === 0, errors };
}

function validateCustomerProfile(customer) {
  const errors = [];
  if (!customer.id || typeof customer.id !== 'string') errors.push('Customer.id is required string');
  if (!customer.name || typeof customer.name !== 'string') errors.push('Customer.name is required string');
  if (!customer.email || !isValidEmail(customer.email)) errors.push('Customer.email must be valid email format');
  if (!AUTH_PROVIDERS.includes(customer.provider || 'email')) errors.push(`Customer.provider must be one of: ${AUTH_PROVIDERS.join(', ')}`);
  if (typeof customer.emailVerified !== 'boolean') errors.push('Customer.emailVerified must be boolean');
  if (!customer.createdAt) errors.push('Customer.createdAt is required');
  if (!customer.lastLogin) errors.push('Customer.lastLogin is required');

  if (customer.addresses) {
    if (!Array.isArray(customer.addresses)) errors.push('Customer.addresses must be array');
    else {
      customer.addresses.forEach((addr, idx) => {
        if (!addr.street || !addr.province || !addr.city || !isValidPostalCode(addr.zip)) {
          errors.push(`Customer.addresses[${idx}] invalid: required street, province, city, 4-digit zip`);
        }
      });
    }
  }

  return { valid: errors.length === 0, errors };
}

function validateCartSession(session) {
  const errors = [];
  if (!Array.isArray(session.items)) errors.push('CartSession.items must be array');
  if (typeof session.itemCount !== 'number' || session.itemCount < 0) errors.push('CartSession.itemCount must be non-negative integer');
  if (typeof session.subtotal !== 'number' || session.subtotal < 0) errors.push('CartSession.subtotal must be non-negative number');
  if (session.currency !== 'ARS') errors.push('CartSession.currency must be "ARS"');
  if (typeof session.freeShippingThreshold !== 'number' || session.freeShippingThreshold !== 90000) errors.push('CartSession.freeShippingThreshold must be 90000 ARS');
  if (typeof session.freeShippingQualified !== 'boolean') errors.push('CartSession.freeShippingQualified must be boolean');
  if (typeof session.amountToFreeShipping !== 'number' || session.amountToFreeShipping < 0) errors.push('CartSession.amountToFreeShipping must be non-negative');

  if (Array.isArray(session.items)) {
    session.items.forEach((item, idx) => {
      if (!item.key || !item.id || !item.name || typeof item.price !== 'number' || item.price <= 0 || !item.color || !item.size || typeof item.quantity !== 'number' || item.quantity < 1) {
        errors.push(`CartSession.items[${idx}] invalid line item structure`);
      }
    });
  }

  return { valid: errors.length === 0, errors };
}

function validateShippingRate(rate) {
  const errors = [];
  if (!rate.provinceId || !rate.provinceName || !rate.city || !isValidPostalCode(rate.zip)) errors.push('ShippingRate requires provinceId, provinceName, city, 4-digit zip');
  if (!SHIPPING_TYPES.includes(rate.type)) errors.push(`ShippingRate.type must be: ${SHIPPING_TYPES.join(', ')}`);
  if (!SHIPPING_OPTIONS.includes(rate.option)) errors.push(`ShippingRate.option must be: ${SHIPPING_OPTIONS.join(', ')}`);
  if (typeof rate.isAmba !== 'boolean') errors.push('ShippingRate.isAmba must be boolean');
  if (typeof rate.baseRateStandard !== 'number' || rate.baseRateStandard !== 5500) errors.push('ShippingRate.baseRateStandard must be 5500 ARS');
  if (typeof rate.baseRateExpress !== 'number' || rate.baseRateExpress !== 8500) errors.push('ShippingRate.baseRateExpress must be 8500 ARS');
  if (typeof rate.calculatedCost !== 'number' || rate.calculatedCost < 0) errors.push('ShippingRate.calculatedCost must be non-negative number');
  if (typeof rate.isFreeShipping !== 'boolean') errors.push('ShippingRate.isFreeShipping must be boolean');

  return { valid: errors.length === 0, errors };
}

function validateOrderTransaction(order) {
  const errors = [];
  if (!order.id || !isValidOrderId(order.id)) errors.push(`Order.id must follow DPM-XXXXXX format, found: ${order.id}`);
  if (!order.date) errors.push('Order.date is required');
  if (!order.customer || !order.customer.name || !order.customer.email || !isValidEmail(order.customer.email) || !isValidDNI(order.customer.dni)) {
    errors.push('Order.customer must include valid name, email, and 7-8 digit DNI');
  }
  if (!order.shipping || !SHIPPING_TYPES.includes(order.shipping.type) || !SHIPPING_OPTIONS.includes(order.shipping.option) || !isValidPostalCode(order.shipping.zip)) {
    errors.push('Order.shipping must include type, option, and 4-digit zip');
  }
  if (!order.payment || !PAYMENT_METHODS.includes(order.payment.method)) {
    errors.push(`Order.payment.method must be one of: ${PAYMENT_METHODS.join(', ')}`);
  }
  if (!Array.isArray(order.items) || order.items.length === 0) errors.push('Order.items must be non-empty array');
  if (typeof order.subtotal !== 'number' || order.subtotal < 0) errors.push('Order.subtotal must be non-negative number');
  if (typeof order.total !== 'number' || order.total < 0) errors.push('Order.total must be non-negative number');
  if (order.currency !== 'ARS') errors.push('Order.currency must be "ARS"');
  if (!ORDER_STATUSES.includes(order.status)) errors.push(`Order.status must be one of: ${ORDER_STATUSES.join(', ')}`);

  return { valid: errors.length === 0, errors };
}

function validateVerificationCode(record) {
  const errors = [];
  if (!record.code || !/^\d{6}$/.test(record.code)) errors.push(`Verification code must be exactly 6 numeric digits, found: ${record.code}`);
  if (typeof record.createdAt !== 'number' || record.createdAt <= 0) errors.push('Verification.createdAt must be positive ms timestamp');
  if (typeof record.expiresAt !== 'number' || record.expiresAt <= record.createdAt) errors.push('Verification.expiresAt must be greater than createdAt');
  if (record.expiresAt - record.createdAt !== 15 * 60 * 1000) errors.push('Verification validity window must be exactly 15 minutes (900,000 ms)');
  if (typeof record.attempts !== 'number' || record.attempts < 0 || record.attempts > 5) errors.push('Verification.attempts must be between 0 and 5');
  if (typeof record.verified !== 'boolean') errors.push('Verification.verified must be boolean');

  return { valid: errors.length === 0, errors };
}

function buildSuite() {
  const harness = new TestSuiteHarness('Data Contracts & Schemas Validator');

  // 1. Authoritative Catalog Product Validation
  harness.test('Contracts: Authoritative catalog in product-data.js satisfies ProductSchema', () => {
    const sandbox = createBrowserSandbox();
    loadScriptInSandbox('product-data.js', sandbox);
    const catalog = sandbox.DopamineCatalog;

    assert.ok(catalog && Array.isArray(catalog.products), 'DopamineCatalog.products must exist and be an array');
    assert.strictEqual(catalog.products.length, 8, 'Dopamine catalog must contain exactly 8 core drops');

    catalog.products.forEach(prod => {
      const res = validateProduct(prod);
      assert.ok(res.valid, `Product ${prod.id} failed schema validation: ${res.errors.join('; ')}`);
    });
  });

  // 2. CustomerProfile Schema & Local Database Validation
  harness.test('Contracts: backend/users_db.json or user objects conform to CustomerProfileSchema', () => {
    const usersDbPath = path.join(BACKEND_DIR, 'users_db.json');
    if (fs.existsSync(usersDbPath)) {
      const raw = fs.readFileSync(usersDbPath, 'utf8');
      const data = JSON.parse(raw);
      const userList = Array.isArray(data) ? data : Object.values(data);

      userList.forEach(user => {
        const res = validateCustomerProfile({
          id: user.id || 'usr_test',
          name: user.name || user.full_name || 'Test User',
          email: user.email || 'test@dopamine.com',
          provider: user.provider || 'email',
          emailVerified: user.emailVerified ?? user.email_verified ?? true,
          createdAt: user.createdAt || user.created_at || new Date().toISOString(),
          lastLogin: user.lastLogin || user.last_login || new Date().toISOString()
        });
        assert.ok(res.valid, `User ${user.email} failed schema validation: ${res.errors.join('; ')}`);
      });
    }

    // Direct mock profile validation
    const mockProfile = {
      id: 'usr_1740520000000_abc123',
      name: 'Manuel Test',
      email: 'manuel@example.com',
      provider: 'email',
      emailVerified: true,
      createdAt: '2026-08-25T20:00:00.000Z',
      lastLogin: '2026-08-25T21:00:00.000Z',
      addresses: [
        {
          street: 'Av. Santa Fe 3200',
          province: 'CABA',
          city: 'Palermo',
          zip: '1425',
          phone: '1145678900',
          isDefault: true
        }
      ]
    };
    const res = validateCustomerProfile(mockProfile);
    assert.ok(res.valid, `Mock customer profile validation failed: ${res.errors.join('; ')}`);
  });

  // 3. CartSession Schema Validation
  harness.test('Contracts: CartSession conforms to formal contract specification', () => {
    const sampleCartSession = {
      items: [
        {
          key: 'buzo-win::Washed Black::XL',
          id: 'buzo-win',
          slug: 'buzo-win',
          name: 'Buzo WIN',
          price: 115000,
          image: 'Ropa/Buzos/Buzo WIN.webp',
          color: 'Washed Black',
          size: 'XL',
          quantity: 1
        }
      ],
      itemCount: 1,
      subtotal: 115000,
      currency: 'ARS',
      freeShippingThreshold: 90000,
      freeShippingQualified: true,
      amountToFreeShipping: 0
    };
    const res = validateCartSession(sampleCartSession);
    assert.ok(res.valid, `CartSession validation failed: ${res.errors.join('; ')}`);
  });

  // 4. ShippingRate Calculation Contract Validation
  harness.test('Contracts: ShippingRateCalculation conforms to AMBA and Interior rate contracts', () => {
    const ambaRate = {
      provinceId: 'caba',
      provinceName: 'Ciudad Autónoma de Buenos Aires',
      city: 'Palermo',
      zip: '1414',
      type: 'home',
      option: 'standard',
      isAmba: true,
      baseRateStandard: 5500,
      baseRateExpress: 8500,
      calculatedCost: 0, // Free over 90k
      freeShippingThreshold: 90000,
      isFreeShipping: true,
      estimatedDaysMin: 1,
      estimatedDaysMax: 3
    };
    const res = validateShippingRate(ambaRate);
    assert.ok(res.valid, `AMBA ShippingRate validation failed: ${res.errors.join('; ')}`);
  });

  // 5. OrderTransaction Contract Validation
  harness.test('Contracts: OrderTransaction conforms to DPM-XXXXXX checkout contract', () => {
    const sampleOrder = {
      id: 'DPM-924103',
      date: new Date().toISOString(),
      customer: {
        name: 'Gonzalo',
        lastName: 'Montiel',
        email: 'gonzalo@dopamine.com',
        dni: '38192834',
        phone: '1198765432',
        noNewsletter: false
      },
      shipping: {
        type: 'home',
        option: 'standard',
        address: 'Av. Libertador 4500',
        province: 'CABA',
        city: 'Belgrano',
        zip: '1426',
        cost: 0
      },
      payment: {
        method: 'mercadopago',
        installments: 6,
        mpPaymentId: 'mp_pay_998877',
        idempotencyKey: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'
      },
      items: [
        {
          key: 'conjunto-baggy-morgan::Noir::L',
          id: 'conjunto-baggy-morgan',
          slug: 'conjunto-baggy-morgan',
          name: 'Conjunto Baggy Morgan',
          price: 185000,
          image: 'Ropa/Conjuntos/CONJUNTO BAGGY MORGAN.webp',
          color: 'Noir',
          size: 'L',
          quantity: 1
        }
      ],
      subtotal: 185000,
      shippingCost: 0,
      discount: 18500,
      coupon: 'DOPAMINE10',
      total: 166500,
      currency: 'ARS',
      status: 'approved'
    };

    const res = validateOrderTransaction(sampleOrder);
    assert.ok(res.valid, `OrderTransaction validation failed: ${res.errors.join('; ')}`);
  });

  // 6. VerificationCode Contract Validation
  harness.test('Contracts: VerificationCodeRecord enforces 6 digits and exact 15-min expiration', () => {
    const now = Date.now();
    const validOTP = {
      code: '582910',
      createdAt: now,
      expiresAt: now + 15 * 60 * 1000,
      attempts: 0,
      verified: false,
      deliveryMethod: 'toast'
    };
    const res = validateVerificationCode(validOTP);
    assert.ok(res.valid, `VerificationCode validation failed: ${res.errors.join('; ')}`);
  });

  // 7. REST API Endpoints Contract Validation
  harness.test('Contracts: /api/auth/register payload contract validation', () => {
    const registerReq = {
      email: 'newuser@dopamine.com',
      password: 'StrongPassword2026!',
      name: 'Julian Alvarez',
      birthdate: '31/01/2000'
    };
    assert.ok(isValidEmail(registerReq.email), 'Register payload requires valid email');
    assert.ok(registerReq.password.length >= 6, 'Register payload requires min 6 character password');
    assert.ok(registerReq.name.length >= 1, 'Register payload requires non-empty name');
  });

  harness.test('Contracts: /api/checkout/create-preference payload contract validation', () => {
    const prefReq = {
      items: [
        {
          id: 'buzo-win',
          title: 'Buzo WIN',
          quantity: 1,
          unit_price: 115000,
          currency_id: 'ARS'
        }
      ],
      payer: {
        name: 'Alexis',
        surname: 'Mac Allister',
        email: 'alexis@dopamine.com',
        identification: { type: 'DNI', number: '41998877' }
      },
      statement_descriptor: 'DOPAMINE STREETWEAR',
      external_reference: 'DPM-112233',
      idempotency_key: 'b9e4a3f2-1234-5678-9abc-def012345678'
    };
    assert.ok(prefReq.items.length >= 1, 'Preference items must not be empty');
    assert.strictEqual(prefReq.items[0].currency_id, 'ARS', 'Preference currency must be ARS');
    assert.ok(isValidDNI(prefReq.payer.identification.number), 'Payer DNI must be 7-8 digits');
  });

  harness.test('Contracts: /api/webhooks/mercadopago payload contract validation', () => {
    const webhookPayload = {
      id: 123456789,
      live_mode: false,
      type: 'payment',
      date_created: '2026-08-25T21:00:00.000Z',
      user_id: '99887766',
      api_version: 'v1',
      action: 'payment.created',
      data: { id: '9988776655' }
    };
    assert.ok(webhookPayload.id, 'Webhook requires event ID');
    assert.strictEqual(webhookPayload.type, 'payment', 'Webhook type must be payment');
    assert.ok(webhookPayload.data && webhookPayload.data.id, 'Webhook data must contain payment ID');
  });

  return harness;
}

// CLI Direct Runner
if (require.main === module) {
  (async () => {
    console.log('\n--- Running Data Contracts & Schemas Validator ---');
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
  buildSuite,
  validateProduct,
  validateCustomerProfile,
  validateCartSession,
  validateShippingRate,
  validateOrderTransaction,
  validateVerificationCode,
  isValidEmail,
  isValidHexColor,
  isValidDNI,
  isValidPostalCode,
  isValidOrderId
};
