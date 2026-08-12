import type { Locale } from "@/i18n/routing";
import type { HomePhotoSlot } from "@/lib/home-photo-slots";
import { normalizeImageFocus } from "@/lib/image-focus";
import { getLocalizedValue } from "@/lib/localized-value";
import { mediaPublicUrl } from "@/lib/media-url";
import type { PageCoverKey } from "@/lib/page-covers";
import { createClient } from "@/lib/supabase/server";

type HomePhotoRow = {
  id: string;
  slot: HomePhotoSlot;
  storage_path: string;
  alt_pt: string;
  alt_en: string | null;
  alt_es: string | null;
  object_position: string | null;
};

export type PublicHomePhoto = {
  id: string;
  slot: HomePhotoSlot;
  src: string;
  alt: string;
  objectPosition: string;
};

export type PublicPageCover = {
  src: string;
  objectPosition: string;
};

export async function listHomePhotos(locale: Locale) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("home_photos")
    .select(
      "id, slot, storage_path, alt_pt, alt_en, alt_es, object_position",
    )
    .order("slot", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return ((data ?? []) as HomePhotoRow[])
    .map((row) => {
      const src = mediaPublicUrl(row.storage_path);
      if (!src) {
        return null;
      }

      return {
        id: row.id,
        slot: row.slot,
        src,
        alt: getLocalizedValue(
          { pt: row.alt_pt, en: row.alt_en, es: row.alt_es },
          locale,
        ),
        objectPosition: normalizeImageFocus(row.object_position),
      } satisfies PublicHomePhoto;
    })
    .filter((item): item is PublicHomePhoto => item != null);
}

export async function getPageCover(
  pageKey: PageCoverKey,
): Promise<PublicPageCover | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("page_covers")
    .select("storage_path, object_position")
    .eq("page_key", pageKey)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  const src = mediaPublicUrl(data?.storage_path ?? null);
  if (!src) {
    return null;
  }

  return {
    src,
    objectPosition: normalizeImageFocus(data?.object_position),
  };
}

/** @deprecated Prefer getPageCover */
export async function getPageCoverUrl(pageKey: PageCoverKey) {
  const cover = await getPageCover(pageKey);
  return cover?.src ?? null;
}
