import rateLimit, { ipKeyGenerator } from 'express-rate-limit';

// Global limiter
export const globalLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 1000,
  keyGenerator: (req) => ipKeyGenerator(req),
  message: {
    success: false,
    code: 429,
    message: 'Too many failed login attempts. Please try again later.',
  },
});

// Login limiter
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  skipSuccessfulRequests: true,
  keyGenerator: (req) => ipKeyGenerator(req),
  message: {
    success: false,
    code: 429,
    message: 'Too many failed login attempts. Please try again later.',
  },
});

//Public limiter
export const publicApiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5000,
  skip: (req) => req.path === '/api/products',
  keyGenerator: (req) => ipKeyGenerator(req),
});

// Admin limiter
export const adminLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  keyGenerator: (req) => req.user?.id || ipKeyGenerator(req),
  message: {
    success: false,
    code: 429,
    message: 'Too many failed login attempts. Please try again later.',
  },
});
