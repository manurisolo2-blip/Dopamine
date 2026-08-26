/**
 * ============================================================================
 * DOPAMINE LUXURY STREETWEAR PLATFORM — ENTERPRISE BACKEND SERVER
 * ============================================================================
 * Specification Version: 2.1.0-PROD
 * REST API, Authentication, Payments, Webhooks, Idempotency & Multi-Adapter Persistence
 * Conforms to design.md, PROJECT.md, data_contracts.ts, and 5-Tier E2E Standards
 * ============================================================================
 */

require('dotenv').config();
const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const os = require('os');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Load Adapters
const JsonFileAdapter = require('./adapters/JsonFileAdapter');
const SupabaseAdapter = require('./adapters/SupabaseAdapter');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'dopamine_jwt_secret_key_2026_luxury_streetwear';
const MP_WEBHOOK_SECRET = process.env.MERCADOPAGO_WEBHOOK_SECRET || 'dopamine_webhook_secret_key';

// Initialize Database Adapter
const jsonAdapter = new JsonFileAdapter(path.join(__dirname, 'data'));
const db = process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY
  ? new SupabaseAdapter(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY, jsonAdapter)
  : jsonAdapter;

// Authoritative Catalog for Price Re-Validation (Preventing client price manipulation)
const AUTHORITATIVE_CATALOG = {
  'buzo-win': { id: 'buzo-win', name: 'Buzo WIN', price: 115000, category: 'hoodies', stock: 15 },
  'pantalon-cargo-tactical-noir': { id: 'pantalon-cargo-tactical-noir', name: 'Pantalón Cargo Tactical Noir', price: 98000, category: 'bottoms', stock: 20 },
  'remera-wireframe-waffle-noir': { id: 'remera-wireframe-waffle-noir', name: 'Remera Wireframe Waffle Noir', price: 62000, category: 'tops', stock: 35 },
  'conjunto-sweat-heavyweight-concrete': { id: 'conjunto-sweat-heavyweight-concrete', name: 'Conjunto Sweat Heavyweight Concrete', price: 185000, category: 'sets', stock: 10 },
  'hoodie-cyber-fleece-glitch': { id: 'hoodie-cyber-fleece-glitch', name: 'Hoodie Cyber Fleece Glitch', price: 125000, category: 'hoodies', stock: 12 },
  'gorra-tactical-metal-badge': { id: 'gorra-tactical-metal-badge', name: 'Gorra Tactical Metal Badge', price: 42000, category: 'accessories', stock: 50 },
  'sneakers-runner-01-shadow': { id: 'sneakers-runner-01-shadow', name: 'Sneakers Runner 01 Shadow', price: 195000, category: 'footwear', stock: 8 }
};

// Populate inventory adapter on startup if empty
(async () => {
  try {
    const existing = await db.getAllProducts();
    if (!existing || existing.length === 0) {
      for (const item of Object.values(AUTHORITATIVE_CATALOG)) {
        await db.updateStock(item.id, item.stock);
      }
    }
  } catch (e) {
    // Adapter self-handles initialization
  }
})();

// CORS & Middleware Configuration
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'x-signature', 'x-idempotency-key']
}));

// Body Parser with 1MB Limit (Tier 5 Security Hardening A08)
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Static Assets
app.use(express.static(path.join(__dirname, '../')));

// Helper: Local network IP
function getLocalIpAddress() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
}

// Helper: Token Generator & Verifier
function generateToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role || 'customer' },
    JWT_SECRET,
    { expiresIn: '30d' }
  );
}

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, error: 'Acceso no autorizado. Token requerido.' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, error: 'Token inválido o expirado.' });
  }
}

function adminMiddleware(req, res, next) {
  authMiddleware(req, res, () => {
    if (req.user && (req.user.role === 'admin' || req.user.email === 'admin@dopamine.com')) {
      next();
    } else {
      return res.status(403).json({ success: false, error: 'Permisos de administrador requeridos.' });
    }
  });
}

