import catchAsync from '../../utils/catch.async.js';
import prisma from '../../config/prisma.js';
import successResponse from '../../utils/success.response.js';
import {
  otpEmailTemplate,
  passwordChangedTemplate,
  verificationEmailTemplate,
} from '../../services/email_template.service.js';
import { emailHelper } from '../../utils/email.helper.js';
import ApiError from '../../utils/api.error.js';
import { StatusCodes } from 'http-status-codes';
import config from '../../config/index.js';
import AuthHelper from '../../utils/auth.helper.js';
import { logConsole } from '../../utils/log.console.js';

const OTP_CONFIG = {
  expiresMinutes: 10,
};

// ==========================================
// CREATE ACCOUNT (User Registration)
// ==========================================
export const createAccount = catchAsync(async (req, res) => {
  const { email, password, adminCode } = req.body;

  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [{ email }],
    },
    select: {
      id: true,
      email: true,
      isDeleted: true,
    },
  });

  if (existingUser) {
    if (existingUser.isDeleted) {
      throw new ApiError(
        'This email or username is associated with a deleted account. Please contact support to restore your account or use a different email/username.',
        StatusCodes.CONFLICT
      );
    }
    throw new ApiError(
      'User with this email already exists',
      StatusCodes.CONFLICT
    );
  }

  const hashedPassword = await AuthHelper.hashPassword(password);
  const hashedAdminCode = await AuthHelper.hashPassword(adminCode.toString());
  const verificationCode = AuthHelper.generateOtp();
  const hashedVerificationCode =
    await AuthHelper.hashPassword(verificationCode);
  const verificationExpires = new Date(
    Date.now() + OTP_CONFIG.expiresMinutes * 60 * 1000
  );

  const newUser = await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        email,
        password: hashedPassword,
        adminCode: hashedAdminCode,
        status: 'ACTIVE',
        isVerified: false,
        verificationToken: hashedVerificationCode,
        verificationExpires,
      },
      select: {
        id: true,
        email: true,
        isVerified: true,
        status: true,
        createdAt: true,
      },
    });

    return user;
  });

  const html = verificationEmailTemplate({
    // name: userName,
    verificationCode,
    expiresMinutes: OTP_CONFIG.expiresMinutes,
  });

  await emailHelper({
    to: email,
    subject: 'Verify Your Email Address - Speechceu',
    message: `Your verification code is ${verificationCode}. It will expire in ${OTP_CONFIG.expiresMinutes} minutes.`,
    html,
  });

  successResponse({
    res,
    code: StatusCodes.CREATED,
    success: true,
    message:
      'Account created successfully. Please check your email to verify your account.',
    data: newUser,
  });
});

// ==========================================
// VERIFY EMAIL
// ==========================================
export const verifyEmail = catchAsync(async (req, res) => {
  const { email, verificationCode } = req.body;

  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      email: true,
      isVerified: true,
      verificationToken: true,
      verificationExpires: true,
    },
  });

  if (!user) {
    throw new ApiError('User not found', StatusCodes.NOT_FOUND);
  }

  if (user.isVerified) {
    throw new ApiError('Email is already verified', StatusCodes.BAD_REQUEST);
  }

  if (!user.verificationToken) {
    throw new ApiError(
      'No verification request found',
      StatusCodes.BAD_REQUEST
    );
  }

  if (user.verificationExpires < new Date()) {
    throw new ApiError(
      'Verification code has expired',
      StatusCodes.UNAUTHORIZED
    );
  }

  const isValid = await AuthHelper.comparePassword(
    verificationCode,
    user.verificationToken
  );

  if (!isValid) {
    throw new ApiError('Invalid verification code', StatusCodes.UNAUTHORIZED);
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      isVerified: true,
      verificationToken: null,
      verificationExpires: null,
    },
  });

  return successResponse({
    res,
    code: StatusCodes.OK,
    success: true,
    message: 'Email verified successfully. You can now login.',
    data: null,
  });
});

