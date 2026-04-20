const express = require('express');
const UserController = require('../controllers/UserController');
const { authenticate } = require('../middleware/auth');
const { validate, validationSchemas } = require('../middleware/validation');
const { authLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

// Public routes
router.post(
  '/register',
  authLimiter,
  validate(validationSchemas.register),
  UserController.register
);

router.post(
  '/login',
  authLimiter,
  validate(validationSchemas.login),
  UserController.login
);

router.get('/verify-email', UserController.verifyEmail);

router.post('/request-password-reset', UserController.requestPasswordReset);

router.post('/reset-password', UserController.resetPassword);

// Protected routes
router.get('/profile', authenticate, UserController.getProfile);

router.put(
  '/profile',
  authenticate,
  validate(validationSchemas.updateProfile),
  UserController.updateProfile
);

router.post('/logout', authenticate, UserController.logout);

module.exports = router;
