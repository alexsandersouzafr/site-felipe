import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { PageHero } from "@/components/public/page-hero";
import { RichTextView } from "@/components/public/rich-text-view";
import { SectionReveal } from "@/components/public/section-reveal";
import type { Locale } from "@/i18n/routing";
import { getBioPage } from "@/lib/public/bio";
import { getPageCover } from "@/lib/public/site-images";

type BioPageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({
  params,
}: BioPageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Bio" });
  return { title: t("title") };
}

export default async function BioPage({ params }: BioPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Bio");
  const [{ biography, highlights }, pageCover] = await Promise.all([
    getBioPage(locale as Locale),
    getPageCover("bio"),
  ]);

  return (
    <main>
      <PageHero
        title={t("title")}
        imageUrl={pageCover?.src}
        objectPosition={pageCover?.objectPosition}
      />

      <div className="mx-auto max-w-6xl px-6 py-14 sm:py-20">
        <div className="grid gap-12 lg:grid-cols-[1fr_320px] lg:items-start lg:gap-16">
          <SectionReveal className="order-2 lg:order-1">
            {biography ? (
              <RichTextView document={biography.body} />
            ) : (
              <p className="text-lg text-muted-foreground">{t("empty")}</p>
            )}
          </SectionReveal>

          {highlights.length > 0 ? (
            <SectionReveal className="order-1 lg:sticky lg:top-24 lg:order-2 lg:self-start">
              <h2 className="font-heading text-2xl tracking-tight">
                {t("highlightsTitle")}
              </h2>
              <ul className="mt-6 divide-y divide-border/70">
                {highlights.map((item) => (
                  <li key={item.id} className="py-5">
                    <h3 className="font-heading text-lg tracking-tight">
                      {item.title}
                    </h3>
                    <p className="mt-1.5 text-sm text-muted-foreground">
                      {item.description}
                    </p>
                  </li>
                ))}
              </ul>
            </SectionReveal>
          ) : null}
        </div>
      </div>
    </main>
  );
}
