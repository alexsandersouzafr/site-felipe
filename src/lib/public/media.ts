import type { Locale } from "@/i18n/routing";
import { getLocalizedValue } from "@/lib/localized-value";
import { mediaPublicUrl } from "@/lib/media-url";
import { createClient } from "@/lib/supabase/server";
import { extractYouTubeId } from "@/lib/youtube";

type VideoRow = {
  id: string;
  youtube_url: string;
  title_pt: string;
  title_en: string | null;
  title_es: string | null;
  description_pt: string | null;
  description_en: string | null;
  description_es: string | null;
  display_order: number;
};

type PhotoRow = {
  id: string;
  storage_path: string;
  alt_pt: string;
  alt_en: string | null;
  alt_es: string | null;
  credit: string | null;
  collection: string | null;
  display_order: number;
};

export type PublicVideo = {
  id: string;
  title: string;
  description: string | null;
  youtubeUrl: string;
  youtubeId: string | null;
};

export type PublicPhoto = {
  id: string;
  src: string | null;
  alt: string;
  credit: string | null;
  collection: string | null;
};

export async function listVideos(locale: Locale) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("videos")
    .select(
      "id, youtube_url, title_pt, title_en, title_es, description_pt, description_en, description_es, display_order",
    )
    .order("display_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return ((data ?? []) as VideoRow[]).map(
    (row): PublicVideo => ({
      id: row.id,
      title: getLocalizedValue(
        { pt: row.title_pt, en: row.title_en, es: row.title_es },
        locale,
      ),
      description: row.description_pt
        ? getLocalizedValue(
            {
              pt: row.description_pt,
              en: row.description_en,
              es: row.description_es,
            },
            locale,
          )
        : null,
      youtubeUrl: row.youtube_url,
      youtubeId: extractYouTubeId(row.youtube_url),
    }),
  );
}

export async function listPhotos(locale: Locale) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("photos")
    .select(
      "id, storage_path, alt_pt, alt_en, alt_es, credit, collection, display_order",
    )
    .order("display_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return ((data ?? []) as PhotoRow[]).map(
    (row): PublicPhoto => ({
      id: row.id,
      src: mediaPublicUrl(row.storage_path),
      alt: getLocalizedValue(
        { pt: row.alt_pt, en: row.alt_en, es: row.alt_es },
        locale,
      ),
      credit: row.credit,
      collection: row.collection,
    }),
  );
}
