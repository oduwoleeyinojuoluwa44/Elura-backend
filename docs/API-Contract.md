# Elura API Contract

## Purpose

This document is the single source of truth for the backend and frontend agents.

- Backend must implement and preserve this contract.
- Frontend must only consume what is defined here.
- If an endpoint, field, status code, auth rule, or response shape changes, this file must change in the same pull request.

## Contract Status

- Version: `2026-03-12`
- Scope: current repo state on `main`
- Source of truth implementation: `src/app/api/**`, `src/features/**`, `src/shared/**`

## Read This First

### Stability Levels

- `Implemented`: frontend may build against it now.
- `Reserved`: route exists, validation may exist, but success behavior is not complete. Frontend must not depend on successful business behavior yet.

### Environment Rule

- Implemented routes assume the target environment has the latest database migrations applied.

### Transport Rules

- Base local URL: `http://localhost:3000`
- API base prefix: `/api`
- Content type for request bodies: `application/json` unless an endpoint specifies otherwise
- `POST /api/portfolio` uses `multipart/form-data`
- Content type for API responses: `application/json`
- Frontend should use same-origin requests.
- Frontend should include `credentials: "include"` on API requests so SSR auth cookies are carried consistently.

### Canonical Naming Rules

- Request body keys: `camelCase`
- Response keys: `camelCase`
- Query parameters: use exactly the names listed per endpoint
- Compatibility aliases may exist in the backend, but frontend must not rely on them

### Identity Rules

- Protected routes derive identity from the Supabase session cookie only.
- Frontend must never send `userId`, `ownerUserId`, `x-user-id`, or any similar identity header to prove ownership.
- Frontend must use backend API routes for application data and auth state described here.

## Global Response Contract

### Standard API Success Envelope

```json
{
  "success": true,
  "data": {}
}
```

### Standard API Failure Envelope

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Human-readable message",
    "details": {}
  }
}
```

### One Explicit Exception

`GET /api/health` is an operational route and does not use the standard envelope.

Response:

```json
{
  "status": "ok",
  "service": "elura-backend"
}
```

## Global Error Contract

### Error Codes

- `VALIDATION_ERROR`
- `UNAUTHORIZED`
- `FORBIDDEN`
- `CONFLICT`
- `NOT_FOUND`
- `NOT_IMPLEMENTED`
- `INTERNAL_ERROR`

### Status Code Rules

- `200` successful read or update
- `201` successful create
- `400` invalid request shape or invalid field values
- `401` missing or invalid authenticated session
- `403` authenticated but forbidden
- `404` resource not found
- `409` conflict
- `501` feature route exists but business behavior is not implemented
- `500` unexpected server failure

### Frontend Error Handling Rules

- Treat `401` as signed-out or expired-session state.
- Treat `409` as a user-fixable conflict when the message is actionable.
- Treat `501` as a feature-not-ready state, not as a retryable network failure.
- Render `error.message` directly for now unless product copy overrides it.
- Do not parse undocumented `error.details` fields for critical UI logic.

## Auth Contract

### Session Model

- Auth provider: Supabase Auth
- Session transport: SSR cookies
- Session refresh: Next.js proxy layer
- Protected API routes read the current user from the session cookie

### Email Confirmation Flow

- Supabase email links land on `GET /auth/confirm`
- Frontend must not call `/auth/confirm` with `fetch`
- The browser should navigate to `/auth/confirm` from the email link
- On success, backend redirects to the supplied `next` path or `/`
- On failure, backend redirects to `/auth/error?message=...`

### Auth State Rule

`GET /api/auth/me` is the backend truth for whether the current browser session is authenticated.

## Nullability and Normalization Rules

These rules are part of the contract because they affect frontend form behavior.

### General

- Required string fields are trimmed.
- Required string fields reject empty values after trimming.
- Optional string fields may be omitted unless otherwise noted.

### Artist Profile Specific

- `username` is normalized to lowercase on write.
- `username` must match `^[a-z0-9_]+$`
- optional nullable artist text fields may be sent as `null`
- for artist optional nullable fields, sending `""` is treated as clearing the field to `null`
- `specialty` must be an array of strings
- empty specialty entries are removed during parsing

### Booking Specific

- `eventDate` must be `YYYY-MM-DD`
- optional booking strings with `""` are treated as omitted

### Portfolio Specific

- `sortOrder` must be a non-negative integer
- optional `caption` with `""` is treated as omitted

### AI Consultation Specific

- optional `timeConstraint` and `notes` with `""` are treated as omitted

## TypeScript Contract

These are the canonical shapes frontend and backend should share conceptually.

```ts
export type ErrorCode =
  | "VALIDATION_ERROR"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "CONFLICT"
  | "NOT_FOUND"
  | "NOT_IMPLEMENTED"
  | "INTERNAL_ERROR";

