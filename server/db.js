const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const { officialEventsLineup } = require('./data/eventsLineup');


const DB_PATH = path.join(__dirname, 'data', 'tamale_events.db');

// Ensure directory exists
fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });

const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

function initializeDatabase() {
  // 1. Profiles Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS profiles (
      id TEXT PRIMARY KEY,
      full_name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      phone_number TEXT,
      preferred_city TEXT DEFAULT 'Tamale',
      avatar_url TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `);

  // 2. User Authentication Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS users_auth (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (id) REFERENCES profiles(id) ON DELETE CASCADE
    );
  `);

  // 3. User Roles Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS user_roles (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'user',
      created_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE
    );
  `);

  // 4. Events Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS events (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      description TEXT NOT NULL,
      image_url TEXT NOT NULL,
      category TEXT NOT NULL,
      city TEXT NOT NULL,
      region TEXT NOT NULL,
      venue_name TEXT NOT NULL,
      venue_address TEXT,
      event_date TEXT NOT NULL,
      start_time TEXT NOT NULL,
      end_time TEXT,
      performers TEXT,
      organiser_name TEXT NOT NULL,
      organiser_contact TEXT,
      ticket_price REAL DEFAULT 0,
      is_free INTEGER DEFAULT 0,
      ticket_url TEXT,
      event_url TEXT,
      is_featured INTEGER DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'published',
      created_by TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `);

  // 5. Saved Events Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS saved_events (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      event_id TEXT NOT NULL,
      created_at TEXT NOT NULL,
      UNIQUE(user_id, event_id),
      FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE,
      FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
    );
  `);

  // 6. User Activity History Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS user_activity (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      event_id TEXT,
      activity_type TEXT NOT NULL,
      metadata TEXT,
      created_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE,
      FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE SET NULL
    );
  `);

  // 7. Event Organisers Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS event_organisers (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT,
      phone_number TEXT,
      organisation_name TEXT,
      website TEXT,
      created_at TEXT NOT NULL
    );
  `);

  // 8. Administrator Audit Logs Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS admin_audit_logs (
      id TEXT PRIMARY KEY,
      administrator_id TEXT NOT NULL,
      action TEXT NOT NULL,
      entity_type TEXT NOT NULL,
      entity_id TEXT NOT NULL,
      relevant_metadata TEXT,
      created_at TEXT NOT NULL,
      FOREIGN KEY (administrator_id) REFERENCES profiles(id) ON DELETE SET NULL
    );
  `);

  // Create Indexes
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_events_city ON events(city);
    CREATE INDEX IF NOT EXISTS idx_events_date ON events(event_date);
    CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);
    CREATE INDEX IF NOT EXISTS idx_events_category ON events(category);
    CREATE INDEX IF NOT EXISTS idx_saved_events_user ON saved_events(user_id);
    CREATE INDEX IF NOT EXISTS idx_user_activity_user ON user_activity(user_id);
    CREATE INDEX IF NOT EXISTS idx_admin_audit_logs_admin ON admin_audit_logs(administrator_id);
  `);

  seedInitialData();
}

function seedInitialData() {
  const now = new Date().toISOString();

  // Check if admin user exists
  const adminProfile = db.prepare('SELECT id FROM profiles WHERE email = ?').get('admin@newtamaleevents.com');
  if (!adminProfile) {
    const adminId = 'admin-uuid-001';
    const passwordHash = bcrypt.hashSync('TamaleAdmin2025!', 10);

    const insertProfile = db.prepare(`
      INSERT INTO profiles (id, full_name, email, phone_number, preferred_city, avatar_url, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    insertProfile.run(
      adminId,
      'The New Tamale Events Administrator',
      'admin@newtamaleevents.com',
      '+233 24 000 0001',
      'Tamale',
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      now,
      now
    );

    db.prepare(`
      INSERT INTO users_auth (id, email, password_hash, created_at)
      VALUES (?, ?, ?, ?)
    `).run(adminId, 'admin@newtamaleevents.com', passwordHash, now);

    db.prepare(`
      INSERT INTO user_roles (id, user_id, role, created_at)
      VALUES (?, ?, ?, ?)
    `).run('role-admin-001', adminId, 'admin', now);

    console.log('✓ Initial Administrator Account Created: admin@newtamaleevents.com');
  }

  // Check if standard test user exists
  const testUser = db.prepare('SELECT id FROM profiles WHERE email = ?').get('wilhelm@newtamaleevents.com');
  if (!testUser) {
    const userId = 'user-uuid-001';
    const userPassHash = bcrypt.hashSync('UserPassword2025!', 10);

    db.prepare(`
      INSERT INTO profiles (id, full_name, email, phone_number, preferred_city, avatar_url, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      userId,
      'Wilhelm Kutah',
      'wilhelm@newtamaleevents.com',
      '+233 24 555 1234',
      'Tamale',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
      now,
      now
    );

    db.prepare(`
      INSERT INTO users_auth (id, email, password_hash, created_at)
      VALUES (?, ?, ?, ?)
    `).run(userId, 'wilhelm@newtamaleevents.com', userPassHash, now);

    db.prepare(`
      INSERT INTO user_roles (id, user_id, role, created_at)
      VALUES (?, ?, ?, ?)
    `).run('role-user-001', userId, 'user', now);

    console.log('✓ Standard User Account Created: wilhelm@newtamaleevents.com');
  }

  // Check if events table has rows
  const eventCount = db.prepare('SELECT COUNT(*) as count FROM events').get().count;
  if (eventCount === 0) {
    console.log('⚡ Seeding official entertainment events lineup...');

    const sampleEvents = officialEventsLineup;

    const insertEvent = db.prepare(`
      INSERT INTO events (
        id, title, slug, description, image_url, category, city, region,
        venue_name, venue_address, event_date, start_time, end_time,
        performers, organiser_name, organiser_contact, ticket_price, is_free,
        ticket_url, event_url, is_featured, status, created_by, created_at, updated_at
      ) VALUES (
        @id, @title, @slug, @description, @image_url, @category, @city, @region,
        @venue_name, @venue_address, @event_date, @start_time, @end_time,
        @performers, @organiser_name, @organiser_contact, @ticket_price, @is_free,
        @ticket_url, @event_url, @is_featured, @status, 'admin-uuid-001', '${now}', '${now}'
      )
    `);

    const insertMany = db.transaction((events) => {
      for (const evt of events) {
        insertEvent.run(evt);
      }
    });

    insertMany(sampleEvents);
    console.log(`✓ Seeded ${sampleEvents.length} events from official lineup.`);
  }
}

// Initialize tables and seeds first
initializeDatabase();

// Helper Queries
const queries = {
  // Auth
  findUserByEmail: db.prepare(`
    SELECT p.*, a.password_hash, r.role
    FROM profiles p
    JOIN users_auth a ON p.id = a.id
    LEFT JOIN user_roles r ON p.id = r.user_id
    WHERE LOWER(p.email) = LOWER(?)
  `),

  findUserById: db.prepare(`
    SELECT p.*, r.role
    FROM profiles p
    LEFT JOIN user_roles r ON p.id = r.user_id
    WHERE p.id = ?
  `),

  // Events
  getAllPublishedEvents: db.prepare(`
    SELECT * FROM events
    WHERE status = 'published'
    ORDER BY event_date ASC, start_time ASC
  `),

  getEventBySlugOrId: db.prepare(`
    SELECT * FROM events
    WHERE slug = ? OR id = ?
  `),

  // Saved Events
  getSavedEventsForUser: db.prepare(`
    SELECT e.*, s.created_at as saved_at
    FROM saved_events s
    JOIN events e ON s.event_id = e.id
    WHERE s.user_id = ?
    ORDER BY s.created_at DESC
  `),

  isEventSavedByUser: db.prepare(`
    SELECT id FROM saved_events
    WHERE user_id = ? AND event_id = ?
  `),

  // Activity
  getUserActivities: db.prepare(`
    SELECT a.*, e.title as event_title, e.city as event_city, e.slug as event_slug
    FROM user_activity a
    LEFT JOIN events e ON a.event_id = e.id
    WHERE a.user_id = ?
    ORDER BY a.created_at DESC
    LIMIT ? OFFSET ?
  `),

  // Admin Logs
  getAuditLogs: db.prepare(`
    SELECT l.*, p.full_name as admin_name, p.email as admin_email
    FROM admin_audit_logs l
    LEFT JOIN profiles p ON l.administrator_id = p.id
    ORDER BY l.created_at DESC
    LIMIT ? OFFSET ?
  `),

  // Stats
  getAdminStats: () => {
    const totalEvents = db.prepare('SELECT COUNT(*) as count FROM events').get().count;
    const published = db.prepare("SELECT COUNT(*) as count FROM events WHERE status = 'published'").get().count;
    const drafts = db.prepare("SELECT COUNT(*) as count FROM events WHERE status = 'draft'").get().count;
    const cancelled = db.prepare("SELECT COUNT(*) as count FROM events WHERE status = 'cancelled'").get().count;
    const postponed = db.prepare("SELECT COUNT(*) as count FROM events WHERE status = 'postponed'").get().count;
    const archived = db.prepare("SELECT COUNT(*) as count FROM events WHERE status = 'archived'").get().count;
    const upcoming = db.prepare("SELECT COUNT(*) as count FROM events WHERE status = 'published' AND event_date >= date('now')").get().count;
    const past = db.prepare("SELECT COUNT(*) as count FROM events WHERE status = 'published' AND event_date < date('now')").get().count;
    const totalUsers = db.prepare('SELECT COUNT(*) as count FROM profiles').get().count;

    const cityBreakdown = db.prepare(`
      SELECT city, COUNT(*) as count
      FROM events
      GROUP BY city
    `).all();

    return {
      totalEvents,
      published,
      drafts,
      cancelled,
      postponed,
      archived,
      upcoming,
      past,
      totalUsers,
      cityBreakdown
    };
  }
};

module.exports = {
  db,
  queries
};

