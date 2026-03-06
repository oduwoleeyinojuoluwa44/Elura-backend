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
- optional fields must match expected types

## Future Work

- profile completeness scoring
- publish gating checks tied to portfolio presence
- uniqueness and conflict feedback for username claims

