import { uploadAvatar, handleUploadError } from '../helpers/uploads/avatarUpload.js';
import { asyncHandler } from '../helpers/async/asyncHandler.js';

router.patch(
  '/avatar',
  authMiddleware,
  uploadAvatar,
  handleUploadError,
  asyncHandler(updateAvatar)
);