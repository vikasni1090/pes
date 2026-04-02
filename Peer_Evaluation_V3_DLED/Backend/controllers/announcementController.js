import { Announcement } from '../models/Announcement.js';

export const getActiveAnnouncement = async (req, res) => {
  try {
    const announcement = await Announcement.findOne({ active: true }).sort({ createdAt: -1 });
    res.status(200).json(announcement || null);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch announcement' });
  }
};

export const createAnnouncement = async (req, res) => {
  try {
    const { message } = req.body;
    if (!message || !message.trim()) {
      return res.status(400).json({ message: 'Message is required' });
    }
    const announcement = await Announcement.create({
      message: message.trim(),
      active: true,
      createdBy: req.user._id,
    });
    res.status(201).json(announcement);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create announcement' });
  }
};

export const updateAnnouncement = async (req, res) => {
  try {
    const { message, active } = req.body;
    const announcement = await Announcement.findByIdAndUpdate(
      req.params.id,
      { ...(message !== undefined && { message }), ...(active !== undefined && { active }) },
      { new: true }
    );
    if (!announcement) return res.status(404).json({ message: 'Announcement not found' });
    res.status(200).json(announcement);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update announcement' });
  }
};

export const deleteAnnouncement = async (req, res) => {
  try {
    const announcement = await Announcement.findByIdAndDelete(req.params.id);
    if (!announcement) return res.status(404).json({ message: 'Announcement not found' });
    res.status(200).json({ message: 'Announcement deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete announcement' });
  }
};

export const getAllAnnouncements = async (req, res) => {
  try {
    const announcements = await Announcement.find().sort({ createdAt: -1 });
    res.status(200).json(announcements);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch announcements' });
  }
};
