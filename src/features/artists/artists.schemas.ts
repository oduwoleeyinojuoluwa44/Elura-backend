import { createError, type AppError } from "../../shared/errors";
import { err, ok, type Result } from "../../shared/result.types";
import type { ArtistDiscoveryFilters, ArtistSpecialty, CreateOrUpdateArtistInput } from "./artists.types";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function parseRequiredString(value: unknown, fieldName: string): Result<string, AppError> {
  if (typeof value !== "string" || value.trim() === "") {
    return err(createError("VALIDATION_ERROR", `${fieldName} is required.`));
  }

  return ok(value.trim());
}

function parseOptionalString(value: unknown, fieldName: string): Result<string | undefined, AppError> {
  if (value === undefined || value === null) {
    return ok(undefined);
  }

  if (typeof value !== "string") {
    return err(createError("VALIDATION_ERROR", `${fieldName} must be a string.`));
  }

  const trimmed: string = value.trim();
  return ok(trimmed === "" ? undefined : trimmed);
}

function parseOptionalStringArray(
  value: unknown,
  fieldName: string
): Result<ArtistSpecialty[] | undefined, AppError> {
  if (value === undefined || value === null) {
    return ok(undefined);
  }

  if (!Array.isArray(value)) {
    return err(createError("VALIDATION_ERROR", `${fieldName} must be an array of strings.`));
  }

  const cleanedValues: ArtistSpecialty[] = [];
  for (const entry of value) {
    if (typeof entry !== "string") {
      return err(createError("VALIDATION_ERROR", `${fieldName} must contain only strings.`));
    }

    const trimmedEntry: string = entry.trim();
    if (trimmedEntry !== "") {
      cleanedValues.push(trimmedEntry);
    }
  }

  return ok(cleanedValues);
}

function parseOptionalBoolean(value: unknown, fieldName: string): Result<boolean | undefined, AppError> {
  if (value === undefined || value === null) {
    return ok(undefined);
  }

  if (typeof value !== "boolean") {
    return err(createError("VALIDATION_ERROR", `${fieldName} must be a boolean.`));
  }

  return ok(value);
}

export function parseCreateOrUpdateArtistInput(
  payload: unknown
): Result<CreateOrUpdateArtistInput, AppError> {
  if (!isRecord(payload)) {
    return err(createError("VALIDATION_ERROR", "Payload must be a JSON object."));
  }

  const fullNameResult: Result<string, AppError> = parseRequiredString(
    payload["full_name"] ?? payload["fullName"],
    "full_name"
  );
  if (!fullNameResult.ok) {
    return fullNameResult;
  }

  const usernameResult: Result<string, AppError> = parseRequiredString(payload["username"], "username");
  if (!usernameResult.ok) {
    return usernameResult;
  }

  const normalizedUsername: string = usernameResult.value.toLowerCase();
  if (!/^[a-z0-9_]+$/.test(normalizedUsername)) {
    return err(
      createError(
        "VALIDATION_ERROR",
        "username must contain only lowercase letters, numbers, and underscores."
      )
    );
  }

  const bioResult: Result<string | undefined, AppError> = parseOptionalString(payload["bio"], "bio");
  if (!bioResult.ok) {
    return bioResult;
  }

  const locationResult: Result<string | undefined, AppError> = parseOptionalString(
    payload["location"],
    "location"
  );
  if (!locationResult.ok) {
    return locationResult;
  }

  const specialtyResult: Result<ArtistSpecialty[] | undefined, AppError> = parseOptionalStringArray(
    payload["specialty"],
    "specialty"
  );
  if (!specialtyResult.ok) {
    return specialtyResult;
  }

  const priceRangeResult: Result<string | undefined, AppError> = parseOptionalString(
    payload["price_range"] ?? payload["priceRange"],
    "price_range"
  );
  if (!priceRangeResult.ok) {
    return priceRangeResult;
  }

  const instagramResult: Result<string | undefined, AppError> = parseOptionalString(
    payload["instagram_handle"] ?? payload["instagramHandle"],
    "instagram_handle"
  );
  if (!instagramResult.ok) {
    return instagramResult;
  }

  const profileImageResult: Result<string | undefined, AppError> = parseOptionalString(
    payload["profile_image_url"] ?? payload["profileImageUrl"],
    "profile_image_url"
  );
  if (!profileImageResult.ok) {
    return profileImageResult;
  }

  const isPublishedResult: Result<boolean | undefined, AppError> = parseOptionalBoolean(
    payload["is_published"] ?? payload["isPublished"],
    "is_published"
  );
  if (!isPublishedResult.ok) {
    return isPublishedResult;
  }

  const input: CreateOrUpdateArtistInput = {
    fullName: fullNameResult.value,
    username: normalizedUsername
  };

  if (bioResult.value !== undefined) {
    input.bio = bioResult.value;
  }
  if (locationResult.value !== undefined) {
    input.location = locationResult.value;
  }
  if (specialtyResult.value !== undefined) {
    input.specialty = specialtyResult.value;
  }
  if (priceRangeResult.value !== undefined) {
    input.priceRange = priceRangeResult.value;
  }
  if (instagramResult.value !== undefined) {
    input.instagramHandle = instagramResult.value;
  }
  if (profileImageResult.value !== undefined) {
    input.profileImageUrl = profileImageResult.value;
  }
  if (isPublishedResult.value !== undefined) {
    input.isPublished = isPublishedResult.value;
  }

  return ok(input);
}

export function parseArtistDiscoveryFilters(
  searchParams: URLSearchParams
): Result<ArtistDiscoveryFilters, AppError> {
  const filters: ArtistDiscoveryFilters = {};

  const location: string | null = searchParams.get("location");
  if (location !== null && location.trim() !== "") {
    filters.location = location.trim();
  }

  const specialty: string | null = searchParams.get("specialty");
  if (specialty !== null && specialty.trim() !== "") {
    filters.specialty = specialty.trim();
  }

  const priceRange: string | null = searchParams.get("price_range");
  if (priceRange !== null && priceRange.trim() !== "") {
    filters.priceRange = priceRange.trim();
  }

  return ok(filters);
}

