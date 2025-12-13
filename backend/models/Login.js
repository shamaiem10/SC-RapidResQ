/**
 * Login Model for MongoDB
 * Stores login attempt records
 */
const mongoose = require('mongoose');

const loginSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Username is required'],
    trim: true,
    lowercase: true
  },
  loginTime: {
    type: Date,
    default: Date.now
  },
  ipAddress: {
    type: String,
    default: null
  },
  userAgent: {
    type: String,
    default: null
  }
}, {
  timestamps: true
});

// Index for faster queries
loginSchema.index({ username: 1 });
loginSchema.index({ loginTime: -1 });

const Login = mongoose.model('Login', loginSchema);

module.exports = Login;

