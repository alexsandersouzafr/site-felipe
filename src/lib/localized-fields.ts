export function toNullableLocalizedText(value: {
  pt: string;
  en?: string | null;
  fr?: string | null;
}) {
  const normalize = (input: string | null | undefined) => {
    const trimmed = input?.trim() ?? "";
    return trimmed.length > 0 ? trimmed : null;
  };

  return {
    pt: value.pt.trim(),
    en: normalize(value.en),
    fr: normalize(value.fr),
  };
}
