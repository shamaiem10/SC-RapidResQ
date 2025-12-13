/**
 * Authentication Routes
 * Handles login and signup endpoints
 */
const express = require('express');
const router = express.Router();
const { loginUser, signupUser } = require('../controllers/authController');

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

module.exports = router;

