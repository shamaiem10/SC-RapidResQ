const User = require('../models/UserSchema');
const CommunityPost = require('../models/CommunityPost');

/**
 * sendSOSAlert
 * - Preconditions: user and post exist, post has location/phone
 * - Postconditions: deliveries recorded on post, panic-alert emitted
 */
async function sendSOSAlert({ user, post, app }) {
  if (!user) throw new Error('User is required');
  if (!post) throw new Error('Post is required');

  const postId = post._id;

  // Basic precondition checks
  if (!user.phone) return { success: false, reason: 'missing_phone' };
  if (!post.location) return { success: false, reason: 'missing_location' };

  // Snapshot volunteers (immutable for this alert)
  const volunteers = await User.find({ isVolunteer: true }).lean();

  const payload = {
    id: postId,
    title: post.title,
    author: post.author,
    location: post.location,
    urgent: !!post.urgent,
    timestamp: new Date().toISOString(),
    message: `${post.title} — ${post.author} (${post.location})`
  };

  // Emit global panic alert immediately (real-time UI update)
  try {
    const io = app && app.locals && app.locals.io;
    if (io) io.emit('panic-alert', payload);
  } catch (err) {
    console.warn('sendSOSAlert: emit failed', err.message);
  }

  // Record deliveries
  const deliveries = [];

  for (const v of volunteers) {
    // Skip if same as alert author (avoid notifying self)
    if (v.username && post.author && v.username.toLowerCase() === post.author.toLowerCase()) continue;

    const hasContact = !!(v.phone && v.phone.replace(/\D/g, '').length >= 10);
    const status = hasContact ? 'queued' : 'no-contact';

    deliveries.push({
      userId: v._id,
      channel: hasContact ? 'sms' : 'none',
      status,
      ts: new Date(),
      info: hasContact ? 'queued for delivery' : 'no contact info'
    });
  }

  // Update post with deliveries (append)
  try {
    await CommunityPost.findByIdAndUpdate(postId, { $push: { deliveries: { $each: deliveries } } });
  } catch (err) {
    console.error('sendSOSAlert: failed to update post deliveries', err.message);
    return { success: false, reason: 'db_update_failed' };
  }

  return { success: true, volunteerCount: volunteers.length, deliveriesCount: deliveries.length };
}

module.exports = { sendSOSAlert };
