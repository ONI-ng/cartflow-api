const {
  initializePayment,
  verifyPayment,
  getTransactionDetails,
  createRefund,
} = require('../config/paystack');
const OrderService = require('../services/OrderService');
const Order = require('../models/Order');
const { asyncHandler, APIError } = require('../middleware/errorHandler');

class PaymentController {
  initializePayment = asyncHandler(async (req, res) => {
    const { orderId, email } = req.body;

    const order = await Order.findById(orderId);

    if (!order) {
      throw new APIError('Order not found', 404);
    }

    if (order.user.toString() !== req.user._id.toString()) {
      throw new APIError('Unauthorized', 403);
    }

    const result = await initializePayment(email, order.totalPrice, {
      orderId: order._id,
      orderNumber: order.orderNumber,
    });

    if (!result.success) {
      throw new APIError(result.error, 400);
    }

    res.json({
      success: true,
      message: 'Payment initialized',
      data: {
        authorizationUrl: result.authorizationUrl,
        accessCode: result.accessCode,
        reference: result.reference,
      },
    });
  });

  verifyPaymentWebhook = asyncHandler(async (req, res) => {
    const { reference } = req.body;

    const result = await verifyPayment(reference);

    if (!result.success) {
      throw new APIError('Payment verification failed', 400);
    }

    // Find order by reference
    const order = await Order.findOne({ paymentReference: reference });

    if (order) {
      await OrderService.confirmPayment(
        order._id,
        reference,
        result.status === 'success' ? 'completed' : 'failed'
      );
    }

    res.json({
      success: true,
      message: 'Payment verified',
      data: result,
    });
  });

  getTransactionStatus = asyncHandler(async (req, res) => {
    const { reference } = req.params;

    const result = await getTransactionDetails(reference);

    if (!result.success) {
      throw new APIError(result.error, 400);
    }

    res.json({
      success: true,
      data: result.data,
    });
  });

  refundPayment = asyncHandler(async (req, res) => {
    const { orderId, amount } = req.body;

    const order = await Order.findById(orderId);

    if (!order) {
      throw new APIError('Order not found', 404);
    }

    if (order.user.toString() !== req.user._id.toString()) {
      throw new APIError('Unauthorized', 403);
    }

    if (!order.paymentReference) {
      throw new APIError('Order has no payment reference', 400);
    }

    const refundAmount = amount || order.totalPrice;

    const result = await createRefund(order.paymentReference, refundAmount);

    if (!result.success) {
      throw new APIError(result.error, 400);
    }

    // Update order status
    order.paymentStatus = 'refunded';
    order.status = 'cancelled';
    await order.save();

    res.json({
      success: true,
      message: 'Refund initiated',
      data: {
        refundReference: result.reference,
        status: result.refundStatus,
        amount: refundAmount,
      },
    });
  });
}

module.exports = new PaymentController();
