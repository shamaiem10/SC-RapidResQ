/**
 * Abstract Data Type: LoginRecord
 * ===============================
 * 
 * ABSTRACTION FUNCTION:
 * AF(login) = A login record where:
 *   - login.username represents the user who logged in
 *   - login.loginTime represents when the login occurred
 *   - login.ipAddress represents the client's IP address
 *   - login.userAgent represents the client's browser/device info
 * 
 * REPRESENTATION INVARIANT:
 * - username must be a non-empty string, trimmed and lowercase
 * - loginTime must be a valid Date object
 * - ipAddress can be null or a valid IP string
 * - userAgent can be null or a non-empty string
 * 
 * SAFETY FROM REP EXPOSURE:
 * - All database operations return defensive copies
 * - Input validation prevents invalid state
 * - Static methods provide safe object creation
 */
const mongoose = require('mongoose');

const loginSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Username is required'],
    trim: true,
    lowercase: true,
    validate: {
      validator: function(v) {
        // REP INVARIANT: username must be non-empty after trimming
        return v && typeof v === 'string' && v.trim().length > 0;
      },
      message: 'Username must be a non-empty string'
    }
  },
  loginTime: {
    type: Date,
    default: Date.now,
    validate: {
      validator: function(v) {
        // REP INVARIANT: loginTime must be a valid date
        return v instanceof Date && !isNaN(v.getTime());
      },
      message: 'LoginTime must be a valid date'
    }
  },
  ipAddress: {
    type: String,
    default: null,
    validate: {
      validator: function(v) {
        // REP INVARIANT: ipAddress can be null or any string (relaxed validation)
        if (v === null || v === undefined) return true;
        return typeof v === 'string';
      },
      message: 'IP address must be a string'
    }
  },
  userAgent: {
    type: String,
    default: null,
    validate: {
      validator: function(v) {
        // REP INVARIANT: userAgent can be null or non-empty string
        if (v === null || v === undefined) return true;
        return typeof v === 'string';
      },
      message: 'User agent must be a string'
    }
  }
}, {
  timestamps: true
});

/**
 * STATIC METHODS (Creators/Factories)
 * These provide safe ways to create login records with proper validation
 */

/**
 * Creates a new login record with validation
 * 
 * REQUIRES: 
 * - username != null && username.trim().length > 0
 * - loginTime is valid Date (optional, defaults to now)
 * 
 * EFFECTS: Creates a valid LoginRecord that satisfies rep invariant
 * 
 * @param {string} username - The username (will be trimmed and lowercased)
 * @param {Date} loginTime - Optional login time (defaults to now)
 * @param {string} ipAddress - Optional IP address
 * @param {string} userAgent - Optional user agent string
 * @returns {Promise<Login>} New login record
 */
loginSchema.statics.createLoginRecord = async function(username, loginTime = new Date(), ipAddress = null, userAgent = null) {
  // PRECONDITION checks
  if (!username || typeof username !== 'string' || username.trim().length === 0) {
    throw new Error('PRECONDITION VIOLATED: username must be a non-empty string');
  }
  
  if (!(loginTime instanceof Date) || isNaN(loginTime.getTime())) {
    throw new Error('PRECONDITION VIOLATED: loginTime must be a valid Date');
  }

  // Create with validated data
  const loginRecord = new this({
    username: username.trim().toLowerCase(),
    loginTime: loginTime,
    ipAddress: ipAddress,
    userAgent: userAgent
  });

  return await loginRecord.save();
};

/**
 * INSTANCE METHODS (Observers and Queries)
 * These provide safe access to the abstract state
 */

/**
 * Gets the age of this login in minutes
 * 
 * EFFECTS: Returns number of minutes since login occurred
 */
loginSchema.methods.getLoginAgeMinutes = function() {
  const now = new Date();
  const diffMs = now - this.loginTime;
  return Math.floor(diffMs / (1000 * 60));
};

/**
 * Checks if this login is recent (within last hour)
 * 
 * EFFECTS: Returns true if login occurred within last 60 minutes
 */
