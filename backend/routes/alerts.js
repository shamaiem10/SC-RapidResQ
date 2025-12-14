const express = require('express');
const router = express.Router();
const User = require('../models/UserSchema');

/**
 * @route   GET /api/alerts/latest
 * @desc    Get all unread notifications for a user
 * @access  Public (pass ?username=...)
 */
router.get('/latest', async (req, res) => {
  try {
    const { username } = req.query;
    if (!username) return res.status(400).json({ success: false, message: 'Username required' });

    const user = await User.findOne({ username: username.trim().toLowerCase() });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const unreadNotifications = user.notifications.filter(n => !n.read);

    res.status(200).json({
      success: true,
      notifications: unreadNotifications
    });
  } catch (error) {
    console.error('Alerts error:', error.message);
    res.status(500).json({ success: false, message: 'Error fetching notifications' });
  }
});

module.exports = router;
