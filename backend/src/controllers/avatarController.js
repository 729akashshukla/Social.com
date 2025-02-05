import User from '../models/User.js';
import { asyncHandler } from '../helpers/async/asyncHandler.js';
import ApiError from '../helpers/errors/ApiError.js';
import { verifyFileContentType } from '../helpers/uploads/fileValidation.js';

export const updateAvatar = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new ApiError(400, 'No file uploaded');
  }
  await verifyFileContentType(req.file.path);

  const user = await User.findByIdAndUpdate(
    req.user.id,
    { avatar: req.file.path },
    { new: true }
  );

  res.json({
    success: true,
    data: user.avatar
  });
});