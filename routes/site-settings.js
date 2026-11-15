const express = require('express');
const router = express.Router();
const { db } = require('../config/firebase');
const { requireAdmin } = require('../middleware/auth');
const { logSecurityEvent } = require('../utils/security-logger');

const DEFAULT_SETTINGS = {
  announcement: {
    active: true,
    badge: "100% Live Online Cohort",
    text: "Founding Batch Admissions Open — 100% Live Interactive Online Classes with Live Mentors | Powered by Nexora Techno & Gencode",
    ctaText: "Join Free Workshop ↗",
    ctaLink: "#workshops"
  },
  hero: {
    collaborationBadge: "🤝 An Official Collaboration of Nexora Techno & Gencode",
    headline: "Become the Professional the Future of Technology Demands.",
    subheadline: "100% Live Interactive Online Classes — Learn from anywhere with hands-on project building, direct screen-share code reviews, and bilingual mentor guidance in Tamil & English.",
    primaryCtaText: "Explore Flagship Programs ↗",
    secondaryCtaText: "Join Free Live Masterclass",
    counselingCardTitle: "Get Personalized Course Plan from Our Team",
    counselingCardSubtitle: "Speak directly with an engineering mentor online in < 15 mins."
  },
  promoBanner: {
    badge: "Joint Venture Launch",
    title: "Founding Online Cohort Admissions Open — Build Real Projects with Industry Mentors",
    subtitle: "Join the inaugural online cohort jointly delivered by Nexora Techno & Gencode. Strict 30-seat cap per track. 100% Live Online Interactive Sessions, verified GitHub portfolios, and direct bilingual mentorship."
  },
  bento: {
    card1Title: "100% Live Online Interactive Sessions",
    card1Desc: "Attend live weekend & weekday evening sessions with screen sharing, live coding labs, and zero boring pre-recorded slide decks.",
    card2Title: "Hands-On Real-World Project Building",
    card2Desc: "Build production-grade distributed microservices, semantic vector RAG architectures, and design token systems shipped live to the cloud.",
    card3Title: "Direct 1-on-1 Live Screen-Share Code & Design Reviews",
    card3Desc: "Senior Staff Architects review every Pull Request line-by-line via live screen-share with bilingual mentoring in Tamil & English."
  },
  charter: [
    {
      title: "Zero Fake Placement Guarantees",
      desc: "No exaggerated CTC or fake hike claims. Real tech hiring depends on demonstrable engineering competence, deep fundamentals, and clean problem solving."
    },
    {
      title: "Build & Deploy Live Production Projects",
      desc: "No toy todo-apps or clone tutorials. Every learner engineers distributed microservices, semantic vector pipelines, and production design systems."
    },
    {
      title: "Direct Mentor Code Reviews & Bilingual Guidance",
      desc: "Senior engineers review your Pull Requests line by line over live video with clear Tamil & English guidance."
    },
    {
      title: "Verified Collaboration Certificate & Portfolio Proof",
      desc: "Proof of engineering competence verified jointly by Nexora Techno & Gencode with verifiable credentials."
    }
  ],
  contact: {
    phone: "+91 93451 21988",
    whatsapp: "+91 93451 21988",
    email: "admissions@nexco.in",
    address: "15/2, Sankar Nagar, Salem - 636007, Tamil Nadu, India",
    displayAddress: "15/2, Sankar Nagar, Salem-7 (Registered HQ)",
    hours: "10:00 AM – 8:00 PM IST (Mon – Sat) • 100% Live Online Batches",
    languages: "Tamil & English Bilingual Mentorship"
  }
};

/**
 * GET /api/site-settings
 * Returns current public site settings
 */
router.get('/', async (req, res) => {
  try {
    const doc = await db.collection('site_settings').doc('main').get();
    if (doc.exists) {
      const data = Object.assign({}, DEFAULT_SETTINGS, doc.data());
      return res.json({ success: true, data });
    }
    // Return default settings
    res.json({ success: true, data: DEFAULT_SETTINGS });
  } catch (err) {
    console.error('[Get Site Settings Error]:', err);
    res.json({ success: true, data: DEFAULT_SETTINGS });
  }
});

/**
 * PUT /api/site-settings
 * Admin updates site settings in real-time
 */
router.put('/', requireAdmin, async (req, res) => {
  try {
    const updates = req.body;
    if (!updates || typeof updates !== 'object') {
      return res.status(400).json({ success: false, error: 'Invalid settings payload.' });
    }

    const currentDoc = await db.collection('site_settings').doc('main').get();
    const existing = currentDoc.exists ? currentDoc.data() : DEFAULT_SETTINGS;

    const merged = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString(),
      updatedBy: req.user ? req.user.email : 'admin'
    };

    await db.collection('site_settings').doc('main').set(merged, { merge: true });

    logSecurityEvent({
      action: 'SITE_SETTINGS_UPDATED',
      details: 'Admin updated site CMS settings and branding',
      severity: 'INFO',
      req,
      targetId: 'main'
    });

    // Also sync announcement if included in payload
    if (updates.announcement) {
      try {
        await db.collection('announcements').doc('top_banner').set(updates.announcement, { merge: true });
      } catch (e) {}
    }

    res.json({
      success: true,
      message: 'Site settings and CMS content updated successfully!',
      data: merged
    });
  } catch (err) {
    console.error('[Update Site Settings Error]:', err);
    res.status(500).json({ success: false, error: err.message || 'Failed to update site settings.' });
  }
});

module.exports = router;
