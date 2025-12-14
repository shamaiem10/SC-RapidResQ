/**
 * Authentication Controller
 * Demonstrates:
 * - Mutability risks & safe handling
 * - Contracts (preconditions, postconditions, mutation policies)
 */

const User = require('../models/User');
const Login = require('../models/Login');
const { validateLogin, validateSignup } = require('../utils/validation');
const bcrypt = require('bcrypt');

/**
 * Handle user login
 *
 * Contracts:
 * - Preconditions:
 *    req.body must be an object containing username and password (strings)
 * - Postconditions:
 *    Returns HTTP response with success status, message, and optional data
 * - Mutation Policy:
 *    req.body and user objects are NOT mutated
 */
const loginUser = async (req, res) => {
  try {
    // Immutable copy of input to avoid mutation risks
    const { username: rawUsername, password: rawPassword } = { ...req.body };

    const username = rawUsername ? rawUsername.trim() : '';
    const password = rawPassword ? rawPassword : '';

    // Validate login data
    const validation = validateLogin({ username, password });
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validation.errors
      });
    }

    // Find user by username or email
    const user = await User.findOne({
      $or: [
        { username: username.toLowerCase() },
        { email: username.toLowerCase() }
      ]
    });

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Verify password (immutable check)
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Record login (mutation confined to loginRecord, not input objects)
    const loginRecord = new Login({
      username: user.username,
      loginTime: new Date(),
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.get('user-agent')
    });
    await loginRecord.save();

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        timestamp: loginRecord.createdAt
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
};

/**
 * Handle user signup/registration
 *
 * Contracts:
 * - Preconditions:
 *    req.body must contain all necessary signup fields (strings/numbers)
 * - Postconditions:
 *    User is created in DB, returns success response
 * - Mutation Policy:
 *    req.body is NOT mutated; create new object for DB operations
 */
const signupUser = async (req, res) => {
  try {
    // Immutable copy of input
    const input = { ...req.body };
    const {
      fullName = '',
      username = '',
      email = '',
      password = '',
      phone = '',
      location = '',
      age,
      gender = null,
      bloodGroup = null,
      skills = [],
      otherSkill = null
    } = input;

    // Validate signup data
    const validation = validateSignup({ fullName, username, email, password, phone, location, age });
    if (!validation.valid) {
      return res.status(400).json({ success: false, message: 'Validation failed', errors: validation.errors });
    }

    // Check if user already exists (immutable input)
    const existingUser = await User.findOne({
      $or: [
        { email: email.toLowerCase() },
        { username: username.toLowerCase() }
      ]
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'User already exists',
        errors: existingUser.email === email.toLowerCase() ? ['Email already exists'] : ['Username already taken']
      });
    }

    // Hash password (no mutation to input)
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user object (immutable construction)
    const newUser = new User({
      fullName: fullName.trim(),
      username: username.trim().toLowerCase(),
      email: email.trim().toLowerCase(),
      password: hashedPassword,
      phone: phone.trim(),
      location: location.trim(),
      age: age ? Number(age) : null,
      gender,
      bloodGroup,
      skills,
      otherSkill: otherSkill ? otherSkill.trim() : null
    });

    await newUser.save();

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      data: { username: newUser.username, email: newUser.email, fullName: newUser.fullName, timestamp: newUser.createdAt }
    });

  } catch (error) {
    console.error('Signup error:', error);
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(409).json({ success: false, message: `${field} already exists`, errors: [`${field} already exists`] });
    }
    res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
};

/**
 * Get user profile
 * - Immutable access: does not modify user object
 */
const getUserProfile = async (req, res) => {
  try {
    const { username } = req.params;
    const user = await User.findOne({ username: username.toLowerCase() }, { password: 0 });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    res.status(200).json({ success: true, message: 'User profile retrieved successfully', data: user });
  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
};

/**
 * Update user profile
 * - Immutable update: input is not mutated, only DB is updated
 */
const updateUserProfile = async (req, res) => {
  try {
    const username = req.params.username;
    const updateData = { ...req.body }; // immutable copy

    // Remove restricted fields (prevents accidental mutation)
    delete updateData.password;
    delete updateData.username;
    delete updateData._id;

    const updatedUser = await User.findOneAndUpdate(
      { username: username.toLowerCase() },
      updateData,
      { new: true, runValidators: true, select: { password: 0 } }
    );

    if (!updatedUser) return res.status(404).json({ success: false, message: 'User not found' });

    res.status(200).json({ success: true, message: 'Profile updated successfully', data: updatedUser });
  } catch (error) {
    console.error('Update user profile error:', error);
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ success: false, message: 'Validation failed', errors });
    }
    res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
};

module.exports = {
  loginUser,
  signupUser,
  getUserProfile,
  updateUserProfile
};
