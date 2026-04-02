import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import avatarUpload from '../utils/avatarUpload.js';
import { uploadAvatar } from '../controllers/userController.js';

const router = express.Router();

router.post('/avatar', protect, avatarUpload.single('avatar'), uploadAvatar);

export default router;
