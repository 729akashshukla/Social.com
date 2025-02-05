export const checkProfileVisibility = (req, res, next) => {
    if(!req.user.isPublic && !req.user.equals(req.params.userId)) {
      throw new ApiError(403, 'This profile is private');
    }
    next();
  };