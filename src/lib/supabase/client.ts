import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";
import { DEFAULT_ENV, getSupabasePublicConfig, type EnvMap } from "./config";

export interface SupabaseClientConfig {
  url: string;
  publicKey: string;
}

export function getSupabaseClientConfig(env: EnvMap = DEFAULT_ENV): SupabaseClientConfig {
  return getSupabasePublicConfig(env);
}

export function createSupabaseClient(env: EnvMap = DEFAULT_ENV): SupabaseClient<Database> {
  const config: SupabaseClientConfig = getSupabaseClientConfig(env);

  return createBrowserClient<Database>(config.url, config.publicKey);
}
