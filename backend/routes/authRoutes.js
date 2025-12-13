/**
 * Authentication Routes
 * Handles login and signup endpoints
 */
const express = require('express');
const router = express.Router();
const { loginUser, signupUser, getUserProfile, updateUserProfile } = require('../controllers/authController');

/**
 * @route   POST /api/login
 * @desc    User login
 * @access  Public
 */
router.post('/login', loginUser);

/**
 * @route   POST /api/signup
 * @desc    User signup/registration
 * @access  Public
 */
router.post('/signup', signupUser);

/**
 * @route   GET /api/profile/:username
 * @desc    Get user profile by username
 * @access  Public
 */
router.get('/profile/:username', getUserProfile);

/**
 * @route   PUT /api/profile/:username
 * @desc    Update user profile by username
 * @access  Public
 */
router.put('/profile/:username', updateUserProfile);

module.exports = router;

