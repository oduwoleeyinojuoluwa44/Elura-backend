export type EnvMap = Readonly<Record<string, string | undefined>>;

export const DEFAULT_ENV: EnvMap = process.env as EnvMap;

export interface SupabasePublicConfig {
  url: string;
  publicKey: string;
}

export interface SupabaseAdminConfig {
  url: string;
  serviceRoleKey: string;
}

function hasEnvValue(env: EnvMap, key: string): boolean {
  const value: string | undefined = env[key];
  return typeof value === "string" && value.trim() !== "";
}

export function requireEnvValue(env: EnvMap, key: string): string {
  const value: string | undefined = env[key];

  if (typeof value !== "string" || value.trim() === "") {
    throw new Error(`Missing required environment variable: ${key}`);
  }

  return value;
}

export function getSupabasePublicKey(env: EnvMap = DEFAULT_ENV): string {
  if (hasEnvValue(env, "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY")) {
    return requireEnvValue(env, "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY");
  }

  if (hasEnvValue(env, "NEXT_PUBLIC_SUPABASE_ANON_KEY")) {
    return requireEnvValue(env, "NEXT_PUBLIC_SUPABASE_ANON_KEY");
  }

  throw new Error(
    "Missing required environment variable: NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY"
  );
}

export function getSupabasePublicConfig(env: EnvMap = DEFAULT_ENV): SupabasePublicConfig {
  return {
    url: requireEnvValue(env, "NEXT_PUBLIC_SUPABASE_URL"),
    publicKey: getSupabasePublicKey(env)
  };
}

export function getSupabaseAdminConfig(env: EnvMap = DEFAULT_ENV): SupabaseAdminConfig {
  return {
    url: requireEnvValue(env, "NEXT_PUBLIC_SUPABASE_URL"),
    serviceRoleKey: requireEnvValue(env, "SUPABASE_SERVICE_ROLE_KEY")
  };
}
