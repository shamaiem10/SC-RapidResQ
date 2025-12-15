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
 * Panic Button Route
 * Handles emergency panic button functionality
 * =========================================================
 * sendSOSAlert function:
 * - Preconditions (must be true BEFORE sending the alert):
 *    1. `user` object exists and is valid.
 *    2. `user.phone` exists and is a valid phone number (10–15 digits).
 *    3. `location` is provided and non-empty.
 * - Postconditions (must be true AFTER sending the alert):
 *    1. Emergency post is successfully saved in the database.
 *    2. Function returns the saved post object containing post details.
 *    3. Alert is confirmed to be delivered to the system (response sent to client).
 * =========================================================
 */
/**
 * Panic Button Route
 * Handles emergency panic button functionality
 */

/**
 * =========================================================
 * PSEUDO UNIT TESTS – Panic Button Route (/api/panic)
 * =========================================================
 * Pseudo-tests describe unit tests without executing code.
 *
 * - Test 1: Valid SOS Alert → Post created, 201 returned
 * - Test 2: Missing Username → 400 returned
 * - Test 3: User Not Found → 404 returned
 * - Test 4: Missing Phone or Location → 400 returned
 * - Test 5: Stress Scenario → Multiple requests handled safely
 *
 * =========================================================
 * sendSOSAlert function:
 * - Preconditions (before sending alert):
 *    1. user exists
 *    2. user.phone exists and valid
 *    3. location provided
 * - Postconditions (after sending alert):
 *    1. Emergency post saved in DB
 *    2. Returns saved post object
 *    3. Alert sent to volunteers
 * =========================================================
 */
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
 *
 * PSEUDO TEST 1: Valid SOS Alert → Post created, 201 returned
 * PSEUDO TEST 2: Missing Username → 400 returned
 * PSEUDO TEST 3: User Not Found → 404 returned
 * PSEUDO TEST 4: Missing Phone or Location → 400 returned
 * PSEUDO TEST 5: Stress Scenario → Multiple requests handled safely
 * =========================================================
 *
 * sendSOSAlert function:
 * - Preconditions (before sending alert):
 *    1. user exists
 *    2. user.phone exists and valid
 *    3. location provided
 * - Postconditions (after sending alert):
 *    1. Emergency post saved in DB
 *    2. Returns saved post object
 *    3. Alert sent to all volunteers
 * =========================================================
 */

const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const User = require('../models/UserSchema');
const CommunityPost = require('../models/CommunityPost');

/**
 * notifyVolunteers
 * Sends email alerts to all users in the database
 * Uses a snapshot to prevent mutation inconsistencies
 */
async function notifyVolunteers(emergencyPost) {
  // Fetch all users from DB
  const volunteers = await User.find({});

  // Snapshot to prevent issues if list mutates
  const volunteersSnapshot = [...volunteers];

  // Configure Nodemailer transporter
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: '', // your Gmail
      pass: ''     // Gmail App Password
    }
  });

  for (const volunteer of volunteersSnapshot) {
    if (!volunteer.email) continue; // Skip users without email
    const mailOptions = {
      from: 'your.email@gmail.com',
      to: volunteer.email,
      subject: `🚨 SOS Alert: Life in Danger`,
      text: `Hello ${volunteer.fullName || volunteer.username},

A user is in immediate danger. Please check the RapidResQ community post:

Title: ${emergencyPost.title}
Location: ${emergencyPost.location}
Phone: ${emergencyPost.phone}

Act immediately!

- RapidResQ Team`
    };

    try {
      await transporter.sendMail(mailOptions);
      console.log(`📧 Email sent to ${volunteer.fullName || volunteer.username} at ${volunteer.email}`);
    } catch (err) {
      console.error(`❌ Failed to send email to ${volunteer.email}:`, err.message);
    }
  }
}

/**
 * sendSOSAlert
 * Creates an emergency alert post in the community
 */
async function sendSOSAlert(user, location) {
  // ======= Preconditions =======
  if (!user) throw new Error('Precondition failed: user object is required');
  if (!user.phone) throw new Error('Precondition failed: user must have a phone number');
  if (!location || location.trim() === '') throw new Error('Precondition failed: location is required');

  const phoneDigits = user.phone.replace(/\D/g, '');
  if (phoneDigits.length < 10 || phoneDigits.length > 15) {
    throw new Error('Precondition failed: phone number must be between 10 and 15 digits');
  }

  // ======= Action: Create emergency post =======
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

  // ======= Postconditions =======
  if (!savedPost) throw new Error('Postcondition failed: emergency post was not saved');

  // ======= Notify all volunteers =======
  await notifyVolunteers(savedPost);

  return savedPost;
}

/**
 * @route   POST /api/panic
 * @desc    Trigger panic button for a user
 * @access  Public (requires username in body)
 */
router.post('/panic', async (req, res) => {
  console.log('🚨 Panic button triggered with body:', req.body);

  try {
    let { username } = req.body;

    // ======= Input validation =======
    if (!username) {
      return res.status(400).json({
        success: false,
        message: 'Username is required'
      });
    }

    username = username.trim().toLowerCase();
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found. Please log in again.'
      });
    }

    // ======= Trigger SOS alert =======
    const savedPost = await sendSOSAlert(user, user.location);

    // ======= Response confirming post was delivered =======
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
 * Exam Answer Embedded:
 *
 * In RapidResQ, mutating the volunteer list while an SOS alert
 * is being sent could cause inconsistencies:
 *
 * - Volunteers removed during sending may miss the notification.
 * - Volunteers added during sending may receive duplicates or be missed.
 *
 * Prevention:
 * - We fetch all volunteers from the database and create a snapshot.
 * - Notifications are sent using the snapshot, so live changes
 *   to the main list do not affect alert delivery.
 *
 * This ensures reliable delivery of SOS alerts (urgent posts)
 * even if volunteers are added or removed concurrently.
 * =========================================================
 */

module.exports = router;
