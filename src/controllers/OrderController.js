const OrderService = require('../services/OrderService');
const { asyncHandler } = require('../middleware/errorHandler');

class OrderController {
  checkout = asyncHandler(async (req, res) => {
    const { shippingAddress, paymentMethod } = req.body;

    const order = await OrderService.createOrderFromCart(
      req.user._id,
      shippingAddress,
      paymentMethod
    );

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: order,
    });
  });

  confirmPayment = asyncHandler(async (req, res) => {
    const { orderId, paymentReference, paymentStatus } = req.body;

    const order = await OrderService.confirmPayment(
      orderId,
      paymentReference,
      paymentStatus
    );

    res.json({
      success: true,
      message: 'Payment confirmed',
      data: order,
    });
  });

  getOrderById = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const order = await OrderService.getOrderById(id, req.user._id);

    res.json({
      success: true,
      data: order,
    });
  });

  getUserOrders = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const result = await OrderService.getUserOrders(req.user._id, page, limit);

    res.json({
      success: true,
      data: result,
    });
  });

  getAllOrders = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const filters = {
      status: req.query.status,
      paymentStatus: req.query.paymentStatus,
    };

    const result = await OrderService.getAllOrders(page, limit, filters);

    res.json({
      success: true,
      data: result,
    });
  });

  updateOrderStatus = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { status, trackingNumber } = req.body;

    const order = await OrderService.updateOrderStatus(id, status, trackingNumber);

    res.json({
      success: true,
      message: 'Order status updated',
      data: order,
    });
  });

  getSalesAnalytics = asyncHandler(async (req, res) => {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'startDate and endDate are required',
      });
    }

    const analytics = await OrderService.getSalesAnalytics(startDate, endDate);

    res.json({
      success: true,
      data: analytics,
    });
  });
}

module.exports = new OrderController();
