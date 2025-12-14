/**
 * Validation utilities for form data
 * Demonstrates:
 * - Preconditions
 * - Postconditions
 * - Declarative Specifications
 * - Operational Specifications
 */

// Email validation regex
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Phone validation regex (supports various formats)
const phoneRegex = /^[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,9}$/;

/**
 * Validate email format
 *
 * Declarative Spec:
 * - Input: email (string)
 * - Output: { valid: boolean, message?: string }
 * - Behavior: Returns valid=true if email is a non-empty string and matches email format rules.
 *
 * Operational Spec:
 * 1. Check if email is a non-empty string.
 * 2. Trim the email.
 * 3. Test against regex.
 * 4. Check length <= 100.
 * 5. Return { valid: true } if all checks pass.
 *
 * Preconditions:
 * - email must be a string
 *
 * Postconditions:
 * - Returns { valid: boolean, message?: string }
 */
const validateEmail = (email) => {
  if (!email || typeof email !== 'string') {
    return { valid: false, message: 'Email is required' };
  }
  if (!emailRegex.test(email.trim())) {
    return { valid: false, message: 'Invalid email format' };
  }
  if (email.length > 100) {
    return { valid: false, message: 'Email must be less than 100 characters' };
  }
  return { valid: true };
};

/**
 * Validate phone number format
 *
 * Declarative Spec:
 * - Input: phone (string)
 * - Output: { valid: boolean, message?: string }
 * - Behavior: Returns valid=true if phone is a non-empty string and matches phone format rules.
 *
 * Operational Spec:
 * 1. Check if phone is non-empty string.
 * 2. Remove spaces, dashes, parentheses.
 * 3. Check length between 10 and 15.
 * 4. Test against regex.
 * 5. Return { valid: true } if all checks pass.
 *
 * Preconditions:
 * - phone must be a string
 *
 * Postconditions:
 * - Returns { valid: boolean, message?: string }
 */
const validatePhone = (phone) => {
  if (!phone || typeof phone !== 'string') {
    return { valid: false, message: 'Phone number is required' };
  }
  const cleaned = phone.replace(/[\s\-\(\)]/g, '');
  if (cleaned.length < 10 || cleaned.length > 15) {
    return { valid: false, message: 'Phone number must be between 10 and 15 digits' };
  }
  if (!phoneRegex.test(phone)) {
    return { valid: false, message: 'Invalid phone number format' };
  }
  return { valid: true };
};

/**
 * Validate password strength
 *
 * Declarative Spec:
 * - Input: password (string)
 * - Output: { valid: boolean, message?: string }
 * - Behavior: Returns valid=true if password satisfies length and character requirements.
 *
 * Operational Spec:
 * 1. Check non-empty string.
 * 2. Check length between 8 and 50.
 * 3. Check contains uppercase, lowercase, number.
 * 4. Return { valid: true } if all checks pass.
 *
 * Preconditions:
 * - password must be a string
 *
 * Postconditions:
 * - Returns { valid: boolean, message?: string }
 */
const validatePassword = (password) => {
  if (!password || typeof password !== 'string') {
    return { valid: false, message: 'Password is required' };
  }
  if (password.length < 8) return { valid: false, message: 'Password must be at least 8 characters long' };
  if (password.length > 50) return { valid: false, message: 'Password must be less than 50 characters' };
  if (!/[A-Z]/.test(password)) return { valid: false, message: 'Password must contain at least one uppercase letter' };
  if (!/[a-z]/.test(password)) return { valid: false, message: 'Password must contain at least one lowercase letter' };
  if (!/[0-9]/.test(password)) return { valid: false, message: 'Password must contain at least one number' };
  return { valid: true };
};

/**
 * Validate required field
 *
 * Declarative Spec:
 * - Input: value, fieldName
 * - Output: { valid: boolean, message?: string }
 * - Behavior: Returns valid=false if value is empty or null.
 *
 * Operational Spec:
 * 1. Check fieldName is string.
 * 2. Check value is not empty.
 * 3. Return { valid: true } if value exists.
 *
 * Preconditions:
 * - fieldName must be a string
 *
 * Postconditions:
 * - Returns { valid: boolean, message?: string }
 */
const validateRequired = (value, fieldName) => {
  if (!fieldName || typeof fieldName !== 'string') throw new Error('Precondition failed: fieldName must be a string');
  if (value === undefined || value === null || (typeof value === 'string' && value.trim().length === 0)) {
    return { valid: false, message: `${fieldName} is required` };
  }
  return { valid: true };
};

/**
 * Validate string length
 *
 * Declarative Spec:
 * - Input: value (string), min (number), max (number), fieldName (string)
 * - Output: { valid: boolean, message?: string }
 * - Behavior: Checks string length is within min-max.
 *
 * Operational Spec:
 * 1. Check fieldName, min, max preconditions.
 * 2. Trim value.
 * 3. Check length < min → invalid
 * 4. Check length > max → invalid
 * 5. Return valid=true if within range.
 *
 * Preconditions:
 * - value must be string, min/max numbers, fieldName string
 *
 * Postconditions:
 * - Returns { valid: boolean, message?: string }
 */
