const CartService = require('../services/CartService');
const { asyncHandler } = require('../middleware/errorHandler');

class CartController {
  getCart = asyncHandler(async (req, res) => {
    const cart = await CartService.getOrCreateCart(req.user._id);

    res.json({
      success: true,
      data: cart,
    });
  });

  addToCart = asyncHandler(async (req, res) => {
    const { productId, quantity } = req.body;

    const cart = await CartService.addToCart(req.user._id, productId, quantity);

    res.status(201).json({
      success: true,
      message: 'Product added to cart',
      data: cart,
    });
  });

  updateCartItem = asyncHandler(async (req, res) => {
    const { productId } = req.params;
    const { quantity } = req.body;

    const cart = await CartService.updateCartItem(req.user._id, productId, quantity);

    res.json({
      success: true,
      message: 'Cart item updated',
      data: cart,
    });
  });

  removeFromCart = asyncHandler(async (req, res) => {
    const { productId } = req.params;

    const cart = await CartService.removeFromCart(req.user._id, productId);

    res.json({
      success: true,
      message: 'Product removed from cart',
      data: cart,
    });
  });

  clearCart = asyncHandler(async (req, res) => {
    const cart = await CartService.clearCart(req.user._id);

    res.json({
      success: true,
      message: 'Cart cleared',
      data: cart,
    });
  });

  getCartSummary = asyncHandler(async (req, res) => {
    const summary = await CartService.getCartSummary(req.user._id);

    res.json({
      success: true,
      data: summary,
    });
  });

  applyPromoCode = asyncHandler(async (req, res) => {
    const { promoCode } = req.body;

    const result = await CartService.applyPromoCode(req.user._id, promoCode);

    res.json({
      success: true,
      data: result,
    });
  });
}

module.exports = new CartController();
