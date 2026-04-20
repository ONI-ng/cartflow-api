const ProductService = require('../services/ProductService');
const { asyncHandler } = require('../middleware/errorHandler');

class ProductController {
  createProduct = asyncHandler(async (req, res) => {
    const product = await ProductService.createProduct(req.body);

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: product,
    });
  });

  updateProduct = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const product = await ProductService.updateProduct(id, req.body);

    res.json({
      success: true,
      message: 'Product updated successfully',
      data: product,
    });
  });

  deleteProduct = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const result = await ProductService.deleteProduct(id);

    res.json({
      success: true,
      message: result.message,
    });
  });

  getProductById = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const product = await ProductService.getProductById(id);

    res.json({
      success: true,
      data: product,
    });
  });

  listProducts = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const filters = {
      category: req.query.category,
      minPrice: req.query.minPrice ? parseFloat(req.query.minPrice) : null,
      maxPrice: req.query.maxPrice ? parseFloat(req.query.maxPrice) : null,
      inStock: req.query.inStock === 'true',
    };

    const result = await ProductService.listProducts(page, limit, filters);

    res.json({
      success: true,
      data: result,
    });
  });

  searchProducts = asyncHandler(async (req, res) => {
    const { q } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    if (!q || q.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required',
      });
    }

    const result = await ProductService.searchProducts(q, page, limit);

    res.json({
      success: true,
      data: result,
    });
  });

  getByCategory = asyncHandler(async (req, res) => {
    const { category } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const result = await ProductService.getProductsByCategory(category, page, limit);

    res.json({
      success: true,
      data: result,
    });
  });

  getTopSelling = asyncHandler(async (req, res) => {
    const limit = parseInt(req.query.limit) || 10;

    const products = await ProductService.getTopSellingProducts(limit);

    res.json({
      success: true,
      data: products,
    });
  });

  getAnalytics = asyncHandler(async (req, res) => {
    const analytics = await ProductService.getAnalytics();

    res.json({
      success: true,
      data: analytics,
    });
  });
}

module.exports = new ProductController();
