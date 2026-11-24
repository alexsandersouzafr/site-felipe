"use client";

import { useState } from "react";

import { LoadingImage } from "@/components/loading-image";
import {
  ImageLightbox,
  type LightboxLabels,
} from "@/components/public/image-lightbox";
import type { PublicPhoto } from "@/lib/public/media";

/**
 * The gallery shows every photo whole, smaller where it has to be, on a square
 * mat so portraits and landscapes still line up; a click opens it full size.
 */
export function PhotoGallery({
  photos,
  labels,
}: {
  photos: PublicPhoto[];
  labels: LightboxLabels & { credit: string };
}) {
  const shown = photos.filter((photo) => photo.src);
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <>
      <ul className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
        {shown.map((photo, index) => (
          <li key={photo.id}>
            <figure>
              <button
                type="button"
                onClick={() => setOpenIndex(index)}
                aria-label={
                  photo.alt ? `${labels.open}: ${photo.alt}` : labels.open
                }
                className="group relative block aspect-square w-full cursor-zoom-in overflow-hidden bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
              >
                <LoadingImage
                  src={photo.src ?? ""}
                  alt={photo.alt}
                  fill
                  className="object-contain p-3 transition-[opacity,scale] duration-500 group-hover:scale-[1.03] sm:p-4"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
              </button>
              {photo.credit || photo.alt ? (
                <figcaption className="mt-2 text-xs text-muted-foreground">
                  {photo.credit
                    ? `${labels.credit}: ${photo.credit}`
                    : photo.alt}
                </figcaption>
              ) : null}
            </figure>
          </li>
        ))}
      </ul>

      <ImageLightbox
        photos={shown}
        openIndex={openIndex}
        onOpenIndexChange={setOpenIndex}
        labels={labels}
        caption={(photo) =>
          photo.credit ? (
            <p>
              {labels.credit}: {photo.credit}
            </p>
          ) : photo.alt ? (
            <p>{photo.alt}</p>
          ) : null
        }
      />
    </>
  );
}
