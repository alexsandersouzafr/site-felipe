import Link from "next/link";
import { getTranslations, setRequestLocale } from "next-intl/server";

import type { Locale } from "@/i18n/routing";

type HomePageProps = {
  params: Promise<{ locale: string }>;
};

export default async function HomePage({ params }: HomePageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("Home");
  const typedLocale = locale as Locale;

  return (
    <main className="relative min-h-screen overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_oklch(0.97_0.02_20),_transparent_55%),linear-gradient(180deg,_var(--background),_oklch(0.97_0.01_240))]" />
      <div className="relative mx-auto flex min-h-screen max-w-5xl flex-col justify-center px-6 py-16">
        <p className="mb-4 text-sm tracking-[0.2em] text-muted-foreground uppercase">
          {t("eyebrow")}
        </p>
        <h1 className="font-heading max-w-3xl text-4xl leading-tight tracking-tight sm:text-6xl">
          {t("title")}
        </h1>
        <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
          {t("description")}
        </p>
        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <Link
            href={`/${typedLocale}/agenda`}
            className="inline-flex h-9 items-center justify-center rounded-2xl bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/80"
          >
            {t("schedule")}
          </Link>
          <Link
            href={`/${typedLocale}/bio`}
            className="inline-flex h-9 items-center justify-center rounded-2xl border border-border bg-background px-4 text-sm font-medium transition-colors hover:bg-muted"
          >
            {t("bio")}
          </Link>
        </div>
      </div>
    </main>
  );
}
