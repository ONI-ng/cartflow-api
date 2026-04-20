const Joi = require('joi');

const validationSchemas = {
  // User validation
  register: Joi.object({
    name: Joi.string().min(2).max(50).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    confirmPassword: Joi.string().valid(Joi.ref('password')).required(),
  }),

  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  }),

  updateProfile: Joi.object({
    name: Joi.string().min(2).max(50),
    phone: Joi.string().regex(/^[0-9\-\+\s\(\)]+$/),
    address: Joi.object({
      street: Joi.string(),
      city: Joi.string(),
      state: Joi.string(),
      zipCode: Joi.string(),
      country: Joi.string(),
    }),
  }),

  // Product validation
  createProduct: Joi.object({
    name: Joi.string().min(3).max(100).required(),
    description: Joi.string().min(10).required(),
    price: Joi.number().min(0).required(),
    category: Joi.string()
      .valid(
        'Electronics',
        'Fashion',
        'Home & Garden',
        'Sports',
        'Books',
        'Beauty',
        'Food',
        'Toys',
        'Other'
      )
      .required(),
    stock: Joi.number().integer().min(0).required(),
    discount: Joi.number().min(0).max(100),
    images: Joi.array().items(Joi.string().uri()),
    tags: Joi.array().items(Joi.string()),
  }),

  updateProduct: Joi.object({
    name: Joi.string().min(3).max(100),
    description: Joi.string().min(10),
    price: Joi.number().min(0),
    category: Joi.string().valid(
      'Electronics',
      'Fashion',
      'Home & Garden',
      'Sports',
      'Books',
      'Beauty',
      'Food',
      'Toys',
      'Other'
    ),
    stock: Joi.number().integer().min(0),
    discount: Joi.number().min(0).max(100),
    images: Joi.array().items(Joi.string().uri()),
    tags: Joi.array().items(Joi.string()),
  }),

  // Cart validation
  addToCart: Joi.object({
    productId: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required(),
    quantity: Joi.number().integer().min(1).required(),
  }),

  // Order validation
  checkout: Joi.object({
    shippingAddress: Joi.object({
      street: Joi.string().required(),
      city: Joi.string().required(),
      state: Joi.string(),
      zipCode: Joi.string().required(),
      country: Joi.string().required(),
    }).required(),
    paymentMethod: Joi.string()
      .valid('paystack', 'credit_card', 'bank_transfer', 'wallet')
      .required(),
  }),

  // Review validation
  createReview: Joi.object({
    productId: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required(),
    rating: Joi.number().integer().min(1).max(5).required(),
    title: Joi.string().max(100).required(),
    comment: Joi.string().min(10).max(1000).required(),
  }),
};

const validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const messages = error.details.map((d) => d.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: messages,
      });
    }

    req.body = value;
    next();
  };
};

module.exports = {
  validationSchemas,
  validate,
};
