/**
 * User Model for MongoDB
 * Represents user accounts in the emergency response system
 */
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: [true, 'Full name is required'],
    trim: true,
    minlength: 2,
    maxlength: 50
  },
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    lowercase: true,
    minlength: 3,
    maxlength: 30
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 8
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true
  },
  location: {
    type: String,
    required: [true, 'Location is required'],
    trim: true,
    maxlength: 100
  },
  age: {
    type: Number,
    min: 13,
    max: 120,
    default: null
  },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other'],
    default: null
  },
  bloodGroup: {
    type: String,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
    default: null
  },
  skills: {
    type: [String],
    default: []
  },
  otherSkill: {
    type: String,
    trim: true,
    default: null
  },
  emergencyContact: {
    type: String,
    trim: true,
    default: null
  },
  medicalConditions: {
    type: String,
    trim: true,
    default: null
  },
  isVolunteer: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Index for faster queries
userSchema.index({ username: 1 });
userSchema.index({ email: 1 });

const User = mongoose.model('User', userSchema);

module.exports = User;