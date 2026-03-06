# Discovery

## Purpose

Return published artist profiles to clients with simple filtering for browsing.

## API Endpoints

- `GET /api/artists`
- `GET /api/artists/[username]`

## Supported Filters (MVP Scaffold)

- `location`
- `specialty`
- `price_range`

## Discovery Rule

Only published profiles should appear in public discovery results.

## Future Work

- pagination and sorting
- geo-aware ranking
- caching for high-traffic locations

