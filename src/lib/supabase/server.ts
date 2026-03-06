type EnvMap = Readonly<Record<string, string | undefined>>;

const EMPTY_ENV: EnvMap = {};

export interface SupabaseServerConfig {
  url: string;
  anonKey: string;
}

function requireEnvValue(env: EnvMap, key: string): string {
  const value: string | undefined = env[key];

  if (typeof value !== "string" || value.trim() === "") {
    throw new Error(`Missing required environment variable: ${key}`);
  }

  return value;
}

export function getSupabaseServerConfig(env: EnvMap = EMPTY_ENV): SupabaseServerConfig {
  return {
    url: requireEnvValue(env, "NEXT_PUBLIC_SUPABASE_URL"),
    anonKey: requireEnvValue(env, "NEXT_PUBLIC_SUPABASE_ANON_KEY")
  };
}

