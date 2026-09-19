import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { BlogCard } from "@/components/public/blog-card";
import { PageHero } from "@/components/public/page-hero";
import { PublicPaginationNav } from "@/components/public/pagination-nav";
import { SectionReveal } from "@/components/public/section-reveal";
import type { Locale } from "@/i18n/routing";
import { PUBLIC_PAGE_SIZE, parsePage } from "@/lib/pagination";
import { listBlogPostsPage } from "@/lib/public/blog";
import { getPageCover } from "@/lib/public/site-images";

type BlogPageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ page?: string }>;
};

export async function generateMetadata({
  params,
}: BlogPageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Blog" });
  return { title: t("title") };
}

export default async function BlogPage({
  params,
  searchParams,
}: BlogPageProps) {
  const { locale } = await params;
  const requestedPage = parsePage((await searchParams).page);
  setRequestLocale(locale);
  const t = await getTranslations("Blog");
  const [{ posts, page, totalPages }, pageCover] = await Promise.all([
    listBlogPostsPage(locale as Locale, requestedPage, PUBLIC_PAGE_SIZE),
    getPageCover("blog"),
  ]);

  const featured = page === 1 ? (posts[0] ?? null) : null;
  const rest = featured ? posts.slice(1) : posts;

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
        {posts.length === 0 ? (
          <p className="text-muted-foreground">{t("empty")}</p>
        ) : (
          <>
            {/* The newest post opens the blog, large; the rest follow in a grid. */}
            {featured ? (
              <div data-reveal="fade" className="mb-20 sm:mb-28">
                <BlogCard
                  post={featured}
                  locale={locale}
                  readMoreLabel={t("readMore")}
                  variant="feature"
                  headingLevel="h2"
                />
              </div>
            ) : null}
            {rest.length > 0 ? (
              <ul
                data-reveal="stagger"
                className="grid gap-x-8 gap-y-16 md:grid-cols-2 lg:grid-cols-3"
              >
                {rest.map((post) => (
                  <li key={post.id}>
                    <BlogCard
                      post={post}
                      locale={locale}
                      readMoreLabel={t("readMore")}
                      headingLevel="h2"
                    />
                  </li>
                ))}
              </ul>
            ) : null}
          </>
        )}
        <PublicPaginationNav
          basePath="/blog"
          page={page}
          totalPages={totalPages}
        />
      </SectionReveal>
    </main>
  );
}
