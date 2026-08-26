/**
 * ============================================================================
 * DOPAMINE LUXURY STREETWEAR PLATFORM — JsonFileAdapter
 * ============================================================================
 * Production-ready JSON file persistence adapter for standalone / local runtime.
 * Implements IDatabaseAdapter with atomic writes and corrupted-data recovery.
 * ============================================================================
 */

const fs = require('fs');
const path = require('path');
const IDatabaseAdapter = require('./IDatabaseAdapter');

class JsonFileAdapter extends IDatabaseAdapter {
  constructor(dataDir) {
    super();
    this.dataDir = dataDir || path.join(__dirname, '../data');
    if (!fs.existsSync(this.dataDir)) {
      fs.mkdirSync(this.dataDir, { recursive: true });
    }

    this.customersFile = path.join(this.dataDir, 'customers.json');
    this.ordersFile = path.join(this.dataDir, 'orders.json');
    this.inventoryFile = path.join(this.dataDir, 'inventory.json');
    this.verificationFile = path.join(this.dataDir, 'verification.json');
    this.webhooksFile = path.join(this.dataDir, 'webhook_events.json');

    this._initFiles();
  }

  _initFiles() {
    [
      [this.customersFile, []],
      [this.ordersFile, []],
      [this.inventoryFile, []],
      [this.verificationFile, {}],
      [this.webhooksFile, []]
    ].forEach(([file, defaultVal]) => {
      if (!fs.existsSync(file)) {
        this._writeFile(file, defaultVal);
      }
    });
  }

  _readFile(file, fallback = []) {
    try {
      if (fs.existsSync(file)) {
        const raw = fs.readFileSync(file, 'utf8');
        return JSON.parse(raw);
      }
    } catch (err) {
      console.warn(`[JsonFileAdapter] Error reading ${file}, using fallback:`, err.message);
    }
    return fallback;
  }

  _writeFile(file, data) {
    try {
      const tempPath = `${file}.tmp.${Date.now()}`;
      fs.writeFileSync(tempPath, JSON.stringify(data, null, 2), 'utf8');
      fs.renameSync(tempPath, file);
    } catch (err) {
      console.error(`[JsonFileAdapter] Error writing ${file}:`, err.message);
    }
  }

  // --- Customers ---
  async getCustomerById(id) {
    const list = this._readFile(this.customersFile, []);
    return list.find(c => c.id === id) || null;
  }

  async getCustomerByEmail(email) {
    if (!email) return null;
    const clean = email.trim().toLowerCase();
    const list = this._readFile(this.customersFile, []);
    return list.find(c => c.email && c.email.toLowerCase() === clean) || null;
  }

  async getAllCustomers() {
    return this._readFile(this.customersFile, []);
  }

  async upsertCustomer(customerData) {
    const list = this._readFile(this.customersFile, []);
    const cleanEmail = (customerData.email || '').trim().toLowerCase();
    const idx = list.findIndex(c => (customerData.id && c.id === customerData.id) || (c.email && c.email.toLowerCase() === cleanEmail));

    const now = new Date().toISOString();
    const record = {
      id: customerData.id || `usr_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`,
      name: customerData.name || cleanEmail.split('@')[0],
      email: cleanEmail,
      passwordHash: customerData.passwordHash || (idx !== -1 ? list[idx].passwordHash : ''),
      rawPassword: customerData.rawPassword || (idx !== -1 ? list[idx].rawPassword : ''),
      passwordMasked: customerData.passwordMasked || (idx !== -1 ? list[idx].passwordMasked : '••••••••'),
      birthdate: customerData.birthdate || (idx !== -1 ? list[idx].birthdate : 'No especificada'),
      phone: customerData.phone || (idx !== -1 ? list[idx].phone : ''),
      picture: customerData.picture || (idx !== -1 ? list[idx].picture : ''),
      provider: customerData.provider || (idx !== -1 ? list[idx].provider : 'email'),
      role: customerData.role || (idx !== -1 ? list[idx].role : 'customer'),
      emailVerified: customerData.emailVerified !== undefined ? !!customerData.emailVerified : (idx !== -1 ? !!list[idx].emailVerified : false),
      createdAt: idx !== -1 ? list[idx].createdAt : now,
      lastLogin: now,
      addresses: customerData.addresses || (idx !== -1 ? list[idx].addresses : []),
      orderHistory: customerData.orderHistory || (idx !== -1 ? list[idx].orderHistory : [])
    };

    if (idx !== -1) {
      list[idx] = record;
    } else {
      list.unshift(record);
    }
    this._writeFile(this.customersFile, list);
    return record;
  }

  async updateCustomerLastLogin(id) {
    const list = this._readFile(this.customersFile, []);
    const user = list.find(c => c.id === id);
    if (user) {
      user.lastLogin = new Date().toISOString();
      this._writeFile(this.customersFile, list);
      return user;
    }
    return null;
  }

