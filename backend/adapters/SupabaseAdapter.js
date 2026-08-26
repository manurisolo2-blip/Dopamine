/**
 * ============================================================================
 * DOPAMINE LUXURY STREETWEAR PLATFORM — SupabaseAdapter
 * ============================================================================
 * Cloud PostgreSQL / Supabase adapter implementing IDatabaseAdapter.
 * Handles relational persistence for customers, orders, inventory, and OTP.
 * Gracefully falls back to JsonFileAdapter if connection is unavailable.
 * ============================================================================
 */

const IDatabaseAdapter = require('./IDatabaseAdapter');

class SupabaseAdapter extends IDatabaseAdapter {
  constructor(supabaseUrl, supabaseKey, fallbackAdapter) {
    super();
    this.supabaseUrl = supabaseUrl || process.env.SUPABASE_URL;
    this.supabaseKey = supabaseKey || process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
    this.fallbackAdapter = fallbackAdapter;
    this.client = null;

    if (this.supabaseUrl && this.supabaseKey && this.supabaseUrl !== 'https://your-project.supabase.co') {
      try {
        const { createClient } = require('@supabase/supabase-js');
        this.client = createClient(this.supabaseUrl, this.supabaseKey);
      } catch (err) {
        console.warn('[SupabaseAdapter] Failed to initialize Supabase client:', err.message);
      }
    }
  }

  get isConnected() {
    return !!this.client;
  }

  // --- Customers ---
  async getCustomerById(id) {
    if (!this.isConnected) return this.fallbackAdapter.getCustomerById(id);
    try {
      const { data, error } = await this.client.from('customers').select('*').eq('id', id).single();
      if (error) throw error;
      return data;
    } catch (e) {
      return this.fallbackAdapter.getCustomerById(id);
    }
  }

  async getCustomerByEmail(email) {
    if (!this.isConnected) return this.fallbackAdapter.getCustomerByEmail(email);
    try {
      const clean = email.trim().toLowerCase();
      const { data, error } = await this.client.from('customers').select('*').eq('email', clean).single();
      if (error) throw error;
      return data;
    } catch (e) {
      return this.fallbackAdapter.getCustomerByEmail(email);
    }
  }

  async getAllCustomers() {
    if (!this.isConnected) return this.fallbackAdapter.getAllCustomers();
    try {
      const { data, error } = await this.client.from('customers').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    } catch (e) {
      return this.fallbackAdapter.getAllCustomers();
    }
  }

  async upsertCustomer(customerData) {
    if (!this.isConnected) return this.fallbackAdapter.upsertCustomer(customerData);
    try {
      const { data, error } = await this.client.from('customers').upsert(customerData).select().single();
      if (error) throw error;
      return data;
    } catch (e) {
      return this.fallbackAdapter.upsertCustomer(customerData);
    }
  }

  async updateCustomerLastLogin(id) {
    if (!this.isConnected) return this.fallbackAdapter.updateCustomerLastLogin(id);
    try {
      const now = new Date().toISOString();
      const { data, error } = await this.client.from('customers').update({ last_login: now }).eq('id', id).select().single();
      if (error) throw error;
      return data;
    } catch (e) {
      return this.fallbackAdapter.updateCustomerLastLogin(id);
    }
  }

  async deleteCustomer(id) {
    if (!this.isConnected) return this.fallbackAdapter.deleteCustomer(id);
    try {
      const { error } = await this.client.from('customers').delete().eq('id', id);
      if (error) throw error;
      return true;
    } catch (e) {
      return this.fallbackAdapter.deleteCustomer(id);
    }
  }

  // --- Orders ---
  async getOrderById(id) {
    if (!this.isConnected) return this.fallbackAdapter.getOrderById(id);
    try {
      const { data, error } = await this.client.from('orders').select('*, order_items(*)').eq('id', id).single();
      if (error) throw error;
      return data;
    } catch (e) {
      return this.fallbackAdapter.getOrderById(id);
    }
  }

  async getOrdersByCustomerEmail(email) {
    if (!this.isConnected) return this.fallbackAdapter.getOrdersByCustomerEmail(email);
    try {
      const clean = email.trim().toLowerCase();
      const { data, error } = await this.client.from('orders').select('*, order_items(*)').eq('customer_email', clean);
      if (error) throw error;
      return data;
    } catch (e) {
      return this.fallbackAdapter.getOrdersByCustomerEmail(email);
    }
  }

  async getAllOrders() {
    if (!this.isConnected) return this.fallbackAdapter.getAllOrders();
    try {
      const { data, error } = await this.client.from('orders').select('*, order_items(*)').order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    } catch (e) {
      return this.fallbackAdapter.getAllOrders();
    }
  }

  async createOrder(orderData) {
    if (!this.isConnected) return this.fallbackAdapter.createOrder(orderData);
    try {
      const { data, error } = await this.client.from('orders').insert(orderData).select().single();
      if (error) throw error;
      return data;
    } catch (e) {
      return this.fallbackAdapter.createOrder(orderData);
    }
  }

