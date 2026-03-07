import { getPublishedArtists, upsertArtistProfile } from "../../../features/artists";
import type { ArtistProfile } from "../../../features/artists/artists.types";
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

export async function GET(request: Request): Promise<Response> {
  const searchParams: URLSearchParams = new URL(request.url).searchParams;
  const result: Result<ArtistProfile[], AppError> = await getPublishedArtists(searchParams);

  return toHttpResponse(result, 200);
}

export async function POST(request: Request): Promise<Response> {
  const ownerUserId: string | null = request.headers.get("x-user-id");
  if (ownerUserId === null || ownerUserId.trim() === "") {
    return toHttpResponse(err(createError("UNAUTHORIZED", "Missing x-user-id header.")), 200);
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return toHttpResponse(err(createError("VALIDATION_ERROR", "Request body must be valid JSON.")), 200);
  }

  const result: Result<ArtistProfile, AppError> = await upsertArtistProfile(payload, ownerUserId);
  return toHttpResponse(result, 200);
}
