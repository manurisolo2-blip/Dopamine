/**
 * ============================================================================
 * DOPAMINE LUXURY STREETWEAR PLATFORM — FORMAL DATA CONTRACTS & SCHEMAS
 * ============================================================================
 * Specification Version: 2.1.0-PROD
 * Authoritative Entity Data Definitions, Zod Schemas & Validation Helpers
 * Conforms strictly to design.md, PROJECT.md (R1-R6), and 5-Tier E2E Standards
 * ============================================================================
 */

import { z } from 'zod';

// ============================================================================
// 1. PRODUCT & CATALOG CONTRACTS
// ============================================================================

export const ColorVariantSchema = z.object({
  id: z.string().min(1, 'Color ID is required'),
  name: z.string().min(1, 'Color display name is required'),
  hex: z.string().regex(/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/, 'Valid HEX color required (e.g. #0D0D0D)')
});

export type ColorVariant = z.infer<typeof ColorVariantSchema>;

export const ProductCategoryEnum = z.enum([
  'hoodies',
  'tops',
  'bottoms',
  'sets',
  'accessories',
  'footwear'
]);

export type ProductCategory = z.infer<typeof ProductCategoryEnum>;

export const ProductBadgeEnum = z.enum([
  'NEW DROP',
  'LIMITED',
  'DROP 01',
  'BEST SELLER',
  'CORE',
  'EXCLUSIVO',
  'NEW'
]);

export type ProductBadge = z.infer<typeof ProductBadgeEnum>;

export const ProductDimensionsSchema = z.object({
  chest: z.number().positive().optional(),
  length: z.number().positive().optional(),
  sleeve: z.number().positive().optional(),
  waist: z.number().positive().optional(),
  hip: z.number().positive().optional()
});

export type ProductDimensions = z.infer<typeof ProductDimensionsSchema>;

export const ProductSchema = z.object({
  id: z.string().min(1, 'Product unique ID required'),
  slug: z.string().regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric and hyphens'),
  name: z.string().min(2, 'Product title must be at least 2 characters'),
  category: ProductCategoryEnum,
  price: z.number().int().positive('Price in ARS must be a positive integer'),
  compareAtPrice: z.number().int().positive().nullable().optional(),
  badge: z.string().nullable().optional(),
  subtitle: z.string().min(2, 'Subtitle required'),
  stock: z.number().int().nonnegative('Stock cannot be negative'),
  description: z.string().min(10, 'Detailed editorial description required'),
  details: z.string().min(5, 'Technical textile details required'),
  colors: z.array(ColorVariantSchema).min(1, 'At least one color variant required'),
  sizes: z.array(z.string().min(1)).min(1, 'At least one size required'),
  images: z.array(z.string().min(1)).min(1, 'At least one product image WebP path required'),
  careInstructions: z.string().optional(),
  dimensions: ProductDimensionsSchema.optional(),
  weightGsm: z.number().int().positive().optional(),
  tags: z.array(z.string()).optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional()
});

export type Product = z.infer<typeof ProductSchema>;

// ============================================================================
// 2. CUSTOMER PROFILE & AUTHENTICATION CONTRACTS
// ============================================================================

export const AuthProviderEnum = z.enum(['email', 'google', 'apple']);
export type AuthProvider = z.infer<typeof AuthProviderEnum>;

export const UserRoleEnum = z.enum(['customer', 'admin']);
export type UserRole = z.infer<typeof UserRoleEnum>;

export const AddressRecordSchema = z.object({
  id: z.string().optional(),
  street: z.string().min(3, 'Street address required'),
  apartment: z.string().optional().default(''),
  province: z.string().min(2, 'Province required'),
  city: z.string().min(2, 'City required'),
  zip: z.string().regex(/^\d{4}$/, 'Argentine postal code must be exactly 4 digits'),
  phone: z.string().min(8, 'Valid phone number required'),
  isDefault: z.boolean().default(false)
});

export type AddressRecord = z.infer<typeof AddressRecordSchema>;

export const CustomerProfileSchema = z.object({
  id: z.string().min(1, 'Customer ID required (usr_*)'),
  name: z.string().min(1, 'Customer full name required'),
  email: z.string().email('Valid email address required'),
  passwordHash: z.string().optional(),
  rawPassword: z.string().optional(),
  passwordMasked: z.string().default('••••••••'),
  birthdate: z.string().default('No especificada'),
  phone: z.string().optional(),
  picture: z.string().url().or(z.literal('')).optional(),
  provider: AuthProviderEnum.default('email'),
  role: UserRoleEnum.default('customer'),
  emailVerified: z.boolean().default(false),
  createdAt: z.string(),
  lastLogin: z.string(),
  addresses: z.array(AddressRecordSchema).optional().default([]),
  orderHistory: z.array(z.string()).optional().default([])
});

