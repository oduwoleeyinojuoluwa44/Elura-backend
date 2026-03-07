import type { ApiFailure } from "./api-response.types";

export type ErrorCode =
  | "VALIDATION_ERROR"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "CONFLICT"
  | "NOT_FOUND"
  | "NOT_IMPLEMENTED"
  | "INTERNAL_ERROR";

export interface AppError {
  code: ErrorCode;
  message: string;
  details?: unknown;
}

export function createError(
  code: ErrorCode,
  message: string,
  details?: unknown
): AppError {
  return { code, message, details };
}

export function notImplemented(message: string): AppError {
  return createError("NOT_IMPLEMENTED", message);
}

export function httpStatusForError(code: ErrorCode): number {
  switch (code) {
    case "VALIDATION_ERROR":
      return 400;
    case "UNAUTHORIZED":
      return 401;
    case "FORBIDDEN":
      return 403;
    case "CONFLICT":
      return 409;
    case "NOT_FOUND":
      return 404;
    case "NOT_IMPLEMENTED":
      return 501;
    case "INTERNAL_ERROR":
      return 500;
    default:
      return 500;
  }
}

export function toApiFailure(error: AppError): ApiFailure {
  const failure: ApiFailure = {
    success: false,
    error: {
      code: error.code,
      message: error.message
    }
  };

  if (error.details !== undefined) {
    failure.error.details = error.details;
  }

  return failure;
}
