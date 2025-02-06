import express from 'express';
import { asyncHandler } from '../helpers/asyncHandler.js';
import { authMiddleware } from '../middlewares/auth.js';
import { getStreak, updateStreak } from '../controllers/streakController.js';

const router = express.Router();

router.use(authMiddleware);

router.get('/', asyncHandler(getStreak));
router.patch('/', asyncHandler(updateStreak));

export default router;