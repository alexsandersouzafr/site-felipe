import type { Locale } from "@/i18n/routing";

type LocalizedValue = {
  pt: string;
  en: string | null;
  es: string | null;
};

export function getLocalizedValue(value: LocalizedValue, locale: Locale) {
  return value[locale] || value.pt;
}
