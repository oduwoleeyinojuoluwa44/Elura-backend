import {
  isAuthRetryableFetchError,
  type AuthError,
  type User
} from "@supabase/supabase-js";
import { createSupabaseServerAuthClient } from "../../lib/supabase/server";
import { createError, type AppError } from "../../shared/errors";
import { err, ok, type Result } from "../../shared/result.types";
import type {
  AuthCredentialsInput,
  AuthResponse,
  AuthSignOutResponse,
  AuthUser,
  VerifyOtpInput
} from "./auth.types";

function mapAuthUser(user: User): AuthUser {
  return {
    id: user.id,
    email: user.email ?? null,
    emailConfirmedAt: user.email_confirmed_at ?? null
  };
}

function mapSignUpError(error: AuthError): AppError {
  if (isAuthRetryableFetchError(error)) {
    return createError("INTERNAL_ERROR", "Authentication service is temporarily unavailable.", {
      message: error.message,
      name: error.name,
      status: error.status
    });
  }

  const message: string = error.message.toLowerCase();

  if (message.includes("already registered") || message.includes("already been registered")) {
    return createError("CONFLICT", "That email is already registered.");
  }

  return createError("VALIDATION_ERROR", "Unable to create the account.", {
    message: error.message,
    status: error.status
  });
}

function mapSignInError(error: AuthError): AppError {
  if (isAuthRetryableFetchError(error)) {
    return createError("INTERNAL_ERROR", "Authentication service is temporarily unavailable.", {
      message: error.message,
      name: error.name,
      status: error.status
    });
  }

  return createError("UNAUTHORIZED", "Invalid email or password.", {
    message: error.message,
    name: error.name,
    status: error.status
  });
}

function mapSessionError(error: AuthError, unauthorizedMessage: string): AppError {
  if (isAuthRetryableFetchError(error)) {
    return createError("INTERNAL_ERROR", "Authentication service is temporarily unavailable.", {
      message: error.message,
      name: error.name,
      status: error.status
    });
  }

  return createError("UNAUTHORIZED", unauthorizedMessage, {
    message: error.message,
    name: error.name,
    status: error.status
  });
}

function mapAuthInitializationError(error: unknown, context: string): AppError {
  return createError("INTERNAL_ERROR", context, {
    cause: error instanceof Error ? error.message : "unknown"
  });
}

export async function signUpWithEmailPasswordInStore(
  input: AuthCredentialsInput,
  emailRedirectTo: string
): Promise<Result<AuthResponse, AppError>> {
  try {
    const supabase = await createSupabaseServerAuthClient();
    const response = await supabase.auth.signUp({
      email: input.email,
      password: input.password,
      options: {
        emailRedirectTo
      }
    });

    if (response.error !== null) {
      return err(mapSignUpError(response.error));
    }

    if (response.data.user === null) {
      return err(createError("INTERNAL_ERROR", "Auth provider returned no user."));
    }

    return ok({
      user: mapAuthUser(response.data.user),
      requiresEmailConfirmation: response.data.session === null
    });
  } catch (error: unknown) {
    return err(mapAuthInitializationError(error, "Failed to initialize signup authentication."));
  }
}

export async function signInWithEmailPasswordInStore(
  input: AuthCredentialsInput
): Promise<Result<AuthResponse, AppError>> {
  try {
    const supabase = await createSupabaseServerAuthClient();
    const response = await supabase.auth.signInWithPassword({
      email: input.email,
      password: input.password
    });

    if (response.error !== null) {
      return err(mapSignInError(response.error));
    }

    return ok({
      user: mapAuthUser(response.data.user),
      requiresEmailConfirmation: false
    });
  } catch (error: unknown) {
    return err(mapAuthInitializationError(error, "Failed to initialize signin authentication."));
  }
}

export async function signOutInStore(): Promise<Result<AuthSignOutResponse, AppError>> {
  try {
    const supabase = await createSupabaseServerAuthClient();
    const response = await supabase.auth.signOut();

    if (response.error !== null) {
      if (isAuthRetryableFetchError(response.error)) {
        return err(
          createError("INTERNAL_ERROR", "Authentication service is temporarily unavailable.", {
            message: response.error.message,
            name: response.error.name,
            status: response.error.status
          })
        );
      }

      return err(createError("INTERNAL_ERROR", "Unable to sign out.", {
        message: response.error.message,
        name: response.error.name,
        status: response.error.status
      }));
    }

    return ok({ success: true });
  } catch (error: unknown) {
    return err(mapAuthInitializationError(error, "Failed to initialize signout authentication."));
  }
}

export async function fetchAuthenticatedUserFromStore(): Promise<Result<AuthUser, AppError>> {
  try {
    const supabase = await createSupabaseServerAuthClient();
    const response = await supabase.auth.getUser();

    if (response.error !== null) {
      return err(mapSessionError(response.error, "Authentication required."));
    }

    if (response.data.user === null) {
      return err(createError("UNAUTHORIZED", "Authentication required."));
    }

    return ok(mapAuthUser(response.data.user));
  } catch (error: unknown) {
    return err(mapAuthInitializationError(error, "Failed to initialize session authentication."));
  }
}

export async function verifyOtpInStore(
  input: VerifyOtpInput
): Promise<Result<AuthUser, AppError>> {
  try {
    const supabase = await createSupabaseServerAuthClient();
    const response = await supabase.auth.verifyOtp({
      token_hash: input.tokenHash,
      type: input.type
    });

    if (response.error !== null) {
      return err(
        mapSessionError(response.error, "Unable to verify the authentication link.")
      );
    }

    if (response.data.user === null) {
      return err(createError("UNAUTHORIZED", "Unable to verify the authentication link."));
    }

    return ok(mapAuthUser(response.data.user));
  } catch (error: unknown) {
    return err(mapAuthInitializationError(error, "Failed to initialize email confirmation."));
  }
}
