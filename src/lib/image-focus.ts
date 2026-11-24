/**
 * Which part of a photo stays in view when its frame crops it, as CSS
 * `object-position` ("x% y%"): 0% 0% keeps the top left corner, 50% 50% the
 * middle.
 */
export type ImageFocus = { x: number; y: number };

/** The choices the admin offers, laid out as a 3×3 grid. */
export const IMAGE_FOCUS_PRESETS = [
  { x: 25, y: 25, label: "Em cima, à esquerda" },
  { x: 50, y: 25, label: "Em cima, no centro" },
  { x: 75, y: 25, label: "Em cima, à direita" },
  { x: 25, y: 50, label: "No meio, à esquerda" },
  { x: 50, y: 50, label: "Bem no centro" },
  { x: 75, y: 50, label: "No meio, à direita" },
  { x: 25, y: 75, label: "Embaixo, à esquerda" },
  { x: 50, y: 75, label: "Embaixo, no centro" },
  { x: 75, y: 75, label: "Embaixo, à direita" },
] as const;

/** Faces sit in the upper third of most portraits. */
export const DEFAULT_IMAGE_FOCUS = "50% 28%";

/** How far a saved value may be from a preset and still count as it. */
const PRESET_TOLERANCE = 8;

export function parseImageFocus(
  value: string | null | undefined,
): ImageFocus | null {
  const match = value
    ?.trim()
    .match(/^(\d{1,3}(?:\.\d+)?)%\s+(\d{1,3}(?:\.\d+)?)%$/);

  if (!match) {
    return null;
  }

  const x = Number(match[1]);
  const y = Number(match[2]);

  return x <= 100 && y <= 100 ? { x, y } : null;
}

export function formatImageFocus({ x, y }: ImageFocus) {
  const clamp = (n: number) => Math.min(100, Math.max(0, Math.round(n)));

  return `${clamp(x)}% ${clamp(y)}%`;
}

/**
 * Anything that is not two percentages falls back to the default, so a value
 * from the form never reaches a `style` attribute as free text.
 */
export function normalizeImageFocus(value: string | null | undefined) {
  const focus = parseImageFocus(value);

  return focus ? formatImageFocus(focus) : DEFAULT_IMAGE_FOCUS;
}

/** The preset a saved value corresponds to, if any. */
export function presetForFocus(value: string | null | undefined) {
  const focus = parseImageFocus(value);

  if (!focus) {
    return null;
  }

  return (
    IMAGE_FOCUS_PRESETS.find(
      (preset) =>
        Math.abs(preset.x - focus.x) <= PRESET_TOLERANCE &&
        Math.abs(preset.y - focus.y) <= PRESET_TOLERANCE,
    ) ?? null
  );
}
