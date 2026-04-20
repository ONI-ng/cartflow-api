const crypto = require('crypto');

/**
 * Generate a random token
 * @param {number} length - Token length in bytes (default: 32)
 * @returns {string} - Hex encoded token
 */
const generateToken = (length = 32) => {
  return crypto.randomBytes(length).toString('hex');
};

/**
 * Generate order number
 * @returns {string} - Unique order number
 */
const generateOrderNumber = () => {
  return `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Format currency (Naira)
 * @param {number} amount - Amount in Naira
 * @returns {string} - Formatted currency string
 */
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
  }).format(amount);
};

/**
 * Calculate discount amount
 * @param {number} price - Original price
 * @param {number} discountPercent - Discount percentage
 * @returns {number} - Discount amount
 */
const calculateDiscount = (price, discountPercent) => {
  return (price * discountPercent) / 100;
};

/**
 * Calculate final price after discount
 * @param {number} price - Original price
 * @param {number} discountPercent - Discount percentage
 * @returns {number} - Final price
 */
const calculateFinalPrice = (price, discountPercent = 0) => {
  return price - calculateDiscount(price, discountPercent);
};

/**
 * Validate MongoDB ObjectId
 * @param {string} id - ObjectId string
 * @returns {boolean} - True if valid
 */
const isValidObjectId = (id) => {
  return /^[0-9a-fA-F]{24}$/.test(id);
};

/**
 * Get pagination params
 * @param {number} page - Current page
 * @param {number} limit - Items per page
 * @returns {object} - Skip and limit values
 */
const getPaginationParams = (page = 1, limit = 10) => {
  const pageNum = Math.max(1, parseInt(page));
  const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
  const skip = (pageNum - 1) * limitNum;

  return { skip, limit: limitNum, page: pageNum };
};

/**
 * Calculate shipping cost
 * @param {number} subtotal - Order subtotal
 * @param {number} threshold - Free shipping threshold
 * @param {number} standardCost - Standard shipping cost
 * @returns {number} - Shipping cost
 */
const calculateShippingCost = (subtotal, threshold = 5000, standardCost = 500) => {
  return subtotal >= threshold ? 0 : standardCost;
};

/**
 * Calculate tax
 * @param {number} amount - Amount to calculate tax on
 * @param {number} taxRate - Tax rate (e.g., 0.075 for 7.5%)
 * @returns {number} - Tax amount
 */
const calculateTax = (amount, taxRate = 0.075) => {
  return amount * taxRate;
};

/**
 * Send error response
 * @param {object} res - Express response object
 * @param {number} statusCode - HTTP status code
 * @param {string} message - Error message
 * @param {object} errors - Additional error details (optional)
 */
const sendErrorResponse = (res, statusCode, message, errors = null) => {
  res.status(statusCode).json({
    success: false,
    message,
    ...(errors && { errors }),
  });
};

/**
 * Send success response
 * @param {object} res - Express response object
 * @param {number} statusCode - HTTP status code
 * @param {string} message - Success message
 * @param {object} data - Response data
 */
const sendSuccessResponse = (res, statusCode = 200, message = 'Success', data = null) => {
  res.status(statusCode).json({
    success: true,
    message,
    ...(data && { data }),
  });
};

/**
 * Mask email for privacy
 * @param {string} email - Email address
 * @returns {string} - Masked email
 */
const maskEmail = (email) => {
  const [localPart, domain] = email.split('@');
  const maskedLocal = localPart.charAt(0) + '*'.repeat(localPart.length - 2) + localPart.charAt(localPart.length - 1);
  return `${maskedLocal}@${domain}`;
};

/**
 * Sanitize user input
 * @param {string} input - User input
 * @returns {string} - Sanitized input
 */
const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  return input.trim().substring(0, 1000);
};

/**
 * Check if email is valid
 * @param {string} email - Email to validate
 * @returns {boolean} - True if valid
 */
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Parse filters for query
 * @param {object} filters - Filter object
 * @returns {object} - Parsed filters for MongoDB query
 */
const parseFilters = (filters) => {
  const query = {};

  if (filters.category) query.category = filters.category;
  if (filters.minPrice !== undefined) {
    query.price = { ...query.price, $gte: filters.minPrice };
  }
  if (filters.maxPrice !== undefined) {
    query.price = { ...query.price, $lte: filters.maxPrice };
  }
  if (filters.inStock) query.stock = { $gt: 0 };
  if (filters.isActive !== undefined) query.isActive = filters.isActive;

  return query;
};

module.exports = {
  generateToken,
  generateOrderNumber,
  formatCurrency,
  calculateDiscount,
  calculateFinalPrice,
  isValidObjectId,
  getPaginationParams,
  calculateShippingCost,
  calculateTax,
  sendErrorResponse,
  sendSuccessResponse,
  maskEmail,
  sanitizeInput,
  isValidEmail,
  parseFilters,
};
