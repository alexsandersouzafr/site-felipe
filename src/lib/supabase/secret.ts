import { createClient } from "@supabase/supabase-js";

import { getSupabaseEnv } from "./env";

/**
 * Supabase client with the project's secret key: it bypasses row level
 * security, so it must never be created in the browser. Used where the server
 * writes on a visitor's behalf after its own checks — the contact form, which
 * visitors can no longer insert into directly.
 *
 * Returns null when the key is not configured, so callers can fail loudly
 * instead of falling back to a weaker path.
 */
export function createSecretClient() {
  if (typeof window !== "undefined") {
    throw new Error("The Supabase secret client must stay on the server.");
  }

  const secretKey =
    process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!secretKey) {
    return null;
  }

  return createClient(getSupabaseEnv().url, secretKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
