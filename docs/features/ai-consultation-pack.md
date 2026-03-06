# AI Consultation Pack

## Purpose

Generate structured prep guidance for artists before appointments.

## API Endpoint

- `POST /api/ai/consultation-pack`

## Input Shape

- `eventType`
- `skinType`
- `desiredFinish`
- `timeConstraint` (optional)
- `notes` (optional)

## Output Shape

- `questionnaire` (string array)
- `prepMessage` (string)
- `kitChecklist` (string array)
- `timeline` (string array)
- `artistTips` (string array)

## Current Scaffold Status

- payload validation exists
- route and service contract exist
- generation currently returns typed `NOT_IMPLEMENTED`

## Future Work

- connect OpenAI provider
- enforce structured output parser
- add rate limiting and usage monitoring

