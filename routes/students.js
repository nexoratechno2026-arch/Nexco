const express = require('express');
const router = express.Router();
const { db } = require('../config/firebase');
const { requireAdmin } = require('../middleware/auth');
const { logSecurityEvent } = require('../utils/security-logger');

/**
 * GET /api/students
 * List all enrolled students (Admin only)
 */
router.get('/', requireAdmin, async (req, res) => {
  try {
    const snapshot = await db.collection('students').get();
    const students = snapshot.docs.map(doc => doc.data());
    res.json({ success: true, count: students.length, data: students });
  } catch (err) {
    console.error('[Get Students Error]:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/students
 * 1-Click Enroll Student from Lead (Admin only)
 */
router.post('/', requireAdmin, async (req, res) => {
  try {
    const { name, email, phone, enrolledTrack, batch, leadId } = req.body;

    if (!name || !email) {
      return res.status(400).json({ success: false, error: 'Name and email are required.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const id = 'student_' + Date.now();

    const newStudent = {
      id,
      name: name.trim(),
      email: cleanEmail,
      phone: phone ? phone.trim() : '',
      role: 'student',
      status: 'Active Learner',
      enrolledTrack: enrolledTrack || 'Full Stack Web Development (MERN & Python)',
      batch: batch || 'Salem Founding Cohort #1',
      progress: 0,
      enrolledAt: new Date().toISOString()
    };

    await db.collection('students').doc(id).set(newStudent);

    // If enrolled from a lead, mark lead as enrolled
    if (leadId) {
      try {
        await db.collection('leads').doc(leadId).update({
          status: 'Enrolled in LMS',
          enrolledStudentId: id
        });
      } catch (e) {}
    }

    logSecurityEvent({
      action: 'STUDENT_ENROLLED',
      details: `Admin enrolled student ${cleanEmail} in track: ${newStudent.enrolledTrack}`,
      severity: 'INFO',
      req,
      targetId: id
    });

    res.status(201).json({ success: true, data: newStudent });
  } catch (err) {
    console.error('[Enroll Student Error]:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * PUT /api/students/:id
 * Update student info or progress (Admin only)
 */
router.put('/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = Object.assign({}, req.body, { updatedAt: new Date().toISOString() });

    await db.collection('students').doc(id).update(updates);
    const updated = await db.collection('students').doc(id).get();

    logSecurityEvent({
      action: 'STUDENT_UPDATED',
      details: `Admin updated student ${id}`,
      severity: 'INFO',
      req,
      targetId: id
    });

    res.json({ success: true, data: updated.data() });
  } catch (err) {
    console.error('[Update Student Error]:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * DELETE /api/students/:id
 * Remove student (Admin only)
 */
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    await db.collection('students').doc(id).delete();

    logSecurityEvent({
      action: 'STUDENT_REMOVED',
      details: `Admin removed student ${id}`,
      severity: 'WARNING',
      req,
      targetId: id
    });

    res.json({ success: true, message: `Student ${id} removed.` });
  } catch (err) {
    console.error('[Delete Student Error]:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
