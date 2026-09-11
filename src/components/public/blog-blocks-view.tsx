import { MusicNotesIcon } from "@phosphor-icons/react/dist/ssr";
import Image from "next/image";

import { RichTextView } from "@/components/public/rich-text-view";
import {
  AUDIO_PROVIDER_LABELS,
  soundcloudEmbedUrl,
  spotifyEmbedUrl,
} from "@/lib/audio-embed";
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

        if (block.type === "audio") {
          if (block.provider === "spotify") {
            const embedUrl = spotifyEmbedUrl(block.url);
            if (!embedUrl) {
              return null;
            }

            return (
              <div key={block.id} className="w-full overflow-hidden rounded-2xl">
                <iframe
                  title={`Spotify - ${block.url}`}
                  src={embedUrl}
                  className="h-[152px] w-full"
                  allow="encrypted-media"
                  loading="lazy"
                />
              </div>
            );
          }

          if (block.provider === "soundcloud") {
            return (
              <div key={block.id} className="w-full overflow-hidden rounded-2xl">
                <iframe
                  title={`SoundCloud - ${block.url}`}
                  src={soundcloudEmbedUrl(block.url)}
                  className="h-[166px] w-full"
                  allow="autoplay"
                  loading="lazy"
                />
              </div>
            );
          }

          return (
            <a
              key={block.id}
              href={block.url}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-3 rounded-2xl border border-border/80 p-4 transition-colors hover:bg-muted"
            >
              <MusicNotesIcon className="size-6 shrink-0 text-muted-foreground" />
              <span className="text-sm">
                Ouvir no {AUDIO_PROVIDER_LABELS[block.provider]}
              </span>
            </a>
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
