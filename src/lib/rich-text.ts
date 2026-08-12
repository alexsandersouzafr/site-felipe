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

export function textToRichTextDocument(text: string): RichTextDocument {
  const trimmed = text.trim();
  if (!trimmed) {
    return emptyRichTextDocument;
  }

  return {
    type: "doc",
    content: [
      {
        type: "paragraph",
        content: [{ type: "text", text: trimmed }],
      },
    ],
  };
}

export function coerceRichTextDocument(value: unknown): RichTextDocument {
  if (typeof value === "string") {
    return textToRichTextDocument(value);
  }

  const result = richTextDocumentSchema.safeParse(value);
  return result.success ? result.data : emptyRichTextDocument;
}

export function parseRichTextInput(value: FormDataEntryValue | null) {
  if (typeof value !== "string" || value.trim().length === 0) {
    return emptyRichTextDocument;
  }

  try {
    return coerceRichTextDocument(JSON.parse(value) as unknown);
  } catch {
    return textToRichTextDocument(value);
  }
}

function nodeHasVisibleText(node: unknown): boolean {
  if (!node || typeof node !== "object") {
    return false;
  }

  const record = node as Record<string, unknown>;

  if (typeof record.text === "string" && record.text.trim().length > 0) {
    return true;
  }

  if (Array.isArray(record.content)) {
    return record.content.some((child) => nodeHasVisibleText(child));
  }

  return false;
}

export function isRichTextEmpty(document: RichTextDocument) {
  const content = document.content ?? [];
  if (content.length === 0) {
    return true;
  }

  return !content.some((node) => nodeHasVisibleText(node));
}
