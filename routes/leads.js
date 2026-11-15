const express = require('express');
const router = express.Router();
const { db } = require('../config/firebase');
const { requireAdmin } = require('../middleware/auth');
const { validateLeadPayload } = require('../middleware/validate');
const { logSecurityEvent } = require('../utils/security-logger');

/**
 * GET /api/leads
 * Get all captured leads (Admin only)
 */
router.get('/', requireAdmin, async (req, res) => {
  try {
    const snapshot = await db.collection('leads').get();
    const leads = snapshot.docs.map(doc => doc.data());
    res.json({ success: true, count: leads.length, data: leads });
  } catch (err) {
    console.error('[Get Leads Error]:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/leads
 * Public Lead Capture with Invisible Bot Honeypot & Strict Allowlist
 */
router.post('/', validateLeadPayload, async (req, res) => {
  try {
    const { name, email, phone, city, track, timing, source, honeypot, website_url } = req.body;

    // 1. Invisible Bot Honeypot Check:
    // If the hidden website_url or honeypot field is filled, silently discard without saving
    if ((website_url && website_url.trim()) || (honeypot && honeypot.trim())) {
      logSecurityEvent({
        action: 'BOT_HONEYPOT_TRIGGERED',
        details: `Automated spam submission trapped. Fake field value: "${website_url || honeypot}"`,
        severity: 'WARNING',
        req,
        actorEmail: email
      });
      // Silently return 201 so bot believes it succeeded while zero database pollution occurs
      return res.status(201).json({
        success: true,
        message: 'Counseling inquiry received! Our senior engineer from Salem will contact you within 15 minutes.',
        data: { id: 'bot_trapped_' + Date.now(), name, email, phone }
      });
    }

    const id = 'lead_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4);
    const newLead = {
      id,
      name,
      email,
      phone,
      city: city || 'Salem',
      track,
      timing: timing || '100% Live Online (Weekend / Weekday Evening)',
      source: source || 'Hero Counseling Form',
      status: 'New Inquiry',
      createdAt: new Date().toISOString()
    };

    await db.collection('leads').doc(id).set(newLead);

    logSecurityEvent({
      action: 'LEAD_CAPTURED',
      details: `Lead captured for track: ${track}`,
      severity: 'INFO',
      req,
      actorEmail: email,
      targetId: id
    });

    res.status(201).json({
      success: true,
      message: 'Counseling inquiry received! Our senior engineer from Salem will contact you within 15 minutes.',
      data: newLead
    });
  } catch (err) {
    console.error('[Capture Lead Error]:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * PUT /api/leads/:id
 * Update lead status (Admin only)
 */
router.put('/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    const leadRef = db.collection('leads').doc(id);
    const doc = await leadRef.get();
    if (!doc.exists) {
      return res.status(404).json({ success: false, error: 'Lead not found.' });
    }

    const updates = {
      updatedAt: new Date().toISOString()
    };
    if (status) updates.status = status;
    if (notes !== undefined) updates.notes = notes;

    await leadRef.update(updates);
    const updated = await leadRef.get();

    logSecurityEvent({
      action: 'LEAD_STATUS_UPDATED',
      details: `Lead ${id} updated to status "${status}"`,
      severity: 'INFO',
      req,
      targetId: id
    });

    res.json({ success: true, data: updated.data() });
  } catch (err) {
    console.error('[Update Lead Error]:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * DELETE /api/leads/:id
 * Delete lead (Admin only)
 */
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    await db.collection('leads').doc(id).delete();

    logSecurityEvent({
      action: 'LEAD_DELETED',
      details: `Lead ${id} permanently removed`,
      severity: 'WARNING',
      req,
      targetId: id
    });

    res.json({ success: true, message: `Lead ${id} deleted successfully.` });
  } catch (err) {
    console.error('[Delete Lead Error]:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
