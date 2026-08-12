import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { EventList } from "@/components/public/event-list";
import { PageHero } from "@/components/public/page-hero";
import { SectionReveal } from "@/components/public/section-reveal";
import type { Locale } from "@/i18n/routing";
import { listPublicEvents } from "@/lib/public/events";
import { getPageCover } from "@/lib/public/site-images";

type AgendaPageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({
  params,
}: AgendaPageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Schedule" });
  return { title: t("title") };
}

export default async function AgendaPage({ params }: AgendaPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Schedule");
  const [{ upcoming, past }, pageCover] = await Promise.all([
    listPublicEvents(locale as Locale),
    getPageCover("agenda"),
  ]);

  return (
    <main>
      <PageHero
        title={t("title")}
        description={t("description")}
        imageUrl={pageCover?.src}
        objectPosition={pageCover?.objectPosition}
      />

      <div className="mx-auto max-w-6xl px-6 py-14 sm:py-20">
        <SectionReveal>
          <h2 className="font-heading text-2xl tracking-tight sm:text-3xl">
            {t("upcoming")}
          </h2>
          <div className="mt-6">
            <EventList events={upcoming} emptyLabel={t("upcomingEmpty")} />
          </div>
        </SectionReveal>

        <SectionReveal className="mt-16">
          <h2 className="font-heading text-2xl tracking-tight sm:text-3xl">
            {t("past")}
          </h2>
          <div className="mt-6">
            <EventList events={past} emptyLabel={t("pastEmpty")} />
          </div>
        </SectionReveal>
      </div>
    </main>
  );
}
