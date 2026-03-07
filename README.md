# Elura Backend

Elura Backend is the MVP backend scaffold for a beauty professional discovery and booking platform.  
It is structured by feature and aligned to the product and backend specifications in:

- `docs/PRD.md`
- `docs/Backend.md`

## Product Overview

Elura helps makeup artists:

- build a professional profile
- showcase portfolio work
- become discoverable by clients
- receive structured booking requests
- use an AI consultation assistant (MVP scaffolded)

## MVP Flow

Artist signup -> profile creation -> portfolio upload -> discovery -> booking request -> AI consultation tool

## Backend Architecture

- Database: PostgreSQL (via Supabase)
- Authentication: Supabase Auth
- Storage: Supabase Storage
- API Layer: Next.js App Router route handlers
- AI Provider: OpenAI API
- Hosting Target: Vercel

This repository currently provides a strict-typed feature scaffold for those capabilities.

## Feature-First Structure

```text
src/
  app/
    api/
      artists/
      portfolio/
      booking-requests/
      ai/consultation-pack/
  features/
    artists/
    portfolio/
    booking-requests/
    consultation-pack/
  lib/
    supabase/
  shared/
```

## API Surface (Scaffolded)

- `POST /api/artists` create/update artist profile
- `GET /api/artists` list published artists with filters
- `GET /api/artists/[username]` fetch one published artist profile
- `POST /api/portfolio` create portfolio image metadata
- `POST /api/booking-requests` create booking request
- `POST /api/ai/consultation-pack` generate AI consultation pack

Routes delegate into feature services and return typed response envelopes.

## Data Model Summary

MVP core entities:

- `artists`
- `portfolio_images`
- `booking_requests`

Detailed schema and RLS model are in `docs/Backend.md`.

## Documentation Map

- Product requirements: `docs/PRD.md`
- Backend architecture: `docs/Backend.md`
- Feature briefs:
  - `docs/features/artist-authentication.md`
  - `docs/features/artist-profile.md`
  - `docs/features/portfolio-system.md`
  - `docs/features/discovery.md`
  - `docs/features/booking-requests.md`
  - `docs/features/ai-consultation-pack.md`

## Environment Variables

Create a local env file from `.env.example` and provide values:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `OPENAI_API_KEY`

## Local Setup

1. Install dependencies:

```bash
npm install
```

2. Create local environment file:

```bash
Copy-Item .env.example .env.local
```

3. Start the dev server:

```bash
npm run dev
```

4. Run baseline checks:

```bash
npm run check
```

5. Implement integrations:

- wire Supabase clients in `src/lib/supabase/*`
- replace repository stubs in `src/features/*/*.repository.ts`
- connect AI provider in `src/features/consultation-pack/consultation-pack.service.ts`

## Development Phases

1. Foundation and environment
2. Database and RLS migrations
3. Auth and storage conventions
4. Core API implementation
5. AI route implementation
6. Hardening and validation

See `docs/Backend.md` for the full order and rationale.

## Definition of Done (MVP Backend)

Backend is MVP-ready when:

- artists can sign up and maintain profiles
- portfolio images are managed and public for published artists
- discovery listing works with filters
- booking requests are accepted and stored
- AI consultation endpoint returns structured output
- RLS blocks unauthorized access
- migrations make setup reproducible
