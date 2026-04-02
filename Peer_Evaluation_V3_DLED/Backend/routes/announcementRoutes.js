import express from 'express';
import { protect, adminOrTeacherOnly } from '../middleware/authMiddleware.js';
import {
  getActiveAnnouncement,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  getAllAnnouncements,
} from '../controllers/announcementController.js';

const router = express.Router();

router.get('/active', getActiveAnnouncement);
router.get('/', protect, adminOrTeacherOnly, getAllAnnouncements);
router.post('/', protect, adminOrTeacherOnly, createAnnouncement);
router.put('/:id', protect, adminOrTeacherOnly, updateAnnouncement);
router.delete('/:id', protect, adminOrTeacherOnly, deleteAnnouncement);

export default router;