export interface ApiSuccess<T> {
  success: true;
  data: T;
  message?: string;
}

export interface ApiFailure {
  success: false;
  error: {
    code: ErrorCode;
    message: string;
    details?: unknown;
  };
}

export type ApiResponse<T> = ApiSuccess<T> | ApiFailure;

export interface AuthUser {
  id: string;
  email: string | null;
  emailConfirmedAt: string | null;
}

export interface AuthResponse {
  user: AuthUser;
  requiresEmailConfirmation: boolean;
}

export interface AuthSignOutResponse {
  success: true;
}

export type ArtistSpecialty = string;

export interface ArtistProfile {
  id: string;
  username: string;
  fullName: string;
  bio: string | null;
  location: string | null;
  specialty: ArtistSpecialty[];
  priceRange: string | null;
  instagramHandle: string | null;
  profileImageUrl: string | null;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ArtistProfileDetail extends ArtistProfile {
  portfolioImages: PortfolioImage[];
}

export interface UpsertArtistProfileRequest {
  fullName: string;
  username: string;
  bio?: string | null;
  location?: string | null;
  specialty?: ArtistSpecialty[];
  priceRange?: string | null;
  instagramHandle?: string | null;
  profileImageUrl?: string | null;
  isPublished?: boolean;
}

export interface DiscoverArtistsQuery {
  location?: string;
  specialty?: string;
  price_range?: string;
}

export interface PortfolioImage {
  id: string;
  artistId: string;
  imageUrl: string;
  storagePath: string;
  caption: string | null;
  sortOrder: number;
  createdAt: string;
}

export interface CreatePortfolioImageRequest {
  artistId: string;
  image: File;
  caption?: string;
  sortOrder?: number;
}

export type BookingRequestStatus = "new" | "viewed" | "accepted" | "declined";

export interface BookingRequest {
  id: string;
  artistId: string;
  clientName: string;
  clientEmail: string | null;
  clientPhone: string | null;
  eventType: string;
  eventDate: string | null;
  message: string;
  status: BookingRequestStatus;
  createdAt: string;
}

export interface CreateBookingRequestRequest {
  artistId: string;
  clientName: string;
  clientEmail?: string;
  clientPhone?: string;
  eventType: string;
  eventDate?: string;
  message: string;
}

export interface ConsultationPackRequest {
  eventType: string;
  skinType: string;
  desiredFinish: string;
  timeConstraint?: string;
  notes?: string;
}

export interface ConsultationPackResponse {
  questionnaire: string[];
  prepMessage: string;
  kitChecklist: string[];
  timeline: string[];
  artistTips: string[];
}

export interface HealthResponse {
  status: "ok";
  service: "elura-backend";
}
```

## Endpoint Matrix

| Route | Method | Stability | Auth | Success Status | Notes |
|---|---|---|---|---|---|
| `/api/health` | `GET` | Implemented | No | `200` | Operational route, not standard envelope |
| `/api/auth/sign-up` | `POST` | Implemented | No | `201` | May require email confirmation |
| `/api/auth/sign-in` | `POST` | Implemented | No | `200` | Sets auth cookie |
| `/api/auth/sign-out` | `POST` | Implemented | Session optional | `200` | Clears auth cookie |
| `/api/auth/me` | `GET` | Implemented | Yes | `200` | Backend truth for auth state |
| `/auth/confirm` | `GET` | Implemented | No | Redirect | Browser navigation route |
| `/api/artists` | `POST` | Implemented | Yes | `200` | Create or update current user profile |
| `/api/artists` | `GET` | Implemented | No | `200` | Public published profiles only |
| `/api/artists/[username]` | `GET` | Implemented | No | `200` | Public published profile with ordered portfolio images |
| `/api/portfolio` | `POST` | Implemented | Yes | `201` | Uploads a portfolio image file for the owned artist |
| `/api/booking-requests` | `POST` | Reserved | No | `501` today | Validation exists, persistence missing |
| `/api/ai/consultation-pack` | `POST` | Reserved | Yes | `501` today | Validation exists, AI generation missing |

## Implemented Endpoints

### `GET /api/health`

Purpose:
- liveness check

Auth required:
- No

Success `200`:

```json
{
  "status": "ok",
  "service": "elura-backend"
}
```

Frontend rules:

- Do not use this route for app state.
- Use it only for environment or uptime checks.

### `POST /api/auth/sign-up`

Purpose:
- create an auth account with email and password

Auth required:
- No

Request body:

```json
{
  "email": "artist@example.com",
  "password": "strongpassword"
}
```

Validation:

- `email` required
- `email` must be valid
- `password` required
- `password` minimum length is `8`

Success `201`:

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "artist@example.com",
      "emailConfirmedAt": null
    },
    "requiresEmailConfirmation": true
  }
}
```

Failure contract:

- `400` invalid payload
- `409` email already registered
- `500` authentication provider temporarily unavailable

Frontend rules:

- If `requiresEmailConfirmation` is `true`, show confirmation-required UI.
- Do not assume the user can access protected routes until the session is confirmed or a sign-in succeeds.
- Treat `500` as a transient backend/auth-provider failure, not a form-validation failure.

### `POST /api/auth/sign-in`

Purpose:
- sign in with email and password

Auth required:
- No

Request body:

```json
{
  "email": "artist@example.com",
  "password": "strongpassword"
}
```

Success `200`:

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "artist@example.com",
      "emailConfirmedAt": "2026-03-08T10:00:00.000Z"
    },
    "requiresEmailConfirmation": false
  }
}
```

Failure contract:

- `400` invalid payload
- `401` invalid email or password
- `500` authentication provider temporarily unavailable

Frontend rules:

- After success, treat the session cookie as established.
- Use `GET /api/auth/me` for subsequent auth revalidation.
- Treat `500` as a transient backend/auth-provider failure, not as invalid credentials.

### `POST /api/auth/sign-out`

Purpose:
- clear the current session

Auth required:
- Session may or may not exist

Request body:
- none

Success `200`:

```json
{
  "success": true,
  "data": {
    "success": true
  }
}
```

Frontend rules:

- Always clear local auth UI state after a `200`.

### `GET /api/auth/me`

Purpose:
- return the authenticated user for the current session

Auth required:
- Yes

Request body:
- none

Success `200`:

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "artist@example.com",
    "emailConfirmedAt": "2026-03-08T10:00:00.000Z"
  }
}
```

