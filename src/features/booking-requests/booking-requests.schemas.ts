import { createError, type AppError } from "../../shared/errors";
import { err, ok, type Result } from "../../shared/result.types";
import type { CreateBookingRequestInput } from "./booking-requests.types";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function parseRequiredString(value: unknown, fieldName: string): Result<string, AppError> {
  if (typeof value !== "string" || value.trim() === "") {
    return err(createError("VALIDATION_ERROR", `${fieldName} is required.`));
  }

  return ok(value.trim());
}

function parseOptionalString(value: unknown, fieldName: string): Result<string | undefined, AppError> {
  if (value === undefined || value === null) {
    return ok(undefined);
  }

  if (typeof value !== "string") {
    return err(createError("VALIDATION_ERROR", `${fieldName} must be a string.`));
  }

  const cleanedValue: string = value.trim();
  return ok(cleanedValue === "" ? undefined : cleanedValue);
}

function parseOptionalDate(value: unknown, fieldName: string): Result<string | undefined, AppError> {
  const dateResult: Result<string | undefined, AppError> = parseOptionalString(value, fieldName);
  if (!dateResult.ok || dateResult.value === undefined) {
    return dateResult;
  }

  const datePattern: RegExp = /^\d{4}-\d{2}-\d{2}$/;
  if (!datePattern.test(dateResult.value)) {
    return err(createError("VALIDATION_ERROR", `${fieldName} must be in YYYY-MM-DD format.`));
  }

  return dateResult;
}

export function parseCreateBookingRequestInput(
  payload: unknown
): Result<CreateBookingRequestInput, AppError> {
  if (!isRecord(payload)) {
    return err(createError("VALIDATION_ERROR", "Payload must be a JSON object."));
  }

  const artistIdResult: Result<string, AppError> = parseRequiredString(
    payload["artist_id"] ?? payload["artistId"],
    "artist_id"
  );
  if (!artistIdResult.ok) {
    return artistIdResult;
  }

  const clientNameResult: Result<string, AppError> = parseRequiredString(
    payload["client_name"] ?? payload["clientName"],
    "client_name"
  );
  if (!clientNameResult.ok) {
    return clientNameResult;
  }

  const clientEmailResult: Result<string | undefined, AppError> = parseOptionalString(
    payload["client_email"] ?? payload["clientEmail"],
    "client_email"
  );
  if (!clientEmailResult.ok) {
    return clientEmailResult;
  }

  const clientPhoneResult: Result<string | undefined, AppError> = parseOptionalString(
    payload["client_phone"] ?? payload["clientPhone"],
    "client_phone"
  );
  if (!clientPhoneResult.ok) {
    return clientPhoneResult;
  }

  const eventTypeResult: Result<string, AppError> = parseRequiredString(
    payload["event_type"] ?? payload["eventType"],
    "event_type"
  );
  if (!eventTypeResult.ok) {
    return eventTypeResult;
  }

  const eventDateResult: Result<string | undefined, AppError> = parseOptionalDate(
    payload["event_date"] ?? payload["eventDate"],
    "event_date"
  );
  if (!eventDateResult.ok) {
    return eventDateResult;
  }

  const messageResult: Result<string, AppError> = parseRequiredString(payload["message"], "message");
  if (!messageResult.ok) {
    return messageResult;
  }

  const input: CreateBookingRequestInput = {
    artistId: artistIdResult.value,
    clientName: clientNameResult.value,
    eventType: eventTypeResult.value,
    message: messageResult.value
  };

  if (clientEmailResult.value !== undefined) {
    input.clientEmail = clientEmailResult.value;
  }
  if (clientPhoneResult.value !== undefined) {
    input.clientPhone = clientPhoneResult.value;
  }
  if (eventDateResult.value !== undefined) {
    input.eventDate = eventDateResult.value;
  }

  return ok(input);
}

