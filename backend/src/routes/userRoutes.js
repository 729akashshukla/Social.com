import express from 'express';
import { asyncHandler } from '../helpers/asyncHandler.js';
import { checkRole } from '../middlewares/rbac.js';

import {
 
  updateProfile,
  updatePassword,
  updateAvatar,
  updatePrivacy,
  updateTheme,

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
router.patch('/profile', asyncHandler(updateProfile));
router.patch('/password', asyncHandler(updatePassword));
router.patch('/avatar', uploadAvatar, asyncHandler(updateAvatar));
router.patch('/privacy', asyncHandler(updatePrivacy ));
router.patch('/theme', asyncHandler(updateTheme));
router.get('/admin/users', checkRole(['admin']), asyncHandler(getAllUsers));

export default router;