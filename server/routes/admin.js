import express from 'express';
import User from '../models/User.js';
import Photo from '../models/Photo.js';
import Report from '../models/Report.js';
import Reinstatement from '../models/Reinstatement.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// All routes require admin authorization
router.use(protect);
router.use(authorize('admin'));

// @route   GET /api/admin/dashboard
// @desc    Get admin dashboard stats
// @access  Admin only
router.get('/dashboard', async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ status: 'active' });
    const frozenUsers = await User.countDocuments({ status: 'frozen' });
    const totalPhotos = await Photo.countDocuments();
    const pendingReports = await Report.countDocuments({ status: 'pending' });
    const pendingReinstatements = await Reinstatement.countDocuments({ status: 'pending' });

    res.json({
      success: true,
      stats: {
        totalUsers,
        activeUsers,
        frozenUsers,
        totalPhotos,
        pendingReports,
        pendingReinstatements
      }
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching dashboard stats'
    });
  }
});

// @route   GET /api/admin/users
// @desc    Get all users for admin management
// @access  Admin only
router.get('/users', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const search = req.query.search || '';
    const status = req.query.status;

    let query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { college: { $regex: search, $options: 'i' } }
      ];
    }
    if (status) {
      query.status = status;
    }

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching users'
    });
  }
});

// @route   PUT /api/admin/users/:id/status
// @desc    Update user status (freeze/unfreeze/suspend)
// @access  Admin only
router.put('/users/:id/status', async (req, res) => {
  try {
    const { status, reason } = req.body;
    
    if (!['active', 'frozen', 'suspended'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.role === 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Cannot modify admin accounts'
      });
    }

    user.status = status;
    await user.save();

    // Log the action (in a real app, you'd want to create an audit log)
    console.log(`Admin ${req.user.id} changed user ${user._id} status to ${status}. Reason: ${reason}`);

    res.json({
      success: true,
      message: `User status updated to ${status}`,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        status: user.status
      }
    });
  } catch (error) {
    console.error('Update user status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating user status'
    });
  }
});

// @route   GET /api/admin/reports
// @desc    Get all reports
// @access  Admin only
router.get('/reports', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const status = req.query.status;

    let query = {};
    if (status) {
      query.status = status;
    }

    const reports = await Report.find(query)
      .populate('reportedUser', 'name email college status')
      .populate('reportedBy', 'name email')
      .populate('reportedPhoto', 'imageUrl')
      .populate('reviewedBy', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Report.countDocuments(query);

    res.json({
      success: true,
      reports,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get reports error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching reports'
    });
  }
});

// @route   PUT /api/admin/reports/:id/review
// @desc    Review a report
// @access  Admin only
router.put('/reports/:id/review', async (req, res) => {
  try {
    const { status, actionTaken, adminNotes } = req.body;
    
    if (!['reviewed', 'resolved', 'dismissed'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    const report = await Report.findById(req.params.id);
    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    report.status = status;
    report.actionTaken = actionTaken;
    report.adminNotes = adminNotes;
    report.reviewedBy = req.user.id;
    report.reviewedAt = new Date();

    await report.save();

    res.json({
      success: true,
      message: 'Report reviewed successfully',
      report
    });
  } catch (error) {
    console.error('Review report error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error reviewing report'
    });
  }
});

// @route   GET /api/admin/reinstatements
// @desc    Get all reinstatement requests
// @access  Admin only
router.get('/reinstatements', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const status = req.query.status;

    let query = {};
    if (status) {
      query.status = status;
    }

    const reinstatements = await Reinstatement.find(query)
      .populate('user', 'name email college status')
      .populate('reviewedBy', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Reinstatement.countDocuments(query);

    res.json({
      success: true,
      reinstatements,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get reinstatements error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching reinstatements'
    });
  }
});

// @route   PUT /api/admin/reinstatements/:id/review
// @desc    Review a reinstatement request
// @access  Admin only
router.put('/reinstatements/:id/review', async (req, res) => {
  try {
    const { status, adminNotes } = req.body;
    
    if (!['approved', 'denied'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    const reinstatement = await Reinstatement.findById(req.params.id);
    if (!reinstatement) {
      return res.status(404).json({
        success: false,
        message: 'Reinstatement request not found'
      });
    }

    reinstatement.status = status;
    reinstatement.adminNotes = adminNotes;
    reinstatement.reviewedBy = req.user.id;
    reinstatement.reviewedAt = new Date();

    await reinstatement.save();

    // If approved, reactivate the user account
    if (status === 'approved') {
      await User.findByIdAndUpdate(reinstatement.user, {
        status: 'active'
      });
    }

    res.json({
      success: true,
      message: `Reinstatement request ${status}`,
      reinstatement
    });
  } catch (error) {
    console.error('Review reinstatement error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error reviewing reinstatement'
    });
  }
});

export default router;