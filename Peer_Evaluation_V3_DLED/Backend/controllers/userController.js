import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Jimp from 'jimp';
import { User } from '../models/User.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Resize to 200x200
    const image = await Jimp.read(req.file.path);
    await image.resize(200, 200).writeAsync(req.file.path);

    const relativePath = '/uploads/avatars/' + req.file.filename;

    // Delete old avatar if exists
    const user = await User.findById(req.user._id);
    if (user.profilePicture) {
      const oldPath = path.join(__dirname, '..', user.profilePicture);
      fs.unlink(oldPath, () => {});
    }

    user.profilePicture = relativePath;
    await user.save();

    res.status(200).json({ profilePicture: relativePath });
  } catch (error) {
    res.status(500).json({ message: 'Avatar upload failed', error: error.message });
  }
};
