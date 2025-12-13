/**
 * User Model for MongoDB
 * Stores user registration/signup data
 */
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: [true, 'Full Name is required'],
    trim: true,
    minlength: [2, 'Full Name must be at least 2 characters'],
    maxlength: [50, 'Full Name must be less than 50 characters']
  },
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true, // Creates unique index automatically
    trim: true,
    lowercase: true,
    minlength: [3, 'Username must be at least 3 characters'],
    maxlength: [30, 'Username must be less than 30 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true, // Creates unique index automatically
    trim: true,
    lowercase: true,
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Invalid email format'],
    maxlength: [100, 'Email must be less than 100 characters']
  },
  password: {
    type: String,
    required: [true, 'Password is required']
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
    minlength: [2, 'Location must be at least 2 characters'],
    maxlength: [50, 'Location must be less than 50 characters']
  },
  age: {
    type: Number,
    min: [13, 'Age must be at least 13'],
    max: [120, 'Age must be less than 120'],
    default: null
  },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other'],
    default: null
  },
  bloodGroup: {
    type: String,
    enum: ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'],
    default: null
  },
  skills: {
    type: [String],
    default: []
  },
  otherSkill: {
    type: String,
    trim: true,
    maxlength: [50, 'Other skill must be less than 50 characters'],
    default: null
  }
}, {
  timestamps: true // Adds createdAt and updatedAt automatically
});

// Note: Indexes are automatically created by 'unique: true' and 'index: true' in schema fields
// No need for explicit schema.index() calls to avoid duplicate index warnings

const User = mongoose.model('User', userSchema);

module.exports = User;

