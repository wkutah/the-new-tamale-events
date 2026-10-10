# The New Tamale Events

> **The premier entertainment & event discovery platform across Northern Ghana:**  
> **Tamale • Damongo • Bolgatanga • Wa**

---

## 🌟 Overview

**The New Tamale Events** is a modern, responsive, full-stack entertainment discovery web application designed for Northern Ghana. The platform celebrates local culture, concerts, nightlife, campus parties, comedy shows, and festivals across four target cities with equal consideration:
1. **Tamale** (Northern Region capital, sports stadium concerts, night markets)
2. **Damongo** (Savannah Region, Mole National Park safari jams, Gonja heritage)
3. **Bolgatanga** (Upper East Region, artisanal craft festivals, sunset highlife)
4. **Wa** (Upper West Region, royal palace galas, campus youth raves)

The application features a modern frontend with energetic Northern Ghana visual branding, secure role-based authentication, a dedicated administrator dashboard, a quick-add event modal, and **persistent database storage** using SQLite with full ACID compliance.

---

## 🚀 Quick Start

### 1. Set Workspace
Recommended workspace directory:
```bash
/Users/wilhelmkutah/.gemini/antigravity-ide/scratch/the-new-tamale-events
```

### 2. Run the Application
From the project root:
```bash
# Start both the Express Backend (port 5050) and Vite Frontend (port 5173):
npm run dev

# Or start the unified production server on port 5050:
npm start
```
Access the application in your browser:
- **Frontend & API:** `http://localhost:5050` (or `http://localhost:5173` in Vite dev mode)

---

## 🔐 Pre-Configured Test Accounts

| Account Type | Email | Password | Role | Description |
| :--- | :--- | :--- | :--- | :--- |
| **Administrator** | `admin@newtamaleevents.com` | `TamaleAdmin2025!` | `admin` | Full access to `/admin` dashboard, quick add, event CRUD, user listings, and audit logs |
| **Standard User** | `wilhelm@newtamaleevents.com` | `UserPassword2025!` | `user` | Browse events, save events, view personal activity history |

*Note: Demo autofill buttons are built directly into the login screen for instant one-click testing.*

---

## 🏗️ Architecture & Technologies

- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS v4, Lucide React icons.
- **Backend:** Node.js, Express 5.
- **Database:** Persistent SQLite (`server/data/tamale_events.db`) using `better-sqlite3`. All records persist permanently across restarts and reboots.
- **Security & Auth:** `bcryptjs` for password hashing, signed `jsonwebtoken` (JWT), strict server-side role validation middleware.
- **Media Storage:** Persistent file uploads via `multer` to `server/uploads/`, served statically via `/uploads/:filename`.

---

## 🗄️ Database Tables

1. `profiles`: User profile data (`id`, `full_name`, `email`, `phone_number`, `preferred_city`, `avatar_url`, `created_at`, `updated_at`).
2. `users_auth`: Secure password hashes (`id`, `email`, `password_hash`, `created_at`).
3. `user_roles`: Role-based access control (`id`, `user_id`, `role: 'user' | 'admin'`, `created_at`).
4. `events`: Full event records (`id`, `title`, `slug`, `description`, `image_url`, `category`, `city`, `region`, `venue_name`, `venue_address`, `event_date`, `start_time`, `end_time`, `performers`, `organiser_name`, `ticket_price`, `is_free`, `ticket_url`, `is_featured`, `status`, `created_at`).
5. `saved_events`: User saved event bookmarks with unique constraint (`id`, `user_id`, `event_id`, `created_at`).
6. `user_activity`: User activity logs (`id`, `user_id`, `event_id`, `activity_type`, `metadata`, `created_at`).
7. `event_organisers`: Organiser directory.
8. `admin_audit_logs`: Immutable administrator action logs (`id`, `administrator_id`, `action`, `entity_type`, `entity_id`, `relevant_metadata`, `created_at`).

---

## 📡 API Endpoints Summary

- **Authentication:**
  - `POST /api/auth/register` - Create new user account (strictly assigned `user` role)
  - `POST /api/auth/login` - Authenticate with email & password, returns JWT
  - `GET /api/auth/me` - Retrieve current profile and role
  - `PUT /api/auth/profile` - Update profile name, phone, preferred city
- **Events:**
  - `GET /api/events` - Public event browsing with filters (`city`, `category`, `search`, `timeframe`, `is_free`, `sort`)
  - `GET /api/events/featured` - Curated homepage events
  - `GET /api/events/cities/summary` - Event counts and highlights for Tamale, Damongo, Bolgatanga, Wa
  - `GET /api/events/:slugOrId` - Single event details and related events
- **Saved Events (User Authenticated):**
  - `GET /api/saved` - Get authenticated user's saved events
  - `POST /api/saved/:eventId` - Save event
  - `DELETE /api/saved/:eventId` - Remove from saved
- **Activity (User Authenticated):**
  - `GET /api/activity` - User's private activity history
  - `POST /api/activity/log` - Log client action (ticket click, calendar add, share)
- **Administrator (Admin Authenticated):**
  - `GET /api/admin/overview` - Real database metrics and city breakdown
  - `GET /api/admin/events` - List all events with all statuses
  - `POST /api/admin/events` - Create event (Standard or Quick Add)
  - `PUT /api/admin/events/:id` - Update existing event
  - `PATCH /api/admin/events/:id/status` - Change event status (published, draft, cancelled, postponed, archived)
  - `DELETE /api/admin/events/:id` - Soft-archive or permanent delete
  - `POST /api/admin/upload` - Upload poster image file to persistent storage
  - `GET /api/admin/users` - Directory of registered users
  - `GET /api/admin/audit-logs` - System audit log records
