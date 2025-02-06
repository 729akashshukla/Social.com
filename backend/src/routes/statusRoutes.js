import express from 'express';
import { asyncHandler } from '../helpers/asyncHandler.js';
import { authMiddleware } from '../middlewares/auth.js';
import { createStatus, getStatuses } from '../controllers/statusController.js';

const router = express.Router();


router.use(authMiddleware);

router.route('/')
  .post(asyncHandler(createStatus))
  .get(asyncHandler(getStatuses));

export default router;