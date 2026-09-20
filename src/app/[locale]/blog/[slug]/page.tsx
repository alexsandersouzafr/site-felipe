import { ArrowLeftIcon } from "@phosphor-icons/react/dist/ssr";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { BlogBlocksView } from "@/components/public/blog-blocks-view";
import { PageHero } from "@/components/public/page-hero";
import { SectionReveal } from "@/components/public/section-reveal";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { getBlogPostBySlug } from "@/lib/public/blog";

type BlogPostPageProps = {
  params: Promise<{ locale: string; slug: string }>;
};

export async function generateMetadata({
  params,
}: BlogPostPageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const post = await getBlogPostBySlug(slug, locale as Locale);
  if (!post) {
    return {};
  }
  return { title: post.title };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Blog");
  const post = await getBlogPostBySlug(slug, locale as Locale);

  if (!post) {
    notFound();
  }

  return (
    <main>
      {/* The same hero as the other pages, with the stronger veil: a post
          title runs long, so the cover has to dissolve higher up to keep it
          readable over any photo. */}
      <PageHero title={post.title} imageUrl={post.coverUrl} veil="strong" />

      <SectionReveal variant={null} className="mx-auto max-w-3xl px-6 py-14">
        <Link
          href="/blog"
          data-reveal="fade"
          className="group inline-flex items-center gap-3 text-xs tracking-[0.2em] uppercase"
        >
          <ArrowLeftIcon className="size-4 transition-transform duration-500 ease-[cubic-bezier(0.76,0,0.24,1)] group-hover:-translate-x-1" />
          <span className="link-underline">{t("backToList")}</span>
        </Link>

        <div data-reveal="fade" className="mt-10">
          <BlogBlocksView blocks={post.blocks} />
        </div>
      </SectionReveal>
    </main>
  );
}
