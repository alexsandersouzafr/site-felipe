import type { Locale } from "@/i18n/routing";
import { getLocalizedValue } from "@/lib/localized-value";
import {
  downloadFileName,
  mediaDownloadUrl,
  mediaPublicUrl,
} from "@/lib/media-url";
import {
  PRESS_PHOTO_CATEGORIES,
  type PressPhotoCategory,
} from "@/lib/press-categories";
import { createClient } from "@/lib/supabase/server";

type PressPhotoRow = {
  id: string;
  storage_path: string;
  category: PressPhotoCategory;
  alt_pt: string;
  alt_en: string | null;
  alt_fr: string | null;
  credit: string | null;
};

export type PublicPressPhoto = {
  id: string;
  category: PressPhotoCategory;
  src: string | null;
  /** The original file, saved instead of displayed. */
  downloadUrl: string | null;
  alt: string;
  credit: string | null;
};

/** Published press photos, in display order, grouped by section. */
export async function listPressPhotos(locale: Locale) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("press_photos")
    .select("id, storage_path, category, alt_pt, alt_en, alt_fr, credit")
    .order("display_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  const photos = ((data ?? []) as PressPhotoRow[]).map(
    (row): PublicPressPhoto => {
      const alt = getLocalizedValue(
        { pt: row.alt_pt, en: row.alt_en, fr: row.alt_fr },
        locale,
      );

      return {
        id: row.id,
        category: row.category,
        src: mediaPublicUrl(row.storage_path),
        downloadUrl: mediaDownloadUrl(
          row.storage_path,
          downloadFileName(row.storage_path, alt),
        ),
        alt,
        credit: row.credit,
      };
    },
  );

  return Object.fromEntries(
    PRESS_PHOTO_CATEGORIES.map((category) => [
      category,
      photos.filter((photo) => photo.category === category && photo.src),
    ]),
  ) as Record<PressPhotoCategory, PublicPressPhoto[]>;
}
