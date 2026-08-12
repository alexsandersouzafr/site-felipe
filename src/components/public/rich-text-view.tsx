import type { RichTextDocument } from "@/lib/rich-text";
import { richTextToHtml } from "@/lib/rich-text-html";
import { cn } from "@/lib/utils";

type RichTextViewProps = {
  document: RichTextDocument;
  className?: string;
};

export function RichTextView({ document, className }: RichTextViewProps) {
  const html = richTextToHtml(document);

  return (
    <div
      className={cn(
        "prose prose-neutral max-w-none dark:prose-invert prose-headings:font-heading prose-headings:tracking-tight prose-a:text-primary",
        className,
      )}
      // biome-ignore lint/security/noDangerouslySetInnerHtml: TipTap JSON rendered via generateHTML
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