// ==========================================
// RESEND VERIFICATION CODE
// ==========================================
export const resendVerificationCode = catchAsync(async (req, res) => {
  const { email } = req.body;

  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      email: true,
      isVerified: true,
    },
  });

  if (!user) {
    throw new ApiError('User not found', StatusCodes.NOT_FOUND);
  }

  if (user.isVerified) {
    throw new ApiError('Email is already verified', StatusCodes.BAD_REQUEST);
  }

  const verificationCode = AuthHelper.generateOtp();
  const hashedVerificationCode =
    await AuthHelper.hashPassword(verificationCode);
  const verificationExpires = new Date(
    Date.now() + OTP_CONFIG.expiresMinutes * 60 * 1000
  );

  await prisma.user.update({
    where: { id: user.id },
    data: {
      verificationToken: hashedVerificationCode,
      verificationExpires: verificationExpires,
    },
  });

  const html = verificationEmailTemplate({
    name: user.userName,
    verificationCode: verificationCode,
    expiresMinutes: OTP_CONFIG.expiresMinutes,
  });

  const result = await emailHelper({
    to: email,
    subject: 'Verify Your Email Address - Speechceu',
    message: `Your verification code is ${verificationCode}. It will expire in ${OTP_CONFIG.expiresMinutes} minutes.`,
    html,
  });

  if (result?.accepted?.length > 0) {
    return successResponse({
      res,
      code: StatusCodes.OK,
      success: true,
      message: 'Verification code has been resent to your email',
      data: null,
    });
  }

  throw new ApiError(
    'Failed to send verification email. Please try again later.',
    StatusCodes.INTERNAL_SERVER_ERROR
  );
});

// ==========================================
// SWITCH TO ADMIN MODE
// ==========================================
export const switchToAdmin = catchAsync(async (req, res) => {
  const { adminCode } = req.body;
  const id = req.user.id;

  const user = await prisma.user.findUnique({
    where: { id },
  });

  if (!user) {
    throw new ApiError('Unauthorized', StatusCodes.UNAUTHORIZED);
  }

  if (!user.isVerified) {
    throw new ApiError(
      'Please verify your email before switch to admin mode',
      StatusCodes.FORBIDDEN
    );
  }

  if (user.status === 'BLOCKED') {
    throw new ApiError('Your account has been blocked', StatusCodes.FORBIDDEN);
  }

  if (user.isDeleted) {
    throw new ApiError('Your account has been deleted', StatusCodes.FORBIDDEN);
  }

  const isMatch = await AuthHelper.comparePassword(adminCode, user.adminCode);
  if (!isMatch) {
    throw new ApiError('Invalid email or password!', StatusCodes.UNAUTHORIZED);
  }

  const accessToken = AuthHelper.generateAccessToken({
    id: user.id,
    email: user.email,
    isAdmin: true,
  });
  const refreshToken = AuthHelper.generateRefreshToken({
    id: user.id,
    email: user.email,
    isAdmin: true,
  });

  await prisma.user.update({
    where: { id: user.id },
    data: { refreshToken },
  });

  res.cookie('accessToken', accessToken, {
    httpOnly: true,
    sameSite: config.IS_PRODUCTION ? 'none' : 'lax',
    secure: config.IS_PRODUCTION,
    maxAge: config.ACCESS_TOKEN_COOKIE_EXPIRE_DAYS * 24 * 60 * 60 * 1000,
  });
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    sameSite: config.IS_PRODUCTION ? 'none' : 'lax',
    secure: config.IS_PRODUCTION,
    maxAge: config.REFRESH_TOKEN_COOKIE_EXPIRE_DAYS * 24 * 60 * 60 * 1000,
  });

  const userData = {
    id: user.id,
    email: user.email,
    isAdmin: true,
    status: user.status,
  };

  return successResponse({
    res,
    code: StatusCodes.OK,
    success: true,
    message: 'Admin login successful',
    data: {
      accessToken,
      refreshToken,
      user: userData,
    },
  });
});

