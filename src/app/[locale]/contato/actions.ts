"use server";

import { parseContactMessage } from "@/lib/public/contact";
import { createClient } from "@/lib/supabase/server";

export type ContactFormState =
  | { status: "idle" }
  | { status: "success" }
  | { status: "error"; message: "validation" | "server" };

export async function submitContactMessage(
  _prev: ContactFormState,
  formData: FormData,
): Promise<ContactFormState> {
  const parsed = parseContactMessage({
    name: formData.get("name"),
    email: formData.get("email"),
    subject: formData.get("subject"),
    message: formData.get("message"),
  });

  if (!parsed.success) {
    return { status: "error", message: "validation" };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("contact_messages").insert({
    name: parsed.data.name,
    email: parsed.data.email,
    subject: parsed.data.subject,
    message: parsed.data.message,
  });

  if (error) {
    return { status: "error", message: "server" };
  }

  return { status: "success" };
}