Failure contract:

- `401` when no valid session exists
- `500` authentication provider temporarily unavailable

Frontend rules:

- Treat `401` as the signed-out state.
- Treat `500` as an auth infrastructure failure and allow retry.
- This route is the backend truth for auth status.

### `GET /auth/confirm`

Purpose:
- exchange Supabase `token_hash` for a browser session and redirect

Auth required:
- No

Query parameters:

- `token_hash` required
- `type` required
- `next` optional and must start with `/`

Behavior:

- success redirects to `next` or `/`
- failure redirects to `/auth/error?message=...`

Frontend rules:

- The frontend should not call this with `fetch`.
- The frontend should allow browser navigation to this route.

### `POST /api/artists`

Purpose:
- create or update the profile for the authenticated artist

Auth required:
- Yes

Request body:

```json
{
  "fullName": "Jane Artist",
  "username": "jane_artist",
  "bio": "Soft glam specialist",
  "location": "Lagos",
  "specialty": ["bridal", "editorial"],
  "priceRange": "50000-100000",
  "instagramHandle": "@janeartist",
  "profileImageUrl": "https://example.com/profile.jpg",
  "isPublished": false
}
```

Required request fields:

- `fullName`
- `username`

Optional request fields:

- `bio`
- `location`
- `specialty`
- `priceRange`
- `instagramHandle`
- `profileImageUrl`
- `isPublished`

Normalization:

- `fullName` is trimmed
- `username` is trimmed and lowercased
- `bio`, `location`, `priceRange`, `instagramHandle`, `profileImageUrl`
  may be cleared by sending `null` or `""`
- `specialty` is trimmed item-by-item and empty items are discarded

Publish rules:

If `isPublished` is `true`, these must exist:

