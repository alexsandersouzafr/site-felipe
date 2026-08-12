import { toNullableLocalizedText } from "@/lib/localized-fields";
import { publishingStateFromFormData } from "@/lib/publishing-intent";

export function readPublishingFields(formData: FormData) {
  const { status, publishAt } = publishingStateFromFormData(formData);
  return { status, publishAt };
}

export function readLocalizedPair(
  formData: FormData,
  keys: { pt: string; en: string; es: string },
) {
  return toNullableLocalizedText({
    pt: String(formData.get(keys.pt) ?? ""),
    en: String(formData.get(keys.en) ?? ""),
    es: String(formData.get(keys.es) ?? ""),
  });
}

export function optionalText(formData: FormData, key: string) {
  const value = String(formData.get(key) ?? "").trim();
  return value.length > 0 ? value : null;
}

export function integerField(formData: FormData, key: string, fallback = 0) {
  const raw = String(formData.get(key) ?? "");
  const value = Number.parseInt(raw, 10);
  return Number.isFinite(value) ? value : fallback;
}

export function booleanField(formData: FormData, key: string) {
  const value = String(formData.get(key) ?? "").toLowerCase();
  return value === "true" || value === "on" || value === "1";
}

export function requireScheduledPublishAt(
  status: string,
  publishAt: string | null,
) {
  if (status === "scheduled" && !publishAt) {
    return "Informe a data de publicação para agendar.";
  }

  return null;
}
