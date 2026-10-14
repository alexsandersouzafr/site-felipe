export type SpamReason = "impersonated-domain" | "site-services-pitch";

export type SpamVerdict = { spam: false } | { spam: true; reason: SpamReason };

export type SiteIdentity = {
  /** "maestrofelipemagalhaes.com" */
  host: string;
  /** "maestrofelipemagalhaes": the part a lookalike domain has to copy. */
  brand: string;
};

/** Shown in the admin next to a quarantined message. */
export const SPAM_REASON_LABELS: Record<SpamReason, string> = {
  "impersonated-domain": "E-mail de um domínio que imita o do site",
  "site-services-pitch": "Oferta de serviços (SEO, Google, sites) para o site",
};

/** Shorter than this, a brand would turn up inside unrelated domains. */
const MIN_BRAND_LENGTH = 8;

/**
 * The site's own address, used when the configured one is not a public
 * domain — on a local machine NEXT_PUBLIC_SITE_URL is localhost, and a
 * lookalike of "localhost" catches nothing.
 */
export const CANONICAL_SITE_URL = "https://maestrofelipemagalhaes.com";

/** A host that could not be anyone's public site. */
function isLocalHost(host: string) {
  return (
    host === "localhost" ||
    host.endsWith(".localhost") ||
    /^\d{1,3}(\.\d{1,3}){3}$/.test(host) ||
    host.startsWith("[")
  );
}

export function siteIdentity(siteUrl: string | null | undefined) {
  if (!siteUrl) {
    return null;
  }

  try {
    const host = new URL(siteUrl).hostname.replace(/^www\./, "").toLowerCase();
    const brand = host.split(".")[0] ?? "";

    if (isLocalHost(host) || brand.length < MIN_BRAND_LENGTH) {
      return null;
    }

    return { host, brand };
  } catch {
    return null;
  }
}

/** The first usable identity among the candidates, else the canonical one. */
export function resolveSiteIdentity(
  ...candidates: Array<string | null | undefined>
) {
  for (const candidate of candidates) {
    const identity = siteIdentity(candidate);

    if (identity) {
      return identity;
    }
  }

  return siteIdentity(CANONICAL_SITE_URL);
}

function plain(text: string) {
  return text.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase();
}

/** Letters and digits only, so "search-maestro.felipe" still contains it. */
function squash(text: string) {
  return plain(text).replace(/[^a-z0-9]/g, "");
}

/** "Your site" in the three languages the site speaks. */
const ABOUT_THE_SITE = /\b(your (web)?site|seu site|o site|votre site)\b/;

/**
 * Selling something *to the site*. Every pattern is a service pitch, not a
 * topic a concert inquiry would raise: "Google" alone is not here, since
 * "found you on Google" is a perfectly good first line.
 */
const SERVICES_PITCH =
  /\b(seo|search (engine|index|results|console)|google'?s? (search|index|ranking)|indice do google|backlinks?|rank(ing)? (higher|first|#?1)|web ?design|website (design|redesign|development|revamp|update)|app development|desenvolvimento de (sites|aplicativos|apps)|digital marketing|marketing digital)\b/;

/**
 * Decides whether a contact message goes to the admin's spam folder.
 *
 * Quarantine, not rejection: the sender sees the same success either way (a
 * bot told it was caught learns to dodge), and anything misjudged is one click
 * away from the inbox. The rules are kept narrow so that a real invitation
 * almost never lands there.
 */
export function classifyContactMessage(
  message: { email: string; subject: string; message: string },
  site: SiteIdentity | null,
): SpamVerdict {
  const domain = message.email.split("@")[1]?.toLowerCase() ?? "";

  // A lookalike of the site's own domain is only ever used to look official:
  // "domains@search-maestrofelipemagalhaes.com".
  if (
    site &&
    domain &&
    domain !== site.host &&
    domain !== `www.${site.host}` &&
    squash(domain).includes(squash(site.brand))
  ) {
    return { spam: true, reason: "impersonated-domain" };
  }

  const text = plain(`${message.subject} ${message.message}`);
  const mentionsSite =
    ABOUT_THE_SITE.test(text) ||
    (site !== null && (text.includes(site.host) || text.includes(site.brand)));

  if (mentionsSite && SERVICES_PITCH.test(text)) {
    return { spam: true, reason: "site-services-pitch" };
  }

  return { spam: false };
}
