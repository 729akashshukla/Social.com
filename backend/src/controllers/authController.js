import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import passport from 'passport';
import { OTPManager } from '../utils/otpGenerator.js';
import { sendEmailOTP } from '../services/emailService.js';
import { sendSMS } from '../services/smsService.js';
import { asyncHandler } from '../helpers/asyncHandler.js';
import ApiError from '../helpers/errors/ApiError.js';
import { logger } from '../helpers/logger.js';

/**
 * @swagger
 * /register:
 *   post:
 *     summary: Register a new user
 *     description: Creates a new user and returns a JWT token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               phone:
 *                 type: string
 *               firstName:
 *                 type: string
 *     responses:
 *       201:
 *         description: User successfully registered
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   type: object
 *                 token:
 *                   type: string
 *       400:
 *         description: User already exists
 *       500:
 *         description: Internal Server Error
 */
export const registerUser = asyncHandler(async (req, res) => {
  try {
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
  } catch (error) {
    logger.error('Error during user registration: ' + error.message);
    res.status(500).send('Internal Server Error');
  }
});

/**
 * @swagger
 * /login:
 *   post:
 *     summary: Log in a user with email/username and password
 *     description: Logs in a user and returns a JWT token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               identifier:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: User successfully logged in
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   type: object
 *                 token:
 *                   type: string
 *       401:
 *         description: Invalid credentials
 *       500:
 *         description: Internal Server Error
 */
export const loginWithPassword = asyncHandler(async (req, res) => {
  try {
    const { identifier, password } = req.body;

    const user = await User.findOne({
      $or: [{ email: identifier }, { username: identifier }]
    }).select('+password');

    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new ApiError(401, 'Invalid credentials');
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);
    res.json({ user: user.toProfileJSON(), token });
  } catch (error) {
    logger.error('Error during login: ' + error.message);
    res.status(500).send('Internal Server Error');
  }
});

/**
 * @swagger
 * /otp-request:
 *   post:
 *     summary: Request an OTP for user verification
 *     description: Sends an OTP to email or phone for verification
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               phone:
 *                 type: string
 *     responses:
 *       200:
 *         description: OTP sent successfully
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal Server Error
 */
export const requestOTP = asyncHandler(async (req, res) => {
  try {
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
  } catch (error) {
    logger.error('Error during OTP request: ' + error.message);
    res.status(500).send('Internal Server Error');
  }
});

/**
 * @swagger
 * /verify-otp:
 *   post:
 *     summary: Verify OTP for user
 *     description: Verifies OTP for email or phone and returns a JWT token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               phone:
 *                 type: string
 *               otp:
 *                 type: string
 *     responses:
 *       200:
 *         description: OTP verified successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   type: object
 *                 token:
 *                   type: string
 *       401:
 *         description: Invalid OTP
 *       500:
 *         description: Internal Server Error
 */
export const verifyUserOTP = asyncHandler(async (req, res) => {
  try {
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
  } catch (error) {
    logger.error('Error during OTP verification: ' + error.message);
    res.status(500).send('Internal Server Error');
  }
});

// Continue similarly for other routes like resetPassword, googleAuth, etc.

export const requestPasswordReset = asyncHandler(async (req, res) => {
  try {
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
  } catch (error) {
    logger.error('Error during password reset request: ' + error.message);
    res.status(500).send('Internal Server Error');
  }
});

export const resetPassword = asyncHandler(async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    const decoded = jwt.verify(token, process.env.JWT_RESET_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user) throw new ApiError(404, 'Invalid token');

    user.password = await bcrypt.hash(newPassword, 12);
    await user.save();

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    logger.error('Error during password reset: ' + error.message);
    res.status(500).send('Internal Server Error');
  }
});

export const googleAuth = passport.authenticate('google', {
  scope: ['profile', 'email'],
  session: false 
});

export const googleAuthCallback = asyncHandler(async (req, res, next) => {
  try {
    passport.authenticate('google', async (err, user, info) => {
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

      const token = jwt.sign(
        { userId: existingUser._id }, 
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      const redirectUrl = `${process.env.CLIENT_URL}/auth/google/callback?token=${token}&userId=${existingUser._id}`;
      res.redirect(redirectUrl);
    })(req, res, next);
  } catch (error) {
    logger.error('Error during Google authentication callback: ' + error.message);
    next(error);
  }
});

export const logoutUser = (req, res) => {
  try {
    req.logout((err) => {
      if (err) return res.status(500).json({ message: "Logout failed" });
      req.session.destroy();
      res.status(200).json({ message: "Logged out successfully" });
    });
  } catch (error) {
    logger.error('Error during logout: ' + error.message);
    res.status(500).json({ message: 'Logout failed' });
  }
};
