// backend/models/Volunteer.js
const mongoose = require('mongoose');

const VolunteerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  available: { type: Boolean, default: true } // Only available volunteers receive alerts
});

module.exports = mongoose.model('Volunteer', VolunteerSchema);