export type CustomerProfile = z.infer<typeof CustomerProfileSchema>;

export const CustomerProfileSafeSchema = CustomerProfileSchema.omit({
  passwordHash: true,
  rawPassword: true
});

export type CustomerProfileSafe = z.infer<typeof CustomerProfileSafeSchema>;

export const AuthSessionSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  birthdate: z.string().optional(),
  picture: z.string().optional(),
  provider: AuthProviderEnum,
  role: UserRoleEnum.default('customer'),
  emailVerified: z.boolean(),
  loggedIn: z.boolean(),
  token: z.string().optional(),
  loginTime: z.string()
});

export type AuthSession = z.infer<typeof AuthSessionSchema>;

// ============================================================================
// 3. CART SESSION & LINE ITEM CONTRACTS
// ============================================================================

export const CartLineItemSchema = z.object({
  key: z.string().min(1, 'Unique composite variant key (id::color::size) required'),
  id: z.string().min(1, 'Product ID required'),
  slug: z.string(),
  name: z.string().min(1, 'Product name required'),
  price: z.number().int().positive('Price must be a positive integer in ARS'),
  image: z.string().min(1, 'Image path required'),
  color: z.string().min(1, 'Selected color required'),
  size: z.string().min(1, 'Selected size required'),
  quantity: z.number().int().min(1, 'Quantity must be at least 1')
});

export type CartLineItem = z.infer<typeof CartLineItemSchema>;

export const CartRecommendationItemSchema = z.object({
  id: z.string(),
  slug: z.string(),
  name: z.string(),
  price: z.number().int().positive(),
  image: z.string(),
  color: z.string(),
  size: z.string()
});

export type CartRecommendationItem = z.infer<typeof CartRecommendationItemSchema>;

export const CartSessionSchema = z.object({
  items: z.array(CartLineItemSchema),
  itemCount: z.number().int().nonnegative(),
  subtotal: z.number().int().nonnegative(),
  currency: z.literal('ARS').default('ARS'),
  freeShippingThreshold: z.number().int().default(90000),
  freeShippingQualified: z.boolean(),
  amountToFreeShipping: z.number().int().nonnegative(),
  recommendations: z.array(CartRecommendationItemSchema).optional(),
  updatedAt: z.string().optional()
});

export type CartSession = z.infer<typeof CartSessionSchema>;

// ============================================================================
// 4. SHIPPING RATE & LOCATION CONTRACTS
// ============================================================================

export const ShippingTypeEnum = z.enum(['home', 'pickup']);
export type ShippingType = z.infer<typeof ShippingTypeEnum>;

export const ShippingSpeedOptionEnum = z.enum(['standard', 'express']);
export type ShippingSpeedOption = z.infer<typeof ShippingSpeedOptionEnum>;

export const ShippingRateCalculationSchema = z.object({
  provinceId: z.string(),
  provinceName: z.string(),
  city: z.string(),
  zip: z.string().regex(/^\d{4}$/, 'Argentine ZIP code must be exactly 4 digits'),
  type: ShippingTypeEnum,
  option: ShippingSpeedOptionEnum,
  isAmba: z.boolean(),
  baseRateStandard: z.number().int().default(5500),
  baseRateExpress: z.number().int().default(8500),
  calculatedCost: z.number().int().nonnegative(),
  freeShippingThreshold: z.number().int().default(90000),
  isFreeShipping: z.boolean(),
  estimatedDaysMin: z.number().int().positive(),
  estimatedDaysMax: z.number().int().positive()
});

export type ShippingRateCalculation = z.infer<typeof ShippingRateCalculationSchema>;

// ============================================================================
// 5. ORDER TRANSACTION & CHECKOUT CONTRACTS
// ============================================================================

export const PaymentMethodEnum = z.enum([
  'mercadopago',
  'credit',
  'debit',
  'modo',
  'transfer'
]);
export type PaymentMethod = z.infer<typeof PaymentMethodEnum>;

export const OrderStatusEnum = z.enum([
  'pending',
  'approved',
  'in_process',
  'rejected',
  'refunded',
  'cancelled',
  'shipped',
  'delivered'
]);
export type OrderStatus = z.infer<typeof OrderStatusEnum>;

