const express = require('express');
const router = express.Router();
const { db, queries } = require('../db');
const { requireAuth, optionalAuth } = require('../middleware/auth');
const { recordActivity } = require('../utils/activity');

// Helper to compute vibe score
function enrichEventWithVibe(evt) {
  const vibe_votes = Number(evt.vibe_votes) || 0;
  const exciting = Number(evt.vibe_exciting_count) || 0;
  const dull = Number(evt.vibe_dull_count) || 0;
  const vibe_score = vibe_votes > 0 ? Math.round((exciting / vibe_votes) * 100) : 100;
  let vibe_label = 'Fresh ✨';
  if (vibe_votes > 0) {
    if (vibe_score >= 80) vibe_label = 'Exciting 🔥';
    else if (vibe_score >= 50) vibe_label = 'Active ⚡';
    else vibe_label = 'Dull 🥱';
  }
  return {
    ...evt,
    comment_count: Number(evt.comment_count) || 0,
    vibe_votes,
    vibe_exciting_count: exciting,
    vibe_dull_count: dull,
    vibe_score,
    vibe_label
  };
}

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

    let sql = `
      SELECT 
        e.*,
        (SELECT COUNT(*) FROM event_comments WHERE event_id = e.id) as comment_count,
        (SELECT COUNT(*) FROM event_ratings WHERE event_id = e.id) as vibe_votes,
        (SELECT COALESCE(SUM(CASE WHEN rating = 'exciting' THEN 1 ELSE 0 END), 0) FROM event_ratings WHERE event_id = e.id) as vibe_exciting_count,
        (SELECT COALESCE(SUM(CASE WHEN rating = 'dull' THEN 1 ELSE 0 END), 0) FROM event_ratings WHERE event_id = e.id) as vibe_dull_count
      FROM events e
      WHERE e.status = 'published'
    `;
    const params = [];

    // City Filter
    if (city && city !== 'All') {
      sql += ` AND LOWER(e.city) = LOWER(?)`;
      params.push(city);
    }

    // Category Filter
    if (category && category !== 'All') {
      sql += ` AND LOWER(e.category) = LOWER(?)`;
      params.push(category);
    }

    // Free filter
    if (is_free === 'true' || is_free === '1') {
      sql += ` AND (e.is_free = 1 OR e.ticket_price = 0)`;
    }

    // Featured only
    if (featured === 'true' || featured === '1') {
      sql += ` AND e.is_featured = 1`;
    }

    // Search query (title, performers, venue, city, description)
    if (search && search.trim() !== '') {
      sql += ` AND (
        e.title LIKE ? OR
        e.description LIKE ? OR
        e.performers LIKE ? OR
        e.venue_name LIKE ? OR
        e.city LIKE ?
      )`;
      const pattern = `%${search.trim()}%`;
      params.push(pattern, pattern, pattern, pattern, pattern);
    }

    // Timeframe filters
    const today = new Date().toISOString().split('T')[0];

    if (timeframe === 'past') {
      sql += ` AND e.event_date < ?`;
      params.push(today);
    } else if (timeframe === 'today') {
      sql += ` AND e.event_date = ?`;
      params.push(today);
    } else if (timeframe === 'this_weekend') {
      const now = new Date();
      const currentDay = now.getDay();
      const daysUntilFriday = (5 - currentDay + 7) % 7;
      const friday = new Date(now);
      friday.setDate(now.getDate() + daysUntilFriday);
      const sunday = new Date(friday);
      sunday.setDate(friday.getDate() + 2);

      const fridayStr = friday.toISOString().split('T')[0];
      const sundayStr = sunday.toISOString().split('T')[0];

      sql += ` AND e.event_date BETWEEN ? AND ?`;
      params.push(fridayStr, sundayStr);
    } else if (timeframe !== 'all') {
      sql += ` AND e.event_date >= ?`;
      params.push(today);
    }

    // Sorting
    if (sort === 'date_desc') {
      sql += ` ORDER BY e.event_date DESC, e.start_time DESC`;
    } else if (sort === 'featured') {
      sql += ` ORDER BY e.is_featured DESC, e.event_date ASC, e.start_time ASC`;
    } else if (sort === 'price_low') {
      sql += ` ORDER BY e.ticket_price ASC, e.event_date ASC`;
    } else if (sort === 'price_high') {
      sql += ` ORDER BY e.ticket_price DESC, e.event_date ASC`;
    } else {
      sql += ` ORDER BY e.event_date ASC, e.start_time ASC`;
    }

    const rawEvents = db.prepare(sql).all(...params);
    const events = rawEvents.map(enrichEventWithVibe);

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
    const rawEvents = db.prepare(`
      SELECT 
        e.*,
        (SELECT COUNT(*) FROM event_comments WHERE event_id = e.id) as comment_count,
        (SELECT COUNT(*) FROM event_ratings WHERE event_id = e.id) as vibe_votes,
        (SELECT COALESCE(SUM(CASE WHEN rating = 'exciting' THEN 1 ELSE 0 END), 0) FROM event_ratings WHERE event_id = e.id) as vibe_exciting_count,
        (SELECT COALESCE(SUM(CASE WHEN rating = 'dull' THEN 1 ELSE 0 END), 0) FROM event_ratings WHERE event_id = e.id) as vibe_dull_count
      FROM events e
      WHERE e.status = 'published' AND e.is_featured = 1 AND e.event_date >= ?
      ORDER BY e.event_date ASC
      LIMIT 6
    `).all(today);

    const events = rawEvents.map(enrichEventWithVibe);
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
        SELECT 
          e.*,
          (SELECT COUNT(*) FROM event_comments WHERE event_id = e.id) as comment_count,
          (SELECT COUNT(*) FROM event_ratings WHERE event_id = e.id) as vibe_votes,
          (SELECT COALESCE(SUM(CASE WHEN rating = 'exciting' THEN 1 ELSE 0 END), 0) FROM event_ratings WHERE event_id = e.id) as vibe_exciting_count,
          (SELECT COALESCE(SUM(CASE WHEN rating = 'dull' THEN 1 ELSE 0 END), 0) FROM event_ratings WHERE event_id = e.id) as vibe_dull_count
        FROM events e
        WHERE e.status = 'published' AND LOWER(e.city) = LOWER(?) AND e.event_date >= ?
        ORDER BY e.is_featured DESC, e.event_date ASC
        LIMIT 1
      `).get(city, today);

      return {
        city,
        upcomingCount: count,
        featuredEvent: topEvent ? enrichEventWithVibe(topEvent) : null
      };
    });

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

// GET /api/events/:slugOrId - detailed event view with comments & ratings
router.get('/:slugOrId', optionalAuth, (req, res) => {
  try {
    const { slugOrId } = req.params;
    const event = queries.getEventBySlugOrId.get(slugOrId, slugOrId);

    if (!event) {
      return res.status(404).json({ error: 'Event not found.' });
    }

    let isSaved = false;
    let userRating = null;

    if (req.user) {
      const saved = queries.isEventSavedByUser.get(req.user.id, event.id);
      isSaved = !!saved;

      const rateRow = queries.getUserRatingForEvent.get(event.id, req.user.id);
      if (rateRow) {
        userRating = rateRow.rating;
      }

      recordActivity(req.user.id, 'view_event', event.id, {
        city: event.city,
        title: event.title
      });
    }

    // Fetch comments
    const comments = queries.getCommentsForEvent.all(event.id);

    // Fetch rating summary
    const ratingSummary = queries.getRatingSummaryForEvent.get(event.id);
    const totalVotes = Number(ratingSummary.total_votes) || 0;
    const excitingCount = Number(ratingSummary.exciting_count) || 0;
    const dullCount = Number(ratingSummary.dull_count) || 0;
    const excitingPercent = totalVotes > 0 ? Math.round((excitingCount / totalVotes) * 100) : 100;

    const vibeStats = {
      totalVotes,
      excitingCount,
      dullCount,
      excitingPercent,
      userRating
    };

    // Related events
    const related = db.prepare(`
      SELECT 
        e.id, e.title, e.slug, e.image_url, e.event_date, e.start_time, e.city, e.venue_name, e.ticket_price, e.is_free, e.category,
        (SELECT COUNT(*) FROM event_comments WHERE event_id = e.id) as comment_count,
        (SELECT COUNT(*) FROM event_ratings WHERE event_id = e.id) as vibe_votes,
        (SELECT COALESCE(SUM(CASE WHEN rating = 'exciting' THEN 1 ELSE 0 END), 0) FROM event_ratings WHERE event_id = e.id) as vibe_exciting_count,
        (SELECT COALESCE(SUM(CASE WHEN rating = 'dull' THEN 1 ELSE 0 END), 0) FROM event_ratings WHERE event_id = e.id) as vibe_dull_count
      FROM events e
      WHERE e.status = 'published' AND e.id != ? AND (e.city = ? OR e.category = ?)
      ORDER BY e.event_date ASC
      LIMIT 3
    `).all(event.id, event.city, event.category).map(enrichEventWithVibe);

    return res.json({
      event: {
        ...event,
        comment_count: comments.length,
        vibe_votes: totalVotes,
        vibe_exciting_count: excitingCount,
        vibe_dull_count: dullCount,
        vibe_score: excitingPercent
      },
      isSaved,
      comments,
      vibeStats,
      related
    });
  } catch (err) {
    console.error('Event details error:', err);
    return res.status(500).json({ error: 'Failed to retrieve event details.' });
  }
});

// POST /api/events/:id/comments - add comment / vibe report
router.post('/:id/comments', requireAuth, (req, res) => {
  try {
    const { id } = req.params;
    const { content, vibe_tag } = req.body;

    const event = queries.getEventBySlugOrId.get(id, id);
    if (!event) {
      return res.status(404).json({ error: 'Event not found.' });
    }

    if (!content || !content.trim()) {
      return res.status(400).json({ error: 'Comment content cannot be empty.' });
    }

    const commentId = `cmt-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
    const now = new Date().toISOString();
    const tag = vibe_tag && vibe_tag.trim() ? vibe_tag.trim() : '📍 Here Now';

    queries.addComment.run(commentId, event.id, req.user.id, content.trim(), tag, now);

    recordActivity(req.user.id, 'comment', event.id, {
      title: event.title,
      comment_id: commentId,
      vibe_tag: tag
    });

    const newComment = {
      id: commentId,
      event_id: event.id,
      user_id: req.user.id,
      content: content.trim(),
      vibe_tag: tag,
      created_at: now,
      author_name: req.user.full_name,
      author_avatar: req.user.avatar_url,
      author_city: req.user.preferred_city
    };

    return res.status(201).json({
      message: 'Comment posted successfully!',
      comment: newComment
    });
  } catch (err) {
    console.error('Post comment error:', err);
    return res.status(500).json({ error: 'Failed to post comment.' });
  }
});

