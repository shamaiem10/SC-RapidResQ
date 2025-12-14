/**
 * Authentication Controller
 * -------------------------
 * Demonstrates:
 * - Mutability & mutation risks
 * - Mutation contracts (what is safe to mutate)
 * - Precondition / Postcondition enforcement
 */

const User = require('../models/User');
const Login = require('../models/Login');
const { validateLogin, validateSignup } = require('../utils/validation');
const bcrypt = require('bcrypt');

/**
 * loginUser
 * -------------------------
 * Mutation Concept Demonstration:
 * - Input (req.body) is immutable: we never modify it
 * - Local copies of input are safe to trim / normalize
 * - DB objects are mutable internally, but we do not mutate user document directly before saving
 * Mutation Contract:
 * - req.body MUST NOT be mutated
 * - Only local variables can be mutated safely
 */
const loginUser = async (req, res) => {
  try {
    // Immutable copy of user input
    const { username: rawUsername, password: rawPassword } = { ...req.body }; // <- req.body not mutated
    const username = rawUsername?.trim() || '';
    const password = rawPassword || '';

    // Validate (safe, no mutation of input)
    const validation = validateLogin({ username, password });
    if (!validation.valid) return res.status(400).json({ success: false, message: 'Validation failed', errors: validation.errors });

    // Safe DB access
    const user = await User.findOne({
      $or: [
        { username: username.toLowerCase() },
        { email: username.toLowerCase() }
      ]
    });
    if (!user) return res.status(401).json({ success: false, message: 'Invalid credentials' });

    // Password check does not mutate input or user object
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) return res.status(401).json({ success: false, message: 'Invalid credentials' });

    // Mutating loginRecord is safe because it is a new DB object
    const loginRecord = new Login({
      username: user.username,
      loginTime: new Date(),
      ipAddress: req.ip || req.connection?.remoteAddress,
      userAgent: req.get('user-agent')
    });
    await loginRecord.save(); // mutation confined to loginRecord

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: { username: user.username, email: user.email, fullName: user.fullName, timestamp: loginRecord.createdAt }
    });

  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, message: 'Internal server error', error: err.message });
  }
};

/**
 * signupUser
 * -------------------------
 * Mutation Concept Demonstration:
 * - req.body (user input) is never mutated -> we make an immutable copy
 * - Local variables can be mutated safely (e.g., trimming strings, normalizing casing)
 * - DB objects (new User) are mutable during creation
 * Mutation Contract:
 * - req.body: immutable
 * - newUser: mutable until saved
 */
const signupUser = async (req, res) => {
  try {
    // Immutable copy of input -> protects against accidental mutation
    const input = { ...req.body }; 

    // Local variables (safe to mutate)
    let fullName = input.fullName?.trim() || '';
    let username = input.username?.trim().toLowerCase() || '';
    let email = input.email?.trim().toLowerCase() || '';
    let password = input.password || '';
    let phone = input.phone?.trim() || '';
    let location = input.location?.trim() || '';
    let age = input.age ? Number(input.age) : null;
    let gender = input.gender || null;
    let bloodGroup = input.bloodGroup || null;
    let skills = Array.isArray(input.skills) ? input.skills : [];
    let otherSkill = input.otherSkill?.trim() || null;
    let emergencyContact = input.emergencyContact?.trim() || null;
    let medicalConditions = input.medicalConditions?.trim() || null;
    let isVolunteer = input.isVolunteer || false;

    // Validate (safe, no mutation to input)
    const validation = validateSignup({ fullName, username, email, password, phone, location, age });
    if (!validation.valid) return res.status(400).json({ success: false, message: 'Validation failed', errors: validation.errors });

    // Check if user exists
    const existingUser = await User.findOne({
      $or: [
        { email },
        { username }
      ]
    });
    if (existingUser) return res.status(409).json({
      success: false,
      message: 'User already exists',
      errors: existingUser.email === email ? ['Email already exists'] : ['Username already taken']
    });

    // Hash password -> mutation confined to local variable
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create newUser -> mutable, safe
    const newUser = new User({
      fullName,
      username,
      email,
      password: hashedPassword,
      phone,
      location,
      age,
      gender,
      bloodGroup,
      skills,
      otherSkill,
      emergencyContact,
      medicalConditions,
      isVolunteer
    });

    await newUser.save(); // persists mutation to DB

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      data: { username: newUser.username, email: newUser.email, fullName: newUser.fullName, timestamp: newUser.createdAt }
    });

  } catch (err) {
    console.error('Signup error:', err);
    if (err.code === 11000) {
      const field = Object.keys(err.keyPattern)[0];
      return res.status(409).json({ success: false, message: `${field} already exists`, errors: [`${field} already exists`] });
    }
    res.status(500).json({ success: false, message: 'Internal server error', error: err.message });
  }
};

/**
 * getUserProfile
 * -------------------------
 * Mutation Concept:
 * - Access-only operation: no mutation occurs
 */
const getUserProfile = async (req, res) => {
  try {
    const username = req.params.username?.toLowerCase();
    const user = await User.findOne({ username }, { password: 0 });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    res.status(200).json({ success: true, message: 'User profile retrieved successfully', data: user });
  } catch (err) {
    console.error('Get profile error:', err);
    res.status(500).json({ success: false, message: 'Internal server error', error: err.message });
  }
};

/**
 * updateUserProfile
 * -------------------------
 * Mutation Concept:
 * - req.body immutable
 * - only DB object is safely mutated via findOneAndUpdate
 */
const updateUserProfile = async (req, res) => {
  try {
    const username = req.params.username?.toLowerCase();
    const updateData = { ...req.body }; // immutable copy

    // Prevent accidental mutation of sensitive fields
    delete updateData.password;
    delete updateData.username;
    delete updateData._id;

    const updatedUser = await User.findOneAndUpdate({ username }, updateData, { new: true, runValidators: true, select: { password: 0 } });
    if (!updatedUser) return res.status(404).json({ success: false, message: 'User not found' });

    res.status(200).json({ success: true, message: 'Profile updated successfully', data: updatedUser });

  } catch (err) {
    console.error('Update profile error:', err);
    if (err.name === 'ValidationError') {
      const errors = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ success: false, message: 'Validation failed', errors });
    }
    res.status(500).json({ success: false, message: 'Internal server error', error: err.message });
  }
};

module.exports = { loginUser, signupUser, getUserProfile, updateUserProfile };
