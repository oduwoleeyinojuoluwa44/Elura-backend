import type { EmailOtpType } from "@supabase/supabase-js";

export interface AuthCredentialsInput {
  email: string;
  password: string;
}

export interface AuthUser {
  id: string;
  email: string | null;
  emailConfirmedAt: string | null;
}

export interface AuthResponse {
  user: AuthUser;
  requiresEmailConfirmation: boolean;
}

export interface AuthSignOutResponse {
  success: true;
}

export interface VerifyOtpInput {
  tokenHash: string;
  type: EmailOtpType;
}

