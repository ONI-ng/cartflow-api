// Pagination constants
const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
};

// Order statuses
const ORDER_STATUS = {
  PENDING: 'pending',
  PAID: 'paid',
  PROCESSING: 'processing',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
};

// Payment statuses
const PAYMENT_STATUS = {
  PENDING: 'pending',
  COMPLETED: 'completed',
  FAILED: 'failed',
  REFUNDED: 'refunded',
};

// Payment methods
const PAYMENT_METHOD = {
  PAYSTACK: 'paystack',
  CREDIT_CARD: 'credit_card',
  BANK_TRANSFER: 'bank_transfer',
  WALLET: 'wallet',
};

// User roles
const USER_ROLE = {
  USER: 'user',
  ADMIN: 'admin',
};

// Product categories
const PRODUCT_CATEGORY = {
  ELECTRONICS: 'Electronics',
  FASHION: 'Fashion',
  HOME_GARDEN: 'Home & Garden',
  SPORTS: 'Sports',
  BOOKS: 'Books',
  BEAUTY: 'Beauty',
  FOOD: 'Food',
  TOYS: 'Toys',
  OTHER: 'Other',
};

// Tax rate (7.5%)
const TAX_RATE = 0.075;

// Free shipping threshold
const FREE_SHIPPING_THRESHOLD = 5000;
const STANDARD_SHIPPING_COST = 500;

// Cache expiry times (in seconds)
const CACHE_EXPIRY = {
  PRODUCT: 3600, // 1 hour
  PRODUCT_LIST: 1800, // 30 minutes
  ANALYTICS: 3600, // 1 hour
  USER_CART: 3600, // 1 hour
};

module.exports = {
  PAGINATION,
  ORDER_STATUS,
  PAYMENT_STATUS,
  PAYMENT_METHOD,
  USER_ROLE,
  PRODUCT_CATEGORY,
  TAX_RATE,
  FREE_SHIPPING_THRESHOLD,
  STANDARD_SHIPPING_COST,
  CACHE_EXPIRY,
};
