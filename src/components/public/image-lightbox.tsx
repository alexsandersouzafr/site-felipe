"use client";

import { CaretLeftIcon, CaretRightIcon, XIcon } from "@phosphor-icons/react";
import { type ReactNode, useCallback, useEffect } from "react";
import { Dialog, Modal, ModalOverlay } from "react-aria-components";

import { LoadingImage } from "@/components/loading-image";
import { cn } from "@/lib/utils";

export type LightboxPhoto = {
  id: string;
  src: string | null;
  alt: string;
};

export type LightboxLabels = {
  open: string;
  close: string;
  previous: string;
  next: string;
};

export const lightboxIconButtonClassName =
  "inline-flex size-11 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:outline-none";

/**
 * One photo at a time over a dark backdrop, whole and as large as the screen
 * allows, with arrow keys or buttons to move through the set.
 */
export function ImageLightbox<T extends LightboxPhoto>({
  photos,
  openIndex,
  onOpenIndexChange,
  labels,
  caption,
}: {
  photos: T[];
  openIndex: number | null;
  onOpenIndexChange: (index: number | null) => void;
  labels: LightboxLabels;
  /** What goes under the open photo: a credit, a download link. */
  caption?: (photo: T) => ReactNode;
}) {
  const isOpen = openIndex !== null;
  const current = openIndex === null ? null : photos[openIndex];
  const photoCount = photos.length;

  const move = useCallback(
    (step: 1 | -1) => {
      if (openIndex !== null) {
        onOpenIndexChange((openIndex + step + photoCount) % photoCount);
      }
    },
    [openIndex, onOpenIndexChange, photoCount],
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
    <ModalOverlay
      isOpen={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          onOpenIndexChange(null);
        }
      }}
      isDismissable
      className="fixed inset-0 z-50 bg-black/95 data-entering:animate-in data-entering:fade-in data-exiting:animate-out data-exiting:fade-out"
    >
      <Modal className="fixed inset-0 outline-none">
        <Dialog
          aria-label={current?.alt || labels.open}
          className="flex h-full flex-col outline-none"
        >
          {({ close }) => (
            <>
              <div className="flex justify-end p-4">
                <button
                  type="button"
                  onClick={close}
                  aria-label={labels.close}
                  className={lightboxIconButtonClassName}
                >
                  <XIcon className="size-5" />
                </button>
              </div>

              <div className="relative mx-auto min-h-0 w-full max-w-6xl flex-1 px-2 sm:px-16">
                {current?.src ? (
                  <LoadingImage
                    key={current.id}
                    skeletonClassName="bg-white/10"
                    src={current.src}
                    alt={current.alt}
                    fill
                    sizes="100vw"
                    className="object-contain sm:px-16"
                  />
                ) : null}
                {photoCount > 1 ? (
                  <>
                    <button
                      type="button"
                      onClick={() => move(-1)}
                      aria-label={labels.previous}
                      className={cn(
                        lightboxIconButtonClassName,
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
                        lightboxIconButtonClassName,
                        "absolute top-1/2 right-2 -translate-y-1/2",
                      )}
                    >
                      <CaretRightIcon className="size-5" />
                    </button>
                  </>
                ) : null}
              </div>

              <div className="flex min-h-14 flex-col items-center gap-2 p-4 text-sm text-white/80">
                {current && caption ? caption(current) : null}
              </div>
            </>
          )}
        </Dialog>
      </Modal>
    </ModalOverlay>
  );
}
