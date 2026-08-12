import Underline from "@tiptap/extension-underline";
import { generateHTML } from "@tiptap/html";
import StarterKit from "@tiptap/starter-kit";

import type { RichTextDocument } from "@/lib/rich-text";

const publicRichTextExtensions = [
  StarterKit.configure({
    heading: { levels: [2, 3] },
  }),
  Underline,
];

export function richTextToHtml(document: RichTextDocument) {
  return generateHTML(document, publicRichTextExtensions);
}
