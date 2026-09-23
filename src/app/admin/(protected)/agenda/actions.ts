"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { routing } from "@/i18n/routing";
import { optionalText } from "@/lib/admin-form";
import { withToast } from "@/lib/admin-toast";
import { eventFormSchema } from "@/lib/event-form";
import { toEventInsert } from "@/lib/events";
import { validateImageFile } from "@/lib/media-limits";
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
    titleFr: formData.get("titleFr") ?? "",
    venue: formData.get("venue"),
    city: formData.get("city"),
    country: formData.get("country"),
    timeZone: formData.get("timeZone"),
    startsAtLocal: formData.get("startsAtLocal"),
    endsAtLocal: formData.get("endsAtLocal") ?? "",
    ticketUrl: formData.get("ticketUrl") ?? "",
    imagePath: formData.get("imagePath") ?? "",
  };
}

async function resolveEventImagePath(
  formData: FormData,
  supabase: Awaited<ReturnType<typeof createClient>>,
) {
  const file = formData.get("imageFile");
  if (file instanceof File && file.size > 0) {
    const validation = validateImageFile(file);
    if (!validation.ok) {
      return { ok: false as const, error: validation.error };
    }

    const extension = file.name.split(".").pop() || "jpg";
    const path = `events/${crypto.randomUUID()}.${extension}`;
    const { error } = await supabase.storage.from("media").upload(path, file, {
      contentType: file.type || "image/jpeg",
      upsert: false,
    });

    if (error) {
      return { ok: false as const, error: "Não foi possível enviar a imagem." };
    }

    return { ok: true as const, path };
  }

  return { ok: true as const, path: optionalText(formData, "imagePath") };
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
  const image = await resolveEventImagePath(formData, supabase);
  if (!image.ok) {
    return { error: image.error };
  }

  const { error } = await supabase.from("events").insert(
    toEventInsert({
      ...parsed.data,
      imagePath: image.path,
    }),
  );

  if (error) {
    return { error: "Não foi possível criar o evento." };
  }

  revalidatePath("/admin/agenda");
  redirect(withToast("/admin/agenda", "saved"));
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
  const image = await resolveEventImagePath(formData, supabase);
  if (!image.ok) {
    return { error: image.error };
  }

  const { error } = await supabase
    .from("events")
    .update(
      toEventInsert({
        ...parsed.data,
        imagePath: image.path,
      }),
    )
    .eq("id", id);

  if (error) {
    return { error: "Não foi possível atualizar o evento." };
  }

  revalidatePath("/admin/agenda");
  revalidatePath(`/admin/agenda/${id}`);
  redirect(withToast("/admin/agenda", "saved"));
}

export async function toggleEventFeatured(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const isFeatured = String(formData.get("isFeatured") ?? "") === "true";

  if (!id) {
    return;
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("events")
    .update({ is_featured: !isFeatured })
    .eq("id", id);

  // This runs from a plain form button, with no state to return to, so the
  // failure travels as a toast instead of an exception the admin would meet
  // as Next's error screen.
  if (error) {
    redirect(withToast("/admin/agenda", "featured-error"));
  }

  revalidatePath("/admin/agenda");
  for (const locale of routing.locales) {
    revalidatePath(`/${locale}`);
  }
}

export async function deleteEvent(formData: FormData) {
  const id = String(formData.get("id") ?? "");

  if (!id) {
    return;
  }

  const supabase = await createClient();
  const { error } = await supabase.from("events").delete().eq("id", id);

  if (error) {
    redirect(withToast("/admin/agenda", "delete-error"));
  }

  revalidatePath("/admin/agenda");
  redirect(withToast("/admin/agenda", "deleted"));
}
