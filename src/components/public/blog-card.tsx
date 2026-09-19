import Image from "next/image";

import { Link } from "@/i18n/navigation";
import type { PublicBlogPostSummary } from "@/lib/public/blog";
import { cn } from "@/lib/utils";

function formatDate(
  value: string,
  locale: string,
  options: Intl.DateTimeFormatOptions,
) {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? ""
    : new Intl.DateTimeFormat(locale, { timeZone: "UTC", ...options }).format(
        date,
      );
}

/** Stands in for a missing cover: the day of the post, set large. */
function TypographicCover({ date, locale }: { date: string; locale: string }) {
  return (
    <div className="absolute inset-0 flex flex-col justify-between bg-[color-mix(in_oklch,var(--primary)_6%,var(--background))] p-6 transition-colors duration-700 group-hover:bg-[color-mix(in_oklch,var(--primary)_11%,var(--background))]">
      <span className="text-xs tracking-[0.25em] text-muted-foreground uppercase">
        {formatDate(date, locale, { month: "long", year: "numeric" })}
      </span>
      <span className="font-heading text-8xl leading-none tracking-tight text-primary/85 transition-transform duration-700 ease-[cubic-bezier(0.76,0,0.24,1)] group-hover:-translate-y-1">
        {formatDate(date, locale, { day: "2-digit" })}
      </span>
    </div>
  );
}

/**
 * A post as a card. `feature` is the large one that opens the blog: picture
 * on one side, title and excerpt on the other.
 */
export function BlogCard({
  post,
  locale,
  readMoreLabel,
  variant = "card",
  headingLevel = "h3",
}: {
  post: PublicBlogPostSummary;
  locale: string;
  readMoreLabel: string;
  variant?: "card" | "feature";
  headingLevel?: "h2" | "h3";
}) {
  const Heading = headingLevel;
  const feature = variant === "feature";

  return (
    <Link
      href={`/blog/${post.slug}`}
      className={cn(
        "group block",
        feature &&
          "grid gap-8 md:grid-cols-[1.35fr_1fr] md:items-end md:gap-12",
      )}
    >
      <div
        data-reveal="image"
        className={cn(
          "relative overflow-hidden bg-muted",
          feature ? "aspect-[16/11]" : "aspect-[4/3]",
        )}
      >
        {post.coverUrl ? (
          <Image
            src={post.coverUrl}
            alt=""
            fill
            className="object-cover transition-[scale] duration-1000 ease-[cubic-bezier(0.76,0,0.24,1)] group-hover:scale-[1.04]"
            sizes={
              feature
                ? "(max-width: 768px) 100vw, 60vw"
                : "(max-width: 768px) 100vw, 33vw"
            }
          />
        ) : (
          <TypographicCover date={post.publishedAt} locale={locale} />
        )}
      </div>

      <div className={cn(!feature && "mt-6")}>
        <p className="text-xs tracking-[0.2em] text-muted-foreground uppercase">
          {formatDate(post.publishedAt, locale, {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </p>
        <Heading
          className={cn(
            "mt-3 font-heading tracking-tight transition-colors duration-500 group-hover:text-primary",
            feature ? "text-3xl sm:text-5xl" : "text-2xl",
          )}
        >
          {post.title}
        </Heading>
        {post.excerpt ? (
          <p
            className={cn(
              "mt-4 leading-relaxed text-muted-foreground",
              feature ? "line-clamp-4 text-base" : "line-clamp-3 text-sm",
            )}
          >
            {post.excerpt}
          </p>
        ) : null}
        <span className="link-underline mt-5 inline-block text-xs tracking-[0.2em] uppercase">
          {readMoreLabel}
        </span>
      </div>
    </Link>
  );
}
