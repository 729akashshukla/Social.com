import { generateOTP, sendOTPEmail } from '../utils/otp';
import User from '../models/User.js';
import logger from '../helpers/logger.js';
import ApiError from '../helpers/errors/ApiError.js';
import { asyncHandler } from '../helpers/async/asyncHandler.js';
import speakeasy from 'speakeasy';
import twilio from 'twilio';


const twilioClient = twilio(process.env.TWILIO_SID, process.env.TWILIO_TOKEN);

// Regular Registration
export const startRegistration = async (req, res) => {
  try {
    const { email } = req.body;
    const otp = generateOTP();
    
    // Save OTP to user (pre-registration)
    await User.findOneAndUpdate(
      { email },
      { otp, otpExpires: Date.now() + 600000 },
      { upsert: true, new: true }
    );

    await sendOTPEmail(email, otp);
    res.json({ message: 'OTP sent successfully' });
  } catch (error) {
    logger.error('User creation failed', {
        error: error.message,
        stack: error.stack,
        inputData: req.body
      });
    res.status(400).json({ error: error.message });
  }
};
export const completeRegistration = async (req, res) => {
  try {
    const { otp, ...userData } = req.body;
    
    const user = await User.findOne({
      email: userData.email,
      otp,
      otpExpires: { $gt: Date.now() }
    });

    if (!user) throw new Error('Invalid or expired OTP');

    const newUser = await User.create({
      ...userData,
      verified: true,
      otp: undefined,
      otpExpires: undefined
    });

    res.status(201).json(newUser);
  } catch (error) {
    logger.error('complete resgistration failed', {
        error: error.message,
        stack: error.stack,
        inputData: req.body
      });
    res.status(400).json({ error: error.message });
  }
};
// Google OAuth Completion
export const completeGoogleRegistration = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { ...req.body, registrationComplete: true },
      { new: true }
    );
    res.json(user);
  } catch (error) {
    logger.error('complete Google registration failed', {
        error: error.message,
        stack: error.stack,
        inputData: req.body
      });
    res.status(400).json({ error: error.message });
  }
};
// Common login handler
const handleLogin = (user) => {
    if (user.failedLoginAttempts >= 5 && new Date() < user.accountLockedUntil) {
      throw new ApiError(403, 'Account temporarily locked');
    }
  
    const token = generateJWT(user);
    return {
      user: user.toProfileJSON(),
      token
    };
  };
  // Password-based login
  export const passwordLogin = asyncHandler(async (req, res) => {
    const { identifier, password } = req.body;
    
    const user = await User.findOne({
      $or: [{ email: identifier }, { username: identifier }]
    });
  
    if (!user || !(await user.comparePassword(password))) {
      await User.findByIdAndUpdate(user?._id, {
        $inc: { failedLoginAttempts: 1 },
        accountLockedUntil: Date.now() + 15*60*1000 // 15 min lock
      });
      throw new ApiError(401, 'Invalid credentials');
    }
  
    const result = handleLogin(user);
    res.json(result);
  });
  // OTP Request
  export const requestOTP = asyncHandler(async (req, res) => {
    const { email, phone } = req.body;
    const otp = speakeasy.totp({ secret: process.env.OTP_SECRET, digits: 6 });
    
    const updateData = {
      loginOTP: await bcrypt.hash(otp, 10),
      otpExpires: Date.now() + 10*60*1000, // 10 minutes
      otpMethod: email ? 'email' : 'sms'
    };
  
    const user = await User.findOneAndUpdate(
      { [email ? 'email' : 'phone']: email || phone },
      updateData,
      { new: true }
    );
  
    if (!user) throw new ApiError(404, 'User not found');
  
    // Send OTP
    if (email) {
      await sendEmailOTP(email, otp);
    } else {
      await sendSMSOTP(phone, otp);
    }
  
    res.json({ message: 'OTP sent successfully' });
  });
  // OTP Verification
  export const verifyOTP = asyncHandler(async (req, res) => {
    const { email, phone, otp } = req.body;
    const user = await User.findOne(email ? { email } : { phone });
    
    if (!user || !user.loginOTP) throw new ApiError(404, 'Invalid request');
    if (Date.now() > user.otpExpires) throw new ApiError(401, 'OTP expired');
  
    const isValid = await bcrypt.compare(otp, user.loginOTP);
    if (!isValid) throw new ApiError(401, 'Invalid OTP');
  
    const result = handleLogin(user);
    
    // Reset OTP fields
    user.loginOTP = undefined;
    user.otpExpires = undefined;
    await user.save();
  
    res.json(result);
  });

  export const requestPasswordReset = asyncHandler(async (req, res) => {
    const { email, phone } = req.body;
    const user = await User.findOne({ $or: [{ email }, { phone }] });
    
    if (!user) throw new ApiError(404, 'User not found');
    
    const otp = generateOTP();
    const resetMethod = email ? 'email' : 'sms';
    
    user.resetPasswordOTP = await bcrypt.hash(otp, 10);
    user.resetPasswordExpires = Date.now() + 15*60*1000; // 15 minutes
    user.resetMethod = resetMethod;
    await user.save();
  
    if (email) {
      await sendPasswordResetEmail(email, otp);
    } else {
      await sendPasswordResetSMS(phone, otp);
    }
  
    res.json({ message: 'OTP sent successfully' });
  });
  
  export const resetPassword = asyncHandler(async (req, res) => {
    const { email, phone, otp, newPassword } = req.body;
    const user = await User.findOne({
      $or: [{ email }, { phone }],
      resetPasswordExpires: { $gt: Date.now() }
    });
  
    if (!user || !(await bcrypt.compare(otp, user.resetPasswordOTP))) {
      throw new ApiError(401, 'Invalid or expired OTP');
    }
  
    user.password = newPassword;
    user.resetPasswordOTP = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();
  
    res.json({ message: 'Password reset successful' });
  });