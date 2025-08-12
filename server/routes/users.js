import express from 'express';
import User from '../models/User.js';
import Photo from '../models/Photo.js';
import { protect } from '../middleware/auth.js';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Configure Cloudinary (mock for demo)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'demo',
  api_key: process.env.CLOUDINARY_API_KEY || 'demo',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'demo'
});

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', protect, upload.single('profilePicture'), async (req, res) => {
  try {
    const { name, bio } = req.body;
    const user = await User.findById(req.user.id);

    if (name) user.name = name;
    if (bio !== undefined) user.bio = bio;

    if (req.file) {
      // Convert uploaded file to base64 data URL for demo
      const imageBuffer = req.file.buffer;
      const imageBase64 = `data:${req.file.mimetype};base64,${imageBuffer.toString('base64')}`;
      user.profilePicture = imageBase64;
    }

    await user.save();

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        college: user.college,
        profilePicture: user.profilePicture,
        bio: user.bio,
        score: user.score,
        followers: user.followers
      }
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating profile'
    });
  }
});

// @route   GET /api/users/:id
// @desc    Get user profile
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password -email');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const photos = await Photo.find({ user: user._id, isActive: true })
      .sort({ createdAt: -1 })
      .limit(20);

    res.json({
      success: true,
      user: {
        ...user.toObject(),
        photos
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/users/leaderboard/college
// @desc    Get college leaderboard
// @access  Private
router.get('/leaderboard/college', protect, async (req, res) => {
  try {
    const users = await User.find({
      collegeDomain: req.user.collegeDomain,
      status: 'active'
    })
    .select('name profilePicture score followers college')
    .sort({ score: -1 })
    .limit(50);

    res.json({
      success: true,
      leaderboard: users
    });
  } catch (error) {
    console.error('Leaderboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/users/leaderboard/global
// @desc    Get global leaderboard
// @access  Private
router.get('/leaderboard/global', protect, async (req, res) => {
  try {
    const users = await User.find({ status: 'active' })
    .select('name profilePicture score followers college')
    .sort({ score: -1 })
    .limit(100);

    res.json({
      success: true,
      leaderboard: users
    });
  } catch (error) {
    console.error('Global leaderboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

export default router;