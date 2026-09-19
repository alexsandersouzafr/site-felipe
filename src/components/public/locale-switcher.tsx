"use client";

import { useLocale, useTranslations } from "next-intl";

import { usePathname, useRouter } from "@/i18n/navigation";
import { type Locale, routing } from "@/i18n/routing";
import { cn } from "@/lib/utils";

export function LocaleSwitcher({ className }: { className?: string }) {
  const t = useTranslations("LocaleSwitcher");
  const locale = useLocale() as Locale;
  const pathname = usePathname();
  const router = useRouter();

  return (
    <fieldset
      className={cn(
        "m-0 flex min-w-0 items-center gap-1 border-0 p-0 text-xs tracking-wide",
        className,
      )}
    >
      <legend className="sr-only">{t("label")}</legend>
      {routing.locales.map((value) => (
        <button
          key={value}
          type="button"
          className={cn(
            "cursor-pointer px-1.5 py-1 uppercase transition-opacity",
            value === locale ? "opacity-100" : "opacity-55 hover:opacity-100",
          )}
          onClick={() => router.replace(pathname, { locale: value })}
          aria-current={value === locale ? "true" : undefined}
        >
          {t(value)}
        </button>
      ))}
    </fieldset>
  );
}
