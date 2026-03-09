# Artist Profile

## Purpose

Provide each artist with a structured professional profile that powers public discovery.

## API Endpoints

- `POST /api/artists`
- `GET /api/artists/[username]`

## Core Fields

- `full_name`
- `username`
- `bio`
- `location`
- `specialty`
- `price_range`
- `instagram_handle`
- `profile_image_url`
- `is_published`

## Validation Rules (MVP)

- `username` required and normalized to lowercase
- `username` allows lowercase letters, digits, and underscores
- `full_name` required
- `location` and at least one `specialty` are required before a profile can be published
- optional fields must match expected types

## Current Implementation Notes

- `POST /api/artists` persists to Supabase `artists`
- `GET /api/artists` returns published profiles and supports filter combinations
- `GET /api/artists/[username]` returns one published profile with ordered `portfolioImages`
- owner identity is resolved from the authenticated Supabase session cookie
- publishing now requires at least one portfolio image in addition to profile completeness

## Future Work

- uniqueness and conflict feedback for username claims
