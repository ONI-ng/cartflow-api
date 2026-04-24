const Product = require('../models/Product');
const { APIError } = require('../middleware/errorHandler');
const { cacheGet, cacheSet, cacheClear } = require('../config/redis');

class ProductService {
  async createProduct(productData) {
    const product = new Product(productData);
    await product.save();

    // Clear products cache
    await cacheClear('products:*');

    return product;
  }

  async updateProduct(productId, updateData) {
    const product = await Product.findByIdAndUpdate(productId, updateData, {
      new: true,
      runValidators: true,
    });

    if (!product) {
      throw new APIError('Product not found', 404);
    }

    // Clear cache
    await cacheClear('products:*');

    return product;
  }

  async deleteProduct(productId) {
    const product = await Product.findByIdAndDelete(productId);

    if (!product) {
      throw new APIError('Product not found', 404);
    }

    await cacheClear('products:*');

    return { message: 'Product deleted successfully' };
  }

  async getProductById(productId) {
    // Try cache first
    const cacheKey = `product:${productId}`;
    let product = await cacheGet(cacheKey);

    if (!product) {
      product = await Product.findById(productId);

      if (!product) {
        throw new APIError('Product not found', 404);
      }

      // Cache for 1 hour
      await cacheSet(cacheKey, product, 3600);
    }

    return product;
  }

  async listProducts(page = 1, limit = 10, filters = {}) {
    const cacheKey = `products:list:${page}:${limit}:${JSON.stringify(filters)}`;

    // Try cache
    let cached = await cacheGet(cacheKey);
    if (cached) return cached;

    const skip = (page - 1) * limit;
    const query = { isActive: true };

    // Apply filters
    if (filters.category) query.category = filters.category;
    if (filters.minPrice || filters.maxPrice) {
      query.price = {};
      if (filters.minPrice) query.price.$gte = filters.minPrice;
      if (filters.maxPrice) query.price.$lte = filters.maxPrice;
    }
    if (filters.inStock) query.stock = { $gt: 0 };

    const [products, total] = await Promise.all([
      Product.find(query)
        .limit(limit)
        .skip(skip)
        .sort({ createdAt: -1 }),
      Product.countDocuments(query),
    ]);

    const result = {
      products,
      pagination: {
        current: page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };

    // Cache for 30 minutes
    await cacheSet(cacheKey, result, 1800);

    return result;
  }

  async searchProducts(searchTerm, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    // Use MongoDB text search
    const [products, total] = await Promise.all([
      Product.find(
        { $text: { $search: searchTerm }, isActive: true },
        { score: { $meta: 'textScore' } }
      )
        .sort({ score: { $meta: 'textScore' } })
        .limit(limit)
        .skip(skip),
      Product.countDocuments({
        $text: { $search: searchTerm },
        isActive: true,
      }),
    ]);

    return {
      products,
      pagination: {
        current: page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async getTopSellingProducts(limit = 10) {
    const cacheKey = `products:top-selling:${limit}`;

    let cached = await cacheGet(cacheKey);
    if (cached) return cached;

    const result = await Product.aggregate([
      { $match: { isActive: true } },
      { $sort: { salesCount: -1 } },
      { $limit: limit },
      {
        $project: {
          _id: 1,
          name: 1,
          price: 1,
          salesCount: 1,
          category: 1,
          rating: 1,
        },
      },
    ]);

    await cacheSet(cacheKey, result, 1800);

    return result;
  }

  async getProductsByCategory(category, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
      Product.find({ category, isActive: true })
        .limit(limit)
        .skip(skip)
        .sort({ createdAt: -1 }),
      Product.countDocuments({ category, isActive: true }),
    ]);

    return {
      category,
      products,
      pagination: {
        current: page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async reduceStock(productId, quantity) {
    const product = await Product.findByIdAndUpdate(
      productId,
      { $inc: { stock: -quantity } },
      { new: true }
    );

    if (!product) {
      throw new APIError('Product not found', 404);
    }

    if (product.stock < 0) {
      throw new APIError('Insufficient stock', 400);
    }

    // Increment sales count
    await Product.findByIdAndUpdate(
      productId,
      { $inc: { salesCount: quantity } },
      { new: true }
    );

    return product;
  }

  async getAnalytics() {
    const cacheKey = 'products:analytics';

    let cached = await cacheGet(cacheKey);
    if (cached) return cached;

    const analytics = await Product.aggregate([
      {
        $facet: {
          totalProducts: [{ $count: 'count' }],
          totalInventory: [{ $group: { _id: null, total: { $sum: '$stock' } } }],
          averagePrice: [{ $group: { _id: null, avg: { $avg: '$price' } } }],
          byCategory: [
            { $group: { _id: '$category', count: { $sum: 1 }, avgPrice: { $avg: '$price' } } },
            { $sort: { count: -1 } },
          ],
          topProducts: [
            { $sort: { salesCount: -1 } },
            { $limit: 5 },
            { $project: { name: 1, salesCount: 1, price: 1 } },
          ],
        },
      },
    ]);

    const result = {
      totalProducts: analytics[0].totalProducts[0]?.count || 0,
      totalInventory: analytics[0].totalInventory[0]?.total || 0,
      averagePrice: analytics[0].averagePrice[0]?.avg || 0,
      byCategory: analytics[0].byCategory,
      topProducts: analytics[0].topProducts,
    };

    // Cache for 1 hour
    await cacheSet(cacheKey, result, 3600);

    return result;
  }
}

module.exports = new ProductService();
