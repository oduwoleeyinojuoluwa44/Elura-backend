import { createError, type AppError } from "../../shared/errors";
import { err, ok, type Result } from "../../shared/result.types";
import { countPortfolioImagesByArtistId } from "../portfolio/portfolio.service";
import {
  fetchArtistProfileByOwnerUserIdFromStore,
  fetchPublishedArtistByUsernameFromStore,
  fetchPublishedArtistsFromStore,
  upsertArtistProfileInStore
} from "./artists.repository";
import { parseArtistDiscoveryFilters, parseCreateOrUpdateArtistInput } from "./artists.schemas";
import type {
  ArtistDiscoveryFilters,
  ArtistProfile,
  ArtistProfileDetail,
  ArtistProfileRecord,
  CreateOrUpdateArtistInput
} from "./artists.types";

interface PublishCandidate {
  fullName: string;
  username: string;
  location: string | null;
  specialty: string[];
}

function buildPublishCandidate(
  input: CreateOrUpdateArtistInput,
  existingProfile: ArtistProfileRecord | null
): PublishCandidate {
  return {
    fullName: input.fullName,
    username: input.username,
    location: input.location ?? existingProfile?.location ?? null,
    specialty: input.specialty ?? existingProfile?.specialty ?? []
  };
}

function validatePublishCandidate(candidate: PublishCandidate): Result<void, AppError> {
  if (candidate.fullName.trim() === "") {
    return err(createError("VALIDATION_ERROR", "full_name is required before publishing."));
  }

  if (candidate.username.trim() === "") {
    return err(createError("VALIDATION_ERROR", "username is required before publishing."));
  }

  if (candidate.location === null || candidate.location.trim() === "") {
    return err(createError("VALIDATION_ERROR", "location is required before publishing."));
  }

  if (candidate.specialty.length === 0) {
    return err(createError("VALIDATION_ERROR", "At least one specialty is required before publishing."));
  }

  return ok(undefined);
}

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

  if (parsedInput.value.isPublished === true) {
    const existingProfileResult: Result<ArtistProfileRecord | null, AppError> =
      await fetchArtistProfileByOwnerUserIdFromStore(ownerUserId);
    if (!existingProfileResult.ok) {
      return existingProfileResult;
    }

    const publishCandidate: PublishCandidate = buildPublishCandidate(
      parsedInput.value,
      existingProfileResult.value
    );
    const publishValidationResult: Result<void, AppError> = validatePublishCandidate(publishCandidate);
    if (!publishValidationResult.ok) {
      return publishValidationResult;
    }

    if (existingProfileResult.value === null) {
      return err(
        createError("VALIDATION_ERROR", "Add at least one portfolio image before publishing.")
      );
    }

    const portfolioImageCountResult: Result<number, AppError> = await countPortfolioImagesByArtistId(
      existingProfileResult.value.id
    );
    if (!portfolioImageCountResult.ok) {
      return portfolioImageCountResult;
    }

    if (portfolioImageCountResult.value === 0) {
      return err(
        createError("VALIDATION_ERROR", "Add at least one portfolio image before publishing.")
      );
    }
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
): Promise<Result<ArtistProfileDetail, AppError>> {
  const normalizedUsername: string = username.trim().toLowerCase();
  if (normalizedUsername === "") {
    return err(createError("VALIDATION_ERROR", "username is required."));
  }

  return fetchPublishedArtistByUsernameFromStore(normalizedUsername);
}
