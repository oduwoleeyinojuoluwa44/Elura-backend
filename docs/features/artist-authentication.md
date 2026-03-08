# Artist Authentication

## Purpose

Enable makeup artists to create accounts and access protected backend actions.

## MVP Scope

- email/password authentication via Supabase Auth
- one artist profile per authenticated user
- owner-based authorization for profile and portfolio writes

## Backend Touchpoints

- Auth provider: Supabase Auth
- Session transport: Supabase SSR cookies
- Session refresh: `src/proxy.ts`
- Auth routes: `POST /api/auth/sign-up`, `POST /api/auth/sign-in`, `POST /api/auth/sign-out`, `GET /api/auth/me`
- Confirmation route: `GET /auth/confirm`
- Ownership key: `artists.user_id` (unique)
- Protected routes resolve the current user from the Supabase session cookie

## Dashboard Configuration

- set the Supabase Site URL to the frontend origin used for this app
- update the Confirm signup template to:
  `{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email`
- if magic links are enabled, update the Magic link template to:
  `{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=magiclink`

## Future Work

- add optional OAuth providers
- add auth event logging
