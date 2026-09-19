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
 * The foot of every page: the menu, contact details and social links. (The
 * large "let's talk" invitation closes the home page only.)
 */
export async function SiteFooter() {
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations("Footer");
  const nav = await getTranslations("Navigation");
  const settings = await getSiteSettings(locale).catch(() => null);
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border/70 bg-background">
      <Reveal className="mx-auto max-w-6xl px-6 pt-16 pb-10 sm:pt-20">
        <div data-reveal="fade" className="grid gap-10 sm:grid-cols-3">
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
