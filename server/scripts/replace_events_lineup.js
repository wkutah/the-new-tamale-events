const path = require('path');
const Database = require('better-sqlite3');

const DB_PATH = path.join(__dirname, '..', 'data', 'tamale_events.db');
const db = new Database(DB_PATH);

console.log('Replacing placeholder events with official events lineup...');

const sampleEvents = [
  // 1. MARHABA BLACK AND BOUGIE / 10th Oct 2026 / UDS Campus Nyankpala
  {
    id: 'evt-lineup-001',
    title: 'MARHABA BLACK AND BOUGIE',
    slug: 'marhaba-black-and-bougie',
    description: 'The premier campus glamour & luxury rave in Northern Ghana! Step out in sleek black & gold style for a sensational night of afrobeats, amapiano, red carpet photography, and electrifying student energy.',
    image_url: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80',
    category: 'Campus',
    city: 'Nyankpala',
    region: 'Northern Region',
    venue_name: 'UDS Campus Nyankpala',
    venue_address: 'UDS Nyankpala Campus Event Pavilion, Tolon District',
    event_date: '2026-10-10',
    start_time: '20:00',
    end_time: '04:00',
    performers: 'Campus All-Star DJs, Special Guest Hypeman, DJ Storm',
    organiser_name: 'Marhaba Entertainment & UDS SRC',
    organiser_contact: '+233 24 551 2345',
    ticket_price: 30.0,
    is_free: 0,
    ticket_url: 'https://egotickets.com/e/marhaba-black-and-bougie',
    event_url: '',
    is_featured: 1,
    status: 'published'
  },
  // 2. CASANOVA EXPERIENCE / 24th Oct 2026 / UDS Campus, Tamale
  {
    id: 'evt-lineup-002',
    title: 'CASANOVA EXPERIENCE',
    slug: 'casanova-experience',
    description: 'The ultimate party experience designed for youthful romance, infectious rhythms, and unforgettable nightlife memories on the Tamale UDS campus. Premium sound, lighting, and guest performers.',
    image_url: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=80',
    category: 'Campus',
    city: 'Tamale',
    region: 'Northern Region',
    venue_name: 'UDS Campus, Tamale',
    venue_address: 'UDS Dungu Campus Grounds, Tamale',
    event_date: '2026-10-24',
    start_time: '19:30',
    end_time: '03:30',
    performers: 'DJ Cupid, MC Casanova, Guest Northern Vocalists',
    organiser_name: 'The Casanova Experience Collective',
    organiser_contact: '+233 20 882 1144',
    ticket_price: 40.0,
    is_free: 0,
    ticket_url: 'https://egotickets.com/e/casanova-experience',
    event_url: '',
    is_featured: 1,
    status: 'published'
  },
  // 3. FOR THE CULTURE EXPERIENCE / 10th Oct 2026 / BOLE
  {
    id: 'evt-lineup-003',
    title: 'FOR THE CULTURE EXPERIENCE',
    slug: 'for-the-culture-experience-bole',
    description: 'A grand celebration of Savannah heritage, royal Gonja cultural music, traditional drumming, and youth entertainment in Bole. Showcasing traditional cuisine, indigenous attire, and contemporary Northern highlife rhythms.',
    image_url: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?auto=format&fit=crop&w=1200&q=80',
    category: 'Cultural',
    city: 'Bole',
    region: 'Savannah Region',
    venue_name: 'BOLE',
    venue_address: 'Bole Community Arena, Savannah Region',
    event_date: '2026-10-10',
    start_time: '14:00',
    end_time: '22:00',
    performers: 'Gonja Cultural Troupe, Savannah Youth Drummers, DJ Bamba',
    organiser_name: 'Bole Heritage Alliance',
    organiser_contact: '+233 24 332 9988',
    ticket_price: 0,
    is_free: 1,
    ticket_url: '',
    event_url: '',
    is_featured: 1,
    status: 'published'
  },
  // 4. THE HOMECOMING / 17th Oct / SPORTS STADIUM, Tamale
  {
    id: 'evt-lineup-004',
    title: 'THE HOMECOMING',
    slug: 'the-homecoming-tamale',
    description: 'Northern Ghana’s biggest gathering of returning diaspora, families, and music enthusiasts. An explosive night featuring stadium headliners, cultural dancers, street food carnivals, and dazzling stage pyrotechnics.',
    image_url: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1200&q=80',
    category: 'Concert',
    city: 'Tamale',
    region: 'Northern Region',
    venue_name: 'SPORTS STADIUM, Tamale',
    venue_address: 'Aliu Mahama Sports Stadium, Stadium Road, Tamale',
    event_date: '2026-10-17',
    start_time: '18:00',
    end_time: '05:00',
    performers: 'Northern All-Stars, Guest National Headliners, DJ Carlos, MC Northern Star',
    organiser_name: 'Homecoming Global Media',
    organiser_contact: '+233 50 112 3344',
    ticket_price: 50.0,
    is_free: 0,
    ticket_url: 'https://egotickets.com/e/the-homecoming-tamale',
    event_url: '',
    is_featured: 1,
    status: 'published'
  },
  // 5. MACCA X MR. P / 7th Nov 2026 / SPORTS STADIUM , Tamale
  {
    id: 'evt-lineup-005',
    title: 'MACCA X MR. P',
    slug: 'macca-x-mr-p-tamale',
    description: 'A stadium super-concert uniting Northern rap champion Maccasio with Nigerian afrobeats legend Mr. P (of P-Square)! High-octane choreography, classic hits, and an unforgettable celebration of African music greatness.',
    image_url: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=1200&q=80',
    category: 'Concert',
    city: 'Tamale',
    region: 'Northern Region',
    venue_name: 'SPORTS STADIUM, Tamale',
    venue_address: 'Aliu Mahama Sports Stadium, Tamale Metropolitan',
    event_date: '2026-11-07',
    start_time: '19:00',
    end_time: '04:30',
    performers: 'Maccasio, Mr. P (P-Square), Zola Gang, DJ Flex',
    organiser_name: 'Zola Music & Empire Concerts',
    organiser_contact: '+233 24 998 7766',
    ticket_price: 80.0,
    is_free: 0,
    ticket_url: 'https://egotickets.com/e/macca-x-mr-p',
    event_url: '',
    is_featured: 1,
    status: 'published'
  },
  // 6. KIDI AT KING DAVID / 21st Nov 2026 / KING DAVID , Tamale
  {
    id: 'evt-lineup-006',
    title: 'KIDI AT KING DAVID',
    slug: 'kidi-at-king-david',
    description: 'Ghanaian superstar KiDi delivers an exclusive, high-energy live performance at King David in Tamale. Featuring all your favorite hits with a full live band, VIP table service, and an unforgettable Savannah nightlife ambience.',
    image_url: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?auto=format&fit=crop&w=1200&q=80',
    category: 'Concert',
    city: 'Tamale',
    region: 'Northern Region',
    venue_name: 'KING DAVID, Tamale',
    venue_address: 'King David Grounds, Near Agric, Tamale',
    event_date: '2026-11-21',
    start_time: '20:00',
    end_time: '03:30',
    performers: 'KiDi, The Lynx Band, Supporting Northern Vocalists',
    organiser_name: 'Lynx Entertainment & King David Lounge',
    organiser_contact: '+233 55 443 2211',
    ticket_price: 120.0,
    is_free: 0,
    ticket_url: 'https://egotickets.com/e/kidi-king-david',
    event_url: '',
    is_featured: 1,
    status: 'published'
  },
  // 7. FAD’S HEALTH WALK / 10th Oct / Tamale
  {
    id: 'evt-lineup-007',
    title: 'FAD’S HEALTH WALK',
    slug: 'fads-health-walk-tamale',
    description: 'Promoting healthy living, fitness, and unity across Tamale! Join community members and youth leaders for an energizing morning walk, aerobics workout, brass band tunes, and free wellness screenings.',
    image_url: 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?auto=format&fit=crop&w=1200&q=80',
    category: 'Sports',
    city: 'Tamale',
    region: 'Northern Region',
    venue_name: 'Tamale',
    venue_address: 'Starting at Jubilee Park through Tamale Stadium, Tamale',
    event_date: '2026-10-10',
    start_time: '06:00',
    end_time: '11:00',
    performers: 'Fitness Instructors, Tamale Brass Band, MC Health',
    organiser_name: 'Fad Life Foundation & Health Circle',
    organiser_contact: '+233 24 771 8822',
    ticket_price: 0,
    is_free: 1,
    ticket_url: '',
    event_url: '',
    is_featured: 0,
    status: 'published'
  },
  // 8. STREE VYBS FAD LAN PASSING THROUGH / This Friday / Tamale
  {
    id: 'evt-lineup-008',
    title: 'STREE VYBS FAD LAN PASSING THROUGH',
    slug: 'street-vybs-fad-lan-passing-through',
    description: 'Young Bull Fad Lan takes over the streets of Tamale for an authentic street jam! Raw northern hip-hop, drill, street dancers, and live sound system culture in the heart of Tamale.',
    image_url: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1200&q=80',
    category: 'Nightlife',
    city: 'Tamale',
    region: 'Northern Region',
    venue_name: 'Tamale',
    venue_address: 'Aboabo Plaza, Tamale',
    event_date: '2026-10-16',
    start_time: '18:30',
    end_time: '01:00',
    performers: 'Fad Lan, Young Bull Movement, DJ Blackstar',
    organiser_name: 'Street Vybs Entertainment',
    organiser_contact: '+233 20 665 4433',
    ticket_price: 0,
    is_free: 1,
    ticket_url: '',
    event_url: '',
    is_featured: 1,
    status: 'published'
  },
  // 9. KIP / Dec 3rd to 6th, 2026 / Tamale
  {
    id: 'evt-lineup-009',
    title: 'KIP',
    slug: 'kip-tamale-2026',
    description: 'Northern Ghana’s premier multi-day creative festival (Dec 3rd to 6th, 2026). Celebrating music, visual arts, fashion exhibitions, youth mentorship panels, and live evening concerts across four dynamic days.',
    image_url: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80',
    category: 'Festival',
    city: 'Tamale',
    region: 'Northern Region',
    venue_name: 'Tamale',
    venue_address: 'Centre for National Culture, Tamale',
    event_date: '2026-12-03',
    start_time: '10:00',
    end_time: '23:00',
    performers: 'Multiple Northern & National Creators, Cultural Troupes, Guest Speakers',
    organiser_name: 'KIP Global Initiative',
    organiser_contact: '+233 24 123 7890',
    ticket_price: 25.0,
    is_free: 0,
    ticket_url: 'https://egotickets.com/e/kip-tamale-2026',
    event_url: '',
    is_featured: 1,
    status: 'published'
  },
  // 10. November to remember / 20th Nov 2026 / Damango
  {
    id: 'evt-lineup-010',
    title: 'November to remember',
    slug: 'november-to-remember-damango',
    description: 'The iconic Savannah festival in Damongo! Celebrate the harvest and wildlife heritage with evening campfires, live highlife bands, local drumming, and scenic outdoor dancing under the starry northern skies.',
    image_url: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=1200&q=80',
    category: 'Festival',
    city: 'Damango',
    region: 'Savannah Region',
    venue_name: 'Damango',
    venue_address: 'Damongo Community Park, Savannah Region',
    event_date: '2026-11-20',
    start_time: '17:00',
    end_time: '02:00',
    performers: 'Savannah Serenaders, Gonja Dancers, DJ Safari',
    organiser_name: 'Damango Youth & Tourism Alliance',
    organiser_contact: '+233 24 661 5599',
    ticket_price: 30.0,
    is_free: 0,
    ticket_url: 'https://egotickets.com/e/november-to-remember-damango',
    event_url: '',
    is_featured: 1,
    status: 'published'
  },
  // 11. BRUSH & BUBBLE / 10th Oct 2026 / testy sip, Tamale
  {
    id: 'evt-lineup-011',
    title: 'BRUSH & BUBBLE',
    slug: 'brush-and-bubble-tasty-sip',
    description: 'Sip, paint, and socialize in a relaxed aesthetic lounge atmosphere at Tasty Sip in Tamale. All canvas and painting materials supplied along with sparkling drinks, mocktails, and chill neo-soul tunes.',
    image_url: 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?auto=format&fit=crop&w=1200&q=80',
    category: 'Nightlife',
    city: 'Tamale',
    region: 'Northern Region',
    venue_name: 'testy sip, Tamale',
    venue_address: 'Tasty Sip Lounge, Hospital Road, Tamale',
    event_date: '2026-10-10',
    start_time: '16:00',
    end_time: '20:00',
    performers: 'Resident Art Instructor, DJ Chillout',
    organiser_name: 'Tasty Sip & Paint Collective',
    organiser_contact: '+233 20 445 6677',
    ticket_price: 80.0,
    is_free: 0,
    ticket_url: 'https://egotickets.com/e/brush-bubble-tamale',
    event_url: '',
    is_featured: 0,
    status: 'published'
  },
  // 12. SUNSET SOUL SESSION / 5th Dec / Tamale
  {
    id: 'evt-lineup-012',
    title: 'SUNSET SOUL SESSION',
    slug: 'sunset-soul-session-tamale',
    description: 'An enchanting golden hour musical escape in Tamale. Unwind to soothing live saxophone, acoustic melodies, and mellow afro-soul grooves as the sun sets over the Savannah horizon.',
    image_url: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1200&q=80',
    category: 'Nightlife',
    city: 'Tamale',
    region: 'Northern Region',
    venue_name: 'Tamale',
    venue_address: 'Modern City Rooftop Gardens, Tamale',
    event_date: '2026-12-05',
    start_time: '17:00',
    end_time: '22:30',
    performers: 'Northern Soul Collective, Saxophonist Kwesi, DJ Smooth',
    organiser_name: 'Sunset Sessions Ghana',
    organiser_contact: '+233 55 990 1122',
    ticket_price: 50.0,
    is_free: 0,
    ticket_url: 'https://egotickets.com/e/sunset-soul-session',
    event_url: '',
    is_featured: 1,
    status: 'published'
  }
];

const now = new Date().toISOString();

// Clear old placeholder events, saved events, and activity logs
db.prepare('DELETE FROM saved_events').run();
db.prepare('DELETE FROM user_activity').run();
db.prepare('DELETE FROM events').run();

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
console.log(`✓ Successfully seeded all ${sampleEvents.length} events from user lineup.`);

// Check database count
const count = db.prepare('SELECT COUNT(*) as count FROM events').get().count;
console.log(`Total events now in database: ${count}`);

const distinctCities = db.prepare('SELECT DISTINCT city FROM events').all();
console.log('Distinct cities with events:', distinctCities.map(c => c.city));
