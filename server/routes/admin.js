const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const uuidv4 = () => crypto.randomUUID();
const { db, queries } = require('../db');
const { requireAdmin } = require('../middleware/auth');
const { recordAuditLog } = require('../utils/activity');

// Ensure uploads directory exists
const UPLOADS_DIR = path.join(__dirname, '..', 'uploads');
fs.mkdirSync(UPLOADS_DIR, { recursive: true });

// Configure Multer for persistent disk storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const uniqueName = `poster-${Date.now()}-${uuidv4().substring(0, 8)}${ext}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp|gif/;
    const ext = path.extname(file.originalname).toLowerCase().replace('.', '');
    if (allowed.test(ext) || allowed.test(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only image files (JPEG, PNG, WEBP, GIF) are allowed.'));
    }
  }
});

// All admin routes strictly require Administrator role
router.use(requireAdmin);

// GET /api/admin/overview - Real database metrics and city breakdown
router.get('/overview', (req, res) => {
  try {
    const stats = queries.getAdminStats();

    // Recent events created or updated
    const recentEvents = db.prepare(`
      SELECT * FROM events
      ORDER BY updated_at DESC
      LIMIT 6
    `).all();

    // Recent audit logs
    const recentLogs = queries.getAuditLogs.all(8, 0);

    return res.json({
      stats,
      recentEvents,
      recentLogs
    });
  } catch (err) {
    console.error('Admin overview error:', err);
    return res.status(500).json({ error: 'Failed to retrieve administrative statistics.' });
  }
});

