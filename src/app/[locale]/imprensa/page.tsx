import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { PageHero } from "@/components/public/page-hero";
import { PressGallery } from "@/components/public/press-gallery";
import { SectionReveal } from "@/components/public/section-reveal";
import type { Locale } from "@/i18n/routing";
import { getBioSummary } from "@/lib/public/bio";
import { listPressPhotos } from "@/lib/public/press";
import { getPageCover } from "@/lib/public/site-images";

type PressPageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({
  params,
}: PressPageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Press" });
  return { title: t("title") };
}

export default async function PressPage({ params }: PressPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Press");
  const [photos, pageCover, bioSummary] = await Promise.all([
    listPressPhotos(locale as Locale),
    getPageCover("imprensa"),
    getBioSummary(locale as Locale),
  ]);

  const labels = {
    open: t("open"),
    close: t("close"),
    previous: t("previous"),
    next: t("next"),
    download: t("download"),
  };
  const sections = [
    { id: "conductor", title: t("conductorPhotos"), shape: "portrait" },
    { id: "stage", title: t("stagePhotos"), shape: "landscape" },
  ] as const;
  const visibleSections = sections.filter(
    (section) => photos[section.id].length > 0,
  );

  return (
    <main>
      <PageHero
        title={t("title")}
        imageUrl={pageCover?.src}
        objectPosition={pageCover?.objectPosition}
      />

      <div className="mx-auto max-w-6xl px-6 py-14 sm:py-20">
        {bioSummary ? (
          <SectionReveal className="mx-auto max-w-3xl text-center">
            <p className="text-lg leading-relaxed text-muted-foreground">
              {bioSummary.summary}
            </p>
          </SectionReveal>
        ) : null}

        {visibleSections.length === 0 ? (
          <p className="mt-14 text-center text-muted-foreground">
            {t("empty")}
          </p>
        ) : (
          visibleSections.map((section, index) => (
            <SectionReveal
              key={section.id}
              className={bioSummary || index > 0 ? "mt-16 sm:mt-24" : undefined}
            >
              <h2 className="mb-10 text-center font-heading text-3xl tracking-tight sm:text-4xl">
                {section.title}
              </h2>
              <PressGallery
                photos={photos[section.id]}
                shape={section.shape}
                labels={labels}
              />
            </SectionReveal>
          ))
        )}
      </div>
    </main>
  );
}
