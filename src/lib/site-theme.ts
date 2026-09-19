import { createClient } from "@supabase/supabase-js";
import { cache } from "react";

import { getSupabaseEnv } from "@/lib/supabase/env";

/** Matches the `site_settings.default_theme` check constraint. */
export const SITE_THEMES = ["light", "dark", "system"] as const;

export type SiteTheme = (typeof SITE_THEMES)[number];

export const FALLBACK_SITE_THEME: SiteTheme = "light";

export function parseSiteTheme(value: unknown): SiteTheme | null {
  return SITE_THEMES.find((theme) => theme === value) ?? null;
}

/**
 * The theme the site opens in, chosen in the admin. Read without the
 * visitor's cookies so it does not turn static pages dynamic; saving the
 * setting revalidates the whole site. Falls back to light on any error.
 */
export const getDefaultSiteTheme = cache(async (): Promise<SiteTheme> => {
  try {
    const { url, publishableKey } = getSupabaseEnv();
    const supabase = createClient(url, publishableKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data } = await supabase
      .from("site_settings")
      .select("default_theme")
      .limit(1)
      .maybeSingle();

    return parseSiteTheme(data?.default_theme) ?? FALLBACK_SITE_THEME;
  } catch {
    return FALLBACK_SITE_THEME;
  }
});
