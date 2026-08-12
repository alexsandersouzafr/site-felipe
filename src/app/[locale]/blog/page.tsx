import type { Metadata } from "next";
import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { PageHero } from "@/components/public/page-hero";
import { SectionReveal } from "@/components/public/section-reveal";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { listBlogPosts } from "@/lib/public/blog";
import { getPageCover } from "@/lib/public/site-images";

type BlogPageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({
  params,
}: BlogPageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Blog" });
  return { title: t("title") };
}

export default async function BlogPage({ params }: BlogPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Blog");
  const [posts, pageCover] = await Promise.all([
    listBlogPosts(locale as Locale),
    getPageCover("blog"),
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
        {posts.length === 0 ? (
          <p className="text-muted-foreground">{t("empty")}</p>
        ) : (
          <ul className="grid gap-12 md:grid-cols-2">
            {posts.map((post) => (
              <li key={post.id}>
                <Link href={`/blog/${post.slug}`} className="group block">
                  {post.coverUrl ? (
                    <div className="relative mb-5 aspect-[16/10] overflow-hidden bg-muted">
                      <Image
                        src={post.coverUrl}
                        alt=""
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                        sizes="(max-width: 768px) 100vw, 50vw"
                      />
                    </div>
                  ) : null}
                  <h2 className="font-heading text-2xl tracking-tight transition-colors group-hover:text-primary sm:text-3xl">
                    {post.title}
                  </h2>
                  {post.excerpt ? (
                    <p className="mt-3 line-clamp-4 text-sm leading-relaxed text-muted-foreground">
                      {post.excerpt}
                    </p>
                  ) : null}
                  <p className="mt-3 text-sm text-foreground/80">
                    {t("readMore")}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </SectionReveal>
    </main>
  );
}
