import type { Metadata } from "next";
import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { PageHero } from "@/components/public/page-hero";
import { SectionReveal } from "@/components/public/section-reveal";
import type { Locale } from "@/i18n/routing";
import { listPhotos } from "@/lib/public/media";
import { getPageCover } from "@/lib/public/site-images";

type PhotosPageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({
  params,
}: PhotosPageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Photos" });
  return { title: t("title") };
}

export default async function PhotosPage({ params }: PhotosPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Photos");
  const [photos, pageCover] = await Promise.all([
    listPhotos(locale as Locale),
    getPageCover("fotos"),
  ]);

  return (
    <main>
      <PageHero
        title={t("title")}
        description={t("description")}
        imageUrl={pageCover?.src}
        objectPosition={pageCover?.objectPosition}
      />

      <SectionReveal className="mx-auto max-w-6xl px-6 py-14 sm:py-20">
        {photos.length === 0 ? (
          <p className="text-muted-foreground">{t("empty")}</p>
        ) : (
          <ul className="columns-1 gap-6 sm:columns-2 lg:columns-3">
            {photos.map((photo) =>
              photo.src ? (
                <li key={photo.id} className="mb-6 break-inside-avoid">
                  <figure>
                    <div className="relative aspect-[4/5] overflow-hidden bg-muted">
                      <Image
                        src={photo.src}
                        alt={photo.alt}
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
                    </div>
                    {(photo.credit || photo.alt) && (
                      <figcaption className="mt-2 text-xs text-muted-foreground">
                        {photo.credit
                          ? `${t("credit")}: ${photo.credit}`
                          : photo.alt}
                      </figcaption>
                    )}
                  </figure>
                </li>
              ) : null,
            )}
          </ul>
        )}
      </SectionReveal>
    </main>
  );
}
