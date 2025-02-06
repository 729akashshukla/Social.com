import  User  from '../models/User.js';
import { asyncHandler } from '../helpers/asyncHandler.js';
import ApiError from '../helpers/errors/ApiError.js';

export const updateStreak = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    throw ApiError.unauthorized('User not found');
  }

  const lastActive = user.lastActive || new Date(0);
  const daysSince = Math.floor((Date.now() - lastActive) / (1000 * 3600 * 24));

  if (daysSince === 1) {
    user.streak += 1;
  } else if (daysSince > 1) {
    user.streak = 1;
  }

  user.lastActive = new Date();

  if (user.streak >= 7 && !user.badges.includes('7-day-streak')) {
    user.badges.push('7-day-streak');
  }

  await user.save();
  res.json({ streak: user.streak, badges: user.badges });
});

export const getStreak = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    throw ApiError.unauthorized('User not found');
  }

  res.json({ streak: user.streak, badges: user.badges });
});