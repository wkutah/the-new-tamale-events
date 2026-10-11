import { EventItem, UserProfile, UserActivity, AdminStats, AdminAuditLog, CitySummary, EventComment, VibeStats } from '../types';

const TOKEN_KEY = 'nte_auth_token';

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function removeStoredToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {})
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Remove Content-Type if sending FormData (e.g. for file upload)
  if (options.body instanceof FormData) {
    delete headers['Content-Type'];
  }

  const response = await fetch(endpoint, {
    ...options,
    headers
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMsg = data.error || data.message || `Request failed with status ${response.status}`;
    throw new Error(errorMsg);
  }

  return data as T;
}

export const api = {
  // Auth
  auth: {
    register: (payload: {
      full_name: string;
      email: string;
      password: string;
      preferred_city: string;
      phone_number?: string;
    }) => request<{ message: string; token: string; user: UserProfile }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),

    login: (credentials: { email: string; password: string }) =>
      request<{ message: string; token: string; user: UserProfile }>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials)
      }),

    getMe: () => request<{ user: UserProfile }>('/api/auth/me'),

    updateProfile: (data: Partial<UserProfile>) =>
      request<{ message: string; user: UserProfile }>('/api/auth/profile', {
        method: 'PUT',
        body: JSON.stringify(data)
      })
  },

  // Events
  events: {
    getAll: (params: {
      city?: string;
      category?: string;
      search?: string;
      is_free?: boolean;
      timeframe?: string;
      sort?: string;
      featured?: boolean;
    } = {}) => {
      const query = new URLSearchParams();
      if (params.city) query.set('city', params.city);
      if (params.category) query.set('category', params.category);
      if (params.search) query.set('search', params.search);
      if (params.is_free !== undefined) query.set('is_free', String(params.is_free));
      if (params.timeframe) query.set('timeframe', params.timeframe);
      if (params.sort) query.set('sort', params.sort);
      if (params.featured) query.set('featured', '1');

      return request<{ count: number; events: EventItem[] }>(`/api/events?${query.toString()}`);
    },

    getFeatured: () => request<{ events: EventItem[] }>('/api/events/featured'),

    getCitiesSummary: () => request<{ summaries: CitySummary[]; allCities?: string[] }>('/api/events/cities/summary'),

    getDetails: (slugOrId: string) =>
      request<{
        event: EventItem;
        isSaved: boolean;
        comments: EventComment[];
        vibeStats: VibeStats;
        related: EventItem[];
      }>(`/api/events/${slugOrId}`),

    addComment: (eventId: string, data: { content: string; vibe_tag?: string }) =>
      request<{ message: string; comment: EventComment }>(`/api/events/${eventId}/comments`, {
        method: 'POST',
        body: JSON.stringify(data)
      }),

    deleteComment: (eventId: string, commentId: string) =>
      request<{ message: string }>(`/api/events/${eventId}/comments/${commentId}`, {
        method: 'DELETE'
      }),

    rateEvent: (eventId: string, rating: 'exciting' | 'dull') =>
      request<{ message: string; vibeStats: VibeStats }>(`/api/events/${eventId}/ratings`, {
        method: 'POST',
        body: JSON.stringify({ rating })
      }),

    removeRating: (eventId: string) =>
      request<{ message: string; vibeStats: VibeStats }>(`/api/events/${eventId}/ratings`, {
        method: 'DELETE'
      })
  },

  // Saved Events
  saved: {
    getAll: () => request<{ savedEvents: (EventItem & { saved_at: string })[] }>('/api/saved'),

    check: (eventId: string) => request<{ isSaved: boolean }>(`/api/saved/check/${eventId}`),

    save: (eventId: string) => request<{ message: string; isSaved: boolean }>(`/api/saved/${eventId}`, {
      method: 'POST'
    }),

    remove: (eventId: string) => request<{ message: string; isSaved: boolean }>(`/api/saved/${eventId}`, {
      method: 'DELETE'
    })
  },

  // User Activity
  activity: {
    getAll: (params: { type?: string; page?: number; limit?: number } = {}) => {
      const query = new URLSearchParams();
      if (params.type) query.set('type', params.type);
      if (params.page) query.set('page', String(params.page));
      if (params.limit) query.set('limit', String(params.limit));

      return request<{ activities: UserActivity[]; total: number; page: number; limit: number }>(
        `/api/activity?${query.toString()}`
      );
    },

    log: (payload: { activity_type: string; event_id?: string; metadata?: Record<string, unknown> }) =>
      request<{ success: boolean }>('/api/activity/log', {
        method: 'POST',
        body: JSON.stringify(payload)
      })
  },

  // Admin
  admin: {
    getOverview: () => request<{ stats: AdminStats; recentEvents: EventItem[]; recentLogs: AdminAuditLog[] }>(
      '/api/admin/overview'
    ),

    getEvents: (params: { status?: string; city?: string; search?: string; page?: number } = {}) => {
      const query = new URLSearchParams();
      if (params.status) query.set('status', params.status);
      if (params.city) query.set('city', params.city);
      if (params.search) query.set('search', params.search);
      if (params.page) query.set('page', String(params.page));

      return request<{ events: EventItem[]; total: number; page: number; limit: number }>(
        `/api/admin/events?${query.toString()}`
      );
    },

    createEvent: (data: Partial<EventItem>) =>
      request<{ message: string; event: EventItem }>('/api/admin/events', {
        method: 'POST',
        body: JSON.stringify(data)
      }),

    updateEvent: (id: string, data: Partial<EventItem>) =>
      request<{ message: string; event: EventItem }>(`/api/admin/events/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
      }),

    changeStatus: (id: string, status: string) =>
      request<{ message: string; status: string }>(`/api/admin/events/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status })
      }),

    deleteEvent: (id: string, permanent = false) =>
      request<{ message: string }>(`/api/admin/events/${id}?permanent=${permanent}`, {
        method: 'DELETE'
      }),

    uploadPoster: (file: File) => {
      const formData = new FormData();
      formData.append('poster', file);
      return request<{ message: string; url: string; filename: string }>('/api/admin/upload', {
        method: 'POST',
        body: formData
      });
    },

    getUsers: () => request<{ users: UserProfile[] }>('/api/admin/users'),

    getAuditLogs: (page = 1) =>
      request<{ logs: AdminAuditLog[]; total: number; page: number; limit: number }>(
        `/api/admin/audit-logs?page=${page}`
      )
  }
};
