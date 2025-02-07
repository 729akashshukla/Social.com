import express from 'express';
import { asyncHandler } from '../helpers/asyncHandler.js';
import { passwordResetLimiter } from '../middlewares/rateLimit.js';
import {
  registerUser,
  loginWithPassword,
  requestOTP,
  requestPasswordReset,
  resetPassword,
  googleAuth,
  googleAuthCallback,
  logoutUser,
  verifyUserOTP
} from '../controllers/authController.js';

const router = express.Router();


router.post('/register', asyncHandler(registerUser));
router.post('/login/password', asyncHandler(loginWithPassword));
router.post('/login/otp-request', asyncHandler(requestOTP));
router.post('/login/otp-verify', asyncHandler(verifyUserOTP));
router.post('/forgot-password', passwordResetLimiter, asyncHandler(requestPasswordReset));
router.post('/reset-password', asyncHandler(resetPassword));
router.get('/google', asyncHandler(googleAuth));
router.get('/google/callback', asyncHandler(googleAuthCallback));
router.post('/logout', asyncHandler(logoutUser));

export default router;