// GET /api/admin/events - list all events with filtering
router.get('/events', (req, res) => {
  try {
    const { status, city, search, page = 1, limit = 50 } = req.query;
    const offset = (Math.max(1, parseInt(page)) - 1) * parseInt(limit);

    let sql = `SELECT * FROM events WHERE 1=1`;
    const params = [];

    if (status && status !== 'all') {
      sql += ` AND status = ?`;
      params.push(status);
    }

    if (city && city !== 'all') {
      sql += ` AND LOWER(city) = LOWER(?)`;
      params.push(city);
    }

    if (search && search.trim() !== '') {
      sql += ` AND (title LIKE ? OR performers LIKE ? OR venue_name LIKE ?)`;
      const query = `%${search.trim()}%`;
      params.push(query, query, query);
    }

    sql += ` ORDER BY updated_at DESC LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), offset);

    const events = db.prepare(sql).all(...params);

    // Total count
    let countSql = `SELECT COUNT(*) as total FROM events WHERE 1=1`;
    const countParams = [];
    if (status && status !== 'all') {
      countSql += ` AND status = ?`;
      countParams.push(status);
    }
    if (city && city !== 'all') {
      countSql += ` AND LOWER(city) = LOWER(?)`;
      countParams.push(city);
    }
    if (search && search.trim() !== '') {
      countSql += ` AND (title LIKE ? OR performers LIKE ? OR venue_name LIKE ?)`;
      const query = `%${search.trim()}%`;
      countParams.push(query, query, query);
    }
    const total = db.prepare(countSql).get(...countParams).total;

    return res.json({
      events,
      total,
      page: parseInt(page),
      limit: parseInt(limit)
    });
  } catch (err) {
    console.error('Admin events list error:', err);
    return res.status(500).json({ error: 'Failed to list events.' });
  }
});

// POST /api/admin/events - Create new event (Standard or Quick Add)
router.post('/events', (req, res) => {
  try {
    const {
      title,
      description,
      image_url,
      category,
      city,
      region,
      venue_name,
      venue_address,
      event_date,
      start_time,
      end_time,
      performers,
      organiser_name,
      organiser_contact,
      ticket_price = 0,
      is_free = 0,
      ticket_url,
      event_url,
      is_featured = 0,
      status = 'published'
    } = req.body;

    if (!title || !city || !event_date || !venue_name) {
      return res.status(400).json({
        error: 'Title, City, Event Date, and Venue are required fields.'
      });
    }

    // Default region mapping based on Northern Ghana cities
    let targetRegion = region;
    if (!targetRegion) {
      if (city === 'Tamale') targetRegion = 'Northern Region';
      else if (city === 'Damongo') targetRegion = 'Savannah Region';
      else if (city === 'Bolgatanga') targetRegion = 'Upper East Region';
      else if (city === 'Wa') targetRegion = 'Upper West Region';
      else targetRegion = 'Northern Region';
    }

    const eventId = `evt-${uuidv4()}`;
    const slugBase = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const slug = `${slugBase}-${Date.now().toString().slice(-4)}`;
    const now = new Date().toISOString();

    const finalImage = image_url && image_url.trim() !== ''
      ? image_url.trim()
      : 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=80';

    db.prepare(`
      INSERT INTO events (
        id, title, slug, description, image_url, category, city, region,
        venue_name, venue_address, event_date, start_time, end_time,
        performers, organiser_name, organiser_contact, ticket_price, is_free,
        ticket_url, event_url, is_featured, status, created_by, created_at, updated_at
      ) VALUES (
        ?, ?, ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?, ?
      )
    `).run(
      eventId,
      title.trim(),
      slug,
      description ? description.trim() : 'Live entertainment in Northern Ghana.',
      finalImage,
      category || 'Festival',
      city,
      targetRegion,
      venue_name.trim(),
      venue_address ? venue_address.trim() : `${venue_name}, ${city}`,
      event_date,
      start_time || '18:00',
      end_time || null,
      performers || null,
      organiser_name ? organiser_name.trim() : 'The New Tamale Events Partner',
      organiser_contact ? organiser_contact.trim() : null,
      parseFloat(ticket_price) || 0,
      Number(is_free) || (parseFloat(ticket_price) === 0 ? 1 : 0),
      ticket_url || null,
      event_url || null,
      Number(is_featured) || 0,
      status || 'published',
      req.user.id,
      now,
      now
    );

    recordAuditLog(req.user.id, 'create_event', 'event', eventId, {
      title,
      city,
      status
    });

    const createdEvent = queries.getEventBySlugOrId.get(eventId, eventId);

    return res.status(201).json({
      message: 'Event created and saved permanently to database!',
      event: createdEvent
    });
  } catch (err) {
    console.error('Create event error:', err);
    return res.status(500).json({ error: 'Failed to create event.' });
  }
});

// PUT /api/admin/events/:id - Update existing event
router.put('/events/:id', (req, res) => {
  try {
    const { id } = req.params;
    const existing = db.prepare('SELECT * FROM events WHERE id = ?').get(id);

    if (!existing) {
      return res.status(404).json({ error: 'Event not found.' });
    }

    const {
      title,
      description,
      image_url,
      category,
      city,
      region,
      venue_name,
      venue_address,
      event_date,
      start_time,
      end_time,
      performers,
      organiser_name,
      organiser_contact,
      ticket_price,
      is_free,
      ticket_url,
      event_url,
      is_featured,
      status
    } = req.body;

    const now = new Date().toISOString();

    db.prepare(`
      UPDATE events
      SET title = COALESCE(?, title),
          description = COALESCE(?, description),
          image_url = COALESCE(?, image_url),
          category = COALESCE(?, category),
          city = COALESCE(?, city),
          region = COALESCE(?, region),
          venue_name = COALESCE(?, venue_name),
          venue_address = COALESCE(?, venue_address),
          event_date = COALESCE(?, event_date),
          start_time = COALESCE(?, start_time),
          end_time = ?,
          performers = ?,
          organiser_name = COALESCE(?, organiser_name),
          organiser_contact = ?,
          ticket_price = COALESCE(?, ticket_price),
          is_free = COALESCE(?, is_free),
          ticket_url = ?,
          event_url = ?,
          is_featured = COALESCE(?, is_featured),
          status = COALESCE(?, status),
          updated_at = ?
      WHERE id = ?
    `).run(
      title ? title.trim() : null,
      description ? description.trim() : null,
      image_url || null,
      category || null,
      city || null,
      region || null,
      venue_name ? venue_name.trim() : null,
      venue_address || null,
      event_date || null,
      start_time || null,
      end_time || null,
      performers || null,
      organiser_name || null,
      organiser_contact || null,
      ticket_price !== undefined ? parseFloat(ticket_price) : null,
      is_free !== undefined ? Number(is_free) : null,
      ticket_url || null,
      event_url || null,
      is_featured !== undefined ? Number(is_featured) : null,
      status || null,
      now,
      id
    );

    recordAuditLog(req.user.id, 'update_event', 'event', id, {
      title: title || existing.title,
      status: status || existing.status
    });

    const updated = db.prepare('SELECT * FROM events WHERE id = ?').get(id);

    return res.json({
      message: 'Event updated successfully in database!',
      event: updated
    });
  } catch (err) {
    console.error('Update event error:', err);
    return res.status(500).json({ error: 'Failed to update event.' });
  }
});

// PATCH /api/admin/events/:id/status - Quick status change (published, draft, cancelled, postponed, archived)
router.patch('/events/:id/status', (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const valid = ['published', 'draft', 'cancelled', 'postponed', 'archived'];
    if (!valid.includes(status)) {
      return res.status(400).json({ error: 'Invalid event status.' });
    }

    const event = db.prepare('SELECT * FROM events WHERE id = ?').get(id);
    if (!event) {
      return res.status(404).json({ error: 'Event not found.' });
    }

    const now = new Date().toISOString();
    db.prepare('UPDATE events SET status = ?, updated_at = ? WHERE id = ?').run(status, now, id);

    recordAuditLog(req.user.id, `change_status_to_${status}`, 'event', id, {
      previousStatus: event.status,
      newStatus: status,
      title: event.title
    });

    return res.json({
      message: `Event status updated to "${status}".`,
      status
    });
  } catch (err) {
    console.error('Status change error:', err);
    return res.status(500).json({ error: 'Failed to change event status.' });
  }
});

// DELETE /api/admin/events/:id - Archive or delete with confirmation
router.delete('/events/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { permanent } = req.query;

    const event = db.prepare('SELECT * FROM events WHERE id = ?').get(id);
    if (!event) {
      return res.status(404).json({ error: 'Event not found.' });
    }

    if (permanent === 'true') {
      // Hard delete (when explicitly requested)
      db.prepare('DELETE FROM events WHERE id = ?').run(id);
      recordAuditLog(req.user.id, 'permanently_deleted_event', 'event', id, { title: event.title });
      return res.json({ message: 'Event permanently deleted from database.' });
    } else {
      // Soft-archive by default to preserve historical integrity
      const now = new Date().toISOString();
      db.prepare('UPDATE events SET status = ?, updated_at = ? WHERE id = ?').run('archived', now, id);
      recordAuditLog(req.user.id, 'archive_event', 'event', id, { title: event.title });
      return res.json({ message: 'Event archived successfully.' });
    }
  } catch (err) {
    console.error('Delete event error:', err);
    return res.status(500).json({ error: 'Failed to delete or archive event.' });
  }
});

// POST /api/admin/upload - Upload event poster to persistent object storage
router.post('/upload', upload.single('poster'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file uploaded.' });
    }

    // Return the persistent URL
    const fileUrl = `/uploads/${req.file.filename}`;

    return res.json({
      message: 'Poster uploaded successfully!',
      url: fileUrl,
      filename: req.file.filename,
      size: req.file.size
    });
  } catch (err) {
    console.error('Image upload error:', err);
    return res.status(500).json({ error: 'Failed to upload image.' });
  }
});

// GET /api/admin/users - User management (passwords never exposed)
router.get('/users', (req, res) => {
  try {
    const users = db.prepare(`
      SELECT p.id, p.full_name, p.email, p.phone_number, p.preferred_city, p.avatar_url, p.created_at, r.role
      FROM profiles p
      LEFT JOIN user_roles r ON p.id = r.user_id
      ORDER BY p.created_at DESC
    `).all();

    return res.json({ users });
  } catch (err) {
    console.error('Admin users error:', err);
    return res.status(500).json({ error: 'Failed to retrieve registered users.' });
  }
});

// GET /api/admin/audit-logs - View audit logs
router.get('/audit-logs', (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const offset = (Math.max(1, parseInt(page)) - 1) * parseInt(limit);

    const logs = queries.getAuditLogs.all(parseInt(limit), offset);
    const total = db.prepare('SELECT COUNT(*) as total FROM admin_audit_logs').get().total;

    return res.json({
      logs,
      total,
      page: parseInt(page),
      limit: parseInt(limit)
    });
  } catch (err) {
    console.error('Audit logs error:', err);
    return res.status(500).json({ error: 'Failed to retrieve audit logs.' });
  }
});

module.exports = router;
