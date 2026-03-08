import { getAuthenticatedUser } from "../../../../features/auth";
import type { AuthUser } from "../../../../features/auth/auth.types";
import type { ApiFailure, ApiSuccess } from "../../../../shared/api-response.types";
import { httpStatusForError, toApiFailure, type AppError } from "../../../../shared/errors";
import type { Result } from "../../../../shared/result.types";

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

export async function GET(): Promise<Response> {
  const result: Result<AuthUser, AppError> = await getAuthenticatedUser();
  return toHttpResponse(result, 200);
}

