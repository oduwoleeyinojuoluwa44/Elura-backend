import { createBookingRequest } from "../../../features/booking-requests";
import type { BookingRequest } from "../../../features/booking-requests/booking-requests.types";
import type { ApiFailure, ApiSuccess } from "../../../shared/api-response.types";
import { httpStatusForError, toApiFailure, type AppError } from "../../../shared/errors";
import type { Result } from "../../../shared/result.types";

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
  } catch (_error: unknown) {
    const invalidJsonResponse: ApiFailure = {
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "Request body must be valid JSON."
      }
    };
    return Response.json(invalidJsonResponse, { status: 400 });
  }

  const result: Result<BookingRequest, AppError> = await createBookingRequest(payload);
  return toHttpResponse(result, 201);
}

