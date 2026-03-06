import { createError, type AppError } from "../../shared/errors";
import { err, ok, type Result } from "../../shared/result.types";
import type { ConsultationPackRequest } from "./consultation-pack.types";

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

export function parseConsultationPackRequest(
  payload: unknown
): Result<ConsultationPackRequest, AppError> {
  if (!isRecord(payload)) {
    return err(createError("VALIDATION_ERROR", "Payload must be a JSON object."));
  }

  const eventTypeResult: Result<string, AppError> = parseRequiredString(
    payload["eventType"] ?? payload["event_type"],
    "eventType"
  );
  if (!eventTypeResult.ok) {
    return eventTypeResult;
  }

  const skinTypeResult: Result<string, AppError> = parseRequiredString(
    payload["skinType"] ?? payload["skin_type"],
    "skinType"
  );
  if (!skinTypeResult.ok) {
    return skinTypeResult;
  }

  const desiredFinishResult: Result<string, AppError> = parseRequiredString(
    payload["desiredFinish"] ?? payload["desired_finish"],
    "desiredFinish"
  );
  if (!desiredFinishResult.ok) {
    return desiredFinishResult;
  }

  const timeConstraintResult: Result<string | undefined, AppError> = parseOptionalString(
    payload["timeConstraint"] ?? payload["time_constraint"],
    "timeConstraint"
  );
  if (!timeConstraintResult.ok) {
    return timeConstraintResult;
  }

  const notesResult: Result<string | undefined, AppError> = parseOptionalString(
    payload["notes"],
    "notes"
  );
  if (!notesResult.ok) {
    return notesResult;
  }

  const input: ConsultationPackRequest = {
    eventType: eventTypeResult.value,
    skinType: skinTypeResult.value,
    desiredFinish: desiredFinishResult.value
  };

  if (timeConstraintResult.value !== undefined) {
    input.timeConstraint = timeConstraintResult.value;
  }
  if (notesResult.value !== undefined) {
    input.notes = notesResult.value;
  }

  return ok(input);
}

