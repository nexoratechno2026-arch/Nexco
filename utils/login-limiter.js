const crypto = require('crypto');
const { logSecurityEvent } = require('./security-logger');

// In-memory Stores
const loginAttempts = new Map();
const challenges = new Map();

// Single Active Admin Session Tracker
const activeAdminSessions = new Set();
let activeAdminSessionId = null;

// Disposable Email Domains Blocklist
const DISPOSABLE_EMAIL_DOMAINS = new Set([
  'mailinator.com',
  'tempmail.com',
  'guerrillamail.com',
  '10minutemail.com',
  'throwawaymail.com',
  'trashmail.com',
  'yopmail.com',
  'fakeinbox.com',
  'sharklasers.com',
  'dispostable.com',
  'getairmail.com',
  'burnermail.io'
]);

/**
 * Constant-time string comparison to prevent timing side-channel attacks
 */
function timingSafeEqualStr(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  const bufA = Buffer.from(a, 'utf8');
  const bufB = Buffer.from(b, 'utf8');
  if (bufA.length !== bufB.length) {
    crypto.timingSafeEqual(bufA, bufA);
    return false;
  }
  return crypto.timingSafeEqual(bufA, bufB);
}

/**
 * Hash password with unique cryptographic salt using scrypt
 */
function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const derivedKey = crypto.scryptSync(password, salt, 64);
  return `${salt}:${derivedKey.toString('hex')}`;
}

/**
 * Verify password against salted hash in constant time
 */
function verifyPassword(password, storedHash) {
  if (!storedHash || typeof storedHash !== 'string' || !storedHash.includes(':')) {
    // Dummy computation equalizes execution latency
    const dummySalt = '00000000000000000000000000000000';
    const dummyDerived = crypto.scryptSync(password || 'dummy', dummySalt, 64);
    crypto.timingSafeEqual(dummyDerived, dummyDerived);
    return false;
  }
  const [salt, key] = storedHash.split(':');
  const keyBuf = Buffer.from(key, 'hex');
  const derivedKey = crypto.scryptSync(password, salt, 64);
  if (keyBuf.length !== derivedKey.length) {
    crypto.timingSafeEqual(derivedKey, derivedKey);
    return false;
  }
  return crypto.timingSafeEqual(keyBuf, derivedKey);
}

/**
 * Validate RFC email pattern and reject disposable domains
 */
function normalizeAndValidateEmail(email) {
  if (!email || typeof email !== 'string') return { valid: false, error: 'Email address is required.' };
  const clean = email.trim().toLowerCase();
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
  if (!emailRegex.test(clean) || clean.length > 100) {
    return { valid: false, error: 'Please enter a valid email address.' };
  }
  const domain = clean.split('@')[1];
  if (DISPOSABLE_EMAIL_DOMAINS.has(domain)) {
    return { valid: false, error: 'Temporary/disposable email addresses are not permitted. Please use a permanent email.' };
  }
  return { valid: true, email: clean };
}

/**
 * Validate password complexity: Min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 symbol
 */
function validatePasswordComplexity(password) {
  if (!password || typeof password !== 'string') return false;
  if (password.length < 8) return false;
  if (!/[A-Z]/.test(password)) return false;
  if (!/[a-z]/.test(password)) return false;
  if (!/[0-9]/.test(password)) return false;
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) return false;
  return true;
}

/**
 * Create randomized arithmetic human verification challenge
 */
function createChallenge() {
  const n1 = Math.floor(Math.random() * 12) + 4;
  const n2 = Math.floor(Math.random() * 9) + 2;
  const answer = String(n1 + n2);
  const challengeId = 'ch_' + crypto.randomBytes(8).toString('hex');

  // Expire after 5 minutes
  challenges.set(challengeId, {
    answer,
    expiresAt: Date.now() + 5 * 60 * 1000
  });

  return {
    challengeId,
    question: `What is ${n1} + ${n2}?`,
    prompt: `${n1} + ${n2} = ?`
  };
}

/**
 * Verify human challenge response
 */
function verifyChallenge(challengeId, answer) {
  if (!challengeId || !answer) return false;
  const record = challenges.get(challengeId);
  if (!record) return false;
  challenges.delete(challengeId);
  if (Date.now() > record.expiresAt) return false;
  return String(answer).trim() === record.answer;
}

/**
 * Check if target is currently locked out
 */
function isTargetLocked(email, ip) {
  const now = Date.now();
  const keys = [];
  if (email) keys.push(`email:${email.trim().toLowerCase()}`);
  if (ip) keys.push(`ip:${ip.trim()}`);

  for (const key of keys) {
    const record = loginAttempts.get(key);
    if (!record) continue;
    if (record.lockedUntil && now < record.lockedUntil) {
      const remainingSeconds = Math.max(1, Math.ceil((record.lockedUntil - now) / 1000));
      return {
        locked: true,
        key,
        lockedUntil: record.lockedUntil,
        remainingSeconds
      };
    }
    // Expired lockout or 15-min inactivity window cleanup
    if (record.lockedUntil && now >= record.lockedUntil) {
      loginAttempts.delete(key);
    } else if (now - record.firstAttemptTime > 15 * 60 * 1000) {
      loginAttempts.delete(key);
    }
  }

  return { locked: false };
}

