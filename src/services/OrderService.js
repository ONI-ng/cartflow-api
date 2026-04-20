const Order = require('../models/Order');
const Product = require('../models/Product');
const Cart = require('../models/Cart');
const User = require('../models/User');
const { APIError } = require('../middleware/errorHandler');
const { sendEmail } = require('../config/email');
const { cacheGet, cacheSet } = require('../config/redis');

class OrderService {
  async createOrderFromCart(userId, shippingAddress, paymentMethod) {
    // Get user's cart
    const cart = await Cart.findOne({ user: userId }).populate(
      'items.product'
    );

    if (!cart || cart.items.length === 0) {
      throw new APIError('Cart is empty', 400);
    }

    // Validate stock
    for (const item of cart.items) {
      if (item.product.stock < item.quantity) {
        throw new APIError(
          `Insufficient stock for ${item.product.name}`,
          400
        );
      }
    }

    // Calculate totals
    let subtotal = 0;
    const orderItems = [];

    for (const item of cart.items) {
      const itemTotal = item.product.discountedPrice * item.quantity;
      subtotal += itemTotal;

      orderItems.push({
        product: item.product._id,
        quantity: item.quantity,
        price: item.product.discountedPrice,
        discount: item.product.discount,
      });
    }

    const tax = subtotal * 0.075; // 7.5% tax
    const shippingCost = subtotal > 5000 ? 0 : 500;
    const totalPrice = subtotal + tax + shippingCost;

    // Create order
    const order = new Order({
      user: userId,
      items: orderItems,
      shippingAddress,
      subtotal,
      tax,
      shippingCost,
      totalPrice,
      paymentMethod,
      status: 'pending',
      paymentStatus: 'pending',
    });

    await order.save();

    // Don't reduce stock yet - wait for payment confirmation
    // Stock will be reduced in confirmPayment

    // Send order confirmation email
    await this.sendOrderEmail(userId, order, 'pending');

    return order;
  }

  async confirmPayment(orderId, paymentReference, paymentStatus) {
    const order = await Order.findById(orderId);

    if (!order) {
      throw new APIError('Order not found', 404);
    }

    if (paymentStatus === 'completed') {
      // Reduce stock for all items
      for (const item of order.items) {
        await Product.findByIdAndUpdate(
          item.product,
          { $inc: { stock: -item.quantity, salesCount: item.quantity } },
          { new: true }
        );
      }

      order.paymentStatus = 'completed';
      order.paymentReference = paymentReference;
      order.status = 'paid';

      // Update user stats
      await User.findByIdAndUpdate(
        order.user,
        {
          $inc: {
            totalOrders: 1,
            totalSpent: order.totalPrice,
          },
        }
      );

      // Clear user's cart
      await Cart.updateOne({ user: order.user }, { items: [] });

      await order.save();

      // Send payment confirmation email
      await this.sendOrderEmail(order.user, order, 'paid');
    } else {
      order.paymentStatus = 'failed';
      await order.save();

      await this.sendOrderEmail(order.user, order, 'failed');
    }

    return order;
  }

  async getOrderById(orderId, userId = null) {
    const order = await Order.findById(orderId)
      .populate('user', 'name email')
      .populate('items.product', 'name price images');

    if (!order) {
      throw new APIError('Order not found', 404);
    }

    // Check authorization
    if (userId && order.user._id.toString() !== userId.toString()) {
      throw new APIError('Unauthorized', 403);
    }

    return order;
  }

