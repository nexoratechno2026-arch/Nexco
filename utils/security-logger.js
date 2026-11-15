const { db } = require('../config/firebase');

/**
 * Append-only Security Audit Logger
 * Records security events, administrative mutations, and threat neutralizations
 */
async function logSecurityEvent({
  action,
  details = '',
  severity = 'INFO', // INFO, WARNING, CRITICAL
  req = null,
  actorEmail = 'anonymous',
  targetId = null
}) {
  try {
    const headers = (req && req.headers) ? req.headers : {};
    const rawIp = headers['x-forwarded-for'] ||
                  headers['x-qa-client-ip'] ||
                  (req && req.ip) ||
                  (req && req.connection && req.connection.remoteAddress) ||
                  '127.0.0.1';
    const ip = String(rawIp).replace('::ffff:', '').split(',')[0].trim();
    const userAgent = headers['user-agent'] || 'System/Internal';
    const email = (req && req.user && req.user.email) ? req.user.email : actorEmail;

    const logEntry = {
      id: 'sec_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
      timestamp: new Date().toISOString(),
      action,
      details,
      severity,
      ip,
      userAgent: userAgent.substring(0, 150),
      actorEmail: email,
      targetId: targetId ? String(targetId) : null
    };

    if (db && db.collection) {
      await db.collection('security_logs').doc(logEntry.id).set(logEntry);
    }

    if (severity === 'CRITICAL' || severity === 'WARNING') {
      console.warn(`🚨 [Nexco Security ${severity}] ${action}: ${details} (IP: ${ip})`);
    }

    return logEntry;
  } catch (err) {
    console.error('[Security Logger Error]:', err.message);
  }
}

module.exports = {
  logSecurityEvent
};
