"use client";

import { type ComponentProps, useEffect, useRef, useState } from "react";

import type { SiteFrame } from "@/lib/site-frames";
import { HOME_HERO_OVERLAY, PAGE_HERO_VEIL } from "@/lib/site-overlays";
import { cn } from "@/lib/utils";

const OVERLAYS: Record<NonNullable<SiteFrame["overlay"]>, string> = {
  homeHero: HOME_HERO_OVERLAY,
  pageCover: PAGE_HERO_VEIL.default,
  pageCoverStrong: PAGE_HERO_VEIL.strong,
};

const WIDTHS: Record<SiteFrame["device"], string> = {
  desktop: "w-full min-w-0 sm:flex-[3]",
  phone: "w-28 shrink-0 sm:w-32",
  card: "w-36 shrink-0 sm:w-44",
};

/**
 * A saved photo goes through the site's own image optimizer: the original can
 * be 40 MB, and a preview needs a fraction of it. A file just picked is a blob:
 * URL and is shown as it is.
 */
export function previewImageSrc(src: string) {
  return /^https?:/.test(src)
    ? `/_next/image?url=${encodeURIComponent(src)}&w=1920&q=75`
    : src;
}

/**
 * The optimized photo, or the original when the optimizer gives up: it stops
 * after 7 s, which a 40 MB original on a slow connection can take, and a
 * preview is better slow than blank.
 */
export function PreviewImage({
  src,
  alt,
  className,
  ...props
}: { src: string; alt: string } & Omit<ComponentProps<"img">, "src" | "alt">) {
  const [failedFor, setFailedFor] = useState<string | null>(null);
  const [loadedFor, setLoadedFor] = useState<string | null>(null);
  const optimized = previewImageSrc(src);
  const current = failedFor === src ? src : optimized;
  const ref = useRef<HTMLImageElement>(null);

  // A photo already in the cache can finish before React is listening.
  useEffect(() => {
    const image = ref.current;

    if (image?.complete && image.naturalWidth > 0) {
      setLoadedFor(current);
    }
  }, [current]);

  return (
    // biome-ignore lint/performance/noImgElement: the photo may be a blob: URL of a file that is not uploaded yet, which next/image cannot load
    <img
      {...props}
      ref={ref}
      src={current}
      alt={alt}
      // Hidden until whole, like the site's photos; the frame pulses meanwhile.
      className={cn(
        "transition-opacity duration-500",
        loadedFor !== current && "image-loading",
        className,
      )}
      onLoad={() => setLoadedFor(current)}
      onError={() => {
        if (current !== src) {
          setFailedFor(src);
          return;
        }

        setLoadedFor(current);
      }}
    />
  );
}

function percent(part: number, whole: number) {
  return `${(part / whole) * 100}%`;
}

/**
 * The photo cut the way the public site cuts it, on each screen it appears on:
 * same proportions, same overflow for the parallax photos, same shading.
 */
export function SitePreview({
  src,
  focus,
  frames,
}: {
  src: string | null;
  focus: string;
  frames: readonly SiteFrame[];
}) {
  if (!src) {
    return null;
  }

  return (
    <div className="space-y-2">
      <p className="text-xs font-medium text-muted-foreground">
        Como vai aparecer no site
      </p>
      <div className="flex flex-wrap items-end gap-3">
        {frames.map((frame) => {
          const image = frame.image ?? {
            top: 0,
            height: frame.height,
            scale: 1,
          };

          return (
            <figure key={frame.label} className={WIDTHS[frame.device]}>
              <div
                className="relative w-full overflow-hidden rounded-lg border border-border/80 bg-muted has-[.image-loading]:animate-skeleton"
                style={{ aspectRatio: `${frame.width} / ${frame.height}` }}
              >
                <PreviewImage
                  src={src}
                  alt=""
                  className={cn(
                    "absolute inset-x-0 w-full max-w-none",
                    frame.fit === "contain"
                      ? "object-contain p-[4%]"
                      : "object-cover",
                  )}
                  style={{
                    top: percent(image.top, frame.height),
                    height: percent(image.height, frame.height),
                    objectPosition: frame.focus ?? focus,
                    transform:
                      image.scale === 1 ? undefined : `scale(${image.scale})`,
                  }}
                />
                {frame.overlay ? (
                  <div
                    className={cn(
                      "pointer-events-none absolute inset-0",
                      OVERLAYS[frame.overlay],
                    )}
                  />
                ) : null}
              </div>
              <figcaption className="mt-1.5 text-xs text-muted-foreground">
                {frame.label}
              </figcaption>
            </figure>
          );
        })}
      </div>
    </div>
  );
}