/**
 * Get current failed attempts count for email or IP
 */
function getFailedAttemptsCount(email, ip) {
  const countEmail = email ? (loginAttempts.get(`email:${email.trim().toLowerCase()}`)?.count || 0) : 0;
  const countIp = ip ? (loginAttempts.get(`ip:${ip.trim()}`)?.count || 0) : 0;
  return Math.max(countEmail, countIp);
}

/**
 * Record a failed login attempt with progressive limits
 */
function recordFailedAttempt(email, ip, req) {
  const now = Date.now();
  const keys = [];
  const cleanEmail = email ? email.trim().toLowerCase() : null;
  const cleanIp = ip ? ip.trim() : null;

  if (cleanEmail) keys.push(`email:${cleanEmail}`);
  if (cleanIp) keys.push(`ip:${cleanIp}`);

  let maxCount = 0;
  for (const key of keys) {
    const existing = loginAttempts.get(key) || {
      target: key,
      type: key.startsWith('ip:') ? 'ip' : 'email',
      count: 0,
      firstAttemptTime: now,
      lockedUntil: null
    };
    existing.count += 1;
    if (existing.count > maxCount) maxCount = existing.count;

    if (existing.count >= 5) {
      existing.lockedUntil = now + 15 * 60 * 1000; // 15-minute hard lockout
    }
    loginAttempts.set(key, existing);
  }

  // If 5th consecutive failure reached, trigger audit log
  if (maxCount >= 5) {
    const lockedUntil = now + 15 * 60 * 1000;
    logSecurityEvent({
      action: 'CRITICAL_LOGIN_LOCKOUT',
      details: `Account & IP locked out for 15 minutes after 5 consecutive failed login attempts. Target: ${cleanEmail || 'Unknown'} (IP: ${cleanIp || 'Unknown'})`,
      severity: 'CRITICAL',
      req,
      actorEmail: cleanEmail
    });

    return {
      locked: true,
      count: maxCount,
      remainingAttempts: 0,
      lockedUntil,
      retryAfterSeconds: 900
    };
  }

  return {
    locked: false,
    count: maxCount,
    remainingAttempts: Math.max(0, 5 - maxCount),
    challengeRequired: maxCount >= 2 // Challenge triggered after 2 failed attempts
  };
}

/**
 * Reset failed attempts upon valid credentials
 */
function recordLoginSuccess(email, ip) {
  if (email) loginAttempts.delete(`email:${email.trim().toLowerCase()}`);
  if (ip) loginAttempts.delete(`ip:${ip.trim()}`);
}

/**
 * Admin manual unlock for target email or IP
 */
function unlockTarget(target) {
  if (!target) return false;
  const clean = String(target).trim();
  const keysToDelete = [
    clean,
    `email:${clean.toLowerCase()}`,
    `ip:${clean}`
  ];

  let unlocked = false;
  for (const k of keysToDelete) {
    if (loginAttempts.has(k)) {
      loginAttempts.delete(k);
      unlocked = true;
    }
  }
  return unlocked;
}

/**
 * Get list of currently locked-out accounts & IPs for Admin UI
 */
function getLockedTargets() {
  const now = Date.now();
  const list = [];
  for (const [key, record] of loginAttempts.entries()) {
    if (record.lockedUntil && now < record.lockedUntil) {
      list.push({
        key,
        target: key.replace(/^(email|ip):/, ''),
        type: key.startsWith('ip:') ? 'ip' : 'email',
        count: record.count,
        lockedUntil: record.lockedUntil,
        remainingSeconds: Math.max(0, Math.ceil((record.lockedUntil - now) / 1000))
      });
    }
  }
  return list;
}

/**
 * Active Admin Session Control
 * Enforces single active session in production; maintains active session pool in development
 */
function setActiveAdminSession(sessionId) {
  activeAdminSessionId = sessionId;
  if (process.env.NODE_ENV === 'production') {
    activeAdminSessions.clear();
  }
  activeAdminSessions.add(sessionId);
  if (activeAdminSessions.size > 10) {
    const oldest = activeAdminSessions.values().next().value;
    activeAdminSessions.delete(oldest);
  }
}

function isSessionActive(sessionId) {
  if (!sessionId) return false;
  // In development mode on localhost, preserve session continuity across tabs and test runs
  if (process.env.NODE_ENV !== 'production') {
    return true;
  }
  if (activeAdminSessions.size === 0) return true;
  return activeAdminSessions.has(sessionId);
}

function getActiveAdminSession() {
  return activeAdminSessionId;
}

module.exports = {
  loginAttempts,
  timingSafeEqualStr,
  hashPassword,
  verifyPassword,
  normalizeAndValidateEmail,
  validatePasswordComplexity,
  createChallenge,
  verifyChallenge,
  isTargetLocked,
  getFailedAttemptsCount,
  recordFailedAttempt,
  recordLoginSuccess,
  unlockTarget,
  getLockedTargets,
  setActiveAdminSession,
  getActiveAdminSession,
  isSessionActive
};
