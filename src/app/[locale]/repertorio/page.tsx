import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { PageHero } from "@/components/public/page-hero";
import { SectionReveal } from "@/components/public/section-reveal";
import { listRepertoire } from "@/lib/public/repertoire";
import { getPageCover } from "@/lib/public/site-images";
import { groupRepertoire, REPERTOIRE_GENRES } from "@/lib/repertoire";
import { pageMetadata } from "@/lib/seo";

type RepertoirePageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({
  params,
}: RepertoirePageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Repertoire" });
  return pageMetadata({ locale, path: "/repertorio", title: t("title") });
}

export default async function RepertoirePage({ params }: RepertoirePageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Repertoire");
  const [works, pageCover] = await Promise.all([
    listRepertoire(),
    getPageCover("repertorio"),
  ]);
  const columns = groupRepertoire(works);
  const shownGenres = REPERTOIRE_GENRES.filter(
    (genre) => columns[genre].length > 0,
  );

  return (
    <main>
      <PageHero
        title={t("title")}
        imageUrl={pageCover?.src}
        objectPosition={pageCover?.objectPosition}
      />

      <div className="mx-auto max-w-6xl px-6 py-14 sm:py-20">
        {shownGenres.length === 0 ? (
          <p className="text-lg text-muted-foreground">{t("empty")}</p>
        ) : (
          <div className="grid gap-16 md:grid-cols-2 md:gap-12 lg:gap-20">
            {shownGenres.map((genre) => (
              <SectionReveal key={genre} as="section">
                <h2 className="font-heading text-3xl tracking-tight sm:text-4xl">
                  {t(genre)}
                </h2>
                <div className="mt-8 space-y-10">
                  {columns[genre].map((group) => (
                    <div key={group.composer}>
                      <h3 className="text-xs tracking-[0.2em] text-muted-foreground uppercase">
                        {group.composer}
                      </h3>
                      <ul className="mt-3 divide-y divide-border/70 border-t border-border/70">
                        {group.works.map((item) => (
                          <li
                            key={item.id}
                            className="py-3 font-heading text-lg"
                          >
                            {item.title}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </SectionReveal>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