  async updateOrderStatus(id, status, metadata = {}) {
    if (!this.isConnected) return this.fallbackAdapter.updateOrderStatus(id, status, metadata);
    try {
      const updatePayload = { status, updated_at: new Date().toISOString() };
      if (metadata.mpPaymentId) updatePayload.mp_payment_id = metadata.mpPaymentId;
      if (metadata.mpStatus) updatePayload.mp_status = metadata.mpStatus;
      const { data, error } = await this.client.from('orders').update(updatePayload).eq('id', id).select().single();
      if (error) throw error;
      return data;
    } catch (e) {
      return this.fallbackAdapter.updateOrderStatus(id, status, metadata);
    }
  }

  // --- Inventory ---
  async getProductById(id) {
    if (!this.isConnected) return this.fallbackAdapter.getProductById(id);
    try {
      const { data, error } = await this.client.from('inventory').select('*').eq('id', id).single();
      if (error) throw error;
      return data;
    } catch (e) {
      return this.fallbackAdapter.getProductById(id);
    }
  }

  async getProductBySlug(slug) {
    if (!this.isConnected) return this.fallbackAdapter.getProductBySlug(slug);
    try {
      const { data, error } = await this.client.from('inventory').select('*').eq('slug', slug).single();
      if (error) throw error;
      return data;
    } catch (e) {
      return this.fallbackAdapter.getProductBySlug(slug);
    }
  }

  async getAllProducts() {
    if (!this.isConnected) return this.fallbackAdapter.getAllProducts();
    try {
      const { data, error } = await this.client.from('inventory').select('*');
      if (error) throw error;
      return data;
    } catch (e) {
      return this.fallbackAdapter.getAllProducts();
    }
  }

  async updateStock(id, delta) {
    return this.fallbackAdapter.updateStock(id, delta);
  }

  // --- Verification Codes (OTP) ---
  async getVerificationCode(email) {
    if (!this.isConnected) return this.fallbackAdapter.getVerificationCode(email);
    try {
      const clean = email.trim().toLowerCase();
      const { data, error } = await this.client.from('verification_codes').select('*').eq('email', clean).single();
      if (error) throw error;
      return data;
    } catch (e) {
      return this.fallbackAdapter.getVerificationCode(email);
    }
  }

  async saveVerificationCode(email, record) {
    if (!this.isConnected) return this.fallbackAdapter.saveVerificationCode(email, record);
    try {
      const clean = email.trim().toLowerCase();
      const payload = {
        email: clean,
        code: record.code,
        code_hash: record.codeHash,
        created_at: record.createdAt,
        expires_at: record.expiresAt,
        attempts: record.attempts || 0,
        verified: !!record.verified,
        delivery_method: record.deliveryMethod || 'toast'
      };
      const { error } = await this.client.from('verification_codes').upsert(payload);
      if (error) throw error;
      return true;
    } catch (e) {
      return this.fallbackAdapter.saveVerificationCode(email, record);
    }
  }

  async incrementVerificationAttempts(email) {
    return this.fallbackAdapter.incrementVerificationAttempts(email);
  }

  async markVerificationCodeUsed(email) {
    if (!this.isConnected) return this.fallbackAdapter.markVerificationCodeUsed(email);
    try {
      const clean = email.trim().toLowerCase();
      const { error } = await this.client.from('verification_codes').update({ verified: true }).eq('email', clean);
      if (error) throw error;
      return true;
    } catch (e) {
      return this.fallbackAdapter.markVerificationCodeUsed(email);
    }
  }

  async deleteVerificationCode(email) {
    if (!this.isConnected) return this.fallbackAdapter.deleteVerificationCode(email);
    try {
      const clean = email.trim().toLowerCase();
      const { error } = await this.client.from('verification_codes').delete().eq('email', clean);
      if (error) throw error;
      return true;
    } catch (e) {
      return this.fallbackAdapter.deleteVerificationCode(email);
    }
  }

  // --- Webhook Events ---
  async getWebhookEvent(eventId) {
    if (!this.isConnected) return this.fallbackAdapter.getWebhookEvent(eventId);
    try {
      const { data, error } = await this.client.from('webhook_events').select('*').eq('id', String(eventId)).single();
      if (error) throw error;
      return data;
    } catch (e) {
      return this.fallbackAdapter.getWebhookEvent(eventId);
    }
  }

  async recordWebhookEvent(eventRecord) {
    if (!this.isConnected) return this.fallbackAdapter.recordWebhookEvent(eventRecord);
    try {
      const { data, error } = await this.client.from('webhook_events').upsert(eventRecord).select().single();
      if (error) throw error;
      return data;
    } catch (e) {
      return this.fallbackAdapter.recordWebhookEvent(eventRecord);
    }
  }
}

module.exports = SupabaseAdapter;
