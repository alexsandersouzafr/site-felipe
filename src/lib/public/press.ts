import type { Locale } from "@/i18n/routing";
import { getLocalizedValue } from "@/lib/localized-value";
import { mediaPublicUrl } from "@/lib/media-url";
import { createClient } from "@/lib/supabase/server";

type PressPhotoRow = {
  id: string;
  storage_path: string;
  alt_pt: string;
  alt_en: string | null;
  alt_fr: string | null;
  credit: string | null;
};

export type PublicPressPhoto = {
  id: string;
  src: string | null;
  alt: string;
  credit: string | null;
};

export async function listPressPhotos(locale: Locale) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("press_photos")
    .select("id, storage_path, alt_pt, alt_en, alt_fr, credit")
    .order("display_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return ((data ?? []) as PressPhotoRow[]).map(
    (row): PublicPressPhoto => ({
      id: row.id,
      src: mediaPublicUrl(row.storage_path),
      alt: getLocalizedValue(
        { pt: row.alt_pt, en: row.alt_en, fr: row.alt_fr },
        locale,
      ),
      credit: row.credit,
    }),
  );
}
