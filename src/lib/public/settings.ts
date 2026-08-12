import type { Locale } from "@/i18n/routing";
import { getLocalizedValue } from "@/lib/localized-value";
import { createClient } from "@/lib/supabase/server";

type SocialLink = {
  label: string;
  url: string;
};

type SettingsRow = {
  id: string;
  contact_email: string | null;
  contact_phone: string | null;
  intro_pt: string;
  intro_en: string | null;
  intro_es: string | null;
  social_links: SocialLink[] | null;
};

export type PublicSiteSettings = {
  intro: string;
  email: string | null;
  phone: string | null;
  socialLinks: SocialLink[];
};

export async function getSiteSettings(
  locale: Locale,
): Promise<PublicSiteSettings | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("site_settings")
    .select(
      "id, contact_email, contact_phone, intro_pt, intro_en, intro_es, social_links",
    )
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    return null;
  }

  const row = data as SettingsRow;

  return {
    intro: getLocalizedValue(
      { pt: row.intro_pt, en: row.intro_en, es: row.intro_es },
      locale,
    ),
    email: row.contact_email,
    phone: row.contact_phone,
    socialLinks: row.social_links ?? [],
  };
}