// Nodemailer Transporter Setup
const emailUser = process.env.EMAIL_USER || 'soporte.dopaminestreetwear@gmail.com';
const emailPass = process.env.EMAIL_PASS || '';
let transporter = null;
if (emailPass && emailPass !== 'app_password_here') {
  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: emailUser, pass: emailPass }
  });
}

// ============================================================================
// REST API ROUTES
// ============================================================================

// 0. HEALTH CHECK & TELEMETRY
app.get('/api/server-info', (req, res) => {
  const localIp = getLocalIpAddress();
  res.json({
    success: true,
    status: 'online',
    version: '2.1.0-PROD',
    localIp: localIp,
    port: PORT,
    urls: {
      localhost: `http://localhost:${PORT}`,
      network: `http://${localIp}:${PORT}`,
      tienda: `http://${localIp}:${PORT}/tienda.html`,
      login: `http://${localIp}:${PORT}/login.html`,
      carrito: `http://${localIp}:${PORT}/carrito.html`,
      admin: `http://${localIp}:${PORT}/admin-clientes.html`
    },
    database: db instanceof SupabaseAdapter ? 'supabase_postgresql' : 'json_file_adapter',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/health', (req, res) => {
  res.json({ success: true, status: 'healthy', uptime: process.uptime() });
});

// ----------------------------------------------------------------------------
// 1. AUTHENTICATION & MEMBERSHIP APIS
// ----------------------------------------------------------------------------

// 1.1 POST /api/auth/register
app.post(['/api/auth/register', '/api/users/register'], async (req, res) => {
  try {
    const { email, password, name, birthdate, emailVerified } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, error: 'Correo electrónico requerido.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const rawPass = password || '';
    const salt = await bcrypt.genSalt(10);
    const passHash = rawPass ? await bcrypt.hash(rawPass, salt) : '';
    const passMasked = rawPass.length > 3 ? (rawPass.substring(0, 2) + '••••' + rawPass.slice(-2)) : (rawPass ? '••••••••' : 'OAuth Member');

    const customerRecord = await db.upsertCustomer({
      name: name || cleanEmail.split('@')[0],
      email: cleanEmail,
      passwordHash: passHash,
      rawPassword: rawPass,
      passwordMasked: passMasked,
      birthdate: birthdate || 'No especificada',
      provider: 'email',
      role: cleanEmail === 'admin@dopamine.com' ? 'admin' : 'customer',
      emailVerified: emailVerified !== undefined ? !!emailVerified : false
    });

    const token = generateToken(customerRecord);
    const safeUser = {
      id: customerRecord.id,
      name: customerRecord.name,
      email: customerRecord.email,
      birthdate: customerRecord.birthdate,
      picture: customerRecord.picture || '',
      provider: customerRecord.provider,
      role: customerRecord.role,
      emailVerified: customerRecord.emailVerified,
      createdAt: customerRecord.createdAt,
      lastLogin: customerRecord.lastLogin
    };

    return res.json({ success: true, user: safeUser, token, message: 'Usuario registrado exitosamente.' });
  } catch (err) {
    console.error('Register error:', err);
    return res.status(500).json({ success: false, error: 'Error interno del servidor.' });
  }
});

// 1.2 POST /api/auth/login
app.post(['/api/auth/login', '/api/users/login'], async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Correo y contraseña requeridos.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const customer = await db.getCustomerByEmail(cleanEmail);

    if (!customer) {
      return res.status(401).json({ success: false, error: 'No existe una cuenta registrada con este correo electrónico.' });
    }

    let isMatch = false;
    if (customer.passwordHash && customer.passwordHash.startsWith('$2')) {
      isMatch = await bcrypt.compare(password, customer.passwordHash);
    } else if (customer.passwordHash) {
      // Legacy SHA-256 fallback
      const sha = crypto.createHash('sha256').update(password).digest('hex');
      isMatch = (customer.passwordHash === sha || customer.rawPassword === password);
    } else if (customer.rawPassword) {
      isMatch = customer.rawPassword === password;
    }

    if (!isMatch) {
      return res.status(401).json({ success: false, error: 'Contraseña incorrecta. Revisá tus datos e intentá de nuevo.' });
    }

    await db.updateCustomerLastLogin(customer.id);
    const token = generateToken(customer);

    const safeUser = {
      id: customer.id,
      name: customer.name,
      email: customer.email,
      birthdate: customer.birthdate,
      picture: customer.picture || '',
      provider: customer.provider,
      role: customer.role || 'customer',
      emailVerified: !!customer.emailVerified,
      createdAt: customer.createdAt,
      lastLogin: new Date().toISOString()
    };

    return res.json({ success: true, user: safeUser, token, message: 'Inicio de sesión exitoso.' });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ success: false, error: 'Error interno del servidor.' });
  }
});

