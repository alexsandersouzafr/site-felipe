"use client";

import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";

import { getLenis } from "@/components/gsap-scroll-root";
import { LocaleSwitcher } from "@/components/public/locale-switcher";
import { ThemeToggle } from "@/components/theme-toggle";
import { Link, usePathname } from "@/i18n/navigation";
import {
  EASE_REVEAL,
  EASE_SWEEP,
  gsap,
  prefersReducedMotion,
} from "@/lib/motion";
import { isPublicNavItemActive, PUBLIC_NAV_ITEMS } from "@/lib/public-nav";
import { cn } from "@/lib/utils";

/** Past this, scrolling down hides the header and scrolling up brings it back. */
const HIDE_AFTER = 160;

export function SiteHeader() {
  const t = useTranslations("Navigation");
  const theme = useTranslations("ThemeToggle");
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // Scroll state lives in data attributes (styled in globals.css), not React
  // state, so scrolling never re-renders the header.
  useEffect(() => {
    const header = headerRef.current;
    if (!header) {
      return;
    }

    let lastY = window.scrollY;
    let frame = 0;

    const update = () => {
      frame = 0;
      const y = window.scrollY;
      header.dataset.scrolled = String(y > 8);

      if (y < HIDE_AFTER || y < lastY - 4) {
        header.dataset.hidden = "false";
      } else if (y > lastY + 4) {
        header.dataset.hidden = "true";
      }

      lastY = y;
    };

    const onScroll = () => {
      frame ||= window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.cancelAnimationFrame(frame);
    };
  }, []);

  useEffect(() => {
    if (pathname && headerRef.current) {
      headerRef.current.dataset.hidden = "false";
    }
    setOpen(false);
  }, [pathname]);

  // Full-screen menu: freeze the page behind it and bring the links in.
  useEffect(() => {
    const panel = panelRef.current;
    if (!panel) {
      return;
    }

    const lenis = getLenis();
    const links = panel.querySelectorAll("[data-menu-item]");

    if (open) {
      lenis?.stop();
      document.documentElement.style.overflow = "hidden";
    }

    if (prefersReducedMotion()) {
      gsap.set(panel, { autoAlpha: open ? 1 : 0 });
    } else if (open) {
      gsap
        .timeline()
        .fromTo(
          panel,
          { autoAlpha: 1, clipPath: "inset(0% 0% 100% 0%)" },
          { clipPath: "inset(0% 0% 0% 0%)", duration: 0.8, ease: EASE_SWEEP },
        )
        .fromTo(
          links,
          { yPercent: 110 },
          { yPercent: 0, duration: 1, ease: EASE_REVEAL, stagger: 0.05 },
          0.25,
        );
    } else {
      gsap.to(panel, {
        clipPath: "inset(0% 0% 100% 0%)",
        duration: 0.6,
        ease: EASE_SWEEP,
        onComplete: () => {
          gsap.set(panel, { autoAlpha: 0 });
        },
      });
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      lenis?.start();
      document.documentElement.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <header
        ref={headerRef}
        className="site-header fixed inset-x-0 top-0 z-50 h-(--header-height)"
        data-menu-open={open}
      >
        <div className="mx-auto flex h-full max-w-6xl items-center justify-between gap-4 px-6">
          <Link
            href="/"
            className="font-heading text-2xl tracking-tight transition-opacity hover:opacity-75"
          >
            {t("brand")}
          </Link>

          <nav
            className="hidden items-center gap-6 lg:flex"
            aria-label="Primary"
          >
            {PUBLIC_NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                aria-current={
                  isPublicNavItemActive(item.href, pathname)
                    ? "page"
                    : undefined
                }
                className="link-underline text-sm tracking-wide opacity-75 transition-opacity hover:opacity-100 aria-[current=page]:opacity-100"
              >
                {t(item.key)}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <LocaleSwitcher className="hidden sm:flex" />
            <ThemeToggle
              lightLabel={theme("light")}
              darkLabel={theme("dark")}
              className="border-[color-mix(in_oklch,currentColor_28%,transparent)] bg-transparent text-current hover:bg-[color-mix(in_oklch,currentColor_10%,transparent)] hover:text-current dark:bg-transparent dark:hover:bg-[color-mix(in_oklch,currentColor_10%,transparent)]"
            />
            <button
              type="button"
              className="inline-flex h-9 cursor-pointer items-center gap-2 text-sm tracking-wide lg:hidden"
              aria-expanded={open}
              aria-controls="mobile-nav"
              onClick={() => setOpen((value) => !value)}
            >
              <span>{open ? t("closeMenu") : t("menu")}</span>
              <span aria-hidden="true" className="relative block h-3 w-5">
                <span
                  className={cn(
                    "absolute inset-x-0 top-0.5 h-px bg-current transition-transform duration-500",
                    open && "translate-y-1 rotate-45",
                  )}
                />
                <span
                  className={cn(
                    "absolute inset-x-0 bottom-0.5 h-px bg-current transition-transform duration-500",
                    open && "-translate-y-1 -rotate-45",
                  )}
                />
              </span>
            </button>
          </div>
        </div>
      </header>

      <div
        ref={panelRef}
        id="mobile-nav"
        className="invisible fixed inset-0 z-40 flex flex-col bg-background pt-(--header-height) lg:hidden"
        aria-hidden={!open}
        inert={!open}
      >
        <nav
          className="flex flex-1 flex-col justify-center gap-1 overflow-y-auto px-6"
          aria-label="Mobile"
        >
          {PUBLIC_NAV_ITEMS.map((item, index) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={
                isPublicNavItemActive(item.href, pathname) ? "page" : undefined
              }
              onClick={() => setOpen(false)}
              className="group flex items-baseline gap-4 overflow-hidden py-1"
            >
              <span data-menu-item className="flex items-baseline gap-4">
                <span className="w-6 text-xs tabular-nums text-muted-foreground">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="font-heading text-4xl tracking-tight transition-colors group-hover:text-primary group-aria-[current=page]:text-primary sm:text-5xl">
                  {t(item.key)}
                </span>
              </span>
            </Link>
          ))}
        </nav>
        <div className="flex items-center justify-between border-t border-border/70 px-6 py-5">
          <LocaleSwitcher />
          <p className="font-heading text-lg tracking-tight">{t("brand")}</p>
        </div>
      </div>

      <div className="header-spacer" aria-hidden="true" />
    </>
  );
}