- `fullName`
- `username`
- `location`
- at least one `specialty`
- at least one portfolio image already attached to the artist profile

Success `200`:

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "username": "jane_artist",
    "fullName": "Jane Artist",
    "bio": "Soft glam specialist",
    "location": "Lagos",
    "specialty": ["bridal", "editorial"],
    "priceRange": "50000-100000",
    "instagramHandle": "@janeartist",
    "profileImageUrl": "https://example.com/profile.jpg",
    "isPublished": false,
    "createdAt": "2026-03-08T10:00:00.000Z",
    "updatedAt": "2026-03-08T10:00:00.000Z"
  }
}
```

Failure contract:

- `400` invalid body or failed publish preconditions
- `401` no valid session
- `409` username already in use

Frontend rules:

- Never send `userId`.
- Treat this route as both create and update.
- This is the only current write route for artist profile data.

### `GET /api/artists`

Purpose:
- list public published artist profiles

Auth required:
- No

Supported query parameters:

- `location`
- `specialty`
- `price_range`

Query semantics:

- `location`: exact equality match
- `specialty`: profile specialty array must contain the value
- `price_range`: exact equality match

Sorting:

- ordered by newest `createdAt` first

Success `200`:

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "username": "jane_artist",
      "fullName": "Jane Artist",
      "bio": "Soft glam specialist",
      "location": "Lagos",
      "specialty": ["bridal", "editorial"],
      "priceRange": "50000-100000",
      "instagramHandle": "@janeartist",
      "profileImageUrl": "https://example.com/profile.jpg",
      "isPublished": true,
      "createdAt": "2026-03-08T10:00:00.000Z",
      "updatedAt": "2026-03-08T10:00:00.000Z"
    }
  ]
}
```

Frontend rules:

- Only published profiles are returned.
- Use `price_range` in the URL, not `priceRange`.
- Do not assume pagination exists yet.
- Do not assume text search exists yet.
- Discovery list items do not include `portfolioImages`.
- Use `GET /api/artists/[username]` for the full public gallery payload.

### `GET /api/artists/[username]`

Purpose:
- fetch one public published artist profile by username
- include ordered portfolio images for the public profile page

Auth required:
- No

Route parameter:

- `username`

Success `200`:

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "username": "jane_artist",
    "fullName": "Jane Artist",
    "bio": "Soft glam specialist",
    "location": "Lagos",
    "specialty": ["bridal", "editorial"],
    "priceRange": "50000-100000",
    "instagramHandle": "@janeartist",
    "profileImageUrl": "https://example.com/profile.jpg",
    "isPublished": true,
    "createdAt": "2026-03-08T10:00:00.000Z",
    "updatedAt": "2026-03-08T10:00:00.000Z",
    "portfolioImages": [
      {
        "id": "uuid",
        "artistId": "artist-uuid",
        "imageUrl": "https://example.com/look.jpg",
        "storagePath": "artist-uuid/look-1.jpg",
        "caption": "Editorial bridal look",
        "sortOrder": 0,
        "createdAt": "2026-03-08T10:00:00.000Z"
      }
    ]
  }
}
```

Failure contract:

- `404` artist not found or not published

Frontend rules:

- This is a public route.
- Unpublished profiles are intentionally not visible here.

## Remaining Reserved Endpoints

These routes exist and are valid to document, but they are not complete product contracts yet. Frontend may define types from them, but should not build release-critical success flows against them until the backend feature is completed.

### `POST /api/portfolio`

Stability:
- Implemented

Auth required:
- Yes

Request content type:

- `multipart/form-data`

Canonical form fields:

- `artistId` required string
- `image` required file
- `caption` optional string
- `sortOrder` optional non-negative integer string

Request validation:

- `artistId` required
- `image` required
- `image` must be a valid JPEG, PNG, GIF, or WebP file
- `image` must be `10 MB` or smaller
- `caption` optional string
- `sortOrder` optional non-negative integer
- `artistId` must belong to the authenticated user
- `storagePath` is generated by the backend after upload

Compatibility note:

- backend still accepts the older JSON metadata body for legacy integrations
- frontend must use the multipart upload contract documented here

Success `201`:

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "artistId": "artist-uuid",
    "imageUrl": "https://example.com/look.jpg",
    "storagePath": "artist-uuid/look-1.jpg",
    "caption": "Editorial bridal look",
    "sortOrder": 0,
    "createdAt": "2026-03-08T10:00:00.000Z"
  }
}
```

