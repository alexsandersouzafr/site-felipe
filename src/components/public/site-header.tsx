"use client";

import { ListIcon, XIcon } from "@phosphor-icons/react";
import { useTranslations } from "next-intl";
import { useState } from "react";

import { LocaleSwitcher } from "@/components/public/locale-switcher";
import { ThemeToggle } from "@/components/theme-toggle";
import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", key: "home" as const },
  { href: "/blog", key: "news" as const },
  { href: "/bio", key: "bio" as const },
  { href: "/agenda", key: "schedule" as const },
  { href: "/videos", key: "videos" as const },
  { href: "/fotos", key: "photos" as const },
  { href: "/contato", key: "contact" as const },
];

export function SiteHeader() {
  const t = useTranslations("Navigation");
  const theme = useTranslations("ThemeToggle");
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4">
        <Link
          href="/"
          className="font-heading text-2xl tracking-tight text-foreground transition-opacity hover:opacity-80"
        >
          {t("brand")}
        </Link>

        <nav className="hidden items-center gap-5 lg:flex" aria-label="Primary">
          {navItems.map((item) => {
            const active =
              item.href === "/"
                ? pathname === "/"
                : pathname === item.href ||
                  pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "text-sm tracking-wide transition-colors",
                  active
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {t(item.key)}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <LocaleSwitcher className="hidden sm:flex" />
          <ThemeToggle
            lightLabel={theme("light")}
            darkLabel={theme("dark")}
          />
          <button
            type="button"
            className="inline-flex size-9 cursor-pointer items-center justify-center text-foreground lg:hidden"
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? t("closeMenu") : t("menu")}
            onClick={() => setOpen((value) => !value)}
          >
            {open ? <XIcon className="size-5" /> : <ListIcon className="size-5" />}
          </button>
        </div>
      </div>

      <div
        id="mobile-nav"
        className={cn(
          "border-t border-border/60 lg:hidden",
          open ? "block" : "hidden",
        )}
      >
        <nav className="mx-auto flex max-w-6xl flex-col gap-1 px-6 py-4" aria-label="Mobile">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="py-2 text-sm text-foreground"
              onClick={() => setOpen(false)}
            >
              {t(item.key)}
            </Link>
          ))}
          <LocaleSwitcher className="mt-3 sm:hidden" />
        </nav>
      </div>
    </header>
  );
}
