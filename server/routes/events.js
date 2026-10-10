const express = require('express');
const router = express.Router();
const { db, queries } = require('../db');
const { optionalAuth } = require('../middleware/auth');
const { recordActivity } = require('../utils/activity');

// GET /api/events - browse with filters
router.get('/', (req, res) => {
  try {
    const {
      city,
      category,
      search,
      is_free,
      timeframe, // 'upcoming', 'this_weekend', 'today', 'past', 'all'
      featured,
      sort = 'date_asc'
    } = req.query;

    let sql = `SELECT * FROM events WHERE status = 'published'`;
    const params = [];

    // City Filter (Tamale, Damongo, Bolgatanga, Wa)
    if (city && city !== 'All') {
      sql += ` AND LOWER(city) = LOWER(?)`;
      params.push(city);
    }

    // Category Filter
    if (category && category !== 'All') {
      sql += ` AND LOWER(category) = LOWER(?)`;
      params.push(category);
    }

    // Free filter
    if (is_free === 'true' || is_free === '1') {
      sql += ` AND (is_free = 1 OR ticket_price = 0)`;
    }

    // Featured only
    if (featured === 'true' || featured === '1') {
      sql += ` AND is_featured = 1`;
    }

    // Search query (title, performers, venue, city, description)
    if (search && search.trim() !== '') {
      sql += ` AND (
        title LIKE ? OR
        description LIKE ? OR
        performers LIKE ? OR
        venue_name LIKE ? OR
        city LIKE ?
      )`;
      const pattern = `%${search.trim()}%`;
      params.push(pattern, pattern, pattern, pattern, pattern);
    }

    // Timeframe filters
    const today = new Date().toISOString().split('T')[0];

    if (timeframe === 'past') {
      sql += ` AND event_date < ?`;
      params.push(today);
    } else if (timeframe === 'today') {
      sql += ` AND event_date = ?`;
      params.push(today);
    } else if (timeframe === 'this_weekend') {
      // Calculate next or current weekend (Friday to Sunday)
      const now = new Date();
      const currentDay = now.getDay(); // 0 is Sunday, 5 is Friday, 6 is Saturday
      const daysUntilFriday = (5 - currentDay + 7) % 7;
      const friday = new Date(now);
      friday.setDate(now.getDate() + daysUntilFriday);
      const sunday = new Date(friday);
      sunday.setDate(friday.getDate() + 2);

      const fridayStr = friday.toISOString().split('T')[0];
      const sundayStr = sunday.toISOString().split('T')[0];

      sql += ` AND event_date BETWEEN ? AND ?`;
      params.push(fridayStr, sundayStr);
    } else if (timeframe !== 'all') {
      // Default: upcoming events
      sql += ` AND event_date >= ?`;
      params.push(today);
    }

    // Sorting
    if (sort === 'date_desc') {
      sql += ` ORDER BY event_date DESC, start_time DESC`;
    } else if (sort === 'featured') {
      sql += ` ORDER BY is_featured DESC, event_date ASC, start_time ASC`;
    } else if (sort === 'price_low') {
      sql += ` ORDER BY ticket_price ASC, event_date ASC`;
    } else if (sort === 'price_high') {
      sql += ` ORDER BY ticket_price DESC, event_date ASC`;
    } else {
      // default: date_asc
      sql += ` ORDER BY event_date ASC, start_time ASC`;
    }

    const events = db.prepare(sql).all(...params);

    return res.json({
      count: events.length,
      events
    });
  } catch (err) {
    console.error('Events fetch error:', err);
    return res.status(500).json({ error: 'Failed to retrieve events from database.' });
  }
});

// GET /api/events/featured - top hero and featured cards
router.get('/featured', (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const events = db.prepare(`
      SELECT * FROM events
      WHERE status = 'published' AND is_featured = 1 AND event_date >= ?
      ORDER BY event_date ASC
      LIMIT 6
    `).all(today);

    return res.json({ events });
  } catch (err) {
    console.error('Featured events fetch error:', err);
    return res.status(500).json({ error: 'Failed to retrieve featured events.' });
  }
});

// GET /api/events/cities - summary stats and top event per city
router.get('/cities/summary', (req, res) => {
  try {
    const cities = ['Tamale', 'Damongo', 'Bolgatanga', 'Wa'];
    const today = new Date().toISOString().split('T')[0];

    const summaries = cities.map((city) => {
      const count = db.prepare(`
        SELECT COUNT(*) as total FROM events
        WHERE status = 'published' AND LOWER(city) = LOWER(?) AND event_date >= ?
      `).get(city, today).total;

      const topEvent = db.prepare(`
        SELECT * FROM events
        WHERE status = 'published' AND LOWER(city) = LOWER(?) AND event_date >= ?
        ORDER BY is_featured DESC, event_date ASC
        LIMIT 1
      `).get(city, today);

      return {
        city,
        upcomingCount: count,
        featuredEvent: topEvent || null
      };
    });

    // Also fetch all distinct cities that currently have events
    const allCitiesRows = db.prepare(`
      SELECT DISTINCT city FROM events
      WHERE status = 'published'
      ORDER BY city ASC
    `).all();
    const allCities = allCitiesRows.map(r => r.city);

    return res.json({ summaries, allCities });
  } catch (err) {
    console.error('Cities summary error:', err);
    return res.status(500).json({ error: 'Failed to retrieve city summaries.' });
  }
});

// GET /api/events/:slugOrId - detailed event view
router.get('/:slugOrId', optionalAuth, (req, res) => {
  try {
    const { slugOrId } = req.params;
    const event = queries.getEventBySlugOrId.get(slugOrId, slugOrId);

    if (!event) {
      return res.status(404).json({ error: 'Event not found.' });
    }

    // Check if current user saved this event
    let isSaved = false;
    if (req.user) {
      const saved = queries.isEventSavedByUser.get(req.user.id, event.id);
      isSaved = !!saved;

      // Record view activity
      recordActivity(req.user.id, 'view_event', event.id, {
        city: event.city,
        title: event.title
      });
    }

    // Get related events in same city or same category
    const related = db.prepare(`
      SELECT id, title, slug, image_url, event_date, start_time, city, venue_name, ticket_price, is_free, category
      FROM events
      WHERE status = 'published' AND id != ? AND (city = ? OR category = ?)
      ORDER BY event_date ASC
      LIMIT 3
    `).all(event.id, event.city, event.category);

    return res.json({
      event,
      isSaved,
      related
    });
  } catch (err) {
    console.error('Event details error:', err);
    return res.status(500).json({ error: 'Failed to retrieve event details.' });
  }
});

module.exports = router;
