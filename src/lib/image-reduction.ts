/**
 * How a photo is re-encoded in the browser before it is uploaded. The point is
 * storage: the Supabase project has little room, and the site never shows a
 * photo wider than 3840 px (the largest size the image optimizer serves), so
 * anything past that is space spent on nothing.
 */
export type ReductionProfile = {
  /** Longest side, in pixels. */
  maxSide: number;
  /** First quality tried; lower ones follow only to fit the size limit. */
  quality: number;
  /** WebP falls back to JPEG in browsers that cannot write it. */
  type: "image/webp" | "image/jpeg";
  /** Smaller files are uploaded as they are. */
  minBytes: number;
};

const MB = 1024 * 1024;

/** Every photo the site shows. */
export const SITE_PHOTO_REDUCTION: ReductionProfile = {
  maxSide: 3840,
  quality: 0.85,
  type: "image/webp",
  minBytes: 1 * MB,
};

/*
 * Press photos are not re-encoded at all: they are hi-res originals downloaded
 * for print, and a browser re-encode cannot keep them intact. It halves the
 * colour resolution and drops the colour profile (converting to sRGB); even
 * at 97% quality it measured under 39 dB against the original.
 */

/** GIFs may be animated, so they are never re-encoded. */
const REDUCIBLE_TYPES = ["image/jpeg", "image/png", "image/webp"];

export function shouldReduceImage(
  file: { size: number; type: string },
  profile: ReductionProfile | null,
) {
  return (
    profile !== null &&
    file.size > profile.minBytes &&
    REDUCIBLE_TYPES.includes(file.type)
  );
}

/** The qualities to try, best first, never below 0.7. */
export function reductionQualities(profile: ReductionProfile) {
  return [0, 0.05, 0.1]
    .map((step) => Math.round((profile.quality - step) * 100) / 100)
    .filter((quality) => quality >= 0.7);
}

/** Fits the longest side within `maxSide`, keeping the proportions. */
export function reducedDimensions(
  width: number,
  height: number,
  maxSide: number,
) {
  const scale = Math.min(1, maxSide / Math.max(width, height));

  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
  };
}

/** Names the file for what it now is. */
export function reducedFileName(name: string, type: ReductionProfile["type"]) {
  const base = name.replace(/\.[^./\\]+$/, "") || "imagem";

  return `${base}.${type === "image/webp" ? "webp" : "jpg"}`;
}
