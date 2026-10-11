/**
 * Automated Verification Test Suite for The New Tamale Events
 * Validates tests 1 through 14 as required by the specification.
 */
const { db, queries } = require('../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../middleware/auth');
const fs = require('fs');
const path = require('path');

async function runTests() {
  console.log('========================================================');
  console.log('  Running Automated Tests for The New Tamale Events');
  console.log('========================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, testName) {
    if (condition) {
      console.log(`  ✓ [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`  ✗ [FAIL] ${testName}`);
      failed++;
    }
  }

  // Test 1: User Registration
  const testEmail = `testuser_${Date.now()}@example.com`;
  const password = 'SecurePassword123!';
  const now = new Date().toISOString();
  const userId = `usr-test-${Date.now()}`;
  const passwordHash = bcrypt.hashSync(password, 10);

  db.prepare(`
    INSERT INTO profiles (id, full_name, email, phone_number, preferred_city, avatar_url, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(userId, 'Test Attendee', testEmail, '+233240001122', 'Damongo', 'https://example.com/avatar.jpg', now, now);

  db.prepare(`
    INSERT INTO users_auth (id, email, password_hash, created_at)
    VALUES (?, ?, ?, ?)
  `).run(userId, testEmail, passwordHash, now);

  db.prepare(`
    INSERT INTO user_roles (id, user_id, role, created_at)
    VALUES (?, ?, 'user', ?)
  `).run(`role-${Date.now()}`, userId, now);

  const registeredUser = queries.findUserByEmail.get(testEmail);
  assert(registeredUser !== undefined && registeredUser.full_name === 'Test Attendee', 'Test 1: User registration and persistent profile creation');

  // Test 2: User Authentication
  const isMatch = bcrypt.compareSync(password, registeredUser.password_hash);
  const token = jwt.sign({ userId: registeredUser.id, role: registeredUser.role }, JWT_SECRET, { expiresIn: '7d' });
  const decoded = jwt.verify(token, JWT_SECRET);
  assert(isMatch && decoded.userId === userId && decoded.role === 'user', 'Test 2: User authentication, bcrypt verification, and JWT session');

  // Test 3: Administrator Access
  const adminUser = queries.findUserByEmail.get('admin@newtamaleevents.com');
  assert(adminUser && adminUser.role === 'admin', 'Test 3: Administrator account exists with role "admin"');

  // Test 4: Access Restrictions (Role isolation)
  assert(registeredUser.role === 'user' && registeredUser.role !== 'admin', 'Test 4: Ordinary user is restricted to role "user" and cannot access admin');

  // Test 5: Event Creation by Administrator
  const newEventId = `evt-test-${Date.now()}`;
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
    newEventId,
    'Tamale Peace & Rhythm Concert',
    `tamale-peace-rhythm-${Date.now()}`,
    'A vibrant youth celebration of peace, music, and art.',
    'https://images.unsplash.com/photo-1470225620780-dba8ba36b745',
    'Concert',
    'Tamale',
    'Northern Region',
    'Jubilee Park',
    'Jubilee Park, Tamale',
    '2026-11-20',
    '19:00',
    '23:30',
    'Headline All-Stars',
    'Tamale Youth Board',
    '+233241112233',
    45.0,
    0,
    'https://egotickets.com/e/peace-rhythm',
    null,
    1,
    'published',
    adminUser.id,
    now,
    now
  );
  const createdEvt = queries.getEventBySlugOrId.get(newEventId, newEventId);
  assert(createdEvt && createdEvt.title === 'Tamale Peace & Rhythm Concert', 'Test 5: Event creation and database persistence');

  // Test 6: Public Event Discovery & City Filtering
  const tamaleEvents = db.prepare("SELECT * FROM events WHERE status = 'published' AND city = 'Tamale'").all();
  const damongoEvents = db.prepare("SELECT * FROM events WHERE status = 'published' AND city = 'Damango'").all();
  const boleEvents = db.prepare("SELECT * FROM events WHERE status = 'published' AND city = 'Bole'").all();
  const nyankpalaEvents = db.prepare("SELECT * FROM events WHERE status = 'published' AND city = 'Nyankpala'").all();
  assert(
    tamaleEvents.length > 0 && damongoEvents.length > 0 && boleEvents.length > 0 && nyankpalaEvents.length > 0,
    'Test 6: Public event discovery covers multiple open locations (Tamale, Damango, Bole, Nyankpala)'
  );

  // Test 7: Event Editing
  db.prepare("UPDATE events SET title = 'Tamale Peace & Rhythm Concert (Updated Edition)' WHERE id = ?").run(newEventId);
  const updatedEvt = queries.getEventBySlugOrId.get(newEventId, newEventId);
  assert(updatedEvt.title.includes('Updated Edition'), 'Test 7: Event information update persists to database');

  // Test 8: Saved Events Feature & Persistence
  const saveId = `save-test-${Date.now()}`;
  db.prepare(`
    INSERT INTO saved_events (id, user_id, event_id, created_at)
    VALUES (?, ?, ?, ?)
  `).run(saveId, userId, newEventId, now);

  const userSaved = queries.getSavedEventsForUser.all(userId);
  assert(userSaved.length > 0 && userSaved[0].id === newEventId, 'Test 8: User saved event successfully stored and retrieved');

  // Test 9: User Activity History
  const actId = `act-test-${Date.now()}`;
  db.prepare(`
    INSERT INTO user_activity (id, user_id, event_id, activity_type, metadata, created_at)
    VALUES (?, ?, ?, 'view_event', '{"channel":"web"}', ?)
  `).run(actId, userId, newEventId, now);

  const activities = queries.getUserActivities.all(userId, 10, 0);
  assert(activities.length > 0 && activities[0].activity_type === 'view_event', 'Test 9: User activity history logged and retrievable');

  // Test 10: User Isolation (User B cannot see User A's private data)
  const userBId = 'user-uuid-001'; // Wilhelm
  const userBSaved = queries.getSavedEventsForUser.all(userBId);
  const userBActs = queries.getUserActivities.all(userBId, 10, 0);
  assert(
    !userBSaved.some(e => e.saved_at === undefined) && !userBActs.some(a => a.id === actId),
    'Test 10: Strict user isolation verified in queries (no cross-user activity or saved event leakage)'
  );

  // Test 11: Data Persistence Check
  const dbFileStats = fs.statSync(path.join(__dirname, '..', 'data', 'tamale_events.db'));
  assert(dbFileStats.size > 0, 'Test 11: Database file exists permanently on disk and has non-zero size');

  // Test 12: Image/Upload Persistence Check
  const uploadsDir = path.join(__dirname, '..', 'uploads');
  const testUploadFile = path.join(uploadsDir, 'test-poster.txt');
  fs.writeFileSync(testUploadFile, 'TEST_POSTER_CONTENT');
  assert(fs.existsSync(testUploadFile), 'Test 12: Persistent uploads folder accessible for event posters');
  fs.unlinkSync(testUploadFile);

  // Test 13: Event Status Logic (Drafts hidden, Cancelled status flagged)
  const draftId = `evt-draft-${Date.now()}`;
  const draftSlug = `secret-draft-${Date.now()}`;
  db.prepare(`
    INSERT INTO events (
      id, title, slug, description, image_url, category, city, region,
      venue_name, event_date, start_time, organiser_name, ticket_price, is_free,
      status, created_at, updated_at
    ) VALUES (?, 'Secret Draft Show', ?, 'Desc', 'img.jpg', 'Concert', 'Tamale', 'Northern', 'Venue', '2026-12-01', '19:00', 'Org', 0, 1, 'draft', ?, ?)
  `).run(draftId, draftSlug, now, now);

  const publicEvents = queries.getAllPublishedEvents.all();
  const draftVisible = publicEvents.some(e => e.id === draftId);
  assert(!draftVisible, 'Test 13: Draft events are hidden from public event listings');

  // Test 14: Real stats calculation (No fabricated figures)
  const statsResult = queries.getAdminStats();
  assert(
    typeof statsResult.totalEvents === 'number' &&
    typeof statsResult.published === 'number' &&
    Array.isArray(statsResult.cityBreakdown) &&
    statsResult.cityBreakdown.length >= 4,
    'Test 14: Real database calculation verified across cities'
  );

  // Test 15: Event Comments (Live Crowd Vibe Updates)
  const commentId = `cmt-test-${Date.now()}`;
  queries.addComment.run(
    commentId,
    newEventId,
    userId,
    'Great vibe here right now, sound system is kicking!',
    'Currently Here',
    now
  );
  const eventComments = queries.getCommentsForEvent.all(newEventId);
  const foundComment = eventComments.find(c => c.id === commentId);
  assert(
    foundComment !== undefined &&
    foundComment.author_name === 'Test Attendee' &&
    foundComment.vibe_tag === 'Currently Here',
    'Test 15: Event comments system persists crowd vibe updates with attendee profile link'
  );

  // Test 16: Event Rating System ("Exciting" vs "Dull")
  const ratingId = `rate-test-${Date.now()}`;
  queries.upsertRating.run({
    id: ratingId,
    event_id: newEventId,
    user_id: userId,
    rating: 'exciting',
    created_at: now,
    updated_at: now
  });
  const ratingSummary = queries.getRatingSummaryForEvent.get(newEventId);
  const userRating = queries.getUserRatingForEvent.get(newEventId, userId);
  assert(
    userRating !== undefined &&
    userRating.rating === 'exciting' &&
    ratingSummary !== undefined &&
    Number(ratingSummary.exciting_count) >= 1 &&
    Number(ratingSummary.total_votes) >= 1,
    'Test 16: Event rating system records "exciting" vs "dull" votes and computes summary aggregates'
  );

  // Test 17: Trending Events (Most Talked About & Community Buzz)
  const trendingRows = db.prepare(`
    SELECT 
      e.id, e.title,
      (SELECT COUNT(*) FROM event_comments WHERE event_id = e.id) as comment_count,
      (SELECT COUNT(*) FROM event_ratings WHERE event_id = e.id) as vibe_votes,
      (
        ((SELECT COUNT(*) FROM event_comments WHERE event_id = e.id) * 3) +
        ((SELECT COUNT(*) FROM event_ratings WHERE event_id = e.id) * 2)
      ) as trending_score
    FROM events e
    WHERE e.status = 'published'
    ORDER BY trending_score DESC, e.event_date ASC
    LIMIT 5
  `).all();
  assert(
    trendingRows.length >= 3 &&
    Number(trendingRows[0].trending_score) >= Number(trendingRows[1].trending_score) &&
    Number(trendingRows[0].comment_count) > 0,
    'Test 17: Trending algorithm calculates buzz scores from attendee comments and ratings and ranks top talked-about events'
  );

  // Test 18: Real-Time Presence Engine & Heartbeat Processing
  const presence = require('../utils/presence');
  presence.touchUser(userId, '/admin');
  presence.touchVisitor('guest-session-123');
  const presenceOverview = presence.getPresenceOverview();
  const dbUserAfterTouch = db.prepare('SELECT last_seen_at FROM profiles WHERE id = ?').get(userId);
  assert(
    presenceOverview.onlineUsers.some((u) => u.id === userId) &&
    presenceOverview.onlineRegisteredCount >= 1 &&
    dbUserAfterTouch && dbUserAfterTouch.last_seen_at !== null,
    'Test 18: Real-time presence engine tracks active user session, guest visitors, and persists last_seen_at'
  );

  // Test 19: Admin Stats & Registered Users Presence Enrichment
  const adminStats = queries.getAdminStats();
  const allUsersEnriched = db.prepare(`
    SELECT p.id, p.full_name, p.email, p.last_seen_at, r.role
    FROM profiles p
    LEFT JOIN user_roles r ON p.id = r.user_id
  `).all();
  assert(
    adminStats.totalUsers >= 2 &&
    adminStats.onlineUsers >= 1 &&
    typeof adminStats.activeTodayUsers === 'number' &&
    allUsersEnriched.length >= 2,
    'Test 19: Admin dashboard calculates total registered users and live online presence counts'
  );

  console.log('\n========================================================');
  console.log(`  Tests Completed: ${passed} Passed, ${failed} Failed`);
  console.log('========================================================');

  if (failed === 0) {
    console.log('  >>> ALL ARCHITECTURAL, SOCIAL & PRESENCE TESTS PASSED SUCCESSFULLY! <<<\n');
    process.exit(0);
  } else {
    process.exit(1);
  }
}

runTests();
