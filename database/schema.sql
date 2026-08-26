-- ============================================================================
-- DOPAMINE LUXURY STREETWEAR PLATFORM — DATABASE PERSISTENCE SCHEMA
-- ============================================================================
-- PostgreSQL (Supabase) & MySQL Compatible Schema
-- Conforms to Data Contracts (data_contracts.ts) & R4 Backend Persistence
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. CUSTOMERS / USERS TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS customers (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    raw_password VARCHAR(255),
    password_masked VARCHAR(255) DEFAULT '••••••••',
    birthdate VARCHAR(50) DEFAULT 'No especificada',
    phone VARCHAR(50),
    picture TEXT,
    provider VARCHAR(50) DEFAULT 'email',
    role VARCHAR(50) DEFAULT 'customer',
    email_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_customers_email ON customers(email);
CREATE INDEX idx_customers_provider ON customers(provider);

-- ----------------------------------------------------------------------------
-- 2. CUSTOMER ADDRESSES TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS customer_addresses (
    id VARCHAR(64) PRIMARY KEY,
    customer_id VARCHAR(64) NOT NULL,
    street VARCHAR(255) NOT NULL,
    apartment VARCHAR(100) DEFAULT '',
    province VARCHAR(100) NOT NULL,
    city VARCHAR(100) NOT NULL,
    zip VARCHAR(10) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
);

CREATE INDEX idx_customer_addresses_cid ON customer_addresses(customer_id);

-- ----------------------------------------------------------------------------
-- 3. INVENTORY & PRODUCTS TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS inventory (
    id VARCHAR(64) PRIMARY KEY,
    slug VARCHAR(128) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(64) NOT NULL,
    price INTEGER NOT NULL,
    compare_at_price INTEGER,
    badge VARCHAR(64),
    stock INTEGER NOT NULL DEFAULT 0,
    subtitle VARCHAR(255),
    description TEXT,
    details TEXT,
    colors_json TEXT,
    sizes_json TEXT,
    images_json TEXT,
    weight_gsm INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_inventory_slug ON inventory(slug);
CREATE INDEX idx_inventory_category ON inventory(category);

-- ----------------------------------------------------------------------------
-- 4. ORDERS TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS orders (
    id VARCHAR(64) PRIMARY KEY,
    customer_id VARCHAR(64),
    customer_email VARCHAR(255) NOT NULL,
    customer_name VARCHAR(255) NOT NULL,
    customer_last_name VARCHAR(255) NOT NULL,
    customer_dni VARCHAR(20) NOT NULL,
    customer_phone VARCHAR(50) NOT NULL,
    shipping_type VARCHAR(50) NOT NULL,
    shipping_option VARCHAR(50) NOT NULL,
    shipping_address VARCHAR(255) NOT NULL,
    shipping_apartment VARCHAR(100) DEFAULT '',
    shipping_province VARCHAR(100) NOT NULL,
    shipping_city VARCHAR(100) NOT NULL,
    shipping_zip VARCHAR(10) NOT NULL,
    shipping_cost INTEGER NOT NULL DEFAULT 0,
    payment_method VARCHAR(50) NOT NULL,
    payment_installments INTEGER NOT NULL DEFAULT 1,
    mp_payment_id VARCHAR(128),
    mp_preference_id VARCHAR(128),
    mp_status VARCHAR(64),
    idempotency_key VARCHAR(128),
    subtotal INTEGER NOT NULL,
    discount INTEGER NOT NULL DEFAULT 0,
    coupon VARCHAR(64),
    total INTEGER NOT NULL,
    currency VARCHAR(10) DEFAULT 'ARS',
    status VARCHAR(50) DEFAULT 'approved',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_orders_customer_email ON orders(customer_email);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_idempotency ON orders(idempotency_key);

-- ----------------------------------------------------------------------------
-- 5. ORDER LINE ITEMS TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS order_items (
    id VARCHAR(64) PRIMARY KEY,
    order_id VARCHAR(64) NOT NULL,
    product_id VARCHAR(64) NOT NULL,
    product_slug VARCHAR(128) NOT NULL,
    product_name VARCHAR(255) NOT NULL,
    price INTEGER NOT NULL,
    image VARCHAR(255),
    color VARCHAR(100) NOT NULL,
    size VARCHAR(50) NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);

CREATE INDEX idx_order_items_order_id ON order_items(order_id);

-- ----------------------------------------------------------------------------
-- 6. VERIFICATION CODES & OTP TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS verification_codes (
    email VARCHAR(255) PRIMARY KEY,
    code VARCHAR(10) NOT NULL,
    code_hash VARCHAR(255),
    created_at BIGINT NOT NULL,
    expires_at BIGINT NOT NULL,
    attempts INTEGER DEFAULT 0,
    verified BOOLEAN DEFAULT FALSE,
    delivery_method VARCHAR(50) DEFAULT 'toast',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_verification_expires ON verification_codes(expires_at);

-- ----------------------------------------------------------------------------
-- 7. WEBHOOK EVENTS & IDEMPOTENCY AUDIT LOG
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS webhook_events (
    id VARCHAR(128) PRIMARY KEY,
    provider VARCHAR(50) DEFAULT 'mercadopago',
    event_type VARCHAR(64) NOT NULL,
    action VARCHAR(64),
    payload_json TEXT NOT NULL,
    order_id VARCHAR(64),
    signature VARCHAR(255),
    status VARCHAR(50) DEFAULT 'processed',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_webhook_events_order ON webhook_events(order_id);

-- ----------------------------------------------------------------------------
-- 8. AUTH SESSIONS TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS sessions (
    session_id VARCHAR(128) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL,
    token_hash VARCHAR(255),
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES customers(id) ON DELETE CASCADE
);

CREATE INDEX idx_sessions_user_id ON sessions(user_id);

