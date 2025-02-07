import express from 'express';
import { asyncHandler } from '../helpers/asyncHandler.js';
import { checkRole } from '../middlewares/rbac.js';
import { avatarUpload, imageUpload } from '../helpers/uploads/fileUpload.js';
import { uploadAvatar,uploadImages } from '../controllers/userController.js';
import {
  updateProfile,
  updatePassword,
  updatePrivacy,
  updateTheme,
  getProfile,
} from '../controllers/userController.js';
import { verifyToken } from '../middlewares/auth.js';
import { isAdmin } from '../middlewares/rbac.js';
import { apiLimiter } from '../middlewares/rateLimit.js';
import { checkProfileAccess } from '../middlewares/privacy.js';
import { loginWithPassword } from '../controllers/authController.js';

const router = express.Router();

router.use(verifyToken);

router.get('/profile/:userId', checkProfileAccess, getProfile);
router.post('/login', loginWithPassword);
router.get('/admin/users', checkRole(['admin']), asyncHandler(getProfile));
router.get('/profile', asyncHandler(getProfile)); 
router.patch('/profile/updateProfile/:userId', asyncHandler(updateProfile));
router.patch('/password/updatePassword/:userId', asyncHandler(updatePassword));
router.post('/profile/avatar/:userId',avatarUpload.single('avatar'), uploadAvatar);
router.post('/profile/images/:userId', imageUpload.array('images', 4), uploadImages);
router.patch('/privacy/:userId', asyncHandler(updatePrivacy));
router.patch('/theme/:userId', asyncHandler(updateTheme));

export default router;
