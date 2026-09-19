import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { EventList } from "@/components/public/event-list";
import { PageHero } from "@/components/public/page-hero";
import { PublicPaginationNav } from "@/components/public/pagination-nav";
import { SectionReveal } from "@/components/public/section-reveal";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { PUBLIC_PAGE_SIZE, parsePage } from "@/lib/pagination";
import { listPastEventsPage } from "@/lib/public/events";
import { getPageCover } from "@/lib/public/site-images";

type PastEventsPageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ page?: string }>;
};

export async function generateMetadata({
  params,
}: PastEventsPageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Schedule" });
  return { title: t("pastTitle") };
}

export default async function PastEventsPage({
  params,
  searchParams,
}: PastEventsPageProps) {
  const { locale } = await params;
  const requestedPage = parsePage((await searchParams).page);
  setRequestLocale(locale);
  const t = await getTranslations("Schedule");
  const [{ events, page, totalPages }, pageCover] = await Promise.all([
    listPastEventsPage(locale as Locale, requestedPage, PUBLIC_PAGE_SIZE),
    getPageCover("agenda"),
  ]);

  return (
    <main>
      <PageHero
        title={t("pastTitle")}
        imageUrl={pageCover?.src}
        objectPosition={pageCover?.objectPosition}
      />

      <div className="mx-auto max-w-6xl px-6 py-14 sm:py-20">
        <SectionReveal>
          <Link
            href="/agenda"
            className="text-sm text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
          >
            {t("backToSchedule")}
          </Link>
          <div className="mt-6">
            <EventList
              events={events}
              emptyLabel={t("pastEmpty")}
              showTickets={false}
            />
          </div>
          <PublicPaginationNav
            basePath="/agenda/anteriores"
            page={page}
            totalPages={totalPages}
          />
        </SectionReveal>
      </div>
    </main>
  );
}
