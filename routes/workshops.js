const express = require('express');
const router = express.Router();
const { db } = require('../config/firebase');
const { requireAdmin } = require('../middleware/auth');
const { logSecurityEvent } = require('../utils/security-logger');

/**
 * GET /api/workshops
 * List all live and upcoming masterclasses / workshops
 */
router.get('/', async (req, res) => {
  try {
    const snapshot = await db.collection('workshops').get();
    const workshops = snapshot.docs.map(doc => doc.data());
    res.json({ success: true, count: workshops.length, data: workshops });
  } catch (err) {
    console.error('[Get Workshops Error]:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/workshops
 * Schedule a new workshop (Admin only)
 */
router.post('/', requireAdmin, async (req, res) => {
  try {
    const workshopData = req.body;
    if (!workshopData.title) {
      return res.status(400).json({ success: false, error: 'Workshop title is required.' });
    }

    const id = workshopData.id || ('ws_' + Date.now());
    const newWorkshop = Object.assign({}, workshopData, {
      id,
      isLive: !!workshopData.isLive,
      createdAt: new Date().toISOString()
    });

    await db.collection('workshops').doc(id).set(newWorkshop);

    logSecurityEvent({
      action: 'WORKSHOP_CREATED',
      details: `Admin scheduled workshop "${newWorkshop.title}"`,
      severity: 'INFO',
      req,
      targetId: id
    });

    res.status(201).json({ success: true, data: newWorkshop });
  } catch (err) {
    console.error('[Schedule Workshop Error]:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * PUT /api/workshops/:id
 * Update workshop or toggle LIVE status (Admin only)
 */
router.put('/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = Object.assign({}, req.body, { updatedAt: new Date().toISOString() });

    await db.collection('workshops').doc(id).update(updates);
    const updated = await db.collection('workshops').doc(id).get();

    logSecurityEvent({
      action: updates.isLive !== undefined ? 'WORKSHOP_LIVE_TOGGLED' : 'WORKSHOP_UPDATED',
      details: `Admin updated workshop ${id} (isLive: ${updates.isLive}, status: ${updates.status || 'unchanged'})`,
      severity: 'INFO',
      req,
      targetId: id
    });

    res.json({ success: true, data: updated.data() });
  } catch (err) {
    console.error('[Update Workshop Error]:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * DELETE /api/workshops/:id
 * Delete workshop (Admin only)
 */
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    await db.collection('workshops').doc(id).delete();

    logSecurityEvent({
      action: 'WORKSHOP_DELETED',
      details: `Admin deleted workshop ${id}`,
      severity: 'WARNING',
      req,
      targetId: id
    });

    res.json({ success: true, message: `Workshop ${id} deleted successfully.` });
  } catch (err) {
    console.error('[Delete Workshop Error]:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
