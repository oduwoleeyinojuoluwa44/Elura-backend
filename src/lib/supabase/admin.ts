type EnvMap = Readonly<Record<string, string | undefined>>;

const EMPTY_ENV: EnvMap = {};

export interface SupabaseAdminConfig {
  url: string;
  serviceRoleKey: string;
}

function requireEnvValue(env: EnvMap, key: string): string {
  const value: string | undefined = env[key];

  if (typeof value !== "string" || value.trim() === "") {
    throw new Error(`Missing required environment variable: ${key}`);
  }

  return value;
}

export function getSupabaseAdminConfig(env: EnvMap = EMPTY_ENV): SupabaseAdminConfig {
  return {
    url: requireEnvValue(env, "NEXT_PUBLIC_SUPABASE_URL"),
    serviceRoleKey: requireEnvValue(env, "SUPABASE_SERVICE_ROLE_KEY")
  };
}

