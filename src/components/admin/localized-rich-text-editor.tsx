"use client";

import { RichTextEditor } from "@/components/admin/rich-text-editor";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { RichTextDocument } from "@/lib/rich-text";
import { emptyRichTextDocument } from "@/lib/rich-text";

type Locale = "pt" | "en" | "es";

const locales: Array<{ id: Locale; label: string }> = [
  { id: "pt", label: "Português" },
  { id: "en", label: "English" },
  { id: "es", label: "Español" },
];

type LocalizedRichTextValues = {
  pt: RichTextDocument | null;
  en: RichTextDocument | null;
  es: RichTextDocument | null;
};

type LocalizedTitleValues = {
  pt: string | null;
  en: string | null;
  es: string | null;
};

type LocalizedRichTextEditorProps = {
  label?: string;
  names?: { pt: string; en: string; es: string };
  values?: LocalizedRichTextValues;
  onChange?: (locale: Locale, document: RichTextDocument) => void;
  titles?: LocalizedTitleValues;
  onTitleChange?: (locale: Locale, title: string | null) => void;
  showTitles?: boolean;
  requiredLocale?: Locale;
  required?: boolean;
};

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
  return (
    <div className="space-y-3">
      {label ? (
        <p className="flex items-center gap-1 text-sm font-medium">
          {label}
          {required ? (
            <span className="text-destructive" aria-hidden="true">
              *
            </span>
          ) : null}
        </p>
      ) : null}
      <Tabs defaultSelectedKey="pt">
        <TabsList aria-label="Idioma do conteúdo">
          {locales.map((locale) => (
            <TabsTrigger key={locale.id} id={locale.id}>
              <span className="inline-flex items-center gap-1">
                {locale.label}
                {locale.id === requiredLocale ? (
                  <span className="text-destructive" aria-hidden="true">
                    *
                  </span>
                ) : null}
              </span>
            </TabsTrigger>
          ))}
        </TabsList>
        {locales.map((locale) => (
          <TabsContent key={locale.id} id={locale.id} className="space-y-4">
            {showTitles ? (
              <Field>
                <FieldLabel htmlFor={`title-${locale.id}`}>
                  Título opcional ({locale.label})
                </FieldLabel>
                <Input
                  id={`title-${locale.id}`}
                  value={titles?.[locale.id] ?? ""}
                  onChange={(event) =>
                    onTitleChange?.(
                      locale.id,
                      event.target.value.trim() ? event.target.value : null,
                    )
                  }
                />
              </Field>
            ) : null}
            <RichTextEditor
              name={names?.[locale.id]}
              initialContent={values?.[locale.id] ?? emptyRichTextDocument}
              onChange={
                onChange
                  ? (document) => onChange(locale.id, document)
                  : undefined
              }
              placeholder={
                locale.id === "pt"
                  ? "Escreva o conteúdo em português..."
                  : `Escreva o conteúdo em ${locale.label} (opcional)...`
              }
            />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
