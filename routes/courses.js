const express = require('express');
const router = express.Router();
const { db } = require('../config/firebase');
const { requireAdmin } = require('../middleware/auth');
const { logSecurityEvent } = require('../utils/security-logger');

/**
 * GET /api/courses
 * List all courses
 */
router.get('/', async (req, res) => {
  try {
    const snapshot = await db.collection('courses').get();
    const courses = snapshot.docs.map(doc => doc.data());
    res.json({ success: true, count: courses.length, data: courses });
  } catch (err) {
    console.error('[Get Courses Error]:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/courses
 * Add new course (Admin only)
 */
router.post('/', requireAdmin, async (req, res) => {
  try {
    const courseData = req.body;
    if (!courseData.title) {
      return res.status(400).json({ success: false, error: 'Course title is required.' });
    }

    const id = courseData.id || ('course_' + Date.now());
    const newCourse = Object.assign({}, courseData, {
      id,
      jointTrack: 'Nexora Techno × Gencode',
      updatedAt: new Date().toISOString()
    });

    await db.collection('courses').doc(id).set(newCourse);

    logSecurityEvent({
      action: 'COURSE_CREATED',
      details: `Admin created course "${newCourse.title}"`,
      severity: 'INFO',
      req,
      targetId: id
    });

    res.status(201).json({ success: true, data: newCourse });
  } catch (err) {
    console.error('[Add Course Error]:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * PUT /api/courses/:id
 * Update course (Admin only)
 */
router.put('/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = Object.assign({}, req.body, { updatedAt: new Date().toISOString() });

    await db.collection('courses').doc(id).update(updates);
    const updated = await db.collection('courses').doc(id).get();

    logSecurityEvent({
      action: 'COURSE_UPDATED',
      details: `Admin modified course ${id}`,
      severity: 'INFO',
      req,
      targetId: id
    });

    res.json({ success: true, data: updated.data() });
  } catch (err) {
    console.error('[Update Course Error]:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * DELETE /api/courses/:id
 * Delete course (Admin only)
 */
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    await db.collection('courses').doc(id).delete();

    logSecurityEvent({
      action: 'COURSE_DELETED',
      details: `Admin deleted course ${id}`,
      severity: 'WARNING',
      req,
      targetId: id
    });

    res.json({ success: true, message: `Course ${id} deleted successfully.` });
  } catch (err) {
    console.error('[Delete Course Error]:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
