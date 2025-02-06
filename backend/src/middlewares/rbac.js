import ApiError  from '../helpers/errors/ApiError.js';
import { asyncHandler } from '../helpers/asyncHandler.js';

export const ROLES = {
  ADMIN: 'admin',
  MODERATOR: 'moderator',
  USER: 'user'
} ;

export const checkRole = (...allowedRoles) => {
  return asyncHandler(async (req, res, next) => {
    if (!req.user) {
      throw new ApiError(401, 'User not authenticated');
    }

    if (!allowedRoles.includes(req.user.role)) {
      throw new ApiError(403, 'Insufficient permissions');
    }

    next();
  });
};

export const isAdmin = checkRole(ROLES.ADMIN);
export const isModerator = checkRole(ROLES.ADMIN, ROLES.MODERATOR);