// ==========================================
// SWITCH TO USER MODE
// ==========================================
export const switchToUser = catchAsync(async (req, res) => {
  const id = req.user.id;

  const user = await prisma.user.findUnique({
    where: { id },
  });

  if (!user) {
    throw new ApiError('Unauthorized', StatusCodes.UNAUTHORIZED);
  }

  if (!user.isVerified) {
    throw new ApiError(
      'Please verify your email before switch to admin mode',
      StatusCodes.FORBIDDEN
    );
  }

  if (user.status === 'BLOCKED') {
    throw new ApiError('Your account has been blocked', StatusCodes.FORBIDDEN);
  }

  if (user.isDeleted) {
    throw new ApiError('Your account has been deleted', StatusCodes.FORBIDDEN);
  }

  const accessToken = AuthHelper.generateAccessToken({
    id: user.id,
    email: user.email,
    isAdmin: false,
  });
  const refreshToken = AuthHelper.generateRefreshToken({
    id: user.id,
    email: user.email,
    isAdmin: false,
  });

  await prisma.user.update({
    where: { id: user.id },
    data: { refreshToken },
  });

  res.cookie('accessToken', accessToken, {
    httpOnly: true,
    sameSite: config.IS_PRODUCTION ? 'none' : 'lax',
    secure: config.IS_PRODUCTION,
    maxAge: config.ACCESS_TOKEN_COOKIE_EXPIRE_DAYS * 24 * 60 * 60 * 1000,
  });
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    sameSite: config.IS_PRODUCTION ? 'none' : 'lax',
    secure: config.IS_PRODUCTION,
    maxAge: config.REFRESH_TOKEN_COOKIE_EXPIRE_DAYS * 24 * 60 * 60 * 1000,
  });

  const userData = {
    id: user.id,
    email: user.email,
    isAdmin: false,
    status: user.status,
  };

  return successResponse({
    res,
    code: StatusCodes.OK,
    success: true,
    message: 'Admin login successful',
    data: {
      accessToken,
      refreshToken,
      user: userData,
    },
  });
});

// ==========================================
// USER LOGIN
// ==========================================
export const userLogin = catchAsync(async (req, res) => {
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new ApiError('Unauthorized', StatusCodes.UNAUTHORIZED);
  }

  if (!user.isVerified) {
    throw new ApiError(
      'Please verify your email before logging in',
      StatusCodes.FORBIDDEN
    );
  }

  if (user.status === 'BLOCKED') {
    throw new ApiError('Your account has been blocked', StatusCodes.FORBIDDEN);
  }

  if (user.isDeleted) {
    throw new ApiError('Your account has been deleted', StatusCodes.FORBIDDEN);
  }

  const isMatch = await AuthHelper.comparePassword(password, user.password);
  if (!isMatch) {
    throw new ApiError('Invalid email or password!', StatusCodes.UNAUTHORIZED);
  }

  const accessToken = AuthHelper.generateAccessToken({
    id: user.id,
    email: user.email,
    isAdmin: false,
  });
  const refreshToken = AuthHelper.generateRefreshToken({
    id: user.id,
    email: user.email,
    isAdmin: false,
  });

  await prisma.user.update({
    where: { id: user.id },
    data: {
      refreshToken,
      lastLoginAt: new Date(),
    },
  });
  res.cookie('accessToken', accessToken, {
    httpOnly: true,
    sameSite: config.IS_PRODUCTION ? 'none' : 'lax',
    secure: config.IS_PRODUCTION,
    maxAge: config.ACCESS_TOKEN_COOKIE_EXPIRE_DAYS * 24 * 60 * 60 * 1000,
  });
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    sameSite: config.IS_PRODUCTION ? 'none' : 'lax',
    secure: config.IS_PRODUCTION,
    maxAge: config.REFRESH_TOKEN_COOKIE_EXPIRE_DAYS * 24 * 60 * 60 * 1000,
  });

  const userData = {
    id: user.id,
    email: user.email,
    isAdmin: false,
    status: user.status,
  };

  return successResponse({
    res,
    code: StatusCodes.OK,
    success: true,
    message: 'User login successful',
    data: {
      accessToken,
      refreshToken,
      user: userData,
    },
  });
});

// ==========================================
// LOGOUT
// ==========================================
export const logout = catchAsync(async (req, res) => {
  const userId = req.user?.id;

  if (userId) {
    await prisma.user.update({
      where: { id: userId },
      data: { refreshToken: null },
    });
  }

  res.clearCookie('accessToken', {
    httpOnly: true,
    sameSite: config.IS_PRODUCTION ? 'none' : 'lax',
    secure: config.IS_PRODUCTION,
  });
  res.clearCookie('refreshToken', {
    httpOnly: true,
    sameSite: config.IS_PRODUCTION ? 'none' : 'lax',
    secure: config.IS_PRODUCTION,
  });

  successResponse({
    res,
    code: StatusCodes.OK,
    success: true,
    message: 'Logout successfully',
    data: null,
  });
});

