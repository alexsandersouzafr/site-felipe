"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { eventFormSchema } from "@/lib/event-form";
import { toEventInsert } from "@/lib/events";
import { intentFromFormData, statusFromIntent } from "@/lib/publishing-intent";
import { createClient } from "@/lib/supabase/server";

export type EventActionState = {
  error?: string;
  success?: string;
};

function formDataToObject(formData: FormData) {
  return {
    status: statusFromIntent(intentFromFormData(formData)),
    publishAt: formData.get("publishAt") ?? "",
    titlePt: formData.get("titlePt"),
    titleEn: formData.get("titleEn") ?? "",
    titleEs: formData.get("titleEs") ?? "",
    venue: formData.get("venue"),
    city: formData.get("city"),
    country: formData.get("country"),
    timeZone: formData.get("timeZone"),
    startsAtLocal: formData.get("startsAtLocal"),
    endsAtLocal: formData.get("endsAtLocal") ?? "",
    ticketUrl: formData.get("ticketUrl") ?? "",
  };
}

export async function createEvent(
  _prev: EventActionState,
  formData: FormData,
): Promise<EventActionState> {
  const parsed = eventFormSchema.safeParse(formDataToObject(formData));

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("events")
    .insert(toEventInsert(parsed.data));

  if (error) {
    return { error: "Não foi possível criar o evento." };
  }

  revalidatePath("/admin/agenda");
  redirect("/admin/agenda");
}

export async function updateEvent(
  id: string,
  _prev: EventActionState,
  formData: FormData,
): Promise<EventActionState> {
  const parsed = eventFormSchema.safeParse(formDataToObject(formData));

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("events")
    .update(toEventInsert(parsed.data))
    .eq("id", id);

  if (error) {
    return { error: "Não foi possível atualizar o evento." };
  }

  revalidatePath("/admin/agenda");
  revalidatePath(`/admin/agenda/${id}`);
  redirect("/admin/agenda");
}

export async function deleteEvent(formData: FormData) {
  const id = String(formData.get("id") ?? "");

  if (!id) {
    return;
  }

  const supabase = await createClient();
  const { error } = await supabase.from("events").delete().eq("id", id);

  if (error) {
    throw new Error("Não foi possível excluir o evento.");
  }

  revalidatePath("/admin/agenda");
  redirect("/admin/agenda");
}