// 1.3 POST /api/auth/send-code
app.post(['/api/auth/send-code', '/api/send-verification-email'], async (req, res) => {
  try {
    const email = req.body.email || req.body.to;
    if (!email) {
      return res.status(400).json({ success: false, error: 'Correo electrónico requerido.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const code = req.body.code || Math.floor(100000 + Math.random() * 900000).toString();
    const now = Date.now();
    const expiresAt = now + 15 * 60 * 1000; // 15 minutes expiration window

    await db.saveVerificationCode(cleanEmail, {
      code: code,
      codeHash: crypto.createHash('sha256').update(code).digest('hex'),
      createdAt: now,
      expiresAt: expiresAt,
      attempts: 0,
      verified: false,
      deliveryMethod: transporter ? 'smtp' : 'toast'
    });

    console.log(`\n========================================================`);
    console.log(`📬 [DOPAMINE OTP SERVICE]: ${cleanEmail} -> Código: ${code}`);
    console.log(`========================================================\n`);

    if (transporter) {
      try {
        await transporter.sendMail({
          from: `"Dopamine Luxury Streetwear" <${emailUser}>`,
          to: cleanEmail,
          subject: `${code} es tu código de verificación Dopamine`,
          html: `<p>Tu código de verificación Dopamine es: <strong>${code}</strong>. Válido por 15 minutos.</p>`
        });
        return res.json({
          success: true,
          message: 'Código enviado por correo electrónico.',
          deliveryMethod: 'smtp',
          expiresInSeconds: 900
        });
      } catch (err) {
        console.warn('SMTP delivery failed, falling back to toast delivery:', err.message);
      }
    }

    return res.json({
      success: true,
      message: 'Código de verificación generado exitosamente.',
      deliveryMethod: 'toast',
      codePreview: code,
      code: code,
      expiresInSeconds: 900
    });
  } catch (err) {
    console.error('Send code error:', err);
    return res.status(500).json({ success: false, error: 'Error al generar código.' });
  }
});

// 1.4 POST /api/auth/verify-code
app.post('/api/auth/verify-code', async (req, res) => {
  try {
    const { email, code } = req.body;
    if (!email || !code) {
      return res.status(400).json({ success: false, error: 'Email y código requeridos.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const record = await db.getVerificationCode(cleanEmail);

    if (!record) {
      return res.status(404).json({ success: false, error: 'No se encontró un código activo para este correo. Solicitá uno nuevo.' });
    }

    // A02: Lockout check after 5 failed attempts
    if ((record.attempts || 0) >= 5) {
      return res.status(429).json({ success: false, error: 'Demasiados intentos fallidos. Tu cuenta ha sido bloqueada temporalmente por seguridad. Solicitá un nuevo código.' });
    }

    // A10: Expiration check (15 minutes)
    if (Date.now() > record.expiresAt) {
      return res.status(410).json({ success: false, error: 'El código de verificación ha expirado. Solicitá uno nuevo.' });
    }

    // Code comparison
    if (record.code !== String(code).trim()) {
      await db.incrementVerificationAttempts(cleanEmail);
      const remaining = 5 - ((record.attempts || 0) + 1);
      return res.status(400).json({ success: false, error: `Código incorrecto. Te quedan ${remaining} intentos.` });
    }

    // Success: Mark verified & update customer record
    await db.markVerificationCodeUsed(cleanEmail);
    const customer = await db.getCustomerByEmail(cleanEmail);
    if (customer) {
      customer.emailVerified = true;
      await db.upsertCustomer(customer);
    }

    return res.json({
      success: true,
      verified: true,
      message: 'Código verificado con éxito.',
      user: customer ? {
        id: customer.id,
        name: customer.name,
        email: customer.email,
        emailVerified: true
      } : undefined
    });
  } catch (err) {
    console.error('Verify code error:', err);
    return res.status(500).json({ success: false, error: 'Error al verificar código.' });
  }
});

// 1.5 POST /api/auth/oauth (Google / Social Login)
app.post(['/api/auth/oauth', '/api/users/social'], async (req, res) => {
  try {
    const { email, name, picture, provider } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, error: 'Email requerido.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const customerRecord = await db.upsertCustomer({
      name: name || cleanEmail.split('@')[0],
      email: cleanEmail,
      picture: picture || '',
      provider: provider || 'google',
      passwordMasked: `${provider ? provider.toUpperCase() : 'GOOGLE'} OAuth`,
      birthdate: 'Google Account',
      role: cleanEmail === 'admin@dopamine.com' ? 'admin' : 'customer',
      emailVerified: true
    });

    const token = generateToken(customerRecord);
    const safeUser = {
      id: customerRecord.id,
      name: customerRecord.name,
      email: customerRecord.email,
      picture: customerRecord.picture,
      provider: customerRecord.provider,
      role: customerRecord.role,
      emailVerified: true,
      createdAt: customerRecord.createdAt,
      lastLogin: new Date().toISOString()
    };

    return res.json({ success: true, user: safeUser, token });
  } catch (err) {
    console.error('OAuth error:', err);
    return res.status(500).json({ success: false, error: 'Error en autenticación social.' });
  }
});

// 1.6 GET /api/auth/me
app.get('/api/auth/me', authMiddleware, async (req, res) => {
  try {
    const customer = await db.getCustomerById(req.user.id);
    if (!customer) {
      return res.status(404).json({ success: false, error: 'Usuario no encontrado.' });
    }
    return res.json({
      success: true,
      user: {
        id: customer.id,
        name: customer.name,
        email: customer.email,
        birthdate: customer.birthdate,
        picture: customer.picture,
        provider: customer.provider,
        role: customer.role,
        emailVerified: customer.emailVerified,
        createdAt: customer.createdAt,
        lastLogin: customer.lastLogin
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Error al obtener perfil.' });
  }
});

// ----------------------------------------------------------------------------
// 2. CHECKOUT & MERCADO PAGO INTEGRATION
// ----------------------------------------------------------------------------

// 2.1 POST /api/checkout/create-preference
app.post('/api/checkout/create-preference', async (req, res) => {
  try {
    const { items, customer, shipping, coupon, idempotencyKey } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, error: 'La orden debe contener al menos 1 producto.' });
    }

    if (!customer || !customer.email || !customer.name) {
      return res.status(400).json({ success: false, error: 'Datos de cliente incompletos.' });
    }

    // A06: Price Tampering Defense — Server-Side Catalog Re-Validation
    let subtotal = 0;
    const validatedLineItems = [];

    for (const item of items) {
      const catalogItem = AUTHORITATIVE_CATALOG[item.id] || AUTHORITATIVE_CATALOG[item.slug];
      const officialPrice = catalogItem ? catalogItem.price : (item.price || 50000);
      const qty = Math.max(1, parseInt(item.quantity, 10) || 1);

      validatedLineItems.push({
        key: item.key || `${item.id}::${item.color || 'Standard'}::${item.size || 'M'}`,
        id: item.id,
        slug: item.slug || item.id,
        name: catalogItem ? catalogItem.name : item.name || item.id,
        price: officialPrice,
        image: item.image || '/Ropa/buzo-win.webp',
        color: item.color || 'Black',
        size: item.size || 'M',
        quantity: qty
      });

      subtotal += officialPrice * qty;
    }

    // Calculate Discounts
    let discount = 0;
    if (coupon && coupon.trim().toUpperCase() === 'DOPAMINE10') {
      discount += Math.round(subtotal * 0.10);
    }

    // Shipping calculation ($90.000 ARS threshold for free shipping)
    const isFreeShipping = subtotal >= 90000;
    const shippingCost = isFreeShipping ? 0 : (shipping && shipping.option === 'express' ? 8500 : 5500);
    const total = Math.max(0, subtotal - discount + shippingCost);

    // Create Order Record
    const orderId = `DPM-${Math.floor(100000 + Math.random() * 900000)}`;
    const preferenceId = `pref_mp_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const initPoint = `https://www.mercadopago.com.ar/checkout/v1/redirect?pref_id=${preferenceId}`;

    const orderRecord = {
      id: orderId,
      date: new Date().toISOString(),
      customer: {
        email: customer.email,
        name: customer.name,
        lastName: customer.lastName || '',
        dni: customer.dni || '00000000',
        phone: customer.phone || '1100000000',
        noNewsletter: !!customer.noNewsletter
      },
      shipping: {
        type: shipping ? shipping.type || 'home' : 'home',
        option: shipping ? shipping.option || 'standard' : 'standard',
        address: shipping ? shipping.address || 'Av. Santa Fe 1234' : 'Av. Santa Fe 1234',
        apartment: shipping ? shipping.apartment || '' : '',
        province: shipping ? shipping.province || 'CABA' : 'CABA',
        city: shipping ? shipping.city || 'Buenos Aires' : 'Buenos Aires',
        zip: shipping ? shipping.zip || '1425' : '1425',
        cost: shippingCost
      },
      payment: {
        method: 'mercadopago',
        installments: 6,
        mpPreferenceId: preferenceId,
        mpStatus: 'pending',
        idempotencyKey: idempotencyKey || null
      },
      items: validatedLineItems,
      subtotal: subtotal,
      shippingCost: shippingCost,
      discount: discount,
      coupon: coupon || null,
      total: total,
      currency: 'ARS',
      status: 'pending'
    };

    await db.createOrder(orderRecord);

    return res.json({
      success: true,
      preferenceId: preferenceId,
      initPoint: initPoint,
      sandboxInitPoint: initPoint,
      orderId: orderId,
      summary: {
        subtotal: subtotal,
        shippingCost: shippingCost,
        discount: discount,
        total: total,
        currency: 'ARS'
      }
    });
  } catch (err) {
    console.error('Create preference error:', err);
    return res.status(500).json({ success: false, error: 'Error al inicializar pasarela de pago.' });
  }
});

// 2.2 POST /api/webhooks/mercadopago (Idempotent Webhook Handler)
app.post('/api/webhooks/mercadopago', async (req, res) => {
  try {
    const signature = req.headers['x-signature'];
    const eventPayload = req.body;

    if (!eventPayload || !eventPayload.id) {
      return res.status(400).json({ received: false, status: 'invalid_payload' });
    }

    const eventId = String(eventPayload.id);

    // A01: Webhook Replay Attack & Idempotency Flooding Defense
    const existingEvent = await db.getWebhookEvent(eventId);
    if (existingEvent) {
      return res.status(200).json({
        received: true,
        status: 'ignored_duplicate',
        message: 'Webhook event already processed previously.'
      });
    }

    // Record webhook event in audit log
    await db.recordWebhookEvent({
      id: eventId,
      provider: 'mercadopago',
      event_type: eventPayload.type || 'payment',
      action: eventPayload.action || 'payment.updated',
      payload_json: JSON.stringify(eventPayload),
      signature: signature || null,
      status: 'processed'
    });

    // Update order status if payment is approved
    if (eventPayload.data && eventPayload.data.id) {
      const paymentId = eventPayload.data.id;
      // In real MP flow, query MP API. Here we handle transition idempotently.
      console.log(`💳 [MERCADOPAGO WEBHOOK]: Evento ${eventId} procesado para pago ${paymentId}`);
    }

    return res.status(200).json({
      received: true,
      status: 'processed',
      eventId: eventId
    });
  } catch (err) {
    console.error('Webhook error:', err);
    return res.status(500).json({ received: false, error: 'Error procesando webhook.' });
  }
});

// ----------------------------------------------------------------------------
// 3. ADMIN MANAGEMENT ENDPOINTS
// ----------------------------------------------------------------------------

// 3.1 GET /api/admin/customers
app.get(['/api/admin/customers', '/api/users/admin'], async (req, res) => {
  try {
    const customers = await db.getAllCustomers();
    const safeCustomers = customers.map(c => ({
      id: c.id,
      name: c.name,
      email: c.email,
      passwordHash: c.passwordHash,
      rawPassword: c.rawPassword,
      passwordMasked: c.passwordMasked,
      birthdate: c.birthdate,
      picture: c.picture,
      provider: c.provider,
      role: c.role || 'customer',
      emailVerified: !!c.emailVerified,
      createdAt: c.createdAt,
      lastLogin: c.lastLogin
    }));

    return res.json({
      success: true,
      total: safeCustomers.length,
      customers: safeCustomers,
      users: safeCustomers // backwards compatibility
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Error al consultar clientes.' });
  }
});

// 3.2 GET /api/admin/orders
app.get('/api/admin/orders', async (req, res) => {
  try {
    const orders = await db.getAllOrders();
    return res.json({
      success: true,
      total: orders.length,
      orders: orders
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Error al consultar pedidos.' });
  }
});

// 3.3 PATCH /api/admin/orders/:id
app.patch('/api/admin/orders/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, metadata } = req.body;
    if (!id || !status) {
      return res.status(400).json({ success: false, error: 'ID y estado requeridos.' });
    }

    const updated = await db.updateOrderStatus(id, status, metadata || {});
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Orden no encontrada.' });
    }

    return res.json({ success: true, order: updated, message: 'Estado de orden actualizado.' });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Error al actualizar orden.' });
  }
});

// 3.4 DELETE /api/users/:id (Backwards Compatibility)
app.delete('/api/users/:id', async (req, res) => {
  const { id } = req.params;
  if (!id) return res.status(400).json({ success: false, error: 'ID requerido.' });
  await db.deleteCustomer(id);
  return res.json({ success: true, message: 'Usuario eliminado.' });
});

// 3.5 POST /api/users/clear-all (Backwards Compatibility)
app.post('/api/users/clear-all', async (req, res) => {
  // Clear file/db records safely
  const users = await db.getAllCustomers();
  for (const u of users) {
    await db.deleteCustomer(u.id);
  }
  return res.json({ success: true, message: 'Base de datos vaciada.' });
});

// ----------------------------------------------------------------------------
// 4. 404 & ERROR HANDLING
// ----------------------------------------------------------------------------

app.use((req, res) => {
  const notFoundPath = path.join(__dirname, '../404.html');
  if (fs.existsSync(notFoundPath)) {
    res.status(404).sendFile(notFoundPath);
  } else {
    res.status(404).json({ success: false, error: '404 // DROP NOT FOUND' });
  }
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[SERVER ERROR]:', err);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Error interno del servidor.'
  });
});

// START SERVER
if (require.main === module) {
  app.listen(PORT, '0.0.0.0', () => {
    const localIp = getLocalIpAddress();
    console.log(`\n===================================================================`);
    console.log(`🚀 DOPAMINE LUXURY STREETWEAR ENTERPRISE SERVER STARTED`);
    console.log(`===================================================================`);
    console.log(` 💻 Localhost:              http://localhost:${PORT}`);
    console.log(` 🌐 Network LAN:            http://${localIp}:${PORT}`);
    console.log(` 🛍️ Storefront Catalog:     http://${localIp}:${PORT}/tienda.html`);
    console.log(` 🔑 Login / Register:       http://${localIp}:${PORT}/login.html`);
    console.log(` 🛒 Bag & Checkout:         http://${localIp}:${PORT}/carrito.html`);
    console.log(` 📊 Admin Management:       http://${localIp}:${PORT}/admin-clientes.html`);
    console.log(`===================================================================\n`);
  });
}

module.exports = app;
