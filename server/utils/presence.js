const { db } = require('../db');

// In-memory cache for live activity throttling
const memoryActiveUsers = new Map(); // userId -> { lastSeen: number, path: string }
const memoryActiveVisitors = new Map(); // sessionId -> number (timestamp)
const lastDbWrite = new Map(); // userId -> number (timestamp)

const ONLINE_WINDOW_MS = 5 * 60 * 1000; // 5 minutes
const DB_WRITE_THROTTLE_MS = 30 * 1000; // 30 seconds

// Prepared statement for updating last_seen_at
const updateLastSeenStmt = db.prepare(`
  UPDATE profiles SET last_seen_at = ? WHERE id = ?
`);

/**
 * Touch user presence when an authenticated request or heartbeat arrives
 */
function touchUser(userId, path = '/') {
  if (!userId) return;
  const now = Date.now();
  memoryActiveUsers.set(userId, { lastSeen: now, path });

  const lastWrite = lastDbWrite.get(userId) || 0;
  if (now - lastWrite >= DB_WRITE_THROTTLE_MS) {
    lastDbWrite.set(userId, now);
    try {
      updateLastSeenStmt.run(new Date(now).toISOString(), userId);
    } catch (err) {
      console.warn('Failed to update user last_seen_at:', err.message);
    }
  }
}

/**
 * Touch visitor presence for anonymous / guest visitors
 */
function touchVisitor(sessionId) {
  if (!sessionId) return;
  memoryActiveVisitors.set(sessionId, Date.now());
}

/**
 * Clean up stale memory sessions
 */
function cleanupStaleSessions() {
  const cutoff = Date.now() - ONLINE_WINDOW_MS;
  for (const [id, data] of memoryActiveUsers.entries()) {
    if (data.lastSeen < cutoff) {
      memoryActiveUsers.delete(id);
    }
  }
  for (const [id, time] of memoryActiveVisitors.entries()) {
    if (time < cutoff) {
      memoryActiveVisitors.delete(id);
    }
  }
}

// Periodic cleanup every 2 minutes
setInterval(cleanupStaleSessions, 2 * 60 * 1000);

/**
 * Get comprehensive presence metrics and list of online users
 */
function getPresenceOverview() {
  cleanupStaleSessions();

  const now = Date.now();
  const fiveMinAgo = new Date(now - ONLINE_WINDOW_MS).toISOString();
  const oneDayAgo = new Date(now - 24 * 60 * 60 * 1000).toISOString();

  // 1. Total registered users
  const totalUsers = db.prepare('SELECT COUNT(*) as count FROM profiles').get().count;

  // 2. Registered users currently online (seen in last 5m)
  const onlineRegisteredCount = db.prepare(`
    SELECT COUNT(*) as count FROM profiles WHERE last_seen_at >= ?
  `).get(fiveMinAgo).count;

  // 3. Active today (seen in last 24h)
  const activeTodayCount = db.prepare(`
    SELECT COUNT(*) as count FROM profiles WHERE last_seen_at >= ?
  `).get(oneDayAgo).count;

  // 4. Detailed list of users online right now
  const onlineUsersRaw = db.prepare(`
    SELECT p.id, p.full_name, p.email, p.phone_number, p.preferred_city, p.avatar_url, p.created_at, p.last_seen_at, r.role
    FROM profiles p
    LEFT JOIN user_roles r ON p.id = r.user_id
    WHERE p.last_seen_at >= ?
    ORDER BY p.last_seen_at DESC
  `).all(fiveMinAgo);

  const onlineUsers = onlineUsersRaw.map((u) => {
    const lastSeenTime = u.last_seen_at ? new Date(u.last_seen_at).getTime() : 0;
    const diffSeconds = Math.max(0, Math.floor((now - lastSeenTime) / 1000));
    return {
      ...u,
      is_online: true,
      last_active_seconds_ago: diffSeconds,
      last_active_human: diffSeconds < 60 ? 'Just now' : `${Math.floor(diffSeconds / 60)}m ago`
    };
  });

  // 5. Total live visitors (unique anonymous visitors + registered online)
  const activeVisitors = Math.max(memoryActiveVisitors.size, onlineRegisteredCount);

  return {
    totalUsers,
    onlineRegisteredCount,
    activeTodayCount,
    activeVisitors,
    onlineUsers
  };
}

module.exports = {
  touchUser,
  touchVisitor,
  getPresenceOverview,
  ONLINE_WINDOW_MS
};
