const { logSecurityEvent } = require('../utils/security-logger');

/**
 * Recursive check for NoSQL Injection & Prototype Pollution
 * Blocks keys starting with '$', containing '.', or matching proto/constructor
 */
function containsDangerousKeys(obj, path = '') {
  if (!obj || typeof obj !== 'object') return null;

  for (const key of Object.keys(obj)) {
    // Check key for Prototype Pollution
    if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
      return { key, reason: 'Prototype Pollution attempt', path: path ? `${path}.${key}` : key };
    }

    // Check key for NoSQL Operator Injection
    if (key.startsWith('$') || key.includes('.')) {
      return { key, reason: 'NoSQL Operator injection attempt', path: path ? `${path}.${key}` : key };
    }

    // Recursively check nested objects/arrays
    if (typeof obj[key] === 'object' && obj[key] !== null) {
      const nested = containsDangerousKeys(obj[key], path ? `${path}.${key}` : key);
      if (nested) return nested;
    }
  }

  return null;
}

/**
 * Middleware: Global Defense against Prototype Pollution & NoSQL Injection
 */
function sanitizeNoSqlAndPrototypes(req, res, next) {
  // Check body
  if (req.body) {
    const danger = containsDangerousKeys(req.body);
    if (danger) {
      logSecurityEvent({
        action: 'PROTOTYPE_OR_NOSQL_ATTACK_BLOCKED',
        details: `Blocked key "${danger.key}" in body (${danger.reason}) at path: ${danger.path}`,
        severity: 'CRITICAL',
        req
      });
      return res.status(400).json({
        success: false,
        error: `Security Violation: Disallowed property name "${danger.key}".`
      });
    }
  }

  // Check query
  if (req.query) {
    const danger = containsDangerousKeys(req.query);
    if (danger) {
      logSecurityEvent({
        action: 'PROTOTYPE_OR_NOSQL_ATTACK_BLOCKED',
        details: `Blocked key "${danger.key}" in query (${danger.reason})`,
        severity: 'CRITICAL',
        req
      });
      return res.status(400).json({
        success: false,
        error: `Security Violation: Disallowed query parameter "${danger.key}".`
      });
    }
  }

  // Check params
  if (req.params) {
    const danger = containsDangerousKeys(req.params);
    if (danger) {
      return res.status(400).json({
        success: false,
        error: `Security Violation: Disallowed route parameter "${danger.key}".`
      });
    }
  }

  next();
}

/**
 * Middleware: Strict Allowlist & Field Validation for Leads
 */
function validateLeadPayload(req, res, next) {
  const allowedFields = new Set([
    'name', 'email', 'phone', 'city', 'track', 'timing', 'source', 'honeypot', 'website_url'
  ]);

  const bodyKeys = Object.keys(req.body || {});
  const unexpected = bodyKeys.filter(k => !allowedFields.has(k));

  if (unexpected.length > 0) {
    logSecurityEvent({
      action: 'SCHEMA_ALLOWLIST_VIOLATION',
      details: `Unexpected fields in /api/leads: ${unexpected.join(', ')}`,
      severity: 'WARNING',
      req
    });
    return res.status(400).json({
      success: false,
      error: `Validation error: Unexpected field(s) "${unexpected.join(', ')}" rejected.`
    });
  }

  const { name, email, phone, city, track } = req.body;

  // 1. Name Check
  if (!name || typeof name !== 'string' || !name.trim()) {
    return res.status(400).json({ success: false, error: 'Full Name is required.' });
  }
  const cleanName = name.replace(/<[^>]*>?/gm, '').trim();
  if (cleanName.length > 80) {
    return res.status(400).json({ success: false, error: 'Name must not exceed 80 characters.' });
  }
  req.body.name = cleanName;

  // 2. Email Check (strict RFC standard)
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
  if (!email || typeof email !== 'string' || !email.trim() || !emailRegex.test(email.trim())) {
    return res.status(400).json({ success: false, error: 'Valid Email address is required.' });
  }
  if (email.trim().length > 120) {
    return res.status(400).json({ success: false, error: 'Email must not exceed 120 characters.' });
  }
  req.body.email = email.trim().toLowerCase();

  // 3. Phone Check: Strict Indian 10-digit mobile
  const cleanPhone = phone ? String(phone).replace(/[^0-9]/g, '') : '';
  const phoneRegex = /^[6-9]\d{9}$/;
  if (!cleanPhone || !phoneRegex.test(cleanPhone)) {
    return res.status(400).json({
      success: false,
      error: 'Valid 10-digit Indian mobile number starting with 6-9 is required (e.g. 9345121988).'
    });
  }
  req.body.phone = cleanPhone;

  // 4. City Check
  if (city && typeof city === 'string') {
    req.body.city = city.replace(/<[^>]*>?/gm, '').trim().substring(0, 80);
  }

  // 5. Track Check
  if (!track || typeof track !== 'string' || !track.trim()) {
    return res.status(400).json({ success: false, error: 'Track selection is required.' });
  }
  req.body.track = track.trim().substring(0, 100);

  next();
}

