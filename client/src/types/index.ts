export type City = string;

export type EventCategory =
  | 'Concert'
  | 'Nightlife'
  | 'Cultural'
  | 'Festival'
  | 'Comedy'
  | 'Campus'
  | 'Conference'
  | 'Sports';

export type EventStatus = 'draft' | 'published' | 'cancelled' | 'postponed' | 'archived';

export interface EventItem {
  id: string;
  title: string;
  slug: string;
  description: string;
  image_url: string;
  category: EventCategory;
  city: City;
  region: string;
  venue_name: string;
  venue_address?: string;
  event_date: string;
  start_time: string;
  end_time?: string;
  performers?: string;
  organiser_name: string;
  organiser_contact?: string;
  ticket_price: number;
  is_free: number;
  ticket_url?: string;
  event_url?: string;
  is_featured: number;
  status: EventStatus;
  created_by?: string;
  created_at: string;
  updated_at: string;
  comment_count?: number;
  vibe_votes?: number;
  vibe_exciting_count?: number;
  vibe_dull_count?: number;
  vibe_score?: number;
  vibe_label?: string;
  trending_rank?: number;
  trending_score?: number;
  buzz_summary?: string;
  latest_comment?: {
    content: string;
    vibe_tag?: string;
    created_at: string;
    author_name: string;
    author_avatar?: string;
  } | null;
}

export interface EventComment {
  id: string;
  event_id: string;
  user_id: string;
  content: string;
  vibe_tag?: string;
  created_at: string;
  author_name: string;
  author_avatar?: string;
  author_city?: string;
}

export interface VibeStats {
  totalVotes: number;
  excitingCount: number;
  dullCount: number;
  excitingPercent: number;
  userRating: 'exciting' | 'dull' | null;
}

export interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  phone_number?: string;
  preferred_city: City;
  avatar_url?: string;
  role: 'user' | 'admin';
  created_at: string;
}

export interface UserActivity {
  id: string;
  user_id: string;
  event_id?: string;
  activity_type: string;
  metadata?: string;
  created_at: string;
  event_title?: string;
  event_city?: City;
  event_slug?: string;
}

export interface AdminStats {
  totalEvents: number;
  published: number;
  drafts: number;
  cancelled: number;
  postponed: number;
  archived: number;
  upcoming: number;
  past: number;
  totalUsers: number;
  cityBreakdown: { city: City; count: number }[];
}

export interface AdminAuditLog {
  id: string;
  administrator_id: string;
  action: string;
  entity_type: string;
  entity_id: string;
  relevant_metadata?: string;
  created_at: string;
  admin_name?: string;
  admin_email?: string;
}

export interface CitySummary {
  city: City;
  upcomingCount: number;
  featuredEvent: EventItem | null;
}
