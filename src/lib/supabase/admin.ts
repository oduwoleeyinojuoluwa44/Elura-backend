import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

type EnvMap = Readonly<Record<string, string | undefined>>;

const DEFAULT_ENV: EnvMap = process.env as EnvMap;

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

export function getSupabaseAdminConfig(env: EnvMap = DEFAULT_ENV): SupabaseAdminConfig {
  return {
    url: requireEnvValue(env, "NEXT_PUBLIC_SUPABASE_URL"),
    serviceRoleKey: requireEnvValue(env, "SUPABASE_SERVICE_ROLE_KEY")
  };
}

export function createSupabaseAdminClient(env: EnvMap = DEFAULT_ENV): SupabaseClient<Database> {
  const config: SupabaseAdminConfig = getSupabaseAdminConfig(env);

  return createClient<Database>(config.url, config.serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  });
}
