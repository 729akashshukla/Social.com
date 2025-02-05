export const BadRequestError = class extends ApiError {
    constructor(message) {
      super(400, message);
    }
  };
  
  export const UnauthorizedError = class extends ApiError {
    constructor(message = 'Unauthorized') {
      super(401, message);
    }
  };
  
  export const ForbiddenError = class extends ApiError {
    constructor(message = 'Forbidden') {
      super(403, message);
    }
  };
  
  export const NotFoundError = class extends ApiError {
    constructor(message = 'Resource not found') {
      super(404, message);
    }
  };
  
  export const ConflictError = class extends ApiError {
    constructor(message = 'Conflict occurred') {
      super(409, message);
    }
  };
  
  export const ValidationError = class extends ApiError {
    constructor(message = 'Validation failed') {
      super(422, message);
    }
  };

export const InvalidFileError = class extends ApiError {
    constructor() {
      super(
        400,
        'Invalid file type. Only JPG, JPEG, and PNG images are allowed. ' +
        'Max size: 5MB'
      );
    }
  };