export const CheckoutCustomerSchema = z.object({
  email: z.string().email('Valid email required'),
  name: z.string().min(1, 'First name required'),
  lastName: z.string().min(1, 'Last name required'),
  dni: z.string().regex(/^\d{7,8}$/, 'Valid Argentine DNI (7-8 digits) required'),
  phone: z.string().min(8, 'Phone number required'),
  noNewsletter: z.boolean().default(false)
});

export type CheckoutCustomer = z.infer<typeof CheckoutCustomerSchema>;

export const CheckoutShippingSchema = z.object({
  type: ShippingTypeEnum,
  option: ShippingSpeedOptionEnum,
  address: z.string().min(3, 'Street address required'),
  apartment: z.string().optional().default(''),
  province: z.string().min(2, 'Province identifier required'),
  city: z.string().min(2, 'City required'),
  zip: z.string().regex(/^\d{4}$/, 'ZIP must be 4 digits'),
  cost: z.number().int().nonnegative()
});

export type CheckoutShipping = z.infer<typeof CheckoutShippingSchema>;

export const CheckoutPaymentSchema = z.object({
  method: PaymentMethodEnum,
  installments: z.number().int().min(1).max(12).default(6),
  cardNumber: z.string().optional(),
  cardHolder: z.string().optional(),
  cardExp: z.string().optional(),
  cardCvv: z.string().optional(),
  mpPaymentId: z.string().optional(),
  mpPreferenceId: z.string().optional(),
  mpStatus: z.string().optional(),
  idempotencyKey: z.string().optional()
});

export type CheckoutPayment = z.infer<typeof CheckoutPaymentSchema>;

export const OrderTransactionSchema = z.object({
  id: z.string().regex(/^DPM-\d{6}$/, 'Order ID must follow DPM-XXXXXX format'),
  date: z.string(),
  customer: CheckoutCustomerSchema,
  shipping: CheckoutShippingSchema,
  payment: CheckoutPaymentSchema,
  items: z.array(CartLineItemSchema).min(1, 'Order must contain at least 1 item'),
  subtotal: z.number().int().nonnegative(),
  shippingCost: z.number().int().nonnegative(),
  discount: z.number().int().nonnegative(),
  coupon: z.string().nullable().optional(),
  total: z.number().int().nonnegative(),
  currency: z.literal('ARS').default('ARS'),
  status: OrderStatusEnum.default('approved')
});

export type OrderTransaction = z.infer<typeof OrderTransactionSchema>;

// ============================================================================
// 6. VERIFICATION CODE & OTP CONTRACTS
// ============================================================================

export const DeliveryMethodEnum = z.enum(['smtp', 'relay', 'toast']);
export type DeliveryMethod = z.infer<typeof DeliveryMethodEnum>;

export const VerificationCodeRecordSchema = z.object({
  code: z.string().regex(/^\d{6}$/, 'Verification code must be exactly 6 numeric digits'),
  codeHash: z.string().optional(),
  createdAt: z.number().int().positive(),
  expiresAt: z.number().int().positive(),
  attempts: z.number().int().min(0).max(5).default(0),
  verified: z.boolean().default(false),
  deliveryMethod: DeliveryMethodEnum.default('toast')
});

export type VerificationCodeRecord = z.infer<typeof VerificationCodeRecordSchema>;

export const VerificationStoreSchema = z.record(
  z.string().email(),
  VerificationCodeRecordSchema
);

export type VerificationStore = z.infer<typeof VerificationStoreSchema>;

// ============================================================================
// 7. REST API REQUEST / RESPONSE CONTRACTS
// ============================================================================

// 7.1 Generic Error Response
export const ApiErrorResponseSchema = z.object({
  success: z.literal(false).default(false),
  error: z.string(),
  code: z.string().optional(),
  details: z.array(z.string()).optional()
});
export type ApiErrorResponse = z.infer<typeof ApiErrorResponseSchema>;

