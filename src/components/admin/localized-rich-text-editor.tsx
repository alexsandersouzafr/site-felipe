"use client";

import { useId, useState } from "react";

import { FORM_LOCALES, LocaleTabs } from "@/components/admin/locale-tabs";
import { RichTextEditor } from "@/components/admin/rich-text-editor";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import type { Locale } from "@/i18n/routing";
import type { RichTextDocument } from "@/lib/rich-text";
import { emptyRichTextDocument, isRichTextEmpty } from "@/lib/rich-text";

type LocalizedRichTextValues = {
  pt: RichTextDocument | null;
  en: RichTextDocument | null;
  fr: RichTextDocument | null;
};

type LocalizedTitleValues = {
  pt: string | null;
  en: string | null;
  fr: string | null;
};

type LocalizedRichTextEditorProps = {
  label?: string;
  names?: { pt: string; en: string; fr: string };
  values?: LocalizedRichTextValues;
  onChange?: (locale: Locale, document: RichTextDocument) => void;
  titles?: LocalizedTitleValues;
  onTitleChange?: (locale: Locale, title: string | null) => void;
  showTitles?: boolean;
  requiredLocale?: Locale;
  required?: boolean;
};

function hasText(document: RichTextDocument | null | undefined) {
  return document ? !isRichTextEmpty(document) : false;
}

export function LocalizedRichTextEditor({
  label,
  names,
  values,
  onChange,
  titles,
  onTitleChange,
  showTitles = false,
  requiredLocale = "pt",
  required = false,
}: LocalizedRichTextEditorProps) {
  const baseId = useId();
  const [filled, setFilled] = useState<Record<Locale, boolean>>(() => ({
    pt: hasText(values?.pt),
    en: hasText(values?.en),
    fr: hasText(values?.fr),
  }));

  function handleChange(locale: Locale, document: RichTextDocument) {
    setFilled((current) => ({ ...current, [locale]: hasText(document) }));
    onChange?.(locale, document);
  }

  return (
    <LocaleTabs
      label={label}
      required={required}
      requiredLocale={requiredLocale}
      filled={filled}
    >
      {(locale) => {
        const localeLabel =
          FORM_LOCALES.find((item) => item.id === locale)?.label ?? locale;

        return (
          <div className="space-y-4">
            {showTitles ? (
              <Field>
                <FieldLabel htmlFor={`${baseId}-title-${locale}`}>
                  Título opcional
                </FieldLabel>
                <Input
                  id={`${baseId}-title-${locale}`}
                  value={titles?.[locale] ?? ""}
                  onChange={(event) =>
                    onTitleChange?.(
                      locale,
                      event.target.value.trim() ? event.target.value : null,
                    )
                  }
                />
              </Field>
            ) : null}
            <RichTextEditor
              name={names?.[locale]}
              initialContent={values?.[locale] ?? emptyRichTextDocument}
              onChange={(document) => handleChange(locale, document)}
              placeholder={
                locale === "pt"
                  ? "Escreva o conteúdo em português..."
                  : `Escreva o conteúdo em ${localeLabel} (opcional)...`
              }
            />
          </div>
        );
      }}
    </LocaleTabs>
  );
}
