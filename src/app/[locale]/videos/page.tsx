import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { PageHero } from "@/components/public/page-hero";
import { SectionReveal } from "@/components/public/section-reveal";
import type { Locale } from "@/i18n/routing";
import { listVideos } from "@/lib/public/media";
import { getPageCover } from "@/lib/public/site-images";

type VideosPageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({
  params,
}: VideosPageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Videos" });
  return { title: t("title") };
}

export default async function VideosPage({ params }: VideosPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Videos");
  const [videos, pageCover] = await Promise.all([
    listVideos(locale as Locale),
    getPageCover("videos"),
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
        {videos.length === 0 ? (
          <p className="text-muted-foreground">{t("empty")}</p>
        ) : (
          <ul className="grid gap-10 md:grid-cols-2">
            {videos.map((video) => (
              <li key={video.id} className="space-y-4">
                {video.youtubeId ? (
                  <div className="aspect-video overflow-hidden bg-muted">
                    <iframe
                      title={video.title}
                      src={`https://www.youtube-nocookie.com/embed/${video.youtubeId}`}
                      className="size-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                ) : null}
                <div>
                  <h2 className="font-heading text-2xl tracking-tight">
                    {video.title}
                  </h2>
                  {video.description ? (
                    <p className="mt-2 text-muted-foreground">
                      {video.description}
                    </p>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        )}
      </SectionReveal>
    </main>
  );
}
