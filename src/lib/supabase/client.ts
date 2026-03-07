import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

type EnvMap = Readonly<Record<string, string | undefined>>;

const DEFAULT_ENV: EnvMap = process.env as EnvMap;

export interface SupabaseClientConfig {
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

export function getSupabaseClientConfig(env: EnvMap = DEFAULT_ENV): SupabaseClientConfig {
  return {
    url: requireEnvValue(env, "NEXT_PUBLIC_SUPABASE_URL"),
    anonKey: requireEnvValue(env, "NEXT_PUBLIC_SUPABASE_ANON_KEY")
  };
}

export function createSupabaseClient(env: EnvMap = DEFAULT_ENV): SupabaseClient<Database> {
  const config: SupabaseClientConfig = getSupabaseClientConfig(env);

  return createClient<Database>(config.url, config.anonKey);
}
