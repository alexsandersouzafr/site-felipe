import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { type Locale, routing } from "@/i18n/routing";
import { CANONICAL_SITE_URL } from "@/lib/public/contact-spam";
import { getShareImage } from "@/lib/public/share-image";

export const SITE_NAME = "Felipe Magalhães";

export const OG_IMAGE_SIZE = { width: 1200, height: 630 };

/**
 * Where absolute URLs in the metadata point. In production always the public
 * domain, whatever the host's settings say (share cards pointing anywhere else
 * would be broken for good once a network has cached them); locally the dev
 * server, so the tags can be checked.
 */
export const SITE_URL =
  process.env.NODE_ENV === "production"
    ? CANONICAL_SITE_URL
    : process.env.NEXT_PUBLIC_SITE_URL || CANONICAL_SITE_URL;

const OG_LOCALES: Record<Locale, string> = {
  pt: "pt_BR",
  en: "en_US",
  fr: "fr_FR",
};

const HREF_LANGS: Record<Locale, string> = { pt: "pt-BR", en: "en", fr: "fr" };

function localizedPath(locale: Locale, path: string) {
  return path === "/" ? `/${locale}` : `/${locale}${path}`;
}

/**
 * Title, description, canonical address, the other languages and the share
 * card of a public page. `path` is the page without its locale ("/bio");
 * leaving `title` out gives the site's name alone, as on the home page.
 */
export async function pageMetadata({
  locale: localeParam,
  path,
  title,
  description,
}: {
  locale: string;
  path: string;
  title?: string;
  description?: string | null;
}): Promise<Metadata> {
  const locale = (
    routing.locales.includes(localeParam as Locale)
      ? localeParam
      : routing.defaultLocale
  ) as Locale;
  const t = await getTranslations({ locale, namespace: "Metadata" });
  const share = await getShareImage();
  const fullTitle = title ? `${title} | ${SITE_NAME}` : SITE_NAME;
  const text = description?.trim() || t("description");
  const url = localizedPath(locale, path);
  const images = share
    ? [
        {
          url: `/og.jpg?v=${share.version}`,
          ...OG_IMAGE_SIZE,
          alt: SITE_NAME,
          type: "image/jpeg",
        },
      ]
    : undefined;

  return {
    ...(title ? { title } : {}),
    description: text,
    alternates: {
      canonical: url,
      languages: {
        ...Object.fromEntries(
          routing.locales.map((other) => [
            HREF_LANGS[other],
            localizedPath(other, path),
          ]),
        ),
        "x-default": localizedPath(routing.defaultLocale, path),
      },
    },
    openGraph: {
      type: "website",
      siteName: SITE_NAME,
      locale: OG_LOCALES[locale],
      alternateLocale: routing.locales
        .filter((other) => other !== locale)
        .map((other) => OG_LOCALES[other]),
      url,
      title: fullTitle,
      description: text,
      images,
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description: text,
      images,
    },
  };
}
