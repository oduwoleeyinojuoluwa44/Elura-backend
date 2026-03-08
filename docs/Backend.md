# Elura — Backend Architecture (`backend.md`)

Version: 1.0  
Product: Elura  
Scope: MVP Backend Design  
Primary Goal: Ship a reliable backend for artist onboarding, portfolio management, discovery, booking requests, and one AI-powered artist tool.

---

# 1. Purpose

This document defines the backend structure for Elura's MVP.

It covers:

- backend goals
- architecture decisions
- database schema
- authentication
- storage
- API structure
- AI feature integration
- security rules
- development order

This document is meant to guide implementation, not just describe ideas.

---

# 2. Backend Goal

The backend for Elura should support the MVP flow:

Artist signs up  
→ creates profile  
→ uploads portfolio  
→ becomes discoverable  
→ receives booking requests  
→ uses AI consultation feature

The backend should be:

- fast to build
- easy to maintain
- secure enough for public launch
- flexible enough for future expansion

---

# 3. Backend Stack

## Core Stack

- **Database:** PostgreSQL via Supabase
- **Authentication:** Supabase Auth
- **Storage:** Supabase Storage
- **API Layer:** Next.js Route Handlers / Server Actions
- **Hosting:** Vercel
- **AI:** OpenAI API
- **ORM:** Optional for MVP. Use Supabase SDK directly first.

---

# 4. Why This Backend Approach

Elura is an MVP marketplace.

The goal is not to build a heavy custom backend from day one.  
The goal is to validate demand and ship useful functionality quickly.

Supabase is being used because it gives:

- managed Postgres
- auth
- storage
- row-level security
- migrations
- dashboard for inspection

This lets the product move faster while still using a real relational database.

---

# 5. Core Backend Responsibilities

The backend must support these responsibilities:

## 5.1 User and Artist Management
- create accounts
- authenticate users
- associate authenticated users with artist profiles

## 5.2 Profile Management
- create artist profiles
- update public artist data
- generate public profile lookup by username

## 5.3 Portfolio Management
- upload images
- store image metadata
- link images to artists
- return portfolio images for public viewing

## 5.4 Discovery
- return artist lists
- support filtering by location, specialty, and price range

## 5.5 Booking Requests
- store booking requests
- associate requests with an artist
- support artist-side retrieval later

## 5.6 AI Feature
- receive structured artist input
- call model provider
- return a consultation pack response

---

# 6. High-Level Architecture

```text
Client App (Next.js)
    |
    |-- Supabase Auth
    |-- Supabase Database
    |-- Supabase Storage
    |
    |-- Server Routes / API Layer
            |
            |-- Validation
            |-- Authorization
            |-- OpenAI API (AI consultation feature)
```

---

# 7. Data Model Overview

The MVP needs these main backend entities:

- users
- artists
- portfolio_images
- booking_requests

Optional future entities:

- reviews
- favorites
- conversations
- payments
- verifications

---

# 8. Database Design

## 8.1 Table: artists

This is the main professional profile record.

### Purpose
Stores all public-facing artist information.

### Fields

- `id` UUID primary key
- `user_id` UUID unique references auth user
- `username` TEXT unique not null
- `full_name` TEXT not null
- `bio` TEXT
- `location` TEXT
- `specialty` TEXT[] default empty array
- `price_range` TEXT
- `instagram_handle` TEXT
- `profile_image_url` TEXT
- `is_published` BOOLEAN default false
- `created_at` TIMESTAMPTZ default now()
- `updated_at` TIMESTAMPTZ default now()

### Notes

- `user_id` links the artist profile to the authenticated account.
- `username` powers public profile URLs like `/artist/[username]`.
- `is_published` prevents half-complete profiles from showing publicly.

---

## 8.2 Table: portfolio_images

Stores portfolio uploads for each artist.

### Fields

