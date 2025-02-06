import { User } from '../models/User.js';
import { asyncHandler } from '../helpers/asyncHandler.js';
import ApiError from '../helpers/errors/ApiError.js';
import { uploadToCloudinary } from '../config/cloudinary.js';

export const updateProfile = asyncHandler(async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ['firstName', 'lastName', 'bio'];
  const isValidUpdate = updates.every(update => allowedUpdates.includes(update));

  if (!isValidUpdate) throw new ApiError(400, 'Invalid updates');

  const user = await User.findByIdAndUpdate(
    req.user._id,
    req.body,
    { new: true, runValidators: true }
  );

  res.json(user.toProfileJSON());
});

export const updateAvatar = asyncHandler(async (req, res) => {
  if (!req.file) throw new ApiError(400, 'No file uploaded');
  
  const result = await uploadToCloudinary(req.file.path);
  
  const user = await User.findByIdAndUpdate(
    req.user._id,
    { avatar: result.secure_url },
    { new: true }
  );

  res.json({ avatar: user.avatar });
});

export const updatePrivacy = asyncHandler(async (req, res) => {
  const { isPublic, isAnonymous } = req.body;
  
  const user = await User.findByIdAndUpdate(
    req.user._id,
    { isPublic, isAnonymous },
    { new: true }
  );

  res.json({
    isPublic: user.isPublic,
    isAnonymous: user.isAnonymous
  });
});

export const updateTheme = asyncHandler(async (req, res) => {
  const { theme } = req.body;
  
  const user = await User.findByIdAndUpdate(
    req.user._id,
    { themePreference: theme },
    { new: true }
  );

  res.json({ theme: user.themePreference });
});