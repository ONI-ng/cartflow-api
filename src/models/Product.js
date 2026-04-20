const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide product name'],
      trim: true,
      unique: true,
    },
    description: {
      type: String,
      required: [true, 'Please provide product description'],
    },
    price: {
      type: Number,
      required: [true, 'Please provide product price'],
      min: [0, 'Price cannot be negative'],
    },
    category: {
      type: String,
      required: [true, 'Please provide product category'],
      enum: [
        'Electronics',
        'Fashion',
        'Home & Garden',
        'Sports',
        'Books',
        'Beauty',
        'Food',
        'Toys',
        'Other',
      ],
    },
    stock: {
      type: Number,
      required: [true, 'Please provide stock quantity'],
      min: [0, 'Stock cannot be negative'],
    },
    images: {
      type: [String],
      default: [],
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    numReviews: {
      type: Number,
      default: 0,
    },
    sku: {
      type: String,
      unique: true,
      sparse: true,
    },
    tags: [String],
    discount: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    discountedPrice: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    vendor: {
      name: String,
      email: String,
    },
    salesCount: {
      type: Number,
      default: 0,
      index: true,
    },
  },
  { timestamps: true }
);

// Text index for search
productSchema.index({ name: 'text', description: 'text', tags: 'text' });
// Index for filtering and sorting
productSchema.index({ category: 1, price: 1 });
productSchema.index({ price: 1 });
productSchema.index({ createdAt: -1 });
productSchema.index({ rating: -1 });
productSchema.index({ isActive: 1, stock: 1 });

// Middleware to calculate discounted price
productSchema.pre('save', function (next) {
  if (this.discount > 0) {
    this.discountedPrice = this.price - (this.price * this.discount) / 100;
  } else {
    this.discountedPrice = this.price;
  }
  next();
});

module.exports = mongoose.model('Product', productSchema);
