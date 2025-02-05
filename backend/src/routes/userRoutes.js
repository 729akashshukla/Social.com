import { updateAvatar } from '../controllers/avatarController.js';
import { uploadAvatar } from '../middlewares/upload.js';

router.patch('/avatar', authMiddleware, uploadAvatar, updateAvatar);