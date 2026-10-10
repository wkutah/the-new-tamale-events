const jwt = require('jsonwebtoken');
const { queries } = require('../db');

const JWT_SECRET = process.env.JWT_SECRET || 'new-tamale-events-secure-jwt-key-2025-savannah-secret';

function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required. No valid token provided.' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = queries.findUserById.get(decoded.userId);

    if (!user) {
      return res.status(401).json({ error: 'User account not found or has been removed.' });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired session token.' });
  }
}

// Optional Auth: if token exists, attaches user; if not, proceeds without error
function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      const user = queries.findUserById.get(decoded.userId);
      if (user) {
        req.user = user;
      }
    } catch (e) {
      // ignore optional auth errors
    }
  }
  next();
}

function requireAdmin(req, res, next) {
  requireAuth(req, res, () => {
    // Check role strictly from database, NEVER trusting client headers or body
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({
        error: 'Access denied. Administrator privileges are strictly required for this action.'
      });
    }
    next();
  });
}

module.exports = {
  JWT_SECRET,
  requireAuth,
  optionalAuth,
  requireAdmin
};
