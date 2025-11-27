import { z } from 'zod';

// Common schemas
const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
    'Password must contain at least one uppercase letter, one lowercase letter, and one number'
  );

const adminCodeSchema = z
  .string({
    required_error: 'Verification code is required',
  })
  .length(6, 'Verification code must be 6 digits')
  .regex(/^\d{6}$/, 'Verification code must contain only numbers');

const emailSchema = z.string().email('Please provide a valid email');

// Register schema - FIXED STRUCTURE
export const registerSchema = z.object({
  body: z.object({
    email: emailSchema,
    password: passwordSchema,
    adminCode: z.number().min(6, 'code must be at least 6 digit'),
  }),
  params: z.object({}),
  query: z.object({}),
});

// Verify Email Schema
export const verifyEmailSchema = z.object({
  body: z.object({
    email: z
      .string({
        required_error: 'Email is required',
      })
      .email('Invalid email address'),
    verificationCode: z
      .string({
        required_error: 'Verification code is required',
      })
      .length(6, 'Verification code must be 6 digits')
      .regex(/^\d{6}$/, 'Verification code must contain only numbers'),
  }),
});

// Resend Verification Code Schema
export const resendVerificationSchema = z.object({
  body: z.object({
    email: z
      .string({
        required_error: 'Email is required',
      })
      .email('Invalid email address'),
  }),
});

// Login schema - FIXED STRUCTURE
export const loginSchema = z.object({
  body: z.object({
    email: emailSchema,
    password: z.string().min(1, 'Password is required'),
  }),
  params: z.object({}),
  query: z.object({}),
});

// Login schema - FIXED STRUCTURE
export const switchToAdminSchema = z.object({
  body: z.object({
    adminCode: adminCodeSchema,
  }),
  params: z.object({}),
  query: z.object({}),
});

// Change password schema - FIXED STRUCTURE
export const changePasswordSchema = z.object({
  body: z.object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: passwordSchema,
  }),
  params: z.object({}),
  query: z.object({}),
});

// Change password schema - FIXED STRUCTURE
export const changeAdminCodeSchema = z.object({
  body: z.object({
    currentAdminCode: adminCodeSchema,
    newAdminCode: adminCodeSchema,
  }),
  params: z.object({}),
  query: z.object({}),
});

// Reset password schema - FIXED STRUCTURE
export const resetPasswordSchema = z.object({
  body: z.object({
    resetToken: z.string().min(1, 'Reset token is required'),
    newPassword: passwordSchema,
  }),
  params: z.object({}),
  query: z.object({}),
});

// Forgot password schema - FIXED STRUCTURE
export const forgotPasswordSchema = z.object({
  body: z.object({
    email: emailSchema,
  }),
  params: z.object({}),
  query: z.object({}),
});

// Verify OTP schema - FIXED STRUCTURE
export const verifyOtpSchema = z.object({
  body: z.object({
    email: emailSchema,
    otp: z.string().length(6, 'OTP must be 6 digits'),
  }),
  params: z.object({}),
  query: z.object({}),
});