- `id` UUID primary key
- `artist_id` UUID references artists(id) on delete cascade
- `image_url` TEXT not null
- `storage_path` TEXT not null
- `caption` TEXT
- `sort_order` INT default 0
- `created_at` TIMESTAMPTZ default now()

### Notes

- `storage_path` is useful for deletion and maintenance.
- `sort_order` supports manual arrangement later.

---

## 8.3 Table: booking_requests

Stores client booking inquiries.

### Fields

- `id` UUID primary key
- `artist_id` UUID references artists(id) on delete cascade
- `client_name` TEXT not null
- `client_email` TEXT
- `client_phone` TEXT
- `event_type` TEXT not null
- `event_date` DATE
- `message` TEXT not null
- `status` TEXT default 'new'
- `created_at` TIMESTAMPTZ default now()

### Notes

- `status` can later support `new`, `viewed`, `accepted`, `declined`.
- `client_email` is optional for MVP but useful.

---

# 9. Suggested SQL Schema

```sql
create extension if not exists "pgcrypto";

create table if not exists public.artists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique not null,
  username text unique not null,
  full_name text not null,
  bio text,
  location text,
  specialty text[] default '{}',
  price_range text,
  instagram_handle text,
  profile_image_url text,
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.portfolio_images (
  id uuid primary key default gen_random_uuid(),
  artist_id uuid not null references public.artists(id) on delete cascade,
  image_url text not null,
  storage_path text not null,
  caption text,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.booking_requests (
  id uuid primary key default gen_random_uuid(),
  artist_id uuid not null references public.artists(id) on delete cascade,
  client_name text not null,
  client_email text,
  client_phone text,
  event_type text not null,
  event_date date,
  message text not null,
  status text not null default 'new',
  created_at timestamptz not null default now()
);
```

---

# 10. Authentication Design

## 10.1 Auth Provider

Use **Supabase Auth**.

### Supported MVP auth method
- email + password

### Why
- simplest to implement
- enough for early artist onboarding
- avoids OAuth complexity in the first version

---

## 10.2 Auth Flow

### Artist Signup Flow

STEP 1  
User creates account with email and password

STEP 2  
Supabase Auth creates auth user and sends email confirmation when required

STEP 3  
User lands on `/auth/confirm` so the backend can exchange `token_hash` for a session cookie

STEP 4  
App redirects to onboarding flow with an authenticated session

STEP 5  
User completes artist profile

STEP 6  
Artist row is created in `artists`

### Session Handling
- use Supabase SSR cookie-based sessions
- refresh auth state through `src/proxy.ts`
- resolve ownership on protected routes from the authenticated session, not from request headers

---

## 10.3 Artist Identity Rule

A signed-in user should only own **one artist profile** for MVP.

This is why `artists.user_id` should be unique.

---

# 11. Storage Design

## 11.1 Storage Bucket

Create one bucket:

- `portfolio-images`

## 11.2 Storage Convention

Use a predictable path structure:

```text
portfolio-images/{artist_id}/{filename}
```

Example:

```text
portfolio-images/0d12-artist-uuid/look-1.jpg
```

## 11.3 Why this matters

This makes:
- cleanup easier
- debugging easier
- ownership enforcement easier

---

# 12. Row Level Security (RLS)

RLS should be enabled on all tables.

## 12.1 artists policies

### Public read
Anyone can read only published artist profiles.

### Owner write
Authenticated user can insert and update only their own profile.

---

## 12.2 portfolio_images policies

### Public read
Anyone can view images that belong to published artists.

### Owner write
Authenticated user can manage only images tied to their own artist profile.

---

## 12.3 booking_requests policies

### Public insert
Unauthenticated or authenticated clients can submit booking requests.

### Owner read
Only the artist owner can read booking requests for their profile.

### Owner update
Only the artist owner can change status later.

---

# 13. Suggested RLS Policy Logic

```sql
alter table public.artists enable row level security;
alter table public.portfolio_images enable row level security;
alter table public.booking_requests enable row level security;
```

