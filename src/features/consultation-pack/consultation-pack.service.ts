import { createError, notImplemented, type AppError } from "../../shared/errors";
import { err, type Result } from "../../shared/result.types";
import { parseConsultationPackRequest } from "./consultation-pack.schemas";
import type { ConsultationPackRequest, ConsultationPackResponse } from "./consultation-pack.types";

export async function generateConsultationPack(
  payload: unknown,
  ownerUserId: string
): Promise<Result<ConsultationPackResponse, AppError>> {
  if (ownerUserId.trim() === "") {
    return err(createError("UNAUTHORIZED", "Authenticated user is required."));
  }

  const parsedInput: Result<ConsultationPackRequest, AppError> = parseConsultationPackRequest(payload);
  if (!parsedInput.ok) {
    return parsedInput;
  }

  void parsedInput.value;
  return err(notImplemented("AI consultation generation is not implemented yet."));
}