  async getUserOrders(userId, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      Order.find({ user: userId })
        .populate('items.product', 'name price images')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Order.countDocuments({ user: userId }),
    ]);

    return {
      orders,
      pagination: {
        current: page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async getAllOrders(page = 1, limit = 10, filters = {}) {
    const skip = (page - 1) * limit;
    const query = {};

    if (filters.status) query.status = filters.status;
    if (filters.paymentStatus) query.paymentStatus = filters.paymentStatus;

    const [orders, total] = await Promise.all([
      Order.find(query)
        .populate('user', 'name email')
        .populate('items.product', 'name price')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Order.countDocuments(query),
    ]);

    return {
      orders,
      pagination: {
        current: page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async updateOrderStatus(orderId, status, trackingNumber = null) {
    const validStatuses = ['pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled'];

    if (!validStatuses.includes(status)) {
      throw new APIError('Invalid status', 400);
    }

    const updateData = { status };
    if (trackingNumber) updateData.trackingNumber = trackingNumber;
    if (status === 'shipped') {
      updateData.estimatedDelivery = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    }

    const order = await Order.findByIdAndUpdate(orderId, updateData, {
      new: true,
    });

    if (!order) {
      throw new APIError('Order not found', 404);
    }

    // Send status update email
    await this.sendOrderStatusEmail(order.user, order, status);

    return order;
  }

  async getSalesAnalytics(startDate, endDate) {
    const cacheKey = `analytics:sales:${startDate}:${endDate}`;

    let cached = await cacheGet(cacheKey);
    if (cached) return cached;

    const analytics = await Order.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(startDate),
            $lte: new Date(endDate),
          },
          paymentStatus: 'completed',
        },
      },
      {
        $facet: {
          totalRevenue: [
            {
              $group: {
                _id: null,
                total: { $sum: '$totalPrice' },
                count: { $sum: 1 },
              },
            },
          ],
          byStatus: [
            {
              $group: {
                _id: '$status',
                count: { $sum: 1 },
                revenue: { $sum: '$totalPrice' },
              },
            },
          ],
          byDate: [
            {
              $group: {
                _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                revenue: { $sum: '$totalPrice' },
                orders: { $sum: 1 },
              },
            },
            { $sort: { _id: 1 } },
          ],
          topProducts: [
            { $unwind: '$items' },
            {
              $group: {
                _id: '$items.product',
                revenue: { $sum: { $multiply: ['$items.quantity', '$items.price'] } },
                units: { $sum: '$items.quantity' },
              },
            },
            { $sort: { revenue: -1 } },
            { $limit: 10 },
            {
              $lookup: {
                from: 'products',
                localField: '_id',
                foreignField: '_id',
                as: 'productDetails',
              },
            },
          ],
        },
      },
    ]);

    const result = {
      totalRevenue: analytics[0].totalRevenue[0]?.total || 0,
      totalOrders: analytics[0].totalRevenue[0]?.count || 0,
      byStatus: analytics[0].byStatus,
      byDate: analytics[0].byDate,
      topProducts: analytics[0].topProducts,
    };

    // Cache for 1 hour
    await cacheSet(cacheKey, result, 3600);

    return result;
  }

  async sendOrderEmail(userId, order, status) {
    const user = await User.findById(userId);

    let subject, statusMessage;

    switch (status) {
      case 'pending':
        subject = 'Order Placed - Awaiting Payment';
        statusMessage = 'Your order has been placed and is awaiting payment.';
        break;
      case 'paid':
        subject = 'Payment Confirmed';
        statusMessage = 'Your payment has been confirmed. Your order is now being processed.';
        break;
      case 'shipped':
        subject = 'Your Order Has Shipped';
        statusMessage = `Your order has shipped. Tracking: ${order.trackingNumber}`;
        break;
      case 'delivered':
        subject = 'Order Delivered';
        statusMessage = 'Your order has been delivered successfully.';
        break;
      case 'failed':
        subject = 'Payment Failed';
        statusMessage = 'Your payment failed. Please try again.';
        break;
      default:
        return;
    }

    const html = `
      <h2>Order Update</h2>
      <p>Hi ${user.name},</p>
      <p>${statusMessage}</p>
      <p><strong>Order Number:</strong> ${order.orderNumber}</p>
      <p><strong>Total:</strong> ₦${order.totalPrice.toLocaleString()}</p>
      <p>Thank you for shopping with CartFlow!</p>
    `;

    await sendEmail({
      to: user.email,
      subject,
      html,
    });
  }

  async sendOrderStatusEmail(userId, order, status) {
    await this.sendOrderEmail(userId, order, status);
  }
}

module.exports = new OrderService();
