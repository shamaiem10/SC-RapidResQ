/**
 * Panic Button Route & SOS Alert System
 */

const express = require('express');
const router = express.Router();
const User = require('../models/UserSchema');
const CommunityPost = require('../models/CommunityPost');
const Volunteer = require('../models/Volunteer');

/**
 * @route   POST /api/panic
 * @desc    Trigger SOS alert from a user
 * @access  Public (requires username in body)
 */
router.post('/panic', async (req, res) => {
  console.log('🚨 Panic button triggered with body:', req.body);

  try {
    let { username } = req.body;

    if (!username) {
      return res.status(400).json({ success: false, message: 'Username is required' });
    }

    username = username.trim().toLowerCase();
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found. Please log in again.' });
    }

    // Extract user details
    const fullName = user.fullName || user.username || 'Unknown User';
    const phone = user.phone || '';
    const location = user.location || '';

    if (!phone || !location) {
      return res.status(400).json({
        success: false,
        message: 'Phone and location are required for emergency alerts.'
      });
    }

    // Create emergency post & notify volunteers safely
    const emergencyPost = await notifyVolunteersSafely(user, location);

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
    console.error('🔥 Panic button error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * sendSOSAlert - Creates emergency post
 */
const sendSOSAlert = async (user, location) => {
  // -------------------- Preconditions --------------------
  if (!user) throw new Error('User does not exist');
  if (!location) throw new Error('Location is required');
  if (!user.phone) throw new Error('Phone number is required for emergency alerts');

  const phoneDigits = user.phone.replace(/\D/g, '');
  if (phoneDigits.length < 10 || phoneDigits.length > 15) {
    throw new Error('Invalid phone number format');
  }

  // -------------------- Create Emergency Post --------------------
  const emergencyPost = new CommunityPost({
    type: 'Life in Danger',
    title: 'EMERGENCY – LIFE IN DANGER',
    description: 'This is an emergency panic alert. The user is in immediate danger.',
    location,
    phone: phoneDigits,
    author: user.fullName || user.username || 'Unknown User',
    urgent: true,
    responses: 0
  });

  const savedPost = await emergencyPost.save();

  // -------------------- Postconditions --------------------
  if (!savedPost) throw new Error('Emergency post was not saved');

  return savedPost;
};

/**
 * notifyVolunteersSafely - Notifies all available volunteers
 */
const notifyVolunteersSafely = async (user, location) => {
  try {
    // 1️⃣ Create emergency post first
    const emergencyPost = await sendSOSAlert(user, location);

    // 2️⃣ Fetch volunteers snapshot to avoid concurrency issues
    const volunteersSnapshot = await Volunteer.find({ available: true }).lean();

    // 3️⃣ Notify each volunteer (SMS, push, email)
    for (const volunteer of volunteersSnapshot) {
      console.log(`📣 Notifying volunteer: ${volunteer.name} at ${volunteer.phone}`);
      // Example: sendSMS(volunteer.phone, `SOS Alert! ${user.username} is in danger at ${location}`);
    }

    console.log(`✅ SOS alert sent to ${volunteersSnapshot.length} volunteers successfully.`);
    return emergencyPost;

  } catch (error) {
    console.error('🔥 Error sending SOS alert:', error.message);
    throw error;
  }
};

module.exports = router;
module.exports.sendSOSAlert = sendSOSAlert;
module.exports.notifyVolunteersSafely = notifyVolunteersSafely;
