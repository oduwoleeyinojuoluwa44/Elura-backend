import { getPublishedArtistByUsername } from "../../../../features/artists";
import type { ArtistProfile } from "../../../../features/artists/artists.types";
import type { ApiFailure, ApiSuccess } from "../../../../shared/api-response.types";
import { httpStatusForError, toApiFailure, type AppError } from "../../../../shared/errors";
import type { Result } from "../../../../shared/result.types";

interface ArtistRouteContext {
  params: Promise<{
    username: string;
  }>;
}

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

export async function GET(_request: Request, context: ArtistRouteContext): Promise<Response> {
  const params: { username: string } = await context.params;
  const result: Result<ArtistProfile, AppError> = await getPublishedArtistByUsername(
    params.username
  );

  return toHttpResponse(result, 200);
}
