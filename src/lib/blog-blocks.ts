import { z } from "zod";

import {
  coerceRichTextDocument,
  emptyRichTextDocument,
  isRichTextEmpty,
  type RichTextDocument,
  richTextDocumentSchema,
} from "@/lib/rich-text";
import { isYouTubeUrl } from "@/lib/youtube";

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

export const blogBlocksSchema = z.array(blogBlockSchema);

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

  if (result.data.length === 0) {
    return {
      ok: false as const,
      error: "Adicione ao menos um bloco ao post.",
    };
  }

  return { ok: true as const, data: result.data as BlogBlocks };
}

export function localizeBlogText(
  value: { pt: string | null; en: string | null; es: string | null },
  locale: "pt" | "en" | "es",
) {
  if (locale === "pt") {
    return value.pt ?? "";
  }

  return value[locale] || value.pt || "";
}

export { richTextDocumentSchema };
