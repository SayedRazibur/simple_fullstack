import { StatusCodes } from 'http-status-codes';
import ApiError from '../utils/api.error.js';
import AuthHelper from '../utils/auth.helper.js';
import prisma from '../config/prisma.js';
import catchAsync from '../utils/catch.async.js';

// Protect middleware - verifies if user is authenticated
export const protect = catchAsync(async (req, res, next) => {
  let token;

  // Get token from cookies or Authorization header
  if (req.cookies && req.cookies.accessToken) {
    token = req.cookies.accessToken;
  } else if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    throw new ApiError(
      'You are not logged in. Please login to access this resource',
      StatusCodes.UNAUTHORIZED
    );
  }

  // Verify token
  let decoded;
  try {
    decoded = AuthHelper.verifyAccessToken(token);
    // eslint-disable-next-line no-unused-vars
  } catch (error) {
    throw new ApiError('Invalid or expired token', StatusCodes.UNAUTHORIZED);
  }

  // Check if user still exists
  const user = await prisma.user.findUnique({
    where: { id: decoded.id },
  });

  if (!user) {
    throw new ApiError(
      'User belonging to this token no longer exists',
      StatusCodes.UNAUTHORIZED
    );
  }

  // Check if user is blocked or deleted
  if (user.status === 'BLOCKED') {
    throw new ApiError('Your account has been blocked', StatusCodes.FORBIDDEN);
  }

  if (user.isDeleted) {
    throw new ApiError('Your account has been deleted', StatusCodes.FORBIDDEN);
  }

  // Add user and roles to request
  req.user = {
    id: user.id,
    email: user.email,
    isAdmin: decoded.isAdmin || false,
  };

  next();
});

// Authorize middleware - checks if user has required roles
export const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.roles) {
      throw new ApiError(
        'User roles not found. Please login again.',
        StatusCodes.UNAUTHORIZED
      );
    }

    // Check if user has any of the allowed roles
    const hasRole = req.user.roles.some((role) => allowedRoles.includes(role));

    if (!hasRole) {
      throw new ApiError(
        `Access denied. Only ${allowedRoles.join(', ')} can access this resource`,
        StatusCodes.FORBIDDEN
      );
    }

    next();
  };
};

// Check if user is in admin mode on
export const isAdmin = (req, res, next) => {
  if (!req.user || req.user.isAdmin === undefined) {
    throw new ApiError(
      'User roles not found. Please login again.',
      StatusCodes.UNAUTHORIZED
    );
  }

  if (!req.user.isAdmin) {
    throw new ApiError(
      'Access denied. Admin privileges required.',
      StatusCodes.FORBIDDEN
    );
  }

  next();
};
