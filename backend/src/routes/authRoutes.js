import express from 'express';
import  passwordResetLimiter  from '../utils/rateLimit';

 
const router = express.Router();
import {
    startRegistration,
    verifyOTP,
    completeRegistration,
    handleGoogleAuth
  } from '../controllers/authController';
  
  router.post('/register/start', startRegistration);
  router.post('/register/verify', verifyOTP);
  router.post('/register/complete', completeRegistration);
  router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
  router.get('/google/callback', handleGoogleAuth);
  router.post('/login/password', passwordLogin);
  router.post('/login/otp-request', requestOTP);
  router.post('/login/otp-verify', verifyOTP);
router.post('/reset-password', resetPassword);
router.post('/forgot-password', passwordResetLimiter, requestPasswordReset);