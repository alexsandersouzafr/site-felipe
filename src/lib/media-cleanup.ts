import type { SupabaseClient } from "@supabase/supabase-js";

/** Every column that can point at a file in the `media` bucket. */
const REFERENCES = [
  { table: "biographies", column: "image_path" },
  { table: "events", column: "image_path" },
  { table: "home_photos", column: "storage_path" },
  { table: "news_items", column: "cover_image_path" },
  { table: "page_covers", column: "storage_path" },
  { table: "photos", column: "storage_path" },
  { table: "press_photos", column: "storage_path" },
  { table: "site_settings", column: "blog_fallback_cover_path" },
] as const;

/**
 * Drops a stored file once nothing references it any more. Call it *after*
 * writing the new state, so the checks see what is true now.
 *
 * The same file can be used in more than one place — a gallery photo doubles
 * as a blog cover — so every reference is checked before deleting, and a
 * lookup that failed counts as "still in use": keeping an orphan costs space,
 * deleting a file in use costs the image on a live page.
 */
export async function deleteUnusedMedia(
  supabase: SupabaseClient,
  path: string | null | undefined,
) {
  if (!path) {
    return;
  }

  const checks = await Promise.all([
    ...REFERENCES.map(({ table, column }) =>
      supabase.from(table).select(column).eq(column, path).limit(1),
    ),
    // Blog images live inside the blocks array, not in a column of their own.
    supabase
      .from("news_items")
      .select("id")
      .filter("blocks", "cs", JSON.stringify([{ storagePath: path }]))
      .limit(1),
  ]);

  const stillUsed = checks.some(
    (result) => result.error || (result.data?.length ?? 0) > 0,
  );

  if (stillUsed) {
    return;
  }

  await supabase.storage.from("media").remove([path]);
}
