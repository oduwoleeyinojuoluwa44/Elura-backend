import { createError, type AppError } from "../../shared/errors";
import { err, ok, type Result } from "../../shared/result.types";
import { parsePortfolioUploadFormData } from "./portfolio-upload.utils";
import type { CreatePortfolioImageInput, UploadPortfolioImageInput } from "./portfolio.types";

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

  const cleanedValue: string = value.trim();
  return ok(cleanedValue === "" ? undefined : cleanedValue);
}

function parseOptionalInteger(value: unknown, fieldName: string): Result<number | undefined, AppError> {
  if (value === undefined || value === null) {
    return ok(undefined);
  }

  if (typeof value !== "number" || !Number.isInteger(value) || value < 0) {
    return err(createError("VALIDATION_ERROR", `${fieldName} must be a non-negative integer.`));
  }

  return ok(value);
}

export function parseCreatePortfolioImageInput(
  payload: unknown
): Result<CreatePortfolioImageInput, AppError> {
  if (!isRecord(payload)) {
    return err(createError("VALIDATION_ERROR", "Payload must be a JSON object."));
  }

  const artistIdResult: Result<string, AppError> = parseRequiredString(
    payload["artist_id"] ?? payload["artistId"],
    "artist_id"
  );
  if (!artistIdResult.ok) {
    return artistIdResult;
  }

  const imageUrlResult: Result<string, AppError> = parseRequiredString(
    payload["image_url"] ?? payload["imageUrl"],
    "image_url"
  );
  if (!imageUrlResult.ok) {
    return imageUrlResult;
  }

  const storagePathResult: Result<string, AppError> = parseRequiredString(
    payload["storage_path"] ?? payload["storagePath"],
    "storage_path"
  );
  if (!storagePathResult.ok) {
    return storagePathResult;
  }

  const captionResult: Result<string | undefined, AppError> = parseOptionalString(
    payload["caption"],
    "caption"
  );
  if (!captionResult.ok) {
    return captionResult;
  }

  const sortOrderResult: Result<number | undefined, AppError> = parseOptionalInteger(
    payload["sort_order"] ?? payload["sortOrder"],
    "sort_order"
  );
  if (!sortOrderResult.ok) {
    return sortOrderResult;
  }

  const input: CreatePortfolioImageInput = {
    artistId: artistIdResult.value,
    imageUrl: imageUrlResult.value,
    storagePath: storagePathResult.value
  };

  if (captionResult.value !== undefined) {
    input.caption = captionResult.value;
  }
  if (sortOrderResult.value !== undefined) {
    input.sortOrder = sortOrderResult.value;
  }

  return ok(input);
}

export async function parseUploadPortfolioImageInput(
  formData: FormData
): Promise<Result<UploadPortfolioImageInput, AppError>> {
  try {
    const parsedInput = await parsePortfolioUploadFormData(formData);
    const input: UploadPortfolioImageInput = {
      artistId: parsedInput.artistId,
      fileBytes: parsedInput.fileBytes,
      contentType: parsedInput.contentType,
      fileExtension: parsedInput.fileExtension
    };

    if (parsedInput.caption !== undefined) {
      input.caption = parsedInput.caption;
    }

    if (parsedInput.sortOrder !== undefined) {
      input.sortOrder = parsedInput.sortOrder;
    }

    return ok(input);
  } catch (error: unknown) {
    return err(
      createError(
        "VALIDATION_ERROR",
        error instanceof Error ? error.message : "Invalid portfolio upload payload."
      )
    );
  }
}