// 7.2 /api/auth/register
export const ApiRegisterRequestSchema = z.object({
  email: z.string().email('Valid email required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  name: z.string().min(1, 'Name is required'),
  birthdate: z.string().optional(),
  emailVerified: z.boolean().optional()
});
export type ApiRegisterRequest = z.infer<typeof ApiRegisterRequestSchema>;

export const ApiRegisterResponseSchema = z.object({
  success: z.boolean(),
  user: CustomerProfileSafeSchema,
  token: z.string(),
  message: z.string().optional()
});
export type ApiRegisterResponse = z.infer<typeof ApiRegisterResponseSchema>;

// 7.3 /api/auth/login
export const ApiLoginRequestSchema = z.object({
  email: z.string().email('Valid email required'),
  password: z.string().min(1, 'Password required')
});
export type ApiLoginRequest = z.infer<typeof ApiLoginRequestSchema>;

export const ApiLoginResponseSchema = z.object({
  success: z.boolean(),
  user: CustomerProfileSafeSchema,
  token: z.string(),
  message: z.string().optional()
});
export type ApiLoginResponse = z.infer<typeof ApiLoginResponseSchema>;

// 7.4 /api/auth/verify-code
export const ApiVerifyCodeRequestSchema = z.object({
  email: z.string().email('Valid email required'),
  code: z.string().regex(/^\d{6}$/, 'Code must be 6 digits')
});
export type ApiVerifyCodeRequest = z.infer<typeof ApiVerifyCodeRequestSchema>;

export const ApiVerifyCodeResponseSchema = z.object({
  success: z.boolean(),
  verified: z.boolean(),
  message: z.string().optional(),
  user: CustomerProfileSafeSchema.optional()
});
export type ApiVerifyCodeResponse = z.infer<typeof ApiVerifyCodeResponseSchema>;

// 7.5 /api/auth/send-code
export const ApiSendCodeRequestSchema = z.object({
  email: z.string().email('Valid email required')
});
export type ApiSendCodeRequest = z.infer<typeof ApiSendCodeRequestSchema>;

export const ApiSendCodeResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  deliveryMethod: DeliveryMethodEnum,
  expiresInSeconds: z.number().int().default(900),
  codePreview: z.string().optional()
});
export type ApiSendCodeResponse = z.infer<typeof ApiSendCodeResponseSchema>;

// 7.6 /api/auth/oauth
export const ApiOAuthRequestSchema = z.object({
  provider: z.enum(['google', 'apple']),
  email: z.string().email(),
  name: z.string().optional(),
  picture: z.string().url().or(z.literal('')).optional(),
  token: z.string().optional()
});
export type ApiOAuthRequest = z.infer<typeof ApiOAuthRequestSchema>;

export const ApiOAuthResponseSchema = z.object({
  success: z.boolean(),
  user: CustomerProfileSafeSchema,
  token: z.string()
});
export type ApiOAuthResponse = z.infer<typeof ApiOAuthResponseSchema>;

// 7.7 /api/auth/me
export const ApiAuthMeResponseSchema = z.object({
  success: z.boolean(),
  user: CustomerProfileSafeSchema
});
export type ApiAuthMeResponse = z.infer<typeof ApiAuthMeResponseSchema>;

// 7.8 /api/checkout/create-preference
export const CheckoutItemInputSchema = z.object({
  id: z.string().min(1, 'Product ID required'),
  quantity: z.number().int().positive('Quantity must be a positive integer'),
  color: z.string().optional(),
  size: z.string().optional()
});
export type CheckoutItemInput = z.infer<typeof CheckoutItemInputSchema>;

export const ApiCreatePreferenceRequestSchema = z.object({
  items: z.array(CheckoutItemInputSchema).min(1, 'At least 1 item required'),
  customer: CheckoutCustomerSchema,
  shipping: CheckoutShippingSchema,
  coupon: z.string().optional(),
  idempotencyKey: z.string().optional()
});
export type ApiCreatePreferenceRequest = z.infer<typeof ApiCreatePreferenceRequestSchema>;

export const ApiCreatePreferenceResponseSchema = z.object({
  success: z.boolean(),
  preferenceId: z.string(),
  initPoint: z.string().url(),
  sandboxInitPoint: z.string().url().optional(),
  orderId: z.string(),
  summary: z.object({
    subtotal: z.number().int(),
    shippingCost: z.number().int(),
    discount: z.number().int(),
    total: z.number().int(),
    currency: z.literal('ARS')
  })
});
export type ApiCreatePreferenceResponse = z.infer<typeof ApiCreatePreferenceResponseSchema>;

// 7.9 /api/webhooks/mercadopago
export const ApiMercadoPagoWebhookSchema = z.object({
  id: z.union([z.number(), z.string()]),
  live_mode: z.boolean(),
  type: z.enum(['payment', 'plan', 'subscription', 'invoice', 'test']),
  date_created: z.string(),
  user_id: z.union([z.number(), z.string()]),
  api_version: z.string(),
  action: z.string(),
  data: z.object({
    id: z.string()
  })
});
export type ApiMercadoPagoWebhook = z.infer<typeof ApiMercadoPagoWebhookSchema>;

export const ApiWebhookResponseSchema = z.object({
  received: z.boolean(),
  status: z.enum(['processed', 'ignored_duplicate', 'invalid_signature']),
  orderId: z.string().optional()
});
export type ApiWebhookResponse = z.infer<typeof ApiWebhookResponseSchema>;

