import { createError, type AppError } from "../../shared/errors";
import { err, ok, type Result } from "../../shared/result.types";
import type { AuthCredentialsInput, VerifyOtpInput } from "./auth.types";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function parseRequiredString(value: unknown, fieldName: string): Result<string, AppError> {
  if (typeof value !== "string" || value.trim() === "") {
    return err(createError("VALIDATION_ERROR", `${fieldName} is required.`));
  }

  return ok(value.trim());
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function parseAuthCredentialsInput(
  payload: unknown
): Result<AuthCredentialsInput, AppError> {
  if (!isRecord(payload)) {
    return err(createError("VALIDATION_ERROR", "Payload must be a JSON object."));
  }

  const emailResult: Result<string, AppError> = parseRequiredString(payload["email"], "email");
  if (!emailResult.ok) {
    return emailResult;
  }

  const normalizedEmail: string = emailResult.value.toLowerCase();
  if (!isValidEmail(normalizedEmail)) {
    return err(createError("VALIDATION_ERROR", "email must be a valid email address."));
  }

  const passwordResult: Result<string, AppError> = parseRequiredString(payload["password"], "password");
  if (!passwordResult.ok) {
    return passwordResult;
  }

  if (passwordResult.value.length < 8) {
    return err(createError("VALIDATION_ERROR", "password must be at least 8 characters."));
  }

  return ok({
    email: normalizedEmail,
    password: passwordResult.value
  });
}

export function parseVerifyOtpInput(searchParams: URLSearchParams): Result<VerifyOtpInput, AppError> {
  const tokenHash: string | null = searchParams.get("token_hash");
  if (tokenHash === null || tokenHash.trim() === "") {
    return err(createError("VALIDATION_ERROR", "token_hash is required."));
  }

  const type: string | null = searchParams.get("type");
  const allowedTypes: VerifyOtpInput["type"][] = [
    "email",
    "signup",
    "magiclink",
    "recovery",
    "invite",
    "email_change"
  ];

  if (type === null || !allowedTypes.includes(type as VerifyOtpInput["type"])) {
    return err(createError("VALIDATION_ERROR", "type is invalid."));
  }

  return ok({
    tokenHash: tokenHash,
    type: type as VerifyOtpInput["type"]
  });
}

