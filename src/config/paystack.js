const axios = require('axios');

const PAYSTACK_BASE_URL = 'https://api.paystack.co';
const SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;

const paystackAPI = axios.create({
  baseURL: PAYSTACK_BASE_URL,
  headers: {
    Authorization: `Bearer ${SECRET_KEY}`,
    'Content-Type': 'application/json',
  },
});

const initializePayment = async (email, amount, metadata = {}) => {
  try {
    const response = await paystackAPI.post('/transaction/initialize', {
      email,
      amount: Math.round(amount * 100), // Paystack uses kobo (1 Naira = 100 kobo)
      metadata,
      callback_url: `${process.env.BASE_URL || 'http://localhost:5000'}/api/payments/verify`,
    });

    if (!response.data.status) {
      throw new Error(response.data.message);
    }

    return {
      success: true,
      authorizationUrl: response.data.data.authorization_url,
      accessCode: response.data.data.access_code,
      reference: response.data.data.reference,
    };
  } catch (error) {
    console.error('Payment initialization error:', error.message);
    return {
      success: false,
      error: error.message,
    };
  }
};

const verifyPayment = async (reference) => {
  try {
    const response = await paystackAPI.get(`/transaction/verify/${reference}`);

    if (!response.data.status) {
      throw new Error(response.data.message);
    }

    const transaction = response.data.data;

    return {
      success: transaction.status === 'success',
      status: transaction.status,
      amount: transaction.amount / 100, // Convert from kobo to Naira
      customer: transaction.customer,
      reference: transaction.reference,
      metadata: transaction.metadata,
      timestamp: transaction.paid_at,
    };
  } catch (error) {
    console.error('Payment verification error:', error.message);
    return {
      success: false,
      error: error.message,
    };
  }
};

const getTransactionDetails = async (reference) => {
  try {
    const response = await paystackAPI.get(`/transaction/${reference}`);

    if (!response.data.status) {
      throw new Error(response.data.message);
    }

    return {
      success: true,
      data: response.data.data,
    };
  } catch (error) {
    console.error('Get transaction error:', error.message);
    return {
      success: false,
      error: error.message,
    };
  }
};

const createRefund = async (reference, amount) => {
  try {
    const response = await paystackAPI.post('/refund', {
      transaction: reference,
      amount: Math.round(amount * 100),
    });

    if (!response.data.status) {
      throw new Error(response.data.message);
    }

    return {
      success: true,
      refundStatus: response.data.data.status,
      reference: response.data.data.reference,
    };
  } catch (error) {
    console.error('Refund error:', error.message);
    return {
      success: false,
      error: error.message,
    };
  }
};

module.exports = {
  initializePayment,
  verifyPayment,
  getTransactionDetails,
  createRefund,
};
