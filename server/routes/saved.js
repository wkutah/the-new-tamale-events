const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const uuidv4 = () => crypto.randomUUID();
const { db, queries } = require('../db');
const { requireAuth } = require('../middleware/auth');
const { recordActivity } = require('../utils/activity');

// All saved routes require authentication
router.use(requireAuth);

// GET /api/saved - get user's saved events
router.get('/', (req, res) => {
  try {
    const saved = queries.getSavedEventsForUser.all(req.user.id);
    return res.json({ savedEvents: saved });
  } catch (err) {
    console.error('Fetch saved events error:', err);
    return res.status(500).json({ error: 'Failed to retrieve your saved events.' });
  }
});

// GET /api/saved/check/:eventId - check if saved
router.get('/check/:eventId', (req, res) => {
  try {
    const { eventId } = req.params;
    const existing = queries.isEventSavedByUser.get(req.user.id, eventId);
    return res.json({ isSaved: !!existing });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to check saved status.' });
  }
});

// POST /api/saved/:eventId - save an event
router.post('/:eventId', (req, res) => {
  try {
    const { eventId } = req.params;

    // Verify event exists
    const event = db.prepare('SELECT id, title, city FROM events WHERE id = ?').get(eventId);
    if (!event) {
      return res.status(404).json({ error: 'Event not found.' });
    }

    // Check if already saved
    const existing = queries.isEventSavedByUser.get(req.user.id, eventId);
    if (existing) {
      return res.json({ message: 'Event is already saved.', isSaved: true });
    }

    const id = `save-${uuidv4()}`;
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO saved_events (id, user_id, event_id, created_at)
      VALUES (?, ?, ?, ?)
    `).run(id, req.user.id, eventId, now);

    recordActivity(req.user.id, 'save_event', eventId, {
      title: event.title,
      city: event.city
    });

    return res.status(201).json({
      message: 'Event saved to your profile!',
      isSaved: true
    });
  } catch (err) {
    console.error('Save event error:', err);
    return res.status(500).json({ error: 'Failed to save event.' });
  }
});

// DELETE /api/saved/:eventId - remove from saved
router.delete('/:eventId', (req, res) => {
  try {
    const { eventId } = req.params;

    const event = db.prepare('SELECT id, title FROM events WHERE id = ?').get(eventId);

    const result = db.prepare(`
      DELETE FROM saved_events
      WHERE user_id = ? AND event_id = ?
    `).run(req.user.id, eventId);

    if (result.changes > 0) {
      recordActivity(req.user.id, 'remove_saved_event', eventId, {
        title: event ? event.title : 'Event'
      });
    }

    return res.json({
      message: 'Event removed from saved list.',
      isSaved: false
    });
  } catch (err) {
    console.error('Remove saved event error:', err);
    return res.status(500).json({ error: 'Failed to remove saved event.' });
  }
});

module.exports = router;
