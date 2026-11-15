const express = require('express');
const router = express.Router();
const { db } = require('../config/firebase');
const { requireAdmin } = require('../middleware/auth');

/**
 * GET /api/announcements
 * Get active top banner announcement
 */
router.get('/', async (req, res) => {
  try {
    const doc = await db.collection('announcements').doc('top_banner').get();
    if (doc.exists) {
      return res.json({ success: true, data: doc.data() });
    }
    const defaultBanner = {
      active: true,
      text: "Founding Cohort Admissions Open in Salem & Online — 100% Practical Projects • Powered by Nexora Techno & Gencode",
      badge: "Salem Founding Batch"
    };
    res.json({ success: true, data: defaultBanner });
  } catch (err) {
    console.error('[Get Announcement Error]:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * PUT /api/announcements
 * Update announcement banner (Admin only)
 */
router.put('/', requireAdmin, async (req, res) => {
  try {
    const { active, text, badge } = req.body;
    const banner = {
      active: active !== undefined ? !!active : true,
      text: text || "Founding Cohort Admissions Open in Salem & Online — 100% Practical Projects • Powered by Nexora Techno & Gencode",
      badge: badge || "Salem Founding Batch",
      updatedAt: new Date().toISOString()
    };

    await db.collection('announcements').doc('top_banner').set(banner, { merge: true });
    res.json({ success: true, data: banner });
  } catch (err) {
    console.error('[Update Announcement Error]:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
