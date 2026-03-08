import { verifyOtpFromSearchParams } from "../../../features/auth";
import type { AuthUser } from "../../../features/auth/auth.types";
import type { AppError } from "../../../shared/errors";
import type { Result } from "../../../shared/result.types";
import { NextRequest, NextResponse } from "next/server";

function normalizeNextPath(nextValue: string | null): string {
  if (nextValue === null || nextValue.trim() === "") {
    return "/";
  }

  if (!nextValue.startsWith("/")) {
    return "/";
  }

  return nextValue;
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  const nextPath: string = normalizeNextPath(searchParams.get("next"));
  const result: Result<AuthUser, AppError> = await verifyOtpFromSearchParams(searchParams);

  const redirectUrl = request.nextUrl.clone();
  redirectUrl.searchParams.delete("token_hash");
  redirectUrl.searchParams.delete("type");
  redirectUrl.searchParams.delete("next");

  if (result.ok) {
    redirectUrl.pathname = nextPath;
    return NextResponse.redirect(redirectUrl);
  }

  redirectUrl.pathname = "/auth/error";
  redirectUrl.searchParams.set("message", result.error.message);

  return NextResponse.redirect(redirectUrl);
}
