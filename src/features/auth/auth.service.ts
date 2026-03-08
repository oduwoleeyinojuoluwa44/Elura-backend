import type { AppError } from "../../shared/errors";
import type { Result } from "../../shared/result.types";
import {
  fetchAuthenticatedUserFromStore,
  signInWithEmailPasswordInStore,
  signOutInStore,
  signUpWithEmailPasswordInStore,
  verifyOtpInStore
} from "./auth.repository";
import { parseAuthCredentialsInput, parseVerifyOtpInput } from "./auth.schemas";
import type {
  AuthCredentialsInput,
  AuthResponse,
  AuthSignOutResponse,
  AuthUser,
  VerifyOtpInput
} from "./auth.types";

export async function signUpWithEmailPassword(
  payload: unknown,
  emailRedirectTo: string
): Promise<Result<AuthResponse, AppError>> {
  const parsedInput: Result<AuthCredentialsInput, AppError> = parseAuthCredentialsInput(payload);
  if (!parsedInput.ok) {
    return parsedInput;
  }

  return signUpWithEmailPasswordInStore(parsedInput.value, emailRedirectTo);
}

export async function signInWithEmailPassword(
  payload: unknown
): Promise<Result<AuthResponse, AppError>> {
  const parsedInput: Result<AuthCredentialsInput, AppError> = parseAuthCredentialsInput(payload);
  if (!parsedInput.ok) {
    return parsedInput;
  }

  return signInWithEmailPasswordInStore(parsedInput.value);
}

export async function signOutCurrentUser(): Promise<Result<AuthSignOutResponse, AppError>> {
  return signOutInStore();
}

export async function getAuthenticatedUser(): Promise<Result<AuthUser, AppError>> {
  return fetchAuthenticatedUserFromStore();
}

export async function verifyOtpFromSearchParams(
  searchParams: URLSearchParams
): Promise<Result<AuthUser, AppError>> {
  const parsedInput: Result<VerifyOtpInput, AppError> = parseVerifyOtpInput(searchParams);
  if (!parsedInput.ok) {
    return parsedInput;
  }

  return verifyOtpInStore(parsedInput.value);
}
