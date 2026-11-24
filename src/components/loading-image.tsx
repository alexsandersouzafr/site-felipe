"use client";

import Image, { type ImageProps } from "next/image";
import { useState } from "react";

import { cn } from "@/lib/utils";

/**
 * next/image that holds a pulsing placeholder in its place until the photo has
 * arrived whole, then fades it in: a half-drawn photo never shows. The photo is
 * only hidden while JavaScript runs (`html.js .image-loading`), so without it
 * photos still appear as they load.
 *
 * When the optimizer gives up on a photo (it stops after 7 s, which a large
 * original on a slow link can take), the original is loaded instead: slower,
 * but never a broken image.
 *
 * With `fill` it sits in the parent's box, as next/image does; with a fixed
 * size it wraps itself in a box of that size.
 */
export function LoadingImage({
  className,
  skeletonClassName,
  wrapperClassName,
  onLoad,
  onError,
  ...props
}: ImageProps & {
  /** Tints the placeholder, e.g. for a dark backdrop. */
  skeletonClassName?: string;
  /** Rounding and sizing for the box of a fixed-size image. */
  wrapperClassName?: string;
}) {
  const [loadedSrc, setLoadedSrc] = useState<ImageProps["src"] | null>(null);
  const [fallbackSrc, setFallbackSrc] = useState<ImageProps["src"] | null>(
    null,
  );
  const loaded = loadedSrc === props.src;
  const useOriginal = fallbackSrc === props.src;

  const image = (
    <>
      {loaded ? null : (
        <span
          aria-hidden="true"
          className={cn(
            "pointer-events-none absolute inset-0 animate-skeleton bg-foreground/10",
            skeletonClassName,
          )}
        />
      )}
      <Image
        {...props}
        unoptimized={props.unoptimized || useOriginal}
        className={cn(
          "transition-opacity duration-500",
          !loaded && "image-loading",
          className,
        )}
        onLoad={(event) => {
          setLoadedSrc(props.src);
          onLoad?.(event);
        }}
        onError={(event) => {
          if (!props.unoptimized && !useOriginal) {
            setFallbackSrc(props.src);
            return;
          }

          // A photo that cannot load at all should not pulse forever.
          setLoadedSrc(props.src);
          onError?.(event);
        }}
      />
    </>
  );

  if (props.fill) {
    return image;
  }

  return (
    <span
      className={cn(
        "relative inline-block overflow-hidden align-middle [&>img]:block",
        wrapperClassName,
      )}
    >
      {image}
    </span>
  );
}
