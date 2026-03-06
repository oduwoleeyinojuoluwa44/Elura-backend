import { createError, type AppError } from "../../shared/errors";
import { err, type Result } from "../../shared/result.types";
import { createPortfolioImageInStore } from "./portfolio.repository";
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

