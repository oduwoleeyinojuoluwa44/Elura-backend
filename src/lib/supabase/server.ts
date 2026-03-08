import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import type { Database } from "./database.types";
import { DEFAULT_ENV, getSupabasePublicConfig, type EnvMap } from "./config";

export interface SupabaseServerConfig {
  url: string;
  publicKey: string;
}

export function getSupabaseServerConfig(env: EnvMap = DEFAULT_ENV): SupabaseServerConfig {
  return getSupabasePublicConfig(env);
}

export function createSupabaseServerClient(env: EnvMap = DEFAULT_ENV): SupabaseClient<Database> {
  const config: SupabaseServerConfig = getSupabaseServerConfig(env);

  return createClient<Database>(config.url, config.publicKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  });
}

interface CookieToSet {
  name: string;
  value: string;
  options: CookieOptions;
}

export async function createSupabaseServerAuthClient(
  env: EnvMap = DEFAULT_ENV
): Promise<SupabaseClient<Database>> {
  const config: SupabaseServerConfig = getSupabaseServerConfig(env);
  const cookieStore = await cookies();

  return createServerClient<Database>(config.url, config.publicKey, {
    cookies: {
      getAll(): { name: string; value: string }[] {
        return cookieStore.getAll().map((cookie) => ({
          name: cookie.name,
          value: cookie.value
        }));
      },
      setAll(cookiesToSet: CookieToSet[]): void {
        try {
          cookiesToSet.forEach((cookieToSet: CookieToSet) => {
            cookieStore.set(cookieToSet.name, cookieToSet.value, cookieToSet.options);
          });
        } catch {
          // Server components may not be able to mutate cookies directly.
        }
      }
    }
  });
}
