// src/services/api.js
import axiosSecure from '@/services/axiosInstance/axiosSecure';
import axiosPublic from '@/services/axiosInstance/axiosPublic';

const handle = async (promise) => {
  try {
    const res = await promise;
    return res.data;
  } catch (err) {
    const message =
      err?.response?.data?.message || err?.message || 'Something went wrong';
    throw new Error(message);
  }
};

export const api = {
  // 🔹 PUBLIC AUTH ROUTES ========================

  verifyEmail: (email, verificationCode) =>
    handle(axiosPublic.post('/auth/verify-email', { email, verificationCode })),

  resendVerification: (email) =>
    handle(axiosPublic.post('/auth/resend-verification', { email })),

  login: (email, password) =>
    handle(axiosPublic.post('/auth/login', { email, password })),

  forgotPassword: (email) =>
    handle(axiosPublic.post('/auth/forgot-password', { email })),

  verifyOtp: (email, otp) =>
    handle(axiosPublic.post('/auth/verify-otp', { email, otp })),

  resetPassword: (newPassword, resetToken) =>
    handle(
      axiosPublic.post('/auth/reset-password', { newPassword, resetToken })
    ),

  // 🔹 PROTECTED AUTH ROUTES =====================
  switchToAdmin: (adminCode) =>
    handle(axiosSecure.post('/auth/switch-to-admin', { adminCode })),

  switchToUser: () => handle(axiosSecure.post('/auth/switch-to-user')),

  logout: () => handle(axiosSecure.post('/auth/logout')),

  validateToken: () => handle(axiosSecure.get('/auth/me')),

  changePassword: (currentPassword, newPassword) =>
    handle(
      axiosSecure.put('/auth/change-password', {
        currentPassword,
        newPassword,
      })
    ),
    
  changeAdminCode: (currentAdminCode, newAdminCode) =>
    handle(
      axiosSecure.put('/auth/change-admin-code', {
        currentAdminCode,
        newAdminCode,
      })
    ),
};
