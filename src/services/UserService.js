const User = require('../models/User');
const { APIError } = require('../middleware/errorHandler');
const { sendEmail } = require('../config/email');
const crypto = require('crypto');

class UserService {
  async registerUser(userData) {
    const { name, email, password } = userData;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new APIError('Email already registered', 409);
    }

    // Create verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Create user
    const user = new User({
      name,
      email,
      password,
      verificationToken,
      verificationTokenExpires,
    });

    await user.save();

    // Send verification email
    await this.sendVerificationEmail(user);

    return {
      id: user._id,
      name: user.name,
      email: user.email,
      message: 'Registration successful. Please verify your email.',
    };
  }

  async loginUser(email, password) {
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      throw new APIError('Invalid email or password', 401);
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw new APIError('Invalid email or password', 401);
    }

    if (!user.isVerified) {
      throw new APIError('Please verify your email first', 403);
    }

    const token = user.generateAuthToken(
      process.env.JWT_SECRET,
      process.env.JWT_EXPIRE
    );

    user.lastLogin = new Date();
    await user.save();

    return {
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  }

  async verifyEmail(token) {
    const user = await User.findOne({
      verificationToken: token,
      verificationTokenExpires: { $gt: Date.now() },
    });

    if (!user) {
      throw new APIError('Invalid or expired verification token', 400);
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;

    await user.save();

    return {
      message: 'Email verified successfully',
    };
  }

  async sendVerificationEmail(user) {
    const verificationLink = `${process.env.BASE_URL || 'http://localhost:3000'}/verify-email?token=${user.verificationToken}`;

    const html = `
      <h2>Welcome to CartFlow!</h2>
      <p>Please verify your email by clicking the link below:</p>
      <a href="${verificationLink}">Verify Email</a>
      <p>This link expires in 24 hours.</p>
    `;

    await sendEmail({
      to: user.email,
      subject: 'Verify Your Email - CartFlow',
      html,
    });
  }

  async getUserProfile(userId) {
    const user = await User.findById(userId).select('-password');

    if (!user) {
      throw new APIError('User not found', 404);
    }

    return user;
  }

  async updateUserProfile(userId, updateData) {
    const allowedFields = ['name', 'phone', 'address', 'avatar'];
    const updateObject = {};

    allowedFields.forEach((field) => {
      if (updateData[field]) {
        updateObject[field] = updateData[field];
      }
    });

    const user = await User.findByIdAndUpdate(userId, updateObject, {
      new: true,
      runValidators: true,
    });

    return user;
  }

  async requestPasswordReset(email) {
    const user = await User.findOne({ email });

    if (!user) {
      // Don't reveal if email exists (security best practice)
      return { message: 'If email exists, password reset link sent' };
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = new Date(Date.now() + 1 * 60 * 60 * 1000); // 1 hour

    await user.save();

    const resetLink = `${process.env.BASE_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;

    await sendEmail({
      to: user.email,
      subject: 'Password Reset - CartFlow',
      html: `
        <h2>Password Reset Request</h2>
        <p>Click the link below to reset your password:</p>
        <a href="${resetLink}">Reset Password</a>
        <p>This link expires in 1 hour.</p>
      `,
    });

    return { message: 'If email exists, password reset link sent' };
  }

  async resetPassword(token, newPassword) {
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      throw new APIError('Invalid or expired reset token', 400);
    }

    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    return { message: 'Password reset successful' };
  }
}

module.exports = new UserService();
