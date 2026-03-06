# Portfolio System

## Purpose

Allow artists to attach visual work samples to their profile with structured metadata.

## API Endpoint

- `POST /api/portfolio`

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

## Future Work

- upload signing flow
- content moderation checks
- image reordering and bulk update endpoints

