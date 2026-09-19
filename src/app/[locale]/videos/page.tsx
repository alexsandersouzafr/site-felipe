import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { PageHero } from "@/components/public/page-hero";
import { SectionReveal } from "@/components/public/section-reveal";
import { VideoPlayer } from "@/components/public/video-player";
import type { Locale } from "@/i18n/routing";
import { listVideos, type PublicVideo } from "@/lib/public/media";
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
        imageUrl={pageCover?.src}
        objectPosition={pageCover?.objectPosition}
      />

      <SectionReveal
        variant={null}
        className="mx-auto max-w-6xl px-6 py-20 sm:py-28"
      >
        {videos.length === 0 ? (
          <p className="text-muted-foreground">{t("empty")}</p>
        ) : (
          <>
            <VideoItem video={videos[0]} playLabel={t("play")} featured />
            {videos.length > 1 ? (
              <ul
                data-reveal="stagger"
                className="mt-20 grid gap-x-8 gap-y-16 md:grid-cols-2"
              >
                {videos.slice(1).map((video) => (
                  <li key={video.id}>
                    <VideoItem video={video} playLabel={t("play")} />
                  </li>
                ))}
              </ul>
            ) : null}
          </>
        )}
      </SectionReveal>
    </main>
  );
}

function VideoItem({
  video,
  playLabel,
  featured = false,
}: {
  video: PublicVideo;
  playLabel: string;
  featured?: boolean;
}) {
  const Heading = featured ? "h2" : "h3";

  return (
    <article>
      {video.youtubeId ? (
        <div
          data-reveal={featured ? "image" : undefined}
          className="relative aspect-video overflow-hidden bg-muted"
        >
          <VideoPlayer
            youtubeId={video.youtubeId}
            title={video.title}
            playLabel={playLabel}
            featured={featured}
          />
        </div>
      ) : null}
      <div
        data-reveal={featured ? "fade" : undefined}
        className={featured ? "mt-8 max-w-3xl" : "mt-5"}
      >
        <Heading
          className={
            featured
              ? "font-heading text-3xl tracking-tight sm:text-5xl"
              : "font-heading text-2xl tracking-tight"
          }
        >
          {video.title}
        </Heading>
        {video.description ? (
          <p
            className={
              featured
                ? "mt-4 text-lg leading-relaxed text-muted-foreground"
                : "mt-2 line-clamp-3 text-muted-foreground"
            }
          >
            {video.description}
          </p>
        ) : null}
      </div>
    </article>
  );
}
