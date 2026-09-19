"use client";

import { useId, useState } from "react";

import { FORM_LOCALES, LocaleTabs } from "@/components/admin/locale-tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { Locale } from "@/i18n/routing";

type LocalizedValues = Partial<Record<Locale, string | null | undefined>>;

type LocalizedFieldProps = {
  label: string;
  /** Form field names per language. Omit when the value is read from state. */
  names?: Record<Locale, string>;
  defaultValues?: LocalizedValues;
  /** Controlled mode: pass both `values` and `onValueChange`. */
  values?: LocalizedValues;
  onValueChange?: (locale: Locale, value: string) => void;
  multiline?: boolean;
  rows?: number;
  /** Makes the Portuguese version required (English and French never are). */
  required?: boolean;
  description?: string;
  placeholder?: string;
};

const TRANSLATION_PLACEHOLDER =
  "Opcional — sem tradução, o site usa o português";

export function LocalizedField({
  label,
  names,
  defaultValues,
  values,
  onValueChange,
  multiline = false,
  rows,
  required = false,
  description,
  placeholder,
}: LocalizedFieldProps) {
  const baseId = useId();
  const [internal, setInternal] = useState<Record<Locale, string>>(() => ({
    pt: defaultValues?.pt ?? "",
    en: defaultValues?.en ?? "",
    fr: defaultValues?.fr ?? "",
  }));

  const controlId = (locale: Locale) =>
    names?.[locale] ?? `${baseId}-${locale}`;
  const currentValue = (locale: Locale) =>
    values ? (values[locale] ?? "") : internal[locale];

  function handleChange(locale: Locale, value: string) {
    if (!values) {
      setInternal((current) => ({ ...current, [locale]: value }));
    }
    onValueChange?.(locale, value);
  }

  const filled = Object.fromEntries(
    FORM_LOCALES.map(({ id }) => [id, currentValue(id).trim().length > 0]),
  ) as Record<Locale, boolean>;

  return (
    <LocaleTabs
      label={label}
      description={description}
      required={required}
      filled={filled}
      controlId={controlId}
    >
      {(locale) => {
        const shared = {
          id: controlId(locale),
          name: names?.[locale],
          value: currentValue(locale),
          required: required && locale === "pt",
          placeholder: locale === "pt" ? placeholder : TRANSLATION_PLACEHOLDER,
          onChange: (
            event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
          ) => handleChange(locale, event.target.value),
        };

        return multiline ? (
          <Textarea rows={rows} {...shared} />
        ) : (
          <Input {...shared} />
        );
      }}
    </LocaleTabs>
  );
}
