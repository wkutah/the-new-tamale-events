const { db } = require('../db');
const crypto = require('crypto');
const uuidv4 = () => crypto.randomUUID();

function recordActivity(userId, activityType, eventId = null, metadata = {}) {
  if (!userId) return;
  try {
    const id = `act-${uuidv4()}`;
    const now = new Date().toISOString();
    const metadataStr = typeof metadata === 'string' ? metadata : JSON.stringify(metadata);

    db.prepare(`
      INSERT INTO user_activity (id, user_id, event_id, activity_type, metadata, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(id, userId, eventId, activityType, metadataStr, now);
  } catch (err) {
    console.error('Failed to log user activity:', err.message);
  }
}

function recordAuditLog(adminId, action, entityType, entityId, metadata = {}) {
  try {
    const id = `audit-${uuidv4()}`;
    const now = new Date().toISOString();
    const metadataStr = typeof metadata === 'string' ? metadata : JSON.stringify(metadata);

    db.prepare(`
      INSERT INTO admin_audit_logs (id, administrator_id, action, entity_type, entity_id, relevant_metadata, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(id, adminId, action, entityType, entityId, metadataStr, now);
  } catch (err) {
    console.error('Failed to record admin audit log:', err.message);
  }
}

module.exports = {
  recordActivity,
  recordAuditLog
};
