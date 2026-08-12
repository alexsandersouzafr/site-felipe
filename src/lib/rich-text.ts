import { z } from "zod";

export type RichTextDocument = {
  type: "doc";
  content?: Array<Record<string, unknown>>;
};

export const emptyRichTextDocument: RichTextDocument = {
  type: "doc",
  content: [{ type: "paragraph" }],
};

export const richTextDocumentSchema = z.object({
  type: z.literal("doc"),
  content: z.array(z.record(z.string(), z.unknown())).optional(),
});

export function parseRichTextInput(value: FormDataEntryValue | null) {
  if (typeof value !== "string" || value.trim().length === 0) {
    return emptyRichTextDocument;
  }

  try {
    const parsed = JSON.parse(value) as unknown;
    const result = richTextDocumentSchema.safeParse(parsed);
    return result.success ? result.data : emptyRichTextDocument;
  } catch {
    return emptyRichTextDocument;
  }
}

export function isRichTextEmpty(document: RichTextDocument) {
  const content = document.content ?? [];

  if (content.length === 0) {
    return true;
  }

  return content.every((node) => {
    if (node.type !== "paragraph") {
      return false;
    }

    const children = Array.isArray(node.content) ? node.content : [];
    return children.every((child) => {
      if (
        typeof child === "object" &&
        child !== null &&
        "text" in child &&
        typeof child.text === "string"
      ) {
        return child.text.trim().length === 0;
      }

      return true;
    });
  });
}
