const Database = require('better-sqlite3');
const path = require('path');
const bcrypt = require('bcryptjs');

const dbPath = path.join(__dirname, 'tamale_events.db');
const db = new Database(dbPath);

console.log('⚡ Seeding realistic social buzz, ratings & attendee comments...');

// 1. Seed realistic attendee profiles if not already present
const mockAttendees = [
  {
    id: 'usr-attendee-001',
    full_name: 'Fatima Alhassan',
    email: 'fatima@gmail.com',
    preferred_city: 'Tamale',
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'
  },
  {
    id: 'usr-attendee-002',
    full_name: 'Kwame Bawa',
    email: 'kwame.b@gmail.com',
    preferred_city: 'Tamale',
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80'
  },
  {
    id: 'usr-attendee-003',
    full_name: 'Ibrahim Yakubu',
    email: 'iyakubu@yahoo.com',
    preferred_city: 'Nyankpala',
    avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80'
  },
  {
    id: 'usr-attendee-004',
    full_name: 'Amina Sulemana',
    email: 'amina.s@gmail.com',
    preferred_city: 'Bole',
    avatar_url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80'
  },
  {
    id: 'usr-attendee-005',
    full_name: 'David Tampuri',
    email: 'dtampuri@gmail.com',
    preferred_city: 'Damango',
    avatar_url: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=200&q=80'
  },
  {
    id: 'usr-attendee-006',
    full_name: 'Zeinab Issah',
    email: 'zeinab.issah@gmail.com',
    preferred_city: 'Tamale',
    avatar_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80'
  }
];

const now = new Date().toISOString();
const defaultPwHash = bcrypt.hashSync('Password123!', 8);

const insertProfile = db.prepare(`
  INSERT OR IGNORE INTO profiles (id, full_name, email, phone_number, preferred_city, avatar_url, created_at, updated_at)
  VALUES (@id, @full_name, @email, '+233 24 000 0000', @preferred_city, @avatar_url, '${now}', '${now}')
`);
const insertAuth = db.prepare(`
  INSERT OR IGNORE INTO users_auth (id, email, password_hash, created_at)
  VALUES (?, ?, ?, '${now}')
`);
const insertRole = db.prepare(`
  INSERT OR IGNORE INTO user_roles (id, user_id, role, created_at)
  VALUES (?, ?, 'user', '${now}')
`);

mockAttendees.forEach(user => {
  insertProfile.run(user);
  insertAuth.run(user.id, user.email, defaultPwHash);
  insertRole.run(`role-${user.id}`, user.id);
});

