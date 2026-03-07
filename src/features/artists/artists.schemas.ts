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

function hasOwnField(record: Record<string, unknown>, fieldName: string): boolean {
  return Object.prototype.hasOwnProperty.call(record, fieldName);
}

function readField(
  record: Record<string, unknown>,
  primaryKey: string,
  aliasKey?: string
): { present: boolean; value: unknown } {
  if (hasOwnField(record, primaryKey)) {
    return {
      present: true,
      value: record[primaryKey]
    };
  }

  if (aliasKey !== undefined && hasOwnField(record, aliasKey)) {
    return {
      present: true,
      value: record[aliasKey]
    };
  }

  return {
    present: false,
    value: undefined
  };
}

function parseOptionalNullableString(
  value: unknown,
  fieldName: string
): Result<string | null | undefined, AppError> {
  if (value === undefined) {
    return ok(undefined);
  }

  if (value === null) {
    return ok(null);
  }

  if (typeof value !== "string") {
    return err(createError("VALIDATION_ERROR", `${fieldName} must be a string.`));
  }

  const trimmed: string = value.trim();
  return ok(trimmed === "" ? null : trimmed);
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

  const fullNameField: { present: boolean; value: unknown } = readField(payload, "full_name", "fullName");
  const fullNameResult: Result<string, AppError> = parseRequiredString(
    fullNameField.value,
    "full_name"
  );
  if (!fullNameResult.ok) {
    return fullNameResult;
  }

  const usernameField: { present: boolean; value: unknown } = readField(payload, "username");
  const usernameResult: Result<string, AppError> = parseRequiredString(usernameField.value, "username");
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

  const bioField: { present: boolean; value: unknown } = readField(payload, "bio");
  const bioResult: Result<string | null | undefined, AppError> = parseOptionalNullableString(
    bioField.value,
    "bio"
  );
  if (!bioResult.ok) {
    return bioResult;
  }

  const locationField: { present: boolean; value: unknown } = readField(payload, "location");
  const locationResult: Result<string | null | undefined, AppError> = parseOptionalNullableString(
    locationField.value,
    "location"
  );
  if (!locationResult.ok) {
    return locationResult;
  }

  const specialtyField: { present: boolean; value: unknown } = readField(payload, "specialty");
  const specialtyResult: Result<ArtistSpecialty[] | undefined, AppError> = parseOptionalStringArray(
    specialtyField.value,
    "specialty"
  );
  if (!specialtyResult.ok) {
    return specialtyResult;
  }

  const priceRangeField: { present: boolean; value: unknown } = readField(
    payload,
    "price_range",
    "priceRange"
  );
  const priceRangeResult: Result<string | null | undefined, AppError> = parseOptionalNullableString(
    priceRangeField.value,
    "price_range"
  );
  if (!priceRangeResult.ok) {
    return priceRangeResult;
  }

  const instagramField: { present: boolean; value: unknown } = readField(
    payload,
    "instagram_handle",
    "instagramHandle"
  );
  const instagramResult: Result<string | null | undefined, AppError> = parseOptionalNullableString(
    instagramField.value,
    "instagram_handle"
  );
  if (!instagramResult.ok) {
    return instagramResult;
  }

  const profileImageField: { present: boolean; value: unknown } = readField(
    payload,
    "profile_image_url",
    "profileImageUrl"
  );
  const profileImageResult: Result<string | null | undefined, AppError> = parseOptionalNullableString(
    profileImageField.value,
    "profile_image_url"
  );
  if (!profileImageResult.ok) {
    return profileImageResult;
  }

  const isPublishedField: { present: boolean; value: unknown } = readField(
    payload,
    "is_published",
    "isPublished"
  );
  const isPublishedResult: Result<boolean | undefined, AppError> = parseOptionalBoolean(
    isPublishedField.value,
    "is_published"
  );
  if (!isPublishedResult.ok) {
    return isPublishedResult;
  }

  const input: CreateOrUpdateArtistInput = {
    fullName: fullNameResult.value,
    username: normalizedUsername
  };

  if (bioField.present && bioResult.value !== undefined) {
    input.bio = bioResult.value;
  }
  if (locationField.present && locationResult.value !== undefined) {
    input.location = locationResult.value;
  }
  if (specialtyField.present && specialtyResult.value !== undefined) {
    input.specialty = specialtyResult.value;
  }
  if (priceRangeField.present && priceRangeResult.value !== undefined) {
    input.priceRange = priceRangeResult.value;
  }
  if (instagramField.present && instagramResult.value !== undefined) {
    input.instagramHandle = instagramResult.value;
  }
  if (profileImageField.present && profileImageResult.value !== undefined) {
    input.profileImageUrl = profileImageResult.value;
  }
  if (isPublishedField.present && isPublishedResult.value !== undefined) {
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