/**
 * Middleware: SSRF Defense & URL Allowlisting for Project Submissions
 */
function validateSubmissionPayload(req, res, next) {
  const { repoUrl, deployUrl, title, track } = req.body;

  if (!repoUrl || typeof repoUrl !== 'string' || !repoUrl.trim()) {
    return res.status(400).json({ success: false, error: 'GitHub Repository URL is required.' });
  }

  const cleanRepo = repoUrl.trim();
  const githubRegex = /^https:\/\/(www\.)?github\.com\/[a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+(\/)?$/;
  if (!githubRegex.test(cleanRepo)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid repository URL. Only public "https://github.com/username/repo" URLs are permitted.'
    });
  }

  // Check Deploy / Figma URL if provided
  if (deployUrl && typeof deployUrl === 'string' && deployUrl.trim()) {
    const cleanDeploy = deployUrl.trim().toLowerCase();

    // Block non-HTTP protocols (SSRF & XSS defense)
    if (
      cleanDeploy.startsWith('javascript:') ||
      cleanDeploy.startsWith('data:') ||
      cleanDeploy.startsWith('file:') ||
      cleanDeploy.startsWith('ftp:')
    ) {
      logSecurityEvent({
        action: 'SSRF_OR_XSS_URL_BLOCKED',
        details: `Blocked dangerous URI scheme in submission: ${cleanDeploy}`,
        severity: 'CRITICAL',
        req
      });
      return res.status(400).json({
        success: false,
        error: 'Invalid deployment URL. Protocol scheme blocked for security.'
      });
    }

    // Must be https://
    if (!cleanDeploy.startsWith('https://')) {
      return res.status(400).json({
        success: false,
        error: 'Deployment / prototype link must use secure HTTPS protocol.'
      });
    }

    // Block internal loopback & RFC 1918 / cloud metadata addresses (SSRF prevention)
    const ssrfBlocklist = [
      'localhost', '127.0.0.1', '0.0.0.0', '169.254.169.254', 'metadata.google.internal',
      '10.', '192.168.', '172.16.', '172.17.', '172.18.', '172.19.', '172.20.', '172.21.',
      '172.22.', '172.23.', '172.24.', '172.25.', '172.26.', '172.27.', '172.28.', '172.29.',
      '172.30.', '172.31.', '[::1]'
    ];

    for (const blocked of ssrfBlocklist) {
      if (cleanDeploy.includes(`://${blocked}`) || cleanDeploy.includes(`@${blocked}`)) {
        logSecurityEvent({
          action: 'SSRF_IP_BLOCKED',
          details: `Blocked SSRF target IP in submission: ${cleanDeploy}`,
          severity: 'CRITICAL',
          req
        });
        return res.status(400).json({
          success: false,
          error: 'Forbidden target address. Internal network destinations are strictly prohibited.'
        });
      }
    }
  }

  next();
}

module.exports = {
  sanitizeNoSqlAndPrototypes,
  validateLeadPayload,
  validateSubmissionPayload
};
