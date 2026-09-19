import { ArrowUpRightIcon } from "@phosphor-icons/react/dist/ssr";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Fragment, type ReactNode } from "react";

import { BlogCard } from "@/components/public/blog-card";
import { ArrowLink, SectionLabel } from "@/components/public/editorial";
import { EventRows } from "@/components/public/event-rows";
import { HeroDrift } from "@/components/public/hero-drift";
import { ParallaxBand } from "@/components/public/parallax-band";
import { Reveal } from "@/components/public/reveal";
import { SectionReveal } from "@/components/public/section-reveal";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { formatEventDisplay } from "@/lib/event-time";
import { DEFAULT_IMAGE_FOCUS } from "@/lib/image-focus";
import { getBioSummary } from "@/lib/public/bio";
import { listBlogPosts } from "@/lib/public/blog";
import type { PublicEvent } from "@/lib/public/events";
import { listUpcomingEvents } from "@/lib/public/events";
import { getPageCover, listHomePhotos } from "@/lib/public/site-images";
import { cn } from "@/lib/utils";

type HomePageProps = {
  params: Promise<{ locale: string }>;
};

type Translate = (key: string) => string;

export default async function HomePage({ params }: HomePageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const typedLocale = locale as Locale;

  const t = await getTranslations("Home");
  const tSchedule = await getTranslations("Schedule");
  const tBlog = await getTranslations("Blog");
  const tNav = await getTranslations("Navigation");
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
    upcoming.find((event) => event.imageUrl)?.imageUrl ??
    null;
  const heroObjectPosition =
    heroPhoto?.objectPosition ??
    homeCover?.objectPosition ??
    DEFAULT_IMAGE_FOCUS;

  const heroContent = (
    <HeroContent
      t={t}
      locale={locale}
      nextEvent={upcoming[0] ?? null}
      onPhoto={Boolean(heroImage)}
    />
  );

  const contentSections: Array<{
    id: string;
    tone: "default" | "muted";
    node: ReactNode;
  }> = [
    {
      id: "intro",
      tone: "default",
      node: (
        <SectionReveal
          variant={null}
          className="mx-auto grid max-w-6xl gap-10 px-6 py-24 sm:py-32 lg:grid-cols-[minmax(0,1fr)_minmax(0,2.3fr)] lg:gap-16"
        >
          <SectionLabel index={1} className="lg:pt-3">
            {t("bioSummaryTitle")}
          </SectionLabel>
          <div>
            {bioSummary?.summary ? (
              <p
                data-reveal="lines"
                className="text-xl leading-relaxed text-foreground/85 sm:text-2xl sm:leading-relaxed"
              >
                {bioSummary.summary}
              </p>
            ) : null}
            <div data-reveal="fade" className="mt-12 flex flex-wrap gap-4">
              <ArrowLink href="/agenda" variant="solid">
                {t("schedule")}
              </ArrowLink>
              <ArrowLink href="/bio" variant="outline">
                {t("bio")}
              </ArrowLink>
            </div>
          </div>
        </SectionReveal>
      ),
    },
    {
      id: "schedule",
      tone: "default",
      node: (
        <SectionReveal
          variant={null}
          className="mx-auto max-w-6xl px-6 py-24 sm:py-32"
        >
          <SectionLabel index={2}>{tNav("schedule")}</SectionLabel>
          <div className="mt-8 flex items-end justify-between gap-6">
            <h2
              data-reveal="lines"
              className="font-heading text-4xl tracking-tight sm:text-6xl"
            >
              {t("upcomingTitle")}
            </h2>
            <ArrowLink
              href="/agenda"
              className="hidden shrink-0 sm:inline-flex"
            >
              {t("viewAllSchedule")}
            </ArrowLink>
          </div>
          <div className="mt-12">
            {upcoming.length === 0 ? (
              <p className="text-muted-foreground">{t("upcomingEmpty")}</p>
            ) : (
              <EventRows
                events={upcoming}
                locale={locale}
                ticketsLabel={tSchedule("tickets")}
                reveal
              />
            )}
          </div>
          <ArrowLink href="/agenda" className="mt-10 sm:hidden">
            {t("viewAllSchedule")}
          </ArrowLink>
        </SectionReveal>
      ),
    },
    {
      id: "blog",
      tone: "muted",
      node: (
        <SectionReveal
          variant={null}
          className="mx-auto max-w-6xl px-6 py-24 sm:py-32"
        >
          <SectionLabel index={3}>{tNav("news")}</SectionLabel>
          <div className="mt-8 flex items-end justify-between gap-6">
            <h2
              data-reveal="lines"
              className="font-heading text-4xl tracking-tight sm:text-6xl"
            >
              {t("recentPostsTitle")}
            </h2>
            <ArrowLink href="/blog" className="hidden shrink-0 sm:inline-flex">
              {t("viewAllBlog")}
            </ArrowLink>
          </div>
          {posts.length === 0 ? (
            <p className="mt-12 text-muted-foreground">
              {t("recentPostsEmpty")}
            </p>
          ) : (
            <ul
              data-reveal="stagger"
              className="mt-12 grid gap-14 md:grid-cols-3 md:gap-8"
            >
              {posts.map((post) => (
                <li key={post.id}>
                  <BlogCard
                    post={post}
                    locale={locale}
                    readMoreLabel={tBlog("readMore")}
                  />
                </li>
              ))}
            </ul>
          )}
          <ArrowLink href="/blog" className="mt-12 sm:hidden">
            {t("viewAllBlog")}
          </ArrowLink>
        </SectionReveal>
      ),
    },
    {
      id: "contact",
      tone: "default",
      node: (
        <SectionReveal
          variant={null}
          className="mx-auto max-w-6xl px-6 py-24 sm:py-36"
        >
          <SectionLabel index={4}>{tNav("contact")}</SectionLabel>
          <Link
            href="/contato"
            className="group mt-8 flex items-end justify-between gap-6"
          >
            <span
              data-reveal="lines"
              className="font-heading text-[clamp(3rem,9.5vw,8.5rem)] leading-[1.02] tracking-[-0.02em] transition-colors duration-500 group-hover:text-primary"
            >
              {t("contactTitle")}
            </span>
            <span
              data-reveal="fade"
              aria-hidden="true"
              className="mb-3 hidden size-20 shrink-0 items-center justify-center rounded-full border border-foreground/20 transition-[background-color,border-color,color,rotate] duration-700 ease-[cubic-bezier(0.76,0,0.24,1)] group-hover:rotate-45 group-hover:border-primary group-hover:bg-primary group-hover:text-primary-foreground sm:flex lg:size-28"
            >
              <ArrowUpRightIcon className="size-7 lg:size-9" />
            </span>
          </Link>
        </SectionReveal>
      ),
    },
  ];

  return (
    <main>
      {heroImage ? (
        <ParallaxBand
          src={heroImage}
          alt={heroPhoto?.alt || t("eyebrow")}
          objectPosition={heroObjectPosition}
          priority
          variant="hero"
          headerOverlay
          intro
          className="h-svh min-h-[34rem] sm:h-svh md:h-svh lg:h-svh"
          overlayClassName="bg-[linear-gradient(to_bottom,rgb(0_0_0/0.45),transparent_28%,transparent_45%,rgb(0_0_0/0.62))]"
        >
          {heroContent}
        </ParallaxBand>
      ) : (
        <section className="relative h-[86svh] min-h-[32rem] overflow-hidden bg-[radial-gradient(circle_at_18%_12%,_oklch(0.93_0.04_20),_transparent_42%),linear-gradient(165deg,_oklch(0.985_0.01_240),_oklch(0.96_0.02_20))] dark:bg-[radial-gradient(circle_at_18%_12%,_oklch(0.3_0.04_20),_transparent_42%),linear-gradient(165deg,_oklch(0.2_0.01_240),_oklch(0.16_0.02_20))]">
          {heroContent}
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

/**
 * The opening frame: the conductor's name set large over the photo, with the
 * next concert and a scroll cue along the bottom edge.
 */
function HeroContent({
  t,
  locale,
  nextEvent,
  onPhoto,
}: {
  t: Translate;
  locale: string;
  nextEvent: PublicEvent | null;
  onPhoto: boolean;
}) {
  const next = nextEvent
    ? formatEventDisplay(nextEvent.localDate, nextEvent.localTime, locale)
    : null;

  return (
    <HeroDrift
      className={cn(
        "relative mx-auto flex h-full w-full max-w-6xl flex-col justify-end px-6 pb-12 sm:pb-16",
        onPhoto ? "text-white" : "text-foreground",
      )}
    >
      <Reveal
        as="p"
        variant="fade"
        immediate
        delay={1.3}
        className="mb-4 text-xs tracking-[0.32em] uppercase opacity-85"
      >
        {t("role")}
      </Reveal>
      <Reveal
        as="h1"
        variant="chars"
        immediate
        delay={0.75}
        className="font-heading text-[clamp(3.25rem,11vw,10rem)] leading-none tracking-[-0.025em]"
      >
        {t("eyebrow")}
      </Reveal>

      <Reveal
        variant="fade"
        immediate
        delay={1.55}
        className="mt-10 flex items-end justify-between gap-8 border-t border-current/25 pt-6"
      >
        {nextEvent && next ? (
          <Link href="/agenda" className="group block max-w-md">
            <span className="block text-xs tracking-[0.25em] uppercase opacity-75">
              {t("nextConcert")}
            </span>
            <span className="mt-2 block font-heading text-xl tracking-tight sm:text-2xl">
              <span className="link-underline">{nextEvent.title}</span>
            </span>
            <span className="mt-1 block text-sm opacity-80">
              {next.dayMonth} {next.year} · {next.time} · {nextEvent.venue}
            </span>
          </Link>
        ) : (
          <span />
        )}
        <span
          className="hidden shrink-0 items-center gap-3 text-xs tracking-[0.25em] uppercase opacity-75 sm:flex"
          aria-hidden="true"
        >
          {t("scroll")}
          <span className="relative block h-12 w-px overflow-hidden bg-current/25">
            <span className="scroll-cue-line absolute inset-0 bg-current" />
          </span>
        </span>
      </Reveal>
    </HeroDrift>
  );
}