// DELETE /api/events/:id/comments/:commentId - delete comment
router.delete('/:id/comments/:commentId', requireAuth, (req, res) => {
  try {
    const { commentId } = req.params;
    const comment = queries.findCommentById.get(commentId);
    if (!comment) {
      return res.status(404).json({ error: 'Comment not found.' });
    }

    if (comment.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'You do not have permission to delete this comment.' });
    }

    queries.deleteComment.run(commentId);
    return res.json({ message: 'Comment deleted successfully.' });
  } catch (err) {
    console.error('Delete comment error:', err);
    return res.status(500).json({ error: 'Failed to delete comment.' });
  }
});

// POST /api/events/:id/ratings - rate event as exciting or dull
router.post('/:id/ratings', requireAuth, (req, res) => {
  try {
    const { id } = req.params;
    const { rating } = req.body;

    if (!rating || !['exciting', 'dull'].includes(rating)) {
      return res.status(400).json({ error: 'Rating must be either "exciting" or "dull".' });
    }

    const event = queries.getEventBySlugOrId.get(id, id);
    if (!event) {
      return res.status(404).json({ error: 'Event not found.' });
    }

    const ratingId = `rtg-${event.id}-${req.user.id}`;
    const now = new Date().toISOString();

    queries.upsertRating.run({
      id: ratingId,
      event_id: event.id,
      user_id: req.user.id,
      rating,
      created_at: now,
      updated_at: now
    });

    recordActivity(req.user.id, 'rate_event', event.id, {
      title: event.title,
      rating
    });

    const summary = queries.getRatingSummaryForEvent.get(event.id);
    const totalVotes = Number(summary.total_votes) || 0;
    const excitingCount = Number(summary.exciting_count) || 0;
    const dullCount = Number(summary.dull_count) || 0;
    const excitingPercent = totalVotes > 0 ? Math.round((excitingCount / totalVotes) * 100) : 100;

    return res.json({
      message: `Event rated as ${rating}!`,
      vibeStats: {
        totalVotes,
        excitingCount,
        dullCount,
        excitingPercent,
        userRating: rating
      }
    });
  } catch (err) {
    console.error('Rate event error:', err);
    return res.status(500).json({ error: 'Failed to submit rating.' });
  }
});

// DELETE /api/events/:id/ratings - remove rating
router.delete('/:id/ratings', requireAuth, (req, res) => {
  try {
    const { id } = req.params;
    const event = queries.getEventBySlugOrId.get(id, id);
    if (!event) {
      return res.status(404).json({ error: 'Event not found.' });
    }

    queries.deleteRating.run(event.id, req.user.id);

    const summary = queries.getRatingSummaryForEvent.get(event.id);
    const totalVotes = Number(summary.total_votes) || 0;
    const excitingCount = Number(summary.exciting_count) || 0;
    const dullCount = Number(summary.dull_count) || 0;
    const excitingPercent = totalVotes > 0 ? Math.round((excitingCount / totalVotes) * 100) : 100;

    return res.json({
      message: 'Rating removed.',
      vibeStats: {
        totalVotes,
        excitingCount,
        dullCount,
        excitingPercent,
        userRating: null
      }
    });
  } catch (err) {
    console.error('Delete rating error:', err);
    return res.status(500).json({ error: 'Failed to remove rating.' });
  }
});

module.exports = router;
