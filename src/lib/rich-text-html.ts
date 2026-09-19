import { generateHTML } from "@tiptap/html";
import StarterKit from "@tiptap/starter-kit";

import type { RichTextDocument } from "@/lib/rich-text";

const publicRichTextExtensions = [
  StarterKit.configure({
    heading: { levels: [2, 3] },
  }),
];

export function richTextToHtml(document: RichTextDocument) {
  return generateHTML(document, publicRichTextExtensions);
}
