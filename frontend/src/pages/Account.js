import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Account.css";
import { AlertTriangle } from "lucide-react";
import { handlePanicButton } from "../utils/panicButton";

// Dynamic API URL for mobile compatibility
const getApiBaseUrl = () => {
  if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    return `http://${window.location.hostname}:5000/api`;
  }
  return "http://localhost:5000/api";
};

const API_BASE_URL = getApiBaseUrl();

function AccountPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    age: "",
    city: "",
    isVolunteer: false,
    skills: "",
    emergencyContact: "",
    bloodType: "",
    medicalConditions: "",
  });
  const [loading, setLoading] = useState(true);
  const [userLoggedIn, setUserLoggedIn] = useState(false);

  // Fetch user profile data
  const fetchUserProfile = async (username) => {
    try {
      const response = await fetch(`${API_BASE_URL}/profile/${username}`);
      const data = await response.json();
      
      if (data.success && data.data) {
        const user = data.data;
        // Parse fullName into firstName and lastName
        const nameParts = user.fullName ? user.fullName.split(' ') : ['', ''];
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ') || '';
        
        setFormData({
          firstName: firstName,
          lastName: lastName,
          email: user.email || '',
          phone: user.phone || '',
          age: user.age || '',
          city: user.location || '',
          isVolunteer: user.skills && user.skills.length > 0,
          skills: user.skills ? user.skills.join(', ') : (user.otherSkill || ''),
          emergencyContact: user.emergencyContact || '',
          bloodType: user.bloodGroup || '',
          medicalConditions: user.medicalConditions || '',
        });
        setUserLoggedIn(true);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load user data on component mount
  useEffect(() => {
    const currentUser = localStorage.getItem('currentUser');
    if (currentUser) {
      try {
        const userData = JSON.parse(currentUser);
        fetchUserProfile(userData.username);
      } catch (error) {
        console.error('Error parsing user data:', error);
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, []);

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  }

  const handleSave = async () => {
    if (!userLoggedIn) {
      alert('Please log in to save your profile changes.');
      return;
    }

    try {
      const currentUser = localStorage.getItem('currentUser');
      if (!currentUser) {
        alert('Session expired. Please log in again.');
        return;
      }

      const userData = JSON.parse(currentUser);
      setLoading(true);

      // Prepare data for update
      const updateData = {
        fullName: `${formData.firstName} ${formData.lastName}`.trim(),
        email: formData.email,
        phone: formData.phone,
        age: formData.age ? parseInt(formData.age) : null,
        location: formData.city,
        bloodGroup: formData.bloodType || null,
        skills: formData.skills ? formData.skills.split(',').map(s => s.trim()).filter(s => s) : [],
        emergencyContact: formData.emergencyContact,
        medicalConditions: formData.medicalConditions,
        isVolunteer: formData.isVolunteer
      };

      const response = await fetch(`${API_BASE_URL}/profile/${userData.username}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData)
      });

      const data = await response.json();

      if (response.ok && data.success) {
        alert('Profile updated successfully!');
        // Update localStorage with new data
        localStorage.setItem('currentUser', JSON.stringify({
          ...userData,
          fullName: updateData.fullName,
          email: updateData.email
        }));
      } else {
        alert(data.message || 'Failed to update profile. Please try again.');
      }
    } catch (error) {
      console.error('Save error:', error);
      alert('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  function handleLogout() {
    if (window.confirm('Are you sure you want to logout? This will clear your session data.')) {
      localStorage.removeItem('currentUser');
      // Reset form data
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        age: "",
        city: "",
        isVolunteer: false,
        skills: "",
        emergencyContact: "",
        bloodType: "",
        medicalConditions: "",
      });
      setUserLoggedIn(false);
      alert('You have been logged out successfully!');
      // Redirect to landing page
      navigate("/");
    }
  }

  // Handle panic button click - uses utility function
  const onPanicButtonClick = () => {
    handlePanicButton(navigate, setLoading);
  };

  // Show loading state
  if (loading) {
    return (
      <div className="account-page">
        <main className="account-main-content">
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <p>Loading profile data...</p>
          </div>
        </main>
      </div>
    );
  }

  // Generate avatar initials
  const getInitials = () => {
    if (formData.firstName && formData.lastName) {
      return (formData.firstName[0] + formData.lastName[0]).toUpperCase();
    } else if (formData.firstName) {
      return formData.firstName[0].toUpperCase();
    } else if (formData.email) {
      return formData.email[0].toUpperCase();
    }
    return "U";
  };

  return (
    <div className="account-page">
      <main className="account-main-content">

        {/* PROFILE CARD */}
        <div className="account-profile-card">
          <div className="account-avatar">{getInitials()}</div>
          <div className="account-profile-info">
            <h2>
              {formData.firstName && formData.lastName 
                ? `${formData.firstName} ${formData.lastName}` 
                : (formData.firstName || "User")
              }
            </h2>
            <p className="account-email">{formData.email || "No email provided"}</p>
            <span className="account-verified-badge">
              {userLoggedIn ? "Verified User" : "Guest User"}
            </span>
          </div>
        </div>

        {/* PERSONAL INFORMATION */}
        <div className="account-section">
          <div className="account-section-header">
            <div className="account-section-icon personal">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </div>
            <div>
              <h3>Personal Information</h3>
              <p className="account-section-subtitle">
                {userLoggedIn 
                  ? "Your profile data has been auto-filled from registration" 
                  : "Update your personal details"
                }
              </p>
            </div>
          </div>

          <div className="account-form">
            <div className="account-form-row">
              <div className="account-form-group">
                <label>First Name</label>
                <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} className="account-input" />
              </div>

              <div className="account-form-group">
                <label>Last Name</label>
                <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} className="account-input" />
              </div>
            </div>

            <div className="account-form-group">
              <label>Email</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} className="account-input" />
            </div>

            <div className="account-form-group">
              <label>Phone</label>
              <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="account-input" />
            </div>

            <div className="account-form-row">
              <div className="account-form-group">
                <label>Age</label>
                <input type="number" name="age" value={formData.age} onChange={handleChange} className="account-input" />
              </div>

              <div className="account-form-group">
                <label>City</label>
                <input type="text" name="city" value={formData.city} onChange={handleChange} className="account-input" />
              </div>
            </div>
          </div>
        </div>

        {/* VOLUNTEER INFORMATION */}
        <div className="account-section">
          <div className="account-section-header">
            <div className="account-section-icon personal">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 21s-6-5.7-6-10a6 6 0 0 1 12 0c0 4.3-6 10-6 10z" />
              </svg>
            </div>
            <div>
              <h3>Volunteer Information</h3>
              <p className="account-section-subtitle">Emergency response availability</p>
            </div>
          </div>

          <div className="account-form">
            <div className="account-form-group">
              <label className="checkbox-label">
                <input type="checkbox" name="isVolunteer" checked={formData.isVolunteer} onChange={handleChange} />
                Working as a Volunteer
              </label>
            </div>

            <div className="account-form-group">
              <label>Skills</label>
              <textarea
                name="skills"
                value={formData.skills}
                onChange={handleChange}
                className="account-input"
                rows="3"
                placeholder="First Aid, Driving, Rescue"
              />
            </div>
          </div>
        </div>

        {/* EMERGENCY INFORMATION */}
        <div className="account-section">
          <div className="account-section-header">
            <div className="account-section-icon emergency">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            </div>
            <div>
              <h3>Emergency Information</h3>
              <p className="account-section-subtitle">Critical details</p>
            </div>
          </div>

          <div className="account-form">
            <div className="account-form-group">
              <label>Emergency Contact</label>
              <input type="text" name="emergencyContact" value={formData.emergencyContact} onChange={handleChange} className="account-input" />
            </div>

            <div className="account-form-row">
              <div className="account-form-group">
                <label>Blood Type</label>
                <input type="text" name="bloodType" value={formData.bloodType} onChange={handleChange} className="account-input" />
              </div>

              <div className="account-form-group">
                <label>Medical Conditions</label>
                <input type="text" name="medicalConditions" value={formData.medicalConditions} onChange={handleChange} className="account-input" />
              </div>
            </div>
          </div>
        </div>

        {/* SAVE BUTTON */}
        <div className="account-save-container">
          <button 
            className="account-save-btn" 
            onClick={handleSave}
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
          {userLoggedIn && (
            <button 
              className="account-save-btn" 
              onClick={handleLogout}
              style={{
                backgroundColor: '#dc3545',
                marginLeft: '10px'
              }}
            >
              Logout
            </button>
          )}
        </div>

      </main>

      {/* SOS BUTTON */}
      <button className="fab" onClick={onPanicButtonClick} disabled={loading}>
        <AlertTriangle />
      </button>
    </div>
  );
}

export default AccountPage;