### Example policy ideas

```sql
create policy "public can read published artists"
on public.artists
for select
using (is_published = true);

create policy "artist owner can insert own profile"
on public.artists
for insert
to authenticated
with check (auth.uid() = user_id);

create policy "artist owner can update own profile"
on public.artists
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);
```

Note: portfolio image and booking request policies should follow the same ownership model through joins/subqueries.

---

# 14. API Design

Even though Supabase provides direct database access, Elura should still use a thin backend API layer for important operations.

This keeps business logic centralized.

## 14.1 Recommended Route Structure

```text
/app/api
  /artists
    /route.ts
  /artists/[username]
    /route.ts
  /portfolio
    /route.ts
  /booking-requests
    /route.ts
  /ai
    /consultation-pack
      /route.ts
```

---

# 15. API Responsibilities

## 15.1 POST /api/artists
Create or update artist profile.

### Input
- full_name
- username
- bio
- location
- specialty
- price_range
- instagram_handle
- profile_image_url

### Behavior
- validate payload
- ensure authenticated user
- create artist row if none exists
- update otherwise

---

## 15.2 GET /api/artists
Return artist list for discovery.

### Query params
- location
- specialty
- price_range

### Behavior
- return only published artists
- support filter combinations
- support pagination later

---

## 15.3 GET /api/artists/[username]
Return one public artist profile with portfolio images.

### Behavior
- fetch artist by username
- ensure artist is published
- include ordered portfolio images

---

## 15.4 POST /api/portfolio
Handle image metadata creation after upload.

### Behavior
- verify ownership
- write image row in `portfolio_images`

---

## 15.5 POST /api/booking-requests
Create a booking request.

### Input
- artist_id
- client_name
- client_email
- client_phone
- event_type
- event_date
- message

### Behavior
- validate fields
- insert record
- optionally trigger email notification later

---

## 15.6 POST /api/ai/consultation-pack
Generate AI consultation pack for artists.

### Input
- eventType
- skinType
- desiredFinish
- timeConstraint
- notes

### Behavior
- validate request
- ensure authenticated artist
- call OpenAI API
- return structured output

---

# 16. AI Feature Backend Design

## 16.1 MVP AI Feature
**Consultation Pack Generator**

## 16.2 Why this feature
It directly helps makeup artists prepare for jobs and makes Elura useful beyond discovery.

## 16.3 AI Request Payload Example

```json
{
  "eventType": "bridal",
  "skinType": "oily",
  "desiredFinish": "soft glam",
  "timeConstraint": "90 minutes",
  "notes": "client has sensitive eyes"
}
```

## 16.4 AI Response Shape

```json
{
  "questionnaire": ["..."],
  "prepMessage": "...",
  "kitChecklist": ["..."],
  "timeline": ["..."],
  "artistTips": ["..."]
}
```

## 16.5 Prompting Rule
The backend should enforce structured output.

The AI should:
- stay practical
- avoid brand-specific product claims
- avoid making up medical or allergy advice
- avoid pretending certainty where there is none

---

# 17. Validation Rules

Validation should exist before database writes.

## 17.1 Artist validation
- username required, lowercase, unique
- full_name required
- specialty should be array
- profile image optional for first draft
- publish should require minimum profile completeness

## 17.2 Portfolio validation
- file type image only
- max file size enforced
- only owner can attach images to own profile

## 17.3 Booking validation
- client_name required
- event_type required
- message required
- basic spam checks

## 17.4 AI validation
- authenticated artist only
- rate limit requests
- constrain payload size

---

# 18. Publish Rules

Artists should not automatically become public the moment they sign up.

A profile can be marked `is_published = true` only when minimum requirements are met.

## Recommended minimum publish requirements
- full_name exists
- username exists
- location exists
- at least one specialty exists
- at least one portfolio image uploaded

This protects discovery quality.

---

# 19. Backend Folder Structure

