/**
 * ============================================================================
 * DOPAMINE LUXURY STREETWEAR PLATFORM — IDatabaseAdapter INTERFACE
 * ============================================================================
 * Abstract Database Adapter defining CRUD operations for:
 * - Customers & Addresses
 * - Orders & Order Items
 * - Inventory & Stock Reservation
 * - Verification Codes (OTP)
 * - Webhook Events (Idempotency)
 * ============================================================================
 */

class IDatabaseAdapter {
  // --- Customers ---
  async getCustomerById(id) { throw new Error('Method not implemented.'); }
  async getCustomerByEmail(email) { throw new Error('Method not implemented.'); }
  async getAllCustomers() { throw new Error('Method not implemented.'); }
  async upsertCustomer(customerData) { throw new Error('Method not implemented.'); }
  async updateCustomerLastLogin(id) { throw new Error('Method not implemented.'); }
  async deleteCustomer(id) { throw new Error('Method not implemented.'); }

  // --- Orders ---
  async getOrderById(id) { throw new Error('Method not implemented.'); }
  async getOrdersByCustomerEmail(email) { throw new Error('Method not implemented.'); }
  async getAllOrders() { throw new Error('Method not implemented.'); }
  async createOrder(orderData) { throw new Error('Method not implemented.'); }
  async updateOrderStatus(id, status, metadata = {}) { throw new Error('Method not implemented.'); }

  // --- Inventory ---
  async getProductById(id) { throw new Error('Method not implemented.'); }
  async getProductBySlug(slug) { throw new Error('Method not implemented.'); }
  async getAllProducts() { throw new Error('Method not implemented.'); }
  async updateStock(id, delta) { throw new Error('Method not implemented.'); }

  // --- Verification Codes (OTP) ---
  async getVerificationCode(email) { throw new Error('Method not implemented.'); }
  async saveVerificationCode(email, record) { throw new Error('Method not implemented.'); }
  async incrementVerificationAttempts(email) { throw new Error('Method not implemented.'); }
  async markVerificationCodeUsed(email) { throw new Error('Method not implemented.'); }
  async deleteVerificationCode(email) { throw new Error('Method not implemented.'); }

  // --- Webhook Events (Idempotency) ---
  async getWebhookEvent(eventId) { throw new Error('Method not implemented.'); }
  async recordWebhookEvent(eventRecord) { throw new Error('Method not implemented.'); }
}

module.exports = IDatabaseAdapter;
