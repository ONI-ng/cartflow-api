const Cart = require('../models/Cart');
const Product = require('../models/Product');
const { APIError } = require('../middleware/errorHandler');

class CartService {
  async getOrCreateCart(userId) {
    let cart = await Cart.findOne({ user: userId }).populate('items.product');

    if (!cart) {
      cart = new Cart({ user: userId });
      await cart.save();
    }

    // Populate product details
    cart = await Cart.findOne({ user: userId }).populate('items.product');

    return cart;
  }

  async addToCart(userId, productId, quantity) {
    // Validate product exists and has stock
    const product = await Product.findById(productId);

    if (!product) {
      throw new APIError('Product not found', 404);
    }

    if (product.stock < quantity) {
      throw new APIError('Insufficient stock', 400);
    }

    let cart = await Cart.findOne({ user: userId });

    if (!cart) {
      cart = new Cart({ user: userId });
    }

    // Check if product already in cart
    const existingItem = cart.items.find(
      (item) => item.product.toString() === productId
    );

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.items.push({
        product: productId,
        quantity,
      });
    }

    // Calculate totals
    await this.calculateCartTotals(cart);
    await cart.save();

    return this.getOrCreateCart(userId);
  }

  async updateCartItem(userId, productId, quantity) {
    if (quantity <= 0) {
      return this.removeFromCart(userId, productId);
    }

    const product = await Product.findById(productId);

    if (!product) {
      throw new APIError('Product not found', 404);
    }

    if (product.stock < quantity) {
      throw new APIError('Insufficient stock', 400);
    }

    const cart = await Cart.findOne({ user: userId });

    if (!cart) {
      throw new APIError('Cart not found', 404);
    }

    const item = cart.items.find((item) => item.product.toString() === productId);

    if (!item) {
      throw new APIError('Product not in cart', 404);
    }

    item.quantity = quantity;

    await this.calculateCartTotals(cart);
    await cart.save();

    return this.getOrCreateCart(userId);
  }

  async removeFromCart(userId, productId) {
    const cart = await Cart.findOne({ user: userId });

    if (!cart) {
      throw new APIError('Cart not found', 404);
    }

    cart.items = cart.items.filter(
      (item) => item.product.toString() !== productId
    );

    await this.calculateCartTotals(cart);
    await cart.save();

    return this.getOrCreateCart(userId);
  }

  async clearCart(userId) {
    const cart = await Cart.findOne({ user: userId });

    if (!cart) {
      throw new APIError('Cart not found', 404);
    }

    cart.items = [];
    cart.subtotal = 0;
    cart.tax = 0;
    cart.shippingCost = 0;
    cart.total = 0;

    await cart.save();

    return cart;
  }

  async calculateCartTotals(cart) {
    if (!cart.items || cart.items.length === 0) {
      cart.subtotal = 0;
      cart.tax = 0;
      cart.shippingCost = 0;
      cart.total = 0;
      return;
    }

    let subtotal = 0;

    // Calculate subtotal
    for (const item of cart.items) {
      // Need to fetch product to get current price
      const product = await Product.findById(item.product);
      if (product) {
        subtotal += product.discountedPrice * item.quantity;
      }
    }

    const tax = subtotal * 0.075; // 7.5% tax
    const shippingCost = subtotal > 5000 ? 0 : 500; // Free shipping over 5000

    cart.subtotal = subtotal;
    cart.tax = tax;
    cart.shippingCost = shippingCost;
    cart.total = subtotal + tax + shippingCost;
  }

  async getCartSummary(userId) {
    const cart = await this.getOrCreateCart(userId);

    return {
      items: cart.items,
      itemCount: cart.items.length,
      subtotal: cart.subtotal,
      tax: cart.tax,
      shippingCost: cart.shippingCost,
      total: cart.total,
    };
  }

  async applyPromoCode(userId, promoCode) {
    // This is a basic example - implement based on your promo system
    const cart = await Cart.findOne({ user: userId });

    if (!cart) {
      throw new APIError('Cart not found', 404);
    }

    // Example promo codes
    const promos = {
      SAVE10: 0.1, // 10% off
      SAVE20: 0.2, // 20% off
      FREESHIP: 0, // Free shipping
    };

    if (!promos[promoCode]) {
      throw new APIError('Invalid promo code', 400);
    }

    const discount = cart.subtotal * promos[promoCode];

    return {
      promoCode,
      discount,
      subtotal: cart.subtotal,
      newTotal: cart.total - discount,
    };
  }
}

module.exports = new CartService();
