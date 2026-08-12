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

  const imageUrl = pageCover?.src ?? biography?.imageUrl ?? null;

  return (
    <main>
      <PageHero
        title={t("title")}
        imageUrl={imageUrl}
        objectPosition={pageCover?.objectPosition}
      />

      <div className="mx-auto max-w-6xl px-6 py-14 sm:py-20">
        <SectionReveal className="max-w-3xl">
          {biography ? (
            <RichTextView document={biography.body} />
          ) : (
            <p className="text-lg text-muted-foreground">{t("empty")}</p>
          )}
        </SectionReveal>

        {highlights.length > 0 ? (
          <SectionReveal className="mt-20 max-w-3xl">
            <h2 className="font-heading text-3xl tracking-tight">
              {t("highlightsTitle")}
            </h2>
            <ul className="mt-8 divide-y divide-border/70">
              {highlights.map((item) => (
                <li key={item.id} className="py-6">
                  <h3 className="font-heading text-xl tracking-tight">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-muted-foreground">
                    {item.description}
                  </p>
                </li>
              ))}
            </ul>
          </SectionReveal>
        ) : null}
      </div>
    </main>
  );
}
