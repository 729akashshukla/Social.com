import express from 'express';
import { asyncHandler } from '../helpers/asyncHandler.js';
import {  verifyToken } from '../middlewares/auth.js';
import { getStreak, updateStreak } from '../controllers/streakController.js';

const router = express.Router();

router.use(verifyToken);

router.get('/', asyncHandler(getStreak));
router.patch('/', asyncHandler(updateStreak));

export default router;