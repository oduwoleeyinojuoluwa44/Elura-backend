import { createError, type AppError } from "../../shared/errors";
import { err, type Result } from "../../shared/result.types";
import {
  fetchPublishedArtistByUsernameFromStore,
  fetchPublishedArtistsFromStore,
  upsertArtistProfileInStore
} from "./artists.repository";
import { parseArtistDiscoveryFilters, parseCreateOrUpdateArtistInput } from "./artists.schemas";
import type { ArtistDiscoveryFilters, ArtistProfile, CreateOrUpdateArtistInput } from "./artists.types";

export async function upsertArtistProfile(
  payload: unknown,
  ownerUserId: string
): Promise<Result<ArtistProfile, AppError>> {
  if (ownerUserId.trim() === "") {
    return err(createError("UNAUTHORIZED", "Authenticated user is required."));
  }

  const parsedInput: Result<CreateOrUpdateArtistInput, AppError> = parseCreateOrUpdateArtistInput(payload);
  if (!parsedInput.ok) {
    return parsedInput;
  }

  return upsertArtistProfileInStore(ownerUserId, parsedInput.value);
}

export async function getPublishedArtists(
  searchParams: URLSearchParams
): Promise<Result<ArtistProfile[], AppError>> {
  const parsedFilters: Result<ArtistDiscoveryFilters, AppError> = parseArtistDiscoveryFilters(searchParams);
  if (!parsedFilters.ok) {
    return parsedFilters;
  }

  return fetchPublishedArtistsFromStore(parsedFilters.value);
}

export async function getPublishedArtistByUsername(
  username: string
): Promise<Result<ArtistProfile, AppError>> {
  const normalizedUsername: string = username.trim().toLowerCase();
  if (normalizedUsername === "") {
    return err(createError("VALIDATION_ERROR", "username is required."));
  }

  return fetchPublishedArtistByUsernameFromStore(normalizedUsername);
}
