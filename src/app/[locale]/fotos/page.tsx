import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { PageHero } from "@/components/public/page-hero";
import { PublicPaginationNav } from "@/components/public/pagination-nav";
import { PhotoGallery } from "@/components/public/photo-gallery";
import { SectionReveal } from "@/components/public/section-reveal";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { PUBLIC_PAGE_SIZE, parsePage } from "@/lib/pagination";
import { listPhotosPage } from "@/lib/public/media";
import { getPageCover } from "@/lib/public/site-images";
import { pageMetadata } from "@/lib/seo";

type PhotosPageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ page?: string }>;
};

export async function generateMetadata({
  params,
}: PhotosPageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Photos" });
  return pageMetadata({ locale, path: "/fotos", title: t("title") });
}

export default async function PhotosPage({
  params,
  searchParams,
}: PhotosPageProps) {
  const { locale } = await params;
  const requestedPage = parsePage((await searchParams).page);
  setRequestLocale(locale);
  const t = await getTranslations("Photos");
  const tPress = await getTranslations("Press");
  const [{ photos, page, totalPages }, pageCover] = await Promise.all([
    listPhotosPage(locale as Locale, requestedPage, PUBLIC_PAGE_SIZE),
    getPageCover("fotos"),
  ]);

  return (
    <main>
      <PageHero
        title={t("title")}
        imageUrl={pageCover?.src}
        objectPosition={pageCover?.objectPosition}
      />

      <SectionReveal className="mx-auto max-w-6xl px-6 py-14 sm:py-20">
        <Link
          href="/imprensa"
          className="mb-10 inline-flex text-sm text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
        >
          {t("pressCta")}
        </Link>

        {photos.length === 0 ? (
          <p className="text-muted-foreground">{t("empty")}</p>
        ) : (
          <PhotoGallery
            photos={photos}
            labels={{
              credit: t("credit"),
              open: tPress("open"),
              close: tPress("close"),
              previous: tPress("previous"),
              next: tPress("next"),
            }}
          />
        )}
        <PublicPaginationNav
          basePath="/fotos"
          page={page}
          totalPages={totalPages}
        />
      </SectionReveal>
    </main>
  );
}
