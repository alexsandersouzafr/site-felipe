/** The two kinds of press photo, matching the `press_photo_category` enum. */
export const PRESS_PHOTO_CATEGORIES = ["conductor", "stage"] as const;

export type PressPhotoCategory = (typeof PRESS_PHOTO_CATEGORIES)[number];

export const DEFAULT_PRESS_PHOTO_CATEGORY: PressPhotoCategory = "conductor";

/** Admin-facing names (the public page has its own, translated headings). */
export const PRESS_PHOTO_CATEGORY_LABELS: Record<
  PressPhotoCategory,
  { label: string; description: string }
> = {
  conductor: {
    label: "Fotos do maestro",
    description: "Retratos e fotos de divulgação, para publicidade.",
  },
  stage: {
    label: "Fotos no palco",
    description: "O maestro regendo, em concertos e ensaios.",
  },
};

export function parsePressPhotoCategory(
  value: unknown,
): PressPhotoCategory | null {
  return PRESS_PHOTO_CATEGORIES.find((category) => category === value) ?? null;
}
