// routes/alerts.js
const express = require('express');
const router = express.Router();
const CommunityPost = require('../models/CommunityPost');

// GET /api/alerts/latest
// Fetch latest 5 urgent posts
router.get('/latest', async (req, res) => {
  try {
    const alerts = await CommunityPost.find({ urgent: true })
      .sort({ createdAt: -1 })
      .limit(5);
    res.json({ success: true, alerts });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to fetch alerts' });
  }
});

module.exports = router;
