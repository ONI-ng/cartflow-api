const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [1, 'Quantity must be at least 1'],
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
  },
  discount: {
    type: Number,
    default: 0,
  },
});

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      unique: true,
      required: true,
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    items: [orderItemSchema],
    shippingAddress: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: String,
      zipCode: { type: String, required: true },
      country: { type: String, required: true },
    },
    subtotal: {
      type: Number,
      required: true,
    },
    shippingCost: {
      type: Number,
      default: 0,
    },
    tax: {
      type: Number,
      default: 0,
    },
    totalPrice: {
      type: Number,
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled'],
      default: 'pending',
      index: true,
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded'],
      default: 'pending',
    },
    paymentMethod: {
      type: String,
      enum: ['paystack', 'credit_card', 'bank_transfer', 'wallet'],
      required: true,
    },
    paymentReference: {
      type: String,
      unique: true,
      sparse: true,
    },
    notes: String,
    trackingNumber: String,
    estimatedDelivery: Date,
  },
  { timestamps: true }
);

// Index for common queries
orderSchema.index({ createdAt: -1 });
orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ status: 1 });
orderSchema.index({ paymentStatus: 1 });

// Middleware to generate order number
orderSchema.pre('save', async function (next) {
  if (!this.isNew) return next();

  // Generate unique order number: ORD-TIMESTAMP-RANDOM
  this.orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  next();
});

module.exports = mongoose.model('Order', orderSchema);
