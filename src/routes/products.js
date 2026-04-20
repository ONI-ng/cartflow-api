const express = require('express');
const ProductController = require('../controllers/ProductController');
const { authenticate, authorize } = require('../middleware/auth');
const { validate, validationSchemas } = require('../middleware/validation');
const { apiLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

// Public routes
router.get('/list', apiLimiter, ProductController.listProducts);

router.get('/search', apiLimiter, ProductController.searchProducts);

router.get('/category/:category', apiLimiter, ProductController.getByCategory);

router.get('/top-selling', apiLimiter, ProductController.getTopSelling);

router.get('/:id', apiLimiter, ProductController.getProductById);

// Admin routes
router.post(
  '/create',
  authenticate,
  authorize('admin'),
  validate(validationSchemas.createProduct),
  ProductController.createProduct
);

router.put(
  '/:id',
  authenticate,
  authorize('admin'),
  validate(validationSchemas.updateProduct),
  ProductController.updateProduct
);

router.delete(
  '/:id',
  authenticate,
  authorize('admin'),
  ProductController.deleteProduct
);

// Analytics
router.get(
  '/analytics/overview',
  authenticate,
  authorize('admin'),
  ProductController.getAnalytics
);

module.exports = router;
