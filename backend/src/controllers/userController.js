import  User  from '../models/User.js';
import { asyncHandler } from '../helpers/asyncHandler.js';
import ApiError from '../helpers/errors/ApiError.js';
import  uploadToCloudinary  from '../config/cloudinary.js';
import { sendEmailOTP} from '../services/emailService.js';
import crypto from 'crypto';

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


const otpStore = new Map();

export const requestPasswordResetOTP = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  if (!user) throw new ApiError(404, 'User not found');

  // Generate 6-digit OTP
  const otp = crypto.randomInt(100000, 999999).toString();
  
  // Store OTP with user context
  otpStore.set(email, {
    otp,
    userId: user._id,
    expiresAt: Date.now() + 15 * 60 * 1000 // 15 minutes
  });

  // Send OTP email using existing email service
  await sendEmailOTP({
    to: email,
    template: 'passwordResetOTP',
    data: {
      username: user.firstName,
      otp
    }
  });

  res.json({ message: 'OTP sent to your email' });
});

export const updatePassword = asyncHandler(async (req, res) => {
  const { email, otp, newPassword } = req.body;

  
  const storedOtp = otpStore.get(email);
  if (!storedOtp) throw new ApiError(400, 'No OTP request found');
  
  const isOtpValid = 
    storedOtp.otp === otp && 
    storedOtp.expiresAt > Date.now();

  if (!isOtpValid) throw new ApiError(400, 'Invalid or expired OTP');

  
  const user = await User.findById(storedOtp.userId);
  if (!user) throw new ApiError(404, 'User not found');

  user.password = newPassword;
  await user.save();

 
  otpStore.delete(email);

  res.json({ message: 'Password updated successfully' });
});