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
  // LOCALIZING THE BUG: Log initial request to track if panic button reaches backend
  console.log('🚨 Panic button triggered with body:', req.body);

  try {
    let { username } = req.body;

    // ASSERTIONS + AVOIDING DEBUGGING: Validate username exists early to prevent downstream errors
    if (!username) {
      // LOCALIZING THE BUG: Log specific failure point for easier debugging
      console.error('❌ Panic failed: Username missing');
      return res.status(400).json({
        success: false,
        message: 'Username is required'
      });
    }

    // FIX THE BUG: Normalize username once to ensure consistent database queries
    username = username.trim().toLowerCase();

    // LOCALIZING THE BUG: Log before database query to identify if failure occurs during lookup
    console.log('🔍 Searching user:', username);

    const user = await User.findOne({ username });

    // ASSERTIONS: Verify user exists before proceeding with emergency post creation
    if (!user) {
      // LOCALIZING THE BUG: Log specific failure point
      console.error('❌ Panic failed: User not found');
      return res.status(404).json({
        success: false,
        message: 'User not found. Please log in again.'
      });
    }

    // LOCALIZING THE BUG: Log successful user retrieval to confirm this stage completed
    console.log('✅ User found:', user.username);

    // Get user data
    const fullName = user.fullName || user.username || 'Unknown User';
    const phone = user.phone || '';
    const location = user.location || '';

    // ASSERTIONS + AVOIDING DEBUGGING: Validate phone exists to prevent incomplete emergency posts
    if (!phone) {
      // LOCALIZING THE BUG: Log specific failure point
      console.error('❌ Panic failed: Phone missing');
      return res.status(400).json({
        success: false,
        message: 'Phone number is required for emergency alerts.',
        missingField: 'phone'
      });
    }

    // ASSERTIONS + AVOIDING DEBUGGING: Validate location exists to ensure responders can be notified
    if (!location) {
      // LOCALIZING THE BUG: Log specific failure point
      console.error('❌ Panic failed: Location missing');
      return res.status(400).json({
        success: false,
        message: 'Location is required for emergency alerts.',
        missingField: 'location'
      });
    }

    // AVOIDING DEBUGGING: Validate phone format to prevent invalid data in database
    const phoneDigits = phone.replace(/\D/g, '');
    if (phoneDigits.length < 10 || phoneDigits.length > 15) {
      // LOCALIZING THE BUG: Log specific failure point
      console.error('❌ Panic failed: Invalid phone format');
      return res.status(400).json({
        success: false,
        message: 'Invalid phone number format.',
        missingField: 'phone'
      });
    }

    // LOCALIZING THE BUG: Log before creating emergency post to track execution flow
    console.log('📝 Creating emergency post...');

    const emergencyPost = new CommunityPost({
      type: 'Life in Danger',
      title: 'EMERGENCY – LIFE IN DANGER',
      description:
        'This is an emergency panic alert. The user is in immediate danger.',
      location,
      phone: phoneDigits,
      author: fullName,
      urgent: true,
      responses: 0
    });

    // FIX THE BUG: Verify save success to catch silent database failures
    const savedPost = await emergencyPost.save();

    // ASSERTIONS: Ensure post was actually saved to database
    if (!savedPost) {
      throw new Error('Emergency post was not saved');
    }

    // LOCALIZING THE BUG: Log successful save with post ID for tracking
    console.log('✅ Emergency post saved successfully:', savedPost._id);

    res.status(201).json({
      success: true,
      message: 'Emergency alert posted successfully',
      post: {
        id: savedPost._id,
        title: savedPost.title,
        type: savedPost.type,
        urgent: savedPost.urgent,
        location: savedPost.location
      }
    });
  } catch (error) {
    // UNDERSTAND LOCATION AND CAUSE: Improved error logging to identify exact error type and message
    console.error('🔥 Panic button error:', error.message);

    res.status(500).json({
      success: false,
      message: 'Error creating emergency post',
      error: error.message
    });
  }
});

module.exports = router;

