const express = require('express');
const PaymentController = require('../controllers/PaymentController');
const { authenticate } = require('../middleware/auth');
const { paymentLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

// Initialize payment (requires auth)
router.post(
  '/initialize',
  authenticate,
  paymentLimiter,
  PaymentController.initializePayment
);

// Verify payment webhook (public - Paystack will call this)
router.post('/webhook/verify', PaymentController.verifyPaymentWebhook);

// Get transaction status (requires auth)
router.get(
  '/status/:reference',
  authenticate,
  PaymentController.getTransactionStatus
);

// Refund payment (requires auth)
router.post(
  '/refund',
  authenticate,
  paymentLimiter,
  PaymentController.refundPayment
);

module.exports = router;
