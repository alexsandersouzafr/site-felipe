import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { ContactForm } from "@/components/public/contact-form";
import { PageHero } from "@/components/public/page-hero";
import { SectionReveal } from "@/components/public/section-reveal";
import type { Locale } from "@/i18n/routing";
import { getSiteSettings } from "@/lib/public/settings";
import { getPageCover } from "@/lib/public/site-images";

type ContactPageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({
  params,
}: ContactPageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Contact" });
  return { title: t("title") };
}

export default async function ContactPage({ params }: ContactPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Contact");
  const [settings, pageCover] = await Promise.all([
    getSiteSettings(locale as Locale),
    getPageCover("contato"),
  ]);

  return (
    <main>
      <PageHero
        title={t("title")}
        description={settings?.intro || t("description")}
        imageUrl={pageCover?.src}
        objectPosition={pageCover?.objectPosition}
      />

      <div className="mx-auto grid max-w-6xl gap-14 px-6 py-14 sm:py-20 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <SectionReveal>
          <dl className="space-y-6 text-sm">
            {settings?.email ? (
              <div>
                <dt className="text-muted-foreground">{t("email")}</dt>
                <dd className="mt-1">
                  <a
                    href={`mailto:${settings.email}`}
                    className="underline-offset-4 hover:underline"
                  >
                    {settings.email}
                  </a>
                </dd>
              </div>
            ) : null}
            {settings?.phone ? (
              <div>
                <dt className="text-muted-foreground">{t("phone")}</dt>
                <dd className="mt-1">
                  <a
                    href={`tel:${settings.phone}`}
                    className="underline-offset-4 hover:underline"
                  >
                    {settings.phone}
                  </a>
                </dd>
              </div>
            ) : null}
            {settings && settings.socialLinks.length > 0 ? (
              <div>
                <dt className="text-muted-foreground">{t("social")}</dt>
                <dd className="mt-2 flex flex-col gap-2">
                  {settings.socialLinks.map((link) => (
                    <a
                      key={`${link.label}-${link.url}`}
                      href={link.url}
                      target="_blank"
                      rel="noreferrer"
                      className="underline-offset-4 hover:underline"
                    >
                      {link.label}
                    </a>
                  ))}
                </dd>
              </div>
            ) : null}
          </dl>
        </SectionReveal>

        <SectionReveal>
          <ContactForm />
        </SectionReveal>
      </div>
    </main>
  );
}
