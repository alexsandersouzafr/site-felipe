"use server";

import { createHash } from "node:crypto";
import { headers } from "next/headers";

import { parseContactMessage } from "@/lib/public/contact";
import { createClient } from "@/lib/supabase/server";

export type ContactFormState =
  | { status: "idle" }
  | { status: "success" }
  | { status: "error"; message: "validation" | "rateLimited" | "server" };

/** Non-secret by design: this only needs to be unguessable enough to stop
 * casual IP-hash lookups, not to resist a motivated attacker. */
const IP_HASH_SALT = process.env.CONTACT_IP_HASH_SALT || "site-felipe-contact";

async function hashClientIp() {
  const headerList = await headers();
  const forwardedFor = headerList.get("x-forwarded-for");
  const ip = forwardedFor?.split(",")[0]?.trim() || headerList.get("x-real-ip");

  if (!ip) {
    return null;
  }

  return createHash("sha256").update(`${IP_HASH_SALT}:${ip}`).digest("hex");
}

export async function submitContactMessage(
  _prev: ContactFormState,
  formData: FormData,
): Promise<ContactFormState> {
  // Honeypot: a hidden field no human fills in. If it's non-empty, silently
  // report success instead of telling the bot it was blocked.
  const honeypot = String(formData.get("website") ?? "").trim();
  if (honeypot) {
    return { status: "success" };
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

  const ipHash = await hashClientIp();
  const supabase = await createClient();
  const { error } = await supabase.from("contact_messages").insert({
    name: parsed.data.name,
    email: parsed.data.email,
    subject: parsed.data.subject,
    message: parsed.data.message,
    ip_hash: ipHash,
  });

  if (error) {
    if (error.message.includes("contact_rate_limited")) {
      return { status: "error", message: "rateLimited" };
    }
    return { status: "error", message: "server" };
  }

  return { status: "success" };
}
