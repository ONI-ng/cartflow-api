const UserService = require('../services/UserService');
const { asyncHandler, APIError } = require('../middleware/errorHandler');

class UserController {
  register = asyncHandler(async (req, res) => {
    const result = await UserService.registerUser(req.body);

    res.status(201).json({
      success: true,
      message: result.message,
      data: result,
    });
  });

  login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const result = await UserService.loginUser(email, password);

    res.cookie('authToken', result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.json({
      success: true,
      message: 'Login successful',
      data: result,
    });
  });

  verifyEmail = asyncHandler(async (req, res) => {
    const { token } = req.query;

    const result = await UserService.verifyEmail(token);

    res.json({
      success: true,
      message: result.message,
    });
  });

  getProfile = asyncHandler(async (req, res) => {
    const user = await UserService.getUserProfile(req.user._id);

    res.json({
      success: true,
      data: user,
    });
  });

  updateProfile = asyncHandler(async (req, res) => {
    const user = await UserService.updateUserProfile(req.user._id, req.body);

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: user,
    });
  });

  requestPasswordReset = asyncHandler(async (req, res) => {
    const { email } = req.body;

    const result = await UserService.requestPasswordReset(email);

    res.json({
      success: true,
      message: result.message,
    });
  });

  resetPassword = asyncHandler(async (req, res) => {
    const { token, newPassword } = req.body;

    const result = await UserService.resetPassword(token, newPassword);

    res.json({
      success: true,
      message: result.message,
    });
  });

  logout = asyncHandler(async (req, res) => {
    res.clearCookie('authToken');

    res.json({
      success: true,
      message: 'Logged out successfully',
    });
  });
}

module.exports = new UserController();
