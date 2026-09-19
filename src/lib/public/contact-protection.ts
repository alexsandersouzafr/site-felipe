import { createHmac, timingSafeEqual } from "node:crypto";
import { isIP } from "node:net";

/**
 * Server-side helpers that keep bots away from the contact form. None of them
 * is enough alone; the action layers them (see `submitContactMessage`) and the
 * database enforces its own limits on top.
 */

// ---------------------------------------------------------------------------
// Form token: proof the form was loaded a moment ago, not posted blindly.
// ---------------------------------------------------------------------------

/** A person needs a few seconds to fill in four fields; scripts do not. */
export const MIN_FILL_MS = 3_000;
/** Older than this, the page has been open too long to trust. */
export const MAX_FORM_AGE_MS = 2 * 60 * 60 * 1000;

function formSecret() {
  return (
    process.env.CONTACT_FORM_SECRET ||
    process.env.CONTACT_IP_HASH_SALT ||
    "site-felipe-contact-form"
  );
}

function sign(value: string, secret: string) {
  return createHmac("sha256", secret).update(value).digest("hex");
}

/** `<issued at, ms>.<HMAC of it>`, rendered into the form as a hidden field. */
export function createFormToken(now = Date.now(), secret = formSecret()) {
  const issuedAt = String(now);
  return `${issuedAt}.${sign(issuedAt, secret)}`;
}

export type FormTokenCheck = "ok" | "invalid" | "tooFast" | "expired";

export function checkFormToken(
  token: string | null | undefined,
  now = Date.now(),
  secret = formSecret(),
): FormTokenCheck {
  const parts = String(token ?? "").split(".");
  const [issuedAt, signature] = parts;

  if (parts.length !== 2 || !issuedAt || !signature) {
    return "invalid";
  }

  if (!/^\d{10,15}$/.test(issuedAt)) {
    return "invalid";
  }

  const expected = Buffer.from(sign(issuedAt, secret));
  const received = Buffer.from(signature);

  if (
    expected.length !== received.length ||
    !timingSafeEqual(expected, received)
  ) {
    return "invalid";
  }

  const age = now - Number(issuedAt);

  if (age < 0) {
    return "invalid";
  }

  if (age < MIN_FILL_MS) {
    return "tooFast";
  }

  return age > MAX_FORM_AGE_MS ? "expired" : "ok";
}

// ---------------------------------------------------------------------------
// Who is sending
// ---------------------------------------------------------------------------

/**
 * The address the request really came from. `x-real-ip` is set by the proxy in
 * front of the app; otherwise the *last* `x-forwarded-for` entry is the one that
 * proxy appended. The first entry is whatever the client chose to send, so it
 * is never used: a visitor could change it on every request to dodge the limit.
 */
export function clientIpFromHeaders(get: (name: string) => string | null) {
  const candidates = [
    get("x-real-ip"),
    get("x-forwarded-for")?.split(",").at(-1),
  ];

  for (const candidate of candidates) {
    const ip = candidate?.trim();
    if (ip && isIP(ip)) {
      return ip;
    }
  }

  return null;
}

// ---------------------------------------------------------------------------
// Cloudflare Turnstile (optional CAPTCHA)
// ---------------------------------------------------------------------------

/** Turnstile is on only when both keys are configured. */
export function turnstileKeys() {
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  const secretKey = process.env.TURNSTILE_SECRET_KEY;

  return siteKey && secretKey ? { siteKey, secretKey } : null;
}

const TURNSTILE_VERIFY_URL =
  "https://challenges.cloudflare.com/turnstile/v0/siteverify";

/** Asks Cloudflare whether the token is genuine. Fails closed on any error. */
export async function verifyTurnstileToken({
  token,
  secretKey,
  ip,
  fetchImpl = fetch,
}: {
  token: string;
  secretKey: string;
  ip?: string | null;
  fetchImpl?: typeof fetch;
}) {
  if (!token) {
    return false;
  }

  const body = new URLSearchParams({ secret: secretKey, response: token });
  if (ip) {
    body.set("remoteip", ip);
  }

  try {
    const response = await fetchImpl(TURNSTILE_VERIFY_URL, {
      method: "POST",
      body,
      signal: AbortSignal.timeout(5_000),
    });
    const result = (await response.json()) as { success?: boolean };

    return result.success === true;
  } catch {
    return false;
  }
}
