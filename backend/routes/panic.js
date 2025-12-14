/**
 * Panic Button Route
 * Handles emergency panic button functionality
 */
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const CommunityPost = require('../models/CommunityPost');

/**
 * @route   POST /api/panic
 * @desc    Create emergency panic post from logged-in user
 * @access  Public (requires username in body)
 */
router.post('/panic', async (req, res) => {
  console.log('🚨 Panic button route hit!', req.body);
  try {
    const { username } = req.body;

    // Validate username
    if (!username) {
      return res.status(400).json({
        success: false,
        message: 'Username is required'
      });
    }

    // Find user by username
    const user = await User.findOne({ 
      username: username.trim().toLowerCase() 
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found. Please log in again.'
      });
    }

    // Get user data
    const fullName = user.fullName || user.username || 'Unknown User';
    const phone = user.phone || '';
    const location = user.location || '';

    // Validate required fields
    if (!phone) {
      return res.status(400).json({
        success: false,
        message: 'Phone number is required for emergency alerts. Please update your profile with a phone number.',
        missingField: 'phone'
      });
    }

    if (!location) {
      return res.status(400).json({
        success: false,
        message: 'Location is required for emergency alerts. Please update your profile with your location.',
        missingField: 'location'
      });
    }

    // Validate phone format (remove non-digits and check length)
    const phoneDigits = phone.replace(/\D/g, '');
    if (phoneDigits.length < 10 || phoneDigits.length > 15) {
      return res.status(400).json({
        success: false,
        message: 'Invalid phone number format. Please provide a valid phone number.',
        missingField: 'phone'
      });
    }

    // Create emergency post
    const emergencyPost = new CommunityPost({
      type: 'Life in Danger',
      title: 'EMERGENCY – LIFE IN DANGER',
      description: 'This is an emergency panic alert. The user is in immediate danger and unable to provide details. Please contact immediately and send help to the location.',
      location: location,
      phone: phoneDigits,
      author: fullName,
      urgent: true,
      responses: 0
    });

    await emergencyPost.save();

    res.status(201).json({
      success: true,
      message: 'Emergency alert posted successfully',
      post: {
        id: emergencyPost._id,
        title: emergencyPost.title,
        type: emergencyPost.type,
        urgent: emergencyPost.urgent,
        location: emergencyPost.location
      }
    });
  } catch (error) {
    console.error('Panic button error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating emergency post',
      error: error.message
    });
  }
});

module.exports = router;