// ==========================================
// REFRESH TOKEN
// ==========================================
export const refreshToken = catchAsync(async (req, res) => {
  const token = req.cookies.refreshToken || req.body?.refreshToken;

  if (!token) {
    throw new ApiError('No refresh token provided', StatusCodes.UNAUTHORIZED);
  }

  let payload;
  try {
    payload = AuthHelper.verifyRefreshToken(token);
    // eslint-disable-next-line no-unused-vars
    logConsole(payload);
  } catch (error) {
    throw new ApiError(
      'Invalid or expired refresh token',
      StatusCodes.UNAUTHORIZED
    );
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.id },
  });

  if (!user || user.refreshToken !== token) {
    throw new ApiError('Unauthorized', StatusCodes.UNAUTHORIZED);
  }

  const newAccessToken = AuthHelper.generateAccessToken({
    id: user.id,
    email: user.email,
    isAdmin: payload.isAdmin,
  });
  const newRefreshToken = AuthHelper.generateRefreshToken({
    id: user.id,
    email: user.email,
    isAdmin: payload.isAdmin,
  });

  await prisma.user.update({
    where: { id: user.id },
    data: { refreshToken: newRefreshToken },
  });

  res.cookie('accessToken', newAccessToken, {
    httpOnly: true,
    secure: config.IS_PRODUCTION,
    sameSite: config.IS_PRODUCTION ? 'none' : 'lax',
    maxAge: config.ACCESS_TOKEN_COOKIE_EXPIRE_DAYS * 24 * 60 * 60 * 1000,
  });

  res.cookie('refreshToken', newRefreshToken, {
    httpOnly: true,
    secure: config.IS_PRODUCTION,
    sameSite: config.IS_PRODUCTION ? 'none' : 'lax',
    maxAge: config.REFRESH_TOKEN_COOKIE_EXPIRE_DAYS * 24 * 60 * 60 * 1000,
  });

  return successResponse({
    res,
    code: StatusCodes.OK,
    success: true,
    message: 'Token refreshed successfully',
    data: { accessToken: newAccessToken, refreshToken: newRefreshToken },
  });
});

// ==========================================
// FORGOT PASSWORD
// ==========================================
export const forgotPassword = catchAsync(async (req, res) => {
  const { email } = req.body;

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    return successResponse({
      res,
      code: StatusCodes.ACCEPTED,
      success: true,
      message: 'If an account exists, an OTP will be sent to your email',
      data: null,
    });
  }

  const otp = AuthHelper.generateOtp();
  const hashedOtp = await AuthHelper.hashPassword(otp);
  const otpExpires = new Date(
    Date.now() + OTP_CONFIG.expiresMinutes * 60 * 1000
  );

  await prisma.user.update({
    where: { id: user.id },
    data: {
      resetToken: hashedOtp,
      resetTokenExpires: otpExpires,
    },
  });

  const html = otpEmailTemplate({
    title: 'Reset Your Password',
    otp,
    name: 'User',
    name: 'User',
    expiresMinutes: OTP_CONFIG.expiresMinutes,
  });

  const result = await emailHelper({
    to: email,
    subject: '🔐 Password Reset Request',
    message: `Your password reset OTP is ${otp}. It will expire in ${OTP_CONFIG.expiresMinutes} minutes.`,
    html,
  });

  if (result?.accepted?.length > 0) {
    return successResponse({
      res,
      code: StatusCodes.OK,
      success: true,
      message: 'An OTP has been sent to your email',
      data: null,
    });
  }

  throw new ApiError(
    'Failed to send OTP email. Please try again later.',
    StatusCodes.INTERNAL_SERVER_ERROR
  );
});

// ==========================================
// VERIFY OTP
// ==========================================
export const verifyOtp = catchAsync(async (req, res) => {
  const { email, otp } = req.body;

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) throw new ApiError('User not found', StatusCodes.NOT_FOUND);

  if (!user.resetToken)
    throw new ApiError('No OTP request found', StatusCodes.BAD_REQUEST);

  if (user.resetTokenExpires < new Date())
    throw new ApiError('OTP has expired', StatusCodes.UNAUTHORIZED);

  const isValid = await AuthHelper.comparePassword(otp, user.resetToken);
  if (!isValid) throw new ApiError('Invalid OTP', StatusCodes.UNAUTHORIZED);

  const resetToken = AuthHelper.generateResetToken();
  const hashedResetToken = AuthHelper.hashToken(resetToken);
  const resetExpires = new Date(Date.now() + 10 * 60 * 1000);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      resetToken: hashedResetToken,
      resetTokenExpires: resetExpires,
    },
  });

  return successResponse({
    res,
    code: StatusCodes.OK,
    success: true,
    message: 'OTP verified successfully',
    data: { resetToken, expiresIn: '10 minutes' },
  });
});

