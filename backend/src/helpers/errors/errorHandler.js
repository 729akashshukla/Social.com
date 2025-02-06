import  ApiError  from './ApiError.js';
import { logger } from '../logger.js';

const errorTypes = {
  CastError: {
    message: 'Invalid resource ID',
    statusCode: 400
  },
  ValidationError: {
    message: 'Validation failed',
    statusCode: 400
  },
  JsonWebTokenError: {
    message: 'Invalid token',
    statusCode: 401
  },
  TokenExpiredError: {
    message: 'Token expired',
    statusCode: 401
  }
};

export const errorHandler = (err, req, res, next) => {
  logger.error({
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method
  });

  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      errors: err.errors,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }

  const knownError = errorTypes[err.name];
  if (knownError) {
    return res.status(knownError.statusCode).json({
      success: false,
      message: knownError.message,
      errors: [err.message],
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }

  return res.status(500).json({
    success: false,
    message: 'Internal server error',
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
};