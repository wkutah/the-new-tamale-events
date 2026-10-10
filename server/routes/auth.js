const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const uuidv4 = () => crypto.randomUUID();
const { db, queries } = require('../db');
const { JWT_SECRET, requireAuth } = require('../middleware/auth');
const { recordActivity } = require('../utils/activity');

// POST /api/auth/register
router.post('/register', (req, res) => {
  try {
    const { full_name, email, password, preferred_city, phone_number } = req.body;

    if (!full_name || !email || !password) {
      return res.status(400).json({ error: 'Please provide full name, email, and password.' });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Please enter a valid email address.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
    }

    const cleanEmail = email.toLowerCase().trim();

    // Check for duplicate account
    const existing = db.prepare('SELECT id FROM profiles WHERE LOWER(email) = ?').get(cleanEmail);
    if (existing) {
      return res.status(409).json({ error: 'An account with this email address already exists.' });
    }

    const userId = `usr-${uuidv4()}`;
    const now = new Date().toISOString();
    const passwordHash = bcrypt.hashSync(password, 10);

    const validCity = (preferred_city && preferred_city.trim()) ? preferred_city.trim() : 'Tamale';

    // Transaction to insert profile, auth, and user role
    const registerTx = db.transaction(() => {
      db.prepare(`
        INSERT INTO profiles (id, full_name, email, phone_number, preferred_city, avatar_url, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        userId,
        full_name.trim(),
        cleanEmail,
        phone_number ? phone_number.trim() : null,
        validCity,
        `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(full_name)}&backgroundColor=f59e0b,10b981,6366f1`,
        now,
        now
      );

      db.prepare(`
        INSERT INTO users_auth (id, email, password_hash, created_at)
        VALUES (?, ?, ?, ?)
      `).run(userId, cleanEmail, passwordHash, now);

      // ALWAYS assign standard 'user' role - users can NEVER register as admin
      db.prepare(`
        INSERT INTO user_roles (id, user_id, role, created_at)
        VALUES (?, ?, 'user', ?)
      `).run(`role-${uuidv4()}`, userId, now);
    });

    registerTx();

    recordActivity(userId, 'user_registered', null, { preferred_city: validCity });

    const token = jwt.sign({ userId, role: 'user' }, JWT_SECRET, { expiresIn: '7d' });

    const userProfile = queries.findUserById.get(userId);

    return res.status(201).json({
      message: 'Account created successfully!',
      token,
      user: {
        id: userProfile.id,
        full_name: userProfile.full_name,
        email: userProfile.email,
        phone_number: userProfile.phone_number,
        preferred_city: userProfile.preferred_city,
        avatar_url: userProfile.avatar_url,
        role: userProfile.role || 'user',
        created_at: userProfile.created_at
      }
    });
  } catch (err) {
    console.error('Registration error:', err);
    return res.status(500).json({ error: 'Failed to create account. Please try again.' });
  }
});

// POST /api/auth/login
router.post('/login', (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Please enter both email and password.' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const user = queries.findUserByEmail.get(cleanEmail);

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const isMatch = bcrypt.compareSync(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const token = jwt.sign({ userId: user.id, role: user.role || 'user' }, JWT_SECRET, { expiresIn: '7d' });

    recordActivity(user.id, 'user_logged_in', null, { timestamp: new Date().toISOString() });

    return res.json({
      message: 'Signed in successfully',
      token,
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        phone_number: user.phone_number,
        preferred_city: user.preferred_city,
        avatar_url: user.avatar_url,
        role: user.role || 'user',
        created_at: user.created_at
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Authentication failed due to a server error.' });
  }
});

// GET /api/auth/me
router.get('/me', requireAuth, (req, res) => {
  return res.json({
    user: {
      id: req.user.id,
      full_name: req.user.full_name,
      email: req.user.email,
      phone_number: req.user.phone_number,
      preferred_city: req.user.preferred_city,
      avatar_url: req.user.avatar_url,
      role: req.user.role || 'user',
      created_at: req.user.created_at
    }
  });
});

// PUT /api/auth/profile
router.put('/profile', requireAuth, (req, res) => {
  try {
    const { full_name, phone_number, preferred_city, avatar_url } = req.body;
    const now = new Date().toISOString();

    const validCity = (preferred_city && preferred_city.trim()) ? preferred_city.trim() : req.user.preferred_city;

    db.prepare(`
      UPDATE profiles
      SET full_name = COALESCE(?, full_name),
          phone_number = COALESCE(?, phone_number),
          preferred_city = ?,
          avatar_url = COALESCE(?, avatar_url),
          updated_at = ?
      WHERE id = ?
    `).run(
      full_name ? full_name.trim() : null,
      phone_number ? phone_number.trim() : null,
      validCity,
      avatar_url || null,
      now,
      req.user.id
    );

    const updated = queries.findUserById.get(req.user.id);

    return res.json({
      message: 'Profile updated successfully',
      user: {
        id: updated.id,
        full_name: updated.full_name,
        email: updated.email,
        phone_number: updated.phone_number,
        preferred_city: updated.preferred_city,
        avatar_url: updated.avatar_url,
        role: updated.role || 'user',
        created_at: updated.created_at
      }
    });
  } catch (err) {
    console.error('Profile update error:', err);
    return res.status(500).json({ error: 'Failed to update profile.' });
  }
});

module.exports = router;
