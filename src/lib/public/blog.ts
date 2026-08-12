import type { Locale } from "@/i18n/routing";
import {
  getBlogPreviewExcerpt,
  type LocalizedBlogBlock,
  parseBlogBlocks,
  resolveBlogBlocksForLocale,
} from "@/lib/blog-blocks";
import { getLocalizedValue } from "@/lib/localized-value";
import { mediaPublicUrl } from "@/lib/media-url";
import { createClient } from "@/lib/supabase/server";

type BlogRow = {
  id: string;
  slug: string;
  title_pt: string;
  title_en: string | null;
  title_es: string | null;
  cover_image_path: string | null;
  blocks: unknown;
  publish_at: string | null;
  created_at: string;
  updated_at: string;
};

export type PublicBlogPostSummary = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  coverUrl: string | null;
  publishedAt: string;
};

export type PublicBlogPost = PublicBlogPostSummary & {
  blocks: LocalizedBlogBlock[];
};

function publishedAt(row: BlogRow) {
  return row.publish_at ?? row.created_at;
}

function toSummary(row: BlogRow, locale: Locale): PublicBlogPostSummary {
  const blocks = parseBlogBlocks(row.blocks);

  return {
    id: row.id,
    slug: row.slug,
    title: getLocalizedValue(
      { pt: row.title_pt, en: row.title_en, es: row.title_es },
      locale,
    ),
    excerpt: getBlogPreviewExcerpt(blocks, locale),
    coverUrl: mediaPublicUrl(row.cover_image_path),
    publishedAt: publishedAt(row),
  };
}

export async function listBlogPosts(locale: Locale, limit?: number) {
  const supabase = await createClient();
  let query = supabase
    .from("news_items")
    .select(
      "id, slug, title_pt, title_en, title_es, cover_image_path, blocks, publish_at, created_at, updated_at",
    )
    .order("publish_at", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false });

  if (limit != null) {
    query = query.limit(limit);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(error.message);
  }

  return ((data ?? []) as BlogRow[]).map((row) => toSummary(row, locale));
}

export async function getBlogPostBySlug(slug: string, locale: Locale) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("news_items")
    .select(
      "id, slug, title_pt, title_en, title_es, cover_image_path, blocks, publish_at, created_at, updated_at",
    )
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    return null;
  }

  const row = data as BlogRow;
  const summary = toSummary(row, locale);

  return {
    ...summary,
    blocks: resolveBlogBlocksForLocale(parseBlogBlocks(row.blocks), locale),
  } satisfies PublicBlogPost;
}