// 7.10 /api/admin/customers
export const ApiAdminCustomersResponseSchema = z.object({
  success: z.boolean(),
  total: z.number().int().nonnegative(),
  customers: z.array(CustomerProfileSafeSchema)
});
export type ApiAdminCustomersResponse = z.infer<typeof ApiAdminCustomersResponseSchema>;

// 7.11 /api/admin/orders
export const ApiAdminOrdersResponseSchema = z.object({
  success: z.boolean(),
  total: z.number().int().nonnegative(),
  orders: z.array(OrderTransactionSchema)
});
export type ApiAdminOrdersResponse = z.infer<typeof ApiAdminOrdersResponseSchema>;

export const ApiAdminPatchOrderRequestSchema = z.object({
  status: OrderStatusEnum,
  trackingNumber: z.string().optional(),
  notes: z.string().optional()
});
export type ApiAdminPatchOrderRequest = z.infer<typeof ApiAdminPatchOrderRequestSchema>;

export const ApiAdminPatchOrderResponseSchema = z.object({
  success: z.boolean(),
  order: OrderTransactionSchema,
  message: z.string().optional()
});
export type ApiAdminPatchOrderResponse = z.infer<typeof ApiAdminPatchOrderResponseSchema>;

// ============================================================================
// 8. RUNTIME VALIDATION HELPERS
// ============================================================================

export type ValidationResult<T> =
  | { success: true; data: T; errors?: undefined }
  | { success: false; errors: string[]; data?: undefined };

export function safeValidate<T>(schema: z.ZodSchema<T>, data: unknown): ValidationResult<T> {
  const result = schema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  const errors = result.error.errors.map(err => `${err.path.join('.')}: ${err.message}`);
  return { success: false, errors };
}

export function validateProduct(data: unknown): ValidationResult<Product> {
  return safeValidate(ProductSchema, data);
}

export function validateColorVariant(data: unknown): ValidationResult<ColorVariant> {
  return safeValidate(ColorVariantSchema, data);
}

export function validateCustomerProfile(data: unknown): ValidationResult<CustomerProfile> {
  return safeValidate(CustomerProfileSchema, data);
}

export function validateCustomerProfileSafe(data: unknown): ValidationResult<CustomerProfileSafe> {
  return safeValidate(CustomerProfileSafeSchema, data);
}

export function validateAddressRecord(data: unknown): ValidationResult<AddressRecord> {
  return safeValidate(AddressRecordSchema, data);
}

export function validateCartLineItem(data: unknown): ValidationResult<CartLineItem> {
  return safeValidate(CartLineItemSchema, data);
}

export function validateCartSession(data: unknown): ValidationResult<CartSession> {
  return safeValidate(CartSessionSchema, data);
}

export function validateShippingRateCalculation(data: unknown): ValidationResult<ShippingRateCalculation> {
  return safeValidate(ShippingRateCalculationSchema, data);
}

export function validateOrderTransaction(data: unknown): ValidationResult<OrderTransaction> {
  return safeValidate(OrderTransactionSchema, data);
}

export function validateVerificationCodeRecord(data: unknown): ValidationResult<VerificationCodeRecord> {
  return safeValidate(VerificationCodeRecordSchema, data);
}

export function validateRegisterRequest(data: unknown): ValidationResult<ApiRegisterRequest> {
  return safeValidate(ApiRegisterRequestSchema, data);
}

export function validateLoginRequest(data: unknown): ValidationResult<ApiLoginRequest> {
  return safeValidate(ApiLoginRequestSchema, data);
}

export function validateVerifyCodeRequest(data: unknown): ValidationResult<ApiVerifyCodeRequest> {
  return safeValidate(ApiVerifyCodeRequestSchema, data);
}

export function validateSendCodeRequest(data: unknown): ValidationResult<ApiSendCodeRequest> {
  return safeValidate(ApiSendCodeRequestSchema, data);
}

export function validateOAuthRequest(data: unknown): ValidationResult<ApiOAuthRequest> {
  return safeValidate(ApiOAuthRequestSchema, data);
}

export function validateCreatePreferenceRequest(data: unknown): ValidationResult<ApiCreatePreferenceRequest> {
  return safeValidate(ApiCreatePreferenceRequestSchema, data);
}

export function validateWebhookPayload(data: unknown): ValidationResult<ApiMercadoPagoWebhook> {
  return safeValidate(ApiMercadoPagoWebhookSchema, data);
}

export function validateAdminPatchOrderRequest(data: unknown): ValidationResult<ApiAdminPatchOrderRequest> {
  return safeValidate(ApiAdminPatchOrderRequestSchema, data);
}