// 2. Curated comments per event
const initialComments = [
  // 1. MARHABA BLACK AND BOUGIE (evt-lineup-001)
  {
    eventId: 'evt-lineup-001',
    userId: 'usr-attendee-001',
    content: 'Nyankpala campus came through in pure all-black luxury! The red carpet setup at the entrance is insane! 📸✨',
    vibeTag: '📍 Here Now',
    timeOffsetHours: 2
  },
  {
    eventId: 'evt-lineup-001',
    userId: 'usr-attendee-003',
    content: 'DJ Storm just dropped back-to-back amapiano anthems. The entire pavilion is shaking! Don’t miss this!',
    vibeTag: '🔥 Hyped',
    timeOffsetHours: 1
  },
  {
    eventId: 'evt-lineup-001',
    userId: 'user-uuid-001',
    content: 'Security check was fast and organized. Vibe is 10/10 tonight. Definitely coming back next edition.',
    vibeTag: '🎵 Great Sound',
    timeOffsetHours: 0.5
  },

  // 2. CASANOVA EXPERIENCE (evt-lineup-002)
  {
    eventId: 'evt-lineup-002',
    userId: 'usr-attendee-002',
    content: 'Dungu campus grounds looking magical with the neon lighting! Entry line is getting long, get here early!',
    vibeTag: '📍 Here Now',
    timeOffsetHours: 4
  },
  {
    eventId: 'evt-lineup-002',
    userId: 'usr-attendee-006',
    content: 'The vibe is crazy romantic and energetic at the same time. Loving the live vocals!',
    vibeTag: '🔥 Hyped',
    timeOffsetHours: 2
  },

  // 3. FOR THE CULTURE EXPERIENCE (evt-lineup-003)
  {
    eventId: 'evt-lineup-003',
    userId: 'usr-attendee-004',
    content: 'The Gonja royal drummers and dancers blew everyone away! Bole is so alive today! 🥁👑',
    vibeTag: '🔥 Hyped',
    timeOffsetHours: 3
  },
  {
    eventId: 'evt-lineup-003',
    userId: 'usr-attendee-005',
    content: 'Traditional smocks, guinea fowl kebab, and acoustic flutes. True savannah heritage pride right here in Bole.',
    vibeTag: '📍 Here Now',
    timeOffsetHours: 1.5
  },

  // 4. THE HOMECOMING (evt-lineup-004)
  {
    eventId: 'evt-lineup-004',
    userId: 'usr-attendee-001',
    content: 'The diaspora turnout is massive! Stadium sound system is shaking the whole Tamale metropolis tonight! 🏟️⚡',
    vibeTag: '🔥 Hyped',
    timeOffsetHours: 5
  },
  {
    eventId: 'evt-lineup-004',
    userId: 'usr-attendee-002',
    content: 'Dazzling stage pyrotechnics and street food carnivals right outside the gate. Unmatched energy!',
    vibeTag: '📍 Here Now',
    timeOffsetHours: 3
  },

  // 5. MACCA X MR. P (evt-lineup-005)
  {
    eventId: 'evt-lineup-005',
    userId: 'usr-attendee-003',
    content: 'Maccasio and Mr. P (P-Square) together on one stage is historic! Tamale sports stadium is packed to the brim! 🤯🔥',
    vibeTag: '🔥 Hyped',
    timeOffsetHours: 6
  },
  {
    eventId: 'evt-lineup-005',
    userId: 'usr-attendee-006',
    content: 'The choreography and live band synergy is pure international quality. Worth every cedi!',
    vibeTag: '🎵 Great Sound',
    timeOffsetHours: 2
  },

  // 6. KIDI AT KING DAVID (evt-lineup-006)
  {
    eventId: 'evt-lineup-006',
    userId: 'usr-attendee-001',
    content: 'KiDi’s vocals with the Lynx live band are so smooth live! VIP ambience at King David is top tier tonight.',
    vibeTag: '🎵 Great Sound',
    timeOffsetHours: 4
  },

  // 7. FAD’S HEALTH WALK (evt-lineup-007)
  {
    eventId: 'evt-lineup-007',
    userId: 'usr-attendee-005',
    content: 'The brass band kept our energy up all the way from Jubilee Park to the stadium! Great morning fitness routine.',
    vibeTag: '📍 Here Now',
    timeOffsetHours: 10
  },

  // 8. STREE VYBS FAD LAN PASSING THROUGH (evt-lineup-008)
  {
    eventId: 'evt-lineup-008',
    userId: 'usr-attendee-002',
    content: 'Aboabo Plaza is completely shut down! Young Bull Fad Lan is tearing up the stage with street drill! 🎙️🐂',
    vibeTag: '🔥 Hyped',
    timeOffsetHours: 1
  },
  {
    eventId: 'evt-lineup-008',
    userId: 'usr-attendee-003',
    content: 'Pure authentic Tamale street jam! Huge crowd, energetic bboys and drill anthems.',
    vibeTag: '📍 Here Now',
    timeOffsetHours: 0.5
  },

  // 9. KIP (evt-lineup-009)
  {
    eventId: 'evt-lineup-009',
    userId: 'usr-attendee-004',
    content: 'The art exhibitions and youth mentorship sessions at CNC are mind-opening. Great creative community!',
    vibeTag: '✨ Chill Vibe',
    timeOffsetHours: 8
  },

  // 10. November to remember (evt-lineup-010)
  {
    eventId: 'evt-lineup-010',
    userId: 'usr-attendee-005',
    content: 'Campfire under the starry Damongo sky with local highlife guitar... pure peace and community warmth.',
    vibeTag: '✨ Chill Vibe',
    timeOffsetHours: 4
  },

  // 11. BRUSH & BUBBLE (evt-lineup-011)
  {
    eventId: 'evt-lineup-011',
    userId: 'usr-attendee-006',
    content: 'Tasty Sip lounge is such a relaxing aesthetic spot. Painted my first canvas while sipping iced mocktails! 🎨🍸',
    vibeTag: '✨ Chill Vibe',
    timeOffsetHours: 6
  },

  // 12. SUNSET SOUL SESSION (evt-lineup-012)
  {
    eventId: 'evt-lineup-012',
    userId: 'usr-attendee-001',
    content: 'Saxophone soloist as the sun sets over the Tamale skyline... incredible rooftop vibe!',
    vibeTag: '🎵 Great Sound',
    timeOffsetHours: 12
  }
];

// Clear existing comments & ratings to cleanly re-seed
db.prepare('DELETE FROM event_comments').run();
db.prepare('DELETE FROM event_ratings').run();

const insertComment = db.prepare(`
  INSERT INTO event_comments (id, event_id, user_id, content, vibe_tag, created_at)
  VALUES (?, ?, ?, ?, ?, ?)
`);

initialComments.forEach((c, idx) => {
  const commentTime = new Date(Date.now() - (c.timeOffsetHours * 3600 * 1000)).toISOString();
  insertComment.run(`cmt-${c.eventId}-${idx + 1}`, c.eventId, c.userId, c.content, c.vibeTag, commentTime);
});
console.log(`✓ Seeded ${initialComments.length} realistic event comments.`);

// 3. Seed Realistic Ratings (Exciting vs Dull) across all 12 events
const allUsers = ['admin-uuid-001', 'user-uuid-001', ...mockAttendees.map(u => u.id)];

const insertRating = db.prepare(`
  INSERT OR REPLACE INTO event_ratings (id, event_id, user_id, rating, created_at, updated_at)
  VALUES (?, ?, ?, ?, ?, ?)
`);

const events = db.prepare('SELECT id, title FROM events').all();
let ratingCount = 0;

events.forEach(evt => {
  // Give each event between 4 and 7 user ratings, mostly "exciting", with occasional "dull" for realistic balance
  allUsers.forEach((uId, idx) => {
    // Determine rating: 90% exciting, 10% dull
    const isExciting = !(idx === 4 && evt.id.endsWith('007')); // Fad's health walk has 1 dull from non-morning person
    const rating = isExciting ? 'exciting' : 'dull';
    const ratingId = `rtg-${evt.id}-${uId}`;
    insertRating.run(ratingId, evt.id, uId, rating, now, now);
    ratingCount++;
  });
});

console.log(`✓ Seeded ${ratingCount} ratings (Exciting vs Dull) across ${events.length} events.`);

// Verify summary
const stats = db.prepare(`
  SELECT 
    COUNT(*) as total_ratings,
    SUM(CASE WHEN rating = 'exciting' THEN 1 ELSE 0 END) as exciting,
    SUM(CASE WHEN rating = 'dull' THEN 1 ELSE 0 END) as dull
  FROM event_ratings
`).get();
console.log('Rating statistics:', stats);
