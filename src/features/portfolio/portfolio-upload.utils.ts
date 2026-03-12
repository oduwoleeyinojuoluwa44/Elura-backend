const MAX_PORTFOLIO_IMAGE_BYTES = 10 * 1024 * 1024;

export interface ParsedPortfolioUploadInput {
  artistId: string;
  fileBytes: Uint8Array;
  contentType: string;
  fileExtension: string;
  caption?: string;
  sortOrder?: number;
}

function readFormEntry(
  formData: FormData,
  canonicalFieldName: string,
  compatibilityFieldName?: string
): FormDataEntryValue | null {
  const canonicalValue = formData.get(canonicalFieldName);
  if (canonicalValue !== null) {
    return canonicalValue;
  }

  if (compatibilityFieldName === undefined) {
    return null;
  }

  return formData.get(compatibilityFieldName);
}

function readRequiredString(
  formData: FormData,
  canonicalFieldName: string,
  compatibilityFieldName: string | undefined,
  fieldName: string
): string {
  const value = readFormEntry(formData, canonicalFieldName, compatibilityFieldName);

  if (typeof value !== "string" || value.trim() === "") {
    throw new Error(`${fieldName} is required.`);
  }

  return value.trim();
}

function readOptionalString(
  formData: FormData,
  canonicalFieldName: string,
  compatibilityFieldName: string | undefined,
  fieldName: string
): string | undefined {
  const value = readFormEntry(formData, canonicalFieldName, compatibilityFieldName);

  if (value === null) {
    return undefined;
  }

  if (typeof value !== "string") {
    throw new Error(`${fieldName} must be a string.`);
  }

  const trimmedValue = value.trim();
  return trimmedValue === "" ? undefined : trimmedValue;
}

function readOptionalInteger(
  formData: FormData,
  canonicalFieldName: string,
  compatibilityFieldName: string | undefined,
  fieldName: string
): number | undefined {
  const value = readFormEntry(formData, canonicalFieldName, compatibilityFieldName);

  if (value === null) {
    return undefined;
  }

  if (typeof value !== "string") {
    throw new Error(`${fieldName} must be a non-negative integer.`);
  }

  const trimmedValue = value.trim();
  if (trimmedValue === "") {
    return undefined;
  }

  if (!/^\d+$/.test(trimmedValue)) {
    throw new Error(`${fieldName} must be a non-negative integer.`);
  }

  const parsedValue = Number(trimmedValue);
  if (!Number.isSafeInteger(parsedValue)) {
    throw new Error(`${fieldName} must be a non-negative integer.`);
  }

  return parsedValue;
}

function detectImageType(fileBytes: Uint8Array): { contentType: string; fileExtension: string } {
  if (
    fileBytes.length >= 8 &&
    fileBytes[0] === 0x89 &&
    fileBytes[1] === 0x50 &&
    fileBytes[2] === 0x4e &&
    fileBytes[3] === 0x47 &&
    fileBytes[4] === 0x0d &&
    fileBytes[5] === 0x0a &&
    fileBytes[6] === 0x1a &&
    fileBytes[7] === 0x0a
  ) {
    return { contentType: "image/png", fileExtension: "png" };
  }

  if (fileBytes.length >= 3 && fileBytes[0] === 0xff && fileBytes[1] === 0xd8 && fileBytes[2] === 0xff) {
    return { contentType: "image/jpeg", fileExtension: "jpg" };
  }

  if (
    fileBytes.length >= 6 &&
    fileBytes[0] === 0x47 &&
    fileBytes[1] === 0x49 &&
    fileBytes[2] === 0x46 &&
    fileBytes[3] === 0x38 &&
    (fileBytes[4] === 0x37 || fileBytes[4] === 0x39) &&
    fileBytes[5] === 0x61
  ) {
    return { contentType: "image/gif", fileExtension: "gif" };
  }

  if (
    fileBytes.length >= 12 &&
    fileBytes[0] === 0x52 &&
    fileBytes[1] === 0x49 &&
    fileBytes[2] === 0x46 &&
    fileBytes[3] === 0x46 &&
    fileBytes[8] === 0x57 &&
    fileBytes[9] === 0x45 &&
    fileBytes[10] === 0x42 &&
    fileBytes[11] === 0x50
  ) {
    return { contentType: "image/webp", fileExtension: "webp" };
  }

  throw new Error("image must be a valid JPEG, PNG, GIF, or WebP file.");
}

export async function parsePortfolioUploadFormData(
  formData: FormData
): Promise<ParsedPortfolioUploadInput> {
  const artistId = readRequiredString(formData, "artistId", "artist_id", "artistId");
  const caption = readOptionalString(formData, "caption", undefined, "caption");
  const sortOrder = readOptionalInteger(formData, "sortOrder", "sort_order", "sortOrder");

  const imageEntry = formData.get("image");
  if (!(imageEntry instanceof File) || imageEntry.size === 0) {
    throw new Error("image is required.");
  }

  if (imageEntry.size > MAX_PORTFOLIO_IMAGE_BYTES) {
    throw new Error("image must be 10 MB or smaller.");
  }

  const fileBytes = new Uint8Array(await imageEntry.arrayBuffer());
  const detectedImageType = detectImageType(fileBytes);
  const parsedInput: ParsedPortfolioUploadInput = {
    artistId,
    fileBytes,
    contentType: detectedImageType.contentType,
    fileExtension: detectedImageType.fileExtension
  };

  if (caption !== undefined) {
    parsedInput.caption = caption;
  }

  if (sortOrder !== undefined) {
    parsedInput.sortOrder = sortOrder;
  }

  return parsedInput;
}
