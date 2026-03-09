import { createError, type AppError } from "../../shared/errors";
import { err, type Result } from "../../shared/result.types";
import {
  countPortfolioImagesByArtistIdInStore,
  createPortfolioImageInStore,
  fetchPortfolioImagesByArtistIdFromStore
} from "./portfolio.repository";
import { parseCreatePortfolioImageInput } from "./portfolio.schemas";
import type { CreatePortfolioImageInput, PortfolioImage } from "./portfolio.types";

export async function createPortfolioImage(
  payload: unknown,
  ownerUserId: string
): Promise<Result<PortfolioImage, AppError>> {
  if (ownerUserId.trim() === "") {
    return err(createError("UNAUTHORIZED", "Authenticated user is required."));
  }

  const parsedInput: Result<CreatePortfolioImageInput, AppError> =
    parseCreatePortfolioImageInput(payload);
  if (!parsedInput.ok) {
    return parsedInput;
  }

  return createPortfolioImageInStore(ownerUserId, parsedInput.value);
}

export async function getPortfolioImagesByArtistId(
  artistId: string
): Promise<Result<PortfolioImage[], AppError>> {
  if (artistId.trim() === "") {
    return err(createError("VALIDATION_ERROR", "artistId is required."));
  }

  return fetchPortfolioImagesByArtistIdFromStore(artistId);
}

export async function countPortfolioImagesByArtistId(
  artistId: string
): Promise<Result<number, AppError>> {
  if (artistId.trim() === "") {
    return err(createError("VALIDATION_ERROR", "artistId is required."));
  }

  return countPortfolioImagesByArtistIdInStore(artistId);
}
