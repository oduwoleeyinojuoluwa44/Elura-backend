# Portfolio System

## Purpose

Allow artists to upload visual work samples to their profile and persist the resulting metadata.

## API Endpoint

- `POST /api/portfolio`
- `GET /api/artists/[username]` includes ordered portfolio images for public profile pages

## Core Fields

- `artist_id`
- `image` (multipart file upload)
- `caption` (optional)
- `sort_order` (optional)

## Validation Rules (MVP)

- required IDs must be non-empty strings
- `image` must be a JPEG, PNG, GIF, or WebP file
- `image` must be 10 MB or smaller
- `sort_order` must be a non-negative integer
- owner identity is required for writes
- storage path is generated server-side under the authenticated artist's directory

## Current Implementation Notes

- `POST /api/portfolio` accepts multipart form uploads and stores the file in Supabase Storage
- the backend generates `storagePath` and public `imageUrl` after upload
- `POST /api/portfolio` still accepts the older JSON metadata body for compatibility, but frontend should use multipart upload
- uploaded image metadata is persisted to `portfolio_images`
- portfolio writes require a valid authenticated session
- the supplied `artistId` must belong to the authenticated user
- public artist profile responses include `portfolioImages` ordered by `sortOrder`, then `createdAt`
- publishing an artist profile now requires at least one portfolio image

## Future Work

- direct signed upload flow for larger files
- content moderation checks
- image reordering and bulk update endpoints