const validateLength = (value, min, max, fieldName) => {
  if (!fieldName || typeof fieldName !== 'string') throw new Error('Precondition failed: fieldName must be a string');
  if (typeof min !== 'number' || typeof max !== 'number' || min > max) throw new Error('Precondition failed: invalid min/max values');
  if (!value || typeof value !== 'string') return { valid: false, message: `${fieldName} is required` };
  const trimmed = value.trim();
  if (trimmed.length < min) return { valid: false, message: `${fieldName} must be at least ${min} characters` };
  if (trimmed.length > max) return { valid: false, message: `${fieldName} must be less than ${max} characters` };
  return { valid: true };
};

/**
 * Validate numeric range
 *
 * Declarative Spec:
 * - Input: value, min, max, fieldName
 * - Output: { valid: boolean, message?: string }
 * - Behavior: Validates number is within min-max, optional field allowed.
 *
 * Operational Spec:
 * 1. Check fieldName, min/max preconditions.
 * 2. If value empty → valid=true
 * 3. Convert to number, check NaN → invalid
 * 4. Check number < min or > max → invalid
 * 5. Return valid=true if within range
 *
 * Preconditions:
 * - fieldName string, min/max numbers
 *
 * Postconditions:
 * - Returns { valid: boolean, message?: string }
 */
const validateNumericRange = (value, min, max, fieldName) => {
  if (!fieldName || typeof fieldName !== 'string') throw new Error('Precondition failed: fieldName must be a string');
  if (typeof min !== 'number' || typeof max !== 'number' || min > max) throw new Error('Precondition failed: invalid min/max');
  if (value === undefined || value === null || value === '') return { valid: true };
  const num = Number(value);
  if (isNaN(num)) return { valid: false, message: `${fieldName} must be a valid number` };
  if (num < min || num > max) return { valid: false, message: `${fieldName} must be between ${min} and ${max}` };
  return { valid: true };
};

/**
 * Validate login data
 */
const validateLogin = (data) => {
  if (!data || typeof data !== 'object') throw new Error('Precondition failed: data must be an object');
  const errors = [];

  const username = data.username || '';
  const password = data.password || '';

  const usernameValidation = validateLength(username, 3, 30, 'Username');
  if (!usernameValidation.valid) errors.push(usernameValidation.message);

  const passwordValidation = validateRequired(password, 'Password');
  if (!passwordValidation.valid) errors.push(passwordValidation.message);
  else if (password.length < 6) errors.push('Password must be at least 6 characters long');

  return { valid: errors.length === 0, errors };
};

/**
 * Validate signup data
 */
const validateSignup = (data) => {
  if (!data || typeof data !== 'object') throw new Error('Precondition failed: data must be an object');
  const errors = [];

  const fullName = data.fullName || '';
  const username = data.username || '';
  const email = data.email || '';
  const password = data.password || '';
  const phone = data.phone || '';
  const location = data.location || '';
  const age = data.age;

  const fullNameValidation = validateLength(fullName, 2, 50, 'Full Name');
  if (!fullNameValidation.valid) errors.push(fullNameValidation.message);

  const usernameValidation = validateLength(username, 3, 30, 'Username');
  if (!usernameValidation.valid) errors.push(usernameValidation.message);

  const emailValidation = validateEmail(email);
  if (!emailValidation.valid) errors.push(emailValidation.message);

  const passwordValidation = validatePassword(password);
  if (!passwordValidation.valid) errors.push(passwordValidation.message);

  const phoneValidation = validatePhone(phone);
  if (!phoneValidation.valid) errors.push(phoneValidation.message);

  const locationValidation = validateLength(location, 2, 50, 'Location');
  if (!locationValidation.valid) errors.push(locationValidation.message);

  if (age !== undefined) {
    const ageValidation = validateNumericRange(age, 13, 120, 'Age');
    if (!ageValidation.valid) errors.push(ageValidation.message);
  }

  return { valid: errors.length === 0, errors };
};

/**
 * Validate contact form data
 */
const validateContact = (data) => {
  if (!data || typeof data !== 'object') throw new Error('Precondition failed: data must be an object');
  const errors = [];

  const name = data.name || '';
  const email = data.email || '';
  const message = data.message || '';

  const nameValidation = validateLength(name, 2, 50, 'Name');
  if (!nameValidation.valid) errors.push(nameValidation.message);

  const emailValidation = validateEmail(email);
  if (!emailValidation.valid) errors.push(emailValidation.message);

  const messageValidation = validateLength(message, 10, 1000, 'Message');
  if (!messageValidation.valid) errors.push(messageValidation.message);

  return { valid: errors.length === 0, errors };
};

module.exports = {
  validateLogin,
  validateSignup,
  validateContact,
  validateEmail,
  validatePhone,
  validatePassword,
  validateRequired,
  validateLength,
  validateNumericRange
};
