import { type ImageFocus, parseImageFocus } from "@/lib/image-focus";

/**
 * The region `object-fit: cover` with `object-position` shows when a photo
 * fills a box: scale until both sides cover it, then slide the overflow by the
 * focus percentages. Used to cut the share image the way the hero is framed.
 */
export function coverCrop(
  width: number,
  height: number,
  target: { width: number; height: number },
  focusValue: string | null | undefined,
) {
  const focus: ImageFocus = parseImageFocus(focusValue) ?? { x: 50, y: 50 };
  const scale = Math.max(target.width / width, target.height / height);
  const resized = {
    width: Math.max(target.width, Math.round(width * scale)),
    height: Math.max(target.height, Math.round(height * scale)),
  };

  return {
    resized,
    left: Math.round(((resized.width - target.width) * focus.x) / 100),
    top: Math.round(((resized.height - target.height) * focus.y) / 100),
  };
}
