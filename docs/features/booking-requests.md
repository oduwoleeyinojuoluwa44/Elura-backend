# Booking Requests

## Purpose

Capture structured client booking inquiries and attach them to specific artists.

## API Endpoint

- `POST /api/booking-requests`

## Core Fields

- `artist_id`
- `client_name`
- `client_email` (optional)
- `client_phone` (optional)
- `event_type`
- `event_date` (optional, `YYYY-MM-DD`)
- `message`

## Validation Rules (MVP)

- required fields must be non-empty strings
- optional event date must match `YYYY-MM-DD`

## Future Work

- artist-side retrieval endpoints
- status transitions (`new`, `viewed`, `accepted`, `declined`)
- anti-spam and rate-limit controls

