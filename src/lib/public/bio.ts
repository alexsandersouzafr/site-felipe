import type { Locale } from "@/i18n/routing";
import { selectHighlightsForPage } from "@/lib/bio-page";
import type { ContentStatus } from "@/lib/content-visibility";
import { getLocalizedValue } from "@/lib/localized-value";
import { mediaPublicUrl } from "@/lib/media-url";
import type { RichTextDocument } from "@/lib/rich-text";
import { coerceRichTextDocument } from "@/lib/rich-text";
import { createClient } from "@/lib/supabase/server";

type BiographyRow = {
  id: string;
  image_path: string | null;
  summary_pt: string;
  summary_en: string | null;
  summary_fr: string | null;
  content_pt: unknown;
  content_en: unknown;
  content_fr: unknown;
};

type HighlightRow = {
  id: string;
  status: ContentStatus;
  publish_at: string | null;
  show_on_page: boolean;
  display_order: number;
  title_pt: string;
  title_en: string | null;
  title_fr: string | null;
  description_pt: string;
  description_en: string | null;
  description_fr: string | null;
};

export type PublicBiography = {
  id: string;
  imageUrl: string | null;
  summary: string;
  body: RichTextDocument;
};

export type PublicHighlight = {
  id: string;
  title: string;
  description: string;
};

function localizeRichText(
  pt: unknown,
  en: unknown,
  fr: unknown,
  locale: Locale,
): RichTextDocument {
  if (locale === "pt") {
    return coerceRichTextDocument(pt);
  }

  const localized = locale === "en" ? en : fr;
  if (localized == null) {
    return coerceRichTextDocument(pt);
  }

  return coerceRichTextDocument(localized);
}

function toPublicBiography(row: BiographyRow, locale: Locale): PublicBiography {
  return {
    id: row.id,
    imageUrl: mediaPublicUrl(row.image_path),
    summary: getLocalizedValue(
      {
        pt: row.summary_pt,
        en: row.summary_en,
        fr: row.summary_fr,
      },
      locale,
    ),
    body: localizeRichText(
      row.content_pt,
      row.content_en,
      row.content_fr,
      locale,
    ),
  };
}

export async function getBioPage(locale: Locale) {
  const supabase = await createClient();

  const [bioResult, highlightResult] = await Promise.all([
    supabase
      .from("biographies")
      .select(
        "id, image_path, summary_pt, summary_en, summary_fr, content_pt, content_en, content_fr",
      )
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("highlights")
      .select(
        "id, status, publish_at, show_on_page, display_order, title_pt, title_en, title_fr, description_pt, description_en, description_fr",
      )
      .order("display_order", { ascending: true }),
  ]);

  if (bioResult.error) {
    throw new Error(bioResult.error.message);
  }

  if (highlightResult.error) {
    throw new Error(highlightResult.error.message);
  }

  const biography = bioResult.data
    ? toPublicBiography(bioResult.data as BiographyRow, locale)
    : null;

  const highlights = (highlightResult.data ?? []) as HighlightRow[];
  const selectedHighlights = selectHighlightsForPage(
    highlights.map((row) => ({
      ...row,
      showOnPage: row.show_on_page,
      publishAt: row.publish_at,
      displayOrder: row.display_order,
    })),
  );

  const publicHighlights: PublicHighlight[] = selectedHighlights.map((row) => ({
    id: row.id,
    title: getLocalizedValue(
      { pt: row.title_pt, en: row.title_en, fr: row.title_fr },
      locale,
    ),
    description: getLocalizedValue(
      {
        pt: row.description_pt,
        en: row.description_en,
        fr: row.description_fr,
      },
      locale,
    ),
  }));

  return { biography, highlights: publicHighlights };
}

export async function getBioSummary(locale: Locale) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("biographies")
    .select("image_path, summary_pt, summary_en, summary_fr")
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    return null;
  }

  const summary = getLocalizedValue(
    {
      pt: data.summary_pt as string,
      en: data.summary_en as string | null,
      fr: data.summary_fr as string | null,
    },
    locale,
  ).trim();

  if (!summary) {
    return null;
  }

  return {
    summary,
    imageUrl: mediaPublicUrl(data.image_path as string | null),
  };
}
