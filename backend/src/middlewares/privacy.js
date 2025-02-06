import ApiError  from '../helpers/errors/ApiError.js';
import { asyncHandler } from '../helpers/asyncHandler.js';
import  User  from '../models/User.js';
import Status from '../models/Status.js';


export const PRIVACY_LEVELS = {
  PUBLIC: 'public',
  FRIENDS: 'friends',
  PRIVATE: 'private'
} ;

export const checkProfileVisibility = asyncHandler(async (req, res, next) => {
  const targetUser = await User.findById(req.params.userId);
  
  if (!targetUser) {
    throw new ApiError(404, 'User not found');
  }

 
  if (targetUser.privacySettings.profileVisibility === PRIVACY_LEVELS.PUBLIC) {
    return next();
  }

 
  if (!req.user) {
    throw new ApiError(401, 'Authentication required to view this profile');
  }

  
  if (req.user.id === req.params.userId) {
    return next();
  }

 
  if (targetUser.privacySettings.profileVisibility === PRIVACY_LEVELS.FRIENDS) {
    const isFriend = targetUser.friends.includes(req.user.id);
    if (!isFriend) {
      throw new ApiError(403, 'This profile is only visible to friends');
    }
    return next();
  }

 
  if (targetUser.privacySettings.profileVisibility === PRIVACY_LEVELS.PRIVATE) {
    throw new ApiError(403, 'This profile is private');
  }

  next();
});

export const checkStatusVisibility = asyncHandler(async (req, res, next) => {
  const status = await Status.findById(req.params.statusId);
  
  if (!status) {
    throw new ApiError(404, 'Status not found');
  }

  const statusOwner = await User.findById(status.userId);

  if (!statusOwner) {
    throw new ApiError(404, 'Status owner not found');
  }

  
  if (status.visibility === PRIVACY_LEVELS.PUBLIC) {
    return next();
  }

  if (!req.user) {
    throw new ApiError(401, 'Authentication required to view this status');
  }

  if (req.user.id === status.userId) {
    return next();
  }

  if (status.visibility === PRIVACY_LEVELS.FRIENDS && 
      statusOwner.friends.includes(req.user.id)) {
    return next();
  }

  throw new ApiError(403, 'You do not have permission to view this status');
});

export const checkProfileAccess = (user) => {
  
  if (!user) return { allowed: false, reason: 'No user data' };


  const { 
      isBanned = false, 
      role = 'user', 
      isActive = false 
  } = user;


  const privilegedRoles = ['admin', 'moderator'];

  if (isBanned) return { allowed: false, reason: 'Banned' };
  if (!isActive) return { allowed: false, reason: 'Inactive' };
  if (privilegedRoles.includes(role)) return { allowed: true, reason: 'Privileged' };

 
  return { allowed: true, reason: 'Standard access' };
};


const currentUser = { isBanned: false, role: 'user', isActive: true };
console.log(checkProfileAccess(currentUser))