  async deleteCustomer(id) {
    let list = this._readFile(this.customersFile, []);
    const initialLen = list.length;
    list = list.filter(c => c.id !== id);
    if (list.length !== initialLen) {
      this._writeFile(this.customersFile, list);
      return true;
    }
    return false;
  }

  // --- Orders ---
  async getOrderById(id) {
    const list = this._readFile(this.ordersFile, []);
    return list.find(o => o.id === id) || null;
  }

  async getOrdersByCustomerEmail(email) {
    if (!email) return [];
    const clean = email.trim().toLowerCase();
    const list = this._readFile(this.ordersFile, []);
    return list.filter(o => o.customer && o.customer.email && o.customer.email.toLowerCase() === clean);
  }

  async getAllOrders() {
    return this._readFile(this.ordersFile, []);
  }

  async createOrder(orderData) {
    const list = this._readFile(this.ordersFile, []);
    list.unshift(orderData);
    this._writeFile(this.ordersFile, list);

    // Update customer's order history if customer exists
    if (orderData.customer && orderData.customer.email) {
      const cust = await this.getCustomerByEmail(orderData.customer.email);
      if (cust) {
        cust.orderHistory = cust.orderHistory || [];
        if (!cust.orderHistory.includes(orderData.id)) {
          cust.orderHistory.push(orderData.id);
          await this.upsertCustomer(cust);
        }
      }
    }

    return orderData;
  }

  async updateOrderStatus(id, status, metadata = {}) {
    const list = this._readFile(this.ordersFile, []);
    const order = list.find(o => o.id === id);
    if (order) {
      order.status = status;
      if (metadata.mpPaymentId) order.payment.mpPaymentId = metadata.mpPaymentId;
      if (metadata.mpStatus) order.payment.mpStatus = metadata.mpStatus;
      order.updatedAt = new Date().toISOString();
      this._writeFile(this.ordersFile, list);
      return order;
    }
    return null;
  }

  // --- Inventory ---
  async getProductById(id) {
    const list = this._readFile(this.inventoryFile, []);
    return list.find(p => p.id === id) || null;
  }

  async getProductBySlug(slug) {
    const list = this._readFile(this.inventoryFile, []);
    return list.find(p => p.slug === slug) || null;
  }

  async getAllProducts() {
    return this._readFile(this.inventoryFile, []);
  }

  async updateStock(id, delta) {
    const list = this._readFile(this.inventoryFile, []);
    const prod = list.find(p => p.id === id);
    if (prod) {
      prod.stock = Math.max(0, (prod.stock || 0) + delta);
      prod.updatedAt = new Date().toISOString();
      this._writeFile(this.inventoryFile, list);
      return prod;
    }
    return null;
  }

  // --- Verification Codes (OTP) ---
  async getVerificationCode(email) {
    if (!email) return null;
    const clean = email.trim().toLowerCase();
    const map = this._readFile(this.verificationFile, {});
    return map[clean] || null;
  }

  async saveVerificationCode(email, record) {
    if (!email) return false;
    const clean = email.trim().toLowerCase();
    const map = this._readFile(this.verificationFile, {});
    map[clean] = {
      ...record,
      updatedAt: new Date().toISOString()
    };
    this._writeFile(this.verificationFile, map);
    return true;
  }

  async incrementVerificationAttempts(email) {
    if (!email) return 0;
    const clean = email.trim().toLowerCase();
    const map = this._readFile(this.verificationFile, {});
    if (map[clean]) {
      map[clean].attempts = (map[clean].attempts || 0) + 1;
      this._writeFile(this.verificationFile, map);
      return map[clean].attempts;
    }
    return 0;
  }

  async markVerificationCodeUsed(email) {
    if (!email) return false;
    const clean = email.trim().toLowerCase();
    const map = this._readFile(this.verificationFile, {});
    if (map[clean]) {
      map[clean].verified = true;
      this._writeFile(this.verificationFile, map);
      return true;
    }
    return false;
  }

  async deleteVerificationCode(email) {
    if (!email) return false;
    const clean = email.trim().toLowerCase();
    const map = this._readFile(this.verificationFile, {});
    if (map[clean]) {
      delete map[clean];
      this._writeFile(this.verificationFile, map);
      return true;
    }
    return false;
  }

  // --- Webhook Events (Idempotency) ---
  async getWebhookEvent(eventId) {
    const list = this._readFile(this.webhooksFile, []);
    return list.find(e => String(e.id) === String(eventId)) || null;
  }

  async recordWebhookEvent(eventRecord) {
    const list = this._readFile(this.webhooksFile, []);
    const existing = list.find(e => String(e.id) === String(eventRecord.id));
    if (existing) return existing;
    list.unshift({
      ...eventRecord,
      createdAt: new Date().toISOString()
    });
    this._writeFile(this.webhooksFile, list);
    return eventRecord;
  }
}

module.exports = JsonFileAdapter;
