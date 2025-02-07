import User from '../models/User.js';
import { asyncHandler } from '../helpers/asyncHandler.js';
import ApiError from '../helpers/errors/ApiError.js';
import uploadToCloudinary from '../config/cloudinary.js';
import { sendEmailOTP } from '../services/emailService.js';
import { avatarUpload } from '../helpers/uploads/fileUpload.js';
import crypto from 'crypto';
import { logger } from '../helpers/logger.js'; // Importing the logger

export const updateProfile = asyncHandler(async (req, res) => {
  try {
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
  } catch (error) {
    logger.error('Error during profile update: ' + error.message);
    res.status(500).send('Internal Server Error');
  }
});

export const updateAvatar = asyncHandler(async (req, res) => {
  try {
    if (!req.file) throw new ApiError(400, 'No file uploaded');
    
    const result = await uploadToCloudinary(req.file.path);
    
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { avatar: result.secure_url },
      { new: true }
    );

    res.json({ avatar: user.avatar });
  } catch (error) {
    logger.error('Error during avatar update: ' + error.message);
    res.status(500).send('Internal Server Error');
  }
});

export const updatePrivacy = asyncHandler(async (req, res) => {
  try {
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
  } catch (error) {
    logger.error('Error during privacy update: ' + error.message);
    res.status(500).send('Internal Server Error');
  }
});

export const updateTheme = asyncHandler(async (req, res) => {
  try {
    const { theme } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { themePreference: theme },
      { new: true }
    );

    res.json({ theme: user.themePreference });
  } catch (error) {
    logger.error('Error during theme update: ' + error.message);
    res.status(500).send('Internal Server Error');
  }
});

// const otpStore = new Map();

export const requestPasswordResetOTP = asyncHandler(async (req, res) => {
  try {
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
  } catch (error) {
    logger.error('Error during password reset OTP request: ' + error.message);
    res.status(500).send('Internal Server Error');
  }
});

export const updatePassword = asyncHandler(async (req, res) => {
  try {
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
  } catch (error) {
    logger.error('Error during password update: ' + error.message);
    res.status(500).send('Internal Server Error');
  }
});

export const getProfile = asyncHandler(async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) throw new ApiError(404, 'User not found');

    const profile = {
      // Basic Info
      ...user.toProfileJSON(),
      
      // Privacy Settings
      privacy: {
        isPublic: user.isPublic,
        isAnonymous: user.isAnonymous
      },
      
      // Theme Preference
      theme: user.themePreference,
      
      // Avatar
      avatar: user.avatar,
      
      // Additional Info
      firstName: user.firstName,
      lastName: user.lastName,
      bio: user.bio,
      email: user.email,
      
      // Editable Fields
      editableFields: {
        profile: ['firstName', 'lastName', 'bio'],
        settings: ['isPublic', 'isAnonymous', 'themePreference'],
        security: ['password']
      }
    };

    res.json(profile);
  } catch (error) {
    logger.error('Error during fetching profile: ' + error.message);
    res.status(500).send('Internal Server Error');
  }
});

export const uploadAvatar = asyncHandler(async (req, res) => {
  try {
    if (!req.file) {
      throw new ApiError(400, 'No avatar file provided');
    }

    // Delete old avatar if exists
    if (req.user.avatarPublicId) {
      await cloudinary.uploader.destroy(req.user.avatarPublicId);
    }

    // Update user profile
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      {
        avatarUrl: req.file.path,
        avatarPublicId: req.file.filename
      },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: 'Avatar uploaded successfully',
      data: {
        avatarUrl: updatedUser.avatarUrl
      }
    });
  } catch (error) {
    logger.error('Error during avatar upload: ' + error.message);
    res.status(500).send('Internal Server Error');
  }
});

export const uploadImages = asyncHandler(async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      throw new ApiError(400, 'No images provided');
    }

    const uploadedUrls = req.files.map(file => ({
      url: file.path,
      publicId: file.filename
    }));

    res.status(200).json({
      success: true,
      message: 'Images uploaded successfully',
      data: {
        images: uploadedUrls
      }
    });
  } catch (error) {
    logger.error('Error during image upload: ' + error.message);
    res.status(500).send('Internal Server Error');
  }
});
