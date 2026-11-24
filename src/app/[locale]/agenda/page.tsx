import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { EventList } from "@/components/public/event-list";
import { PageHero } from "@/components/public/page-hero";
import { PublicPaginationNav } from "@/components/public/pagination-nav";
import { SectionReveal } from "@/components/public/section-reveal";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { PUBLIC_PAGE_SIZE, parsePage } from "@/lib/pagination";
import { listUpcomingEventsPage } from "@/lib/public/events";
import { getPageCover } from "@/lib/public/site-images";
import { pageMetadata } from "@/lib/seo";

type AgendaPageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ page?: string }>;
};

export async function generateMetadata({
  params,
}: AgendaPageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Schedule" });
  return pageMetadata({ locale, path: "/agenda", title: t("title") });
}

export default async function AgendaPage({
  params,
  searchParams,
}: AgendaPageProps) {
  const { locale } = await params;
  const requestedPage = parsePage((await searchParams).page);
  setRequestLocale(locale);
  const t = await getTranslations("Schedule");
  const [{ events, page, totalPages }, pageCover] = await Promise.all([
    listUpcomingEventsPage(locale as Locale, requestedPage, PUBLIC_PAGE_SIZE),
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
          <div className="flex items-end justify-between gap-4">
            <h2 className="font-heading text-2xl tracking-tight sm:text-3xl">
              {t("upcoming")}
            </h2>
            <Link
              href="/agenda/anteriores"
              className="text-sm text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
            >
              {t("viewPast")}
            </Link>
          </div>
          <div className="mt-6">
            <EventList events={events} emptyLabel={t("upcomingEmpty")} />
          </div>
          <PublicPaginationNav
            basePath="/agenda"
            page={page}
            totalPages={totalPages}
          />
        </SectionReveal>
      </div>
    </main>
  );
}
