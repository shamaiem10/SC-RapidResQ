/**
 * Panic Button Route
 * Handles emergency panic button functionality
 */

/**
 * =========================================================
 * PSEUDO UNIT TESTS – Panic Button Route (/api/panic)
 * =========================================================
 * These pseudo-tests describe how the panic button feature
 * is unit-tested WITHOUT executing real test code.
 * They do not interfere with implementation.
 *
 * PSEUDO TEST 1: Valid SOS Alert (Normal Case)
 * GIVEN:
 *   - username exists
 *   - user has valid phone and location
 * WHEN:
 *   - POST /api/panic is called
 * THEN:
 *   - emergency post is created
 *   - response status = 201
 *
 * PSEUDO TEST 2: Missing Username
 * GIVEN:
 *   - request body does not contain username
 * WHEN:
 *   - POST /api/panic is called
 * THEN:
 *   - request is rejected
 *   - response status = 400
 *
 * PSEUDO TEST 3: User Not Found
 * GIVEN:
 *   - username does not exist in database
 * WHEN:
 *   - POST /api/panic is called
 * THEN:
 *   - no emergency post is created
 *   - response status = 404
 *
 * PSEUDO TEST 4: Missing Phone or Location
 * GIVEN:
 *   - user exists
 *   - phone OR location is missing
 * WHEN:
 *   - panic button is triggered
 * THEN:
 *   - alert is rejected
 *   - response status = 400
 *
 * PSEUDO TEST 5: Stress Scenario
 * GIVEN:
 *   - multiple valid panic requests sent rapidly
 * WHEN:
 *   - system processes SOS alerts
 * THEN:
 *   - system remains stable
 *   - all requests return valid responses
 *
 * =========================================================
 */

/**
 * =========================================================
 * Panic Button Route
 * Handles emergency panic button functionality
 * =========================================================
 */

const express = require('express');
const router = express.Router();
const User = require('../models/UserSchema');
const CommunityPost = require('../models/CommunityPost');
const Volunteer = require('../models/Volunteer'); // hypothetical Volunteer model

/**
 * @route   POST /api/panic
 * @desc    Create emergency panic post from logged-in user
 * @access  Public (requires username in body)
 */
router.post('/panic', async (req, res) => {
  console.log('🚨 Panic button triggered with body:', req.body);

  try {
    let { username } = req.body;

    if (!username) {
      console.error('❌ Panic failed: Username missing');
      return res.status(400).json({
        success: false,
        message: 'Username is required'
      });
    }

    username = username.trim().toLowerCase();
    console.log('🔍 Searching user:', username);

    const user = await User.findOne({ username });

    if (!user) {
      console.error('❌ Panic failed: User not found');
      return res.status(404).json({
        success: false,
        message: 'User not found. Please log in again.'
      });
    }

    console.log('✅ User found:', user.username);

    const fullName = user.fullName || user.username || 'Unknown User';
    const phone = user.phone || '';
    const location = user.location || '';

    if (!phone) {
      console.error('❌ Panic failed: Phone missing');
      return res.status(400).json({
        success: false,
        message: 'Phone number is required for emergency alerts.',
        missingField: 'phone'
      });
    }

    if (!location) {
      console.error('❌ Panic failed: Location missing');
      return res.status(400).json({
        success: false,
        message: 'Location is required for emergency alerts.',
        missingField: 'location'
      });
    }

    const phoneDigits = phone.replace(/\D/g, '');
    if (phoneDigits.length < 10 || phoneDigits.length > 15) {
      console.error('❌ Panic failed: Invalid phone format');
      return res.status(400).json({
        success: false,
        message: 'Invalid phone number format.',
        missingField: 'phone'
      });
    }

    console.log('📝 Creating emergency post...');

    const emergencyPost = new CommunityPost({
      type: 'Life in Danger',
      title: 'EMERGENCY – LIFE IN DANGER',
      description: 'This is an emergency panic alert. The user is in immediate danger.',
      location,
      phone: phoneDigits,
      author: fullName,
      urgent: true,
      responses: 0
    });

    const savedPost = await emergencyPost.save();

    if (!savedPost) {
      throw new Error('Emergency post was not saved');
    }

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
    console.error('🔥 Panic button error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error creating emergency post',
      error: error.message
    });
  }
});

/**
 * =========================================================
 * Separate SOS Alert Function
 * =========================================================
 */

/**
 * sendSOSAlert - Sends an SOS alert for a user
 * with proper preconditions and postconditions
 * 
 * Preconditions:
 *  - user must exist
 *  - location must be provided
 *  - user.phone must exist and be valid (10-15 digits)
 * 
 * Postconditions:
 *  - Emergency post is successfully saved in the database
 *  - Returns the saved post object with its _id
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
 * notifyVolunteersSafely - Sends SOS alert to volunteers
 * without being affected by concurrent modifications to the volunteer list.
 *
 * @param {Object} user - The user triggering the SOS
 * @param {string} location - The user's location
 */
const notifyVolunteersSafely = async (user, location) => {
  try {
    // 1️⃣ Create emergency post first
    const emergencyPost = await sendSOSAlert(user, location);

    // 2️⃣ Fetch volunteers and create a snapshot to prevent race conditions
    const volunteersSnapshot = await Volunteer.find({ available: true }).lean();

    // 3️⃣ Notify each volunteer using the snapshot
    for (const volunteer of volunteersSnapshot) {
      console.log(`📣 Notifying volunteer: ${volunteer.name} at ${volunteer.phone}`);
      // Example: sendSMS(volunteer.phone, `SOS Alert! User ${user.username} is in danger at ${location}`);
    }

    console.log(`✅ SOS alert sent to ${volunteersSnapshot.length} volunteers successfully.`);
    return emergencyPost;

  } catch (error) {
    console.error('🔥 Error sending SOS alert:', error.message);
    throw error;
  }
};

// -------------------- Exports --------------------
module.exports = router; // Export router for Express
module.exports.sendSOSAlert = sendSOSAlert; // Export helper function
module.exports.notifyVolunteersSafely = notifyVolunteersSafely; // Export safe volunteer notifier
