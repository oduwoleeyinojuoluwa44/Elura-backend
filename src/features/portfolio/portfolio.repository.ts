import { notImplemented, type AppError } from "../../shared/errors";
import { err, type Result } from "../../shared/result.types";
import type { CreatePortfolioImageInput, PortfolioImage } from "./portfolio.types";

export async function createPortfolioImageInStore(
  ownerUserId: string,
  input: CreatePortfolioImageInput
): Promise<Result<PortfolioImage, AppError>> {
  void ownerUserId;
  void input;

  return err(notImplemented("Portfolio image persistence is not implemented yet."));
}

