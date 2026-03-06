import type { AppError } from "../../shared/errors";
import type { Result } from "../../shared/result.types";
import { createBookingRequestInStore } from "./booking-requests.repository";
import { parseCreateBookingRequestInput } from "./booking-requests.schemas";
import type { BookingRequest, CreateBookingRequestInput } from "./booking-requests.types";

export async function createBookingRequest(
  payload: unknown
): Promise<Result<BookingRequest, AppError>> {
  const parsedInput: Result<CreateBookingRequestInput, AppError> =
    parseCreateBookingRequestInput(payload);
  if (!parsedInput.ok) {
    return parsedInput;
  }

  return createBookingRequestInStore(parsedInput.value);
}

