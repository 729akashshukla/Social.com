import express from 'express';
import { asyncHandler } from '../helpers/asyncHandler.js';
import { authMiddleware, checkRole } from '../middlewares/auth.js';

import {
  getUserProfile,
  updateUserProfile,
  updatePassword,
  updateAvatar,
  updatePrivacySettings,
  updateThemePreference,
  getAllUsers 
} from '../controllers/userController.js';
import { verifyToken } from '../middlewares/auth.js';
import { isAdmin }  from '../middlewares/rbac.js';
import { apiLimiter }  from '../middlewares/rateLimit.js';
import { checkProfileAccess } from '../middlewares/privacy.js';


const router = express.Router();


router.use(authMiddleware);


router.get('/profile/:userId', verifyToken, checkProfileAccess, userController.getProfile);
router.post('/login', loginLimiter, authController.login);
router.get('/admin/users', verifyToken, isAdmin, userController.getAllUsers);

router.get('/profile', asyncHandler(getUserProfile));
router.patch('/profile', asyncHandler(updateUserProfile));
router.patch('/password', asyncHandler(updatePassword));
router.patch('/avatar', uploadAvatar, asyncHandler(updateAvatar));
router.patch('/privacy', asyncHandler(updatePrivacySettings));
router.patch('/theme', asyncHandler(updateThemePreference));
router.get('/admin/users', checkRole(['admin']), asyncHandler(getAllUsers));

export default router;