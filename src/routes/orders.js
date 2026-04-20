const express = require('express');
const OrderController = require('../controllers/OrderController');
const { authenticate, authorize } = require('../middleware/auth');
const { validate, validationSchemas } = require('../middleware/validation');

const router = express.Router();

// All order routes require authentication
router.use(authenticate);

// User routes
router.post(
  '/checkout',
  validate(validationSchemas.checkout),
  OrderController.checkout
);

router.get('/my-orders', OrderController.getUserOrders);

router.get('/:id', OrderController.getOrderById);

router.post('/confirm-payment', OrderController.confirmPayment);

// Admin routes
router.get(
  '/',
  authorize('admin'),
  OrderController.getAllOrders
);

router.put(
  '/:id/status',
  authorize('admin'),
  OrderController.updateOrderStatus
);

router.get(
  '/analytics/sales',
  authorize('admin'),
  OrderController.getSalesAnalytics
);

module.exports = router;
