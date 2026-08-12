export const IMAGE_FOCUS_OPTIONS = [
  {
    value: "50% 28%",
    label: "Rosto / parte superior (recomendado)",
  },
  {
    value: "50% 50%",
    label: "Centro",
  },
  {
    value: "50% 18%",
    label: "Topo",
  },
  {
    value: "50% 72%",
    label: "Parte inferior",
  },
] as const;

export const DEFAULT_IMAGE_FOCUS = IMAGE_FOCUS_OPTIONS[0].value;

export function normalizeImageFocus(value: string | null | undefined) {
  const trimmed = value?.trim();
  if (!trimmed) {
    return DEFAULT_IMAGE_FOCUS;
  }

  return trimmed;
}
