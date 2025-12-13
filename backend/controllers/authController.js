/**
 * Authentication Controller
 * Handles login and registration logic
 */
const User = require('../models/User');
const Login = require('../models/Login');
const { validateLogin, validateSignup } = require('../utils/validation');
const bcrypt = require('bcrypt');

/**
 * Handle user login
 */
const loginUser = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validate login data
    const validation = validateLogin({ username, password });

    if (!validation.valid) {
      console.log('Login validation failed:', validation.errors);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validation.errors
      });
    }

    // Find user by username or email
    const user = await User.findOne({
      $or: [
        { username: username.trim().toLowerCase() },
        { email: username.trim().toLowerCase() }
      ]
    });

    if (!user) {
      console.log('Login failed: User not found');
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      console.log('❌ Login failed: Invalid password');
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Save login attempt to database
    const loginRecord = new Login({
      username: user.username,
      loginTime: new Date(),
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.get('user-agent')
    });
    await loginRecord.save();

    // Print to console
    console.log('   Login successful:');
    console.log('   Username:', user.username);
    console.log('   Email:', user.email);
    console.log('   Login Time:', loginRecord.loginTime);
    console.log('   IP Address:', loginRecord.ipAddress);

    // Return success response (exclude password)
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
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

/**
 * Handle user signup/registration
 */
const signupUser = async (req, res) => {
  try {
    const {
      fullName,
      username,
      email,
      password,
      phone,
      location,
      age,
      gender,
      bloodGroup,
      skills,
      otherSkill
    } = req.body;

    // Validate signup data
    const validation = validateSignup({
      fullName,
      username,
      email,
      password,
      phone,
      location,
      age
    });

    if (!validation.valid) {
      console.log('Signup validation failed:', validation.errors);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validation.errors
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [
        { email: email.trim().toLowerCase() },
        { username: username.trim().toLowerCase() }
      ]
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'User already exists',
        errors: existingUser.email === email.toLowerCase() 
          ? ['Email already exists'] 
          : ['Username already taken']
      });
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create new user
    const userData = {
      fullName: fullName.trim(),
      username: username.trim().toLowerCase(),
      email: email.trim().toLowerCase(),
      password: hashedPassword,
      phone: phone.trim(),
      location: location.trim(),
      age: age ? Number(age) : null,
      gender: gender || null,
      bloodGroup: bloodGroup || null,
      skills: skills || [],
      otherSkill: otherSkill ? otherSkill.trim() : null
    };

    const newUser = new User(userData);
    await newUser.save();

    // Print to console
    console.log('   New user signed up:');
    console.log('   Full Name:', newUser.fullName);
    console.log('   Username:', newUser.username);
    console.log('   Email:', newUser.email);
    console.log('   Phone:', newUser.phone);
    console.log('   Location:', newUser.location);
    console.log('   Age:', newUser.age || 'Not provided');
    console.log('   Gender:', newUser.gender || 'Not provided');
    console.log('   Blood Group:', newUser.bloodGroup || 'Not provided');
    console.log('   Skills:', newUser.skills.length > 0 ? newUser.skills.join(', ') : 'None');
    console.log('   Other Skill:', newUser.otherSkill || 'None');
    console.log('   Created At:', newUser.createdAt);

    // Return success response (exclude password)
    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      data: {
        username: newUser.username,
        email: newUser.email,
        fullName: newUser.fullName,
        timestamp: newUser.createdAt
      }
    });

  } catch (error) {
    console.error('Signup error:', error);
    
    // Handle duplicate key error
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(409).json({
        success: false,
        message: `${field} already exists`,
        errors: [`${field} already exists`]
      });
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

module.exports = {
  loginUser,
  signupUser
};

