import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Fragment, type ReactNode } from "react";

import { ParallaxBand } from "@/components/public/parallax-band";
import { SectionReveal } from "@/components/public/section-reveal";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { DEFAULT_IMAGE_FOCUS } from "@/lib/image-focus";
import { getBioSummary } from "@/lib/public/bio";
import { listBlogPosts } from "@/lib/public/blog";
import { listUpcomingEvents } from "@/lib/public/events";
import { getPageCover, listHomePhotos } from "@/lib/public/site-images";

type HomePageProps = {
  params: Promise<{ locale: string }>;
};

export default async function HomePage({ params }: HomePageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const typedLocale = locale as Locale;

  const t = await getTranslations("Home");
  const [upcoming, posts, bioSummary, homePhotos, homeCover] =
    await Promise.all([
      listUpcomingEvents(typedLocale, 3),
      listBlogPosts(typedLocale, 3),
      getBioSummary(typedLocale),
      listHomePhotos(typedLocale),
      getPageCover("home"),
    ]);

  const bySlot = new Map(homePhotos.map((photo) => [photo.slot, photo]));
  const heroPhoto = bySlot.get("hero") ?? null;
  const bands = [bySlot.get("band_1") ?? null, bySlot.get("band_2") ?? null];

  const heroImage =
    heroPhoto?.src ??
    homeCover?.src ??
    bioSummary?.imageUrl ??
    upcoming.find((event) => event.imageUrl)?.imageUrl ??
    null;
  const heroObjectPosition =
    heroPhoto?.objectPosition ??
    homeCover?.objectPosition ??
    DEFAULT_IMAGE_FOCUS;

  const contentSections: Array<{
    id: string;
    tone: "default" | "muted";
    node: ReactNode;
  }> = [
    {
      id: "intro",
      tone: "default",
      node: (
        <SectionReveal className="mx-auto max-w-6xl px-6 py-20 sm:py-28">
          <IntroCopy t={t} bioSummary={bioSummary?.summary} />
        </SectionReveal>
      ),
    },
  ];

  contentSections.push({
    id: "schedule",
    tone: "default",
    node: (
      <SectionReveal className="mx-auto max-w-6xl px-6 py-20">
        <div className="mb-8 flex items-end justify-between gap-4">
          <h2 className="font-heading text-3xl tracking-tight sm:text-4xl">
            {t("upcomingTitle")}
          </h2>
          <Link
            href="/agenda"
            className="text-sm text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
          >
            {t("viewAllSchedule")}
          </Link>
        </div>
        {upcoming.length === 0 ? (
          <p className="text-muted-foreground">{t("upcomingEmpty")}</p>
        ) : (
          <ul className="divide-y divide-border/70">
            {upcoming.map((event) => (
              <li
                key={event.id}
                className="flex flex-col gap-1 py-5 sm:flex-row sm:items-baseline sm:justify-between"
              >
                <div>
                  <p className="font-heading text-xl tracking-tight">
                    {event.title}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {event.venue} · {event.city}
                  </p>
                </div>
                <p className="text-sm tabular-nums text-muted-foreground">
                  {event.localDate} · {event.localTime}
                </p>
              </li>
            ))}
          </ul>
        )}
      </SectionReveal>
    ),
  });

  contentSections.push({
    id: "blog",
    tone: "muted",
    node: (
      <SectionReveal>
        <div className="mx-auto max-w-6xl px-6 py-20">
          <div className="mb-8 flex items-end justify-between gap-4">
            <h2 className="font-heading text-3xl tracking-tight sm:text-4xl">
              {t("recentPostsTitle")}
            </h2>
            <Link
              href="/blog"
              className="text-sm text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
            >
              {t("viewAllBlog")}
            </Link>
          </div>
          {posts.length === 0 ? (
            <p className="text-muted-foreground">{t("recentPostsEmpty")}</p>
          ) : (
            <ul className="grid gap-10 md:grid-cols-3">
              {posts.map((post) => (
                <li key={post.id}>
                  <Link href={`/blog/${post.slug}`} className="group block">
                    {post.coverUrl ? (
                      <div className="relative mb-4 aspect-[4/3] overflow-hidden bg-muted">
                        <Image
                          src={post.coverUrl}
                          alt=""
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                          sizes="(max-width: 768px) 100vw, 33vw"
                        />
                      </div>
                    ) : null}
                    <h3 className="font-heading text-xl tracking-tight transition-colors group-hover:text-primary">
                      {post.title}
                    </h3>
                    {post.excerpt ? (
                      <p className="mt-2 line-clamp-4 text-sm leading-relaxed text-muted-foreground">
                        {post.excerpt}
                      </p>
                    ) : null}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </SectionReveal>
    ),
  });

  return (
    <main>
      {heroImage ? (
        <ParallaxBand
          src={heroImage}
          alt={heroPhoto?.alt || t("eyebrow")}
          objectPosition={heroObjectPosition}
          priority
          variant="hero"
        />
      ) : (
        <section
          className="relative h-[58svh] min-h-[22rem] overflow-hidden sm:h-[68svh] md:h-[74svh] lg:h-[min(80vh,48rem)]"
          aria-hidden
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_12%,_oklch(0.93_0.04_20),_transparent_42%),linear-gradient(165deg,_oklch(0.985_0.01_240),_oklch(0.96_0.02_20))] dark:bg-[radial-gradient(circle_at_18%_12%,_oklch(0.3_0.04_20),_transparent_42%),linear-gradient(165deg,_oklch(0.2_0.01_240),_oklch(0.16_0.02_20))]" />
        </section>
      )}

      {contentSections.map((section, index) => {
        const band =
          index < contentSections.length - 1 ? (bands[index] ?? null) : null;
        const surface = section.tone === "muted" ? "bg-muted" : "bg-background";

        return (
          <Fragment key={section.id}>
            <div className={surface}>{section.node}</div>
            {band ? (
              <ParallaxBand
                src={band.src}
                alt={band.alt}
                objectPosition={band.objectPosition}
                variant="band"
              />
            ) : null}
          </Fragment>
        );
      })}
    </main>
  );
}

function IntroCopy({
  t,
  bioSummary,
}: {
  t: (key: string) => string;
  bioSummary?: string;
}) {
  return (
    <div className="max-w-3xl">
      <p className="font-heading mb-4 text-4xl tracking-tight sm:text-6xl md:text-7xl">
        {t("eyebrow")}
      </p>
      <h1 className="max-w-2xl text-xl text-muted-foreground sm:text-2xl">
        {t("title")}
      </h1>
      <p className="mt-5 max-w-xl text-base text-muted-foreground sm:text-lg">
        {t("description")}
      </p>
      {bioSummary ? (
        <p className="mt-8 text-lg leading-relaxed text-muted-foreground">
          {bioSummary}
        </p>
      ) : null}
      <div className="mt-10 flex flex-col gap-3 sm:flex-row">
        <Link
          href="/agenda"
          className="inline-flex h-11 items-center justify-center bg-primary px-5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/85"
        >
          {t("schedule")}
        </Link>
        <Link
          href="/bio"
          className="inline-flex h-11 items-center justify-center border border-border bg-background px-5 text-sm font-medium transition-colors hover:bg-muted"
        >
          {t("bio")}
        </Link>
      </div>
    </div>
  );
}
