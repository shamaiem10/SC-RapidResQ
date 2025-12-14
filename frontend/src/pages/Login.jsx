import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Login.css";

const API_BASE_URL = "http://localhost:5000/api";

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Client-side validation
  const validateField = (name, value) => {
    const newErrors = { ...errors };
    
    switch (name) {
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
      
      case "password":
        if (!value || value.length === 0) {
          newErrors.password = "Password is required";
        } else if (value.length < 6) {
          newErrors.password = "Password must be at least 6 characters";
        } else {
          delete newErrors.password;
        }
        break;
      
      default:
        break;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
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
    const usernameValid = validateField("username", formData.username);
    const passwordValid = validateField("password", formData.password);
    return usernameValid && passwordValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMessage("");
    
    // Validate all fields
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: formData.username.trim(),
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSuccessMessage(data.message || "Login successful!");
        setFormData({ username: "", password: "" });
        setErrors({});
        
        // Store user data in localStorage for Account page
        if (data.data) {
          localStorage.setItem('currentUser', JSON.stringify({
            username: data.data.username,
            email: data.data.email || '',
            fullName: data.data.fullName || ''
          }));
        } else {
          // Fallback: store username from form
          localStorage.setItem('currentUser', JSON.stringify({
            username: formData.username.trim(),
            email: '',
            fullName: ''
          }));
        }
        
        // Redirect to dashboard after 1 second
        setTimeout(() => {
          navigate("/dashboard");
        }, 1000);
      } else {
        // Handle validation errors from server
        if (data.errors && Array.isArray(data.errors)) {
          const serverErrors = {};
          data.errors.forEach((error) => {
            if (error.includes("Username")) {
              serverErrors.username = error;
            } else if (error.includes("Password")) {
              serverErrors.password = error;
            }
          });
          setErrors(serverErrors);
        } else {
          setErrors({ submit: data.message || "Login failed. Please try again." });
        }
      }
    } catch (error) {
      console.error("Login error:", error);
      setErrors({ submit: "Network error. Please check your connection and try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="login-page">
      {/* BACK ARROW FIXED ON PAGE */}
      <div className="page-back-arrow">
        <Link to="/">
          <i className="bi bi-arrow-left"></i> Back to home
        </Link>
      </div>

      <div className="login-container">
        <div className="login-card">
          <h2 className="login-title">Login</h2>

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

          <form className="login-form" onSubmit={handleSubmit}>
            <div className="input-group">
              <i className="bi bi-person icon"></i>
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

            <div className="input-group">
              <i className="bi bi-lock icon"></i>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                onBlur={handleBlur}
                className={errors.password ? "error" : ""}
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                tabIndex={0}
              >
                <i className={showPassword ? "bi bi-eye-slash" : "bi bi-eye"}></i>
              </button>
              {errors.password && (
                <span className="field-error">
                  <i className="bi bi-exclamation-triangle"></i>
                  {errors.password}
                </span>
              )}
            </div>

            <button 
              className="login-btn" 
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Logging in..." : "Login"}
            </button>

            <p className="signup-text">
              Don't have an account? <a href="/signup">Sign up</a>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