Recommended project structure:

```text
elura/
├─ app/
│  ├─ api/
│  │  ├─ artists/
│  │  ├─ booking-requests/
│  │  ├─ portfolio/
│  │  └─ ai/
│  │     └─ consultation-pack/
│  ├─ artist/
│  ├─ dashboard/
│  └─ discover/
│
├─ lib/
│  ├─ supabase/
│  │  ├─ client.ts
│  │  ├─ server.ts
│  │  └─ admin.ts
│  ├─ validators/
│  ├─ ai/
│  └─ utils/
│
├─ supabase/
│  ├─ migrations/
│  └─ config.toml
│
└─ docs/
   ├─ elura_prd.md
   └─ backend.md
```

---

# 20. Environment Variables

Recommended environment variables:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
OPENAI_API_KEY=
```

## Notes
- prefer `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` for current Supabase projects
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` can remain as a legacy fallback
- `SUPABASE_SERVICE_ROLE_KEY` should only be used on the server.
- Never expose service role keys to the client.

---

# 21. Error Handling Expectations

The backend should return clean, predictable errors.

## Example categories
- validation errors
- unauthorized
- forbidden
- not found
- upload failure
- AI generation failure

## Rule
Do not leak raw internal errors directly to users.

---

# 22. Notifications

Notifications are not core MVP backend infrastructure yet.

For MVP:
- booking requests can simply be stored in DB
- optional email notifications can be added after core flow works

Do not block MVP launch because of notification complexity.

---

# 23. Future Backend Features

These are intentionally out of MVP scope but should influence how the backend is designed.

## 23.1 Reviews
Future table:
- review_id
- artist_id
- booking_request_id
- rating
- review_text

## 23.2 Payments
Future integration:
- deposits
- payment status
- cancellation policy support

## 23.3 Messaging
Future entities:
- conversations
- messages

## 23.4 Verification
Future entities:
- verification_status
- verification_documents

## 23.5 Analytics
Future tracking:
- profile views
- booking conversion
- AI tool usage

---

# 24. Development Order

This is the recommended backend implementation order.

## Phase 1 — Project Foundation
STEP 1 — create Supabase project  
STEP 2 — install and configure Supabase CLI  
STEP 3 — initialize local Supabase config  
STEP 4 — add environment variables  

## Phase 2 — Database
STEP 5 — create migration for `artists`  
STEP 6 — create migration for `portfolio_images`  
STEP 7 — create migration for `booking_requests`  
STEP 8 — enable RLS and write policies  

## Phase 3 — Auth and Storage
STEP 9 — configure email auth  
STEP 10 — create storage bucket  
STEP 11 — define upload path conventions  

## Phase 4 — Core API
STEP 12 — build artist create/update route  
STEP 13 — build artist public fetch route  
STEP 14 — build discovery list route  
STEP 15 — build booking request route  
STEP 16 — build portfolio metadata route  

## Phase 5 — AI
STEP 17 — build consultation pack route  
STEP 18 — add rate limiting and payload validation  
STEP 19 — test structured output  

## Phase 6 — Hardening
STEP 20 — add error handling cleanup  
STEP 21 — add logging where needed  
STEP 22 — test ownership and RLS thoroughly  

---

# 25. Definition of Done for MVP Backend

The backend is considered MVP-ready when:

- artists can sign up
- artist profiles can be created and updated
- portfolio images can be uploaded and displayed
- discovery can list published artists
- booking requests can be created
- artists can use the AI consultation feature
- RLS prevents unauthorized access
- environment setup is reproducible through migrations

---

# 26. Final Backend Principle

The backend should be designed for clarity, speed, and control.

Do not over-engineer early.  
Do not build future complexity into the MVP unnecessarily.  
But do build on a schema and structure that can grow without chaos.

For Elura, the backend should make one thing true:

**a serious makeup artist can create a professional presence, be discovered, and receive real booking interest with minimal friction.**