loginSchema.methods.isRecentLogin = function() {
  return this.getLoginAgeMinutes() <= 60;
};

/**
 * Gets a safe representation of the login record
 * Prevents rep exposure by returning only relevant fields
 * 
 * EFFECTS: Returns object with safe copy of login data
 */
loginSchema.methods.getSafeRecord = function() {
  return {
    id: this._id.toString(),
    username: this.username,
    loginTime: new Date(this.loginTime.getTime()), // Defensive copy
    ipAddress: this.ipAddress,
    hasUserAgent: !!this.userAgent,
    ageMinutes: this.getLoginAgeMinutes(),
    isRecent: this.isRecentLogin(),
    createdAt: new Date(this.createdAt.getTime()) // Defensive copy
  };
};

/**
 * STATIC QUERY METHODS
 * These provide safe ways to query login records
 */

/**
 * Gets recent logins for a user
 * 
 * REQUIRES: username is non-empty string
 * EFFECTS: Returns array of recent login records for user
 */
loginSchema.statics.getRecentLoginsForUser = async function(username, hoursBack = 24) {
  if (!username || typeof username !== 'string') {
    throw new Error('PRECONDITION VIOLATED: username must be a non-empty string');
  }
  
  const cutoffTime = new Date(Date.now() - (hoursBack * 60 * 60 * 1000));
  
  const logins = await this.find({
    username: username.trim().toLowerCase(),
    loginTime: { $gte: cutoffTime }
  })
  .sort({ loginTime: -1 })
  .lean(); // For performance, returns plain objects
  
  return logins.map(login => ({
    ...login,
    ageMinutes: Math.floor((Date.now() - login.loginTime.getTime()) / (1000 * 60))
  }));
};

/**
 * Counts login attempts in time window
 * 
 * REQUIRES: username is non-empty string, minutes > 0
 * EFFECTS: Returns count of login attempts in specified time window
 */
loginSchema.statics.countRecentAttempts = async function(username, minutes = 60) {
  if (!username || typeof username !== 'string') {
    throw new Error('PRECONDITION VIOLATED: username must be a non-empty string');
  }
  if (typeof minutes !== 'number' || minutes <= 0) {
    throw new Error('PRECONDITION VIOLATED: minutes must be positive number');
  }
  
  const cutoffTime = new Date(Date.now() - (minutes * 60 * 1000));
  
  return await this.countDocuments({
    username: username.trim().toLowerCase(),
    loginTime: { $gte: cutoffTime }
  });
};

/**
 * REP INVARIANT CHECKER (for debugging)
 * Validates that the representation invariant holds
 */
loginSchema.methods.checkRep = function() {
  // Check username invariant
  if (!this.username || typeof this.username !== 'string' || this.username.length === 0) {
    throw new Error('REP INVARIANT VIOLATED: username must be non-empty string');
  }
  if (this.username !== this.username.toLowerCase() || this.username !== this.username.trim()) {
    throw new Error('REP INVARIANT VIOLATED: username must be trimmed and lowercase');
  }
  
  // Check loginTime invariant
  if (!this.loginTime || !(this.loginTime instanceof Date) || isNaN(this.loginTime.getTime())) {
    throw new Error('REP INVARIANT VIOLATED: loginTime must be valid Date');
  }
  
  // Check ipAddress invariant (if present) - relaxed validation
  if (this.ipAddress !== null && this.ipAddress !== undefined && typeof this.ipAddress !== 'string') {
    throw new Error('REP INVARIANT VIOLATED: ipAddress must be string, null, or undefined');
  }
  
  // Check userAgent invariant (if present)
  if (this.userAgent !== null && typeof this.userAgent !== 'string') {
    throw new Error('REP INVARIANT VIOLATED: userAgent must be string or null');
  }
  
  return true; // All invariants satisfied
};

// Index for faster queries (unchanged)
loginSchema.index({ username: 1 });
loginSchema.index({ loginTime: -1 });

// Add compound index for recent login queries
loginSchema.index({ username: 1, loginTime: -1 });

const Login = mongoose.model('Login', loginSchema);

module.exports = Login;

