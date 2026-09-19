import { describe, expect, it } from "vitest";

import type { RichTextDocument } from "@/lib/rich-text";

import { richTextToHtml } from "./rich-text-html";

const documentWith = (
  marks: Array<{ type: string }>,
  text = "destaque",
): RichTextDocument => ({
  type: "doc",
  content: [{ type: "paragraph", content: [{ type: "text", text, marks }] }],
});

describe("richTextToHtml", () => {
  it("renders underline, which comes with StarterKit", () => {
    expect(richTextToHtml(documentWith([{ type: "underline" }]))).toBe(
      "<p><u>destaque</u></p>",
    );
  });

  it("keeps the other inline marks", () => {
    const html = richTextToHtml(
      documentWith([{ type: "bold" }, { type: "italic" }]),
    );

    expect(html).toContain("<strong>");
    expect(html).toContain("<em>");
  });
});
