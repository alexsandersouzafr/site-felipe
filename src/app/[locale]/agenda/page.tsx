import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { EventList } from "@/components/public/event-list";
import { PageHero } from "@/components/public/page-hero";
import { PublicPaginationNav } from "@/components/public/pagination-nav";
import { SectionReveal } from "@/components/public/section-reveal";
import type { Locale } from "@/i18n/routing";
import { PUBLIC_PAGE_SIZE, parsePage } from "@/lib/pagination";
import { listPublicEventsPage } from "@/lib/public/events";
import { getPageCover } from "@/lib/public/site-images";

type AgendaPageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ upcomingPage?: string; pastPage?: string }>;
};

export async function generateMetadata({
  params,
}: AgendaPageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Schedule" });
  return { title: t("title") };
}

export default async function AgendaPage({
  params,
  searchParams,
}: AgendaPageProps) {
  const { locale } = await params;
  const resolvedSearchParams = await searchParams;
  const upcomingPage = parsePage(resolvedSearchParams.upcomingPage);
  const pastPage = parsePage(resolvedSearchParams.pastPage);
  setRequestLocale(locale);
  const t = await getTranslations("Schedule");
  const [{ upcoming, upcomingTotalPages, past, pastTotalPages }, pageCover] =
    await Promise.all([
      listPublicEventsPage(
        locale as Locale,
        upcomingPage,
        pastPage,
        PUBLIC_PAGE_SIZE,
      ),
      getPageCover("agenda"),
    ]);

  return (
    <main>
      <PageHero
        title={t("title")}
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
          <PublicPaginationNav
            basePath="/agenda"
            paramName="upcomingPage"
            page={upcomingPage}
            totalPages={upcomingTotalPages}
            extraParams={{ pastPage: String(pastPage) }}
          />
        </SectionReveal>

        <SectionReveal className="mt-16">
          <h2 className="font-heading text-2xl tracking-tight sm:text-3xl">
            {t("past")}
          </h2>
          <div className="mt-6">
            <EventList events={past} emptyLabel={t("pastEmpty")} />
          </div>
          <PublicPaginationNav
            basePath="/agenda"
            paramName="pastPage"
            page={pastPage}
            totalPages={pastTotalPages}
            extraParams={{ upcomingPage: String(upcomingPage) }}
          />
        </SectionReveal>
      </div>
    </main>
  );
}
