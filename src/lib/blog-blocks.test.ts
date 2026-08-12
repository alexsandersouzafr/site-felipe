import { describe, expect, it } from "vitest";

import {
  blogBlocksSchema,
  localizeBlogText,
  parseBlogBlocksInput,
} from "./blog-blocks";
import { textToRichTextDocument } from "./rich-text";

describe("blogBlocksSchema", () => {
  it("accepts a mixed block list", () => {
    const result = blogBlocksSchema.safeParse([
      {
        id: "1",
        type: "paragraph",
        title: { pt: "Intro", en: null, es: null },
        body: {
          pt: textToRichTextDocument("Texto"),
          en: null,
          es: null,
        },
      },
      {
        id: "2",
        type: "image",
        storagePath: "blog/photo.jpg",
        caption: { pt: "Legenda", en: null, es: null },
      },
      {
        id: "3",
        type: "video",
        youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      },
    ]);

    expect(result.success).toBe(true);
  });

  it("coerces plain-string paragraph bodies", () => {
    const result = blogBlocksSchema.safeParse([
      {
        id: "1",
        type: "paragraph",
        title: { pt: null, en: null, es: null },
        body: { pt: "Olá mundo", en: null, es: null },
      },
    ]);

    expect(result.success).toBe(true);
  });

  it("rejects paragraph without portuguese body", () => {
    const result = blogBlocksSchema.safeParse([
      {
        id: "1",
        type: "paragraph",
        title: { pt: null, en: null, es: null },
        body: { pt: "", en: null, es: null },
      },
    ]);

    expect(result.success).toBe(false);
  });
});

describe("parseBlogBlocksInput", () => {
  it("parses a valid json payload", () => {
    const payload = JSON.stringify([
      {
        id: "1",
        type: "paragraph",
        title: { pt: null, en: null, es: null },
        body: {
          pt: textToRichTextDocument("Olá"),
          en: null,
          es: null,
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
});

describe("localizeBlogText", () => {
  it("falls back to portuguese", () => {
    expect(localizeBlogText({ pt: "PT", en: null, es: null }, "en")).toBe("PT");
  });
});
