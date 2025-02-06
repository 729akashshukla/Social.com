import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import  User  from '../models/User.js';
import { OTPManager } from '../utils/otpGenerator.js';
import { sendEmailOTP } from '../services/emailService.js';
import { sendSMS } from '../services/smsService.js';
import { asyncHandler } from '../helpers/asyncHandler.js';
import ApiError from '../helpers/errors/ApiError.js';


export const registerUser = asyncHandler(async (req, res) => {
  const { email, password, phone, firstName } = req.body;
  
  
  const existingUser = await User.findOne({ $or: [{ email }, { phone }] });
  if (existingUser) throw new ApiError(400, 'User already exists');


  const hashedPassword = await bcrypt.hash(password, 12);


  const user = await User.create({
    email,
    password: hashedPassword,
    phone,
    firstName,
    authMethod: 'email'
  });

  
  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
    expiresIn: '7d'
  });

  res.status(201).json({ user: user.toProfileJSON(), token });
});


export const loginWithPassword = asyncHandler(async (req, res) => {
  const { identifier, password } = req.body;
  
  const user = await User.findOne({
    $or: [{ email: identifier }, { username: identifier }]
  }).select('+password');

  if (!user || !(await bcrypt.compare(password, user.password))) {
    throw new ApiError(401, 'Invalid credentials');
  }

  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);
  res.json({ user: user.toProfileJSON(), token });
});


export const requestOTP = asyncHandler(async (req, res) => {
  const { email, phone } = req.body;
  const user = await User.findOne({ $or: [{ email }, { phone }] });
  
  if (!user) throw new ApiError(404, 'User not found');
  
  const otp = OTPManager.generateOTP(email || phone);
  user.otp = await bcrypt.hash(otp, 10);
  user.otpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
  await user.save();

  if (email) {
    await sendEmailOTP(email, otp);
  } else {
    await sendSMS(phone, otp);
  }

  res.json({ message: 'OTP sent successfully' });
});


export const verifyUserOTP = asyncHandler(async (req, res) => {
  const { email, phone, otp } = req.body;
  const user = await User.findOne({ $or: [{ email }, { phone }] });
  
  if (!user || !user.otp || !(await bcrypt.compare(otp, user.otp))) {
    throw new ApiError(401, 'Invalid OTP');
  }

  if (Date.now() > user.otpExpires) {
    throw new ApiError(401, 'OTP expired');
  }

  user.otp = undefined;
  user.otpExpires = undefined;
  await user.save();

  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);
  res.json({ user: user.toProfileJSON(), token });
});


export const requestPasswordReset = asyncHandler(async (req, res) => {
  const { email, phone } = req.body;
  const user = await User.findOne({ $or: [{ email }, { phone }] });
  
  if (!user) throw new ApiError(404, 'User not found');
  
  const resetToken = jwt.sign(
    { userId: user._id }, 
    process.env.JWT_RESET_SECRET,
    { expiresIn: '15m' }
  );

  if (email) {
    await sendPasswordResetEmail(email, resetToken);
  } else {
    await sendPasswordResetSMS(phone, resetToken);
  }

  res.json({ message: 'Reset instructions sent' });
});

export const resetPassword = asyncHandler(async (req, res) => {
  const { token, newPassword } = req.body;
  
  const decoded = jwt.verify(token, process.env.JWT_RESET_SECRET);
  const user = await User.findById(decoded.userId);
  
  if (!user) throw new ApiError(404, 'Invalid token');
  
  user.password = await bcrypt.hash(newPassword, 12);
  await user.save();
  
  res.json({ message: 'Password updated successfully' });
});


export const googleAuth = passport.authenticate('google', {
  scope: ['profile', 'email'],
  session: false 
});

export const googleAuthCallback = asyncHandler(async (req, res, next) => {
  passport.authenticate('google', async (err, user, info) => {
    try {
      if (err || !user) {
        throw new ApiError(401, 'Google authentication failed');
      }

     
      const existingUser = await User.findOneAndUpdate(
        { googleId: user.googleId },
        {
          $set: {
            email: user.email,
            avatar: user.avatar,
            lastName: user.lastName,
            firstName: user.firstName
          }
        },
        { new: true, upsert: true }
      );

      // Generate JWT token
      const token = jwt.sign(
        { userId: existingUser._id }, 
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      // Redirect to frontend with token
      const redirectUrl = `${process.env.CLIENT_URL}/auth/google/callback?token=${token}&userId=${existingUser._id}`;
      res.redirect(redirectUrl);

    } catch (error) {
      next(error);
    }
  })(req, res, next);
});