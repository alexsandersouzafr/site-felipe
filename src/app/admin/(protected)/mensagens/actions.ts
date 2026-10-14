"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireAdmin } from "@/lib/admin-session";
import { withToast } from "@/lib/admin-toast";
import { createClient } from "@/lib/supabase/server";

const INBOX = "/admin/mensagens";
const SPAM_FOLDER = "/admin/mensagens?pasta=spam";

function revalidateMessages() {
  revalidatePath("/admin/mensagens");
  // The dashboard counts unread messages.
  revalidatePath("/admin");
}

/** Moves a message between the inbox and the spam folder. */
export async function setMessageSpam(formData: FormData) {
  await requireAdmin();

  const id = String(formData.get("id") ?? "");
  const spam = formData.get("spam") === "true";

  if (!id) {
    return;
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("contact_messages")
    // A person's call has no rule behind it, so the reason is cleared.
    .update({ is_spam: spam, spam_reason: null })
    .eq("id", id);

  if (error) {
    redirect(withToast(`/admin/mensagens/${id}`, "save-error"));
  }

  revalidateMessages();
  redirect(
    spam
      ? withToast(INBOX, "message-to-spam")
      : withToast(SPAM_FOLDER, "message-to-inbox"),
  );
}

export async function deleteMessage(formData: FormData) {
  await requireAdmin();

  const id = String(formData.get("id") ?? "");

  if (!id) {
    return;
  }

  const supabase = await createClient();
  // Read first, to return to the folder the message was in.
  const { data } = await supabase
    .from("contact_messages")
    .select("is_spam")
    .eq("id", id)
    .maybeSingle();
  const folder = data?.is_spam ? SPAM_FOLDER : INBOX;

  const { error } = await supabase
    .from("contact_messages")
    .delete()
    .eq("id", id);

  if (error) {
    redirect(withToast(folder, "delete-error"));
  }

  revalidateMessages();
  redirect(withToast(folder, "message-deleted"));
}
