const express = require('express');
const router = express.Router();
const { db, queries } = require('../db');
const { requireAuth } = require('../middleware/auth');
const { recordActivity } = require('../utils/activity');

router.use(requireAuth);

// GET /api/activity - get authenticated user's activity log
router.get('/', (req, res) => {
  try {
    const { type, limit = 50, page = 1 } = req.query;
    const offset = (Math.max(1, parseInt(page)) - 1) * parseInt(limit);

    let sql = `
      SELECT a.*, e.title as event_title, e.city as event_city, e.slug as event_slug
      FROM user_activity a
      LEFT JOIN events e ON a.event_id = e.id
      WHERE a.user_id = ?
    `;
    const params = [req.user.id];

    if (type && type !== 'all') {
      sql += ` AND a.activity_type = ?`;
      params.push(type);
    }

    sql += ` ORDER BY a.created_at DESC LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), offset);

    const activities = db.prepare(sql).all(...params);

    // Get total count for pagination
    let countSql = `SELECT COUNT(*) as total FROM user_activity WHERE user_id = ?`;
    const countParams = [req.user.id];
    if (type && type !== 'all') {
      countSql += ` AND activity_type = ?`;
      countParams.push(type);
    }
    const total = db.prepare(countSql).get(...countParams).total;

    return res.json({
      activities,
      total,
      page: parseInt(page),
      limit: parseInt(limit)
    });
  } catch (err) {
    console.error('Fetch activities error:', err);
    return res.status(500).json({ error: 'Failed to retrieve activity history.' });
  }
});

// POST /api/activity/log - client can log actions like ticket_click, calendar_add, share_event
router.post('/log', (req, res) => {
  try {
    const { activity_type, event_id, metadata } = req.body;

    if (!activity_type) {
      return res.status(400).json({ error: 'activity_type is required.' });
    }

    // Allowed client-triggered activity types
    const allowed = ['view_event', 'ticket_click', 'calendar_add', 'share_event', 'search_performed'];
    if (!allowed.includes(activity_type)) {
      return res.status(400).json({ error: 'Invalid activity type.' });
    }

    recordActivity(req.user.id, activity_type, event_id || null, metadata || {});

    return res.status(201).json({ success: true });
  } catch (err) {
    console.error('Log activity error:', err);
    return res.status(500).json({ error: 'Failed to log activity.' });
  }
});

module.exports = router;
