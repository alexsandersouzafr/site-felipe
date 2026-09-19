"use client";

import {
  CaretLeftIcon,
  CaretRightIcon,
  DownloadSimpleIcon,
  XIcon,
} from "@phosphor-icons/react";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { Dialog, Modal, ModalOverlay } from "react-aria-components";

import type { PublicPressPhoto } from "@/lib/public/press";
import { cn } from "@/lib/utils";

type PressGalleryLabels = {
  open: string;
  close: string;
  previous: string;
  next: string;
  download: string;
};

const SHAPES = {
  portrait: "aspect-[3/4]",
  landscape: "aspect-[4/3]",
} as const;

const iconButtonClassName =
  "inline-flex size-11 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:outline-none";

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
  const isOpen = openIndex !== null;
  const current = openIndex === null ? null : photos[openIndex];

  const photoCount = photos.length;
  const move = useCallback(
    (step: 1 | -1) => {
      setOpenIndex((index) =>
        index === null ? null : (index + step + photoCount) % photoCount,
      );
    },
    [photoCount],
  );

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    // Arrow keys work wherever the focus is inside the lightbox.
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "ArrowLeft") {
        move(-1);
      } else if (event.key === "ArrowRight") {
        move(1);
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isOpen, move]);

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
                <Image
                  src={photo.src ?? ""}
                  alt={photo.alt}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
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

      <ModalOverlay
        isOpen={isOpen}
        onOpenChange={(open) => {
          if (!open) {
            setOpenIndex(null);
          }
        }}
        isDismissable
        className="fixed inset-0 z-50 bg-black/95 data-entering:animate-in data-entering:fade-in data-exiting:animate-out data-exiting:fade-out"
      >
        <Modal className="fixed inset-0 outline-none">
          <Dialog
            aria-label={current?.alt ?? labels.open}
            className="flex h-full flex-col outline-none"
          >
            {({ close }) => (
              <>
                <div className="flex justify-end p-4">
                  <button
                    type="button"
                    onClick={close}
                    aria-label={labels.close}
                    className={iconButtonClassName}
                  >
                    <XIcon className="size-5" />
                  </button>
                </div>

                <div className="relative mx-auto min-h-0 w-full max-w-6xl flex-1 px-2 sm:px-16">
                  {current?.src ? (
                    <Image
                      key={current.id}
                      src={current.src}
                      alt={current.alt}
                      fill
                      sizes="100vw"
                      className="object-contain sm:px-16"
                    />
                  ) : null}
                  {photos.length > 1 ? (
                    <>
                      <button
                        type="button"
                        onClick={() => move(-1)}
                        aria-label={labels.previous}
                        className={cn(
                          iconButtonClassName,
                          "absolute top-1/2 left-2 -translate-y-1/2",
                        )}
                      >
                        <CaretLeftIcon className="size-5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => move(1)}
                        aria-label={labels.next}
                        className={cn(
                          iconButtonClassName,
                          "absolute top-1/2 right-2 -translate-y-1/2",
                        )}
                      >
                        <CaretRightIcon className="size-5" />
                      </button>
                    </>
                  ) : null}
                </div>

                <div className="flex flex-col items-center gap-2 p-4 text-sm text-white/80">
                  {current?.credit ? <p>© {current.credit}</p> : null}
                  {current?.downloadUrl ? (
                    <a
                      href={current.downloadUrl}
                      className="inline-flex items-center gap-1.5 text-xs tracking-wider uppercase text-white transition-colors hover:text-white/70"
                    >
                      <DownloadSimpleIcon className="size-4" />
                      {labels.download}
                    </a>
                  ) : null}
                </div>
              </>
            )}
          </Dialog>
        </Modal>
      </ModalOverlay>
    </>
  );
}
