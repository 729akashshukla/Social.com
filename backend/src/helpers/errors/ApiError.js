 class ApiError extends Error {
  constructor(statusCode, message, errors = []) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    this.success = false;
    this.stack = Error.captureStackTrace(this, this.constructor);
  }

  static BadRequest(message = 'Bad Request', errors = []) {
    return new ApiError(400, message, errors);
  }

  static Unauthorized(message = 'Unauthorized', errors = []) {
    return new ApiError(401, message, errors);
  }

  static Forbidden(message = 'Forbidden', errors = []) {
    return new ApiError(403, message, errors);
  }

  static NotFound(message = 'Resource not found', errors = []) {
    return new ApiError(404, message, errors);
  }

  static TooManyRequests(message = 'Too many requests', errors = []) {
    return new ApiError(429, message, errors);
  }

  static Internal(message = 'Internal server error', errors = []) {
    return new ApiError(500, message, errors);
  }
}

export default ApiError;

