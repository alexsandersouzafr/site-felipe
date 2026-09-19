import { ArrowUpRightIcon } from "@phosphor-icons/react/dist/ssr";
import { getLocale, getTranslations } from "next-intl/server";

import { BackToTop } from "@/components/public/back-to-top";
import { LocaleSwitcher } from "@/components/public/locale-switcher";
import { Reveal } from "@/components/public/reveal";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { getSiteSettings } from "@/lib/public/settings";
import { PUBLIC_NAV_ITEMS } from "@/lib/public-nav";

function FooterColumn({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="text-xs tracking-[0.25em] text-muted-foreground uppercase">
        {title}
      </p>
      <ul className="mt-5 space-y-2.5 text-sm">{children}</ul>
    </div>
  );
}

/**
 * The closing frame of every page: a large invitation to get in touch, then
 * the menu, contact details and social links.
 */
export async function SiteFooter() {
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations("Footer");
  const nav = await getTranslations("Navigation");
  const settings = await getSiteSettings(locale).catch(() => null);
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border/70 bg-background">
      <Reveal className="mx-auto max-w-6xl px-6 pt-24 pb-10 sm:pt-32">
        <p
          data-reveal="fade"
          className="text-xs tracking-[0.28em] text-muted-foreground uppercase"
        >
          {t("ctaLabel")}
        </p>
        <Link
          href="/contato"
          className="group mt-6 flex items-end justify-between gap-6"
        >
          <span
            data-reveal="lines"
            className="font-heading text-[clamp(3rem,9.5vw,8.5rem)] leading-[1.02] tracking-[-0.02em] transition-colors duration-500 group-hover:text-primary"
          >
            {t("ctaTitle")}
          </span>
          <span
            data-reveal="fade"
            aria-hidden="true"
            className="mb-3 hidden size-20 shrink-0 items-center justify-center rounded-full border border-foreground/20 transition-[background-color,border-color,color,rotate] duration-700 ease-[cubic-bezier(0.76,0,0.24,1)] group-hover:rotate-45 group-hover:border-primary group-hover:bg-primary group-hover:text-primary-foreground sm:flex lg:size-28"
          >
            <ArrowUpRightIcon className="size-7 lg:size-9" />
          </span>
        </Link>

        <div
          data-reveal="fade"
          className="mt-20 grid gap-10 border-t border-border/70 pt-10 sm:grid-cols-3"
        >
          <FooterColumn title={t("navigation")}>
            {PUBLIC_NAV_ITEMS.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="link-underline">
                  {nav(item.key)}
                </Link>
              </li>
            ))}
          </FooterColumn>

          <FooterColumn title={t("contactTitle")}>
            {settings?.email ? (
              <li>
                <a href={`mailto:${settings.email}`} className="link-underline">
                  {settings.email}
                </a>
              </li>
            ) : null}
            {settings?.phone ? (
              <li>
                <a href={`tel:${settings.phone}`} className="link-underline">
                  {settings.phone}
                </a>
              </li>
            ) : null}
            <li>
              <Link href="/contato" className="link-underline">
                {t("contact")}
              </Link>
            </li>
          </FooterColumn>

          {settings && settings.socialLinks.length > 0 ? (
            <FooterColumn title={t("social")}>
              {settings.socialLinks.map((link) => (
                <li key={`${link.label}-${link.url}`}>
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noreferrer"
                    className="group inline-flex items-center gap-1.5"
                  >
                    <span className="link-underline">{link.label}</span>
                    <ArrowUpRightIcon className="size-3 transition-transform duration-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </a>
                </li>
              ))}
            </FooterColumn>
          ) : null}
        </div>

        <div className="mt-20 flex flex-col gap-5 text-xs tracking-[0.2em] text-muted-foreground uppercase sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {nav("brand")}
          </p>
          <LocaleSwitcher />
          <BackToTop label={t("backToTop")} />
        </div>
      </Reveal>
    </footer>
  );
}
