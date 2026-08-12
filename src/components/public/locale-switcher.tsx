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
    <div
      className={cn("flex items-center gap-1 text-xs tracking-wide", className)}
      role="group"
      aria-label={t("label")}
    >
      {routing.locales.map((value) => (
        <button
          key={value}
          type="button"
          className={cn(
            "cursor-pointer px-1.5 py-1 uppercase transition-colors",
            value === locale
              ? "text-foreground"
              : "text-muted-foreground hover:text-foreground",
          )}
          onClick={() => router.replace(pathname, { locale: value })}
          aria-current={value === locale ? "true" : undefined}
        >
          {t(value)}
        </button>
      ))}
    </div>
  );
}
