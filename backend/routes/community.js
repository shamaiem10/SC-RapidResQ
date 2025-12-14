/**
 * Community Routes
 * Demonstrates:
 * - Recursion for nested replies
 * - Regex for validation
 * - Grammar/structured checks for fields
 */

const express = require('express');
const router = express.Router();
const CommunityPost = require('../models/CommunityPost');

// Regex patterns
const phoneRegex = /^[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,9}$/;
const titleRegex = /^[A-Za-z0-9\s\-\_\!\?\.]{3,100}$/; // letters, numbers, basic punctuation
const locationRegex = /^[A-Za-z\s]{2,50}$/; // letters + spaces, 2-50 chars

// -------------------- HELPER FUNCTIONS --------------------

// Recursive function to validate nested replies
const validateReplies = (replies) => {
  if (!Array.isArray(replies)) return false;

  for (const reply of replies) {
    if (typeof reply.author !== 'string' || reply.author.trim().length < 2) return false;
    if (typeof reply.message !== 'string' || reply.message.trim().length < 5) return false;

    // Recursive check if nested replies exist
    if (reply.replies && reply.replies.length > 0) {
      if (!validateReplies(reply.replies)) return false;
    }
  }

  return true;
};

// -------------------- ROUTES --------------------

// GET all posts with optional filtering
router.get('/community/posts', async (req, res) => {
  try {
    const { type, urgent, location } = req.query;
    const filter = {};

    // Grammar check for type
    if (type && type !== 'All') filter.type = type;

    if (urgent === 'true') filter.urgent = true;

    if (location) filter.location = new RegExp(location, 'i'); // Regex search

    const posts = await CommunityPost.find(filter)
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({ success: true, count: posts.length, posts });
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({ success: false, message: 'Error fetching posts', error: error.message });
  }
});

// GET single post by ID
router.get('/community/posts/:id', async (req, res) => {
  try {
    const post = await CommunityPost.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });

    // Validate replies recursively
    if (post.replies && !validateReplies(post.replies)) {
      console.warn('Post contains invalid nested replies');
    }

    res.json({ success: true, post });
  } catch (error) {
    console.error('Error fetching post:', error);
    res.status(500).json({ success: false, message: 'Error fetching post', error: error.message });
  }
});

// CREATE new post
router.post('/community/posts', async (req, res) => {
  try {
    const { type, title, description, location, phone, author, urgent } = req.body;

    // Regex & grammar validations
    if (!type || !title || !description || !location || !phone || !author) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }
    if (!titleRegex.test(title)) return res.status(400).json({ success: false, message: 'Title contains invalid characters' });
    if (!locationRegex.test(location)) return res.status(400).json({ success: false, message: 'Location is invalid' });
    if (!phoneRegex.test(phone)) return res.status(400).json({ success: false, message: 'Phone number is invalid' });

    const newPost = new CommunityPost({
      type,
      title,
      description,
      location,
      phone,
      author,
      urgent: urgent || false,
      responses: 0,
      replies: []
    });

    await newPost.save();

    res.status(201).json({ success: true, message: 'Post created successfully', post: newPost });
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({ success: false, message: 'Error creating post', error: error.message });
  }
});

// UPDATE post by ID
router.put('/community/posts/:id', async (req, res) => {
  try {
    const { type, title, description, location, phone, author, urgent } = req.body;

    // Grammar & regex validations
    if (!type || !title || !description || !location || !phone || !author) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }
    if (!titleRegex.test(title)) return res.status(400).json({ success: false, message: 'Title contains invalid characters' });
    if (!locationRegex.test(location)) return res.status(400).json({ success: false, message: 'Location is invalid' });
    if (!phoneRegex.test(phone)) return res.status(400).json({ success: false, message: 'Phone number is invalid' });

    const updatedPost = await CommunityPost.findByIdAndUpdate(
      req.params.id,
      { type, title, description, location, phone, author, urgent },
      { new: true, runValidators: true }
    );

    if (!updatedPost) return res.status(404).json({ success: false, message: 'Post not found' });

    res.json({ success: true, message: 'Post updated successfully', post: updatedPost });
  } catch (error) {
    console.error('Error updating post:', error);
    res.status(500).json({ success: false, message: 'Error updating post', error: error.message });
  }
});

// DELETE post by ID
router.delete('/community/posts/:id', async (req, res) => {
  try {
    const deletedPost = await CommunityPost.findByIdAndDelete(req.params.id);
    if (!deletedPost) return res.status(404).json({ success: false, message: 'Post not found' });

    res.json({ success: true, message: 'Post deleted successfully', post: deletedPost });
  } catch (error) {
    console.error('Error deleting post:', error);
    res.status(500).json({ success: false, message: 'Error deleting post', error: error.message });
  }
});

// INCREMENT responses count (supports recursive nested replies)
router.post('/community/posts/:id/respond', async (req, res) => {
  try {
    const { reply } = req.body;

    if (!reply || typeof reply.author !== 'string' || typeof reply.message !== 'string') {
      return res.status(400).json({ success: false, message: 'Reply must contain author and message' });
    }

    // Recursive function to add reply
    const addReplyRecursively = async (postId, replyObj, parentReplyId = null) => {
      const post = await CommunityPost.findById(postId);

      if (!post) throw new Error('Post not found');

      if (!parentReplyId) {
        // top-level reply
        post.replies.push({ ...replyObj, replies: [] });
      } else {
        const findParent = (replies) => {
          for (let r of replies) {
            if (r._id.toString() === parentReplyId) return r;
            if (r.replies && r.replies.length > 0) {
              const found = findParent(r.replies);
              if (found) return found;
            }
          }
          return null;
        };
        const parent = findParent(post.replies);
        if (!parent) throw new Error('Parent reply not found');
        parent.replies.push({ ...replyObj, replies: [] });
      }

      await post.save();
      return post;
    };

    const post = await addReplyRecursively(req.params.id, reply, req.body.parentReplyId || null);

    res.json({ success: true, message: 'Reply added successfully', post });
  } catch (error) {
    console.error('Error adding reply:', error);
    res.status(500).json({ success: false, message: 'Error adding reply', error: error.message });
  }
});

module.exports = router;
