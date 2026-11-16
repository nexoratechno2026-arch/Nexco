const express = require('express');
const router = express.Router();
const { db } = require('../config/firebase');
const { requireAdmin } = require('../middleware/auth');
const { logSecurityEvent } = require('../utils/security-logger');

const DEFAULT_SETTINGS = {
  bannerVisible: true,
  bannerBadge: "Live Online Batches",
  bannerText: "Admissions open for our upcoming live online batches. Learn in Tamil & English.",
  bannerCtaText: "Book a free demo session →",
  bannerCtaLink: "#workshops",
  heroCollabBadge: "Nexora Techno × Gencode",
  heroHeadline: "Learn to build real software with working engineers.",
  heroSubheadline: "Skip the recorded theory videos. Join our live online classes, write code alongside mentors, get your projects reviewed on screen, and build a solid GitHub portfolio.",
  heroPrimaryCta: "View Courses",
  heroSecondaryCta: "Attend a Free Live Class",
  leadCardTitle: "Not sure which track fits you?",
  leadCardSubtitle: "Drop your details. One of our mentors will call or WhatsApp you to help you pick the right starting point.",
  promoBadge: "New Batch Starting Soon",
  promoHeadline: "Small batches. Direct mentor support.",
  promoSubtitle: "We keep our online batches limited to 30 students so everyone can unmute, share their screen, and get their doubts cleared on the spot.",
  bento1Title: "Live classes, not video dumps",
  bento1Desc: "Every class happens live online. Stuck on an error? Share your screen and fix it together with your mentor.",
  bento2Title: "Build projects from week one",
  bento2Desc: "You will build and host full working applications from scratch instead of copying toy examples.",
  bento3Title: "Line-by-line code & design reviews",
  bento3Desc: "Before you finish a module, our mentors check your code and UI designs and show you how to improve them.",
  phone: "+91 93451 21988",
  email: "admissions@nexco.in",
  registeredAddress: "15/2, Sankar Nagar, Salem-7 (Registered HQ & Admin Office)",
  displayAddress: "15/2, Sankar Nagar, Salem-7, Tamil Nadu",

  announcement: {
    active: true,
    badge: "Live Online Batches",
    text: "Admissions open for our upcoming live online batches. Learn in Tamil & English.",
    ctaText: "Book a free demo session →",
    ctaLink: "#workshops"
  },
  hero: {
    badge: "Nexora Techno × Gencode",
    collaborationBadge: "Nexora Techno × Gencode",
    subBadge: "Live Online Classes • Taught in Tamil & English",
    headline: "Learn to build real software with working engineers.",
    subheadline: "Skip the recorded theory videos. Join our live online classes, write code alongside mentors, get your projects reviewed on screen, and build a solid GitHub portfolio.",
    ctaPrimaryText: "View Courses",
    primaryCtaText: "View Courses",
    ctaSecondaryText: "Attend a Free Live Class ▷",
    secondaryCtaText: "Attend a Free Live Class ▷",
    leadCardTitle: "Not sure which track fits you?",
    counselingCardTitle: "Not sure which track fits you?",
    leadCardSub: "Drop your details. One of our mentors will call or WhatsApp you to help you pick the right starting point.",
    counselingCardSubtitle: "Drop your details. One of our mentors will call or WhatsApp you to help you pick the right starting point."
  },
  promoBanner: {
    badge: "New Batch Starting Soon",
    title: "Small batches. Direct mentor support.",
    subtitle: "We keep our online batches limited to 30 students so everyone can unmute, share their screen, and get their doubts cleared on the spot."
  },
  bento: {
    card1Title: "Live classes, not video dumps",
    card1Desc: "Every class happens live online. Stuck on an error? Share your screen and fix it together with your mentor.",
    card2Title: "Build projects from week one",
    card2Desc: "You won't just follow along with simple tutorials. You will build and deploy real applications with user logins, databases, and clean code.",
    card3Title: "Line-by-line code & design reviews",
    card3Desc: "Mentors review your GitHub pull requests line by line. We discuss what to improve in clear Tamil and English so you learn how engineering teams work."
  },
  charter: [
    {
      title: "No fake placement guarantees",
      desc: "We don't sell 100% placement hype or inflated salary claims. Companies hire people who can build and solve problems. We teach you how to write good code and help you build a portfolio that speaks for itself."
    },
    {
      title: "Real projects, not cloned tutorials",
      desc: "You will build and deploy real web applications with databases, authentication, and APIs. When interviewers look at your GitHub, they will see thoughtful architecture, not another generic tutorial app."
    },
    {
      title: "Tamil & English bilingual mentorship",
      desc: "Learning tech shouldn't be blocked by language. Our mentors explain complex concepts clearly in Tamil and English so you can grasp fundamentals faster."
    },
    {
      title: "Direct code reviews from engineers",
      desc: "Mentors review your work over live screen share, point out edge cases, and teach you how to write maintainable code that passes team code reviews."
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
