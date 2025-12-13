import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Signup.css";
import "bootstrap-icons/font/bootstrap-icons.css";

const API_BASE_URL = "http://localhost:5000/api";

const Signup = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: "",
    username: "",
    email: "",
    password: "",
    phone: "",
    location: "",
    age: "",
    gender: "",
    bloodGroup: "",
    otherSkill: "",
  });

  const [skills, setSkills] = useState([]);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSkillChange = (skill) => {
    if (skills.includes(skill)) {
      setSkills(skills.filter((s) => s !== skill));
    } else {
      setSkills([...skills, skill]);
    }
  };

  // Email validation
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Phone validation
  const validatePhone = (phone) => {
    const phoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/;
    const cleaned = phone.replace(/[\s-()]/g, '');
    return phoneRegex.test(phone) && cleaned.length >= 10 && cleaned.length <= 15;
  };

  // Password validation
  const validatePassword = (password) => {
    if (password.length < 8) return false;
    if (password.length > 50) return false;
    if (!/[A-Z]/.test(password)) return false;
    if (!/[a-z]/.test(password)) return false;
    if (!/[0-9]/.test(password)) return false;
    return true;
  };

  // Field validation
  const validateField = (name, value) => {
    const newErrors = { ...errors };
    
    switch (name) {
      case "fullName":
        if (!value || value.trim().length === 0) {
          newErrors.fullName = "Full Name is required";
        } else if (value.trim().length < 2) {
          newErrors.fullName = "Full Name must be at least 2 characters";
        } else if (value.trim().length > 50) {
          newErrors.fullName = "Full Name must be less than 50 characters";
        } else {
          delete newErrors.fullName;
        }
        break;
      
      case "username":
        if (!value || value.trim().length === 0) {
          newErrors.username = "Username is required";
        } else if (value.trim().length < 3) {
          newErrors.username = "Username must be at least 3 characters";
        } else if (value.trim().length > 30) {
          newErrors.username = "Username must be less than 30 characters";
        } else {
          delete newErrors.username;
        }
        break;
      
      case "email":
        if (!value || value.trim().length === 0) {
          newErrors.email = "Email is required";
        } else if (!validateEmail(value)) {
          newErrors.email = "Invalid email format";
        } else if (value.length > 100) {
          newErrors.email = "Email must be less than 100 characters";
        } else {
          delete newErrors.email;
        }
        break;
      
      case "password":
        if (!value || value.length === 0) {
          newErrors.password = "Password is required";
        } else if (!validatePassword(value)) {
          newErrors.password = "Password must be 8-50 characters with uppercase, lowercase, and number";
        } else {
          delete newErrors.password;
        }
        break;
      
      case "phone":
        if (!value || value.trim().length === 0) {
          newErrors.phone = "Phone number is required";
        } else if (!validatePhone(value)) {
          newErrors.phone = "Invalid phone number format (10-15 digits)";
        } else {
          delete newErrors.phone;
        }
        break;
      
      case "location":
        if (!value || value.trim().length === 0) {
          newErrors.location = "Location is required";
        } else if (value.trim().length < 2) {
          newErrors.location = "Location must be at least 2 characters";
        } else if (value.trim().length > 50) {
          newErrors.location = "Location must be less than 50 characters";
        } else {
          delete newErrors.location;
        }
        break;
      
      case "age":
        if (value && value.trim() !== "") {
          const ageNum = Number(value);
          if (isNaN(ageNum)) {
            newErrors.age = "Age must be a valid number";
          } else if (ageNum < 13 || ageNum > 120) {
            newErrors.age = "Age must be between 13 and 120";
          } else {
            delete newErrors.age;
          }
        } else {
          delete newErrors.age;
        }
        break;
      
      default:
        break;
    }
    
    setErrors(newErrors);
    return !newErrors[name];
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Clear success message when user types
    if (successMessage) {
      setSuccessMessage("");
    }
    
    // Real-time validation
    if (errors[name]) {
      validateField(name, value);
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    validateField(name, value);
  };

  const validateForm = () => {
    let isValid = true;
    isValid = validateField("fullName", formData.fullName) && isValid;
    isValid = validateField("username", formData.username) && isValid;
    isValid = validateField("email", formData.email) && isValid;
    isValid = validateField("password", formData.password) && isValid;
    isValid = validateField("phone", formData.phone) && isValid;
    isValid = validateField("location", formData.location) && isValid;
    if (formData.age) {
      isValid = validateField("age", formData.age) && isValid;
    }
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMessage("");
    
    // Validate all fields
    if (!validateForm()) {
      setErrors({ ...errors, submit: "Please fix the errors above" });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`${API_BASE_URL}/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullName: formData.fullName.trim(),
          username: formData.username.trim(),
          email: formData.email.trim(),
          password: formData.password,
          phone: formData.phone.trim(),
          location: formData.location.trim(),
          age: formData.age || null,
          gender: formData.gender || null,
          bloodGroup: formData.bloodGroup || null,
          skills: skills,
          otherSkill: formData.otherSkill.trim() || null,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSuccessMessage(data.message || "Account created successfully!");
        setFormData({
          fullName: "",
          username: "",
          email: "",
          password: "",
          phone: "",
          location: "",
          age: "",
          gender: "",
          bloodGroup: "",
          otherSkill: "",
        });
        setSkills([]);
        setErrors({});
        
        // Navigate to dashboard after successful signup
        setTimeout(() => {
          navigate("/dashboard");
        }, 1500);
      } else {
        // Handle validation errors from server
        if (data.errors && Array.isArray(data.errors)) {
          const serverErrors = {};
          data.errors.forEach((error) => {
            if (error.includes("Full Name")) {
              serverErrors.fullName = error;
            } else if (error.includes("Username")) {
              serverErrors.username = error;
            } else if (error.includes("Email")) {
              serverErrors.email = error;
            } else if (error.includes("Password")) {
              serverErrors.password = error;
            } else if (error.includes("Phone")) {
              serverErrors.phone = error;
            } else if (error.includes("Location")) {
              serverErrors.location = error;
            } else if (error.includes("Age")) {
              serverErrors.age = error;
            }
          });
          setErrors({ ...serverErrors, submit: "Please fix the errors above" });
        } else {
          setErrors({ submit: data.message || "Registration failed. Please try again." });
        }
      }
    } catch (error) {
      console.error("Signup error:", error);
      setErrors({ submit: "Network error. Please check your connection and try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="signup-page">
      {/* BACK ARROW FIXED ON PAGE */}
      <div className="page-back-arrow">
        <Link to="/">
          <i className="bi bi-arrow-left"></i> Back to home
        </Link>
      </div>

      <div className="signup-container">
        <div className="signup-card">
          <h2 className="signup-title">Create Your Account</h2>

          {/* Success Message */}
          {successMessage && (
            <div className="message success-message">
              <i className="bi bi-check-circle"></i>
              {successMessage}
            </div>
          )}

          {/* Error Message */}
          {errors.submit && (
            <div className="message error-message">
              <i className="bi bi-exclamation-circle"></i>
              {errors.submit}
            </div>
          )}

          <form className="signup-form" onSubmit={handleSubmit}>

            {/* Row 1 */}
            <div className="row">
              <div className="input-group">
                <i className="bi bi-person-fill icon"></i>
                <input
                  type="text"
                  name="fullName"
                  placeholder="Full Name"
                  value={formData.fullName}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={errors.fullName ? "error" : ""}
                  required
                />
                {errors.fullName && (
                  <span className="field-error">
                    <i className="bi bi-exclamation-triangle"></i>
                    {errors.fullName}
                  </span>
                )}
              </div>

              <div className="input-group">
                <i className="bi bi-person-badge-fill icon"></i>
                <input
                  type="text"
                  name="username"
                  placeholder="Username"
                  value={formData.username}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={errors.username ? "error" : ""}
                  required
                />
                {errors.username && (
                  <span className="field-error">
                    <i className="bi bi-exclamation-triangle"></i>
                    {errors.username}
                  </span>
                )}
              </div>
            </div>

            {/* Row 2 */}
            <div className="row">
              <div className="input-group">
                <i className="bi bi-envelope-fill icon"></i>
                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={errors.email ? "error" : ""}
                  required
                />
                {errors.email && (
                  <span className="field-error">
                    <i className="bi bi-exclamation-triangle"></i>
                    {errors.email}
                  </span>
                )}
              </div>

              <div className="input-group">
                <i className="bi bi-lock-fill icon"></i>
                <input
                  type="password"
                  name="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={errors.password ? "error" : ""}
                  required
                />
                {errors.password && (
                  <span className="field-error">
                    <i className="bi bi-exclamation-triangle"></i>
                    {errors.password}
                  </span>
                )}
              </div>
            </div>

            {/* Row 3 */}
            <div className="row">
              <div className="input-group">
                <i className="bi bi-telephone-fill icon"></i>
                <input
                  type="text"
                  name="phone"
                  placeholder="Phone Number"
                  value={formData.phone}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={errors.phone ? "error" : ""}
                  required
                />
                {errors.phone && (
                  <span className="field-error">
                    <i className="bi bi-exclamation-triangle"></i>
                    {errors.phone}
                  </span>
                )}
              </div>

              <div className="input-group">
                <i className="bi bi-geo-alt-fill icon"></i>
                <input
                  type="text"
                  name="location"
                  placeholder="City / Location"
                  value={formData.location}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={errors.location ? "error" : ""}
                  required
                />
                {errors.location && (
                  <span className="field-error">
                    <i className="bi bi-exclamation-triangle"></i>
                    {errors.location}
                  </span>
                )}
              </div>
            </div>

            {/* Row 4 */}
            <div className="row">
              <div className="input-group">
                <i className="bi bi-calendar-fill icon"></i>
                <input
                  type="number"
                  name="age"
                  placeholder="Age (optional)"
                  value={formData.age}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={errors.age ? "error" : ""}
                  min="13"
                  max="120"
                />
                {errors.age && (
                  <span className="field-error">
                    <i className="bi bi-exclamation-triangle"></i>
                    {errors.age}
                  </span>
                )}
              </div>

              <div className="input-group">
                <i className="bi bi-gender-ambiguous icon"></i>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                >
                  <option value="">Gender (optional)</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            {/* Blood Group (full width row) */}
            <div className="input-group full">
              <i className="bi bi-droplet-fill icon"></i>
              <select
                name="bloodGroup"
                value={formData.bloodGroup}
                onChange={handleChange}
              >
                <option value="">Blood Group (optional)</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
              </select>
            </div>

            {/* Skills */}
            <label className="skills-label">Skills (optional)</label>
            <div className="skills-box">
              {[
                "First Aid",
                "CPR",
                "Fire Safety",
                "Search & Rescue",
                "Crisis Support",
                "Transportation / Driving",
                "Technical Assistance",
              ].map((skill) => (
                <label key={skill} className="skill-item">
                  <input
                    type="checkbox"
                    checked={skills.includes(skill)}
                    onChange={() => handleSkillChange(skill)}
                  />
                  {skill}
                </label>
              ))}

              <div className="input-group other-skill">
                <i className="bi bi-pencil-square icon"></i>
                <input
                  type="text"
                  name="otherSkill"
                  placeholder="Other (optional)"
                  value={formData.otherSkill}
                  onChange={handleChange}
                  maxLength="50"
                />
              </div>
            </div>

            <button
              className="signup-btn"
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Creating Account..." : "Create Account"}
            </button>

            <p className="login-text">
              Already have an account? <a href="/login">Login</a>
            </p>

          </form>
        </div>
      </div>
    </div>
  );
};

export default Signup;
