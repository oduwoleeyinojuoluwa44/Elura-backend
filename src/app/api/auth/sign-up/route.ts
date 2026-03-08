import { signUpWithEmailPassword } from "../../../../features/auth";
import type { AuthResponse } from "../../../../features/auth/auth.types";
import type { ApiFailure, ApiSuccess } from "../../../../shared/api-response.types";
import { createError, httpStatusForError, toApiFailure, type AppError } from "../../../../shared/errors";
import { err, type Result } from "../../../../shared/result.types";

function toHttpResponse<T>(result: Result<T, AppError>, successStatus: number): Response {
  if (result.ok) {
    const payload: ApiSuccess<T> = {
      success: true,
      data: result.value
    };

    return Response.json(payload, { status: successStatus });
  }

  const failure: ApiFailure = toApiFailure(result.error);
  return Response.json(failure, { status: httpStatusForError(result.error.code) });
}

export async function POST(request: Request): Promise<Response> {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return toHttpResponse(
      err(createError("VALIDATION_ERROR", "Request body must be valid JSON.")),
      200
    );
  }

  const requestUrl = new URL(request.url);
  const emailRedirectTo: string = `${requestUrl.origin}/auth/confirm`;
  const result: Result<AuthResponse, AppError> = await signUpWithEmailPassword(payload, emailRedirectTo);

  return toHttpResponse(result, 201);
}