Failure contract:

- `400` invalid request payload
- `401` no valid session
- `403` `artistId` does not belong to the authenticated user
- `404` artist profile not found

Frontend rules:

- Create the artist profile before calling this route.
- Use the current artist profile `id` as `artistId`.
- Send a `FormData` body with `artistId`, `image`, and optional `caption` and `sortOrder`.
- Do not manually set the `Content-Type` header when sending `FormData`.
- After a successful create, refresh the public profile data from `GET /api/artists/[username]` if the UI needs the full ordered gallery.
- Publishing should happen only after at least one successful portfolio image create.

### `POST /api/booking-requests`

Stability:
- Reserved

Auth required:
- No

Current request body:

```json
{
  "artistId": "artist-uuid",
  "clientName": "Client Name",
  "clientEmail": "client@example.com",
  "clientPhone": "+2348000000000",
  "eventType": "Wedding",
  "eventDate": "2026-04-10",
  "message": "Need soft glam for a wedding."
}
```

Current request validation:

- `artistId` required
- `clientName` required
- `eventType` required
- `message` required
- `clientEmail` optional string
- `clientPhone` optional string
- `eventDate` optional `YYYY-MM-DD`

Current backend behavior:

- invalid request -> `400`
- valid request -> `501 NOT_IMPLEMENTED`

Frontend rule:

- Build only against the request type for now, not against a successful create flow.

### `POST /api/ai/consultation-pack`

Stability:
- Reserved

Auth required:
- Yes

Current request body:

```json
{
  "eventType": "Wedding",
  "skinType": "Combination",
  "desiredFinish": "Soft glam",
  "timeConstraint": "Ready by 8 AM",
  "notes": "Outdoor ceremony"
}
```

Current request validation:

- `eventType` required
- `skinType` required
- `desiredFinish` required
- `timeConstraint` optional string
- `notes` optional string

Current backend behavior:

- invalid request -> `400`
- unauthenticated request -> `401`
- valid request -> `501 NOT_IMPLEMENTED`

Frontend rule:

- Do not design product-critical workflows assuming this returns generated content yet.

## Canonical Entity Shapes

### AuthUser

```json
{
  "id": "uuid",
  "email": "artist@example.com",
  "emailConfirmedAt": "2026-03-08T10:00:00.000Z"
}
```

### AuthResponse

```json
{
  "user": {
    "id": "uuid",
    "email": "artist@example.com",
    "emailConfirmedAt": null
  },
  "requiresEmailConfirmation": true
}
```

### ArtistProfile

```json
{
  "id": "uuid",
  "username": "jane_artist",
  "fullName": "Jane Artist",
  "bio": "Soft glam specialist",
  "location": "Lagos",
  "specialty": ["bridal", "editorial"],
  "priceRange": "50000-100000",
  "instagramHandle": "@janeartist",
  "profileImageUrl": "https://example.com/profile.jpg",
  "isPublished": true,
  "createdAt": "2026-03-08T10:00:00.000Z",
  "updatedAt": "2026-03-08T10:00:00.000Z"
}
```

### ArtistProfileDetail

```json
{
  "id": "uuid",
  "username": "jane_artist",
  "fullName": "Jane Artist",
  "bio": "Soft glam specialist",
  "location": "Lagos",
  "specialty": ["bridal", "editorial"],
  "priceRange": "50000-100000",
  "instagramHandle": "@janeartist",
  "profileImageUrl": "https://example.com/profile.jpg",
  "isPublished": true,
  "createdAt": "2026-03-08T10:00:00.000Z",
  "updatedAt": "2026-03-08T10:00:00.000Z",
  "portfolioImages": [
    {
      "id": "uuid",
      "artistId": "artist-uuid",
      "imageUrl": "https://example.com/look.jpg",
      "storagePath": "artist-uuid/look-1.jpg",
      "caption": "Editorial bridal look",
      "sortOrder": 0,
      "createdAt": "2026-03-08T10:00:00.000Z"
    }
  ]
}
```

### PortfolioImage

```json
{
  "id": "uuid",
  "artistId": "artist-uuid",
  "imageUrl": "https://example.com/look.jpg",
  "storagePath": "artist-uuid/look-1.jpg",
  "caption": "Editorial bridal look",
  "sortOrder": 0,
  "createdAt": "2026-03-08T10:00:00.000Z"
}
```

