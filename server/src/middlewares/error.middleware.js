import { ZodError } from 'zod';
import ApiError from '../utils/api.error.js';

export const notFoundMiddleware = (req, res, next) => {
  next(new ApiError(`Cannot find ${req.originalUrl} on this server`, 404));
};

export const globalErrorHandler = (err, req, res, next) => {
  const errorResponse = {
    success: false,
    status: 'error',
    message: 'Something went wrong!',
    data: null,
    code: err.statusCode || 500,
  };

  let statusCode = err.statusCode || 500;

  if (err instanceof ApiError) {
    statusCode = err.statusCode;
    errorResponse.message = err.message;
    errorResponse.status = err.status || errorResponse.status;
    Object.keys(err).forEach((key) => {
      if (
        !['message', 'name', 'stack', 'isOperational', 'statusCode'].includes(
          key
        )
      ) {
        errorResponse[key] = err[key];
      }
    });
  } else if (err instanceof ZodError) {
    statusCode = 400;
    errorResponse.status = 'fail';
    errorResponse.message = 'Validation failed';
    errorResponse.errors = err.issues.map((issue) => ({
      field: issue.path.join('.'),
      message: issue.message,
      code: issue.code,
    }));
  } else if (err.name === 'PrismaClientKnownRequestError') {
    const prismaError = err;

    switch (prismaError.code) {
      case 'P2002':
        statusCode = 409;
        errorResponse.status = 'fail';
        const key = Object.keys(prismaError.meta?.target || [])[0] || 'unknown';
        errorResponse.message = `Duplicate value: ${key} must be unique`;
        errorResponse.errors = [
          {
            field: key,
            message: `${key} must be unique`,
          },
        ];
        break;

      case 'P2025':
        statusCode = 404;
        errorResponse.status = 'fail';
        errorResponse.message = 'Resource not found';
        errorResponse.errors = [
          {
            field: 'id',
            message: 'The requested resource does not exist',
          },
        ];
        break;

      case 'P2003':
      case 'P2014':
        statusCode = 400;
        errorResponse.status = 'fail';
        errorResponse.message = `Invalid reference: ${prismaError.meta?.target?.join(', ') || 'related record'}`;
        errorResponse.errors = [
          {
            field: prismaError.meta?.target?.[0] || 'relation',
            message: 'Referenced record does not exist',
          },
        ];
        break;

      case 'P2004':
      case 'P2006':
      case 'P2015':
        statusCode = 400;
        errorResponse.status = 'fail';
        errorResponse.message = 'Validation failed';
        errorResponse.errors = [
          {
            field: prismaError.meta?.field_name || 'unknown',
            message: prismaError.message,
          },
        ];
        break;

      default:
        statusCode = 400;
        errorResponse.message = prismaError.message;
        errorResponse.errors = [
          {
            field: 'database',
            message: prismaError.message,
          },
        ];
    }
  } else if (err.name === 'PrismaClientInitializationError') {
    statusCode = 500;
    errorResponse.message = 'Prisma client failed to initialize';
    errorResponse.errors = [{ field: 'prisma', message: err.message }];
  } else if (err.name === 'PrismaClientRustPanicError') {
    statusCode = 500;
    errorResponse.message = 'Internal database error (Prisma Rust panic)';
    errorResponse.errors = [
      { field: 'prisma', message: 'Please contact support.' },
    ];
  } else if (err?.name === 'ValidationError') {
    statusCode = 400;
    errorResponse.status = 'fail';
    errorResponse.message = 'Validation failed';
    errorResponse.errors = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }));
  } else if (err?.name === 'CastError') {
    statusCode = 400;
    errorResponse.message = `Invalid ${err.path}: ${err.value}`;
    errorResponse.errors = [{ field: err.path, message: 'Invalid ID format' }];
  } else if (err?.code === 11000) {
    const key = Object.keys(err.keyValue || {})[0];
    statusCode = 409;
    errorResponse.status = 'fail';
    errorResponse.message = key
      ? `Duplicate value: ${key} must be unique`
      : 'Duplicate key error';
    errorResponse.errors = key
      ? [{ field: key, message: `${key} must be unique` }]
      : [{ field: 'unknown', message: 'Duplicate field value entered' }];
  } else if (
    err instanceof SyntaxError &&
    err.status === 400 &&
    'body' in err
  ) {
    statusCode = 400;
    errorResponse.status = 'fail';
    errorResponse.message = 'Invalid JSON payload';
  } else if (err instanceof Error) {
    errorResponse.message = err.message;
  }

  errorResponse.code = statusCode;

  if (!errorResponse.status) {
    errorResponse.status = statusCode >= 500 ? 'error' : 'fail';
  }

  if (process.env.NODE_ENV === 'development' && err.stack) {
    errorResponse.stack = err.stack;
  }

  console.error(
    `[${new Date().toISOString()}] ${statusCode} - ${req.method} ${req.originalUrl}`,
    {
      message: errorResponse.message,
      code: statusCode,
      path: req.originalUrl,
      method: req.method,
      errors: errorResponse.errors,
      stack: errorResponse.stack,
    }
  );

  res.status(statusCode).json(errorResponse);
};
