import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";
import {
  DEFAULT_ENV,
  getSupabaseAdminConfig as getSharedSupabaseAdminConfig,
  type EnvMap,
  type SupabaseAdminConfig
} from "./config";

export function getSupabaseAdminConfig(env: EnvMap = DEFAULT_ENV): SupabaseAdminConfig {
  return getSharedSupabaseAdminConfig(env);
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
