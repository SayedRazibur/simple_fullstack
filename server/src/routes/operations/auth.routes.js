import express from 'express';
import {
  createAccount,
  switchToAdmin,
  switchToUser,
  userLogin,
  logout,
  forgotPassword,
  verifyOtp,
  resetPassword,
  changePassword,
  refreshToken,
  verifyEmail,
  resendVerificationCode,
  getCurrentUser,
  changeAdminCode,
} from '../../controllers/operations/auth.controller.js';
import { isAdmin, protect } from '../../middlewares/auth.middleware.js';
import {
  loginLimiter,
  publicApiLimiter,
} from '../../middlewares/limiter.middleware.js';
import { validate } from '../../middlewares/zod.middleware.js';
import {
  registerSchema,
  loginSchema,
  changePasswordSchema,
  resetPasswordSchema,
  forgotPasswordSchema,
  verifyOtpSchema,
  verifyEmailSchema,
  resendVerificationSchema,
  switchToAdminSchema,
  changeAdminCodeSchema,
} from '../../validators/operations/auth.validator.js';
import { avatarUpload } from '../../middlewares/multer.middleware.js';

const router = express.Router();

// ==========================================
// Public Routes (No Authentication Required)
// ==========================================

// Registration
router.post(
  '/register',
  publicApiLimiter,
  avatarUpload.single('avatar'),
  validate(registerSchema),
  createAccount
);

// Email Verification
router.post(
  '/verify-email',
  publicApiLimiter,
  validate(verifyEmailSchema),
  verifyEmail
);

// Resend Verification Code
router.post(
  '/resend-verification',
  publicApiLimiter,
  validate(resendVerificationSchema),
  resendVerificationCode
);

// Login routes
router.post('/login', loginLimiter, validate(loginSchema), userLogin);

// Password recovery
router.post(
  '/forgot-password',
  publicApiLimiter,
  validate(forgotPasswordSchema),
  forgotPassword
);
router.post(
  '/verify-otp',
  publicApiLimiter,
  validate(verifyOtpSchema),
  verifyOtp
);
router.post(
  '/reset-password',
  publicApiLimiter,
  validate(resetPasswordSchema),
  resetPassword
);

// ==========================================
// Protected Routes (Authentication Required)
// ==========================================

router.post(
  '/switch-to-admin',
  protect,
  validate(switchToAdminSchema),
  switchToAdmin
);
router.post('/switch-to-user', protect, switchToUser);

// Logout
router.post('/logout', protect, logout);

// Refresh token
router.post('/refresh-token', publicApiLimiter, refreshToken);

// Change password
router.put(
  '/change-password',
  protect,
  isAdmin,
  validate(changePasswordSchema),
  changePassword
);
// Change admin code
router.put(
  '/change-admin-code',
  protect,
  isAdmin,
  validate(changeAdminCodeSchema),
  changeAdminCode
);

// Get current user
router.get('/me', protect, getCurrentUser);

export default router;