// ==========================================
// RESET PASSWORD
// ==========================================
export const resetPassword = catchAsync(async (req, res) => {
  const { newPassword, resetToken } = req.body;

  if (!resetToken) {
    throw new ApiError('Reset token is required', StatusCodes.BAD_REQUEST);
  }

  const hashedToken = AuthHelper.hashToken(resetToken);

  const user = await prisma.user.findFirst({
    where: {
      resetToken: hashedToken,
      resetTokenExpires: { gt: new Date() },
    },
  });

  if (!user) {
    throw new ApiError(
      'Invalid or expired reset token',
      StatusCodes.UNAUTHORIZED
    );
  }

  const hashedPassword = await AuthHelper.hashPassword(newPassword);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      password: hashedPassword,
      resetToken: null,
      resetTokenExpires: null,
    },
  });

  const html = passwordChangedTemplate('User');

  await emailHelper({
    to: user.email,
    subject: '🔒 Password Changed Successfully',
    message: 'Your password has been changed successfully.',
    html,
  });

  return successResponse({
    res,
    code: StatusCodes.OK,
    success: true,
    message: 'Password reset successfully',
    data: null,
  });
});

// ==========================================
// CHANGE PASSWORD
// ==========================================
export const changePassword = catchAsync(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const userId = req.user.id;

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new ApiError('User not found', StatusCodes.NOT_FOUND);
  }

  if (currentPassword && newPassword && currentPassword === newPassword) {
    throw new ApiError(
      'New password cannot be the same as the current password',
      StatusCodes.BAD_REQUEST
    );
  }

  const isMatch = await AuthHelper.comparePassword(
    currentPassword,
    user.password
  );
  if (!isMatch) {
    throw new ApiError(
      'Current password is incorrect',
      StatusCodes.UNAUTHORIZED
    );
  }

  const hashedPassword = await AuthHelper.hashPassword(newPassword);

  await prisma.user.update({
    where: { id: userId },
    data: {
      password: hashedPassword,
    },
  });

  const html = passwordChangedTemplate('User');

  await emailHelper({
    to: user.email,
    subject: '🔒 Password Changed Successfully',
    message: 'Your password has been changed successfully.',
    html,
  });

  successResponse({
    res,
    code: StatusCodes.OK,
    success: true,
    message: 'Password changed successfully',
    data: null,
  });
});

// ==========================================
// CHANGE PASSWORD
// ==========================================
export const changeAdminCode = catchAsync(async (req, res) => {
  const { currentAdminCode, newAdminCode } = req.body;
  const userId = req.user.id;

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new ApiError('User not found', StatusCodes.NOT_FOUND);
  }

  if (currentAdminCode && newAdminCode && currentAdminCode === newAdminCode) {
    throw new ApiError(
      'New password cannot be the same as the current password',
      StatusCodes.BAD_REQUEST
    );
  }

  const isMatch = await AuthHelper.comparePassword(
    currentAdminCode,
    user.adminCode
  );
  if (!isMatch) {
    throw new ApiError(
      'Current password is incorrect',
      StatusCodes.BAD_REQUEST
    );
  }

  const hashedAdminCode = await AuthHelper.hashPassword(newAdminCode);

  await prisma.user.update({
    where: { id: userId },
    data: {
      adminCode: hashedAdminCode,
    },
  });

  const html = passwordChangedTemplate('User');

  await emailHelper({
    to: user.email,
    subject: '🔒 Admin Code Changed',
    message: 'Your admin code has been changed successfully.',
    html,
  });

  successResponse({
    res,
    code: StatusCodes.OK,
    success: true,
    message: 'Admin code changed successfully',
    data: null,
  });
});

// ==========================================
// GET CURRENT USER
// ==========================================
export const getCurrentUser = catchAsync(async (req, res) => {
  const { id: userId, isAdmin } = req.user;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      email: true,
      status: true,
    },
  });

  if (!user) {
    throw new ApiError('User not found', StatusCodes.NOT_FOUND);
  }

  successResponse({
    res,
    code: StatusCodes.OK,
    success: true,
    message: 'User profile retrieved successfully',
    data: { ...user, isAdmin },
  });
});
