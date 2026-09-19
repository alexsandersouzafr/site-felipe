"use client";

import { type FormEvent, type ReactNode, useState } from "react";
import { flushSync } from "react-dom";

import { FieldDescription, FieldLabel } from "@/components/ui/field";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Locale } from "@/i18n/routing";
import { cn } from "@/lib/utils";

export const FORM_LOCALES: ReadonlyArray<{
  id: Locale;
  code: string;
  label: string;
}> = [
  { id: "pt", code: "PT", label: "Português" },
  { id: "en", code: "EN", label: "English" },
  { id: "fr", code: "FR", label: "Français" },
];

export type LocaleFilledState = Partial<Record<Locale, boolean>>;

type LocaleTabsProps = {
  label?: string;
  description?: string;
  /** Marks the required language (Portuguese by default) with an asterisk. */
  required?: boolean;
  requiredLocale?: Locale;
  /** Which languages already have content; drives the status dot on each tab. */
  filled?: LocaleFilledState;
  /** DOM id of the control shown for a language, so the label targets it. */
  controlId?: (locale: Locale) => string | undefined;
  className?: string;
  children: (locale: Locale) => ReactNode;
};

/**
 * Language switcher for any field that has a Portuguese, English and French
 * version. The three panels stay mounted (only the active one is visible), so
 * every language is always part of the submitted form and unsaved edits survive
 * switching tabs. If the browser rejects a hidden field on submit, the tab that
 * holds it is opened so the message is actually visible.
 */
export function LocaleTabs({
  label,
  description,
  required = false,
  requiredLocale = "pt",
  filled,
  controlId,
  className,
  children,
}: LocaleTabsProps) {
  const [selected, setSelected] = useState<Locale>("pt");

  function revealInvalidControl(event: FormEvent<HTMLDivElement>) {
    const control = event.target as HTMLInputElement;
    const panel = control.closest<HTMLElement>("[data-locale]");
    const locale = panel?.dataset.locale as Locale | undefined;

    if (!locale || locale === selected) {
      return;
    }

    // Not cancelled on purpose: once the tab is open the browser can focus this
    // field and show its own message, as it would for any visible field.
    flushSync(() => setSelected(locale));
  }

  return (
    <div
      className={cn("space-y-2", className)}
      onInvalidCapture={revealInvalidControl}
    >
      <Tabs
        selectedKey={selected}
        onSelectionChange={(key) => setSelected(key as Locale)}
        className="flex-col gap-2"
      >
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
          {label ? (
            <FieldLabel
              htmlFor={controlId?.(selected)}
              required={required}
              className="min-w-0"
            >
              {label}
            </FieldLabel>
          ) : (
            <span />
          )}
          <TabsList
            aria-label={label ? `Idioma: ${label}` : "Idioma do conteúdo"}
            className="h-7 gap-0.5 rounded-xl border border-border/80 bg-muted/40 p-0.5 group-data-horizontal/tabs:h-7"
          >
            {FORM_LOCALES.map((locale) => (
              <TabsTrigger
                key={locale.id}
                id={locale.id}
                aria-label={`${locale.label}, ${filled?.[locale.id] ? "preenchido" : "vazio"}`}
                className="h-6 flex-none gap-1.5 rounded-lg px-2.5 text-xs tracking-wide text-muted-foreground data-selected:bg-background data-selected:text-foreground data-selected:shadow-xs dark:data-selected:bg-input/60"
              >
                {locale.code}
                <span
                  aria-hidden="true"
                  className={cn(
                    "size-1.5 rounded-full border transition-colors",
                    filled?.[locale.id]
                      ? "border-primary bg-primary"
                      : locale.id === requiredLocale && required
                        ? "border-destructive/70"
                        : "border-muted-foreground/40",
                  )}
                />
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        {FORM_LOCALES.map((locale) => (
          <TabsContent
            key={locale.id}
            id={locale.id}
            shouldForceMount
            className="data-[inert=true]:hidden"
          >
            <div data-locale={locale.id}>{children(locale.id)}</div>
          </TabsContent>
        ))}
      </Tabs>

      {description ? <FieldDescription>{description}</FieldDescription> : null}
    </div>
  );
}
