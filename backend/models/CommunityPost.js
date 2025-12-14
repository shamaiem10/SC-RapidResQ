const mongoose = require('mongoose');

const communityPostSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['Blood Needed', 'Missing Person', 'Medical Emergency', 'Shelter Needed', 'Food / Water', 'Disaster Help', 'Life in Danger'],
      required: true
    },
    title: {
      type: String,
      required: true,
      minlength: 5,
      maxlength: 100
    },
    description: {
      type: String,
      required: true,
      minlength: 10,
      maxlength: 1000
    },
    location: {
      type: String,
      required: true,
      maxlength: 100
    },
    phone: {
      type: String,
      required: true,
      match: /^[0-9]{10,15}$/ // Phone number validation (10-15 digits)
    },
    author: {
      type: String,
      required: true,
      maxlength: 100
    },
    urgent: {
      type: Boolean,
      default: false
    },
    responses: {
      type: Number,
      default: 0
    },
    // Delivery records for notifications (e.g., volunteers notified/sms/push status)
    deliveries: [{
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      channel: { type: String },
      status: { type: String }, // 'queued' | 'sent' | 'delivered' | 'failed' | 'no-contact'
      ts: { type: Date, default: Date.now },
      info: { type: String }
    }],
    createdAt: {
      type: Date,
      default: Date.now
    },
    updatedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true // Automatically adds createdAt and updatedAt
  }
);

// Index for better query performance
communityPostSchema.index({ type: 1, urgent: -1, createdAt: -1 });
communityPostSchema.index({ location: 1 });

module.exports = mongoose.model('CommunityPost', communityPostSchema);
