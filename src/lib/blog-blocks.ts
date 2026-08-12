import { z } from "zod";

import type { Locale } from "@/i18n/routing";
import {
  coerceRichTextDocument,
  emptyRichTextDocument,
  isRichTextEmpty,
  type RichTextDocument,
  richTextDocumentSchema,
  richTextToPlainText,
} from "@/lib/rich-text";
import { isYouTubeUrl } from "@/lib/youtube";

export const BLOG_PREVIEW_EXCERPT_CHARS = 320;
export const REQUIRED_PARAGRAPH_ERROR =
  "Adicione ao menos um parágrafo ao post.";

const localizedOptionalSchema = z.object({
  pt: z.string().nullable(),
  en: z.string().nullable(),
  es: z.string().nullable(),
});

const localizedRichTextSchema = z.object({
  pt: z.unknown().transform((value, ctx) => {
    const document = coerceRichTextDocument(value);
    if (isRichTextEmpty(document)) {
      ctx.addIssue({
        code: "custom",
        message: "O parágrafo em português é obrigatório.",
      });
      return z.NEVER;
    }
    return document;
  }),
  en: z
    .unknown()
    .nullable()
    .optional()
    .transform((value) => {
      if (value == null) {
        return null;
      }
      const document = coerceRichTextDocument(value);
      return isRichTextEmpty(document) ? null : document;
    }),
  es: z
    .unknown()
    .nullable()
    .optional()
    .transform((value) => {
      if (value == null) {
        return null;
      }
      const document = coerceRichTextDocument(value);
      return isRichTextEmpty(document) ? null : document;
    }),
});

export const blogParagraphBlockSchema = z.object({
  id: z.string().min(1),
  type: z.literal("paragraph"),
  title: localizedOptionalSchema,
  body: localizedRichTextSchema,
});

export const blogImageBlockSchema = z.object({
  id: z.string().min(1),
  type: z.literal("image"),
  storagePath: z.string().trim().min(1),
  caption: localizedOptionalSchema,
});

export const blogVideoBlockSchema = z.object({
  id: z.string().min(1),
  type: z.literal("video"),
  youtubeUrl: z
    .string()
    .trim()
    .refine(isYouTubeUrl, "Informe uma URL válida do YouTube."),
});

export const blogBlockSchema = z.discriminatedUnion("type", [
  blogParagraphBlockSchema,
  blogImageBlockSchema,
  blogVideoBlockSchema,
]);

export const blogBlocksArraySchema = z.array(blogBlockSchema);

export const blogBlocksSchema = blogBlocksArraySchema.superRefine(
  (blocks, ctx) => {
    if (blocks.length === 0) {
      ctx.addIssue({
        code: "custom",
        message: "Adicione ao menos um bloco ao post.",
      });
      return;
    }

    if (!blocks.some((block) => block.type === "paragraph")) {
      ctx.addIssue({
        code: "custom",
        message: REQUIRED_PARAGRAPH_ERROR,
      });
    }
  },
);

export type BlogParagraphBlock = {
  id: string;
  type: "paragraph";
  title: { pt: string | null; en: string | null; es: string | null };
  body: {
    pt: RichTextDocument;
    en: RichTextDocument | null;
    es: RichTextDocument | null;
  };
};
export type BlogImageBlock = z.infer<typeof blogImageBlockSchema>;
export type BlogVideoBlock = z.infer<typeof blogVideoBlockSchema>;
export type BlogBlock = BlogParagraphBlock | BlogImageBlock | BlogVideoBlock;
export type BlogBlocks = BlogBlock[];

export function emptyLocalizedText(pt: string | null = null) {
  return { pt, en: null as string | null, es: null as string | null };
}

export function createParagraphBlock(): BlogParagraphBlock {
  return {
    id: crypto.randomUUID(),
    type: "paragraph",
    title: emptyLocalizedText(),
    body: {
      pt: emptyRichTextDocument,
      en: null,
      es: null,
    },
  };
}

export function createImageBlock(storagePath = ""): BlogImageBlock {
  return {
    id: crypto.randomUUID(),
    type: "image",
    storagePath,
    caption: emptyLocalizedText(),
  };
}

export function createVideoBlock(): BlogVideoBlock {
  return {
    id: crypto.randomUUID(),
    type: "video",
    youtubeUrl: "",
  };
}

export function parseBlogBlocksInput(raw: FormDataEntryValue | null) {
  if (typeof raw !== "string" || raw.trim().length === 0) {
    return {
      ok: false as const,
      error: "Adicione ao menos um bloco ao post.",
    };
  }

  let parsed: unknown;

  try {
    parsed = JSON.parse(raw);
  } catch {
    return { ok: false as const, error: "Blocos do post inválidos." };
  }

  const result = blogBlocksSchema.safeParse(parsed);

  if (!result.success) {
    return {
      ok: false as const,
      error: result.error.issues[0]?.message ?? "Blocos do post inválidos.",
    };
  }

  return { ok: true as const, data: result.data as BlogBlocks };
}

export function parseBlogBlocks(raw: unknown): BlogBlocks {
  const result = blogBlocksArraySchema.safeParse(raw);
  return result.success ? (result.data as BlogBlocks) : [];
}

export function getBlogPreviewExcerpt(
  blocks: BlogBlocks,
  locale: Locale,
  maxChars = BLOG_PREVIEW_EXCERPT_CHARS,
) {
  const paragraph = blocks.find((block) => block.type === "paragraph");
  if (!paragraph) {
    return "";
  }

  const text = richTextToPlainText(
    localizeRichTextBody(paragraph.body, locale),
  );
  if (!text) {
    return "";
  }

  if (text.length <= maxChars) {
    return text;
  }

  const sliced = text.slice(0, maxChars);
  const lastSpace = sliced.lastIndexOf(" ");
  const clipped = (
    lastSpace > 40 ? sliced.slice(0, lastSpace) : sliced
  ).trimEnd();
  return `${clipped}…`;
}

export function localizeBlogText(
  value: { pt: string | null; en: string | null; es: string | null },
  locale: Locale,
) {
  if (locale === "pt") {
    return value.pt ?? "";
  }

  return value[locale] || value.pt || "";
}

export type LocalizedBlogParagraphBlock = {
  id: string;
  type: "paragraph";
  title: string;
  body: RichTextDocument;
};

export type LocalizedBlogImageBlock = {
  id: string;
  type: "image";
  storagePath: string;
  caption: string;
};

export type LocalizedBlogVideoBlock = {
  id: string;
  type: "video";
  youtubeUrl: string;
};

export type LocalizedBlogBlock =
  | LocalizedBlogParagraphBlock
  | LocalizedBlogImageBlock
  | LocalizedBlogVideoBlock;

function localizeRichTextBody(
  body: BlogParagraphBlock["body"],
  locale: Locale,
): RichTextDocument {
  if (locale === "pt") {
    return body.pt;
  }

  return body[locale] ?? body.pt;
}

export function resolveBlogBlocksForLocale(
  blocks: BlogBlocks,
  locale: Locale,
): LocalizedBlogBlock[] {
  return blocks.map((block) => {
    if (block.type === "paragraph") {
      return {
        id: block.id,
        type: "paragraph",
        title: localizeBlogText(block.title, locale),
        body: localizeRichTextBody(block.body, locale),
      };
    }

    if (block.type === "image") {
      return {
        id: block.id,
        type: "image",
        storagePath: block.storagePath,
        caption: localizeBlogText(block.caption, locale),
      };
    }

    return {
      id: block.id,
      type: "video",
      youtubeUrl: block.youtubeUrl,
    };
  });
}

export { richTextDocumentSchema };
