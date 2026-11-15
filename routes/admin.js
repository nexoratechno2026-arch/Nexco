const express = require('express');
const router = express.Router();
const { db } = require('../config/firebase');
const { requireAdmin } = require('../middleware/auth');
const { logSecurityEvent } = require('../utils/security-logger');
const { getLockedTargets, unlockTarget } = require('../utils/login-limiter');

/**
 * GET /api/admin/dashboard
 * Protected Dashboard Stats (Admin Only)
 */
router.get('/dashboard', requireAdmin, async (req, res) => {
  try {
    const [leadsSnap, studentsSnap, coursesSnap, workshopsSnap, logsSnap] = await Promise.all([
      db.collection('leads').get(),
      db.collection('students').get(),
      db.collection('courses').get(),
      db.collection('workshops').get(),
      db.collection('security_logs').get()
    ]);

    res.json({
      success: true,
      data: {
        totalLeads: leadsSnap.docs.length,
        totalStudents: studentsSnap.docs.length,
        totalCourses: coursesSnap.docs.length,
        totalWorkshops: workshopsSnap.docs.length,
        totalSecurityEvents: logsSnap.docs.length,
        systemStatus: 'ONLINE',
        securityStatus: 'ZERO_TRUST_ACTIVE',
        lastUpdated: new Date().toISOString()
      }
    });
  } catch (err) {
    console.error('[Admin Dashboard Error]:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/admin/security-logs
 * Protected: Live Security Threat & Audit Trail (Admin Only)
 */
router.get('/security-logs', requireAdmin, async (req, res) => {
  try {
    const snapshot = await db.collection('security_logs').get();
    const logs = snapshot.docs.map(doc => doc.data());

    // Sort descending by timestamp, return latest 60
    logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    const latestLogs = logs.slice(0, 60);

    res.json({
      success: true,
      count: latestLogs.length,
      total: logs.length,
      data: latestLogs
    });
  } catch (err) {
    console.error('[Get Security Logs Error]:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/admin/run-tests
 * Protected: Runs automated QA & System tests and returns results (Admin Only)
 */
router.post('/run-tests', requireAdmin, async (req, res) => {
  try {
    logSecurityEvent({
      action: 'QA_AUTOMATION_SUITE_TRIGGERED',
      details: 'Admin triggered full system QA & OWASP verification suite',
      severity: 'INFO',
      req
    });

    const { runFullQASuite } = require('../tests/qa-suite');
    const results = await runFullQASuite();
    res.json({ success: true, results });
  } catch (err) {
    console.error('[Admin Test Runner Error]:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/admin/locked-targets
 * Protected: List of accounts and IPs locked due to failed logins (Admin Only)
 */
router.get('/locked-targets', requireAdmin, (req, res) => {
  try {
    const list = getLockedTargets();
    res.json({ success: true, count: list.length, data: list });
  } catch (err) {
    console.error('[Get Locked Targets Error]:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/admin/unlock-target
 * Protected: 1-Click unlock target email or IP and reset attempt counters (Admin Only)
 */
router.post('/unlock-target', requireAdmin, (req, res) => {
  try {
    const { target } = req.body;
    if (!target) {
      return res.status(400).json({ success: false, error: 'Target email or IP is required.' });
    }

    const unlocked = unlockTarget(target);
    logSecurityEvent({
      action: 'ADMIN_UNLOCKED_USER',
      details: `Admin unlocked target and reset login attempts: ${target}`,
      severity: 'INFO',
      req,
      actorEmail: req.user ? req.user.email : 'admin@nexco.in'
    });

    res.json({
      success: true,
      unlocked,
      message: `Login attempts reset and lockout cleared for ${target}.`
    });
  } catch (err) {
    console.error('[Unlock Target Error]:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
