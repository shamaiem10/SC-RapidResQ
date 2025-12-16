/**
 * Panic Button Route
 * Handles emergency panic button functionality
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
 * Sends beautiful email alerts to all VOLUNTEERS in the database
 * Uses a snapshot to prevent mutation inconsistencies
 */
async function notifyVolunteers(emergencyPost) {

  // ✅ Fetch ONLY users who are volunteers (isVolunteer: true)
  const volunteers = await User.find({ isVolunteer: true });

  // Log how many volunteers were found
  console.log(`Found ${volunteers.length} registered volunteer(s)`);

  // STRATEGY 1: SNAPSHOT MECHANISM - Localizes concurrent mutation bugs
  // Creates a copy of volunteers array to prevent issues if DB changes during iteration

  // Snapshot to prevent issues if list mutates
  const volunteersSnapshot = [...volunteers];

  // Configure Nodemailer transporter
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: '',
      pass: ''
    }
  });

  let successCount = 0;
  let failCount = 0;

  for (const volunteer of volunteersSnapshot) {
    if (!volunteer.email) {
      console.log(`⚠️ Skipping ${volunteer.fullName || volunteer.username} - no email found`);
      continue;
    }

    const mailOptions = {
      from: 'RapidResQ Emergency <sshabbir.bese23seecs@seecs.edu.pk>',
      to: volunteer.email,
      subject: '🚨 URGENT: Emergency SOS Alert - Immediate Response Required',
      html: `
<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#f4f4f4">
    <tr>
      <td align="center" style="padding:20px 0;">
        <table width="600" cellpadding="0" cellspacing="0" border="0" bgcolor="#ffffff">
          
          <!-- Header -->
          <tr>
            <td bgcolor="#dc3545" align="center" style="padding:40px 20px;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td align="center">
                    <div style="font-size:60px;line-height:60px;margin:0 0 10px 0;">🚨</div>
                    <h1 style="color:#ffffff;margin:0;font-size:28px;font-weight:bold;line-height:1.2;">EMERGENCY SOS ALERT</h1>
                    <div style="color:#ffffff;font-size:20px;font-weight:bold;margin:10px 0 0 0;letter-spacing:2px;">RapidResQ</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          
          <!-- Content -->
          <tr>
            <td style="padding:30px;">
              
              <!-- Greeting -->
              <p style="font-size:18px;color:#333333;margin:0 0 20px 0;">
                Hello <strong>${volunteer.fullName || volunteer.username}</strong>,
              </p>

              <!-- Urgent Message Box -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td bgcolor="#fff3cd" style="padding:20px;border-left:5px solid #ffc107;">
                    <p style="margin:0;font-size:16px;color:#856404;font-weight:bold;">
                      ⚠️ A person is in <span style="color:#dc3545;">IMMEDIATE DANGER</span> and requires urgent assistance!
                    </p>
                  </td>
                </tr>
              </table>

              <br><br>

              <!-- Emergency Details Box -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#f8f9fa">
                <tr>
                  <td style="padding:25px;">
                    
                    <h2 style="color:#dc3545;font-size:20px;margin:0 0 20px 0;">📋 Emergency Details</h2>
                    
                    <!-- Person Box -->
                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:15px;">
                      <tr>
                        <td bgcolor="#ffffff" style="padding:15px;border-left:4px solid #dc3545;">
                          <div style="font-size:24px;margin-bottom:5px;">👤</div>
                          <div style="font-size:11px;color:#6c757d;font-weight:bold;margin-bottom:5px;">PERSON IN DISTRESS</div>
                          <div style="font-size:16px;color:#212529;font-weight:bold;">${emergencyPost.author}</div>
                        </td>
                      </tr>
                    </table>

                    <!-- Location Box -->
                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:15px;">
                      <tr>
                        <td bgcolor="#ffffff" style="padding:15px;border-left:4px solid #dc3545;">
                          <div style="font-size:24px;margin-bottom:5px;">📍</div>
                          <div style="font-size:11px;color:#6c757d;font-weight:bold;margin-bottom:5px;">LOCATION</div>
                          <div style="font-size:16px;color:#212529;font-weight:bold;">${emergencyPost.location}</div>
                        </td>
                      </tr>
                    </table>

                    <!-- Phone Box -->
                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:15px;">
                      <tr>
                        <td bgcolor="#ffffff" style="padding:15px;border-left:4px solid #dc3545;">
                          <div style="font-size:24px;margin-bottom:5px;">📞</div>
                          <div style="font-size:11px;color:#6c757d;font-weight:bold;margin-bottom:5px;">CONTACT NUMBER</div>
                          <div style="font-size:18px;color:#dc3545;font-weight:bold;">${emergencyPost.phone}</div>
                        </td>
                      </tr>
                    </table>

                    <!-- Time Box -->
                    <table width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td bgcolor="#ffffff" style="padding:15px;border-left:4px solid #dc3545;">
                          <div style="font-size:24px;margin-bottom:5px;">⏰</div>
                          <div style="font-size:11px;color:#6c757d;font-weight:bold;margin-bottom:5px;">ALERT TIMESTAMP</div>
                          <div style="font-size:14px;color:#212529;">${new Date().toLocaleString()}</div>
                        </td>
                      </tr>
                    </table>

                  </td>
                </tr>
              </table>

              <br><br>

              <!-- Action Steps Box -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#d1ecf1">
                <tr>
                  <td style="padding:25px;border-left:5px solid #17a2b8;">
                    
                    <h2 style="color:#0c5460;font-size:18px;margin:0 0 15px 0;">✅ Immediate Actions Required</h2>
                    
                    <!-- Step 1 -->
                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:10px;">
                      <tr>
                        <td bgcolor="#ffffff" style="padding:12px 15px;">
                          <table cellpadding="0" cellspacing="0" border="0">
                            <tr>
                              <td bgcolor="#17a2b8" align="center" style="color:#ffffff;width:30px;height:30px;font-weight:bold;vertical-align:middle;border-radius:50%;">1</td>
                              <td style="padding-left:12px;color:#495057;font-size:14px;">Call the person immediately at <strong>${emergencyPost.phone}</strong></td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>

                    <!-- Step 2 -->
                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:10px;">
                      <tr>
                        <td bgcolor="#ffffff" style="padding:12px 15px;">
                          <table cellpadding="0" cellspacing="0" border="0">
                            <tr>
                              <td bgcolor="#17a2b8" align="center" style="color:#ffffff;width:30px;height:30px;font-weight:bold;vertical-align:middle;border-radius:50%;">2</td>
                              <td style="padding-left:12px;color:#495057;font-size:14px;">If nearby <strong>${emergencyPost.location}</strong>, respond in person</td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>

                    <!-- Step 3 -->
                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:10px;">
                      <tr>
                        <td bgcolor="#ffffff" style="padding:12px 15px;">
                          <table cellpadding="0" cellspacing="0" border="0">
                            <tr>
                              <td bgcolor="#17a2b8" align="center" style="color:#ffffff;width:30px;height:30px;font-weight:bold;vertical-align:middle;border-radius:50%;">3</td>
                              <td style="padding-left:12px;color:#495057;font-size:14px;">Contact emergency services if needed</td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>

                    <!-- Step 4 -->
                    <table width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td bgcolor="#ffffff" style="padding:12px 15px;">
                          <table cellpadding="0" cellspacing="0" border="0">
                            <tr>
                              <td bgcolor="#17a2b8" align="center" style="color:#ffffff;width:30px;height:30px;font-weight:bold;vertical-align:middle;border-radius:50%;">4</td>
                              <td style="padding-left:12px;color:#495057;font-size:14px;">Check RapidResQ app for updates</td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>

                  </td>
                </tr>
              </table>

              <br><br>

              <!-- Emergency Contacts -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border:2px dashed #ffc107;">
                <tr>
                  <td align="center" style="padding:15px;">
                    <div style="color:#dc3545;font-size:16px;font-weight:bold;margin-bottom:10px;">🆘 Pakistan Emergency Services</div>
                    <div style="font-size:18px;color:#333333;">
                      Police: <strong>15</strong> | Ambulance: <strong>1122</strong> | Fire: <strong>16</strong>
                    </div>
                  </td>
                </tr>
              </table>

              <br><br>

              <!-- Critical Banner -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#dc3545">
                <tr>
                  <td align="center" style="padding:20px;color:#ffffff;font-size:18px;font-weight:bold;">
                    ⏱️ TIME IS CRITICAL - EVERY SECOND COUNTS!
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td bgcolor="#343a40" align="center" style="padding:25px;">
              <p style="color:#adb5bd;font-size:13px;margin:0 0 10px 0;">
                You're receiving this alert because you're a registered volunteer in the <strong style="color:#ffffff;">RapidResQ Emergency Response System</strong>.
              </p>
              <p style="color:#adb5bd;font-size:13px;margin:0 0 15px 0;">
                Your quick response can save a life. Thank you for being a hero! 🦸
              </p>
              <p style="color:#ffffff;font-size:14px;margin:0;">
                <strong>RapidResQ Team</strong><br>
                Emergency Response Platform<br>
                Available 24/7 for Communities
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
      `,
      text: `
🚨🚨🚨 EMERGENCY SOS ALERT 🚨🚨🚨

Hello ${volunteer.fullName || volunteer.username},

⚠️ A PERSON IS IN IMMEDIATE DANGER AND REQUIRES URGENT ASSISTANCE!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 EMERGENCY DETAILS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

👤 Person in Distress: ${emergencyPost.author}
📍 Location: ${emergencyPost.location}
📞 Contact Number: ${emergencyPost.phone}
⏰ Alert Time: ${new Date().toLocaleString()}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ IMMEDIATE ACTIONS REQUIRED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. Call the person immediately at ${emergencyPost.phone}
2. If you're nearby ${emergencyPost.location}, consider responding in person
3. Contact emergency services if needed:
   • Police: 15
   • Ambulance: 1122
   • Fire: 16
4. Check the RapidResQ app for real-time updates

⏱️ TIME IS CRITICAL - EVERY SECOND COUNTS!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

You're receiving this because you're a registered volunteer in RapidResQ.
Your quick response can save a life!

- RapidResQ Emergency Response Team
  Available 24/7 for Communities
      `
    };

    // TRY-CATCH BLOCK - Localizes and reproduces email sending failures
   // LOCALIZED: console.error() logs which volunteer failed (${volunteer.email}) and why (err.message shows EAUTH, ETIMEDOUT, etc)
  // REPRODUCED: If email sending fails, catch block catches it and logs the exact error, proving the bug exists

    try {
      await transporter.sendMail(mailOptions);
      console.log(`📧 Email sent to ${volunteer.fullName || volunteer.username} at ${volunteer.email}`);
      successCount++;
    } catch (err) {
      console.error(`❌ Failed to send email to ${volunteer.email}:`, err.message);
      failCount++;
    }
  }

  console.log(`✅ Email summary: ${successCount} sent, ${failCount} failed`);
}

/**
 * sendSOSAlert
 * Creates an emergency alert post in the community
 */
async function sendSOSAlert(user, location) {
  // ======= Preconditions =======

  // PRECONDITION VALIDATION - Localizes and fixes invalid data input
  // Validates all required data exists before creating post

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

  // POSTCONDITION CHECK - Reproduces and fixes silent database failures
  // Verifies that the post was actually saved to database

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

    //INPUT VALIDATION - Localizes and reproduces invalid API requests
    // Checks that required username parameter exists

    // ======= Input validation =======
    if (!username) {
      return res.status(400).json({
        success: false,
        message: 'Username is required'
      });
    }

    username = username.trim().toLowerCase();
    const user = await User.findOne({ username });

    //INPUT VALIDATION - Reproduces and fixes user not found errors
    // Verifies user exists in database

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