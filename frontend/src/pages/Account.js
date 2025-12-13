import React, { useState } from "react";
import "./Account.css";
import { AlertTriangle } from "lucide-react";

function AccountPage() {
  const [formData, setFormData] = useState({
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@example.com",
    phone: "+1 234 567 8900",
    age: "",
    city: "",
    isVolunteer: false,
    skills: "",
    emergencyContact: "",
    bloodType: "",
    medicalConditions: "",
  });

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  }

  function handleSave() {
    console.log("Saving changes:", formData);
  }

  return (
    <div className="account-page">
      <main className="account-main-content">

        {/* PROFILE CARD */}
        <div className="account-profile-card">
          <div className="account-avatar">JD</div>
          <div className="account-profile-info">
            <h2>{formData.firstName} {formData.lastName}</h2>
            <p className="account-email">{formData.email}</p>
            <span className="account-verified-badge">Verified User</span>
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
              <p className="account-section-subtitle">Update your personal details</p>
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
          <button className="account-save-btn" onClick={handleSave}>
            Save Changes
          </button>
        </div>

      </main>

      {/* SOS BUTTON */}
      <button className="fab">
        <AlertTriangle />
      </button>
    </div>
  );
}

export default AccountPage;
