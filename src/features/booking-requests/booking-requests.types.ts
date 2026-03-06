export type BookingRequestStatus = "new" | "viewed" | "accepted" | "declined";

export interface BookingRequest {
  id: string;
  artistId: string;
  clientName: string;
  clientEmail: string | null;
  clientPhone: string | null;
  eventType: string;
  eventDate: string | null;
  message: string;
  status: BookingRequestStatus;
  createdAt: string;
}

export interface CreateBookingRequestInput {
  artistId: string;
  clientName: string;
  clientEmail?: string;
  clientPhone?: string;
  eventType: string;
  eventDate?: string;
  message: string;
}

