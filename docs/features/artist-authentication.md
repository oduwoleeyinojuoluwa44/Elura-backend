# Artist Authentication

## Purpose

Enable makeup artists to create accounts and access protected backend actions.

## MVP Scope

- email/password authentication via Supabase Auth
- one artist profile per authenticated user
- owner-based authorization for profile and portfolio writes

## Backend Touchpoints

- Auth provider: Supabase Auth
- Ownership key: `artists.user_id` (unique)
- Protected routes expect a user identity header placeholder (`x-user-id`) in scaffold mode

## Future Work

- replace placeholder header auth with real session verification
- add optional OAuth providers
- add auth event logging

