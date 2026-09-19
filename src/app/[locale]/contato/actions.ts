"use server";

import { createHash } from "node:crypto";
import { headers } from "next/headers";

import {
  countLinks,
  MAX_LINKS_IN_MESSAGE,
  parseContactMessage,
} from "@/lib/public/contact";
import {
  checkFormToken,
  clientIpFromHeaders,
  turnstileKeys,
  verifyTurnstileToken,
} from "@/lib/public/contact-protection";
import { createClient } from "@/lib/supabase/server";

export type ContactFormState =
  | { status: "idle" }
  | { status: "success" }
  | {
      status: "error";
      message:
        | "validation"
        | "rateLimited"
        | "server"
        | "tooFast"
        | "expired"
        | "tooManyLinks"
        | "captcha";
    };

/** Non-secret by design: this only needs to be unguessable enough to stop
 * casual IP-hash lookups, not to resist a motivated attacker. */
const IP_HASH_SALT = process.env.CONTACT_IP_HASH_SALT || "site-felipe-contact";

function hashIp(ip: string | null) {
  return ip
    ? createHash("sha256").update(`${IP_HASH_SALT}:${ip}`).digest("hex")
    : null;
}

/**
 * Layers, cheapest first. Anyone can also call the database directly with the
 * public key, so the same limits live there too (see the contact hardening
 * migration); these checks keep bots away from it and give people a clear
 * message.
 *
 *  1. honeypot: a hidden field no person fills in
 *  2. form token: signed, proves the page was loaded a few seconds ago
 *  3. Turnstile CAPTCHA, when its keys are configured
 *  4. validation and cleaning of every field
 *  5. links: spam is mostly links
 *  6. insert, where the database applies the per-visitor, per-address and
 *     overall rate limits
 */
export async function submitContactMessage(
  _prev: ContactFormState,
  formData: FormData,
): Promise<ContactFormState> {
  // Report success instead of telling a bot it was caught.
  if (String(formData.get("website") ?? "").trim()) {
    return { status: "success" };
  }

  const tokenCheck = checkFormToken(String(formData.get("formToken") ?? ""));
  if (tokenCheck === "tooFast") {
    return { status: "error", message: "tooFast" };
  }
  if (tokenCheck !== "ok") {
    return { status: "error", message: "expired" };
  }

  const headerList = await headers();
  const ip = clientIpFromHeaders((name) => headerList.get(name));

  const turnstile = turnstileKeys();
  if (turnstile) {
    const passed = await verifyTurnstileToken({
      token: String(formData.get("cf-turnstile-response") ?? ""),
      secretKey: turnstile.secretKey,
      ip,
    });

    if (!passed) {
      return { status: "error", message: "captcha" };
    }
  }

  const parsed = parseContactMessage({
    name: formData.get("name"),
    email: formData.get("email"),
    subject: formData.get("subject"),
    message: formData.get("message"),
  });

  if (!parsed.success) {
    return { status: "error", message: "validation" };
  }

  const { name, email, subject, message } = parsed.data;

  if (countLinks(name) + countLinks(subject) > 0) {
    return { status: "error", message: "validation" };
  }
  if (countLinks(message) > MAX_LINKS_IN_MESSAGE) {
    return { status: "error", message: "tooManyLinks" };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("contact_messages").insert({
    name,
    email,
    subject,
    message,
    ip_hash: hashIp(ip),
  });

  if (error) {
    if (error.message.includes("contact_rate_limited")) {
      return { status: "error", message: "rateLimited" };
    }
    return { status: "error", message: "server" };
  }

  return { status: "success" };
}
