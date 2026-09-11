import { describe, expect, it } from "vitest";

import {
  type BlogBlocks,
  blogBlocksSchema,
  getBlogPreviewExcerpt,
  localizeBlogText,
  parseBlogBlocksInput,
  REQUIRED_PARAGRAPH_ERROR,
  resolveBlogBlocksForLocale,
} from "./blog-blocks";
import { textToRichTextDocument } from "./rich-text";

describe("blogBlocksSchema", () => {
  it("accepts a mixed block list", () => {
    const result = blogBlocksSchema.safeParse([
      {
        id: "1",
        type: "paragraph",
        title: { pt: "Intro", en: null, fr: null },
        body: {
          pt: textToRichTextDocument("Texto"),
          en: null,
          fr: null,
        },
      },
      {
        id: "2",
        type: "image",
        storagePath: "blog/photo.jpg",
        caption: { pt: "Legenda", en: null, fr: null },
      },
      {
        id: "3",
        type: "video",
        youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      },
      {
        id: "4",
        type: "audio",
        provider: "spotify",
        url: "https://open.spotify.com/track/abc123",
      },
    ]);

    expect(result.success).toBe(true);
  });

  it("rejects an audio block whose URL doesn't match the provider", () => {
    const result = blogBlocksSchema.safeParse([
      {
        id: "1",
        type: "paragraph",
        title: { pt: null, en: null, fr: null },
        body: { pt: textToRichTextDocument("Olá"), en: null, fr: null },
      },
      {
        id: "2",
        type: "audio",
        provider: "spotify",
        url: "https://soundcloud.com/artista/faixa",
      },
    ]);

    expect(result.success).toBe(false);
  });

  it("coerces plain-string paragraph bodies", () => {
    const result = blogBlocksSchema.safeParse([
      {
        id: "1",
        type: "paragraph",
        title: { pt: null, en: null, fr: null },
        body: { pt: "Olá mundo", en: null, fr: null },
      },
    ]);

    expect(result.success).toBe(true);
  });

  it("rejects paragraph without portuguese body", () => {
    const result = blogBlocksSchema.safeParse([
      {
        id: "1",
        type: "paragraph",
        title: { pt: null, en: null, fr: null },
        body: { pt: "", en: null, fr: null },
      },
    ]);

    expect(result.success).toBe(false);
  });

  it("rejects a list without any paragraph block", () => {
    const result = blogBlocksSchema.safeParse([
      {
        id: "2",
        type: "image",
        storagePath: "blog/photo.jpg",
        caption: { pt: "Legenda", en: null, fr: null },
      },
    ]);

    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toBe(REQUIRED_PARAGRAPH_ERROR);
  });
});

describe("parseBlogBlocksInput", () => {
  it("parses a valid json payload", () => {
    const payload = JSON.stringify([
      {
        id: "1",
        type: "paragraph",
        title: { pt: null, en: null, fr: null },
        body: {
          pt: textToRichTextDocument("Olá"),
          en: null,
          fr: null,
        },
      },
    ]);

    expect(parseBlogBlocksInput(payload).ok).toBe(true);
  });

  it("rejects an empty list", () => {
    expect(parseBlogBlocksInput("[]")).toEqual({
      ok: false,
      error: "Adicione ao menos um bloco ao post.",
    });
  });

  it("rejects image-only posts", () => {
    const payload = JSON.stringify([
      {
        id: "2",
        type: "image",
        storagePath: "blog/photo.jpg",
        caption: { pt: "Legenda", en: null, fr: null },
      },
    ]);

    expect(parseBlogBlocksInput(payload)).toEqual({
      ok: false,
      error: REQUIRED_PARAGRAPH_ERROR,
    });
  });
});

describe("getBlogPreviewExcerpt", () => {
  it("returns plain text from the first paragraph for the locale", () => {
    const blocks = [
      {
        id: "1",
        type: "paragraph" as const,
        title: { pt: null, en: null, fr: null },
        body: {
          pt: textToRichTextDocument(
            "Primeira linha do texto com conteúdo suficiente para a prévia do blog.",
          ),
          en: textToRichTextDocument("First line of English preview text."),
          fr: null,
        },
      },
    ] satisfies BlogBlocks;

    expect(getBlogPreviewExcerpt(blocks, "en")).toBe(
      "First line of English preview text.",
    );
    expect(getBlogPreviewExcerpt(blocks, "fr")).toContain("Primeira linha");
  });

  it("truncates long excerpts", () => {
    const long = "palavra ".repeat(80).trim();
    const blocks = [
      {
        id: "1",
        type: "paragraph" as const,
        title: { pt: null, en: null, fr: null },
        body: {
          pt: textToRichTextDocument(long),
          en: null,
          fr: null,
        },
      },
    ] satisfies BlogBlocks;

    const excerpt = getBlogPreviewExcerpt(blocks, "pt", 80);
    expect(excerpt.endsWith("…")).toBe(true);
    expect(excerpt.length).toBeLessThanOrEqual(82);
  });
});

describe("localizeBlogText", () => {
  it("falls back to portuguese", () => {
    expect(localizeBlogText({ pt: "PT", en: null, fr: null }, "en")).toBe("PT");
  });
});

describe("resolveBlogBlocksForLocale", () => {
  const blocks = [
    {
      id: "1",
      type: "paragraph" as const,
      title: { pt: "Título PT", en: "Title EN", fr: null },
      body: {
        pt: textToRichTextDocument("Corpo PT"),
        en: textToRichTextDocument("Body EN"),
        fr: null,
      },
    },
    {
      id: "2",
      type: "image" as const,
      storagePath: "blog/a.jpg",
      caption: { pt: "Legenda PT", en: null, fr: null },
    },
  ] satisfies BlogBlocks;

  it("uses the requested locale when present", () => {
    const resolved = resolveBlogBlocksForLocale(blocks, "en");
    expect(resolved[0]).toMatchObject({
      type: "paragraph",
      title: "Title EN",
    });
    expect(resolved[1]).toMatchObject({
      type: "image",
      caption: "Legenda PT",
    });
  });

  it("falls back to portuguese for missing translations", () => {
    const resolved = resolveBlogBlocksForLocale(blocks, "fr");
    expect(resolved[0]).toMatchObject({
      type: "paragraph",
      title: "Título PT",
    });
  });
});
