import type { ReactElement } from "react";

interface AuthErrorPageProps {
  searchParams: Promise<{
    message?: string;
  }>;
}

export default async function AuthErrorPage(
  props: AuthErrorPageProps
): Promise<ReactElement> {
  const searchParams = await props.searchParams;

  return (
    <main>
      <h1>Authentication Error</h1>
      <p>{searchParams.message ?? "Unable to complete the authentication flow."}</p>
    </main>
  );
}

