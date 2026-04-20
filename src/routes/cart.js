const express = require('express');
const CartController = require('../controllers/CartController');
const { authenticate } = require('../middleware/auth');
const { validate, validationSchemas } = require('../middleware/validation');

const router = express.Router();

// All cart routes require authentication
router.use(authenticate);

router.get('/', CartController.getCart);

router.post(
  '/add',
  validate(validationSchemas.addToCart),
  CartController.addToCart
);

router.put(
  '/item/:productId',
  CartController.updateCartItem
);

router.delete('/item/:productId', CartController.removeFromCart);

router.delete('/', CartController.clearCart);

router.get('/summary', CartController.getCartSummary);

router.post('/apply-promo', CartController.applyPromoCode);

module.exports = router;
