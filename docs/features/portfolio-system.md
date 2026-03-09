# Portfolio System

## Purpose

Allow artists to attach visual work samples to their profile with structured metadata.

## API Endpoint

- `POST /api/portfolio`
- `GET /api/artists/[username]` includes ordered portfolio images for public profile pages

## Core Fields

- `artist_id`
- `image_url`
- `storage_path`
- `caption` (optional)
- `sort_order` (optional)

## Validation Rules (MVP)

- required IDs and URLs must be non-empty strings
- `sort_order` must be a non-negative integer
- owner identity is required for writes
- `storage_path` must point to the authenticated artist's directory

## Current Implementation Notes

- `POST /api/portfolio` now persists image metadata to `portfolio_images`
- portfolio writes require a valid authenticated session
- the supplied `artistId` must belong to the authenticated user
- public artist profile responses include `portfolioImages` ordered by `sortOrder`, then `createdAt`
- publishing an artist profile now requires at least one portfolio image

## Future Work

- upload signing flow
- content moderation checks
- image reordering and bulk update endpoints
