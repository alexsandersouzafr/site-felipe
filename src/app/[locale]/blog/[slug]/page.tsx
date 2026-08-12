import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { BlogBlocksView } from "@/components/public/blog-blocks-view";
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
      <section className="relative min-h-[42vh] overflow-hidden">
        {post.coverUrl ? (
          <Image
            src={post.coverUrl}
            alt=""
            fill
            priority
            className="object-cover"
            sizes="100vw"
          />
        ) : null}
        <div
          className={
            post.coverUrl
              ? "absolute inset-0 bg-gradient-to-t from-background/50 via-background/10 to-transparent"
              : "absolute inset-0 bg-[linear-gradient(165deg,_oklch(0.985_0.01_240),_oklch(0.96_0.02_20))]"
          }
        />
        <div className="relative mx-auto flex min-h-[42vh] max-w-3xl flex-col justify-end px-6 pb-12 pt-24">
          <Link
            href="/blog"
            className="mb-6 text-sm text-muted-foreground underline-offset-4 hover:underline"
          >
            {t("backToList")}
          </Link>
          <h1 className="font-heading animate-in fade-in slide-in-from-bottom-2 text-4xl tracking-tight duration-700 sm:text-5xl">
            {post.title}
          </h1>
        </div>
      </section>

      <SectionReveal className="mx-auto max-w-3xl px-6 py-14">
        <BlogBlocksView blocks={post.blocks} />
      </SectionReveal>
    </main>
  );
}
