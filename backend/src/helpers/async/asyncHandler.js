export const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch((err) => {
      if (!err.statusCode) {
        console.error('Unhandled error:', err);
        err = new ApiError(500, 'Internal server error');
      }
      next(err);
    });
  };