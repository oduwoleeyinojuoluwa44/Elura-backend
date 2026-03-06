import { notImplemented, type AppError } from "../../shared/errors";
import { err, type Result } from "../../shared/result.types";
import type { BookingRequest, CreateBookingRequestInput } from "./booking-requests.types";

export async function createBookingRequestInStore(
  input: CreateBookingRequestInput
): Promise<Result<BookingRequest, AppError>> {
  void input;

  return err(notImplemented("Booking request persistence is not implemented yet."));
}

