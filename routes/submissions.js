const express = require('express');
const router = express.Router();
const { db } = require('../config/firebase');
const { requireAuth, requireAdmin } = require('../middleware/auth');
const { validateSubmissionPayload } = require('../middleware/validate');
const { logSecurityEvent } = require('../utils/security-logger');

/**
 * GET /api/submissions
 * Get submissions
 */
router.get('/', requireAuth, async (req, res) => {
  try {
    const isAdmin = req.user.isAdmin;
    let snapshot;

    if (isAdmin) {
      snapshot = await db.collection('submissions').get();
    } else {
      snapshot = await db.collection('submissions').where('studentEmail', '==', req.user.email).get();
    }

    const submissions = snapshot.docs.map(doc => doc.data());
    res.json({ success: true, count: submissions.length, data: submissions });
  } catch (err) {
    console.error('[Get Submissions Error]:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/submissions
 * Submit Capstone Project with SSRF & URL allowlist validation
 */
router.post('/', requireAuth, validateSubmissionPayload, async (req, res) => {
  try {
    const { title, track, repoUrl, deployUrl, notes } = req.body;

    const id = 'sub_' + Date.now();
    const newSubmission = {
      id,
      studentId: req.user.uid,
      studentName: req.user.name || 'Enrolled Student',
      studentEmail: req.user.email,
      title: (title || 'Cohort Capstone Architecture').trim(),
      track: track || 'Full Stack Web Development (MERN & Python)',
      repoUrl: repoUrl.trim(),
      deployUrl: (deployUrl || '').trim(),
      notes: (notes || '').trim(),
      status: 'Under Mentor Review',
      submittedAt: new Date().toISOString()
    };

    await db.collection('submissions').doc(id).set(newSubmission);

    logSecurityEvent({
      action: 'CAPSTONE_SUBMITTED',
      details: `Student submitted capstone repo: ${repoUrl}`,
      severity: 'INFO',
      req,
      targetId: id
    });

    res.status(201).json({
      success: true,
      message: 'Capstone project submitted successfully to Nexco Mentor Review queue!',
      data: newSubmission
    });
  } catch (err) {
    console.error('[Submit Capstone Error]:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * PUT /api/submissions/:id
 * Review & certify capstone (Admin only)
 */
router.put('/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, reviewNotes, grade } = req.body;

    const updates = {
      status: status || 'Approved & Certified',
      reviewNotes: reviewNotes || 'Verified production architecture. Clean git commits.',
      grade: grade || 'Grade A (Distinction)',
      reviewedAt: new Date().toISOString(),
      reviewedBy: 'Staff Engineer (Nexora × Gencode)'
    };

    await db.collection('submissions').doc(id).update(updates);
    const updated = await db.collection('submissions').doc(id).get();

    logSecurityEvent({
      action: 'CAPSTONE_REVIEWED',
      details: `Capstone ${id} reviewed with grade "${updates.grade}"`,
      severity: 'INFO',
      req,
      targetId: id
    });

    res.json({ success: true, data: updated.data() });
  } catch (err) {
    console.error('[Review Capstone Error]:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
