const express = require('express');
const router = express.Router();
const { db } = require('../config/firebase');
const { requireAdmin } = require('../middleware/auth');

/**
 * GET /api/feedbacks
 * Return approved feedbacks for public, or all feedbacks for Admin
 */
router.get('/', async (req, res) => {
  try {
    const isAdmin = req.user && req.user.isAdmin;
    let snapshot;

    if (isAdmin) {
      snapshot = await db.collection('feedbacks').get();
    } else {
      snapshot = await db.collection('feedbacks').where('approved', '==', true).get();
    }

    const feedbacks = snapshot.docs.map(doc => doc.data());
    res.json({ success: true, count: feedbacks.length, data: feedbacks });
  } catch (err) {
    console.error('[Get Feedbacks Error]:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/feedbacks
 * Submit workshop / early learner feedback
 */
router.post('/', async (req, res) => {
  try {
    const { name, role, city, content, rating } = req.body;

    if (!name || !content) {
      return res.status(400).json({ success: false, error: 'Name and feedback content are required.' });
    }

    const id = 'fb_' + Date.now();
    const newFeedback = {
      id,
      name: name.trim(),
      role: (role || 'Workshop Participant').trim(),
      city: (city || 'Salem').trim(),
      content: content.trim(),
      rating: Number(rating) || 5,
      approved: false, // Moderated by Admin
      date: new Date().toISOString().split('T')[0]
    };

    await db.collection('feedbacks').doc(id).set(newFeedback);
    res.status(201).json({
      success: true,
      message: 'Thank you for your honest feedback! Your submission will appear after mentor verification.',
      data: newFeedback
    });
  } catch (err) {
    console.error('[Submit Feedback Error]:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * PUT /api/feedbacks/:id/approve
 * Approve feedback (Admin only)
 */
router.put('/:id/approve', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    await db.collection('feedbacks').doc(id).update({ approved: true, approvedAt: new Date().toISOString() });
    const updated = await db.collection('feedbacks').doc(id).get();
    res.json({ success: true, data: updated.data() });
  } catch (err) {
    console.error('[Approve Feedback Error]:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * DELETE /api/feedbacks/:id
 * Delete feedback (Admin only)
 */
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    await db.collection('feedbacks').doc(id).delete();
    res.json({ success: true, message: `Feedback ${id} removed.` });
  } catch (err) {
    console.error('[Delete Feedback Error]:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
