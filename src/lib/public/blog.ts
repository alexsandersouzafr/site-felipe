import type { Locale } from "@/i18n/routing";
import {
  getBlogPreviewExcerpt,
  type LocalizedBlogBlock,
  parseBlogBlocks,
  resolveBlogBlocksForLocale,
} from "@/lib/blog-blocks";
import { getLocalizedValue } from "@/lib/localized-value";
import { mediaPublicUrl } from "@/lib/media-url";
import { clampPage, pageCount, pageRange } from "@/lib/pagination";
import { createClient } from "@/lib/supabase/server";

type BlogRow = {
  id: string;
  slug: string;
  title_pt: string;
  title_en: string | null;
  title_fr: string | null;
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

async function getBlogFallbackCoverUrl(
  supabase: Awaited<ReturnType<typeof createClient>>,
) {
  const { data } = await supabase
    .from("site_settings")
    .select("blog_fallback_cover_path")
    .limit(1)
    .maybeSingle();

  return mediaPublicUrl(data?.blog_fallback_cover_path ?? null);
}

function toSummary(
  row: BlogRow,
  locale: Locale,
  fallbackCoverUrl: string | null,
): PublicBlogPostSummary {
  const blocks = parseBlogBlocks(row.blocks);

  return {
    id: row.id,
    slug: row.slug,
    title: getLocalizedValue(
      { pt: row.title_pt, en: row.title_en, fr: row.title_fr },
      locale,
    ),
    excerpt: getBlogPreviewExcerpt(blocks, locale),
    coverUrl: mediaPublicUrl(row.cover_image_path) ?? fallbackCoverUrl,
    publishedAt: publishedAt(row),
  };
}

export async function listBlogPosts(locale: Locale, limit?: number) {
  const supabase = await createClient();
  let query = supabase
    .from("news_items")
    .select(
      "id, slug, title_pt, title_en, title_fr, cover_image_path, blocks, publish_at, created_at, updated_at",
    )
    .order("publish_at", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false });

  if (limit != null) {
    query = query.limit(limit);
  }

  const [{ data, error }, fallbackCoverUrl] = await Promise.all([
    query,
    getBlogFallbackCoverUrl(supabase),
  ]);

  if (error) {
    throw new Error(error.message);
  }

  return ((data ?? []) as BlogRow[]).map((row) =>
    toSummary(row, locale, fallbackCoverUrl),
  );
}

export async function listBlogPostsPage(
  locale: Locale,
  page: number,
  pageSize: number,
) {
  const supabase = await createClient();

  const { count: totalCount } = await supabase
    .from("news_items")
    .select("id", { count: "exact", head: true });

  const totalPages = pageCount(totalCount ?? 0, pageSize);
  const { from, to } = pageRange(clampPage(page, totalPages), pageSize);

  const [{ data, error, count }, fallbackCoverUrl] = await Promise.all([
    supabase
      .from("news_items")
      .select(
        "id, slug, title_pt, title_en, title_fr, cover_image_path, blocks, publish_at, created_at, updated_at",
        { count: "exact" },
      )
      .order("publish_at", { ascending: false, nullsFirst: false })
      .order("created_at", { ascending: false })
      .range(from, to),
    getBlogFallbackCoverUrl(supabase),
  ]);

  if (error) {
    throw new Error(error.message);
  }

  return {
    posts: ((data ?? []) as BlogRow[]).map((row) =>
      toSummary(row, locale, fallbackCoverUrl),
    ),
    totalPages: pageCount(count ?? 0, pageSize),
  };
}

export async function getBlogPostBySlug(slug: string, locale: Locale) {
  const supabase = await createClient();
  const [{ data, error }, fallbackCoverUrl] = await Promise.all([
    supabase
      .from("news_items")
      .select(
        "id, slug, title_pt, title_en, title_fr, cover_image_path, blocks, publish_at, created_at, updated_at",
      )
      .eq("slug", slug)
      .maybeSingle(),
    getBlogFallbackCoverUrl(supabase),
  ]);

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    return null;
  }

  const row = data as BlogRow;
  const summary = toSummary(row, locale, fallbackCoverUrl);

  return {
    ...summary,
    blocks: resolveBlogBlocksForLocale(parseBlogBlocks(row.blocks), locale),
  } satisfies PublicBlogPost;
}
