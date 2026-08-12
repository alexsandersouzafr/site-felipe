import Image from "next/image";

import { RichTextView } from "@/components/public/rich-text-view";
import type { LocalizedBlogBlock } from "@/lib/blog-blocks";
import { mediaPublicUrl } from "@/lib/media-url";
import { extractYouTubeId } from "@/lib/youtube";

type BlogBlocksViewProps = {
  blocks: LocalizedBlogBlock[];
};

export function BlogBlocksView({ blocks }: BlogBlocksViewProps) {
  return (
    <div className="space-y-12">
      {blocks.map((block) => {
        if (block.type === "paragraph") {
          return (
            <div key={block.id} className="space-y-4">
              {block.title ? (
                <h2 className="font-heading text-2xl tracking-tight sm:text-3xl">
                  {block.title}
                </h2>
              ) : null}
              <RichTextView document={block.body} />
            </div>
          );
        }

        if (block.type === "image") {
          const src = mediaPublicUrl(block.storagePath);
          if (!src) {
            return null;
          }

          return (
            <figure key={block.id} className="space-y-3">
              <div className="relative aspect-[16/10] w-full overflow-hidden bg-muted">
                <Image
                  src={src}
                  alt={block.caption || ""}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 720px"
                />
              </div>
              {block.caption ? (
                <figcaption className="text-sm text-muted-foreground">
                  {block.caption}
                </figcaption>
              ) : null}
            </figure>
          );
        }

        const youtubeId = extractYouTubeId(block.youtubeUrl);
        if (!youtubeId) {
          return null;
        }

        return (
          <div key={block.id} className="aspect-video w-full overflow-hidden bg-muted">
            <iframe
              title={block.youtubeUrl}
              src={`https://www.youtube-nocookie.com/embed/${youtubeId}`}
              className="size-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        );
      })}
    </div>
  );
}
