"use client";

import { DownloadSimpleIcon } from "@phosphor-icons/react";
import { useState } from "react";

import { LoadingImage } from "@/components/loading-image";
import {
  ImageLightbox,
  type LightboxLabels,
} from "@/components/public/image-lightbox";
import type { PublicPressPhoto } from "@/lib/public/press";
import { cn } from "@/lib/utils";

type PressGalleryLabels = LightboxLabels & {
  download: string;
};

const SHAPES = {
  portrait: "aspect-[3/4]",
  landscape: "aspect-[4/3]",
} as const;

/**
 * A grid of press photos with credits. Clicking one opens it large in a
 * lightbox (arrow keys or buttons to move between photos); every photo also
 * offers the original, high-resolution file for download.
 */
export function PressGallery({
  photos,
  shape,
  labels,
}: {
  photos: PublicPressPhoto[];
  shape: keyof typeof SHAPES;
  labels: PressGalleryLabels;
}) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <>
      <ul className="grid gap-x-5 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
        {photos.map((photo, index) => (
          <li key={photo.id}>
            <figure>
              <button
                type="button"
                onClick={() => setOpenIndex(index)}
                aria-label={`${labels.open}: ${photo.alt}`}
                className={cn(
                  "group relative block w-full cursor-zoom-in overflow-hidden bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                  SHAPES[shape],
                )}
              >
                <LoadingImage
                  src={photo.src ?? ""}
                  alt={photo.alt}
                  fill
                  className="object-cover transition-[opacity,scale] duration-500 group-hover:scale-[1.03]"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
              </button>
              <figcaption className="mt-3 space-y-1 text-center text-sm text-muted-foreground">
                {photo.credit ? <p>© {photo.credit}</p> : null}
                {photo.downloadUrl ? (
                  <a
                    href={photo.downloadUrl}
                    className="inline-flex items-center gap-1.5 text-xs tracking-wider uppercase transition-colors hover:text-foreground"
                  >
                    <DownloadSimpleIcon className="size-3.5" />
                    {labels.download}
                  </a>
                ) : null}
              </figcaption>
            </figure>
          </li>
        ))}
      </ul>

      <ImageLightbox
        photos={photos}
        openIndex={openIndex}
        onOpenIndexChange={setOpenIndex}
        labels={labels}
        caption={(photo) => (
          <>
            {photo.credit ? <p>© {photo.credit}</p> : null}
            {photo.downloadUrl ? (
              <a
                href={photo.downloadUrl}
                className="inline-flex items-center gap-1.5 text-xs tracking-wider uppercase text-white transition-colors hover:text-white/70"
              >
                <DownloadSimpleIcon className="size-4" />
                {labels.download}
              </a>
            ) : null}
          </>
        )}
      />
    </>
  );
}
