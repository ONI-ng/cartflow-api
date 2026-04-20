const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  addedAt: {
    type: Date,
    default: Date.now,
  },
});

const cartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    items: [cartItemSchema],
    subtotal: {
      type: Number,
      default: 0,
    },
    tax: {
      type: Number,
      default: 0,
    },
    shippingCost: {
      type: Number,
      default: 0,
    },
    total: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Method to calculate totals
cartSchema.methods.calculateTotals = function () {
  this.subtotal = 0;
  this.items.forEach((item) => {
    // Note: In real scenario, fetch product price from Product model
    this.subtotal += item.quantity * (item.price || 0);
  });
  this.tax = this.subtotal * 0.075; // 7.5% tax
  this.shippingCost = this.subtotal > 5000 ? 0 : 500; // Free shipping over 5000
  this.total = this.subtotal + this.tax + this.shippingCost;
};

module.exports = mongoose.model('Cart', cartSchema);
