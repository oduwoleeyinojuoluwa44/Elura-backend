import { getAuthenticatedUser } from "../../../features/auth";
import { createPortfolioImage, uploadPortfolioImage } from "../../../features/portfolio";
import type { PortfolioImage } from "../../../features/portfolio/portfolio.types";
import type { ApiFailure, ApiSuccess } from "../../../shared/api-response.types";
import { createError, httpStatusForError, toApiFailure, type AppError } from "../../../shared/errors";
import { err, type Result } from "../../../shared/result.types";

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
  const authenticatedUserResult = await getAuthenticatedUser();
  if (!authenticatedUserResult.ok) {
    return toHttpResponse(authenticatedUserResult, 200);
  }

  const contentType = request.headers.get("content-type") ?? "";

  if (contentType.includes("multipart/form-data")) {
    let formData: FormData;
    try {
      formData = await request.formData();
    } catch {
      return toHttpResponse(
        err(createError("VALIDATION_ERROR", "Request body must be valid multipart form data.")),
        200
      );
    }

    const result: Result<PortfolioImage, AppError> = await uploadPortfolioImage(
      formData,
      authenticatedUserResult.value.id
    );
    return toHttpResponse(result, 201);
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return toHttpResponse(
      err(
        createError(
          "VALIDATION_ERROR",
          "Request body must be valid multipart form data or JSON."
        )
      ),
      200
    );
  }

  const result: Result<PortfolioImage, AppError> = await createPortfolioImage(
    payload,
    authenticatedUserResult.value.id
  );
  return toHttpResponse(result, 201);
}