### BookingRequest

```json
{
  "id": "uuid",
  "artistId": "artist-uuid",
  "clientName": "Client Name",
  "clientEmail": "client@example.com",
  "clientPhone": "+2348000000000",
  "eventType": "Wedding",
  "eventDate": "2026-04-10",
  "message": "Need soft glam for a wedding.",
  "status": "new",
  "createdAt": "2026-03-08T10:00:00.000Z"
}
```

### ConsultationPackResponse

```json
{
  "questionnaire": ["Question 1"],
  "prepMessage": "Prep instructions",
  "kitChecklist": ["Item 1"],
  "timeline": ["Step 1"],
  "artistTips": ["Tip 1"]
}
```

## Frontend Fetch Rules

### Fetch Wrapper Expectations

Frontend should centralize API calls and:

- always parse JSON when response content is JSON
- branch on `success`
- handle `401`, `409`, `501` explicitly
- send `credentials: "include"`

Example:

```ts
async function apiRequest<T>(input: RequestInfo, init?: RequestInit): Promise<ApiResponse<T>> {
  const headers = new Headers(init?.headers ?? {});
  if (!(init?.body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(input, {
    credentials: "include",
    headers,
    ...init
  });

  return (await response.json()) as ApiResponse<T>;
}
```

### UI State Rules

- Authenticated layout state should come from `GET /api/auth/me`.
- Public discovery pages should use `GET /api/artists`.
- Public artist profile pages should use `GET /api/artists/[username]`.
- Profile edit screens should post to `POST /api/artists`.
- Remaining reserved endpoints should be hidden, flagged, or treated as unavailable until implemented.

### Separate Frontend Repo Local Development

If the frontend runs in a separate Next.js repo and separate local dev server, it must target the backend origin explicitly.

Required local frontend env:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:BACKEND_PORT
```

Rules:

- `NEXT_PUBLIC_API_BASE_URL` must always point to the backend origin actually running for the current local session.
- Do not proxy backend auth routes to the frontend origin.
- If the frontend uses a proxy or rewrite for `/api/*`, the destination must be the backend origin, not the frontend origin.
- A frontend running on `http://localhost:3000` with backend on `http://localhost:3001` must target `http://localhost:3001`.
- A frontend running on `http://localhost:3001` with backend on `http://localhost:3000` must target `http://localhost:3000`.
- The frontend must never proxy `/api/auth/sign-in` back to its own origin.
- Relative `/api/*` calls from the frontend hit the frontend app unless an explicit proxy or rewrite is configured.
- Browser requests that need session cookies must use `credentials: "include"`.

Examples:

- frontend `http://localhost:3000`, backend `http://localhost:3001`

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001
```

- frontend `http://localhost:3001`, backend `http://localhost:3000`

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000
```

### Recommended Frontend Happy Path

Use this order for the current onboarding and portfolio flow:

1. `POST /api/auth/sign-in`
2. `GET /api/auth/me`
3. `POST /api/artists` with `isPublished: false`
4. read `data.id` from the profile response and treat it as the canonical `artistId`
5. `POST /api/portfolio` one or more times using that `artistId`
6. `POST /api/artists` again with `isPublished: true`
7. `GET /api/artists/[username]` for the public preview payload
8. `GET /api/artists` for discovery verification if needed

Important:

- `artistId` is the artist profile id, not the auth user id.
- Trying to publish before step 5 should fail with `400`.
- The discovery list is summary-only.
- The public detail route is the gallery route.

## Backend Responsibilities

- preserve every implemented route shape documented here
- preserve documented status codes
- preserve session-based identity rules
- do not reintroduce caller-supplied identity headers
- mark incomplete routes as reserved here until they are complete
- update this file before merging any breaking API change

## Frontend Responsibilities

- consume only documented routes, fields, and status codes
- send `camelCase` request bodies
- use exact documented query parameter names
- handle the standard failure envelope uniformly
- treat `401` as unauthenticated state
- treat `501` as feature-not-ready state
- avoid UI logic based on undocumented fields or undocumented success behavior

## Change Control Rule

If either agent changes any of the following, this file must change in the same commit:

- route path
- route method
- request field
- response field
- entity field shape
- auth rule
- status code behavior
- stability level of a route
